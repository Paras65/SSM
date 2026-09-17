const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const { requireAdminAuth, requireSchoolScope } = require('../middleware/auth');
const { cleanStringParam } = require('../middleware/sanitize');
const { calculateCurrentAcademicYear } = require('../utils/sessionHelper');
const { generateUniqueId, recordAuditLog, executeSafeQuery } = require('../utils/routeHelpers');

// GET /api/fees - List fee records
router.get('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const schoolId = cleanStringParam(req.query.schoolId);
    const studentId = cleanStringParam(req.query.studentId);
    const status = cleanStringParam(req.query.status);
    const yr = cleanStringParam(req.query.academicYear);
    const filter = schoolId ? { schoolId } : {};
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    if (yr) filter.academicYear = yr;
    await executeSafeQuery(Fee, filter, req, res, { createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fees - Create fee demand record
router.post('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
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

// PUT /api/fees/:id/pay - Mark fee as paid
router.put('/:id/pay', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { paymentMode, paidAmount } = req.body;
    const fee = await Fee.findOne({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!fee) return res.status(404).json({ error: 'Fee record not found' });

    const collectedAmount = typeof paidAmount === 'number' && paidAmount > 0 ? Math.min(fee.totalAmount, paidAmount) : fee.totalAmount;
    fee.paidAmount = collectedAmount;
    fee.status = fee.paidAmount >= fee.totalAmount ? 'Paid' : 'Partial';
    fee.paidDate = new Date().toISOString().split('T')[0];
    const schoolSuffix = (fee.schoolId || 'SSM').slice(-4).toUpperCase();
    fee.receiptNo = fee.receiptNo || `SSM-REC-${new Date().getFullYear()}-${schoolSuffix}-${Date.now().toString().slice(-6)}`;
    fee.paymentMode = paymentMode || 'Online UPI';

    await fee.save();
    await recordAuditLog({
      schoolId: fee.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'FEE_PAYMENT_COLLECTED',
      description: `शुल्क भुगतान प्राप्त: छात्र #${fee.studentId} - रसीद संख्या: ${fee.receiptNo}, राशि: ₹${fee.paidAmount} (${fee.status}), माध्यम: ${fee.paymentMode}`,
      req
    });
    res.json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/fees/:id - Update fee demand record
router.put('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const updatePayload = { ...req.body };
    delete updatePayload.id;
    delete updatePayload._id;
    delete updatePayload.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updatePayload.schoolId;
    }

    const fee = await Fee.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updatePayload,
      { returnDocument: 'after', runValidators: true }
    );
    if (!fee) return res.status(404).json({ error: 'Fee record not found' });

    await recordAuditLog({
      schoolId: fee.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'FEE_RECORD_UPDATED',
      description: `शुल्क रिकॉर्ड #${fee.id} संशोधित किया गया: छात्र #${fee.studentId}, कुल देय: ₹${fee.totalAmount}, अवधि: ${fee.term} (${fee.academicYear})`,
      req
    });

    res.json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/fees/:id - Delete fee record
router.delete('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const fee = await Fee.findOne({ id: req.params.id });
    if (!fee) return res.status(404).json({ error: 'Fee record not found' });

    if (req.user.role !== 'developer' && fee.schoolId !== req.userSchoolId) {
      return res.status(403).json({ error: 'अन्य शाखा के शुल्क रिकॉर्ड हटाने की अनुमति नहीं है।', code: 'TENANT_FORBIDDEN' });
    }

    await Fee.deleteOne({ id: req.params.id });
    await recordAuditLog({
      schoolId: fee.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'FEE_RECORD_DELETED',
      description: `शुल्क रिकॉर्ड #${fee.id} हटाया गया: छात्र #${fee.studentId}, कुल देय: ₹${fee.totalAmount}, अवधि: ${fee.term} (${fee.academicYear})`,
      req
    });
    res.json({ message: 'Fee record deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fees/rollover-arrears - Fee Arrears Rollover
router.post('/rollover-arrears', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { schoolId, fromAcademicYear, toAcademicYear } = req.body;
    const targetSchoolId = req.user.role === 'developer' && schoolId ? schoolId : req.userSchoolId;

    if (!fromAcademicYear || !toAcademicYear) {
      return res.status(400).json({ error: 'fromAcademicYear और toAcademicYear दोनों अनिवार्य हैं।' });
    }

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

module.exports = router;

