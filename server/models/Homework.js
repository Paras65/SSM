const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  class: { type: String, required: true, index: true },
  section: { type: String, default: 'All' },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedBy: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Completed'], default: 'Active' }
}, {
  timestamps: true
});

homeworkSchema.index({ schoolId: 1, class: 1, date: -1 });
homeworkSchema.index({ schoolId: 1, date: -1 });

module.exports = mongoose.model('Homework', homeworkSchema);

