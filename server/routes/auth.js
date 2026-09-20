const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const School = require('../models/School');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const { generateAdminToken, isValidAdminPasscode, isValidDeveloperPasscode, verifyPasscode } = require('../middleware/auth');
const { escapeRegex } = require('../middleware/sanitize');
const { recordAuditLog } = require('../utils/routeHelpers');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const target = req.body?.rollNo || req.body?.phone || req.body?.schoolId || req.body?.clusterName || '';
    return `${ip}_${target}`;
  },
  message: { error: 'अत्यधिक लॉगिन प्रयास! कृपया 15 मिनट बाद पुनः प्रयास करें।' },
  skip: () => process.env.NODE_ENV === 'test'
});

// POST /api/auth/login (Admin / Developer login)
router.post('/login', authLimiter, async (req, res) => {
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
router.post('/student-login', authLimiter, async (req, res) => {
  try {
    const { schoolId, rollNo, contact, studentClass, dob, pin } = req.body;
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

    // Security PIN Verification: If student has a PIN configured on their record
    if (student.pin && typeof student.pin === 'string' && student.pin.trim().length > 0) {
      if (!pin || typeof pin !== 'string' || !pin.trim()) {
        return res.status(422).json({
          error: 'इस छात्र खाते के लिए 4-अंकीय सुरक्षा पिन आवश्यक है। (Security PIN required)',
          code: 'PIN_REQUIRED'
        });
      }
      if (!verifyPasscode(student.pin, pin)) {
        await recordAuditLog({
          schoolId: student.schoolId,
          actorType: 'student',
          actorId: student.id,
          actorName: student.name,
          action: 'STUDENT_LOGIN_FAILED_PIN',
          description: `छात्र ${student.name} (अनुक्रमांक: ${student.rollNo}) का गलत सुरक्षा पिन दर्ज किया गया`,
          req
        });
        return res.status(401).json({
          error: 'अमान्य सुरक्षा पिन! कृपया सही 4-अंकीय पिन दर्ज करें। (Invalid security PIN)',
          code: 'INVALID_CREDENTIALS'
        });
      }
    }

    // Optional DOB verification: If client provides dob and student record has dob
    if (dob && typeof dob === 'string' && dob.trim().length > 0) {
      const cleanReqDob = dob.trim();
      const cleanStudentDob = (student.dob || '').trim();
      if (cleanStudentDob && cleanReqDob !== cleanStudentDob) {
        await recordAuditLog({
          schoolId: student.schoolId,
          actorType: 'student',
          actorId: student.id,
          actorName: student.name,
          action: 'STUDENT_LOGIN_FAILED_DOB',
          description: `छात्र ${student.name} (अनुक्रमांक: ${student.rollNo}) की गलत जन्म तिथि दर्ज की गई`,
          req
        });
        return res.status(401).json({
          error: 'जन्म तिथि मेल नहीं खाती! कृपया सही जन्म तिथि दर्ज करें। (Date of birth does not match)',
          code: 'INVALID_CREDENTIALS'
        });
      }
    }

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

    const sanitizedStudent = { ...student };
    delete sanitizedStudent.pin;
    res.json({ success: true, token, student: sanitizedStudent });
  } catch (err) {
    res.status(500).json({ error: 'छात्र प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

// POST /api/auth/teacher-login
router.post('/teacher-login', authLimiter, async (req, res) => {
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

    if (teacher.status === 'Resigned') {
      await recordAuditLog({
        schoolId: teacher.schoolId,
        actorType: 'teacher',
        actorId: teacher.id,
        actorName: teacher.name,
        action: 'TEACHER_LOGIN_BLOCKED_RESIGNED',
        description: `सेवामुक्त आचार्य ${teacher.name} द्वारा लॉगिन का प्रयास स्वतः ब्लॉक किया गया`,
        req
      });
      return res.status(403).json({
        error: 'यह आचार्य खाता विद्यालय से सेवामुक्त (Resigned) है। पोर्टल प्रवेश निषेध है। (Teacher account has resigned)',
        code: 'ACCOUNT_RESIGNED'
      });
    }

    const expectedPin = teacher.pin || '1234';
    if (!verifyPasscode(expectedPin, safePin)) {
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
      designation: teacher.designation,
      assignedClasses: teacher.assignedClasses || []
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
        assignedClasses: teacher.assignedClasses || [],
        phone: teacher.phone,
        email: teacher.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'आचार्य प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

// POST /api/auth/parent-login (Dedicated parent authentication with sibling aggregation)
router.post('/parent-login', authLimiter, async (req, res) => {
  try {
    const { schoolId, phone, pin } = req.body;
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ error: 'मोबाइल नंबर दर्ज करना अनिवार्य है।' });
    }
    const cleanPhone = phone.trim();
    const cleanSchoolId = schoolId && typeof schoolId === 'string' ? schoolId.trim() : '';

    const digitsOnly = cleanPhone.replace(/\D/g, '').slice(-10);
    const pattern = digitsOnly ? digitsOnly.split('').join('[\\s\\-]*') : escapeRegex(cleanPhone);

    const filter = {
      contact: { $regex: pattern },
      ...(cleanSchoolId ? { schoolId: cleanSchoolId } : {})
    };

    const matchingStudents = await Student.find(filter)
      .select('id schoolId rollNo name gender class section fatherName motherName admissionDate')
      .lean();

    if (!matchingStudents || matchingStudents.length === 0) {
      return res.status(401).json({
        error: 'इस मोबाइल नंबर से संबंधित कोई पंजीकृत छात्र नहीं मिला।',
        code: 'PARENT_NOT_FOUND'
      });
    }

    const targetSchoolId = cleanSchoolId || matchingStudents[0]?.schoolId || 'ssm-gorakhpur';
    const parentName = matchingStudents[0]?.fatherName || matchingStudents[0]?.motherName || 'अभिभावक';

    // Verify PIN if provided or on record
    const expectedPin = matchingStudents[0]?.pin || '1234';
    if (pin && typeof pin === 'string' && pin.trim()) {
      if (!verifyPasscode(expectedPin, pin.trim())) {
        return res.status(401).json({
          error: 'अमान्य सुरक्षा पिन! कृपया सही पिन दर्ज करें।',
          code: 'INVALID_PIN'
        });
      }
    }

    const token = generateAdminToken({
      schoolId: targetSchoolId,
      role: 'parent',
      phone: cleanPhone,
      parentName,
      linkedStudentIds: matchingStudents.map(s => s.id)
    });

    await recordAuditLog({
      schoolId: targetSchoolId,
      actorType: 'parent',
      actorId: cleanPhone,
      actorName: parentName,
      action: 'PARENT_LOGIN_SUCCESS',
      description: `अभिभावक ${parentName} द्वारा पोर्टल लॉगिन (${matchingStudents.length} छात्र संबद्ध)`,
      req
    });

    res.json({
      success: true,
      token,
      parent: {
        name: parentName,
        phone: cleanPhone,
        childrenCount: matchingStudents.length,
        children: matchingStudents
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'अभिभावक प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

// POST /api/auth/sankul-login (Sankul Prabhari Cluster Oversight Authentication)
router.post('/sankul-login', authLimiter, async (req, res) => {
  try {
    const { clusterName, passcode } = req.body;
    if (!passcode || typeof passcode !== 'string' || !passcode.trim()) {
      return res.status(400).json({ error: 'संकुल प्रभारी पासकोड दर्ज करना अनिवार्य है।' });
    }
    if (!clusterName || typeof clusterName !== 'string' || !clusterName.trim()) {
      return res.status(400).json({ error: 'संकुल का नाम चुनना अनिवार्य है।' });
    }

    const cleanPasscode = passcode.trim();
    const cleanClusterName = clusterName.trim();

    // Verify against configured developer passcode, Vidyabharati master code (1952), or any registered school admin passcode
    const schools = await School.find({ status: { $ne: 'discontinued' } }).select('adminPasscode').lean();
    const schoolPasscodes = schools.map(s => s.adminPasscode).filter(Boolean);
    const validCodes = [
      process.env.SANKUL_MASTER_PASSCODE || '1952',
      process.env.DEVELOPER_PASSCODE || '2026',
      ...schoolPasscodes
    ];

    const isMatch = validCodes.some(code => verifyPasscode(code, cleanPasscode) || code === cleanPasscode);

    if (!isMatch) {
      await recordAuditLog({
        schoolId: 'ssm-sankul',
        actorType: 'sankul',
        actorId: cleanClusterName,
        actorName: `संकुल प्रभारी (${cleanClusterName})`,
        action: 'SANKUL_LOGIN_FAILED',
        description: `संकुल ${cleanClusterName} पर अमान्य पासकोड से असफल लॉगिन प्रयास`,
        req
      });
      return res.status(401).json({
        error: 'अमान्य पासकोड! कृपया संकुल प्रभारी अथवा विद्या भारती अधिकृत पासकोड दर्ज करें।',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = generateAdminToken({
      role: 'sankul',
      clusterName: cleanClusterName,
      schoolId: '*'
    });

    await recordAuditLog({
      schoolId: 'ssm-sankul',
      actorType: 'sankul',
      actorId: cleanClusterName,
      actorName: `संकुल प्रभारी (${cleanClusterName})`,
      action: 'SANKUL_LOGIN_SUCCESS',
      description: `संकुल प्रभारी (${cleanClusterName}) सफलतापूर्वक प्रमाणित हुआ`,
      req
    });

    res.json({
      success: true,
      message: 'संकुल प्रभारी सफलतापूर्वक प्रमाणित हुआ!',
      token,
      clusterName: cleanClusterName
    });
  } catch (err) {
    res.status(500).json({ error: 'संकुल प्रमाणीकरण त्रुटि: ' + err.message });
  }
});

module.exports = router;

