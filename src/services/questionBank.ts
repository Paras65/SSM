import { QuestionItem, QuestionType, QuestionPaper, QuestionPaperSection, ExamPaperType } from '../types';

export interface GeneratePaperOptions {
  schoolId?: string;
  schoolName?: string;
  classLevel: string;
  subject: string;
  examType: ExamPaperType;
  month?: string;
  chapters?: string;
  targetMarks: number;
  durationMinutes?: number;
  includeSanskriti?: boolean;
}

export const MONTH_OPTIONS = [
  { value: 'जुलाई', label: 'जुलाई (July - इकाई १)' },
  { value: 'अगस्त', label: 'अगस्त (August - इकाई २)' },
  { value: 'सितम्बर', label: 'सितम्बर (September - त्रैमासिक / इकाई ३)' },
  { value: 'अक्टूबर', label: 'अक्टूबर (October - इकाई ४)' },
  { value: 'नवम्बर', label: 'नवम्बर (November - इकाई ५)' },
  { value: 'दिसम्बर', label: 'दिसम्बर (December - अर्द्धवार्षिक / इकाई ६)' },
  { value: 'जनवरी', label: 'जनवरी (January - इकाई ७)' },
  { value: 'फरवरी', label: 'फरवरी (February - इकाई ८)' },
  { value: 'मार्च', label: 'मार्च (March - वार्षिक पुनरावृत्ति)' }
];

export const SUBJECT_OPTIONS = [
  'गणित (Mathematics)',
  'विज्ञान (Science)',
  'हिन्दी (Hindi)',
  'संस्कृत (Sanskrit)',
  'सामाजिक विज्ञान (Social Science)',
  'अंग्रेजी (English)',
  'संस्कृति बोध एवं नैतिक शिक्षा (Culture & Ethics)'
];

export const CLASS_OPTIONS = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

export function getDefaultChaptersForMonth(
  month: string,
  subject: string,
  examType: ExamPaperType
): string {
  if (examType === 'traimasik') {
    return 'अध्याय १ से ४: त्रैमासिक संचयी पाठ्यक्रम (अप्रैल से अगस्त)';
  }
  if (examType === 'ardhavarshik') {
    return 'अध्याय १ से ७: अर्द्धवार्षिक पाठ्यक्रम (प्रथम सत्र)';
  }

  const baseSubject = subject.includes('गणित')
    ? 'गणित'
    : subject.includes('विज्ञान')
    ? 'विज्ञान'
    : subject.includes('संस्कृत')
    ? 'संस्कृत'
    : subject.includes('सामाजिक')
    ? 'सामाजिक'
    : 'हिन्दी';

  switch (month) {
    case 'जुलाई':
      return baseSubject === 'गणित'
        ? 'अध्याय १: संख्या पद्धति एवं वैदिक गणित'
        : baseSubject === 'विज्ञान'
        ? 'अध्याय १: हमारे आस-पास के पदार्थ एवं भोजन के घटक'
        : 'अध्याय १: वंदना एवं मातृभूमि का गौरव';
    case 'अगस्त':
      return baseSubject === 'गणित'
        ? 'अध्याय २ व ३: पूर्ण संख्याएं, संक्रियाएं एवं भिन्न'
        : baseSubject === 'विज्ञान'
        ? 'अध्याय २ व ३: सजीव जगत एवं पौधों की संरचना'
        : 'अध्याय २ व ३: प्रेरक प्रसंग एवं व्याकरण (संज्ञा, सर्वनाम)';
    case 'सितम्बर':
      return baseSubject === 'गणित'
        ? 'अध्याय ४: दशमलव एवं रेखागणित के मूल तत्व'
        : baseSubject === 'विज्ञान'
        ? 'अध्याय ४: मापन, गति एवं चुंबकत्व'
        : 'अध्याय ४: कविता, शब्दार्थ एवं विलोम शब्द';
    case 'अक्टूबर':
      return baseSubject === 'गणित'
        ? 'अध्याय ५: पूर्णांक एवं क्षेत्रमिति'
        : baseSubject === 'विज्ञान'
        ? 'अध्याय ५: अम्ल, क्षार एवं लवण'
        : 'अध्याय ५: ऐतिहासिक गाथाएं एवं संधि';
    case 'नवम्बर':
      return baseSubject === 'गणित'
        ? 'अध्याय ६: बीजगणित परिचय एवं अनुपात-समानुपात'
        : baseSubject === 'विज्ञान'
        ? 'अध्याय ६: गति, बल एवं प्रकाश'
        : 'अध्याय ६: बाल साहित्य एवं निबंध लेखन';
    case 'दिसम्बर':
      return 'अध्याय ७: व्यावहारिक अनुप्रयोग एवं प्रथम सत्र पुनरावृत्ति';
    case 'जनवरी':
      return 'अध्याय ८: ज्यामितीय रचनाएं एवं प्रायोगिक कार्य';
    case 'फरवरी':
      return 'अध्याय ९ व १०: सांख्यिकी एवं वार्षिक परीक्षा पूर्व तैयारी';
    default:
      return 'अध्याय १ एवं २: मासिक पाठ्यक्रम प्रगति';
  }
}

