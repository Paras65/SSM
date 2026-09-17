const express = require('express');
const router = express.Router();
const SalarySlip = require('../models/SalarySlip');
const { requireAdminAuth, requireSchoolScope } = require('../middleware/auth');
const { generateUniqueId, executeSafeQuery, recordAuditLog } = require('../utils/routeHelpers');

// GET /api/salary-slips - List salary slips
router.get('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = {};
    const effectiveSchoolId = req.user?.role === 'developer'
      ? (req.query.schoolId || req.userSchoolId)
      : (req.userSchoolId || req.query.schoolId);
    if (effectiveSchoolId) filter.schoolId = effectiveSchoolId;
    if (req.query.staffId) filter.staffId = req.query.staffId;
    if (req.query.month) filter.month = req.query.month;
    await executeSafeQuery(SalarySlip, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/salary-slips - Generate and save salary slip
router.post('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.staffId || !data.month || data.netSalary === undefined) {
      return res.status(400).json({ error: 'कर्मचारी पहचान, वेतन माह एवं शुद्ध वेतन आवश्यक हैं।' });
    }
    const targetSchoolId = (req.user?.role === 'developer' && data.schoolId)
      ? data.schoolId
      : (req.userSchoolId || data.schoolId || 'ssm-gorakhpur');
    const id = data.id || generateUniqueId('sal');

    const isExisting = await SalarySlip.exists({ schoolId: targetSchoolId, staffId: data.staffId, month: data.month });

    const slip = await SalarySlip.findOneAndUpdate(
      { schoolId: targetSchoolId, staffId: data.staffId, month: data.month },
      {
        ...data,
        id,
        schoolId: targetSchoolId
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    await recordAuditLog({
      schoolId: targetSchoolId,
      actorType: req.user?.role || 'admin',
      action: 'SALARY_SLIP_GENERATED',
      description: `वेतन पर्ची जारी: ${data.staffName} (${data.designation}) - माह: ${data.month}, शुद्ध राशि: ₹${data.netSalary}`,
      req
    });

    res.status(isExisting ? 200 : 201).json(slip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/salary-slips/:id - Delete salary slip
router.delete('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await SalarySlip.findOneAndDelete({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!deleted) return res.status(404).json({ error: 'Salary slip not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

