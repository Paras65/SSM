const mongoose = require('mongoose');

const periodSlotSchema = new mongoose.Schema({
  period: { type: Number, required: true },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  subject: { type: String, required: true },
  teacherName: { type: String, default: '' },
  teacherId: { type: String, default: '' },
  room: { type: String, default: '' }
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true 
  },
  slots: [periodSlotSchema]
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  class: { type: String, required: true },
  section: { type: String, default: 'A' },
  schedule: [dayScheduleSchema]
}, {
  timestamps: true
});

timetableSchema.index({ schoolId: 1, class: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);

