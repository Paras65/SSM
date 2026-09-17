const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { requireAdminAuth, requireTeacherAuth, requireSchoolScope } = require('../middleware/auth');
const { cleanStringParam } = require('../middleware/sanitize');
const { generateUniqueId, recordAuditLog, executeSafeQuery } = require('../utils/routeHelpers');

// GET /api/staff/public - Public directory of active teachers/staff
router.get('/public', async (req, res) => {
  try {
    const schoolId = req.query.schoolId ? cleanStringParam(req.query.schoolId) : null;
    if (!schoolId) {
      return res.status(400).json({ error: 'विद्यालय पहचान (schoolId) आवश्यक है।' });
    }
    const filter = { schoolId, status: 'Active' };
    const staff = await Staff.find(filter)
      .select('id schoolId name gender designation qualification subjects joiningDate status')
      .sort({ createdAt: 1 })
      .lean();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/staff/me - Authenticated teacher self-service
router.get('/me', requireTeacherAuth, async (req, res) => {
  try {
    const teacherId = req.user.staffId;
    const schoolId = req.user.schoolId;
    if (!teacherId) {
      return res.status(400).json({ error: 'आचार्य सत्र पहचान उपलब्ध नहीं है।' });
    }
    const teacher = await Staff.findOne({ id: teacherId, ...(req.user.role === 'developer' ? {} : { schoolId }) })
      .select('-pin')
      .lean();
    if (!teacher) {
      return res.status(404).json({ error: 'आचार्य रिकॉर्ड नहीं मिला।' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/staff - List staff members
router.get('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.gender) filter.gender = req.query.gender;
    await executeSafeQuery(Staff, filter, req, res, { createdAt: -1 }, '-pin');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/staff - Add new staff member
router.post('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = generateUniqueId('stf');
    }
    if (!data.schoolId) {
      data.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const member = new Staff(data);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/staff/:id - Update staff member
router.put('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updateData.schoolId;
    }

    const member = await Staff.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    if (!member) return res.status(404).json({ error: 'Staff member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/staff/:id - Delete staff member
router.delete('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Staff.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Staff member not found' });
    await recordAuditLog({
      schoolId: deleted.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'STAFF_REMOVED',
      description: `कर्मचारी/आचार्य #${deleted.id} (${deleted.name}, पद: ${deleted.designation || 'आचार्य'}) को हटाया गया।`,
      req
    });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

