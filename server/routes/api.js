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
const Exam = require('../models/Exam');
const Timetable = require('../models/Timetable');
const Leave = require('../models/Leave');
const TransportRoute = require('../models/Transport');
const Book = require('../models/Book');
const BookIssue = require('../models/BookIssue');
const InventoryItem = require('../models/InventoryItem');
const AuditLog = require('../models/AuditLog');
const { requireAdminAuth, requireStudentAuth, requireTeacherAuth, requirePortalAuth, requireSchoolScope, generateAdminToken, isValidAdminPasscode, isValidDeveloperPasscode } = require('../middleware/auth');
const { calculateCurrentAcademicYear, isValidAcademicYearFormat } = require('../utils/sessionHelper');

function generateUniqueId(prefix = 'item') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

async function recordAuditLog({ schoolId, actorType, actorId, actorName, action, description, req }) {
  try {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const log = new AuditLog({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      schoolId: schoolId || req?.user?.schoolId || 'ssm-gorakhpur',
      actorType: actorType || req?.user?.role || 'admin',
      actorId: actorId || req?.user?.studentId || req?.user?.teacherId || '',
      actorName: actorName || req?.user?.schoolName || 'प्रशासक / आचार्य',
      action,
      description,
      ip
    });
    await log.save();
  } catch (err) {
    // Non-blocking
  }
}

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
        await recordAuditLog({
          schoolId: 'ssm-developer',
          actorType: 'developer',
          actorId: 'developer',
          actorName: 'Developer Console',
          action: 'DEVELOPER_LOGIN_FAILED',
          description: 'अमान्य डेवलपर पासकोड से लॉगिन का असफल प्रयास',
          req
        });
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

      await recordAuditLog({
        schoolId: 'ssm-developer',
        actorType: 'developer',
        actorId: 'developer',
        actorName: 'Developer Console',
        action: 'DEVELOPER_LOGIN_SUCCESS',
        description: 'डेवलपर प्रशासन सफलतापूर्वक प्रमाणित हुआ।',
        req
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
      await recordAuditLog({
        schoolId: school?.id || schoolId || 'ssm-gorakhpur',
        actorType: 'admin',
        actorId: school?.id || schoolId || 'admin',
        actorName: school?.name || 'प्रशासक',
        action: 'ADMIN_LOGIN_FAILED',
        description: `अमान्य एडमिन पासकोड से लॉगिन का असफल प्रयास (शाखा: ${schoolId || 'अज्ञात'})`,
        req
      });
      return res.status(401).json({
        error: 'अमान्य सुरक्षा पासकोड! कृपया सही कोड दर्ज करें। (Invalid admin passcode)',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = generateAdminToken({
      schoolId: school?.id || schoolId || 'ssm-gorakhpur',
      role: 'admin',
      schoolName: school?.name || 'Saraswati Shishu Mandir',
      tokenVersion: school?.tokenVersion || 1
    });

    await recordAuditLog({
      schoolId: school?.id || schoolId || 'ssm-gorakhpur',
      actorType: 'admin',
      actorId: school?.id || schoolId || 'admin',
      actorName: school?.name || 'प्रशासक',
      action: 'ADMIN_LOGIN_SUCCESS',
      description: `प्रशासक सफलतापूर्वक प्रमाणित हुआ (${school?.name || schoolId})`,
      req
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
        prant: school.prant,
        currentAcademicYear: school.currentAcademicYear || '2025-26'
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: 'प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

router.post('/auth/student-login', async (req, res) => {
  try {
    const { schoolId, rollNo, contact, studentClass } = req.body;
    if (!schoolId || !rollNo || !contact) {
      return res.status(400).json({ error: 'शाखा, अनुक्रमांक और मोबाइल नंबर आवश्यक हैं।' });
    }
    if (String(schoolId).length > 100 || String(rollNo).length > 30 || String(contact).length > 30) {
      return res.status(400).json({ error: 'छात्र लॉगिन विवरण अमान्य हैं।' });
    }
    const digitsOnly = String(contact).replace(/\D/g, '').slice(-10);
    const pattern = digitsOnly ? digitsOnly.split('').join('[\\s\\-]*') : String(contact).trim();
    
    const queryFilter = {
      schoolId,
      rollNo: String(rollNo).trim(),
      contact: { $regex: pattern }
    };

    if (studentClass) {
      queryFilter.class = String(studentClass).trim();
    }

    const matchingStudents = await Student.find(queryFilter).lean();

    if (!matchingStudents || matchingStudents.length === 0) {
      await recordAuditLog({
        schoolId: schoolId || 'ssm-gorakhpur',
        actorType: 'student',
        actorId: rollNo,
        actorName: `अनुक्रमांक: ${rollNo}`,
        action: 'STUDENT_LOGIN_FAILED',
        description: `छात्र पोर्टल पर असफल लॉगिन प्रयास (अनुक्रमांक: ${rollNo}, शाखा: ${schoolId})`,
        req
      });
      return res.status(401).json({ error: 'छात्र विवरण सत्यापित नहीं हो सके। (Invalid student details)', code: 'INVALID_CREDENTIALS' });
    }

    // Sibling collision protection: if more than 1 student shares this roll number and contact, require class selection
    if (matchingStudents.length > 1 && !studentClass) {
      return res.status(422).json({
        error: 'समान अनुक्रमांक व मोबाइल पर एक से अधिक छात्र मिले। कृपया कक्षा का भी चयन करें। (Multiple students found, please specify class)',
        code: 'AMBIGUOUS_STUDENT_MATCH',
        availableClasses: matchingStudents.map(s => s.class)
      });
    }

    const student = matchingStudents[0];

    const token = generateAdminToken({
      schoolId: student.schoolId,
      role: 'student',
      studentId: student.id,
      studentClass: student.class
    });

    await recordAuditLog({
      schoolId: student.schoolId,
      actorType: 'student',
      actorId: student.id,
      actorName: student.name,
      action: 'STUDENT_LOGIN_SUCCESS',
      description: `छात्र ${student.name} (अनुक्रमांक: ${student.rollNo}, कक्षा: ${student.class}) द्वारा पोर्टल लॉगिन`,
      req
    });

    res.json({ success: true, token, student });
  } catch (err) {
    res.status(500).json({ error: 'छात्र प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

router.post('/auth/teacher-login', async (req, res) => {
  try {
    const { schoolId, phone, pin } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ error: 'मोबाइल नंबर और पिन आवश्यक हैं।' });
    }
    const digitsOnly = String(phone).replace(/\D/g, '').slice(-10);
    const pattern = digitsOnly ? digitsOnly.split('').join('[\\s\\-]*') : String(phone).trim();
    const filter = {
      phone: { $regex: pattern },
      ...(schoolId ? { schoolId } : {})
    };

    const teacher = await Staff.findOne(filter).lean();
    if (!teacher) {
      await recordAuditLog({
        schoolId: schoolId || 'ssm-gorakhpur',
        actorType: 'teacher',
        actorId: phone,
        actorName: `मोबाइल: ${phone}`,
        action: 'TEACHER_LOGIN_FAILED',
        description: `आचार्य पोर्टल पर असफल लॉगिन प्रयास (मोबाइल नहीं मिला: ${phone})`,
        req
      });
      return res.status(401).json({ error: 'आचार्य विवरण प्राप्त नहीं हुआ। कृपया सही मोबाइल दर्ज करें।', code: 'INVALID_CREDENTIALS' });
    }

    const expectedPin = teacher.pin || '1234';
    if (String(pin).trim() !== String(expectedPin).trim()) {
      await recordAuditLog({
        schoolId: teacher.schoolId,
        actorType: 'teacher',
        actorId: teacher.id,
        actorName: teacher.name,
        action: 'TEACHER_LOGIN_FAILED',
        description: `आचार्य ${teacher.name} द्वारा अमान्य पिन दर्ज किया गया`,
        req
      });
      return res.status(401).json({ error: 'अमान्य सुरक्षा पिन! (Invalid PIN)', code: 'INVALID_PIN' });
    }

    const token = generateAdminToken({
      schoolId: teacher.schoolId,
      role: 'teacher',
      staffId: teacher.id,
      name: teacher.name,
      designation: teacher.designation
    });

    await recordAuditLog({
      schoolId: teacher.schoolId,
      actorType: 'teacher',
      actorId: teacher.id,
      actorName: teacher.name,
      action: 'TEACHER_LOGIN',
      description: `आचार्य ${teacher.name} द्वारा लॉगिन`,
      req
    });

    res.json({
      success: true,
      token,
      teacher: {
        id: teacher.id,
        schoolId: teacher.schoolId,
        name: teacher.name,
        gender: teacher.gender,
        designation: teacher.designation,
        subjects: teacher.subjects,
        phone: teacher.phone,
        email: teacher.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'आचार्य प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

// ================= SCHOOLS (BRANCHES) =================
router.get('/schools', async (req, res) => {
  try {
    // Exclude adminPasscode from public listing
    const schools = await School.find().select('-adminPasscode').sort({ established: 1, createdAt: 1 }).lean();
    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/schools/:id', async (req, res) => {
  try {
    // Exclude adminPasscode from public detail
    const school = await School.findOne({ id: req.params.id }).select('-adminPasscode').lean();
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
      data.id = generateUniqueId(`ssm-${citySlug}`);
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
    const updatePayload = { ...req.body };
    const targetFilter = { id: req.params.id, ...(req.user.role === 'developer' ? {} : { id: req.userSchoolId }) };

    // If adminPasscode is updated, increment tokenVersion to invalidate existing stale sessions
    if (updatePayload.adminPasscode) {
      const existing = await School.findOne(targetFilter).lean();
      if (existing) {
        updatePayload.tokenVersion = (existing.tokenVersion || 1) + 1;
      }
    }

    const school = await School.findOneAndUpdate(
      targetFilter,
      updatePayload,
      { returnDocument: 'after', runValidators: true }
    );
    if (!school) return res.status(404).json({ error: 'School not found' });

    if (updatePayload.adminPasscode) {
      await recordAuditLog({
        schoolId: school.id,
        actorType: req.user?.role || 'admin',
        actorId: req.user?.schoolId || req.user?.role || 'admin',
        actorName: req.user?.schoolName || school.name,
        action: 'PASSCODE_CHANGED',
        description: `प्रशासक सुरक्षा पासकोड बदला गया एवं सक्रिय सत्र अमान्य (invalidated) किए गए (संस्करण: ${school.tokenVersion})`,
        req
      });
    }

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
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.status) filter.status = req.query.status;
    await executeSafeQuery(Student, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const studentData = req.body;
    if (!studentData.id) {
      studentData.id = generateUniqueId('ssm');
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
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);

    const docs = rawStudents.map((s, idx) => ({
      ...s,
      id: s.id || `ssm-${timestamp}-${randomSuffix}-${idx + 1}`,
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
    await recordAuditLog({
      schoolId: targetSchoolId,
      actorType: req.user?.role || 'admin',
      action: 'STUDENTS_BULK_IMPORTED',
      description: `${inserted.length} नए छात्रों का डेटा सफलतापूर्वक आयात (Bulk Import) किया गया।`,
      req
    });
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
      { returnDocument: 'after', runValidators: true }
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
    await recordAuditLog({
      schoolId: deleted.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'STUDENT_DELETED',
      description: `छात्र #${deleted.id} (${deleted.name}, कक्षा: ${deleted.class}, अनुक्रमांक: ${deleted.rollNo}) को स्थायी रूप से हटाया गया।`,
      req
    });
    res.json({ success: true, message: 'Student deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DPDP Act 2023: Right to Erasure / Data Anonymization on TC Issuance
 * Masks student personal identifiable contact and residential address
 * while preserving academic identifiers (rollNo, name, class) required by state education boards.
 */
router.post('/students/:id/anonymize', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const student = await Student.findOne({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.contact = '+91 99*** *****';
    student.address = '[DPDP Act 2023: गोपनीयता नीति के तहत अनामीकृत/संरक्षित]';
    if (student.fatherName && student.fatherName.length > 3) {
      student.fatherName = `${student.fatherName.slice(0, 3)}***`;
    }
    if (student.motherName && student.motherName.length > 3) {
      student.motherName = `${student.motherName.slice(0, 3)}***`;
    }
    await student.save();

    await recordAuditLog({
      schoolId: student.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'DPDP_STUDENT_ANONYMIZED',
      description: `छात्र #${student.id} (${student.name}) का व्यक्तिगत डेटा DPDP Act 2023 (TC/विलोपन अधिकार) के तहत अनामीकृत किया गया।`,
      req
    });

    res.json({
      success: true,
      message: 'छात्र का व्यक्तिगत डेटा DPDP Act 2023 के अंतर्गत सफलतापूर्वक अनामीकृत किया गया।',
      student
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Academic Session: Batch Student Promotion & Progression
 * Moves students to next academic session, preserves past session in academicHistory,
 * and handles alumni/passed_out students.
 */
router.post('/students/promote', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { schoolId, fromAcademicYear, toAcademicYear, promotions } = req.body;
    const targetSchoolId = req.user.role === 'developer' && schoolId ? schoolId : req.userSchoolId;

    if (!toAcademicYear) {
      return res.status(400).json({ error: 'नया शैक्षणिक सत्र (toAcademicYear) अनिवार्य है।' });
    }
    if (!Array.isArray(promotions) || promotions.length === 0) {
      return res.status(400).json({ error: 'छात्र प्रोन्नति सूची (promotions array) अनिवार्य है।' });
    }

    const updatedStudents = [];
    for (const item of promotions) {
      const { studentId, nextClass, nextSection, nextRollNo, action = 'promote', remarks = '' } = item;
      if (!studentId) continue;

      const student = await Student.findOne({ id: studentId, schoolId: targetSchoolId });
      if (!student) continue;

      // Archive current session details into academicHistory
      const historyEntry = {
        academicYear: student.academicYear || fromAcademicYear || '2025-26',
        class: student.class,
        section: student.section || 'A',
        rollNo: student.rollNo,
        status: action,
        promotedAt: new Date(),
        remarks: remarks || (action === 'alumni' ? 'उत्तीर्ण (Alumni / Passed Out)' : action === 'detain' ? 'सत्र दोहराव (Detained)' : 'सफलतापूर्वक प्रोन्नत')
      };

      student.academicHistory.push(historyEntry);

      if (action === 'alumni') {
        student.status = 'alumni';
        student.academicYear = toAcademicYear;
      } else if (action === 'detain') {
        student.academicYear = toAcademicYear;
        if (nextRollNo) student.rollNo = String(nextRollNo);
        if (nextSection) student.section = nextSection;
        student.status = 'active';
      } else {
        // Normal promote
        if (nextClass) student.class = nextClass;
        if (nextSection) student.section = nextSection;
        if (nextRollNo) student.rollNo = String(nextRollNo);
        student.academicYear = toAcademicYear;
        student.status = 'active';
      }

      await student.save();
      updatedStudents.push(student);
    }

    await recordAuditLog({
      schoolId: targetSchoolId,
      actorType: req.user?.role || 'admin',
      actorName: req.user?.schoolName || 'प्रशासक',
      action: 'STUDENTS_PROMOTED',
      description: `सत्र ${fromAcademicYear || 'पूर्व'} से ${toAcademicYear} में कुल ${updatedStudents.length} छात्रों की प्रोन्नति संपन्न।`,
      req
    });

    res.json({
      success: true,
      message: `${updatedStudents.length} छात्रों की प्रोन्नति सफलतापूर्वक संपन्न हुई।`,
      count: updatedStudents.length,
      students: updatedStudents
    });
  } catch (err) {
    res.status(500).json({ error: 'प्रोन्नति त्रुटि: ' + err.message });
  }
});

// ================= ATTENDANCE =================
router.get('/attendance', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.class) filter.class = req.query.class;
    await executeSafeQuery(Attendance, filter, req, res, { date: -1, createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/attendance', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { studentId, date, status = 'Present', schoolId, academicYear, class: studentClass } = req.body;
    if (!studentId || !date) {
      return res.status(400).json({ error: 'studentId और date अनिवार्य हैं।' });
    }
    const validStatuses = ['Present', 'Absent', 'Leave'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `अमान्य उपस्थिति स्थिति: ${status}` });
    }
    const targetSchoolId = schoolId || req.userSchoolId || 'ssm-gorakhpur';
    const id = `att-${targetSchoolId}-${date}-${studentId}`;
    const year = academicYear || calculateCurrentAcademicYear(new Date(date));
    const record = await Attendance.findOneAndUpdate(
      { schoolId: targetSchoolId, studentId, date },
      { 
        id, 
        studentId, 
        date, 
        status, 
        schoolId: targetSchoolId,
        academicYear: year,
        ...(studentClass ? { class: studentClass } : {})
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/attendance/bulk', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { updates, schoolId } = req.body; // array of { studentId, date, status }
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'updates array is required and must not be empty' });
    }

    const validStatuses = ['Present', 'Absent', 'Leave'];
    for (const u of updates) {
      if (!u.studentId || !u.date) {
        return res.status(400).json({ error: 'प्रत्येक प्रविष्टि में studentId और date अनिवार्य है।' });
      }
      if (u.status && !validStatuses.includes(u.status)) {
        return res.status(400).json({ error: `अमान्य उपस्थिति स्थिति: ${u.status}` });
      }
    }

    const operations = updates.map(u => {
      const targetSchoolId = u.schoolId || schoolId || req.userSchoolId || 'ssm-gorakhpur';
      const year = u.academicYear || calculateCurrentAcademicYear(new Date(u.date));
      return {
        updateOne: {
          filter: { schoolId: targetSchoolId, studentId: u.studentId, date: u.date },
          update: {
            $set: {
              id: `att-${targetSchoolId}-${u.date}-${u.studentId}`,
              studentId: u.studentId,
              date: u.date,
              status: u.status || 'Present',
              schoolId: targetSchoolId,
              academicYear: year,
              ...(u.class ? { class: u.class } : {})
            }
          },
          upsert: true
        }
      };
    });

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
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    await executeSafeQuery(Fee, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/fees', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const feeData = req.body;
    if (!feeData.id) {
      feeData.id = generateUniqueId('fee');
    }
    if (!feeData.schoolId) {
      feeData.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    if (!feeData.academicYear) {
      feeData.academicYear = calculateCurrentAcademicYear();
    }
    const fee = new Fee(feeData);
    await fee.save();
    await recordAuditLog({
      schoolId: fee.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'FEE_DEMAND_CREATED',
      description: `शुल्क मांग #${fee.id} सृजित: छात्र #${fee.studentId} के लिए ₹${fee.totalAmount || 0} (${fee.feeType || 'वार्षिक/मासिक शुल्क'}, सत्र: ${fee.academicYear})`,
      req
    });
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
    const schoolSuffix = (fee.schoolId || 'SSM').slice(-4).toUpperCase();
    fee.receiptNo = `SSM-REC-${new Date().getFullYear()}-${schoolSuffix}-${Date.now().toString().slice(-6)}`;
    fee.paymentMode = paymentMode || 'Online UPI';

    await fee.save();
    await recordAuditLog({
      schoolId: fee.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'FEE_PAYMENT_COLLECTED',
      description: `शुल्क भुगतान प्राप्त: छात्र #${fee.studentId} - रसीद संख्या: ${fee.receiptNo}, राशि: ₹${fee.paidAmount}, माध्यम: ${fee.paymentMode}`,
      req
    });
    res.json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Academic Session: Fee Arrears Rollover
 * Aggregates all pending/partial fee dues for students in fromAcademicYear
 * and rolls them forward into toAcademicYear as 'Past Session Arrears'
 */
router.post('/fees/rollover-arrears', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { schoolId, fromAcademicYear, toAcademicYear } = req.body;
    const targetSchoolId = req.user.role === 'developer' && schoolId ? schoolId : req.userSchoolId;

    if (!fromAcademicYear || !toAcademicYear) {
      return res.status(400).json({ error: 'fromAcademicYear और toAcademicYear दोनों अनिवार्य हैं।' });
    }

    // Find all pending / partial fees from the previous session
    const pendingFees = await Fee.find({
      schoolId: targetSchoolId,
      academicYear: fromAcademicYear,
      status: { $in: ['Pending', 'Partial'] }
    }).lean();

    if (pendingFees.length === 0) {
      return res.json({
        success: true,
        message: `सत्र ${fromAcademicYear} में कोई बकाया शुल्क शेष नहीं है।`,
        rolledOverCount: 0,
        totalArrearsAmount: 0,
        arrears: []
      });
    }

    // Group pending amounts per student
    const studentArrearsMap = new Map();
    for (const fee of pendingFees) {
      const unpaid = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));
      if (unpaid > 0) {
        studentArrearsMap.set(fee.studentId, (studentArrearsMap.get(fee.studentId) || 0) + unpaid);
      }
    }

    let createdCount = 0;
    let totalArrearsAmount = 0;
    const createdArrearDocs = [];

    for (const [studentId, arrears] of studentArrearsMap.entries()) {
      if (arrears <= 0) continue;

      // Check if an arrear entry already exists in target session to prevent double rollover
      const existingArrear = await Fee.findOne({
        schoolId: targetSchoolId,
        studentId,
        academicYear: toAcademicYear,
        term: 'Past Session Arrears'
      });

      if (!existingArrear) {
        const sanitizedYear = toAcademicYear.replace(/[^a-zA-Z0-9]/g, '');
        const newFeeArrear = new Fee({
          id: `fee-arrear-${studentId}-${sanitizedYear}`,
          schoolId: targetSchoolId,
          studentId,
          term: 'Past Session Arrears',
          academicYear: toAcademicYear,
          totalAmount: arrears,
          paidAmount: 0,
          status: 'Pending'
        });
        await newFeeArrear.save();
        createdCount++;
        totalArrearsAmount += arrears;
        createdArrearDocs.push(newFeeArrear);
      }
    }

    await recordAuditLog({
      schoolId: targetSchoolId,
      actorType: req.user?.role || 'admin',
      actorName: req.user?.schoolName || 'प्रशासक',
      action: 'FEE_ARREARS_ROLLED_OVER',
      description: `सत्र ${fromAcademicYear} से ${toAcademicYear} में ${createdCount} छात्रों के लिए कुल ₹${totalArrearsAmount} का बकाया शुल्क अग्रसारित (Rolled over) किया गया।`,
      req
    });

    res.json({
      success: true,
      message: `सत्र ${fromAcademicYear} से ${toAcademicYear} में कुल ₹${totalArrearsAmount} का बकाया सफलतापूर्वक अग्रसारित हुआ।`,
      rolledOverCount: createdCount,
      totalArrearsAmount,
      arrears: createdArrearDocs
    });
  } catch (err) {
    res.status(500).json({ error: 'शुल्क रोलओवर त्रुटि: ' + err.message });
  }
});

// ================= REPORT CARDS =================
router.get('/reports', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.examTerm) filter.examTerm = req.query.examTerm;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    const reports = await ReportCard.find(filter).lean();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reports', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const reportData = req.body;
    if (!reportData.id) {
      reportData.id = generateUniqueId('rep');
    }
    if (!reportData.schoolId) {
      reportData.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const report = await ReportCard.findOneAndUpdate(
      { studentId: reportData.studentId, examTerm: reportData.examTerm, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      reportData,
      { upsert: true, returnDocument: 'after', runValidators: true }
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
      noticeData.id = generateUniqueId('not');
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
    const regNo = `SSM-ADM-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const id = generateUniqueId('adm');
    const admission = new Admission({
      ...data,
      id,
      regNo,
      consentTimestamp: new Date(),
      consentPolicyVersion: data.consentPolicyVersion || '2026-09-12',
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
    const studentId = generateUniqueId('ssm');

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
      data.id = generateUniqueId('hw');
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

router.put('/staff/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const member = await Staff.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      req.body,
      { returnDocument: 'after', runValidators: true }
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

// ================= EXAMS & MARKS =================
router.get('/exams', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.term) filter.term = req.query.term;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    await executeSafeQuery(Exam, filter, req, res, { startDate: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/exams', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `exam-${Date.now()}`;
    data.schoolId = req.user?.role === 'developer' && data.schoolId ? data.schoolId : req.userSchoolId;
    if (!data.academicYear) {
      data.academicYear = calculateCurrentAcademicYear();
    }
    const exam = new Exam(data);
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/exams/:id', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const existing = await Exam.findOne({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!existing) return res.status(404).json({ error: 'Exam not found' });
    if (existing.isLocked && req.body.isLocked === undefined) {
      return res.status(403).json({
        error: 'यह परीक्षा लॉक (स्थिर) है। इसके विवरण में परिवर्तन वर्जित है। (Exam is locked)',
        code: 'EXAM_LOCKED'
      });
    }

    const updated = await Exam.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/exams/:id/lock', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { isLocked } = req.body;
    const lockStatus = isLocked !== undefined ? Boolean(isLocked) : true;
    const exam = await Exam.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { isLocked: lockStatus },
      { returnDocument: 'after', runValidators: true }
    );
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    await recordAuditLog({
      schoolId: exam.schoolId,
      actorType: req.user?.role || 'admin',
      action: exam.isLocked ? 'EXAM_LOCKED' : 'EXAM_UNLOCKED',
      description: `परीक्षा #${exam.id} (${exam.name || exam.term}) को ${exam.isLocked ? 'स्थिर/लॉक (Locked)' : 'अनलॉक (Unlocked)'} किया गया।`,
      req
    });
    res.json({ success: true, isLocked: exam.isLocked, exam });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/exams/:id', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Exam.findOneAndDelete({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!deleted) return res.status(404).json({ error: 'Exam not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Marks Matrix submission (updates/creates ReportCard records)
router.post('/exams/marks-bulk', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const { schoolId, examTerm, academicYear, subject, marksList } = req.body;
    if (!marksList || !Array.isArray(marksList) || !subject) {
      return res.status(400).json({ error: 'विषय और छात्रों के प्राप्तांक सूची आवश्यक है।' });
    }

    const targetSchoolId = schoolId || req.user?.schoolId || 'ssm-gorakhpur';
    const year = academicYear || calculateCurrentAcademicYear();
    const term = examTerm || 'अर्धवार्षिक परीक्षा';

    // Check if exam is locked to prevent tampering with historical or frozen marks
    const lockedExam = await Exam.findOne({
      schoolId: targetSchoolId,
      term,
      academicYear: year,
      isLocked: true
    });
    if (lockedExam) {
      return res.status(403).json({
        error: `परीक्षा '${term}' (${year}) लॉक (स्थिर) कर दी गई है। इसके अंकों में परिवर्तन वर्जित है। (Exam is locked, marks entry forbidden)`,
        code: 'EXAM_LOCKED'
      });
    }

    const results = [];
    for (const item of marksList) {
      const { studentId, marksObtained, maxMarks = 100 } = item;
      if (!studentId) continue;

      let report = await ReportCard.findOne({ schoolId: targetSchoolId, studentId, examTerm: term });
      const grade = marksObtained >= 90 ? 'A+' : marksObtained >= 75 ? 'A' : marksObtained >= 60 ? 'B' : marksObtained >= 45 ? 'C' : 'D';

      if (report) {
        const subIndex = report.marks.findIndex(m => m.subject === subject);
        if (subIndex > -1) {
          report.marks[subIndex].marksObtained = Number(marksObtained);
          report.marks[subIndex].maxMarks = Number(maxMarks);
          report.marks[subIndex].grade = grade;
        } else {
          report.marks.push({
            subject,
            code: subject.slice(0, 3).toUpperCase(),
            maxMarks: Number(maxMarks),
            marksObtained: Number(marksObtained),
            grade
          });
        }
        report.totalMax = report.marks.reduce((sum, m) => sum + (m.maxMarks || 100), 0);
        report.totalObtained = report.marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
        report.percentage = report.totalMax > 0 ? (report.totalObtained / report.totalMax) * 100 : 0;
        report.grade = report.percentage >= 90 ? 'A+' : report.percentage >= 75 ? 'A' : report.percentage >= 60 ? 'B' : report.percentage >= 45 ? 'C' : 'D';
        await report.save();
        results.push(report);
      } else {
        const newReport = new ReportCard({
          id: `rc-${Date.now()}-${studentId}`,
          schoolId: targetSchoolId,
          studentId,
          examTerm: term,
          academicYear: year,
          marks: [{
            subject,
            code: subject.slice(0, 3).toUpperCase(),
            maxMarks: Number(maxMarks),
            marksObtained: Number(marksObtained),
            grade
          }],
          totalMax: Number(maxMarks),
          totalObtained: Number(marksObtained),
          percentage: Number(maxMarks) > 0 ? (Number(marksObtained) / Number(maxMarks)) * 100 : 0,
          grade,
          acharyaRemarks: 'संतोषजनक प्रदर्शन। निरंतर अभ्यास करें।'
        });
        await newReport.save();
        results.push(newReport);
      }
    }

    await recordAuditLog({
      schoolId: targetSchoolId,
      actorType: req.user?.role || 'admin',
      actorId: req.user?.staffId || req.user?.teacherId || '',
      actorName: req.user?.name || req.user?.schoolName || 'आचार्य / व्यवस्थापक',
      action: 'EXAM_MARKS_RECORDED',
      description: `परीक्षा '${term}' (${year}) - विषय: ${subject} हेतु ${results.length} छात्रों के प्राप्तांक दर्ज/अद्यतन किए गए।`,
      req
    });

    res.json({ success: true, count: results.length, updated: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= TIMETABLE =================
router.get('/timetable', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    const timetables = await Timetable.find(filter).lean();
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/timetable', requirePortalAuth, requireSchoolScope, async (req, res) => {
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

router.patch('/leaves/:id/status', requirePortalAuth, requireSchoolScope, async (req, res) => {
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
    res.json(leave);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ================= TRANSPORT =================
router.get('/transport/routes', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    await executeSafeQuery(TransportRoute, filter, req, res, { routeName: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transport/routes', requirePortalAuth, requireSchoolScope, async (req, res) => {
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

router.put('/transport/routes/:id', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const updated = await TransportRoute.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Route not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/transport/routes/:id', requirePortalAuth, requireSchoolScope, async (req, res) => {
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
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { author: { $regex: req.query.search, $options: 'i' } },
        { accessionNo: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    await executeSafeQuery(Book, filter, req, res, { title: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/library/books', requirePortalAuth, requireSchoolScope, async (req, res) => {
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

router.put('/library/books/:id', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const updated = await Book.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Book not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/library/books/:id', requirePortalAuth, requireSchoolScope, async (req, res) => {
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

router.get('/library/issues', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.status) filter.status = req.query.status;
    await executeSafeQuery(BookIssue, filter, req, res, { issueDate: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/library/issue', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `iss-${Date.now()}`;
    data.schoolId = req.user.role === 'developer' && data.schoolId ? data.schoolId : req.userSchoolId;
    const issue = new BookIssue(data);
    await issue.save();
    // Decrease available copies
    await Book.findOneAndUpdate(
      { id: data.bookId, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { $inc: { availableCopies: -1 } }
    );
    res.status(201).json(issue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/library/return', requirePortalAuth, requireSchoolScope, async (req, res) => {
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
    // Increase available copies
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
router.get('/inventory', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.category) filter.category = req.query.category;
    await executeSafeQuery(InventoryItem, filter, req, res, { itemName: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inventory', requirePortalAuth, requireSchoolScope, async (req, res) => {
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

router.put('/inventory/:id', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const updated = await InventoryItem.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/inventory/:id', requirePortalAuth, requireSchoolScope, async (req, res) => {
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

router.post('/inventory/:id/stock', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const { delta } = req.body; // e.g. +10 or -2
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
router.get('/audit-logs', requirePortalAuth, requireSchoolScope, async (req, res) => {
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

module.exports = router;
