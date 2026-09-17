const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  rollNo: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Bhaiya', 'Bahin'], required: true },
  class: { type: String, required: true },
  section: { type: String, default: 'A' },
  fatherName: { type: String, required: true },
  motherName: { type: String, default: '' },
  contact: { type: String, required: true },
  address: { type: String, default: '' },
  dob: { type: String, default: '' },
  pin: { type: String, default: '' },
  admissionDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  bloodGroup: { type: String, default: 'B+' },
  photoUrl: { type: String, default: '', maxlength: 100000 },
  academicYear: { type: String, default: '2025-26', index: true },
  status: { type: String, enum: ['active', 'promoted', 'alumni', 'transferred'], default: 'active', index: true },
  // Transport assignment
  transportRouteId: { type: String, default: '' },
  transportStop: { type: String, default: '' },
  // UDISE+ & Government of India Student Identifiers
  pen: { type: String, default: '', index: true },
  apaarId: { type: String, default: '' },
  socialCategory: { type: String, enum: ['General', 'OBC', 'SC', 'ST', ''], default: 'General' },
  cwsn: { type: Boolean, default: false },
  bpl: { type: Boolean, default: false },
  udiseStatus: {
    gp: { type: Boolean, default: false },
    ep: { type: Boolean, default: false },
    fp: { type: Boolean, default: false }
  },
  academicHistory: [{
    academicYear: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, default: 'A' },
    rollNo: { type: String, required: true },
    status: { type: String, default: 'promoted' },
    promotedAt: { type: Date, default: Date.now },
    remarks: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

studentSchema.index({ schoolId: 1, class: 1, section: 1 });
studentSchema.index({ schoolId: 1, academicYear: 1, class: 1, section: 1, rollNo: 1 });
studentSchema.index({ schoolId: 1, rollNo: 1 });
studentSchema.index({ schoolId: 1, status: 1 });
studentSchema.index({ schoolId: 1, academicYear: 1 });
studentSchema.index({ schoolId: 1, pen: 1 });

module.exports = mongoose.model('Student', studentSchema);

