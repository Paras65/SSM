const mongoose = require('mongoose');

const feePaymentTransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  schoolId: { type: String, required: true, index: true },
  feeId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: [1, 'Amount must be at least 1'] },
  paymentMode: { type: String, default: 'Online UPI' },
  receiptNo: { type: String, required: true, index: true },
  collectedBy: { type: String, default: 'Admin' },
  academicYear: { type: String, index: true },
  transactionDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

feePaymentTransactionSchema.index({ schoolId: 1, studentId: 1 });
feePaymentTransactionSchema.index({ schoolId: 1, feeId: 1 });
feePaymentTransactionSchema.index({ schoolId: 1, transactionDate: -1 });

module.exports = mongoose.model('FeePaymentTransaction', feePaymentTransactionSchema);

