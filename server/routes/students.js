const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const ReportCard = require('../models/ReportCard');
const Leave = require('../models/Leave');
const { requireAdminAuth, requireTeacherAuth, requireStudentAuth, requireSchoolScope, hashPasscode } = require('../middleware/auth');
const { cleanStringParam, escapeRegex } = require('../middleware/sanitize');
const { generateUniqueId, recordAuditLog, executeSafeQuery } = require('../utils/routeHelpers');

// GET /api/students/verify-tc (Public verification)
router.get('/verify-tc', async (req, res) => {
  try {
    const q = cleanStringParam(req.query.q || req.query.query);
    const schoolId = cleanStringParam(req.query.schoolId);
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'कृपया कम से कम 2 अक्षर या अंक दर्ज करें।' });
    }

    const filter = schoolId ? { schoolId } : {};
    const exactRegex = new RegExp(`^${escapeRegex(q)}$`, 'i');

    const student = await Student.findOne({
      ...filter,
      $or: [
        { pen: exactRegex },
        { rollNo: exactRegex },
        { id: exactRegex },
        { name: exactRegex }
      ]
    }).select('id schoolId rollNo name gender class section fatherName motherName admissionDate pen').lean();

    if (!student) {
      return res.status(404).json({ error: 'इस विवरण से कोई प्रमाणित छात्र अभिलेख नहीं मिला।' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/me (Authenticated student self-service)
router.get('/me', requireStudentAuth, async (req, res) => {
  try {
    const studentId = req.user.studentId;
    const schoolId = req.user.schoolId;
    if (!studentId) {
      return res.status(400).json({ error: 'छात्र सत्र में छात्र पहचान उपलब्ध नहीं है।' });
    }

    const [student, fees, attendance, reportCards] = await Promise.all([
      Student.findOne({ id: studentId, ...(schoolId ? { schoolId } : {}) }).select('-pin').lean(),
      Fee.find({ studentId, ...(schoolId ? { schoolId } : {}) }).sort({ createdAt: -1 }).lean(),
      Attendance.find({ studentId, ...(schoolId ? { schoolId } : {}) }).sort({ date: -1 }).limit(60).lean(),
      ReportCard.find({ studentId, ...(schoolId ? { schoolId } : {}) }).sort({ createdAt: -1 }).lean()
    ]);

    if (!student) {
      return res.status(404).json({ error: 'छात्र रिकॉर्ड नहीं मिला।' });
    }

    res.json({
      student,
      fees: fees || [],
      attendance: attendance || [],
      reportCards: reportCards || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students - List students
router.get('/', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const schoolId = cleanStringParam(req.query.schoolId);
    const filter = schoolId ? { schoolId } : {};
    const cls = cleanStringParam(req.query.class);
    const sec = cleanStringParam(req.query.section);
    const yr = cleanStringParam(req.query.academicYear);
    const st = cleanStringParam(req.query.status);
    if (cls) filter.class = cls;
    if (sec) filter.section = sec;
    if (yr) filter.academicYear = yr;
    if (st) filter.status = st;
    await executeSafeQuery(Student, filter, req, res, { createdAt: -1 }, '-pin');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students - Create single student
router.post('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const studentData = req.body;
    if (!studentData.id) {
      studentData.id = generateUniqueId('ssm');
    }
    if (!studentData.schoolId) {
      studentData.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    if (studentData.pin && typeof studentData.pin === 'string' && !studentData.pin.startsWith('scrypt:')) {
      studentData.pin = hashPasscode(studentData.pin);
    }
    const student = new Student(studentData);
    await student.save();
    const sanitizedStudent = student.toObject ? student.toObject() : { ...student };
    delete sanitizedStudent.pin;
    res.status(201).json(sanitizedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/students/bulk - Bulk import students
router.post('/bulk', requireAdminAuth, requireSchoolScope, async (req, res) => {
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
      id: s.id || `ssm-${targetSchoolId}-${timestamp}-${randomSuffix}-${idx + 1}`,
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
    res.status(201).json({
      count: inserted.length,
      students: inserted.map(s => {
        const obj = s.toObject ? s.toObject() : { ...s };
        delete obj.pin;
        return obj;
      })
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/students/:id - Update student
router.put('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updateData.schoolId;
    }

    if (updateData.pin === '' || updateData.pin === undefined) {
      delete updateData.pin;
    } else if (typeof updateData.pin === 'string' && !updateData.pin.startsWith('scrypt:')) {
      updateData.pin = hashPasscode(updateData.pin);
    }

    const student = await Student.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updateData,
      { returnDocument: 'after', runValidators: true }
    ).select('-pin');
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Cascading active synchronization across modules
    const cascadePromises = [];
    if (updateData.class) {
      cascadePromises.push(
        Attendance.updateMany(
          { studentId: student.id, schoolId: student.schoolId },
          { $set: { class: student.class } }
        )
      );
    }
    if (updateData.name || updateData.class) {
      const leaveUpdate = {};
      if (updateData.name) leaveUpdate.applicantName = student.name;
      if (updateData.class) leaveUpdate.classOrDesignation = student.class;
      cascadePromises.push(
        Leave.updateMany(
          { applicantId: student.id, applicantType: 'student', schoolId: student.schoolId },
          { $set: leaveUpdate }
        )
      );
    }
    if (cascadePromises.length > 0) {
      await Promise.all(cascadePromises);
    }

    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/students/:id - Delete student
router.delete('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Student not found' });

    // Transactional cascade orphan purge
    await Promise.all([
      Fee.deleteMany({ studentId: deleted.id, schoolId: deleted.schoolId }),
      Attendance.deleteMany({ studentId: deleted.id, schoolId: deleted.schoolId }),
      ReportCard.deleteMany({ studentId: deleted.id, schoolId: deleted.schoolId }),
      Leave.deleteMany({ applicantId: deleted.id, schoolId: deleted.schoolId })
    ]);

    await recordAuditLog({
      schoolId: deleted.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'STUDENT_DELETED',
      description: `छात्र #${deleted.id} (${deleted.name}, कक्षा: ${deleted.class}, अनुक्रमांक: ${deleted.rollNo}) एवं सम्बद्ध अभिलेखों को स्थायी रूप से हटाया गया।`,
      req
    });
    res.json({ success: true, message: 'Student deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/:id/anonymize - DPDP Act 2023 anonymization
router.post('/:id/anonymize', requireAdminAuth, requireSchoolScope, async (req, res) => {
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

// POST /api/students/promote - Batch student promotion
router.post('/promote', requireAdminAuth, requireSchoolScope, async (req, res) => {
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

module.exports = router;

