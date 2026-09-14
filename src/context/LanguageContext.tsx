import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hi' | 'en' | 'sa' | 'bn' | 'gu' | 'or' | 'cg';

export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string; region: string }[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'उत्तर एवं मध्य भारत' },
  { code: 'en', name: 'English', nativeName: 'English', region: 'All India' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'देववाणी / अखिल भारतीय' },
  { code: 'cg', name: 'Chhattisgarhi', nativeName: 'छत्तीसगढ़ी', region: 'छत्तीसगढ़ प्रांत' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'पश्चिम बंगाल / त्रिपुरा' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'गुजरात प्रांत' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'ओडिशा प्रांत' }
];

interface Translations {
  [key: string]: {
    [lang in Language]?: string;
  };
}

export const translations: Translations = {
  navHome: { hi: 'मुख्य पृष्ठ', en: 'Home', sa: 'मुख्यपृष्ठम्', cg: 'मुख्य पाना', bn: 'মূল পাতা', gu: 'મુખ્ય પૃષ્ઠ', or: 'ମୁଖ୍ୟ ପୃଷ୍ଠା' },
  navPanchmukhi: { hi: 'पंचमुखी शिक्षा', en: 'Panchmukhi System', sa: 'पञ्चमुखी शिक्षा', cg: 'पंचमुखी शिक्षा', bn: 'পঞ্চমুখী শিক্ষা', gu: 'પંચમુખી શિક્ષણ', or: 'ପଞ୍ଚମୁଖୀ ଶିକ୍ଷା' },
  navDailyRoutine: { hi: 'दैनिक दिनचर्या', en: 'Daily Routine', sa: 'दैनन्दिनी दिनचर्या', cg: 'रोज के दिनचर्या', bn: 'দৈনিক রুটিন', gu: 'દૈનિક દિનચર્યા', or: 'ଦୈନିକ ଦିନଚର୍ଯ୍ୟା' },
  navNotices: { hi: 'सूचना पट्ट', en: 'Notices', sa: 'सूचनापट्टः', cg: 'सूचना पट्ट (खबर)', bn: 'বিজ্ঞপ্তি ফলক', gu: 'સૂચના પટ્ટ', or: 'ସୂଚନା ଫଳକ' },
  navAdmissions: { hi: 'प्रवेश 2026-27', en: 'Admissions 2026-27', sa: 'प्रवेशः २०२६-२७', cg: 'नवा भरती २०२६-२७', bn: 'ভর্তি ২০২৬-২৭', gu: 'પ્રવેશ ૨૦૨૬-૨૭', or: 'ନାମଲେଖା ୨୦୨୬-୨୭' },
  navPortal: { hi: 'छात्र पोर्टल', en: 'Student Portal', sa: 'छात्रप्रवेशद्वारम्', cg: 'लइका मन के पोर्टल', bn: 'ছাত্র পোর্টাল', gu: 'વિદ્યાર્થી પોર્ટલ', or: 'ଛାତ୍ର ପୋର୍ଟାଲ' },
  navAdmin: { hi: 'आचार्य ERP', en: 'Teacher ERP', sa: 'आचार्य ईआरपी', cg: 'गुरुजी ERP', bn: 'শিক্ষক ইআরপি', gu: 'આચાર્ય ERP', or: 'ଆଚାର୍ଯ୍ୟ ERP' },
  switchSchool: { hi: 'शाखा बदलें', en: 'Change Branch', sa: 'शाखां परिवर्तयतु', cg: 'शाखा बदलो', bn: 'শাখা পরিবর্তন', gu: 'શાખા બદલો', or: 'ଶାଖା ପରିବର୍ତ୍ତନ' },
  
  // Dashboard & Sections
  tabStudents: { hi: 'विद्यार्थी पंजिका', en: 'Students Directory', cg: 'लइका मन के रजिस्टर' },
  tabAttendance: { hi: 'दैनिक उपस्थिति', en: 'Daily Attendance', cg: 'रोज के हाजिरी' },
  tabFees: { hi: 'शुल्क प्रबंधन', en: 'Fee Management', cg: 'फीस के खाता' },
  tabReports: { hi: 'प्रगति पत्र', en: 'Report Cards', cg: 'परगति पत्र (रिजल्ट)' },
  tabNotices: { hi: 'सूचना पट्ट', en: 'Notice Board', cg: 'खबर पट्ट' },
  tabHomework: { hi: 'दैनिक गृहकार्य', en: 'Daily Homework', cg: 'घर के काम (होमवर्क)' },
  tabStaff: { hi: 'आचार्य एवं वेतन', en: 'Staff & Payroll', cg: 'आचार्य व तनख्वाह' },
  tabAdmissions: { hi: 'प्रवेश आवेदन', en: 'Admission Inquiries', cg: 'प्रवेश अरजी' },

  // Actions
  addHomework: { hi: 'नया गृहकार्य जोड़ें', en: 'Assign New Homework' },
  addStaff: { hi: 'नए आचार्य/कर्मचारी जोड़ें', en: 'Add Staff Member' },
  salarySlip: { hi: 'वेतन पर्ची', en: 'Salary Slip' },
  whatsappAlert: { hi: 'WhatsApp अलर्ट', en: 'WhatsApp Alert' },
  uploadPhoto: { hi: 'फोटो बदलें', en: 'Change Photo' },
  save: { hi: 'सुरक्षित करें', en: 'Save', cg: 'संजो के राखव' },
  cancel: { hi: 'रद्द करें', en: 'Cancel', cg: 'रद्द करव' },
  search: { hi: 'खोजें...', en: 'Search...', cg: 'खोजव...' },
  print: { hi: 'प्रिंट करें', en: 'Print Document', cg: 'छापव (प्रिंट)' },
  close: { hi: 'बंद करें', en: 'Close', cg: 'बंद करव' }
  ,privacyNotice: { hi: 'गोपनीयता नीति', en: 'Privacy Policy' }
  ,termsOfUse: { hi: 'उपयोग की शर्तें', en: 'Terms of Use' }
  ,guardianConsent: { hi: 'मैं छात्र का अभिभावक/अधिकृत संरक्षक हूं और चुनी गई शाखा द्वारा इस प्रवेश पूछताछ के लिए दिए गए विवरण के उपयोग और संपर्क की सहमति देता/देती हूं।', en: 'I am the student\'s parent or authorised guardian and consent to the selected branch using these details and contacting me about this admission enquiry.' }
  ,applicationFailed: { hi: 'आवेदन जमा नहीं हो सका। कृपया पुनः प्रयास करें या सीधे चुनी गई शाखा से संपर्क करें।', en: 'The application could not be submitted. Please try again or contact the selected branch directly.' }
  ,selectBranch: { hi: 'कृपया प्रवेश के लिए विद्यालय शाखा चुनें।', en: 'Please select a school branch for the admission enquiry.' }
  ,enterRequiredDetails: { hi: 'कृपया छात्र का नाम एवं संपर्क नंबर भरें।', en: 'Please enter the student name and contact number.' }
  ,consentRequired: { hi: 'कृपया अभिभावक/अधिकृत संरक्षक की सहमति दें।', en: 'Parent or authorised guardian consent is required.' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ssm_language') as Language) || 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ssm_language', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language] as string;
    }
    if (translations[key] && translations[key]['hi']) {
      return translations[key]['hi'] as string;
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