// Rich curriculum question bank indexed by subject and difficulty
export const SAMPLE_QUESTION_BANK: Record<string, QuestionItem[]> = {
  'गणित': [
    {
      id: 'math-mcq-1',
      type: 'mcq',
      text: 'निम्न में से कौन सी एक अभाज्य (Prime) संख्या है?',
      marks: 1,
      subject: 'गणित',
      classLevel: 'Class 5',
      chapter: 'संख्या पद्धति (Number System)',
      options: [
        { id: 'a', text: '४ (4)' },
        { id: 'b', text: '९ (9)' },
        { id: 'c', text: '७ (7)' },
        { id: 'd', text: '१५ (15)' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'math-mcq-2',
      type: 'mcq',
      text: 'एक समकोण (Right Angle) का माप कितना होता है?',
      marks: 1,
      subject: 'गणित',
      classLevel: 'Class 5',
      chapter: 'ज्यामिति (Geometry)',
      options: [
        { id: 'a', text: '४५°' },
        { id: 'b', text: '९०°' },
        { id: 'c', text: '१८०°' },
        { id: 'd', text: '३६०°' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'math-mcq-3',
      type: 'mcq',
      text: 'संख्या ७/८ का योज्य प्रतिलोम (Additive Inverse) क्या होगा?',
      marks: 1,
      subject: 'गणित',
      classLevel: 'Class 8',
      chapter: 'परिमेय संख्याएं (Rational Numbers)',
      options: [
        { id: 'a', text: '८/७' },
        { id: 'b', text: '-७/८' },
        { id: 'c', text: '१' },
        { id: 'd', text: '०' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'math-vsa-1',
      type: 'vsa',
      text: 'यदि एक आयत की लम्बाई १२ सेमी तथा चौड़ाई ५ सेमी हो, तो उसका क्षेत्रफल ज्ञात कीजिए।',
      marks: 2,
      subject: 'गणित',
      classLevel: 'Class 5',
      chapter: 'क्षेत्रमिति (Mensuration)',
      difficulty: 'easy'
    },
    {
      id: 'math-vsa-2',
      type: 'vsa',
      text: 'मान ज्ञात कीजिए: (-२५) × (-४) + १००',
      marks: 2,
      subject: 'गणित',
      classLevel: 'Class 7',
      chapter: 'पूर्णांक (Integers)',
      difficulty: 'medium'
    },
    {
      id: 'math-vsa-3',
      type: 'vsa',
      text: 'समीकरण हल कीजिए: ३x + ७ = २२',
      marks: 2,
      subject: 'गणित',
      classLevel: 'Class 8',
      chapter: 'एक चर वाले रैखिक समीकरण (Linear Equations)',
      difficulty: 'medium'
    },
    {
      id: 'math-sa-1',
      type: 'sa',
      text: 'वैदिक गणित विधि "एकाधिकेन पूर्वेण" का उपयोग करते हुए ३५ का वर्ग (Square) ज्ञात कीजिए और चरण लिखिए।',
      marks: 3,
      subject: 'गणित',
      classLevel: 'Class 6',
      chapter: 'वैदिक गणित (Vedic Mathematics)',
      difficulty: 'medium'
    },
    {
      id: 'math-sa-2',
      type: 'sa',
      text: 'दो संख्याओं का अनुपात ५:३ है और उनका अंतर १८ है। वे संख्याएं ज्ञात कीजिए।',
      marks: 3,
      subject: 'गणित',
      classLevel: 'Class 8',
      chapter: 'रैखिक समीकरण',
      difficulty: 'medium'
    },
    {
      id: 'math-sa-3',
      type: 'sa',
      text: 'एक त्रिभुज के कोणों का अनुपात २:३:४ है। त्रिभुज के तीनों कोणों का मान ज्ञात कीजिए।',
      marks: 4,
      subject: 'गणित',
      classLevel: 'Class 7',
      chapter: 'त्रिभुज और उसके गुण',
      difficulty: 'medium'
    },
    {
      id: 'math-la-1',
      type: 'la',
      text: 'एक वर्गाकार पार्क की परिमाप ३२० मीटर है। पार्क का क्षेत्रफल ज्ञात कीजिए तथा इसके चारों ओर ₹१५ प्रति वर्ग मीटर की दर से बाड़ लगाने का कुल व्यय परिकलित कीजिए।',
      marks: 5,
      subject: 'गणित',
      classLevel: 'Class 8',
      chapter: 'क्षेत्रमिति एवं परिमाप',
      internalChoiceText: 'अथवा: किसी समांतर चतुर्भुज का आधार १८ सेमी और ऊंचाई १२ सेमी है। यदि एक अन्य समांतर चतुर्भुज का क्षेत्रफल इसके समान हो तथा आधार २४ सेमी हो, तो उसकी ऊंचाई ज्ञात कीजिए।',
      difficulty: 'hard'
    }
  ],
  'विज्ञान': [
    {
      id: 'sci-mcq-1',
      type: 'mcq',
      text: 'प्रकाश संश्लेषण (Photosynthesis) के दौरान पौधे वायुमंडल से कौन सी गैस ग्रहण करते हैं?',
      marks: 1,
      subject: 'विज्ञान',
      classLevel: 'Class 6',
      chapter: 'पादपों में पोषण (Nutrition in Plants)',
      options: [
        { id: 'a', text: 'ऑक्सीजन' },
        { id: 'b', text: 'नाइट्रोजन' },
        { id: 'c', text: 'कार्बन डाइऑक्साइड' },
        { id: 'd', text: 'हाइड्रोजन' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'sci-mcq-2',
      type: 'mcq',
      text: 'मानव शरीर की सबसे बड़ी ग्रंथि (Largest Gland) कौन सी है?',
      marks: 1,
      subject: 'विज्ञान',
      classLevel: 'Class 7',
      chapter: 'प्राणियों में पोषण',
      options: [
        { id: 'a', text: 'यकृत (Liver)' },
        { id: 'b', text: 'अग्न्याशय (Pancreas)' },
        { id: 'c', text: 'थायरॉयड' },
        { id: 'd', text: 'पीयूष ग्रंथि' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'sci-vsa-1',
      type: 'vsa',
      text: 'स्वपोषी (Autotrophs) एवं विषमपोषी (Heterotrophs) में दो प्रमुख अंतर लिखिए।',
      marks: 2,
      subject: 'विज्ञान',
      classLevel: 'Class 7',
      chapter: 'पादपों में पोषण',
      difficulty: 'easy'
    },
    {
      id: 'sci-vsa-2',
      type: 'vsa',
      text: 'चाल (Speed) का सूत्र एवं इसका SI मात्रक क्या है?',
      marks: 2,
      subject: 'विज्ञान',
      classLevel: 'Class 7',
      chapter: 'गति एवं समय (Motion & Time)',
      difficulty: 'easy'
    },
    {
      id: 'sci-sa-1',
      type: 'sa',
      text: 'भौतिक परिवर्तन (Physical Change) तथा रासायनिक परिवर्तन (Chemical Change) को उदाहरण सहित समझाइए।',
      marks: 3,
      subject: 'विज्ञान',
      classLevel: 'Class 7',
      chapter: 'भौतिक एवं रासायनिक परिवर्तन',
      difficulty: 'medium'
    },
    {
      id: 'sci-sa-2',
      type: 'sa',
      text: 'पुष्प के विभिन्न भागों का नामांकित चित्र बनाइए अथवा परागण (Pollination) की प्रक्रिया समझाइए।',
      marks: 4,
      subject: 'विज्ञान',
      classLevel: 'Class 8',
      chapter: 'पादप जनन',
      difficulty: 'medium'
    },
    {
      id: 'sci-la-1',
      type: 'la',
      text: 'मानव पाचन तंत्र (Human Digestive System) का नामांकित चित्र बनाकर आमाशय एवं क्षुद्रांत्र (Small Intestine) के पाचन कार्यों का विस्तृत वर्णन कीजिए।',
      marks: 5,
      subject: 'विज्ञान',
      classLevel: 'Class 7',
      chapter: 'मानव पोषण',
      internalChoiceText: 'अथवा: विद्युत धारा के उष्मीय प्रभाव (Heating Effect of Electric Current) को समझाइए और इसके दैनिक जीवन में तीन उपयोग व सुरक्षा फ्यूज का कार्य लिखिए।',
      difficulty: 'hard'
    }
  ],
  'हिन्दी': [
    {
      id: 'hindi-mcq-1',
      type: 'mcq',
      text: '‘सूर्योदय’ शब्द का सही संधि-विच्छेद क्या होगा?',
      marks: 1,
      subject: 'हिन्दी',
      classLevel: 'Class 6',
      chapter: 'व्याकरण - संधि',
      options: [
        { id: 'a', text: 'सूर्य + उदय' },
        { id: 'b', text: 'सूर्यो + दय' },
        { id: 'c', text: 'सूर्य + दय' },
        { id: 'd', text: 'सूर्य + उदयः' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'hindi-mcq-2',
      type: 'mcq',
      text: '‘अनुराग’ शब्द का सही विलोम (Antonym) शब्द चुनिए:',
      marks: 1,
      subject: 'हिन्दी',
      classLevel: 'Class 7',
      chapter: 'व्याकरण - विलोम शब्द',
      options: [
        { id: 'a', text: 'प्रेम' },
        { id: 'b', text: 'विराग' },
        { id: 'c', text: 'क्रोध' },
        { id: 'd', text: 'ईर्ष्या' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'hindi-vsa-1',
      type: 'vsa',
      text: 'मुहावरे का अर्थ लिखकर वाक्य में प्रयोग कीजिए: "अंगूठा दिखाना" अथवा "दंग रह जाना"।',
      marks: 2,
      subject: 'हिन्दी',
      classLevel: 'Class 6',
      chapter: 'व्याकरण - मुहावरे',
      difficulty: 'easy'
    },
    {
      id: 'hindi-sa-1',
      type: 'sa',
      text: 'कवि ने "वह चिड़िया जो" कविता के माध्यम से मनुष्य के किन-किन मानवीय गुणों को अपनाने का संदेश दिया है?',
      marks: 3,
      subject: 'हिन्दी',
      classLevel: 'Class 6',
      chapter: 'काव्य खंड - पाठ १',
      difficulty: 'medium'
    },
    {
      id: 'hindi-sa-2',
      type: 'sa',
      text: 'अपने विद्यालय के प्रधानाचार्य जी को दो दिन के आकस्मिक अवकाश हेतु एक प्रार्थना पत्र लिखिए।',
      marks: 4,
      subject: 'हिन्दी',
      classLevel: 'Class 6',
      chapter: 'रचनात्मक लेखन - पत्र लेखन',
      difficulty: 'medium'
    },
    {
      id: 'hindi-la-1',
      type: 'la',
      text: 'निम्न में से किसी एक विषय पर १५०-२०० शब्दों में सारगर्भित निबंध लिखिए:\n(क) मेरा प्रिय विद्यालय - सरस्वती शिशु मंदिर\n(ख) राष्ट्रीय शिक्षा नीति (NEP) और भारतीय संस्कार\n(ग) समय का सदुपयोग',
      marks: 5,
      subject: 'हिन्दी',
      classLevel: 'Class 7',
      chapter: 'निबंध लेखन',
      difficulty: 'hard'
    }
  ],
  'संस्कृत': [
    {
      id: 'skt-mcq-1',
      type: 'mcq',
      text: '‘पठ्’ धातु का लट् लकार, प्रथम पुरुष, एकवचन का रूप क्या होगा?',
      marks: 1,
      subject: 'संस्कृत',
      classLevel: 'Class 6',
      chapter: 'धातु रूप',
      options: [
        { id: 'a', text: 'पठति' },
        { id: 'b', text: 'पठतः' },
        { id: 'c', text: 'पठन्ति' },
        { id: 'd', text: 'पठामि' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'skt-vsa-1',
      type: 'vsa',
      text: '‘बालक’ शब्द रूप का प्रथमा विभक्ति, तीनों वचनों में रूप लिखिए।',
      marks: 2,
      subject: 'संस्कृत',
      classLevel: 'Class 6',
      chapter: 'शब्द रूप',
      difficulty: 'easy'
    },
    {
      id: 'skt-sa-1',
      type: 'sa',
      text: 'अपनी पाठ्यपुस्तक से कोई एक सुभाषित श्लोक लिखिए तथा उसका हिंदी अर्थ स्पष्ट कीजिए।',
      marks: 3,
      subject: 'संस्कृत',
      classLevel: 'Class 6',
      chapter: 'सुभाषितानि',
      difficulty: 'medium'
    },
    {
      id: 'skt-sa-2',
      type: 'sa',
      text: 'संस्कृत भाषा में अनुवाद कीजिए:\n१. वह विद्यालय जाता है।\n२. तुम दोनों पुस्तक पढ़ते हो।\n३. विद्या से विनय प्राप्त होती है।',
      marks: 4,
      subject: 'संस्कृत',
      classLevel: 'Class 7',
      chapter: 'संस्कृत अनुवाद',
      difficulty: 'medium'
    }
  ],
  'संस्कृति बोध': [
    {
      id: 'sans-mcq-1',
      type: 'sanskriti',
      text: 'सरस्वती शिशु मंदिर का वैदिक ध्येय वाक्य क्या है?',
      marks: 1,
      subject: 'संस्कृति बोध',
      classLevel: 'Class 5',
      chapter: 'संस्कार एवं संस्कृति',
      options: [
        { id: 'a', text: 'सत्यमेव जयते' },
        { id: 'b', text: 'सा विद्या या विमुक्तये' },
        { id: 'c', text: 'धर्मो रक्षति रक्षितः' },
        { id: 'd', text: 'योगः कर्मसु कौशलम्' }
      ],
      difficulty: 'easy'
    },
    {
      id: 'sans-vsa-1',
      type: 'sanskriti',
      text: 'पंचमुखी शिक्षा के पांचों आयामों (शारीरिक, योग, संगीत, संस्कृत, नैतिक शिक्षा) के नाम लिखिए।',
      marks: 2,
      subject: 'संस्कृति बोध',
      classLevel: 'Class 6',
      chapter: 'पंचमुखी शिक्षा',
      difficulty: 'easy'
    },
    {
      id: 'sans-sa-1',
      type: 'sanskriti',
      text: 'दैनिक भोजन मंत्र अथवा शांति मंत्र का शुद्ध श्लोक लिखिए एवं उसका भावार्थ संक्षेप में स्पष्ट कीजिए।',
      marks: 3,
      subject: 'संस्कृति बोध',
      classLevel: 'Class 7',
      chapter: 'दैनिक वंदना व श्लोक',
      difficulty: 'medium'
    }
  ]
};

/**
 * Intelligent Algorithm to generate a perfectly balanced question paper
 * strictly adhering to target marks, course progress, and exam type.
 */
export function generateSmartQuestionPaper(options: GeneratePaperOptions): QuestionPaper {
  const {
    schoolId = 'ssm-national',
    classLevel,
    subject,
    examType,
    month = 'जुलाई',
    chapters = 'पाठ १ व २',
    targetMarks,
    durationMinutes = examType === 'unit-test' ? 45 : 90,
    includeSanskriti = false
  } = options;

  // Extract base subject name
  const baseSubject = subject.includes('गणित')
    ? 'गणित'
    : subject.includes('विज्ञान')
    ? 'विज्ञान'
    : subject.includes('संस्कृत')
    ? 'संस्कृत'
    : subject.includes('सामाजिक')
    ? 'सामाजिक विज्ञान'
    : subject.includes('अंग्रेजी')
    ? 'अंग्रेजी'
    : 'हिन्दी';

  const bank = SAMPLE_QUESTION_BANK[baseSubject] || SAMPLE_QUESTION_BANK['हिन्दी'];
  const sanskritiBank = SAMPLE_QUESTION_BANK['संस्कृति बोध'] || [];
  const sanskritiMarks = (includeSanskriti && sanskritiBank.length > 0) ? 2 : 0;
  const effectiveAcademicTarget = Math.max(5, targetMarks - sanskritiMarks);

  // Determine sections layout based on exam type & target marks
  const sections: QuestionPaperSection[] = [];
  let allocatedMarks = 0;

  if (examType === 'unit-test' || targetMarks <= 25) {
    // UNIT TEST LAYOUT (15, 20, 25 Marks)
    // Section A: MCQs (3-5 marks)
    const mcqTarget = effectiveAcademicTarget <= 15 ? 3 : effectiveAcademicTarget <= 20 ? 4 : 5;
    const mcqs: QuestionItem[] = [];
    const availableMcqs = bank.filter(q => q.type === 'mcq');
    for (let i = 0; i < mcqTarget && i < availableMcqs.length; i++) {
      mcqs.push({ ...availableMcqs[i], id: `ut-mcq-${i + 1}`, chapter: chapters });
      allocatedMarks += availableMcqs[i].marks;
    }
    if (mcqs.length > 0) {
      sections.push({
        id: 'sec-a',
        title: 'खण्ड "क" - वस्तुनिष्ठ / बहुविकल्पीय प्रश्न (Objective / MCQs)',
        instructions: 'सभी प्रश्नों के सही विकल्प चुनकर उत्तर पुस्तिका में लिखिए। प्रत्येक प्रश्न १ अंक का है।',
        questions: mcqs
      });
    }

    // Section B: Very Short Answer (VSA) (2 marks each)
    const vsas: QuestionItem[] = [];
    const availableVsas = bank.filter(q => q.type === 'vsa');
    for (let i = 0; i < availableVsas.length && allocatedMarks + 2 <= effectiveAcademicTarget - 3; i++) {
      vsas.push({ ...availableVsas[i], id: `ut-vsa-${i + 1}`, chapter: chapters });
      allocatedMarks += availableVsas[i].marks;
    }
    if (vsas.length > 0) {
      sections.push({
        id: 'sec-b',
        title: 'खण्ड "ख" - अति लघु उत्तरीय प्रश्न (Very Short Answers)',
        instructions: 'निम्न प्रश्नों के उत्तर १-२ पंक्तियों में दीजिए। प्रत्येक प्रश्न २ अंक का है।',
        questions: vsas
      });
    }

    // Section C: Short Answer (SA) (3-4 marks)
    const remainingMarks = effectiveAcademicTarget - allocatedMarks;
    const sas: QuestionItem[] = [];
    const availableSas = bank.filter(q => q.type === 'sa');

    if (remainingMarks > 0) {
      // Allocate remaining marks to SA
      if (remainingMarks <= 4) {
        sas.push({
          id: 'ut-sa-1',
          type: 'sa',
          text: availableSas[0]?.text || `पाठ "${chapters}" के आधार पर मुख्य संकल्पना की व्याख्या कीजिए।`,
          marks: remainingMarks,
          subject: baseSubject,
          classLevel,
          chapter: chapters,
          difficulty: 'medium'
        });
        allocatedMarks += remainingMarks;
      } else {
        const firstMarks = Math.floor(remainingMarks / 2);
        const secondMarks = remainingMarks - firstMarks;
        sas.push({
          id: 'ut-sa-1',
          type: 'sa',
          text: availableSas[0]?.text || `पाठ "${chapters}" के आधार पर मुख्य नियमों को उदाहरण सहित लिखिए।`,
          marks: firstMarks,
          subject: baseSubject,
          classLevel,
          chapter: chapters,
          difficulty: 'medium'
        });
        sas.push({
          id: 'ut-sa-2',
          type: 'sa',
          text: availableSas[1]?.text || `पाठ "${chapters}" से संबंधित व्यावहारिक अनुप्रयोग स्पष्ट कीजिए।`,
          marks: secondMarks,
          subject: baseSubject,
          classLevel,
          chapter: chapters,
          difficulty: 'medium'
        });
        allocatedMarks += remainingMarks;
      }

      sections.push({
        id: 'sec-c',
        title: 'खण्ड "ग" - लघु उत्तरीय प्रश्न (Short Answers)',
        instructions: 'निम्न प्रश्नों के उत्तर ३०-५० शब्दों में दीजिए।',
        questions: sas
      });
    }

    // Optional Section D: Sanskriti Bodh (if checked and user wants an extra/optional question)
    if (includeSanskriti && sanskritiBank.length > 0) {
      sections.push({
        id: 'sec-sanskriti',
        title: 'खण्ड "घ" - संस्कृति बोध एवं नैतिक मूल्य (Vidya Bharati Heritage)',
        instructions: 'सनातन मूल्यों एवं विद्यालय ध्येय वाक्य पर आधारित अनिवार्य संस्कारिक प्रश्न।',
        questions: [
          {
            ...sanskritiBank[0],
            id: 'ut-sans-1',
            marks: 2
          }
        ]
      });
    }
  } else {
    // TRAIMASIK / PERIODIC EXAM LAYOUT (40, 50, 80 Marks)
    // Section A: MCQs (5-8 marks)
    const mcqCount = targetMarks >= 50 ? 8 : 5;
    const mcqs: QuestionItem[] = [];
    const availableMcqs = bank.filter(q => q.type === 'mcq');
    for (let i = 0; i < mcqCount; i++) {
      const item = availableMcqs[i % availableMcqs.length];
      mcqs.push({
        ...item,
        id: `trai-mcq-${i + 1}`,
        text: i >= availableMcqs.length ? `[त्रैमासिक वस्तुनिष्ठ ${i + 1}] ` + item.text : item.text,
        chapter: chapters
      });
      allocatedMarks += 1;
    }
    sections.push({
      id: 'sec-a',
      title: 'खण्ड "क" - वस्तुनिष्ठ प्रश्न (Multiple Choice Questions)',
      instructions: 'सभी प्रश्नों के सही विकल्प चुनकर उत्तर पुस्तिका में लिखिए। प्रत्येक प्रश्न १ अंक का है।',
      questions: mcqs
    });

    // Section B: VSA (2 marks each)
    const vsaCount = targetMarks >= 50 ? 6 : 4;
    const vsas: QuestionItem[] = [];
    const availableVsas = bank.filter(q => q.type === 'vsa');
    for (let i = 0; i < vsaCount; i++) {
      const item = availableVsas[i % availableVsas.length];
      vsas.push({
        ...item,
        id: `trai-vsa-${i + 1}`,
        text: i >= availableVsas.length ? `[त्रैमासिक अति लघु ${i + 1}] ` + item.text : item.text,
        marks: 2,
        chapter: chapters
      });
      allocatedMarks += 2;
    }
    sections.push({
      id: 'sec-b',
      title: 'खण्ड "ख" - अति लघु उत्तरीय प्रश्न (Very Short Answers)',
      instructions: 'निम्न प्रश्नों के उत्तर २०-३० शब्दों में संक्षेप में दीजिए। प्रत्येक प्रश्न २ अंक का है।',
      questions: vsas
    });

    // Section C: SA (3-4 marks each)
    const saTargetMarks = Math.floor((targetMarks - allocatedMarks) * 0.55);
    const saCount = Math.max(2, Math.floor(saTargetMarks / 3));
    const sas: QuestionItem[] = [];
    const availableSas = bank.filter(q => q.type === 'sa');
    for (let i = 0; i < saCount; i++) {
      const item = availableSas[i % availableSas.length];
      sas.push({
        ...item,
        id: `trai-sa-${i + 1}`,
        text: i >= availableSas.length ? `[त्रैमासिक लघु उत्तरीय ${i + 1}] ` + item.text : item.text,
        marks: 3,
        chapter: chapters
      });
      allocatedMarks += 3;
    }
    sections.push({
      id: 'sec-c',
      title: 'खण्ड "ग" - लघु उत्तरीय प्रश्न (Short Answers)',
      instructions: 'निम्न प्रश्नों के उत्तर ५०-७० शब्दों में दीजिए। प्रत्येक प्रश्न ३ अंक का है।',
      questions: sas
    });

    // Section D: Long Answers (LA) with Internal Choice (5 marks each)
    const remainingMarks = targetMarks - allocatedMarks;
    const las: QuestionItem[] = [];
    const availableLas = bank.filter(q => q.type === 'la');

    if (remainingMarks > 0) {
      const laCount = Math.max(1, Math.floor(remainingMarks / 5));
      const eachMarks = Math.floor(remainingMarks / laCount);
      let remDiff = remainingMarks - eachMarks * laCount;

      for (let i = 0; i < laCount; i++) {
        const item = availableLas[i % availableLas.length] || availableSas[0];
        const currentMark = eachMarks + (i === 0 ? remDiff : 0);
        las.push({
          ...item,
          id: `trai-la-${i + 1}`,
          type: 'la',
          marks: currentMark,
          text: item.text,
          internalChoiceText: item.internalChoiceText || 'अथवा: संबंधित अध्याय के वैकल्पिक प्रश्न का विस्तृत समाधान लिखिए।',
          chapter: chapters
        });
        allocatedMarks += currentMark;
      }

      sections.push({
        id: 'sec-d',
        title: 'खण्ड "घ" - दीर्घ उत्तरीय प्रश्न (Long Answers with Internal Choice)',
        instructions: 'सभी प्रश्नों के विस्तृत उत्तर दीजिए। आंतरिक विकल्प ("अथवा") में से किसी एक को हल करें।',
        questions: las
      });
    }
  }

  // Generate Title
  const title =
    examType === 'unit-test'
      ? `मासिक इकाई मूल्यांकन - ${month} (${classLevel})`
      : examType === 'traimasik'
      ? `त्रैमासिक परीक्षा सत्र 2026-27 (${classLevel})`
      : `सत्रीय परीक्षा (${classLevel})`;

  return {
    id: `qp-${Date.now()}`,
    schoolId,
    title,
    examType,
    classLevel,
    subject,
    month,
    chapters,
    totalMarks: targetMarks,
    durationMinutes,
    generalInstructions: [
      'सभी प्रश्न अनिवार्य हैं। प्रश्नों के सम्मुख उनके निर्धारित अंक अंकित हैं।',
      'खण्ड "क" के वस्तुनिष्ठ प्रश्नों में केवल सही विकल्प का चयन कर उत्तर लिखिए।',
      'दीर्घ उत्तरीय प्रश्नों में दिए गए आंतरिक विकल्प ("अथवा") में से केवल एक प्रश्न हल करें।',
      'स्वच्छता एवं स्पष्ट लिखावट पर विशेष ध्यान दें।'
    ],
    sections,
    createdAt: new Date().toISOString(),
    createdBy: 'आचार्य / परीक्षा समिति'
  };
}

export interface GenerateWithGeminiOptions extends GeneratePaperOptions {
  apiKey?: string;
  customTopic?: string;
}

export async function generateQuestionPaperWithGemini(
  options: GenerateWithGeminiOptions
): Promise<QuestionPaper> {
  const effectiveKey =
    options.apiKey ||
    (import.meta.env.VITE_SMART_API_KEY as string) ||
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    localStorage.getItem('ssm_smart_api_key') ||
    localStorage.getItem('ssm_gemini_api_key') ||
    '';

  if (!effectiveKey) {
    return generateSmartQuestionPaper(options);
  }

  const {
    classLevel,
    subject,
    examType,
    month = 'जुलाई',
    chapters = 'पाठ १ व २',
    targetMarks,
    durationMinutes = examType === 'unit-test' ? 45 : 90,
    customTopic = '',
    schoolName = 'सरस्वती शिशु मन्दिर'
  } = options;

  const prompt = `You are an expert Indian school question paper creator specialized in Vidya Bharati / NCERT syllabus for ${schoolName}.
Create a complete, beautifully balanced examination question paper in Hindi for:
- Class: ${classLevel}
- Subject: ${subject}
- Exam Type: ${examType === 'unit-test' ? 'मासिक इकाई मूल्यांकन (Monthly Unit Test)' : 'त्रैमासिक परीक्षा (Traimasik / Periodic Test)'}
- Month: ${month}
- Chapters / Topics: ${chapters} ${customTopic ? `(Special Focus/Topic: ${customTopic})` : ''}
- Total Target Marks: ${targetMarks}
- Duration: ${durationMinutes} minutes

Strict Rules:
1. The sum of marks of all questions MUST EXACTLY EQUAL ${targetMarks} marks.
2. Structure into 2 to 3 sections:
   - खण्ड "क": Objective / MCQs (type: "mcq", 1 mark each with 4 options labeled क, ख, ग, घ) and/or Very Short Answer (type: "vsa", 1 mark each).
   - खण्ड "ख": Short Answer (type: "sa", 2 or 3 marks each).
   - खण्ड "ग": Long Answer (type: "la", 4 or 5 marks each). For long answers, provide an internalChoiceText ("अथवा: ...").
3. Output strictly a JSON object with this structure:
{
  "title": "मासिक इकाई मूल्यांकन / त्रैमासिक परीक्षा ...",
  "generalInstructions": [
    "सभी प्रश्न अनिवार्य हैं।",
    "प्रश्नों के निर्धारित अंक उनके सम्मुख अंकित हैं।"
  ],
  "sections": [
    {
      "id": "sec-a",
      "title": "खण्ड 'क' - वस्तुनिष्ठ प्रश्न",
      "instructions": "सही विकल्प का चयन कीजिए।",
      "questions": [
        {
          "id": "q1",
          "type": "mcq",
          "text": "प्रश्न पाठ...",
          "marks": 1,
          "options": [
            { "id": "opt-1", "text": "(क) विकल्प १" },
            { "id": "opt-2", "text": "(ख) विकल्प २" },
            { "id": "opt-3", "text": "(ग) विकल्प ३" },
            { "id": "opt-4", "text": "(घ) विकल्प ४" }
          ]
        }
      ]
    },
    {
      "id": "sec-b",
      "title": "खण्ड 'ख' - लघु उत्तरीय प्रश्न",
      "instructions": "संक्षेप में उत्तर दीजिए।",
      "questions": [
        {
          "id": "q2",
          "type": "sa",
          "text": "प्रश्न पाठ...",
          "marks": 2
        }
      ]
    },
    {
      "id": "sec-c",
      "title": "खण्ड 'ग' - दीर्घ उत्तरीय प्रश्न",
      "instructions": "विस्तृत उत्तर दीजिए।",
      "questions": [
        {
          "id": "q3",
          "type": "la",
          "text": "प्रश्न पाठ...",
          "marks": 4,
          "internalChoiceText": "अथवा: वैकल्पिक प्रश्न पाठ..."
        }
      ]
    }
  ]
}
Return ONLY valid JSON. No markdown code blocks, no backticks.`;

  try {
    let parsed: any = null;

    // 1. Try secure backend proxy first (keeps API key secure on server if configured)
    try {
      const proxyHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (effectiveKey) {
        proxyHeaders['x-gemini-api-key'] = effectiveKey;
      }
      const proxyRes = await fetch('/api/ai/generate-question-paper', {
        method: 'POST',
        headers: proxyHeaders,
        body: JSON.stringify({ prompt })
      });
      if (proxyRes.ok && proxyRes.headers.get('content-type')?.includes('application/json')) {
        parsed = await proxyRes.json();
      }
    } catch {
      // Backend proxy unavailable (e.g. static dev), will fallback to direct call
    }

    // 2. Direct call with multi-model resilient fallback loop
    if (!parsed) {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (effectiveKey.startsWith('AIzaSy') || !effectiveKey.startsWith('ya29.')) {
        headers['x-goog-api-key'] = effectiveKey.trim();
      } else {
        headers['Authorization'] = `Bearer ${effectiveKey.trim()}`;
      }

      const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];
      let response: Response | null = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.3,
                  responseMimeType: 'application/json'
                }
              })
            }
          );
          if (res.ok) {
            response = res;
            break;
          } else {
            lastError = await res.json().catch(() => ({}));
            if (res.status === 401 || res.status === 403) {
              try {
                localStorage.removeItem('ssm_smart_api_key');
                localStorage.removeItem('ssm_gemini_api_key');
              } catch {}
              throw new Error('बौद्धिक सेवा प्रमाणीकरण त्रुटि: अमान्य अथवा समाप्त स्मार्ट कुंजी।');
            }
          }
        } catch (err: any) {
          if (err.message?.includes('प्रमाणीकरण')) throw err;
          console.warn(`Model ${modelName} call failed, trying fallback...`, err);
        }
      }

      if (!response) {
        throw new Error(lastError?.error?.message || 'सभी मॉडल अनुपलब्ध हैं।');
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
      const validatedSections: QuestionPaperSection[] = parsed.sections.map(
        (sec: any, sIdx: number) => ({
          id: sec.id || `sec-${sIdx + 1}`,
          title: sec.title || `खण्ड ${String.fromCharCode(65 + sIdx)}`,
          instructions: sec.instructions || 'निर्देशानुसार हल करें।',
          questions: (sec.questions || []).map((q: any, qIdx: number): QuestionItem => ({
            id: q.id || `q-${sIdx + 1}-${qIdx + 1}`,
            type: (['mcq', 'vsa', 'sa', 'la', 'sanskriti'].includes(q.type) ? q.type : 'sa') as QuestionType,
            text: q.text || 'प्रश्न',
            marks: Number(q.marks) || 1,
            subject,
            classLevel,
            chapter: chapters,
            options: Array.isArray(q.options)
              ? q.options.map((opt: any, oIdx: number) => ({
                  id: opt.id || `opt-${oIdx + 1}`,
                  text: typeof opt === 'string' ? opt : opt.text || ''
                }))
              : undefined,
            internalChoiceText: q.internalChoiceText || undefined
          }))
        })
      );

      return {
        id: `qp-ai-${Date.now()}`,
        schoolId: options.schoolId,
        title:
          parsed.title ||
          (examType === 'unit-test'
            ? `मासिक इकाई मूल्यांकन - ${month} (${classLevel})`
            : `त्रैमासिक परीक्षा सत्र 2026-27 (${classLevel})`),
        examType,
        classLevel,
        subject,
        month,
        chapters,
        totalMarks: targetMarks,
        durationMinutes,
        generalInstructions:
          Array.isArray(parsed.generalInstructions) && parsed.generalInstructions.length > 0
            ? parsed.generalInstructions
            : [
                'सभी प्रश्न अनिवार्य हैं। प्रश्नों के सम्मुख उनके निर्धारित अंक अंकित हैं।',
                'खण्ड "क" के वस्तुनिष्ठ प्रश्नों में केवल सही विकल्प का चयन कर उत्तर लिखिए।',
                'दीर्घ उत्तरीय प्रश्नों में दिए गए आंतरिक विकल्प ("अथवा") में से केवल एक प्रश्न हल करें।',
                'स्वच्छता एवं स्पष्ट लिखावट पर विशेष ध्यान दें।'
              ],
        sections: validatedSections,
        createdAt: new Date().toISOString(),
        createdBy: 'परीक्षा समिति एवं आचार्य',
        generationSource: 'baudhik'
      };
    }

    const fallbackPaper = generateSmartQuestionPaper(options);
    fallbackPaper.generationSource = 'curriculum-bank';
    return fallbackPaper;
  } catch (err: any) {
    console.warn('Generation fallback to curriculum question bank:', err);
    const fallbackPaper = generateSmartQuestionPaper(options);
    fallbackPaper.generationSource = 'curriculum-bank';
    return fallbackPaper;
  }
}


