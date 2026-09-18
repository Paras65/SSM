const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  pin: { type: String, default: '1234' },
  email: { type: String, default: '' },
  linkedStudentIds: [{ type: String, ref: 'Student' }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

parentSchema.index({ schoolId: 1, phone: 1 });

module.exports = mongoose.model('Parent', parentSchema);

