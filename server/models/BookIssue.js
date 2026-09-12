const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  bookId: { type: String, required: true },
  bookTitle: { type: String, required: true },
  accessionNo: { type: String, required: true },
  borrowerType: { type: String, enum: ['student', 'staff'], required: true },
  borrowerId: { type: String, required: true },
  borrowerName: { type: String, required: true },
  borrowerContact: { type: String, default: '' },
  issueDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  dueDate: { type: String, required: true },
  returnDate: { type: String, default: null },
  fineAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Issued', 'Returned', 'Lost'], default: 'Issued' }
}, {
  timestamps: true
});

bookIssueSchema.index({ schoolId: 1, status: 1 });
bookIssueSchema.index({ schoolId: 1, borrowerId: 1 });

module.exports = mongoose.model('BookIssue', bookIssueSchema);

