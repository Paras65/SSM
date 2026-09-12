const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  actorType: { type: String, enum: ['admin', 'teacher', 'student', 'system'], default: 'admin' },
  actorId: { type: String, default: '' },
  actorName: { type: String, default: 'व्यवस्थापक' },
  action: { type: String, required: true }, // e.g. 'EXAM_MARKS_ENTERED', 'LEAVE_APPROVED', 'BOOK_ISSUED', etc.
  description: { type: String, required: true },
  ip: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

auditLogSchema.index({ schoolId: 1, createdAt: -1 });
auditLogSchema.index({ schoolId: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

