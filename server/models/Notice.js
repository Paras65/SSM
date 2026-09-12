const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Academics', 'Events', 'Examinations', 'Holidays', 'Vidya Bharati'],
    default: 'Academics'
  },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  content: { type: String, required: true },
  isUrgent: { type: Boolean, default: false }
}, {
  timestamps: true
});

noticeSchema.index({ schoolId: 1, date: -1 });

module.exports = mongoose.model('Notice', noticeSchema);

