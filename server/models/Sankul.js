const mongoose = require('mongoose');

const sankulSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, unique: true, index: true },
  prant: { type: String, default: 'गोरक्ष प्रांत' },
  passcode: { type: String, required: true },
  inchargeName: { type: String, default: '' },
  inchargeContact: { type: String, default: '' },
  assignedSchools: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sankul', sankulSchema);

