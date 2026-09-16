const express = require('express');
const router = express.Router();
const ReportCard = require('../models/ReportCard');
const { requireAdminAuth, requireSchoolScope } = require('../middleware/auth');
const { cleanStringParam } = require('../middleware/sanitize');
const { generateUniqueId, recordAuditLog } = require('../utils/routeHelpers');

// GET /api/reports - List report cards
router.get('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const schoolId = cleanStringParam(req.query.schoolId);
    const examTerm = cleanStringParam(req.query.examTerm);
    const yr = cleanStringParam(req.query.academicYear);
    const studentId = cleanStringParam(req.query.studentId);
    const filter = schoolId ? { schoolId } : {};
    if (examTerm) filter.examTerm = examTerm;
    if (yr) filter.academicYear = yr;
    if (studentId) filter.studentId = studentId;
    const reports = await ReportCard.find(filter).lean();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports - Upsert report card
router.post('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
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

// DELETE /api/reports/:id - Delete report card
router.delete('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await ReportCard.findOneAndDelete({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!deleted) return res.status(404).json({ error: 'Report card not found' });
    await recordAuditLog({
      schoolId: deleted.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'REPORT_CARD_DELETED',
      description: `प्रगति पत्र #${deleted.id} (छात्र: ${deleted.studentId}, परीक्षा: ${deleted.examTerm}) हटाया गया।`,
      req
    });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

