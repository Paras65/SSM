const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  regNo: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  gender: { type: String, enum: ['Bhaiya', 'Bahin'], default: 'Bhaiya' },
  applyingClass: { type: String, required: true },
  fatherName: { type: String },
  motherName: { type: String },
  phone: { type: String, required: true },
  address: { type: String },
  guardianConsent: { type: Boolean, required: true },
  consentTimestamp: { type: Date, required: true },
  consentPolicyVersion: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Admitted'], default: 'Pending' },
  submissionDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

admissionSchema.index({ schoolId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Admission', admissionSchema);

