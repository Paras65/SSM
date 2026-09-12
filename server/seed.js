const School = require('./models/School');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Fee = require('./models/Fee');
const ReportCard = require('./models/ReportCard');
const Notice = require('./models/Notice');
const Homework = require('./models/Homework');
const Staff = require('./models/Staff');

const INITIAL_SCHOOLS = [
  {
    id: 'ssm-gorakhpur',
    name: 'Saraswati Shishu Mandir Senior Secondary School, Gorakhpur',
    hindiName: 'सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय, गोरखपुर',
    tagline: 'सा विद्या या विमुक्तये (That is knowledge which liberates)',
    affiliate: 'सम्बद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान एवं CBSE',
    affiliationNo: 'VB-UP-1952-001',
    established: '1952',
    address: 'विद्या भारती मार्ग, सिविल लाइंस, गोरखपुर, उत्तर प्रदेश - 273001',
    city: 'गोरखपुर',
    state: 'उत्तर प्रदेश',
    prant: 'गोरक्ष प्रांत',
    phone: '+91 551 2345678',
    email: 'gorakhpur@ssm.edu.in',
    timings: 'प्रातः 7:30 बजे से दोपहर 1:30 बजे तक (सोम-शनि)',
    principalName: 'आचार्य राम नारायण शुक्ला',
    adminPasscode: '1952',
    plan: 'pro'
  },
  {
    id: 'ssm-delhi',
    name: 'Saraswati Bal Mandir, Keshav Kunj, New Delhi',
    hindiName: 'सरस्वती बाल मंदिर, केशव कुंज, नई दिल्ली',
    tagline: 'संस्कार युक्त शिक्षा, राष्ट्र समर्पित जीवन',
    affiliate: 'सम्बद्ध: विद्या भारती दिल्ली प्रांत एवं CBSE',
    affiliationNo: 'VB-DL-1965-014',
    established: '1965',
    address: 'झंडेवालान, केशव कुंज, देशबंधु गुप्ता मार्ग, नई दिल्ली - 110055',
    city: 'नई दिल्ली',
    state: 'दिल्ली',
    prant: 'दिल्ली प्रांत',
    phone: '+91 11 23556789',
    email: 'delhi@ssm.edu.in',
    timings: 'प्रातः 8:00 बजे से दोपहर 2:00 बजे तक (सोम-शनि)',
    principalName: 'आचार्य देवेन्द्र कुमार शास्त्री',
    adminPasscode: '1965',
    plan: 'free'
  },
  {
    id: 'ssm-varanasi',
    name: 'Saraswati Vidya Mandir, Kashi, Varanasi',
    hindiName: 'सरस्वती विद्या मंदिर, काशी, वाराणसी',
    tagline: 'विद्या ददाति विनयं, विनयाद्याति पात्रताम्',
    affiliate: 'सम्बद्ध: विद्या भारती काशी प्रांत',
    affiliationNo: 'VB-UP-1972-028',
    established: '1972',
    address: 'कबीर चौरा, काशी हिंदू विश्वविद्यालय मार्ग, वाराणसी, उत्तर प्रदेश - 221001',
    city: 'वाराणसी',
    state: 'उत्तर प्रदेश',
    prant: 'काशी प्रांत',
    phone: '+91 542 2233445',
    email: 'kashi@ssm.edu.in',
    timings: 'प्रातः 7:45 बजे से दोपहर 1:45 बजे तक (सोम-शनि)',
    principalName: 'आचार्य विष्णु दत्त त्रिपाठी',
    adminPasscode: '1972',
    plan: 'free'
  }
];

