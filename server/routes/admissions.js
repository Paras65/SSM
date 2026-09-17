const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Admission = require('../models/Admission');
const Student = require('../models/Student');
const School = require('../models/School');
const { requireAdminAuth, requireSchoolScope } = require('../middleware/auth');
const { generateUniqueId, executeSafeQuery, recordAuditLog } = require('../utils/routeHelpers');

const admissionSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'अत्यधिक आवेदन प्रयास! कृपया 15 मिनट बाद पुनः प्रयास करें।' }
});

// GET /api/admissions - List admission inquiries
router.get('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.status) filter.status = req.query.status;
    await executeSafeQuery(Admission, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admissions - Submit admission inquiry (public)
router.post('/', admissionSubmitLimiter, async (req, res) => {
  try {
    const data = req.body;
    const requiredTextFields = ['schoolId', 'studentName', 'gender', 'applyingClass', 'phone'];
    if (requiredTextFields.some(field => typeof data[field] !== 'string' || !data[field].trim())) {
      return res.status(400).json({ error: 'प्रवेश आवेदन के आवश्यक विवरण भरना अनिवार्य है।' });
    }
    // Whitelist check: ensure schoolId exists in database
    const schoolExists = await School.exists({ id: data.schoolId.trim() });
    if (!schoolExists) {
      return res.status(400).json({ error: 'अमान्य विद्यालय पहचान (Invalid school ID).' });
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
      schoolId: data.schoolId.trim()
    });
    await admission.save();
    res.status(201).json(admission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admissions/:id - Update admission inquiry details
router.put('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const updatePayload = { ...req.body };
    delete updatePayload.id;
    delete updatePayload._id;
    delete updatePayload.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updatePayload.schoolId;
    }

    const admission = await Admission.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updatePayload,
      { returnDocument: 'after', runValidators: true }
    );
    if (!admission) return res.status(404).json({ error: 'Admission not found' });
    res.json(admission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admissions/:id/approve - Approve admission inquiry
router.put('/:id/approve', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const admission = await Admission.findOne({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!admission) return res.status(404).json({ error: 'Admission not found' });

    admission.status = 'Admitted';
    await admission.save();

    const targetSchoolId = admission.schoolId || 'ssm-gorakhpur';
    const reqSection = (req.body?.section || 'A').toUpperCase().trim();
    const reqBloodGroup = req.body?.bloodGroup || 'B+';

    // Class-aware sequential roll number generation
    let nextRoll = req.body?.rollNo?.trim();
    if (!nextRoll) {
      const studentsInClass = await Student.find({
        schoolId: targetSchoolId,
        class: admission.applyingClass
      }).select('rollNo');

      let maxRoll = 0;
      for (const s of studentsInClass) {
        const num = parseInt(s.rollNo, 10);
        if (!isNaN(num) && num > maxRoll) {
          maxRoll = num;
        }
      }
      nextRoll = (maxRoll > 0 ? maxRoll + 1 : 101).toString();
    }

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
      section: reqSection,
      fatherName: admission.fatherName || 'अभिभावक',
      motherName: admission.motherName || '',
      contact: admission.phone,
      address: admission.address || '',
      admissionDate: new Date().toISOString().split('T')[0],
      bloodGroup: reqBloodGroup
    });

    await newStudent.save();

    await recordAuditLog({
      schoolId: targetSchoolId,
      actorType: req.user?.role || 'admin',
      action: 'ADMISSION_APPROVED',
      description: `प्रवेश स्वीकृत: ${admission.studentName} (कक्षा: ${admission.applyingClass}, वर्ग: ${reqSection}, अनुक्रमांक: ${nextRoll})`,
      req
    });

    res.json({
      success: true,
      admission,
      student: newStudent
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admissions/:id/reject - Reject admission inquiry
router.put('/:id/reject', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const admission = await Admission.findOne({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!admission) return res.status(404).json({ error: 'Admission not found' });

    admission.status = 'Rejected';
    if (req.body?.reason) {
      admission.rejectionReason = req.body.reason;
    }
    await admission.save();

    await recordAuditLog({
      schoolId: admission.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'ADMISSION_REJECTED',
      description: `प्रवेश आवेदन अस्वीकृत: ${admission.studentName} (पंजीकरण: ${admission.regNo})${req.body?.reason ? ` - कारण: ${req.body.reason}` : ''}`,
      req
    });

    res.json({
      success: true,
      admission
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admissions/:id - Delete inquiry
router.delete('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Admission.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Admission inquiry not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

