const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  studentId: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave'], default: 'Present' }
}, {
  timestamps: true
});

attendanceSchema.index({ schoolId: 1, studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ schoolId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