const INITIAL_STUDENTS = [
  {
    id: 'ssm-001',
    rollNo: '101',
    name: 'Bhaiya Aryan Sharma',
    gender: 'Bhaiya',
    class: 'Class 8',
    section: 'A',
    fatherName: 'Shri Rajesh Sharma',
    motherName: 'Smt. Sunita Sharma',
    contact: '+91 98765 43210',
    address: 'Sector 4, Shastri Nagar, Gorakhpur',
    dob: '2012-04-15',
    admissionDate: '2018-07-02',
    bloodGroup: 'B+'
  },
  {
    id: 'ssm-002',
    rollNo: '102',
    name: 'Bahin Ananya Verma',
    gender: 'Bahin',
    class: 'Class 8',
    section: 'A',
    fatherName: 'Shri Manoj Verma',
    motherName: 'Smt. Rekha Verma',
    contact: '+91 98234 56789',
    address: 'Railway Colony Road, Gorakhpur',
    dob: '2012-09-21',
    admissionDate: '2018-07-03',
    bloodGroup: 'O+'
  },
  {
    id: 'ssm-003',
    rollNo: '103',
    name: 'Bhaiya Devansh Mishra',
    gender: 'Bhaiya',
    class: 'Class 9',
    section: 'A',
    fatherName: 'Shri Ved Prakash Mishra',
    motherName: 'Smt. Sharda Mishra',
    contact: '+91 94150 11223',
    address: 'Civil Lines, Near Mandir, Gorakhpur',
    dob: '2011-01-10',
    admissionDate: '2017-06-25',
    bloodGroup: 'A+'
  },
  {
    id: 'ssm-004',
    rollNo: '104',
    name: 'Bahin Priya Pandey',
    gender: 'Bahin',
    class: 'Class 7',
    section: 'B',
    fatherName: 'Shri Anand Pandey',
    motherName: 'Smt. Gayatri Pandey',
    contact: '+91 99887 76655',
    address: 'Golghar Main Market, Gorakhpur',
    dob: '2013-05-18',
    admissionDate: '2019-07-01',
    bloodGroup: 'AB+'
  },
  {
    id: 'ssm-005',
    rollNo: '105',
    name: 'Bhaiya Harshvardhan Singh',
    gender: 'Bhaiya',
    class: 'Class 10',
    section: 'A',
    fatherName: 'Shri Ranveer Singh',
    motherName: 'Smt. Pratibha Singh',
    contact: '+91 97654 32109',
    address: 'Vikas Nagar, Road No 3, Gorakhpur',
    dob: '2010-11-05',
    admissionDate: '2016-07-10',
    bloodGroup: 'B+'
  },
  {
    id: 'ssm-006',
    rollNo: '106',
    name: 'Bahin Gargi Tripathi',
    gender: 'Bahin',
    class: 'Class 5',
    section: 'A',
    fatherName: 'Shri Achyutanand Tripathi',
    motherName: 'Smt. Meera Tripathi',
    contact: '+91 96543 21098',
    address: 'Mohaddipur, Gorakhpur',
    dob: '2015-08-12',
    admissionDate: '2021-06-28',
    bloodGroup: 'O-'
  },
  {
    id: 'ssm-007',
    rollNo: '107',
    name: 'Bhaiya Shivam Gupta',
    gender: 'Bhaiya',
    class: 'Prabhat (Prep)',
    section: 'A',
    fatherName: 'Shri Suresh Gupta',
    motherName: 'Smt. Kavita Gupta',
    contact: '+91 95432 10987',
    address: 'Geeta Vatika, Gorakhpur',
    dob: '2019-03-25',
    admissionDate: '2023-04-10',
    bloodGroup: 'A+'
  },
  {
    id: 'ssm-008',
    rollNo: '108',
    name: 'Bahin Tanvi Shukla',
    gender: 'Bahin',
    class: 'Class 6',
    section: 'A',
    fatherName: 'Shri Raman Shukla',
    motherName: 'Smt. Pooja Shukla',
    contact: '+91 94321 09876',
    address: 'Taramandal Enclave, Gorakhpur',
    dob: '2014-06-30',
    admissionDate: '2020-07-15',
    bloodGroup: 'B+'
  }
];

