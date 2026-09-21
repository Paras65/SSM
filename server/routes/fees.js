const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const FeePaymentTransaction = require('../models/FeePaymentTransaction');
const Student = require('../models/Student');
const School = require('../models/School');
const Parent = require('../models/Parent');
const { requireAdminAuth, requireSchoolScope } = require('../middleware/auth');
const { cleanStringParam } = require('../middleware/sanitize');
const { calculateCurrentAcademicYear } = require('../utils/sessionHelper');
const { generateUniqueId, recordAuditLog, executeSafeQuery } = require('../utils/routeHelpers');
const { sendFeeReceiptEmail, isEmailConfigured } = require('../utils/emailService');

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

// GET /api/fees/transactions - Query fee payment transactions ledger
router.get('/transactions', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = {};
    const schoolId = cleanStringParam(req.query.schoolId);
    const studentId = cleanStringParam(req.query.studentId);
    const feeId = cleanStringParam(req.query.feeId);
    if (schoolId) filter.schoolId = schoolId;
    if (studentId) filter.studentId = studentId;
    if (feeId) filter.feeId = feeId;
    await executeSafeQuery(FeePaymentTransaction, filter, req, res, { transactionDate: -1, createdAt: -1 });
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

    // Automated Sibling Concession Calculation
    if (feeData.studentId && (feeData.applySiblingConcession || feeData.applySiblingConcession === undefined)) {
      try {
        const student = await Student.findOne({ id: feeData.studentId, schoolId: feeData.schoolId }).lean();
        if (student && student.familyId) {
          const siblings = await Student.find({
            schoolId: feeData.schoolId,
            familyId: student.familyId,
            status: { $in: ['active', 'promoted'] }
          }).sort({ admissionDate: 1, createdAt: 1 }).lean();

          if (siblings.length > 1) {
            const siblingIndex = siblings.findIndex(s => s.id === student.id);
            if (siblingIndex === 1) {
              // 2nd sibling gets 25% concession
              const discount = Math.round((Number(feeData.totalAmount || 0) * 25) / 100);
              feeData.concession = discount;
              feeData.concessionReason = feeData.concessionReason || 'सहोदर छात्र छूट (2nd Sibling 25%)';
              feeData.totalAmount = Math.max(0, Number(feeData.totalAmount || 0) - discount);
            } else if (siblingIndex >= 2) {
              // 3rd or subsequent sibling gets 50% concession
              const discount = Math.round((Number(feeData.totalAmount || 0) * 50) / 100);
              feeData.concession = discount;
              feeData.concessionReason = feeData.concessionReason || `सहोदर छात्र छूट (${siblingIndex + 1}rd Sibling 50%)`;
              feeData.totalAmount = Math.max(0, Number(feeData.totalAmount || 0) - discount);
            }
          }
        }
      } catch (siblingErr) {
        console.warn('Failed to calculate sibling concession:', siblingErr.message);
      }
    }

    const fee = new Fee(feeData);
    await fee.save();
    await recordAuditLog({
      schoolId: fee.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'FEE_DEMAND_CREATED',
      description: `शुल्क मांग #${fee.id} सृजित: छात्र #${fee.studentId} के लिए ₹${fee.totalAmount || 0} (${fee.feeType || 'वार्षिक/मासिक शुल्क'}, सत्र: ${fee.academicYear}${fee.concession ? `, छूट: ₹${fee.concession}` : ''})`,
      req
    });
    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/fees/:id/pay - Mark fee as paid / record installment
router.put('/:id/pay', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { paymentMode, paidAmount, instrumentNo, bankName, status: requestedStatus } = req.body;
    const fee = await Fee.findOne({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!fee) return res.status(404).json({ error: 'Fee record not found' });

    const currentPaid = fee.paidAmount || 0;
    const collectedAmount = typeof paidAmount === 'number' && paidAmount > 0
      ? Math.min(fee.totalAmount, paidAmount)
      : fee.totalAmount;

    const installmentAmount = Math.max(0, collectedAmount - currentPaid);

    fee.paidAmount = collectedAmount;
    
    // Cheque / DD lifecycle handling
    const isInstrumentPayment = ['Cheque', 'DD', 'Bank Draft'].includes(paymentMode);
    const isUnderClearance = requestedStatus === 'Under Clearance' || (isInstrumentPayment && requestedStatus !== 'Paid' && requestedStatus !== 'Cleared');

    if (isUnderClearance) {
      fee.status = 'Under Clearance';
    } else {
      fee.status = fee.paidAmount >= fee.totalAmount ? 'Paid' : 'Partial';
    }

    fee.paidDate = new Date().toISOString().split('T')[0];
    const schoolSuffix = (fee.schoolId || 'SSM').slice(-4).toUpperCase();
    const receipt = `SSM-REC-${new Date().getFullYear()}-${schoolSuffix}-${Date.now().toString().slice(-6)}`;
    fee.receiptNo = fee.receiptNo || receipt;
    fee.paymentMode = paymentMode || 'Online UPI';

    if (!Array.isArray(fee.payments)) {
      fee.payments = [];
    }
    if (installmentAmount > 0 || fee.payments.length === 0) {
      fee.payments.push({
        amount: installmentAmount > 0 ? installmentAmount : collectedAmount,
        date: fee.paidDate,
        receiptNo: receipt,
        paymentMode: fee.paymentMode
      });
    }

    await fee.save();

    let tx = null;
    try {
      tx = new FeePaymentTransaction({
        id: generateUniqueId('tx-fee'),
        schoolId: fee.schoolId,
        feeId: fee.id,
        studentId: fee.studentId,
        amount: installmentAmount > 0 ? installmentAmount : collectedAmount,
        paymentMode: fee.paymentMode,
        receiptNo: receipt,
        collectedBy: req.user?.schoolName || req.user?.role || 'Admin',
        academicYear: fee.academicYear,
        transactionDate: fee.paidDate,
        status: isUnderClearance ? 'Under Clearance' : 'Success',
        instrumentNo: instrumentNo || '',
        bankName: bankName || ''
      });
      await tx.save();
    } catch (txErr) {
      console.error('Failed to create fee transaction audit record:', txErr);
    }

    await recordAuditLog({
      schoolId: fee.schoolId,
      actorType: req.user?.role || 'admin',
      action: 'FEE_PAYMENT_COLLECTED',
      description: `शुल्क भुगतान प्राप्त: छात्र #${fee.studentId} - रसीद संख्या: ${fee.receiptNo}, राशि: ₹${fee.paidAmount} (${fee.status}), माध्यम: ${fee.paymentMode}${instrumentNo ? `, इंस्ट्रूमेंट नं: ${instrumentNo}` : ''}`,
      req
    });

    // Non-blocking email receipt dispatch — only if SMTP configured AND branch has opted in
    if (isEmailConfigured()) {
      setImmediate(async () => {
        try {
          const [student, school] = await Promise.all([
            Student.findOne({ id: fee.studentId, schoolId: fee.schoolId }).lean(),
            School.findOne({ id: fee.schoolId }).lean()
          ]);
          if (!student || !school) return;

          // Guard: email receipts must be explicitly enabled per branch by super admin
          if (!school.features?.enableEmailReceipts) return;

          // Find parent email: check student.parentEmail first, then Parent model, then student.email
          let recipientEmail = student.parentEmail || '';
          if (!recipientEmail) {
            const parent = await Parent.findOne({ studentIds: fee.studentId, schoolId: fee.schoolId, email: { $exists: true, $ne: '' } }).lean();
            recipientEmail = parent?.email || student?.email || '';
          }
          if (!recipientEmail || !recipientEmail.includes('@')) return;

          await sendFeeReceiptEmail({
            to: recipientEmail,
            studentName: student.name,
            fatherName: student.fatherName,
            className: student.class,
            section: student.section || 'A',
            rollNo: student.rollNo,
            receiptNo: fee.receiptNo,
            amountPaid: installmentAmount > 0 ? installmentAmount : collectedAmount,
            totalAmount: fee.totalAmount,
            paidAmount: fee.paidAmount,
            term: fee.term || 'सामान्य शुल्क',
            paymentMode: fee.paymentMode,
            academicYear: fee.academicYear,
            schoolHindiName: school.hindiName || school.name,
            schoolName: school.name,
            paidDate: fee.paidDate,
            status: fee.status
          });
        } catch (emailErr) {
          console.error('[FeeReceipt] Email dispatch error (non-fatal):', emailErr.message);
        }
      });
    }

    res.json(fee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/fees/transactions/:id/clearance - Update cheque/DD clearance lifecycle
router.patch('/transactions/:id/clearance', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { status, clearingDate } = req.body;
    if (!['Cleared', 'Bounced', 'Refunded'].includes(status)) {
      return res.status(400).json({ error: 'अमान्य क्लीयरेंस स्थिति (Cleared, Bounced, या Refunded मान्य हैं)' });
    }

    const tx = await FeePaymentTransaction.findOne({
      id: req.params.id,
      ...(req.user?.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!tx) return res.status(404).json({ error: 'लेनदेन रिकॉर्ड नहीं मिला (Transaction not found)' });

    const prevStatus = tx.status;
    tx.status = status;
    if (clearingDate) tx.clearingDate = clearingDate;
    await tx.save();

    const fee = await Fee.findOne({ id: tx.feeId, schoolId: tx.schoolId });
    if (fee) {
      if (status === 'Bounced' && prevStatus !== 'Bounced') {
        fee.paidAmount = Math.max(0, (fee.paidAmount || 0) - tx.amount);
        fee.status = fee.paidAmount <= 0 ? 'Pending' : 'Partial';
        await fee.save();
      } else if (status === 'Cleared') {
        fee.status = fee.paidAmount >= fee.totalAmount ? 'Paid' : 'Partial';
        await fee.save();
      } else if (status === 'Refunded' && prevStatus !== 'Refunded') {
        fee.paidAmount = Math.max(0, (fee.paidAmount || 0) - tx.amount);
        fee.status = 'Refunded';
        await fee.save();
      }
    }

    await recordAuditLog({
      schoolId: tx.schoolId,
      actorType: req.user?.role || 'admin',
      action: `FEE_TRANSACTION_${status.toUpperCase()}`,
      description: `शुल्क लेनदेन #${tx.id} स्थिति परिवर्तित: '${status}'. छात्र #${tx.studentId}, राशि: ₹${tx.amount}`,
      req
    });

    res.json({ success: true, transaction: tx, fee });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

