const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const School = require('../models/School');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const ReportCard = require('../models/ReportCard');
const Notice = require('../models/Notice');
const Admission = require('../models/Admission');
const Homework = require('../models/Homework');
const Staff = require('../models/Staff');
const { requireAdminAuth, requirePortalAuth, requireSchoolScope, generateAdminToken, isValidAdminPasscode, isValidDeveloperPasscode } = require('../middleware/auth');

// Healthcheck & Database status
router.get('/status', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: 'ok',
    database: states[state] || 'unknown',
    databaseHost: mongoose.connection.host || 'none',
    timestamp: new Date().toISOString()
  });
});

/**
 * Multi-tenant safe query executor:
 * 1. Backwards compatible: returns raw array by default, but bounded by safe limit (default 250, max 500)
 * 2. Opt-in pagination: returns { data, pagination: { page, limit, total, totalPages } } when ?paginated=true or ?page is passed
 * 3. Uses .lean() to eliminate Mongoose document hydration overhead
 * 4. Injects standard X-Total-Count, X-Page, X-Per-Page, X-Total-Pages headers
 */
async function executeSafeQuery(Model, filter, req, res, sort = { createdAt: -1 }) {
  const isPaginated = req.query.paginated === 'true' || req.query.page !== undefined;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || (isPaginated ? 50 : 250)), 500);
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Model.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  res.setHeader('X-Total-Count', total.toString());
  res.setHeader('X-Page', page.toString());
  res.setHeader('X-Per-Page', limit.toString());
  res.setHeader('X-Total-Pages', totalPages.toString());

  if (isPaginated) {
    return res.json({
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  }

  return res.json(records);
}

// ================= AUTHENTICATION =================
router.post('/auth/login', async (req, res) => {
  try {
    const { schoolId, passcode } = req.body;
    if (!passcode) {
      return res.status(400).json({ error: 'पासकोड दर्ज करना अनिवार्य है। (Passcode is required)' });
    }

    if (schoolId === '__developer__') {
      if (!isValidDeveloperPasscode(passcode)) {
        return res.status(401).json({
          error: 'अमान्य डेवलपर सुरक्षा पासकोड! (Invalid developer admin passcode)',
          code: 'INVALID_DEVELOPER_CREDENTIALS'
        });
      }

      const token = generateAdminToken({
        schoolId: '*',
        role: 'developer',
        schoolName: 'SSM Developer Administration'
      });

      return res.json({
        success: true,
        message: 'डेवलपर प्रशासन सफलतापूर्वक प्रमाणित हुआ।',
        token,
        role: 'developer'
      });
    }

    // Find school to compare passcode
    let school = null;
    if (schoolId) {
      school = await School.findOne({ id: schoolId });
    }

    // Only allow the configured school passcode; no universal fallback avoids weak admin access.
    const isMatch = isValidAdminPasscode(school?.adminPasscode, passcode);

    if (!isMatch) {
      return res.status(401).json({
        error: 'अमान्य सुरक्षा पासकोड! कृपया सही कोड दर्ज करें। (Invalid admin passcode)',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = generateAdminToken({
      schoolId: school?.id || schoolId || 'ssm-gorakhpur',
      role: 'admin',
      schoolName: school?.name || 'Saraswati Shishu Mandir'
    });

    res.json({
      success: true,
      message: 'सफलतापूर्वक प्रमाणित हुआ! (Authentication successful)',
      token,
      school: school ? {
        id: school.id,
        name: school.name,
        hindiName: school.hindiName,
        city: school.city,
        prant: school.prant
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: 'प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

router.post('/auth/student-login', async (req, res) => {
  try {
    const { schoolId, rollNo, contact } = req.body;
    if (!schoolId || !rollNo || !contact) {
      return res.status(400).json({ error: 'शाखा, अनुक्रमांक और मोबाइल नंबर आवश्यक हैं।' });
    }
    if (String(schoolId).length > 100 || String(rollNo).length > 30 || String(contact).length > 30) {
      return res.status(400).json({ error: 'छात्र लॉगिन विवरण अमान्य हैं।' });
    }

    const student = await Student.findOne({ schoolId, rollNo: String(rollNo).trim(), contact: String(contact).trim() }).lean();
    if (!student) {
      return res.status(401).json({ error: 'छात्र विवरण सत्यापित नहीं हो सके। (Invalid student details)', code: 'INVALID_CREDENTIALS' });
    }

    const token = generateAdminToken({
      schoolId: student.schoolId,
      role: 'student',
      studentId: student.id,
      studentClass: student.class
    });
    res.json({ success: true, token, student });
  } catch (err) {
    res.status(500).json({ error: 'छात्र प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

// ================= SCHOOLS (BRANCHES) =================
router.get('/schools', async (req, res) => {
  try {
    // Exclude adminPasscode from public listing
    const schools = await School.find().select('-adminPasscode').sort({ established: 1, createdAt: 1 });
    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/schools/:id', async (req, res) => {
  try {
    // Exclude adminPasscode from public detail
    const school = await School.findOne({ id: req.params.id }).select('-adminPasscode');
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/schools', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      const rawSlug = (data.name || data.city || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const citySlug = rawSlug.length > 0 ? rawSlug.slice(0, 15) : 'branch';
      data.id = `ssm-${citySlug}-${Date.now().toString().slice(-4)}`;
    }
    const school = new School(data);
    await school.save();
    res.status(201).json(school);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/schools/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const school = await School.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { id: req.userSchoolId }) },
      req.body,
      { new: true }
    );
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.json(school);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= STUDENTS =================
router.get('/students', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    await executeSafeQuery(Student, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const studentData = req.body;
    if (!studentData.id) {
      studentData.id = `ssm-${Date.now().toString().slice(-4)}`;
    }
    if (!studentData.schoolId) {
      studentData.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const student = new Student(studentData);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/students/bulk', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { students: rawStudents, schoolId } = req.body;
    if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
      return res.status(400).json({ error: 'छात्र सूची (Students array) आवश्यक है।' });
    }
    const targetSchoolId = schoolId || req.userSchoolId || 'ssm-gorakhpur';
    const timestamp = Date.now().toString().slice(-4);

    const docs = rawStudents.map((s, idx) => ({
      ...s,
      id: s.id || `ssm-${timestamp}-${idx + 1}`,
      schoolId: targetSchoolId,
      rollNo: s.rollNo ? s.rollNo.toString() : (101 + idx).toString(),
      name: s.name || `छात्र ${idx + 1}`,
      gender: s.gender === 'Bahin' ? 'Bahin' : 'Bhaiya',
      class: s.class || 'Class 6',
      section: s.section || 'A',
      fatherName: s.fatherName || 'श्री अभिभावक',
      motherName: s.motherName || 'श्रीमती माता जी',
      contact: s.contact || '+91 98765 43210',
      address: s.address || 'स्थानिक पता',
      dob: s.dob || '2014-01-01',
      admissionDate: s.admissionDate || new Date().toISOString().split('T')[0],
      bloodGroup: s.bloodGroup || 'B+'
    }));

    const inserted = await Student.insertMany(docs, { ordered: false });
    res.status(201).json({ count: inserted.length, students: inserted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/students/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      req.body,
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/students/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, message: 'Student deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ATTENDANCE =================
router.get('/attendance', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    await executeSafeQuery(Attendance, filter, req, res, { date: -1, createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { studentId, date, status, schoolId } = req.body;
    const id = `att-${date}-${studentId}`;
    const record = await Attendance.findOneAndUpdate(
      { studentId, date, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { id, studentId, date, status, schoolId: schoolId || req.userSchoolId || 'ssm-gorakhpur' },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/attendance/bulk', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { updates, schoolId } = req.body; // array of { studentId, date, status }
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates array is required' });
    }

    const operations = updates.map(u => ({
      updateOne: {
        filter: { studentId: u.studentId, date: u.date },
        update: {
          $set: {
            id: `att-${u.date}-${u.studentId}`,
            studentId: u.studentId,
            date: u.date,
            status: u.status,
            schoolId: u.schoolId || schoolId || req.userSchoolId || 'ssm-gorakhpur'
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);
    const filter = { date: updates[0]?.date };
    if (schoolId) filter.schoolId = schoolId;
    if (req.user.role !== 'developer' && !filter.schoolId) filter.schoolId = req.userSchoolId;
    const records = await Attendance.find(filter);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= FEES =================
router.get('/fees', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.status) filter.status = req.query.status;
    await executeSafeQuery(Fee, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/fees', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const feeData = req.body;
    if (!feeData.id) {
      feeData.id = `fee-${Date.now().toString().slice(-4)}`;
    }
    if (!feeData.schoolId) {
      feeData.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const fee = new Fee(feeData);
    await fee.save();
    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/fees/:id/pay', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { paymentMode } = req.body;
    const fee = await Fee.findOne({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!fee) return res.status(404).json({ error: 'Fee record not found' });

    fee.paidAmount = fee.totalAmount;
    fee.status = 'Paid';
    fee.paidDate = new Date().toISOString().split('T')[0];
    fee.receiptNo = `SSM-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    fee.paymentMode = paymentMode || 'Online UPI';

    await fee.save();
    res.json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= REPORT CARDS =================
router.get('/reports', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    const reports = await ReportCard.find(filter);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reports', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const reportData = req.body;
    if (!reportData.id) {
      reportData.id = `rep-${Date.now().toString().slice(-4)}`;
    }
    if (!reportData.schoolId) {
      reportData.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const report = await ReportCard.findOneAndUpdate(
      { studentId: reportData.studentId, examTerm: reportData.examTerm, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      reportData,
      { upsert: true, new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= NOTICES =================
router.get('/notices', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.category) filter.category = req.query.category;
    await executeSafeQuery(Notice, filter, req, res, { date: -1, createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notices', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const noticeData = req.body;
    if (!noticeData.id) {
      noticeData.id = `not-${Date.now().toString().slice(-4)}`;
    }
    if (!noticeData.schoolId) {
      noticeData.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const notice = new Notice(noticeData);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/notices/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Notice.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Notice not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ADMISSIONS =================
router.get('/admissions', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.status) filter.status = req.query.status;
    await executeSafeQuery(Admission, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admissions', async (req, res) => {
  try {
    const data = req.body;
    const requiredTextFields = ['schoolId', 'studentName', 'gender', 'applyingClass', 'phone'];
    if (requiredTextFields.some(field => typeof data[field] !== 'string' || !data[field].trim())) {
      return res.status(400).json({ error: 'प्रवेश आवेदन के आवश्यक विवरण भरना अनिवार्य है।' });
    }
    if (Object.entries(data).some(([key, value]) => typeof value === 'string' && value.length > (key === 'address' ? 500 : 120))) {
      return res.status(400).json({ error: 'प्रवेश आवेदन में कोई विवरण बहुत लंबा है।' });
    }
    if (!/^\+?[0-9\s()-]{7,20}$/.test(data.phone)) {
      return res.status(400).json({ error: 'कृपया वैध मोबाइल नंबर दर्ज करें।' });
    }
    if (data.guardianConsent !== true) {
      return res.status(400).json({ error: 'अभिभावक/अधिकृत संरक्षक की सहमति आवश्यक है।' });
    }
    const regNo = `SSM-ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `adm-${Date.now().toString().slice(-4)}`;
    const admission = new Admission({
      ...data,
      id,
      regNo,
      consentTimestamp: new Date(),
      consentPolicyVersion: '2026-09-12',
      schoolId: data.schoolId || 'ssm-gorakhpur'
    });
    await admission.save();
    res.status(201).json(admission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admissions/:id/approve', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const admission = await Admission.findOne({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!admission) return res.status(404).json({ error: 'Admission not found' });

    admission.status = 'Admitted';
    await admission.save();

    // Auto-create student in MongoDB
    const targetSchoolId = admission.schoolId || 'ssm-gorakhpur';
    const studentCount = await Student.countDocuments({ schoolId: targetSchoolId });
    const nextRoll = (studentCount + 101).toString();
    const studentId = `ssm-${Date.now().toString().slice(-4)}`;

    const newStudent = new Student({
      id: studentId,
      schoolId: targetSchoolId,
      rollNo: nextRoll,
      name: admission.studentName.startsWith('भैया ') || admission.studentName.startsWith('बहिन ') || admission.studentName.startsWith('Bhaiya ') || admission.studentName.startsWith('Bahin ')
        ? admission.studentName
        : `${admission.gender === 'Bhaiya' ? 'Bhaiya' : 'Bahin'} ${admission.studentName}`,
      gender: admission.gender,
      class: admission.applyingClass,
      section: 'A',
      fatherName: admission.fatherName || 'अभिभावक',
      motherName: admission.motherName || '',
      contact: admission.phone,
      address: admission.address || '',
      admissionDate: new Date().toISOString().split('T')[0],
      bloodGroup: 'B+'
    });

    await newStudent.save();

    res.json({
      success: true,
      admission,
      student: newStudent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admissions/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Admission.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Admission inquiry not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= HOMEWORK =================
router.get('/homework', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = {};
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;
    if (req.query.class) filter.class = req.query.class;
    if (req.query.date) filter.date = req.query.date;
    await executeSafeQuery(Homework, filter, req, res, { date: -1, createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/homework', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `hw-${Date.now().toString().slice(-4)}`;
    }
    if (!data.schoolId) {
      data.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const homework = new Homework(data);
    await homework.save();
    res.status(201).json(homework);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/homework/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Homework.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Homework not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= STAFF & ACHARYA =================
router.get('/staff', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.gender) filter.gender = req.query.gender;
    await executeSafeQuery(Staff, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `stf-${Date.now().toString().slice(-4)}`;
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

router.put('/staff/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const member = await Staff.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      req.body,
      { new: true }
    );
    if (!member) return res.status(404).json({ error: 'Staff member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/staff/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Staff.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
