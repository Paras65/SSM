import type { Student, Acharya, Notice, Prayer, PanchmukhiPillar, FeeRecord, ReportCard } from '../types';

export const PANCHMUKHI_PILLARS: PanchmukhiPillar[] = [
  {
    id: 'sharirik',
    title: 'Physical Education',
    hindiTitle: 'शारीरिक शिक्षा',
    sanskritMotto: 'शरीरमाद्यं खलु धर्मसाधनम्',
    description: 'Disciplined physical drill, traditional Indian games (Kho-Kho, Kabaddi), athletics, martial arts, and gymnastics to forge robust strength and agility.',
    activities: ['Ghosh (Band) Training', 'Suryanamaskar Competitions', 'Dand & Niyuddha', 'Khel-Kood Pratiyogita'],
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'yog',
    title: 'Yoga & Pranayama',
    hindiTitle: 'योग शिक्षा',
    sanskritMotto: 'योगः कर्मसु कौशलम्',
    description: 'Cultivating mindfulness, inner balance, respiratory control, and mental endurance through daily asanas, pranayama, and concentration exercises.',
    activities: ['Daily Asanas Routine', 'Pranayama & Anulom-Vilom', 'Trataka & Dhyana (Meditation)', 'International Yoga Day Celebrations'],
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'sangeet',
    title: 'Music & Cultural Arts',
    hindiTitle: 'संगीत शिक्षा',
    sanskritMotto: 'साहित्यसंगीतकला विहीनः साक्षात् पशुः',
    description: 'Nurturing aesthetic sensibility, rhythm, and devotion through vocal classical music, patriotic anthems (Deshbhakti Geet), and traditional instruments.',
    activities: ['Harmonium & Tabla Training', 'Rashtriya Deshbhakti Geet', 'Stotra & Bhajan Recitation', 'Cultural Natak & Drama'],
    color: 'from-rose-500 to-amber-600',
  },
  {
    id: 'sanskrit',
    title: 'Sanskrit & Heritage',
    hindiTitle: 'संस्कृत शिक्षा',
    sanskritMotto: 'संस्कृतं नाम दैवी वागन्वाख्याता महर्षिभिः',
    description: 'Rooting students in India’s ancient linguistic treasure. Daily conversational Sanskrit (Saral Sanskrit Sambhashan) and sacred Vedic shloka recitation.',
    activities: ['Daily Conversational Sanskrit', 'Bhagavad Gita Shloka Spardha', 'Vedic Chanting & Stutis', 'Sanskrit Divas Samaroh'],
    color: 'from-amber-600 to-yellow-600',
  },
  {
    id: 'naitik',
    title: 'Moral & Spiritual Values',
    hindiTitle: 'नैतिक एवं आध्यात्मिक शिक्षा',
    sanskritMotto: 'सा विद्या या विमुक्तये',
    description: 'Fostering deep patriotic devotion (Rashtra Prem), character building, respect for parents and teachers (*Matru-Pitri-Guru Bhakti*), and ethical living.',
    activities: ['Daily Bhojan & Saraswati Vandana', 'Life Stories of Mahapurush (Rana Pratap, Shivaji, Vivekananda)', 'Panchanga Charchaa', 'Matri Sammelan & Seva Projects'],
    color: 'from-orange-600 to-amber-700',
  },
];

