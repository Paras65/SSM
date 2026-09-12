const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  studentId: { type: String, required: true },
  term: { type: String, required: true },
  academicYear: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Paid', 'Pending', 'Partial'], default: 'Pending' },
  paidDate: { type: String },
  receiptNo: { type: String },
  paymentMode: { type: String }
}, {
  timestamps: true
});

feeSchema.index({ schoolId: 1, createdAt: -1 });
feeSchema.index({ schoolId: 1, studentId: 1 });
feeSchema.index({ schoolId: 1, status: 1 });

module.exports = mongoose.model('Fee', feeSchema);

