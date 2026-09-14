import type { Student, FeeRecord, AttendanceRecord, ReportCard, Notice, AttendanceStatus } from '../types';

export function generateRichDemoData(schoolId: string, schoolCity: string) {
  const city = schoolCity || 'गोरखपुर';
  const today = new Date().toISOString().split('T')[0];

  const students: Student[] = [
    {
      id: `${schoolId}-std-01`,
      rollNo: '101',
      name: 'भैया आर्यन शर्मा',
      gender: 'Bhaiya',
      class: 'Class 8',
      section: 'A',
      fatherName: 'श्री राजेश शर्मा',
      motherName: 'श्रीमती सुनीता शर्मा',
      contact: '+91 98765 43210',
      address: `शास्त्री नगर, ${city}`,
      dob: '2012-04-15',
      admissionDate: '2018-07-02',
      bloodGroup: 'B+'
    },
    {
      id: `${schoolId}-std-02`,
      rollNo: '102',
      name: 'बहिन अनन्या वर्मा',
      gender: 'Bahin',
      class: 'Class 8',
      section: 'A',
      fatherName: 'श्री मनोज वर्मा',
      motherName: 'श्रीमती रेखा वर्मा',
      contact: '+91 98234 56789',
      address: `रेलवे कॉलोनी रोड, ${city}`,
      dob: '2012-09-21',
      admissionDate: '2018-07-03',
      bloodGroup: 'O+'
    },
    {
      id: `${schoolId}-std-03`,
      rollNo: '103',
      name: 'भैया देवांश मिश्र',
      gender: 'Bhaiya',
      class: 'Class 9',
      section: 'A',
      fatherName: 'श्री वेद प्रकाश मिश्र',
      motherName: 'श्रीमती शारदा मिश्र',
      contact: '+91 94150 11223',
      address: `सिविल लाइंस, ${city}`,
      dob: '2011-01-10',
      admissionDate: '2017-06-25',
      bloodGroup: 'A+'
    },
    {
      id: `${schoolId}-std-04`,
      rollNo: '104',
      name: 'बहिन प्रिया पाण्डेय',
      gender: 'Bahin',
      class: 'Class 7',
      section: 'A',
      fatherName: 'श्री आनन्द पाण्डेय',
      motherName: 'श्रीमती गायत्री पाण्डेय',
      contact: '+91 99887 76655',
      address: `गोलघर, ${city}`,
      dob: '2013-05-18',
      admissionDate: '2019-07-01',
      bloodGroup: 'AB+'
    },
    {
      id: `${schoolId}-std-05`,
      rollNo: '105',
      name: 'भैया हर्षवर्धन सिंह',
      gender: 'Bhaiya',
      class: 'Class 10',
      section: 'A',
      fatherName: 'श्री रणधीर सिंह',
      motherName: 'श्रीमती प्रतिभा सिंह',
      contact: '+91 97654 32109',
      address: `विकास नगर, ${city}`,
      dob: '2010-11-05',
      admissionDate: '2016-07-10',
      bloodGroup: 'B+'
    },
    {
      id: `${schoolId}-std-06`,
      rollNo: '106',
      name: 'बहिन गार्गी त्रिपाठी',
      gender: 'Bahin',
      class: 'Class 6',
      section: 'A',
      fatherName: 'श्री अच्युतानंद त्रिपाठी',
      motherName: 'श्रीमती मीरा त्रिपाठी',
      contact: '+91 96543 21098',
      address: `मोहाद्दीपुर, ${city}`,
      dob: '2014-08-12',
      admissionDate: '2020-06-28',
      bloodGroup: 'O+'
    },
    {
      id: `${schoolId}-std-07`,
      rollNo: '107',
      name: 'भैया शिवम गुप्ता',
      gender: 'Bhaiya',
      class: 'Prabhat (Prep)',
      section: 'A',
      fatherName: 'श्री सुरेश गुप्ता',
      motherName: 'श्रीमती कविता गुप्ता',
      contact: '+91 95432 10987',
      address: `गीता वाटिका, ${city}`,
      dob: '2019-03-25',
      admissionDate: '2023-04-10',
      bloodGroup: 'A+'
    },
    {
      id: `${schoolId}-std-08`,
      rollNo: '108',
      name: 'बहिन तन्वी शुक्ला',
      gender: 'Bahin',
      class: 'Class 5',
      section: 'A',
      fatherName: 'श्री रमन शुक्ला',
      motherName: 'श्रीमती पूजा शुक्ला',
      contact: '+91 94321 09876',
      address: `तारामंडल एन्क्लेव, ${city}`,
      dob: '2015-06-30',
      admissionDate: '2021-07-15',
      bloodGroup: 'B+'
    },
    {
      id: `${schoolId}-std-09`,
      rollNo: '109',
      name: 'भैया रुद्राक्ष दीक्षित',
      gender: 'Bhaiya',
      class: 'Class 6',
      section: 'A',
      fatherName: 'श्री आलोक दीक्षित',
      motherName: 'श्रीमती माधुरी दीक्षित',
      contact: '+91 93210 98765',
      address: `सूर्यकुंड धाम, ${city}`,
      dob: '2014-02-14',
      admissionDate: '2020-07-10',
      bloodGroup: 'O+'
    },
    {
      id: `${schoolId}-std-10`,
      rollNo: '110',
      name: 'बहिन सौम्या श्रीवास्तव',
      gender: 'Bahin',
      class: 'Class 9',
      section: 'A',
      fatherName: 'श्री दीपक श्रीवास्तव',
      motherName: 'श्रीमती वंदना श्रीवास्तव',
      contact: '+91 92109 87654',
      address: `बशारतपुर, ${city}`,
      dob: '2011-07-08',
      admissionDate: '2017-07-05',
      bloodGroup: 'AB+'
    },
    {
      id: `${schoolId}-std-11`,
      rollNo: '111',
      name: 'भैया चिन्मय उपाध्याय',
      gender: 'Bhaiya',
      class: 'Arun (Nursery)',
      section: 'A',
      fatherName: 'श्री गिरिजेश उपाध्याय',
      motherName: 'श्रीमती सीमा उपाध्याय',
      contact: '+91 91098 76543',
      address: `धर्मशाला बाजार, ${city}`,
      dob: '2021-12-01',
      admissionDate: '2025-04-01',
      bloodGroup: 'A+'
    },
    {
      id: `${schoolId}-std-12`,
      rollNo: '112',
      name: 'बहिन वैष्णवी द्विवेदी',
      gender: 'Bahin',
      class: 'Uday (LKG)',
      section: 'A',
      fatherName: 'श्री पंकज द्विवेदी',
      motherName: 'श्रीमती रश्मि द्विवेदी',
      contact: '+91 90987 65432',
      address: `राप्ती नगर, ${city}`,
      dob: '2020-05-19',
      admissionDate: '2024-04-05',
      bloodGroup: 'B+'
    }
  ];

  const attendanceRecords: AttendanceRecord[] = students.map((s, idx) => {
    let status: AttendanceStatus = 'Present';
    if (idx === 3 || idx === 8) status = 'Absent';
    if (idx === 6) status = 'Leave';
    return {
      id: `${schoolId}-att-${idx + 1}`,
      studentId: s.id,
      date: today,
      status
    };
  });

  const feeRecords: FeeRecord[] = students.map((s, idx) => {
    const isPaid = idx % 3 !== 0;
    const totalAmount = 1200;
    const paidAmount = isPaid ? 1200 : 0;
    return {
      id: `${schoolId}-fee-${idx + 1}`,
      schoolId,
      studentId: s.id,
      term: 'मार्च 2026',
      academicYear: '2025-26',
      totalAmount,
      paidAmount,
      status: isPaid ? 'Paid' : 'Pending',
      paidDate: isPaid ? '2026-03-05' : undefined,
      receiptNo: isPaid ? `SSM/${city.substring(0, 3).toUpperCase()}/2026/${1000 + idx}` : undefined,
      paymentMode: isPaid ? (idx % 2 === 0 ? 'UPI / डिजिटल' : 'नकद (Cash)') : undefined
    };
  });

  const reportCards: ReportCard[] = students.map((s, idx) => {
    const baseMark = 80 + (idx % 15);
    const marks = [
      { subject: 'हिन्दी', maxMarks: 100, marksObtained: Math.min(100, baseMark + 5), grade: 'A1' },
      { subject: 'अंग्रेज़ी', maxMarks: 100, marksObtained: Math.min(100, baseMark - 4), grade: 'A2' },
      { subject: 'गणित', maxMarks: 100, marksObtained: Math.min(100, baseMark + 8), grade: 'A1' },
      { subject: 'विज्ञान', maxMarks: 100, marksObtained: Math.min(100, baseMark + 2), grade: 'A1' },
      { subject: 'सामाजिक विज्ञान', maxMarks: 100, marksObtained: Math.min(100, baseMark - 2), grade: 'A2' },
      { subject: 'संस्कृत', maxMarks: 100, marksObtained: Math.min(100, baseMark + 6), grade: 'A1' },
      { subject: 'कम्प्यूटर', maxMarks: 100, marksObtained: Math.min(100, baseMark + 10), grade: 'A1' }
    ];
    const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const percentage = Math.round((totalObtained / totalMax) * 100);
    const grade = percentage >= 90 ? 'A+' : percentage >= 75 ? 'A' : 'B+';

    return {
      id: `${schoolId}-rep-${idx + 1}`,
      schoolId,
      studentId: s.id,
      examTerm: 'वार्षिक परीक्षा (Annual Exam)',
      academicYear: '2025-26',
      marks,
      totalMax,
      totalObtained,
      percentage,
      grade,
      attendancePercentage: 92 + (idx % 8),
      moralConduct: 'श्रेष्ठ',
      panchmukhiEvaluation: {
        sharirik: { grade: 'A+', skills: 'योगासन, सूर्यनमस्कार, दौड़', remarks: 'उत्कृष्ट शारीरिक सौष्ठव व योगाभ्यास' },
        yog: { grade: 'A+', skills: 'प्राणायाम, ध्यान, एकाग्रता', remarks: 'प्राणायाम व सूर्यनमस्कार में निपुण' },
        sangeet: { grade: 'A', skills: 'सरस्वती वंदना, ताल-लय', remarks: 'सरस्वती वंदना व राष्ट्रगान गायन उत्तम' },
        sanskrit: { grade: 'A+', skills: 'श्लोकोच्चारण, सरल सम्भाषण', remarks: 'श्लोकोच्चारण व सरल सम्भाषण श्रेष्ठ' },
        naitik: { grade: 'A+', skills: 'सदाचार, शिष्टाचार, अनुशासन', remarks: 'सदाचारी, माता-पिता व गुरुजनों का आदर' }
      },
      acharyaRemarks: 'अत्यंत संस्कारवान एवं मेधावी छात्र। विद्या भारती की परंपराओं का उत्कृष्ट पालन।'
    };
  });

  const notices: Notice[] = [
    {
      id: `${schoolId}-not-01`,
      title: 'सत्र 2026-27 नवीन प्रवेश प्रारंभ (Admissions Open: अरुण से 10वीं)',
      category: 'Academics',
      date: today,
      content: `सत्र 2026-27 हेतु शिशु वाटिका (अरुण, उदय, प्रभात) एवं कक्षा 1 से 10वीं तक नवीन प्रवेश प्रारंभ हो चुके हैं। विवरण पुस्तिका एवं प्रवेश फॉर्म विद्यालय कार्यालय तथा ऑनलाइन पोर्टल पर उपलब्ध हैं।`,
      isUrgent: true
    },
    {
      id: `${schoolId}-not-02`,
      title: 'वार्षिक परीक्षा परिणाम एवं प्रगति पत्र वितरण (Annual Result Day)',
      category: 'Examinations',
      date: today,
      content: `सत्र 2025-26 का वार्षिक परीक्षा परिणाम घोषित हो चुका है। अभिभावक महोदय अपने पाल्य का NEP 2020 समग्र प्रगति पत्र छात्र पोर्टल से देख सकते हैं।`,
      isUrgent: true
    },
    {
      id: `${schoolId}-not-03`,
      title: 'अखिल भारतीय विज्ञान मेला एवं वैदिक गणित प्रदर्शनी',
      category: 'Vidya Bharati',
      date: today,
      content: `विद्यालय प्रांगण में प्रांतीय विज्ञान एवं वैदिक गणित मेले का भव्य आयोजन किया जा रहा है। समस्त अभिभावक एवं पूर्व छात्र सादर आमंत्रित हैं।`,
      isUrgent: false
    }
  ];

  return {
    students,
    attendanceRecords,
    feeRecords,
    reportCards,
    notices
  };
}