const INITIAL_FEES = [
  {
    id: 'fee-001',
    studentId: 'ssm-001',
    term: 'Quarter 1 (Apr - Jun)',
    academicYear: '2025-26',
    totalAmount: 4500,
    paidAmount: 4500,
    status: 'Paid',
    paidDate: '2025-04-10',
    receiptNo: 'SSM-REC-2025-0142',
    paymentMode: 'Online UPI'
  },
  {
    id: 'fee-002',
    studentId: 'ssm-002',
    term: 'Quarter 1 (Apr - Jun)',
    academicYear: '2025-26',
    totalAmount: 4500,
    paidAmount: 4500,
    status: 'Paid',
    paidDate: '2025-04-12',
    receiptNo: 'SSM-REC-2025-0148',
    paymentMode: 'Cash at Counter'
  },
  {
    id: 'fee-003',
    studentId: 'ssm-003',
    term: 'Quarter 1 (Apr - Jun)',
    academicYear: '2025-26',
    totalAmount: 5200,
    paidAmount: 2500,
    status: 'Partial',
    paidDate: '2025-04-15',
    receiptNo: 'SSM-REC-2025-0160',
    paymentMode: 'Net Banking'
  },
  {
    id: 'fee-004',
    studentId: 'ssm-004',
    term: 'Quarter 1 (Apr - Jun)',
    academicYear: '2025-26',
    totalAmount: 4200,
    paidAmount: 0,
    status: 'Pending'
  },
  {
    id: 'fee-005',
    studentId: 'ssm-005',
    term: 'Quarter 1 (Apr - Jun)',
    academicYear: '2025-26',
    totalAmount: 5500,
    paidAmount: 5500,
    status: 'Paid',
    paidDate: '2025-04-08',
    receiptNo: 'SSM-REC-2025-0099',
    paymentMode: 'Online UPI'
  },
  {
    id: 'fee-006',
    studentId: 'ssm-006',
    term: 'Quarter 1 (Apr - Jun)',
    academicYear: '2025-26',
    totalAmount: 3800,
    paidAmount: 3800,
    status: 'Paid',
    paidDate: '2025-04-09',
    receiptNo: 'SSM-REC-2025-0115',
    paymentMode: 'Cheque'
  }
];

const INITIAL_REPORTS = [
  {
    id: 'rep-001',
    studentId: 'ssm-001',
    examTerm: 'Ardhvarshik Pariksha (Mid-Term)',
    academicYear: '2025-26',
    marks: [
      { subject: 'Hindi (हिंदी)', code: 'HIN-01', maxMarks: 100, marksObtained: 88, grade: 'A+' },
      { subject: 'Sanskrit (संस्कृत)', code: 'SAN-02', maxMarks: 100, marksObtained: 94, grade: 'O' },
      { subject: 'English (अंग्रेजी)', code: 'ENG-03', maxMarks: 100, marksObtained: 82, grade: 'A' },
      { subject: 'Ganit / Vedic Maths (गणित)', code: 'MAT-04', maxMarks: 100, marksObtained: 91, grade: 'O' },
      { subject: 'Vigyan (विज्ञान)', code: 'SCI-05', maxMarks: 100, marksObtained: 87, grade: 'A+' },
      { subject: 'Samajik Vigyan (सामाजिक विज्ञान)', code: 'SST-06', maxMarks: 100, marksObtained: 85, grade: 'A' },
      { subject: 'Naitik Shiksha (नैतिक एवं आध्यात्मिक)', code: 'NAI-07', maxMarks: 50, marksObtained: 48, grade: 'O' },
      { subject: 'Sharirik & Yog (शारीरिक एवं योग)', code: 'YOG-08', maxMarks: 50, marksObtained: 47, grade: 'O' }
    ],
    totalMax: 700,
    totalObtained: 622,
    percentage: 88.85,
    grade: 'A+ (उत्कृष्ट)',
    acharyaRemarks: 'भैया आर्यन अध्ययनशील, अनुशासित एवं संस्कृत संभाषण में अत्यंत निपुण हैं। आचरण श्रेष्ठ है।',
    attendancePercentage: 94,
    moralConduct: 'श्रेष्ठ'
  },
  {
    id: 'rep-002',
    studentId: 'ssm-002',
    examTerm: 'Ardhvarshik Pariksha (Mid-Term)',
    academicYear: '2025-26',
    marks: [
      { subject: 'Hindi (हिंदी)', code: 'HIN-01', maxMarks: 100, marksObtained: 92, grade: 'O' },
      { subject: 'Sanskrit (संस्कृत)', code: 'SAN-02', maxMarks: 100, marksObtained: 96, grade: 'O' },
      { subject: 'English (अंग्रेजी)', code: 'ENG-03', maxMarks: 100, marksObtained: 89, grade: 'A+' },
      { subject: 'Ganit / Vedic Maths (गणित)', code: 'MAT-04', maxMarks: 100, marksObtained: 95, grade: 'O' },
      { subject: 'Vigyan (विज्ञान)', code: 'SCI-05', maxMarks: 100, marksObtained: 93, grade: 'O' },
      { subject: 'Samajik Vigyan (सामाजिक विज्ञान)', code: 'SST-06', maxMarks: 100, marksObtained: 90, grade: 'O' },
      { subject: 'Naitik Shiksha (नैतिक एवं आध्यात्मिक)', code: 'NAI-07', maxMarks: 50, marksObtained: 50, grade: 'O' },
      { subject: 'Sharirik & Yog (शारीरिक एवं योग)', code: 'YOG-08', maxMarks: 50, marksObtained: 49, grade: 'O' }
    ],
    totalMax: 700,
    totalObtained: 654,
    percentage: 93.43,
    grade: 'O (सर्वोच्च)',
    acharyaRemarks: 'बहिन अनन्या कक्षा की मेधावी छात्रा हैं। संगीत एवं वंदना संचालन में सक्रिय योगदान रहता है।',
    attendancePercentage: 97,
    moralConduct: 'श्रेष्ठ'
  }
];

