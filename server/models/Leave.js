const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  applicantType: { type: String, enum: ['student', 'staff'], required: true },
  applicantId: { type: String, required: true },
  applicantName: { type: String, required: true },
  classOrDesignation: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  appliedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  reviewedBy: { type: String, default: '' },
  reviewerRemarks: { type: String, default: '' }
}, {
  timestamps: true
});

leaveSchema.index({ schoolId: 1, applicantType: 1, status: 1 });
leaveSchema.index({ schoolId: 1, applicantId: 1 });

module.exports = mongoose.model('Leave', leaveSchema);

