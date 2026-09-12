const mongoose = require('mongoose');

const subjectMarkSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  code: { type: String },
  maxMarks: { type: Number, required: true },
  marksObtained: { type: Number, required: true },
  grade: { type: String, required: true }
}, { _id: false });

const reportCardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, default: 'ssm-gorakhpur', index: true },
  studentId: { type: String, required: true },
  examTerm: { type: String, required: true },
  academicYear: { type: String, required: true },
  marks: [subjectMarkSchema],
  totalMax: { type: Number, required: true },
  totalObtained: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  acharyaRemarks: { type: String, default: '' },
  attendancePercentage: { type: Number, default: 95 },
  moralConduct: { type: String, default: 'श्रेष्ठ' },
  panchmukhiEvaluation: {
    sharirik: {
      grade: { type: String, default: 'A+' },
      skills: { type: String, default: 'दंड, योगासन, खेलकूद' },
      remarks: { type: String, default: 'उत्कृष्ट शारीरिक स्फूर्ति' }
    },
    yog: {
      grade: { type: String, default: 'A+' },
      skills: { type: String, default: 'सूर्य नमस्कार, प्राणायाम, ध्यान' },
      remarks: { type: String, default: 'नियमित अभ्यास एवं एकाग्रता' }
    },
    sangeet: {
      grade: { type: String, default: 'A' },
      skills: { type: String, default: 'वंदना गायन, घोष वादन, ताल' },
      remarks: { type: String, default: 'मधुर कंठ एवं लयबद्धता' }
    },
    sanskrit: {
      grade: { type: String, default: 'O' },
      skills: { type: String, default: 'श्लोक कंठस्थीकरण, सरल संभाषण' },
      remarks: { type: String, default: 'शुद्ध उच्चारण व ज्ञान' }
    },
    naitik: {
      grade: { type: String, default: 'O' },
      skills: { type: String, default: 'मातृ-पितृ भक्ति, अनुशासन, सेवाभाव' },
      remarks: { type: String, default: 'आदर्श संस्कारयुक्त व्यवहार' }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReportCard', reportCardSchema);