const INITIAL_NOTICES = [
  {
    id: 'not-01',
    title: 'Satr 2026-27 Pravesh Prarambh (Admissions Open for Arun, Uday, Prabhat to Class 10)',
    category: 'Academics',
    date: '2026-03-01',
    content: 'Admissions are open for the academic session 2026-27. Prospectus and registration forms are available at the school office and online portal. Special emphasis on values, moral grounding, and academic excellence.',
    isUrgent: true
  },
  {
    id: 'not-02',
    title: 'Varshik Khel-Kood & Ghosh Pratiyogita (Annual Sports Meet)',
    category: 'Events',
    date: '2026-03-18',
    content: 'The school will host the inter-shakha athletics and traditional sports meet featuring Kho-Kho, Kabaddi, Yog demonstrations, and Ghosh march-past. Parents are cordially invited.',
    isUrgent: false
  },
  {
    id: 'not-03',
    title: 'Ardhvarshik Pariksha Phal & Abhibhavak Sammelan (PTM & Report Cards)',
    category: 'Examinations',
    date: '2026-03-25',
    content: 'Report cards (Pragati Patra) for the Mid-Term / Half-Yearly examinations will be distributed during the Abhibhavak Sammelan. All parents/guardians are requested to attend and interact with respective Acharyas.',
    isUrgent: true
  },
  {
    id: 'not-04',
    title: 'Akhil Bharatiya Vigyan evam Ganit Mela (Science & Vedic Maths Fair)',
    category: 'Vidya Bharati',
    date: '2026-04-05',
    content: 'Students who qualified for the regional round will represent our school in the State Science & Vedic Mathematics Fair. Projects on renewable energy and ancient Indian mathematics will be exhibited.',
    isUrgent: false
  }
];