export const PRAYERS: Prayer[] = [
  {
    id: 'vandana',
    title: 'Saraswati Vandana',
    subtitle: 'सरस्वती वंदना',
    occasion: 'Morning Assembly (प्रातः स्मरण)',
    sanskrit: `या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता
या वीणावरदण्डमण्डितकरा या श्वेतपद्मासना।
या ब्रह्माच्युतशंकरप्रभृतिभिर्देवैः सदा वन्दिता
सा मां पातु सरस्वती भगवती निःशेषजाड्यापहा॥`,
    hindi: 'जो कुन्द के फूल, चन्द्रमा, बर्फ और मोतियों के हार जैसी श्वेत हैं; जिन्होंने श्वेत वस्त्र धारण किये हैं; जिनके हाथ में वीणा और वरदान देने वाला श्रेष्ठ दण्ड शोभित है; जो श्वेत कमल के आसन पर विराजमान हैं; ब्रह्मा, विष्णु, शंकर आदि देव जिनकी सदा स्तुति करते हैं; वही ज्ञान की देवी भगवती सरस्वती हमारी संपूर्ण अज्ञानता और जड़ता को दूर करें।'
  },
  {
    id: 'bhojan',
    title: 'Bhojan Mantra',
    subtitle: 'भोजन मंत्र',
    occasion: 'Before Lunch (मध्याह्न भोजन से पूर्व)',
    sanskrit: `ॐ सह नाववतु। सह नौ भुनक्तु।
सह वीर्यं करवावहै।
तेजस्वि नावधीतमस्तु मा विद्विषावहै॥
ॐ शान्तिः शान्तिः शान्तिः॥

ब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्।
ब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना॥`,
    hindi: 'परमात्मा हम गुरु और शिष्य दोनों की साथ-साथ रक्षा करें, हम दोनों का साथ-साथ पालन-पोषण करें। हम मिलकर अपार सामर्थ्य अर्जित करें, हमारा पढ़ा हुआ ज्ञान तेजस्वी हो और हम परस्पर कभी द्वेष न करें। यह भोजन ब्रह्म को समर्पित है, ब्रह्म ही आहुति है और ब्रह्म रूपी अग्नि में ब्रह्म द्वारा ही यह आहुति दी जा रही है।'
  },
  {
    id: 'gayatri',
    title: 'Gayatri Mantra',
    subtitle: 'गायत्री महामंत्र',
    occasion: 'Universal Invocation (प्रातः कालीन प्रार्थना)',
    sanskrit: `ॐ भूर्भुवः स्वः।
तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि।
धियो यो नः प्रचोदयात्॥`,
    hindi: 'उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा को हम अपनी अंतरात्मा में धारण करें। वह परमात्मा हमारी बुद्धि को सन्मार्ग की ओर प्रेरित करे।'
  },
  {
    id: 'shanti',
    title: 'Shanti Path',
    subtitle: 'शान्ति पाठ',
    occasion: 'School Dismissal & Auspicious Conclusion (शांति मंत्र)',
    sanskrit: `ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः
पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः।
वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः
सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥
ॐ शान्तिः शान्तिः शान्तिः॥`,
    hindi: 'द्युलोक में शांति हो, अंतरिक्ष में शांति हो, पृथ्वी पर शांति हो, जल में शांति हो, औषधियों और वनस्पतियों में शांति हो, समस्त देवगणों में शांति हो, परब्रह्म में शांति हो, कण-कण में शांति हो। सर्वत्र शांति ही शांति हो और वह शांति मुझे प्राप्त हो।'
  }
];

