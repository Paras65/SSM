import React, { useState, useMemo } from 'react';
import {
  X,
  HelpCircle,
  Search,
  BookOpen,
  GraduationCap,
  Lock,
  Receipt,
  UserCheck,
  Shield,
  Phone,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const HELP_CATEGORIES = [
  { id: 'all', label: 'सभी विषय' },
  { id: 'daily-guide', label: '🌟 1-मिनट सरल दैनिक गाइड' },
  { id: 'sankul', label: '🏢 संकुल प्रभारी पटल' },
  { id: 'dcr', label: '💵 रोकड़ बही (DCR)' },
  { id: 'scanner', label: '📸 AI रजिस्टर स्कैनर' },
  { id: 'tc', label: '📜 टीसी व उपस्थिति' },
  { id: 'paper-bridge', label: '📄 A4 रिक्त फॉर्म्स' },
  { id: 'session', label: '🎓 सत्र व प्रोन्नति' },
  { id: 'exam', label: '📝 परीक्षा व अंक' },
  { id: 'auth', label: '🔑 लॉगिन व क्रेडेंशियल' },
  { id: 'fee', label: '💰 शुल्क व रसीदें' },
  { id: 'staff', label: '👩‍🏫 आचार्य व स्टाफ' },
  { id: 'dpdp', label: '🔒 DPDP गोपनीयता' }
];

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSessionModal?: () => void;
  onOpenAuditModal?: () => void;
}

interface GuideItem {
  id: string;
  category: 'daily-guide' | 'session' | 'exam' | 'auth' | 'fee' | 'staff' | 'dpdp' | 'scanner' | 'dcr' | 'tc' | 'paper-bridge' | 'sankul';
  categoryLabel: string;
  question: string;
  answer: string;
  tips?: string[];
  actionLabel?: string;
  actionType?: 'session' | 'audit';
}