const INITIAL_STAFF = [
  {
    id: 'stf-001',
    schoolId: 'ssm-gorakhpur',
    name: 'श्री रामेश्वर त्रिपाठी',
    gender: 'Acharya',
    designation: 'वरिष्ठ प्रवक्ता (गणित)',
    qualification: 'M.Sc. (Mathematics), B.Ed.',
    subjects: 'गणित, वैदिक गणित',
    phone: '+91 94501 23456',
    email: 'rameshwar.tripathi@ssm.edu.in',
    monthlySalary: 32000,
    basicPay: 22000,
    daHra: 10000,
    pfDeduction: 2200,
    samitiDeduction: 500,
    joiningDate: '2015-07-01',
    status: 'Active'
  },
  {
    id: 'stf-002',
    schoolId: 'ssm-gorakhpur',
    name: 'दीदी सरिता वाजपेयी',
    gender: 'Didi',
    designation: 'प्रवक्ता (संस्कृत एवं हिन्दी)',
    qualification: 'M.A. (Sanskrit), B.Ed.',
    subjects: 'संस्कृत, हिन्दी',
    phone: '+91 94502 34567',
    email: 'sarita.vajpayee@ssm.edu.in',
    monthlySalary: 28000,
    basicPay: 19000,
    daHra: 9000,
    pfDeduction: 1900,
    samitiDeduction: 500,
    joiningDate: '2018-08-10',
    status: 'Active'
  },
  {
    id: 'stf-003',
    schoolId: 'ssm-gorakhpur',
    name: 'श्री अखिलेश कुमार पाण्डेय',
    gender: 'Acharya',
    designation: 'सहायक शिक्षक (विज्ञान एवं कंप्यूटर)',
    qualification: 'M.Sc. (Physics), B.Ed.',
    subjects: 'भौतिक विज्ञान, कंप्यूटर विज्ञान',
    phone: '+91 94503 45678',
    email: 'akhilesh.pandey@ssm.edu.in',
    monthlySalary: 27000,
    basicPay: 18000,
    daHra: 9000,
    pfDeduction: 1800,
    samitiDeduction: 500,
    joiningDate: '2019-07-15',
    status: 'Active'
  },
  {
    id: 'stf-004',
    schoolId: 'ssm-gorakhpur',
    name: 'श्री केशव प्रसाद मिश्र',
    gender: 'Acharya',
    designation: 'शारीरिक एवं योग शिक्षक (प्रमुखाचार्य)',
    qualification: 'B.P.Ed., Yoga Visharad',
    subjects: 'शारीरिक शिक्षा, योग, सूर्य नमस्कार',
    phone: '+91 94504 56789',
    email: 'keshav.mishra@ssm.edu.in',
    monthlySalary: 24000,
    basicPay: 16000,
    daHra: 8000,
    pfDeduction: 1600,
    samitiDeduction: 500,
    joiningDate: '2020-01-10',
    status: 'Active'
  },
  {
    id: 'stf-005',
    schoolId: 'ssm-gorakhpur',
    name: 'दीदी वंदना सिंह',
    gender: 'Didi',
    designation: 'संगीत एवं सांस्कृतिक आचार्या',
    qualification: 'Sangeet Prabhakar, M.A.',
    subjects: 'शास्त्रीय संगीत, वंदना, प्रार्थना',
    phone: '+91 94505 67890',
    email: 'vandana.singh@ssm.edu.in',
    monthlySalary: 22000,
    basicPay: 15000,
    daHra: 7000,
    pfDeduction: 1500,
    samitiDeduction: 500,
    joiningDate: '2021-09-01',
    status: 'Active'
  }
];

const INITIAL_HOMEWORK = [
  {
    id: 'hw-001',
    schoolId: 'ssm-gorakhpur',
    class: 'Class 8',
    section: 'A',
    subject: 'गणित (Mathematics)',
    title: 'अध्याय 4: परिमेय संख्याएँ एवं समीकरण',
    description: 'प्रश्नावली 4.2 के प्रश्न संख्या 1 से 8 तक अभ्यास पुस्तिका में हल करें। प्रत्येक चरण को स्पष्ट लिखें।',
    assignedBy: 'श्री रामेश्वर त्रिपाठी',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'Active'
  },
  {
    id: 'hw-002',
    schoolId: 'ssm-gorakhpur',
    class: 'Class 8',
    section: 'A',
    subject: 'संस्कृत (Sanskrit)',
    title: 'पाठ 3: सुभाषितानि - श्लोक स्मरण एवं अर्थ',
    description: 'श्लोक संख्या 1 से 4 का सस्वर गायन कंठस्थ करें तथा उनका हिन्दी भावार्थ उत्तर पुस्तिका में लिखें।',
    assignedBy: 'दीदी सरिता वाजपेयी',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'Active'
  },
  {
    id: 'hw-003',
    schoolId: 'ssm-gorakhpur',
    class: 'Class 8',
    section: 'A',
    subject: 'विज्ञान (Science)',
    title: 'कोशिका संरचना एवं कार्यप्रणाली',
    description: 'पादप कोशिका एवं जन्तु कोशिका का नामांकित रंगीन चित्र विज्ञान पुस्तिका में बनाएँ।',
    assignedBy: 'श्री अखिलेश कुमार पाण्डेय',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    status: 'Active'
  },
  {
    id: 'hw-004',
    schoolId: 'ssm-gorakhpur',
    class: 'Class 7',
    section: 'A',
    subject: 'हिन्दी (Hindi)',
    title: 'व्याकरण: संधि एवं समास अभ्यास',
    description: 'दीर्घ एवं गुण संधि के 10-10 उदाहरण अपनी व्याकरण कॉपी में लिखिए।',
    assignedBy: 'दीदी सरिता वाजपेयी',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'Active'
  }
];

