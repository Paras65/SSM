import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hi' | 'en';

interface Translations {
  [key: string]: {
    hi: string;
    en: string;
  };
}

export const translations: Translations = {
  navHome: { hi: 'मुख्य पृष्ठ', en: 'Home' },
  navPanchmukhi: { hi: 'पंचमुखी शिक्षा', en: 'Panchmukhi System' },
  navDailyRoutine: { hi: 'दैनिक दिनचर्या', en: 'Daily Routine' },
  navNotices: { hi: 'सूचना पट्ट', en: 'Notices' },
  navAdmissions: { hi: 'प्रवेश 2026-27', en: 'Admissions 2026-27' },
  navPortal: { hi: 'छात्र पोर्टल', en: 'Student Portal' },
  navAdmin: { hi: 'आचार्य ERP', en: 'Teacher ERP' },
  switchSchool: { hi: 'शाखा बदलें', en: 'Change Branch' },
  
  // Dashboard & Sections
  tabStudents: { hi: 'विद्यार्थी पंजिका', en: 'Students Directory' },
  tabAttendance: { hi: 'दैनिक उपस्थिति', en: 'Daily Attendance' },
  tabFees: { hi: 'शुल्क प्रबंधन', en: 'Fee Management' },
  tabReports: { hi: 'प्रगति पत्र', en: 'Report Cards' },
  tabNotices: { hi: 'सूचना पट्ट', en: 'Notice Board' },
  tabHomework: { hi: 'दैनिक गृहकार्य', en: 'Daily Homework' },
  tabStaff: { hi: 'आचार्य एवं वेतन', en: 'Staff & Payroll' },
  tabAdmissions: { hi: 'प्रवेश आवेदन', en: 'Admission Inquiries' },

  // Actions
  addHomework: { hi: 'नया गृहकार्य जोड़ें', en: 'Assign New Homework' },
  addStaff: { hi: 'नए आचार्य/कर्मचारी जोड़ें', en: 'Add Staff Member' },
  salarySlip: { hi: 'वेतन पर्ची', en: 'Salary Slip' },
  whatsappAlert: { hi: 'WhatsApp अलर्ट', en: 'WhatsApp Alert' },
  uploadPhoto: { hi: 'फोटो बदलें', en: 'Change Photo' },
  save: { hi: 'सुरक्षित करें', en: 'Save' },
  cancel: { hi: 'रद्द करें', en: 'Cancel' },
  search: { hi: 'खोजें...', en: 'Search...' },
  print: { hi: 'प्रिंट करें', en: 'Print Document' },
  close: { hi: 'बंद करें', en: 'Close' }
  ,privacyNotice: { hi: 'गोपनीयता सूचना', en: 'Privacy Notice' }
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
      return translations[key][language];
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

