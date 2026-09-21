const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Acharya', 'Didi'], default: 'Acharya' },
  designation: { type: String, required: true },
  qualification: { type: String, default: '' },
  subjects: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  monthlySalary: { type: Number, required: true, default: 25000 },
  basicPay: { type: Number, default: 18000 },
  daHra: { type: Number, default: 7000 },
  pfDeduction: { type: Number, default: 1800 },
  samitiDeduction: { type: Number, default: 500 },
  joiningDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  pin: { type: String, default: () => Math.floor(1000 + Math.random() * 9000).toString() },
  assignedClasses: [{ type: String }],
  status: { type: String, enum: ['Active', 'OnLeave', 'Resigned'], default: 'Active' }
}, {
  timestamps: true
});

staffSchema.index({ schoolId: 1, status: 1 });
staffSchema.index({ schoolId: 1, designation: 1 });
staffSchema.index({ schoolId: 1, phone: 1 });
staffSchema.index({ phone: 1 });

module.exports = mongoose.model('Staff', staffSchema);

