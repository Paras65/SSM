const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Leave = require('../models/Leave');
const TransportRoute = require('../models/Transport');
const Book = require('../models/Book');
const BookIssue = require('../models/BookIssue');
const InventoryItem = require('../models/InventoryItem');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const { requireAdminAuth, requireTeacherAuth, requirePortalAuth, requireSchoolScope } = require('../middleware/auth');
const { cleanStringParam, escapeRegex } = require('../middleware/sanitize');
const { recordAuditLog, executeSafeQuery } = require('../utils/routeHelpers');

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-ssm-jwt-secret';

// ================= TIMETABLE =================
router.get('/timetable', async (req, res) => {
  try {
    const schoolId = cleanStringParam(req.query.schoolId);
    if (!schoolId) {
      return res.status(400).json({ error: 'विद्यालय पहचान (schoolId) आवश्यक है।' });
    }
    const filter = { schoolId };
    const cls = cleanStringParam(req.query.class);
    const sec = cleanStringParam(req.query.section);
    if (cls) filter.class = cls;
    if (sec) filter.section = sec;
    const timetables = await Timetable.find(filter).lean();
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/timetable', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { schoolId, class: className, section = 'A', schedule } = req.body;
    const targetSchoolId = req.user.role === 'developer' && schoolId ? schoolId : req.userSchoolId;
    let entry = await Timetable.findOne({ schoolId: targetSchoolId, class: className, section });
    if (entry) {
      entry.schedule = schedule;
      await entry.save();
    } else {
      entry = new Timetable({
        id: `tt-${Date.now()}`,
        schoolId: targetSchoolId,
        class: className,
        section,
        schedule
      });
      await entry.save();
    }
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= LEAVES =================
router.get('/leaves', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.applicantType) filter.applicantType = req.query.applicantType;
    if (req.query.applicantId) filter.applicantId = req.query.applicantId;
    if (req.query.status) filter.status = req.query.status;
    await executeSafeQuery(Leave, filter, req, res, { appliedDate: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/leaves', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `lv-${Date.now()}`;
    data.schoolId = req.user.role === 'developer' && data.schoolId ? data.schoolId : req.userSchoolId;
    const leave = new Leave(data);
    await leave.save();
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/leaves/:id/status', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const { status, reviewerRemarks, reviewedBy } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'अमान्य अवकाश स्थिति (Invalid leave status)' });
    }
    const leave = await Leave.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { status, reviewerRemarks: reviewerRemarks || '', reviewedBy: reviewedBy || 'प्रधानाचार्य' },
      { returnDocument: 'after', runValidators: true }
    );
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });

    // Synchronize staff status when a staff leave is approved or rejected
    if (leave.applicantType === 'Staff' && leave.applicantId) {
      if (status === 'Approved') {
        await Staff.findOneAndUpdate(
          { id: leave.applicantId, schoolId: leave.schoolId },
          { status: 'OnLeave' }
        );
      } else if (status === 'Rejected') {
        await Staff.findOneAndUpdate(
          { id: leave.applicantId, schoolId: leave.schoolId, status: 'OnLeave' },
          { status: 'Active' }
        );
      }
    }

    res.json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= TRANSPORT =================
router.get('/transport/routes', async (req, res) => {
  try {
    const schoolId = cleanStringParam(req.query.schoolId);
    if (!schoolId) {
      return res.status(400).json({ error: 'विद्यालय पहचान (schoolId) आवश्यक है।' });
    }
    const filter = { schoolId };

    // Privilege check: Authenticated users can view driverPhone; unauthenticated callers have driverPhone stripped
    let isPrivileged = false;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (['admin', 'developer', 'teacher', 'student'].includes(decoded?.role)) {
          isPrivileged = true;
        }
      } catch {
        isPrivileged = false;
      }
    }

    const projection = isPrivileged ? null : '-driverPhone';
    await executeSafeQuery(TransportRoute, filter, req, res, { routeName: 1 }, projection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transport/routes', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `tr-${Date.now()}`;
    data.schoolId = req.user.role === 'developer' && data.schoolId ? data.schoolId : req.userSchoolId;
    const route = new TransportRoute(data);
    await route.save();
    res.status(201).json(route);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/transport/routes/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updateData.schoolId;
    }

    const updated = await TransportRoute.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Route not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/transport/routes/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await TransportRoute.findOneAndDelete({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!deleted) return res.status(404).json({ error: 'Route not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= LIBRARY (PUSTAKALAYA) =================
router.get('/library/books', async (req, res) => {
  try {
    const schoolId = cleanStringParam(req.query.schoolId);
    if (!schoolId) {
      return res.status(400).json({ error: 'विद्यालय पहचान (schoolId) आवश्यक है।' });
    }
    const category = cleanStringParam(req.query.category);
    const rawSearch = cleanStringParam(req.query.search);

    const filter = { schoolId };
    if (category) filter.category = category;
    if (rawSearch) {
      const safeSearch = escapeRegex(rawSearch);
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { author: { $regex: safeSearch, $options: 'i' } },
        { accessionNo: { $regex: safeSearch, $options: 'i' } }
      ];
    }
    await executeSafeQuery(Book, filter, req, res, { title: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/library/books', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `bk-${Date.now()}`;
    data.schoolId = req.user.role === 'developer' && data.schoolId ? data.schoolId : req.userSchoolId;
    if (!data.availableCopies && data.totalCopies) data.availableCopies = data.totalCopies;
    const book = new Book(data);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/library/books/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updateData.schoolId;
    }

    const updated = await Book.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Book not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/library/books/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Book.findOneAndDelete({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!deleted) return res.status(404).json({ error: 'Book not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/library/issues', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.status) filter.status = req.query.status;
    await executeSafeQuery(BookIssue, filter, req, res, { issueDate: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/library/issue', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `iss-${Date.now()}`;
    data.schoolId = req.user.role === 'developer' && data.schoolId ? data.schoolId : req.userSchoolId;
    const issue = new BookIssue(data);
    await issue.save();
    await Book.findOneAndUpdate(
      { id: data.bookId, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { $inc: { availableCopies: -1 } }
    );
    res.status(201).json(issue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/library/return', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { issueId, fineAmount = 0 } = req.body;
    if (!issueId) {
      return res.status(400).json({ error: 'issueId अनिवार्य है।' });
    }
    const issue = await BookIssue.findOneAndUpdate(
      { id: issueId, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { 
        status: 'Returned', 
        returnDate: new Date().toISOString().split('T')[0],
        fineAmount: Number(fineAmount) || 0 
      },
      { returnDocument: 'after', runValidators: true }
    );
    if (!issue) return res.status(404).json({ error: 'Issue record not found' });
    await Book.findOneAndUpdate(
      { id: issue.bookId, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { $inc: { availableCopies: 1 } }
    );
    res.json(issue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= INVENTORY & STORE =================
router.get('/inventory', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.category) filter.category = req.query.category;
    await executeSafeQuery(InventoryItem, filter, req, res, { itemName: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inventory', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `inv-${Date.now()}`;
    data.schoolId = req.user.role === 'developer' && data.schoolId ? data.schoolId : req.userSchoolId;
    const item = new InventoryItem(data);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/inventory/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updateData.schoolId;
    }

    const updated = await InventoryItem.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/inventory/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await InventoryItem.findOneAndDelete({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inventory/:id/stock', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { delta } = req.body;
    const item = await InventoryItem.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { $inc: { stockQuantity: Number(delta) || 0 } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await recordAuditLog({
      schoolId: item.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'STOCK_ADJUSTED',
      description: `सामग्री #${item.id} (${item.itemName}) स्टॉक समायोजन: ${Number(delta) >= 0 ? '+' : ''}${delta}`,
      req
    });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= AUDIT LOGS =================
router.get('/audit-logs', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const targetSchoolId = req.user?.role === 'developer' ? req.query.schoolId : req.userSchoolId;
    const filter = targetSchoolId ? { schoolId: targetSchoolId } : {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.actorType) filter.actorType = req.query.actorType;
    if (req.query.search) {
      const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
      filter.$or = [
        { description: searchRegex },
        { actorName: searchRegex },
        { ip: searchRegex },
        { action: searchRegex }
      ];
    }
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }
    await executeSafeQuery(AuditLog, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= SECURE AI QUESTION PAPER PROXY =================
router.post('/ai/generate-question-paper', async (req, res) => {
  try {
    const effectiveKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'] || '';
    if (!effectiveKey || typeof effectiveKey !== 'string') {
      return res.status(401).json({ error: 'Gemini API Key आवश्यक है।' });
    }

    // Sanitize key (strip whitespace, newlines, preserve alphanumeric, dots, hyphens, underscores)
    const sanitizedKey = effectiveKey.trim().replace(/[^A-Za-z0-9_.-]/g, '');
    if (sanitizedKey.length < 15 || sanitizedKey.length > 200) {
      return res.status(400).json({ error: 'अमान्य API Key प्रारूप।' });
    }

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.length > 12000) {
      return res.status(400).json({ error: 'अमान्य अथवा अत्यधिक लंबा प्रॉम्प्ट।' });
    }

    const googleHeaders = {
      'Content-Type': 'application/json'
    };
    if (sanitizedKey.startsWith('AIzaSy')) {
      googleHeaders['x-goog-api-key'] = sanitizedKey;
    } else {
      // For OAuth2 / Bearer tokens, send ONLY Authorization header (never send x-goog-api-key)
      googleHeaders['Authorization'] = `Bearer ${sanitizedKey}`;
    }

    let googleRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: googleHeaders,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!googleRes.ok && googleRes.status === 404) {
      // Fallback to gemini-2.0-flash
      googleRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: googleHeaders,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json'
            }
          })
        }
      );
    }

    if (!googleRes.ok) {
      const errJson = await googleRes.json().catch(() => ({}));
      return res.status(googleRes.status).json({
        error: errJson?.error?.message || `AI API returned status ${googleRes.status}`
      });
    }

    const data = await googleRes.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'AI प्रश्न पत्र उत्पन्न करने में तकनीकी त्रुटि।' });
  }
});

module.exports = router;

