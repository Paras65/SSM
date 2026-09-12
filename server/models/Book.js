const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  accessionNo: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, default: 'विद्या भारती प्रकाशन' },
  category: { 
    type: String, 
    enum: ['संस्कार व महापुरुष', 'गीता व उपनिषद', 'संस्कृत साहित्य', 'विज्ञान व गणित', 'हिंदी साहित्य', 'सामान्य ज्ञान', 'अन्य'],
    default: 'संस्कार व महापुरुष'
  },
  totalCopies: { type: Number, default: 5 },
  availableCopies: { type: Number, default: 5 },
  shelfLocation: { type: String, default: 'रैक A-1' }
}, {
  timestamps: true
});

bookSchema.index({ schoolId: 1, accessionNo: 1 }, { unique: true });
bookSchema.index({ schoolId: 1, title: 1 });

module.exports = mongoose.model('Book', bookSchema);

