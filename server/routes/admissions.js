const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const Student = require('../models/Student');
const { requireAdminAuth, requireSchoolScope } = require('../middleware/auth');
const { generateUniqueId, executeSafeQuery } = require('../utils/routeHelpers');

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
router.post('/', async (req, res) => {
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

// PUT /api/admissions/:id/approve - Approve admission inquiry
router.put('/:id/approve', requireAdminAuth, requireSchoolScope, async (req, res) => {
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