export const INITIAL_STUDENTS: Student[] = [
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

export const INITIAL_ACHARYAS: Acharya[] = [
  {
    id: 'ach-01',
    name: 'Shri Ram Narayan Shukla',
    title: 'आचार्य जी',
    designation: 'Pradhanacharya (Principal)',
    qualification: 'M.A. (Sanskrit, Hindi), B.Ed, Prabhakar',
    subjects: ['Sanskrit', 'Naitik Shiksha', 'Vedic Mathematics'],
    experience: '24 Years in Vidya Bharati'
  },
  {
    id: 'ach-02',
    name: 'Shrimati Shailaja Dixit',
    title: 'दीदी जी',
    designation: 'Varishtha Didi (Senior Academic Head)',
    qualification: 'M.Sc. (Mathematics), B.Ed',
    subjects: ['Mathematics', 'Vedic Maths'],
    experience: '18 Years'
  },
  {
    id: 'ach-03',
    name: 'Shri Din Dayal Upadhyay',
    title: 'आचार्य जी',
    designation: 'Sharirik & Ghosh Pramukh (Sports Head)',
    qualification: 'B.P.Ed, Yoga Shiromani',
    subjects: ['Sharirik Shiksha', 'Yog', 'Ghosh Band'],
    experience: '12 Years'
  },
  {
    id: 'ach-04',
    name: 'Smt. Vandana Sharma',
    title: 'दीदी जी',
    designation: 'Sangeet & Cultural Head',
    qualification: 'M.Mus. (Vocal & Classical), Sangeet Visharad',
    subjects: ['Sangeet', 'Deshbhakti Geet', 'Harmonium & Tabla'],
    experience: '14 Years'
  },
  {
    id: 'ach-05',
    name: 'Shri Akhilesh Pandey',
    title: 'आचार्य जी',
    designation: 'Vigyan Pramukh (Science & IT Head)',
    qualification: 'M.Sc. (Physics), MCA',
    subjects: ['Science', 'Computer Science & Robotics'],
    experience: '10 Years'
  }
];

export const INITIAL_NOTICES: Notice[] = [
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

export const INITIAL_FEES: FeeRecord[] = [
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

export const INITIAL_REPORT_CARDS: ReportCard[] = [
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
    moralConduct: 'श्रेष्ठ',
    panchmukhiEvaluation: {
      sharirik: {
        grade: 'O',
        skills: 'दंड, नियुद्ध, 100 मी दौड़, संचलन',
        remarks: 'शारीरिक सौष्ठव एवं संचलन में उत्कृष्ट नेतृत्व'
      },
      yog: {
        grade: 'A+',
        skills: 'सूर्य नमस्कार (12 मंत्र सहित), पद्मासन, भ्रामरी',
        remarks: 'दैनिक आसनों में लचीलापन एवं नियमितता'
      },
      sangeet: {
        grade: 'A',
        skills: 'सरस्वती वंदना, एकात्मता स्तोत्र, घोष वंशी वादन',
        remarks: 'प्रार्थना सभा में लयबद्ध वंशी वादन'
      },
      sanskrit: {
        grade: 'O',
        skills: 'गीता अध्याय-12 श्लोक कंठस्थीकरण, सरल संभाषण',
        remarks: 'स्पष्ट एवं शुद्ध उच्चारण, उत्कृष्ट स्मरण शक्ति'
      },
      naitik: {
        grade: 'O',
        skills: 'मातृ-पितृ चरण स्पर्श, परस्पर सहयोग, समयबद्धता',
        remarks: 'आदर्श संस्कारयुक्त आचरण एवं आचार्य आज्ञापालन'
      }
    }
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
    moralConduct: 'श्रेष्ठ',
    panchmukhiEvaluation: {
      sharirik: {
        grade: 'A+',
        skills: 'पारंपरिक खेल (कबड्डी, खो-खो), योगाभ्यास',
        remarks: 'खेल भावना एवं तत्परता सराहनीय'
      },
      yog: {
        grade: 'O',
        skills: 'प्राणायाम (अनुलोम-विलोम), ताड़ासन, वृक्षासन',
        remarks: 'एकाग्रता एवं आसन स्थिति अत्यंत स्थिर'
      },
      sangeet: {
        grade: 'O',
        skills: 'वंदना गायन, हारमोनियम वादन, देशप्रेम गीत',
        remarks: 'प्रातः प्रार्थना सभा में मुख्य गायिका के रूप में उत्कृष्ट'
      },
      sanskrit: {
        grade: 'O',
        skills: 'अमरकोश श्लोक, दैनिक संस्कृत प्रार्थना',
        remarks: 'संस्कृत वाचन एवं लेखन में सर्वोच्च स्थान'
      },
      naitik: {
        grade: 'O',
        skills: 'सदाचार, पर्यावरण संरक्षण, अतिथि सत्कार',
        remarks: 'अनुकरणीय संस्कार, विनम्रता एवं सेवावृत्ति'
      }
    }
  }
];

export const SCHOOL_INFO = {
  name: 'Saraswati Shishu Mandir (Vidya Bharati Akhil Bharatiya Shiksha Sansthan)',
  hindiName: 'सरस्वती शिशु एवं विद्या मंदिर',
  tagline: 'सा विद्या या विमुक्तये (That is knowledge which liberates)',
  affiliate: 'सम्बद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान',
  established: '1952',
  gorakhpurNote: 'Inspired by the historic 1952 foundation by Nanaji Deshmukh',
  address: 'विद्या भारती अखिल भारतीय शिक्षा संस्थान, नई दिल्ली - 110055',
  phone: '1800-180-5522 / +91 11 2350011',
  email: 'info@vidyabharti.net',
  timings: 'Morning 7:30 AM to 1:30 PM (Mon-Sat)',
  principalName: 'केंद्रीय शिक्षा समन्वय समिति',
  motto: 'Knowledge, Character, Patriotism and Culture',
};
