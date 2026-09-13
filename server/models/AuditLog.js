const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  actorType: { type: String, enum: ['admin', 'teacher', 'student', 'system', 'developer'], default: 'admin' },
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
// TTL index: automatically remove logs older than 180 days to stay within Atlas M0 512MB limit
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

