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
  },
  holisticEvaluation: {
    selfAssessment: {
      strengths: { type: String, default: 'तार्किक चिंतन, चित्रकला एवं नियमित स्वाध्याय' },
      interests: { type: String, default: 'विज्ञान प्रयोग, गणितीय पहेलियाँ, खेलकूद' },
      myGoals: { type: String, default: 'गणित में गति बढ़ाना व संस्कृत श्लोक कंठस्थ करना' },
      learningEnjoyment: { type: String, default: 'समूह गतिविधि एवं प्रायोगिक कार्य' }
    },
    peerAssessment: {
      peerName: { type: String, default: 'सहपाठी' },
      collaborationGrade: { type: String, default: 'A+' },
      empathyAndRespect: { type: String, default: 'मित्रों की सहायता, विनम्रता एवं निष्पक्षता' },
      teamworkRemarks: { type: String, default: 'समूह कार्य में सक्रिय सहयोग एवं प्रोत्साहन' }
    },
    parentObservation: {
      homeDiscipline: { type: String, default: 'प्रातः जागरण, वंदना एवं नियमित समय सारिणी' },
      curiosityAndReading: { type: String, default: 'पुस्तकालय पुस्तकों में रुचि एवं नए प्रश्न पूछना' },
      parentRemarks: { type: String, default: 'संस्कारवान आचरण, घर पर स्वाध्याय में स्वावलंबन' }
    },
    twentyFirstCenturySkills: {
      criticalThinking: {
        grade: { type: String, default: 'A+' },
        descriptor: { type: String, default: 'तथ्यों का विश्लेषण एवं स्वतंत्र विचार' }
      },
      problemSolving: {
        grade: { type: String, default: 'A+' },
        descriptor: { type: String, default: 'कठिन समस्याओं में धैर्य एवं वैकल्पिक समाधान' }
      },
      creativity: {
        grade: { type: String, default: 'O' },
        descriptor: { type: String, default: 'कला, हस्तशिल्प एवं मौलिक अभिव्यक्ति' }
      },
      communication: {
        grade: { type: String, default: 'A+' },
        descriptor: { type: String, default: 'स्पष्ट, आत्मविश्वासपूर्ण एवं प्रभावी संवाद' }
      },
      digitalAwareness: {
        grade: { type: String, default: 'A' },
        descriptor: { type: String, default: 'कंप्यूटर प्रयोग एवं वैज्ञानिक दृष्टिकोण' }
      }
    }
  }
}, {
  timestamps: true
});

reportCardSchema.index({ schoolId: 1, studentId: 1 });
reportCardSchema.index({ schoolId: 1, examTerm: 1, academicYear: 1 });

module.exports = mongoose.model('ReportCard', reportCardSchema);

