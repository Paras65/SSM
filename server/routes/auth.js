const express = require('express');
const router = express.Router();
const School = require('../models/School');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const { generateAdminToken, isValidAdminPasscode, isValidDeveloperPasscode } = require('../middleware/auth');
const { escapeRegex } = require('../middleware/sanitize');
const { recordAuditLog } = require('../utils/routeHelpers');

// POST /api/auth/login (Admin / Developer login)
router.post('/login', async (req, res) => {
  try {
    const { schoolId, passcode } = req.body;
    if (!passcode || typeof passcode !== 'string' || !passcode.trim()) {
      return res.status(400).json({ error: 'पासकोड दर्ज करना अनिवार्य है। (Passcode is required)' });
    }
    if (schoolId !== undefined && typeof schoolId !== 'string') {
      return res.status(400).json({ error: 'अमान्य शाखा आईडी प्रारूप! (Invalid schoolId format)' });
    }

    const cleanPasscode = passcode.trim();
    const cleanSchoolId = schoolId ? schoolId.trim() : '';

    if (cleanSchoolId === '__developer__') {
      if (!isValidDeveloperPasscode(cleanPasscode)) {
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
    if (cleanSchoolId) {
      school = await School.findOne({ id: cleanSchoolId });
    }

    // Check if school is discontinued
    if (school && school.status === 'discontinued') {
      return res.status(403).json({
        error: 'यह विद्यालय शाखा वर्तमान में निष्क्रय (Discontinued) है। व्यवस्थापक लॉगिन उपलब्ध नहीं है।',
        code: 'SCHOOL_DISCONTINUED'
      });
    }

    // Only allow the configured school passcode; no universal fallback avoids weak admin access.
    const isMatch = isValidAdminPasscode(school?.adminPasscode, cleanPasscode);

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

// POST /api/auth/student-login
router.post('/student-login', async (req, res) => {
  try {
    const { schoolId, rollNo, contact, studentClass } = req.body;
    if (!schoolId || !rollNo || !contact || typeof schoolId !== 'string' || typeof rollNo !== 'string' || typeof contact !== 'string') {
      return res.status(400).json({ error: 'शाखा, अनुक्रमांक और मोबाइल नंबर आवश्यक हैं।' });
    }
    const cleanSchoolId = schoolId.trim();
    const cleanRollNo = rollNo.trim();
    const cleanContact = contact.trim();

    if (cleanSchoolId.length > 100 || cleanRollNo.length > 30 || cleanContact.length > 30) {
      return res.status(400).json({ error: 'छात्र लॉगिन विवरण अमान्य हैं।' });
    }
    const digitsOnly = cleanContact.replace(/\D/g, '').slice(-10);
    const pattern = digitsOnly ? digitsOnly.split('').join('[\\s\\-]*') : escapeRegex(cleanContact);
    
    const queryFilter = {
      schoolId: cleanSchoolId,
      rollNo: cleanRollNo,
      contact: { $regex: pattern }
    };

    if (studentClass && typeof studentClass === 'string') {
      queryFilter.class = studentClass.trim();
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

// POST /api/auth/teacher-login
router.post('/teacher-login', async (req, res) => {
  try {
    const { schoolId, phone, pin } = req.body;
    if (!phone || !pin || typeof phone !== 'string' || typeof pin !== 'string') {
      return res.status(400).json({ error: 'मोबाइल नंबर और पिन आवश्यक हैं।' });
    }
    if (schoolId !== undefined && typeof schoolId !== 'string') {
      return res.status(400).json({ error: 'अमान्य शाखा आईडी प्रारूप!' });
    }
    const safePhone = phone.trim();
    const safePin = pin.trim();
    const digitsOnly = safePhone.replace(/\D/g, '').slice(-10);
    const pattern = digitsOnly ? digitsOnly.split('').join('[\\s\\-]*') : escapeRegex(safePhone);
    const filter = {
      phone: { $regex: pattern },
      ...(schoolId && typeof schoolId === 'string' ? { schoolId: schoolId.trim() } : {})
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
    if (String(safePin).trim() !== String(expectedPin).trim()) {
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

module.exports = router;

