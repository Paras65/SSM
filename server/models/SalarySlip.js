const mongoose = require('mongoose');

const salarySlipSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  staffId: { type: String, required: true, index: true },
  staffName: { type: String, required: true },
  designation: { type: String, required: true },
  month: { type: String, required: true },
  academicYear: { type: String, default: '2025-26' },
  basicPay: { type: Number, required: true },
  daHra: { type: Number, default: 0 },
  grossPay: { type: Number, required: true },
  pfDeduction: { type: Number, default: 0 },
  samitiDeduction: { type: Number, default: 0 },
  lopDays: { type: Number, default: 0 },
  lopDeduction: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Generated', 'Disbursed', 'Hold'], default: 'Disbursed' },
  paymentMode: { type: String, default: 'Bank Transfer (NEFT/RTGS)' },
  disbursedDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

salarySlipSchema.index({ schoolId: 1, staffId: 1, month: 1 }, { unique: true });
salarySlipSchema.index({ schoolId: 1, month: 1 });
salarySlipSchema.index({ schoolId: 1, createdAt: -1 });

module.exports = mongoose.model('SalarySlip', salarySlipSchema);

