const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  hindiName: { type: String, required: true },
  tagline: { type: String, default: 'सा विद्या या विमुक्तये' },
  affiliate: { type: String, default: 'विद्या भारती अखिल भारतीय शिक्षा संस्थान द्वारा संबद्ध' },
  affiliationNo: { type: String, default: 'VB-SSM-1952-01' },
  established: { type: String, default: '1952' },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  prant: { type: String, required: true }, // e.g. गोरक्ष प्रांत, दिल्ली प्रांत, काशी प्रांत
  udiseCode: { type: String, default: '09510100101' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  timings: { type: String, default: 'प्रातः 7:30 बजे से दोपहर 1:30 बजे तक (सोम-शनि)' },
  principalName: { type: String, required: true },
  adminPasscode: { type: String, default: '1952' },
  currentAcademicYear: { type: String, default: '2025-26' },
  tokenVersion: { type: Number, default: 1 },
  plan: { type: String, enum: ['free', 'academic', 'pro'], default: 'free' },
  status: { type: String, enum: ['active', 'suspended', 'discontinued'], default: 'active', index: true },
  discontinuedAt: { type: Date },
  discontinuationReason: { type: String, default: '' },
  features: {
    enableDynamicUpi: { type: Boolean, default: false },
    upiVpa: { type: String, default: '' },
    upiPayeeName: { type: String, default: '' },
    enableStaffAttendanceLop: { type: Boolean, default: false },
    lopDeductionRate: { type: Number, default: 1 },
    enableAuditLogging: { type: Boolean, default: false },
    enableEmailReceipts: { type: Boolean, default: false }
  },
  youtubeChannelUrl: { type: String, default: '' },
  mediaVideos: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    category: { type: String, default: 'वार्षिकोत्सव' },
    description: { type: String, default: '' },
    date: { type: String, default: '' },
    featured: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('School', schoolSchema);