const GUIDE_ITEMS: GuideItem[] = [
  {
    id: 'daily-1',
    category: 'daily-guide',
    categoryLabel: 'दैनिक हाजिरी',
    question: '१. आज की हाजिरी (उपस्थिति) कैसे लगाएं और अनुपस्थित छात्रों को व्हाट्सएप कैसे भेजें?',
    answer: 'डैशबोर्ड पर "आज की हाजिरी" बटन दबाएं या "उपस्थिति" टैब में जाएं:\n१. अपनी कक्षा (उदा. Class 5-A) चुनें।\n२. सभी भैया-बहिनों के आगे "उपस्थित" या "अनुपस्थित" पर टिक करें।\n३. नीचे "उपस्थिति सहेजें" पर क्लिक करें।\n४. अनुपस्थित रहने वाले भैया-बहिनों के अभिभावक को तुरंत "व्हाट्सएप अलर्ट" बटन दबाकर एक क्लिक में सूचना भेज सकते हैं।',
    tips: [
      'सुझाव: आप "सभी उपस्थित करें" दबाकर केवल अनुपस्थित छात्रों पर क्लिक कर सकते हैं, जिससे 30 सेकंड में पूरी कक्षा की हाजिरी लग जाती है।'
    ]
  },
  {
    id: 'daily-2',
    category: 'daily-guide',
    categoryLabel: 'नया प्रवेश',
    question: '२. नए भैया/बहिन का विद्यालय में प्रवेश (नामांकन) कैसे दर्ज करें?',
    answer: 'डैशबोर्ड पर "नया प्रवेश" बटन दबाएं:\n१. भैया/बहिन का नाम, पिता का नाम और 10-अंकीय मोबाइल नंबर भरें।\n२. कक्षा चुनें (उदा. शिशु, प्रथम, द्वितीय आदि)।\n३. "छात्र जोड़ें" दबाएं। छात्र का स्कॉलर/प्रवेश क्रमांक सिस्टम स्वतः सुरक्षित रूप से आवंटित कर देता है।',
    tips: [
      'सुझाव: अभिभावक का मोबाइल नंबर डालते समय +91 या 0 लगाने की आवश्यकता नहीं है; सीधे 10 अंक दर्ज करें।'
    ]
  },
  {
    id: 'daily-3',
    category: 'daily-guide',
    categoryLabel: 'शुल्क व रसीद',
    question: '३. फीस (शुल्क) कैसे जमा करें और पक्की रसीद कैसे प्रिंट करें?',
    answer: '"शुल्क (Fees)" टैब में जाएं या डैशबोर्ड पर "शुल्क जमा" दबाएं:\n१. छात्र का नाम या रोल नंबर खोजें और "शुल्क जमा करें" पर क्लिक करें।\n२. प्राप्त राशि (उदा. ₹1500) दर्ज करें और माध्यम (नकद/UPI) चुनें।\n३. "रसीद जनरेट करें" पर क्लिक करें। तुरंत सुंदर हिंदी पक्की रसीद खुल जाएगी जिसे आप सीधे प्रिंट कर सकते हैं या व्हाट्सएप पर भेज सकते हैं।',
    tips: [
      'सुझाव: प्रिंट करने हेतु कीबोर्ड पर Ctrl + P दबाएं या रसीद पर बने "प्रिंट" बटन पर क्लिक करें।'
    ]
  },
  {
    id: 'daily-4',
    category: 'daily-guide',
    categoryLabel: 'आईडी कार्ड',
    question: '४. पूरी कक्षा के पहचान पत्र (ID Cards) एक साथ A4 शीट पर कैसे प्रिंट करें?',
    answer: '"छात्र विवरण" टैब में ऊपर दिए गए "बल्क आईडी कार्ड" बटन पर क्लिक करें:\n१. अपनी कक्षा (उदा. Class 6) चुनें।\n२. स्क्रीन पर एक A4 शीट पर 8 पहचान पत्र कटिंग लाइनों के साथ दिखेंगे।\n३. "प्रिंट करें" बटन दबाएं। बिना किसी लेआउट सेटिंग के सुंदर कार्ड प्रिंट हो जाएंगे।',
    tips: [
      'सुझाव: कार्ड पर विद्यालय का ध्येय वाक्य "सा विद्या या विमुक्तये", ब्लड ग्रुप, और आपातकालीन फोन नंबर स्वतः आ जाता है।'
    ]
  },
  {
    id: 'daily-5',
    category: 'daily-guide',
    categoryLabel: 'डेटा सुरक्षा',
    question: '५. विद्यालय का डेटा हमेशा सुरक्षित रखने हेतु शाम को बैकअप कैसे लें?',
    answer: 'ऊपर हेडर बार में दिए गए "डेटा बैकअप" बटन पर क्लिक करें:\n१. एक क्लिक में आपके विद्यालय के सभी छात्रों, हाजिरी और फीस का संपूर्ण सुरक्षित बैकअप आपके कंप्यूटर के Downloads फोल्डर में सेव हो जाएगा।\n२. यदि कभी कंप्यूटर खराब हो जाए या नया कंप्यूटर लगाएं, तो साथ में दिए गए "डेटा रीस्टोर" बटन से फ़ाइल चुनकर 1 सेकंड में सारा डेटा वापस ला सकते हैं।',
    tips: [
      'सुझाव: सप्ताह में एक बार या शनिवार को बैकअप अवश्य डाउनलोड करें और किसी पेनड्राइव में सुरक्षित रख लें।'
    ]
  },
  {
    id: 'guide-1',
    category: 'session',
    categoryLabel: 'सत्र व प्रोन्नति',
    question: 'सत्र समाप्ति (मार्च-अप्रैल) पर वार्षिक बदलाव का सही क्रम क्या है?',
    answer: 'वार्षिक परीक्षा संपन्न होने पर त्रुटि-मुक्त संचालन हेतु इन 3 चरणों का पालन करें:\n1. परीक्षा स्थिरीकरण (Lock Exams): सबसे पहले वार्षिक परीक्षा को लॉक करें ताकि अंकों में अनपेक्षित फेरबदल रुक सके।\n2. बकाया शुल्क अग्रसारण (Rollover Arrears): पिछले सत्र का बकाया शुल्क नए सत्र में ट्रांसफर करें।\n3. छात्र प्रोन्नति (Promote Students): छात्रों को कक्षा-वार अगली कक्षा (उदा. Class 5 ➔ 6) में प्रमोट करें और 10वीं/12वीं उत्तीर्ण छात्रों को पूर्व छात्र (Alumni) चिन्हित करें।',
    tips: [
      'सिस्टम छात्र का पुराना शैक्षणिक इतिहास (कक्षा, रोल नंबर, सत्र) हमेशा सुरक्षित रखता है।',
      'बकाया शुल्क का अग्रसारण केवल 1 बार करें; सिस्टम दोहराव स्वतः रोकता है।'
    ],
    actionLabel: '🎓 सत्र प्रबंधन कंसोल खोलें',
    actionType: 'session'
  },
  {
    id: 'guide-2',
    category: 'exam',
    categoryLabel: 'परीक्षा व अंक',
    question: 'अंक बदलते समय "Error: Exam is locked" क्यों आता है?',
    answer: 'यह कोई तकनीकी त्रुटि नहीं बल्कि एक सुरक्षा गार्डरेल (Security Guardrail) है। जब विद्यालय प्रबंधन किसी परीक्षा को लॉक कर देता है, तो कोई भी आचार्य पुराने अंकों में बदलाव नहीं कर सकता।\nयदि अंकों में वास्तविक संशोधन आवश्यक है, तो प्रधानाचार्य जी को "परीक्षा प्रबंधन" या "सत्र प्रबंधन" में जाकर उस परीक्षा को अस्थायी रूप से अनलॉक (Unlock) करना होगा।',
    tips: [
      'अंक संशोधित करने के बाद परीक्षा को पुनः लॉक करना न भूलें।'
    ],
    actionLabel: '🔒 परीक्षा लॉक/अनलॉक स्थिति देखें',
    actionType: 'session'
  },
  {
    id: 'guide-3',
    category: 'auth',
    categoryLabel: 'लॉगिन व छात्र पोर्टल',
    question: 'दो सगे भाई-बहनों के छात्र पोर्टल लॉगिन टकराव का समाधान कैसे करें?',
    answer: 'यदि विद्यालय में पढ़ने वाले दो भाई-बहनों का पिता का मोबाइल नंबर समान है और रोल नंबर भी समान दर्ज हो गया है, तो लॉगिन के समय सिस्टम स्वतः पूछता है: "समान अनुक्रमांक व मोबाइल पर एक से अधिक छात्र मिले, कृपया कक्षा चुनें।"\nअभिभावक जैसे ही सही कक्षा (उदा. Class 6) चुनते हैं, संबंधित छात्र का पोर्टल तुरंत खुल जाता है।',
    tips: [
      'अभिभावकों को बताएं कि मोबाइल नंबर में +91 या 0 लगाने की आवश्यकता नहीं है; सीधे 10 अंक दर्ज करें।'
    ]
  },
  {
    id: 'guide-4',
    category: 'staff',
    categoryLabel: 'आचार्य व सुरक्षा पिन',
    question: 'आचार्य (शिक्षक) अपना 4-अंकीय लॉगिन पिन भूल जाएं तो क्या करें?',
    answer: 'आचार्यों के लिए डिफ़ॉल्ट सुरक्षा पिन "1234" निर्धारित है। यदि आचार्य जी अपना व्यक्तिगत पिन भूल गए हैं, तो व्यवस्थापक "आचार्य व वेतन" टैब में जाकर संबंधित आचार्य के विवरण पर क्लिक करके उनका पिन देख सकते हैं या नया 4-अंकीय पिन सेट कर सकते हैं।',
    tips: [
      'पिन बदलते ही नया पिन आचार्य को तुरंत नोट करवा दें।'
    ]
  },
  {
    id: 'guide-5',
    category: 'fee',
    categoryLabel: 'शुल्क व रसीद',
    question: 'क्या बकाया शुल्क (Fee Arrears) का दोहराव हो सकता है?',
    answer: 'नहीं। सिस्टम में विशेष सुरक्षा कोड लगा है जो जांचता है कि क्या संबंधित छात्र के खाते में उस सत्र का बकाया पहले से "Past Session Arrears" के रूप में जुड़ा हुआ है। यदि हाँ, तो सिस्टम नया बकाया नहीं बनाता और दोहराव को 100% रोकता है।',
    tips: [
      'अभिभावक को तुरंत शुल्क रसीद भेजने हेतु "व्हाट्सएप अलर्ट" बटन का उपयोग करें।'
    ]
  },
  {
    id: 'guide-6',
    category: 'dpdp',
    categoryLabel: 'डेटा गोपनीयता व TC',
    question: 'विद्यार्थी द्वारा TC लेने पर DPDP Act 2023 अनामीकरण क्यों करें?',
    answer: 'भारत के डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act 2023) के अनुसार, विद्यालय छोड़ चुके छात्रों के व्यक्तिगत संपर्क नंबर और आवासीय पते को अनामीकृत (मास्क) करना कानूनी रूप से सुरक्षित है।\n"छात्र विवरण" में जाकर "डेटा अनामीकृत करें" दबाने पर फोन नंबर (+91 99*** *****) हो जाता है, जबकि बोर्ड परीक्षा रिकॉर्ड हेतु छात्र का नाम, रोल नंबर व कक्षा सुरक्षित रहते हैं।',
    tips: [
      'अनामीकरण का पूरा डिजिटल प्रमाण "🛡️ ऑडिट लॉग" में स्वतः दर्ज होता है।'
    ],
    actionLabel: '🛡️ सुरक्षा ऑडिट लॉग देखें',
    actionType: 'audit'
  },
  {
    id: 'guide-7',
    category: 'auth',
    categoryLabel: 'सुरक्षा व पासकोड',
    question: 'प्रशासक सुरक्षा पासकोड बदलने पर पुराने खुले कंप्यूटर लॉग-आउट क्यों हो जाते हैं?',
    answer: 'यह जानबूझकर लागू किया गया एक उच्च-सुरक्षा मानक है (Token Invalidation)। जब भी विद्यालय का सुरक्षा पासकोड बदला जाता है, तो विद्यालय का टोकन संस्करण (Token Version) बढ़ जाता है। इससे यदि किसी अनाधिकृत डिवाइस पर पुराना सत्र खुला रह गया हो, तो वह तुरंत बंद हो जाता है और केवल नए पासकोड से ही पुनः प्रवेश मिलता है।',
    tips: [
      'प्रत्येक नए शैक्षणिक सत्र में एक बार विद्यालय का एडमिन पासकोड अवश्य बदलें।'
    ]
  },
  {
    id: 'guide-dcr',
    category: 'dcr',
    categoryLabel: 'रोकड़ बही (DCR)',
    question: 'शाम को फीस काउंटर का नकद मिलान (DCR) एवं नोटों की भौतिक गिनती कैसे करें?',
    answer: 'शुल्क प्रबंधन टैब में "📖 दैनिक रोकड़ बही (DCR)" बटन पर क्लिक करें:\n१. आज की तारीख स्वतः लोड होती है और कुल नकद व ऑनलाइन UPI संग्रह प्रदर्शित होता है।\n२. भौतिक नकद दराज नोट मिलान बॉक्स में ₹500, ₹200, ₹100, ₹50, ₹20, ₹10 व सिक्कों की संख्या भरें।\n३. जब कुल योग मिल जाता है तो हरा बैज "✅ पूर्ण मिलान (₹0 अंतर - संतुलित)" सक्रिय हो जाता है।\n४. "A4 रोकड़ बही प्रिंट" दबाकर शाम को रोकड़िया, लेखाकार एवं प्रधानाचार्य के हस्ताक्षर हेतु औपचारिक प्रिंट लें।',
    tips: [
      'लेखा ऑडिट हेतु "CSV डाउनलोड" बटन से 1-क्लिक में पूरे दिन का विवरण एक्सेल में निर्यात किया जा सकता है।'
    ]
  },
  {
    id: 'guide-scanner',
    category: 'scanner',
    categoryLabel: 'AI रजिस्टर स्कैनर',
    question: 'पुराने हस्तलिखित उपस्थिति या प्रवेश रजिस्टर से छात्र विवरण स्वतः कैसे भरें?',
    answer: 'छात्र विवरण टैब में "रजिस्टर डायरेक्ट स्कैन" पर क्लिक करें:\n१. कैमरे से पंजिका की फोटो खींचें या कंप्यूटर/फोन से फोटो अपलोड करें।\n२. सिस्टम स्वतः स्प्लिट-स्क्रीन मोड में खुलता है — बाईं ओर मूल रजिस्टर फोटो (ज़ूम/रोटेट सहित) और दाईं ओर संपादन योग्य तालिका।\n३. फोटो अपलोड होते ही छात्रों का विवरण स्वतः पहचानकर तालिका में भर जाता है।\n४. छात्र का नाम टाइप करते समय कीबोर्ड पर "Enter" दबाते ही कर्सर तुरंत अगली पंक्ति में कूदता है। अंत में "सभी छात्र पंजीकृत करें" दबाएं।',
    tips: [
      'आचार्यों को किसी भी तकनीकी API Key की आवश्यकता नहीं है; फोटो अपलोड होते ही स्वतः प्रविष्टि हो जाती है।'
    ]
  },
  {
    id: 'guide-absentee',
    category: 'daily-guide',
    categoryLabel: 'अनुपस्थित प्रसारण',
    question: 'दैनिक प्रार्थना के बाद अनुपस्थित छात्रों के अभिभावकों को 1-क्लिक बैच व्हाट्सएप कैसे भेजें?',
    answer: 'उपस्थिति टैब में जैसे ही किसी छात्र को अनुपस्थित (Absent) चिह्नित किया जाता है, शीर्ष टूलबार पर लाल बैज "🚨 अनुपस्थित व्हाट्सएप प्रसारण" सक्रिय हो जाता है:\n१. प्रसारण बटन दबाते ही सभी अनुपस्थित छात्रों की बैच कतार खुल जाएगी।\n२. बड़ा हरा बटन "📢 अगला अनुपस्थित संदेश भेजें" दबाते जाएं।\n३. सिस्टम स्वतः अगले छात्र का व्हाट्सएप खोलता जाएगा और संबंधित छात्र पर "✓ भेजा गया" का हरा टिक लगाता जाएगा।',
    tips: [
      'यह आधिकारिक WhatsApp Web URI प्रोटोकॉल पर कार्य करता है, जिससे स्कूल का मोबाइल नंबर ब्लॉक होने का जोखिम शून्य रहता है।'
    ]
  },
  {
    id: 'guide-tc',
    category: 'tc',
    categoryLabel: 'टीसी व नो-ड्यूज',
    question: 'स्थानांतरण प्रमाण पत्र (TC) में उपस्थित दिवसों और बकाया शुल्क की स्वचालित गणना कैसे होती है?',
    answer: 'छात्र विवरण में छात्र के आगे "स्थानांतरण प्रमाण पत्र (TC)" दबाएं:\n१. सिस्टम छात्र के पूरे सत्र के उपस्थिति रिकॉर्ड्स को स्कैन करके उपस्थित दिवस (उदा. 212/224 दिन, 95%) स्वतः भर देता है।\n२. शुल्क लेजर से जांच कर यदि कोई बकाया नहीं है तो "हाँ, पूर्ण चुकता" और यदि बाकी है तो सटीक देय राशि लाल अक्षरों में दर्ज कर देता है।\n३. "टी.सी. निर्गमन व नाम पृथक करें" दबाते ही छात्र का स्टेटस "transferred" हो जाता है और दाखिल-खारिज (S.R.) पंजिका स्वतः खारिज दर्ज कर देती है।',
    tips: [
      'निर्गमित TC पर सुरक्षित QR कोड होता है जिसे कोई भी विद्यालय मुख्य पृष्ठ पर "टीसी सत्यापन" बटन से ऑनलाइन जांच सकता है।'
    ]
  },
  {
    id: 'guide-paper-bridge',
    category: 'paper-bridge',
    categoryLabel: 'A4 पेपर सेतु',
    question: 'बिजली या इंटरनेट न होने पर भौतिक प्रवेश प्रपत्र और 31-दिवसीय उपस्थिति शीट कैसे प्रिंट करें?',
    answer: 'छात्र विवरण में "📄 रिक्त प्रवेश प्रपत्र" या उपस्थिति टैब में "📋 31-दिवसीय पंजिका शीट" पर क्लिक करें (या Ctrl + K दबाकर सर्च करें):\n१. रिक्त प्रवेश फॉर्म में पासपोर्ट फोटो बॉक्स, सनातन ध्येय वाक्य "सा विद्या या विमुक्तये", सहोदर (भाई-बहन) शुल्क छूट प्रभाग और अभिभावक घोषणा पत्र A4 लेआउट में प्रिंट होता है।\n२. 31-दिवसीय उपस्थिति शीट में कक्षा चुनते ही सभी छात्रों के नाम व रोल नंबर पहले से सुंदर टाइपोग्राफिक ग्रिड में छपते हैं, जिससे हाथ से नाम नहीं लिखना पड़ता।',
    tips: [
      'न केवल डिजिटल बल्कि ऑफ-लाइन भौतिक विद्यालयी कार्यप्रवाह भी 100% सुचारू और वैदिक गरिमा के अनुरूप रहता है।'
    ]
  },
  {
    id: 'guide-sankul',
    category: 'sankul',
    categoryLabel: 'संकुल क्लस्टर',
    question: 'संकुल प्रभारी पटल क्या है और क्लस्टर स्तर पर बहु-विद्यालय निरीक्षण कैसे करें?',
    answer: 'विद्या भारती की संगठनात्मक व्यवस्था में ५ से १५ समीपवर्ती विद्यालयों का एक संकुल होता है। संकुल प्रभारी पटल के माध्यम से:\n१. मुख्य पृष्ठ पर "पोर्टल लॉगिन" से "संकुल पटल (संकुल प्रभारी)" चुनें और अपना संकुल व अधिकृत पासकोड दर्ज करें।\n२. डैशबोर्ड पर सभी संबद्ध विद्यालयों के कुल छात्र, लिंगानुपात, आचार्य संख्या, औसत उपस्थिति % और शुल्क वसूली की संकलित रिपोर्ट देखें।\n३. "सम्बद्ध विद्यालय पंजिका" में किसी भी विद्यालय के आगे "निरीक्षण करें" दबाकर शैक्षणिक गुणवत्ता, आधारभूत संरचना और पंचमुखी शिक्षा की ५-स्टार रेटिंग व सुधारात्मक बिंदु दर्ज करें।\n४. "परिपत्र" टैब से संकुल स्तरीय खेलकूद, कार्यशाला या प्रधानाचार्य बैठक का परिपत्र जारी करें या A4 प्रतिवेदन प्रिंट करें।',
    tips: [
      'संकुल पटल पर प्रत्येक विद्यालय की अलग-अलग UDISE+ और पंचमुखी स्थिति का तुलनात्मक विश्लेषण १-क्लिक में उपलब्ध रहता है।'
    ]
  }
];

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenSessionModal,
  onOpenAuditModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('daily-1');

  const filteredGuides = useMemo(() => {
    return GUIDE_ITEMS.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [searchTerm, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-inner">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  व्यवस्थापक मार्गदर्शिका व समस्या निवारक (Help & Troubleshooting)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  सक्रिय सहायता केंद्र
                </span>
              </div>
              <p className="text-xs text-stone-300">
                सत्र परिवर्तन, परीक्षा अंकन, लॉगिन व वित्तीय संचालन के सभी सामान्य प्रश्नों के आधिकारिक समाधान
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-stone-200 bg-stone-50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="समस्या या विषय खोजें (उदा. सत्र, पिन, अंक, पासवर्ड, फीस)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mobile Category Dropdown (sm:hidden) - Dashboard Consistent */}
          <div className="sm:hidden">
            <label htmlFor="mobile-help-category" className="sr-only">विषय चुनें</label>
            <div className="relative">
              <select
                id="mobile-help-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 appearance-none focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
              >
                {HELP_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-500 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Desktop & Tablet Wrapped Category Pills (hidden sm:flex) - No Horizontal Scroll */}
          <div className="hidden sm:flex flex-wrap items-center gap-1.5 text-xs">
            {HELP_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-stone-50/40">
          {filteredGuides.length === 0 ? (
            <div className="py-16 text-center text-stone-400 text-xs">
              <HelpCircle className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="font-bold text-stone-700">कोई संबंधित मार्गदर्शिका नहीं मिली</p>
              <p className="text-xs text-stone-500 mt-1">कृपया कोई अन्य शब्द या विषय चुनकर खोजें।</p>
            </div>
          ) : (
            filteredGuides.map(item => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs transition hover:border-amber-300"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-stone-900 hover:bg-amber-50/30 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        {item.categoryLabel}
                      </span>
                      <span>{item.question}</span>
                    </div>
                    <div className="text-stone-400 shrink-0">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-stone-100 text-xs text-stone-700 space-y-3 bg-stone-50/30">
                      <p className="leading-relaxed whitespace-pre-line font-medium">
                        {item.answer}
                      </p>

                      {item.tips && item.tips.length > 0 && (
                        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                          <div className="font-bold text-[11px] flex items-center gap-1 text-amber-900 uppercase">
                            <Sparkles className="w-3 h-3 text-amber-600" /> महत्वपूर्ण सुझाव (Key Tip):
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                            {item.tips.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.actionLabel && (
                        <div className="pt-1">
                          <button
                            onClick={() => {
                              onClose();
                              if (item.actionType === 'session' && onOpenSessionModal) {
                                onOpenSessionModal();
                              } else if (item.actionType === 'audit' && onOpenAuditModal) {
                                onOpenAuditModal();
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
                          >
                            <span>{item.actionLabel}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>सरस्वती शिशु मंदिर डिजिटल सहायता एवं ज्ञानकोष (Vidya Bharati ERP Help Center)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpGuideModal;

