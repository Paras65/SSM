const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  studentId: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Present' },
  academicYear: { type: String, index: true },
  class: { type: String, index: true }
}, {
  timestamps: true
});

attendanceSchema.index({ schoolId: 1, studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ schoolId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, academicYear: 1, class: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

