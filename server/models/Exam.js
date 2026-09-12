const mongoose = require('mongoose');

const examScheduleItemSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  date: { type: String, required: true },
  timing: { type: String, default: '09:00 AM - 12:00 PM' },
  maxMarks: { type: Number, default: 100 },
  roomNo: { type: String, default: 'मुख्य भवन' }
}, { _id: false });

const examSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  title: { type: String, required: true },
  academicYear: { type: String, required: true, default: '2025-26' },
  term: { type: String, required: true },
  classes: [{ type: String }],
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  dateSheet: [examScheduleItemSchema],
  status: { type: String, enum: ['Scheduled', 'Ongoing', 'Completed'], default: 'Scheduled' },
  isLocked: { type: Boolean, default: false }
}, {
  timestamps: true
});

examSchema.index({ schoolId: 1, academicYear: 1 });

module.exports = mongoose.model('Exam', examSchema);

