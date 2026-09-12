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
const { requireAdminAuth, generateAdminToken } = require('../middleware/auth');

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

    // Find school to compare passcode
    let school = null;
    if (schoolId) {
      school = await School.findOne({ id: schoolId });
    }

    // Check against school passcode or universal fallback ('1952', 'admin')
    const expectedPasscode = school?.adminPasscode || '1952';
    const isMatch = passcode === expectedPasscode || passcode === '1952' || passcode === 'admin';

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

router.post('/schools', requireAdminAuth, async (req, res) => {
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

router.put('/schools/:id', requireAdminAuth, async (req, res) => {
  try {
    const school = await School.findOneAndUpdate(
      { id: req.params.id },
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
router.get('/students', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    await executeSafeQuery(Student, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students', requireAdminAuth, async (req, res) => {
  try {
    const studentData = req.body;
    if (!studentData.id) {
      studentData.id = `ssm-${Date.now().toString().slice(-4)}`;
    }
    if (!studentData.schoolId) {
      studentData.schoolId = 'ssm-gorakhpur';
    }
    const student = new Student(studentData);
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/students/bulk', requireAdminAuth, async (req, res) => {
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

router.put('/students/:id', requireAdminAuth, async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/students/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Student not found' });
    res.json({ success: true, message: 'Student deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ATTENDANCE =================
router.get('/attendance', async (req, res) => {
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

router.post('/attendance', requireAdminAuth, async (req, res) => {
  try {
    const { studentId, date, status, schoolId } = req.body;
    const id = `att-${date}-${studentId}`;
    const record = await Attendance.findOneAndUpdate(
      { studentId, date },
      { id, studentId, date, status, schoolId: schoolId || 'ssm-gorakhpur' },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/attendance/bulk', requireAdminAuth, async (req, res) => {
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
            schoolId: u.schoolId || schoolId || 'ssm-gorakhpur'
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(operations);
    const filter = { date: updates[0]?.date };
    if (schoolId) filter.schoolId = schoolId;
    const records = await Attendance.find(filter);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= FEES =================
router.get('/fees', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.status) filter.status = req.query.status;
    await executeSafeQuery(Fee, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/fees', requireAdminAuth, async (req, res) => {
  try {
    const feeData = req.body;
    if (!feeData.id) {
      feeData.id = `fee-${Date.now().toString().slice(-4)}`;
    }
    if (!feeData.schoolId) {
      feeData.schoolId = 'ssm-gorakhpur';
    }
    const fee = new Fee(feeData);
    await fee.save();
    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/fees/:id/pay', requireAdminAuth, async (req, res) => {
  try {
    const { paymentMode } = req.body;
    const fee = await Fee.findOne({ id: req.params.id });
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
router.get('/reports', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    const reports = await ReportCard.find(filter);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reports', requireAdminAuth, async (req, res) => {
  try {
    const reportData = req.body;
    if (!reportData.id) {
      reportData.id = `rep-${Date.now().toString().slice(-4)}`;
    }
    if (!reportData.schoolId) {
      reportData.schoolId = 'ssm-gorakhpur';
    }
    const report = await ReportCard.findOneAndUpdate(
      { studentId: reportData.studentId, examTerm: reportData.examTerm },
      reportData,
      { upsert: true, new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= NOTICES =================
router.get('/notices', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.category) filter.category = req.query.category;
    await executeSafeQuery(Notice, filter, req, res, { date: -1, createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notices', requireAdminAuth, async (req, res) => {
  try {
    const noticeData = req.body;
    if (!noticeData.id) {
      noticeData.id = `not-${Date.now().toString().slice(-4)}`;
    }
    if (!noticeData.schoolId) {
      noticeData.schoolId = 'ssm-gorakhpur';
    }
    const notice = new Notice(noticeData);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/notices/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Notice.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Notice not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ADMISSIONS =================
router.get('/admissions', async (req, res) => {
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
    const regNo = `SSM-ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const id = `adm-${Date.now().toString().slice(-4)}`;
    const admission = new Admission({
      ...data,
      id,
      regNo,
      schoolId: data.schoolId || 'ssm-gorakhpur'
    });
    await admission.save();
    res.status(201).json(admission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admissions/:id/approve', requireAdminAuth, async (req, res) => {
  try {
    const admission = await Admission.findOne({ id: req.params.id });
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

router.delete('/admissions/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Admission.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Admission inquiry not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= HOMEWORK =================
router.get('/homework', async (req, res) => {
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

router.post('/homework', requireAdminAuth, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `hw-${Date.now().toString().slice(-4)}`;
    }
    if (!data.schoolId) {
      data.schoolId = 'ssm-gorakhpur';
    }
    const homework = new Homework(data);
    await homework.save();
    res.status(201).json(homework);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/homework/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Homework.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Homework not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= STAFF & ACHARYA =================
router.get('/staff', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.gender) filter.gender = req.query.gender;
    await executeSafeQuery(Staff, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff', requireAdminAuth, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `stf-${Date.now().toString().slice(-4)}`;
    }
    if (!data.schoolId) {
      data.schoolId = 'ssm-gorakhpur';
    }
    const member = new Staff(data);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/staff/:id', requireAdminAuth, async (req, res) => {
  try {
    const member = await Staff.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!member) return res.status(404).json({ error: 'Staff member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/staff/:id', requireAdminAuth, async (req, res) => {
  try {
    const deleted = await Staff.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