async function seedDatabase() {
  try {
    const schoolCount = await School.countDocuments();
    if (schoolCount === 0) {
      console.log('🌱 Seeding initial Vidya Bharati schools into MongoDB...');
      await School.insertMany(INITIAL_SCHOOLS);
      console.log(`✅ Seeded ${INITIAL_SCHOOLS.length} school branches.`);
    }

    // Ensure all existing documents have schoolId: 'ssm-gorakhpur'
    await Student.updateMany({ schoolId: { $exists: false } }, { $set: { schoolId: 'ssm-gorakhpur' } });
    await Fee.updateMany({ schoolId: { $exists: false } }, { $set: { schoolId: 'ssm-gorakhpur' } });
    await Attendance.updateMany({ schoolId: { $exists: false } }, { $set: { schoolId: 'ssm-gorakhpur' } });
    await ReportCard.updateMany({ schoolId: { $exists: false } }, { $set: { schoolId: 'ssm-gorakhpur' } });
    await Notice.updateMany({ schoolId: { $exists: false } }, { $set: { schoolId: 'ssm-gorakhpur' } });

    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('🌱 Seeding initial students into MongoDB...');
      await Student.insertMany(INITIAL_STUDENTS);
      console.log(`✅ Seeded ${INITIAL_STUDENTS.length} students.`);
    }

    const feeCount = await Fee.countDocuments();
    if (feeCount === 0) {
      console.log('🌱 Seeding initial fee records into MongoDB...');
      await Fee.insertMany(INITIAL_FEES);
      console.log(`✅ Seeded ${INITIAL_FEES.length} fee records.`);
    }

    const reportCount = await ReportCard.countDocuments();
    if (reportCount === 0) {
      console.log('🌱 Seeding initial report cards into MongoDB...');
      await ReportCard.insertMany(INITIAL_REPORTS);
      console.log(`✅ Seeded ${INITIAL_REPORTS.length} report cards.`);
    }

    const noticeCount = await Notice.countDocuments();
    if (noticeCount === 0) {
      console.log('🌱 Seeding initial notices into MongoDB...');
      await Notice.insertMany(INITIAL_NOTICES);
      console.log(`✅ Seeded ${INITIAL_NOTICES.length} notices.`);
    }

    const today = new Date().toISOString().split('T')[0];
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0) {
      console.log('🌱 Seeding today attendance into MongoDB...');
      const initialAttendance = INITIAL_STUDENTS.map((s, idx) => ({
        id: `att-${idx}-${s.id}`,
        studentId: s.id,
        date: today,
        status: idx === 3 ? 'Absent' : idx === 6 ? 'Leave' : 'Present'
      }));
      await Attendance.insertMany(initialAttendance);
      console.log(`✅ Seeded ${initialAttendance.length} attendance records for ${today}.`);
    }

    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      console.log('🌱 Seeding initial staff/Acharyas into MongoDB...');
      await Staff.insertMany(INITIAL_STAFF);
      console.log(`✅ Seeded ${INITIAL_STAFF.length} staff records.`);
    }

    const homeworkCount = await Homework.countDocuments();
    if (homeworkCount === 0) {
      console.log('🌱 Seeding initial homework into MongoDB...');
      await Homework.insertMany(INITIAL_HOMEWORK);
      console.log(`✅ Seeded ${INITIAL_HOMEWORK.length} homework assignments.`);
    }

    console.log('🎉 MongoDB database ready with Saraswati Shishu Mandir records!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  }
}

module.exports = seedDatabase;

