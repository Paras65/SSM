import React, { useState } from 'react';
import {
  CheckCircle2,
  Receipt,
  Award,
  FileSpreadsheet,
  IdCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Camera,
  BookOpen,
  Printer,
  FileCheck,
  Bus,
  Command,
  HelpCircle,
  ChevronRight,
  Building2,
  FileText,
  Sun
} from 'lucide-react';

interface ERPModulesSectionProps {
  onOpenSignUp?: () => void;
  onOpenLogin?: () => void;
  onOpenHelpGuide?: () => void;
}

type PillarId = 'all' | 'daily' | 'academic' | 'compliance' | 'logistics';

interface ModuleItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  badgeColor: string;
  title: string;
  desc: string;
  features: string[];
}

interface Pillar {
  id: 'daily' | 'academic' | 'compliance' | 'logistics';
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  headerBg: string;
  icon: React.ComponentType<{ className?: string }>;
  modules: ModuleItem[];
}

export const ERPModulesSection: React.FC<ERPModulesSectionProps> = ({
  onOpenSignUp,
  onOpenHelpGuide
}) => {
  const [activePillar, setActivePillar] = useState<PillarId>('all');

  const pillarTabs = [
    { id: 'all', label: 'सभी ४ स्तम्भ (All 4 Pillars)', icon: Sparkles },
    { id: 'daily', label: '🌅 १. दैनिक संचालन', icon: Sun },
    { id: 'academic', label: '📚 २. परीक्षा व मूल्यांकन', icon: Award },
    { id: 'compliance', label: '🏛️ ३. छात्र अभिलेख व सरकार', icon: BookOpen },
    { id: 'logistics', label: '🚌 ४. संसाधन, संकुल व सुरक्षा', icon: ShieldCheck }
  ];

  const pillars: Pillar[] = [
    {
      id: 'daily',
      number: 'स्तम्भ १',
      title: 'प्रातःकालीन व दैनिक विद्यालयी संचालन (Daily Operations)',
      subtitle: 'प्रातः 07:00 से सायं 04:00 तक का दैनिक विद्यालयी प्रवाह — हाजिरी, शुल्क काउंटर, रोकड़ बही व नोटिस।',
      badge: 'दैनिक दिनचर्या (Daily Core)',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      headerBg: 'from-emerald-500/10 via-teal-500/5 to-white border-emerald-200',
      icon: Sun,
      modules: [
        {
          id: 'attendance-broadcaster',
          icon: CheckCircle2,
          badge: '1-क्लिक ब्रॉडकास्ट (Sec 32)',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          title: 'दैनिक उपस्थिति व अनुपस्थित व्हाट्सएप प्रसारण',
          desc: 'आचार्य केवल 30 सेकंड में हाजिरी लगाएं। लाल अलर्ट बैज से 1-क्लिक बैच कतार में अनुपस्थित छात्रों के अभिभावकों को सीधे सम्मानजनक संदेश भेजें।',
          features: ['सजीव अनुपस्थित पहचान कतार', 'आधिकारिक WhatsApp प्रोटोकॉल', 'शून्य स्पैम व बिना ब्लॉक जोखिम']
        },
        {
          id: 'dcr-cash-counter',
          icon: Receipt,
          badge: 'रोकड़ मिलान (Sec 33)',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          title: 'शुल्क काउंटर, दैनिक रोकड़ बही (DCR) व नोट मिलान',
          desc: '↵ Enter दबाकर तुरंत रोल नंबर खोजें और रसीद काटें। शाम को ₹500, ₹200, ₹100 आदि भौतिक नोटों का मिलान करें और A4 ऑडिट-रेडी रोकड़ बही प्रिंट करें।',
          features: ['भौतिक नकद दराज नोट मिलान', 'पक्की द्विभाषी रसीद प्रिंट', 'ऑडिट-रेडी A4 दैनिक बही']
        },
        {
          id: 'school-logistics',
          icon: Bus,
          badge: 'परिचालन (Sec 6, 8, 9, 10)',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          title: 'समय सारिणी, पुस्तकालय, वाहन एवं भंडार स्टॉक',
          desc: 'विद्यालय का संपूर्ण परिचालन एक ही जगह: 8-घंटी समय सारिणी रोस्टर, पुस्तक निर्गमन/वापसी, वाहन रूट व चालक संपर्क, और गणवेश/किताबों का इन्वेंट्री स्टॉक।',
          features: ['आचार्य समय सारिणी (Timetable)', 'बारकोड/पुस्तक निर्गमन व जुर्माना', 'वाहन रूट व गणवेश भंडार स्टॉक']
        }
      ]
    },
    {
      id: 'academic',
      number: 'स्तम्भ २',
      title: 'परीक्षा, AI पेपर व 360° मूल्यांकन (Exams & Evaluation)',
      subtitle: 'इकाई मूल्यांकन व त्रैमासिक परीक्षा से लेकर वार्षिक 360° प्रगति पत्र एवं परीक्षा परिणाम गजट तक।',
      badge: 'शैक्षणिक व परीक्षा (Academics)',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      headerBg: 'from-purple-500/10 via-indigo-500/5 to-white border-purple-200',
      icon: Award,
      modules: [
        {
          id: 'question-paper-generator',
          icon: FileText,
          badge: 'स्मार्ट ब्लूप्रिंट (Sec 38)',
          badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
          title: 'स्मार्ट प्रश्न पत्र निर्माता (Unit Test & Traimasik)',
          desc: 'मासिक इकाई मूल्यांकन एवं त्रैमासिक परीक्षा हेतु पाठ्यक्रम प्रगति (अध्याय) आधारित १-क्लिक संतुलित प्रश्न पत्र निर्माण, सजीव अंक मिलान व A4 परीक्षा मुद्रण।',
          features: ['मासिक पाठ्यक्रम प्रगति चयन', 'सजीव अंक संतुलन (Live Balance)', 'A4 प्रिंट-रेडी परीक्षा लेआउट']
        },
        {
          id: 'bulk-id-hall-ticket',
          icon: IdCard,
          badge: 'A4 बल्क प्रिंट (Sec 5, 26)',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          title: 'कक्षावार 8-आईडी कार्ड प्रति A4 शीट व परीक्षा हॉल टिकट',
          desc: 'A4 पेपर पर 8 पहचान पत्र कटिंग गाइड्स, फोटो, ब्लड ग्रुप व आपातकालीन संपर्क के साथ प्रिंट करें। साथ ही रोल नंबर वार परीक्षा प्रवेश पत्र जारी करें।',
          features: ['8 कार्ड प्रति A4 शीट कटिंग गाइड', 'परीक्षा हॉल टिकट (Admit Cards)', 'चरित्र व अध्ययन प्रमाण पत्र']
        },
        {
          id: 'hpc-marks-matrix',
          icon: Award,
          badge: 'NEP 2020 अनुरूप (Sec 25, 34)',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          title: '360° समग्र प्रगति पत्र (HPC) व कीबोर्ड अंक मैट्रिक्स',
          desc: 'विद्या भारती के पंचमुखी आयामों सहित 360° रिपोर्ट कार्ड। बिना माउस केवल ↵ Enter व तीर कुंजियों (↑ / ↓) से द्रुत गति से परीक्षा अंक दर्ज करें।',
          features: ['पंचमुखी आयाम समग्र ग्रेडिंग', 'बिना माउस वर्टिकल अंक प्रविष्टि', 'कक्षावार 40+ बल्क A4 प्रिंट']
        }
      ]
    },
    {
      id: 'compliance',
      number: 'स्तम्भ ३',
      title: 'छात्र अभिलेख, दाखिला व शासकीय अनुपालन (Registry & Govt Compliance)',
      subtitle: 'प्रवेश से लेकर टी.सी. निर्गमन एवं भारत सरकार UDISE+ व APAAR ID तक का संपूर्ण वैधानिक अभिलेख।',
      badge: 'वैधानिक व सरकारी (Govt Records)',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      headerBg: 'from-rose-500/10 via-orange-500/5 to-white border-rose-200',
      icon: BookOpen,
      modules: [
        {
          id: 'register-ai-scanner',
          icon: Camera,
          badge: 'शून्य-जटिलता OCR (Sec 31)',
          badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
          title: 'हार्ड-कॉपी रजिस्टर AI स्कैनर व त्वरित प्रवेश',
          desc: 'पुराने हस्तलिखित उपस्थिति या प्रवेश रजिस्टरों की फोटो खींचते ही स्प्लिट-स्क्रीन में छात्र विवरण स्वतः भरें। ↵ Enter कुंजी से तेज़ी से पंक्तियां जोड़ें।',
          features: ['स्प्लिट-स्क्रीन रोटेट/ज़ूम फोटो', 'Google Gemini Vision AI', '↵ Enter ऑटो-जंप तेज़ टाइपिंग']
        },
        {
          id: 'dakhil-kharij-register',
          icon: BookOpen,
          badge: 'वैधानिक पंजिका (Sec 28)',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          title: 'दाखिल-खारिज पंजिका (General S.R. Register)',
          desc: '17-कॉलम पारंपरिक व कानूनी छात्र प्रवेश-निकासी पंजिका। आजीवन छात्र रिकॉर्ड, वर्णानुक्रम (Alphabetical) छात्र सूची और 1-क्लिक सरकारी ऑडिट प्रिंट।',
          features: ['17-कॉलम वैधानिक लेआउट', 'दाखिल व खारिज स्थिति ट्रैकिंग', 'एक्सेल व PDF मुद्रण']
        },
        {
          id: 'dynamic-tc-sync',
          icon: FileCheck,
          badge: 'सजीव गणना (Sec 35)',
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
          title: 'स्थानांतरण प्रमाण पत्र (Dynamic TC) व सजीव नो-ड्यूज',
          desc: 'TC जनरेट करते ही सत्र के उपस्थित/कुल दिवसों की स्वतः गणना (उदा. 212/224 दिन) और वास्तविक समय में बकाया शुल्क स्थिति। 1-क्लिक नाम पृथक्करण।',
          features: ['स्वचालित उपस्थिति दिवस गणना', 'सजीव शुल्क बकाया (No-Dues) जांच', 'ऑनलाइन QR कोड टीसी सत्यापन']
        },
        {
          id: 'udise-sdms',
          icon: FileSpreadsheet,
          badge: 'भारत सरकार (Sec 22)',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
          title: 'UDISE+ SDMS, 11-अंकीय PEN व APAAR ID',
          desc: 'छात्रों के 11-अंकीय PEN, 12-अंकीय APAAR ID, सामाजिक श्रेणी (Gen/OBC/SC/ST) और CWSN का संधारण। 21-कॉलम सरकारी बैच CSV 1-क्लिक में डाउनलोड करें।',
          features: ['स्थायी शिक्षा संख्या (PEN) ट्रैकर', 'APAAR ID डुप्लीकेट गार्ड', '21-कॉलम UDISE+ CSV एक्सपोर्ट']
        }
      ]
    },
    {
      id: 'logistics',
      number: 'स्तम्भ ४',
      title: 'संसाधन, संकुल व संस्थागत सुरक्षा (Logistics, Cluster & Governance)',
      subtitle: 'स्कूल की भौतिक संपत्ति, वाहन, पुस्तकालय, संकुल क्लस्टर निरीक्षण व सुरक्षित डेटा बैकअप।',
      badge: 'प्रशासन व सुरक्षा (Governance)',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      headerBg: 'from-amber-500/10 via-orange-500/5 to-white border-amber-200',
      icon: ShieldCheck,
      modules: [
        {
          id: 'paper-bridges',
          icon: Printer,
          badge: 'ऑफ़लाइन सेतु (Sec 36)',
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
          title: 'ऑफ़लाइन हार्ड-कॉपी सेतु: A4 फॉर्म्स व 31-दिवसीय पंजिका',
          desc: 'इंटरनेट न होने पर भौतिक संचालन हेतु A4 रिक्त प्रवेश प्रपत्र (सहोदर छूट प्रभाग, वैदिक प्रारूप सहित) एवं 31-दिवसीय मासिक उपस्थिति शीट मुद्रण।',
          features: ['A4 प्रिंट योग्य रिक्त प्रवेश फॉर्म', '31-दिवसीय मासिक उपस्थिति शीट', 'नामांकित अथवा रिक्त पंक्तियां']
        },
        {
          id: 'command-palette',
          icon: Command,
          badge: 'समय बचत (Sec 30)',
          badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
          title: 'ग्लोबल क्विक कमांड पैलेट (Ctrl + K Spotlight Search)',
          desc: 'कीबोर्ड पर कहीं भी Ctrl + K दबाएं और छात्र का नाम, रोल नंबर, फीस काउंटर या कोई भी रिपोर्ट 1 सेकंड में खोजें। माउस क्लिक के समय की 90% बचत।',
          features: ['कीबोर्ड शॉर्टकट (Ctrl + K)', 'फजी छात्र व मॉड्यूल सर्च', '1-क्लिक त्वरित क्रियान्वयन']
        },
        {
          id: 'session-security',
          icon: ShieldCheck,
          badge: 'सुरक्षा व बैकअप (Sec 13, 23)',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          title: 'वार्षिक सत्र परिवर्तन, छात्र प्रोन्नति व सुरक्षा ऑडिट लॉग्स',
          desc: 'वार्षिक परीक्षा लॉक, पिछले सत्र का बकाया रोलओवर और कक्षा प्रोन्नति। शाम को 1-क्लिक एन्क्रिप्टेड डेटा बैकअप व DPDP Act 2023 गोपनीयता अनुपालन।',
          features: ['वार्षिक सत्र प्रोन्नति व रोलओवर', '1-क्लिक ऑफ़लाइन JSON बैकअप', 'ऑडिट लॉग्स व DPDP 2023 सुरक्षा']
        },
        {
          id: 'sankul-cluster-oversight',
          icon: Building2,
          badge: 'क्लस्टर प्रबंधन (Sec 37)',
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          title: 'संकुल प्रभारी पटल: बहु-विद्यालय क्लस्टर निरीक्षण एवं संकलित प्रबंधन',
          desc: 'संकुल (क्लस्टर) स्तर पर 5-15 संबद्ध विद्यालयों की समग्र समीक्षा, NEP 2020 व पंचमुखी शिक्षा अनुपालन, डिजिटल निरीक्षण व गुणवत्ता स्टार रेटिंग, और संकुल परिपत्र जारी करना।',
          features: ['बहु-विद्यालय क्लस्टर एनालिटिक्स', 'पंचमुखी व भौतिक निरीक्षण पंजिका', 'संकुल परिपत्र एवं आधिकारिक प्रिंट']
        }
      ]
    }
  ];

  const visiblePillars = activePillar === 'all'
    ? pillars
    : pillars.filter(p => p.id === activePillar);

  return (
    <section id="modules" className="py-16 sm:py-20 bg-gradient-to-b from-white via-orange-50/40 to-stone-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-950 text-xs font-bold uppercase tracking-wider mb-2.5 border border-orange-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>३८-अध्यायी आधिकारिक मार्गदर्शिका अनुरूप (User Manual Aligned)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            विद्यालय कार्यप्रवाह आधारित <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-600 bg-clip-text text-transparent">
              ४ प्रमुख उपयोग-मामले (Use-Case Pillars)
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            १४ बिखरे हुए टूल्स के बजाय, आपके विद्यालय के संपूर्ण संचालन को ४ स्पष्ट स्तम्भों में समेटा गया है — ताकि कोई भी गैर-तकनीकी उपयोगकर्ता १-क्लिक में अपना काम पूरा कर सके।
          </p>

          {/* User Manual Shortcut CTA Button */}
          {onOpenHelpGuide && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onOpenHelpGuide}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100/80 hover:bg-amber-100 text-orange-950 font-bold text-xs border border-orange-300 shadow-2xs transition-all cursor-pointer hover:border-orange-400"
              >
                <HelpCircle className="w-4 h-4 text-orange-600" />
                <span>📖 संपूर्ण ३८-अध्यायी उपयोगकर्ता मार्गदर्शिका (User Manual) देखें</span>
                <ChevronRight className="w-3.5 h-3.5 text-orange-600" />
              </button>
            </div>
          )}
        </div>

        {/* Pillar Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {pillarTabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activePillar === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePillar(tab.id as PillarId)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md scale-102'
                    : 'bg-white text-stone-700 hover:bg-orange-50 hover:text-orange-900 border border-stone-200'
                }`}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-orange-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4 Pillars Display */}
        <div className="space-y-12">
          {visiblePillars.map((pillar) => {
            const PillarIcon = pillar.icon;
            return (
              <div key={pillar.id} className="space-y-4">
                {/* Pillar Header Banner */}
                <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r ${pillar.headerBg} border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-stone-200 flex items-center justify-center text-xl shrink-0">
                      <PillarIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-orange-700">{pillar.number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pillar.badgeColor}`}>{pillar.badge}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-stone-900 leading-snug">{pillar.title}</h3>
                      <p className="text-xs text-stone-600 mt-0.5">{pillar.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Modules Grid under Pillar */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pillar.modules.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <div
                        key={mod.id}
                        className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-orange-50 group-hover:bg-orange-600 text-orange-700 group-hover:text-white border border-orange-200 flex items-center justify-center transition-colors shadow-2xs">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${mod.badgeColor}`}>
                              {mod.badge}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-stone-900 group-hover:text-orange-950 transition-colors leading-snug">
                            {mod.title}
                          </h4>
                          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                            {mod.desc}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-stone-100">
                          <ul className="space-y-1.5 text-xs text-stone-700 font-medium">
                            {mod.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3-Step How It Works Banner */}
        <div className="mt-14 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-orange-700 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">सरल शुरुआत (Quick Onboarding)</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              ३ आसान चरणों में अपने विद्यालय को डिजिटल बनाएं
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <span className="w-8 h-8 rounded-full bg-amber-400 text-stone-900 font-black text-sm flex items-center justify-center mb-3 mx-auto md:mx-0">
                १
              </span>
              <h4 className="font-bold text-amber-200 text-sm">विद्यालय पंजीकृत करें</h4>
              <p className="text-xs text-stone-300 mt-1">
                अपने शिशु मंदिर का नाम, शहर, मान्यता क्रमांक और 4-अंकीय सुरक्षा पासकोड दर्ज करें।
              </p>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <span className="w-8 h-8 rounded-full bg-amber-400 text-stone-900 font-black text-sm flex items-center justify-center mb-3 mx-auto md:mx-0">
                २
              </span>
              <h4 className="font-bold text-amber-200 text-sm">छात्र व आचार्य विवरण जोड़ें</h4>
              <p className="text-xs text-stone-300 mt-1">
                कक्षावार छात्रों का नामांकन करें, रजिस्टर फोटो स्कैन करें या एक्सेल से 1-क्लिक में थोक आयात करें।
              </p>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <span className="w-8 h-8 rounded-full bg-amber-400 text-stone-900 font-black text-sm flex items-center justify-center mb-3 mx-auto md:mx-0">
                ३
              </span>
              <h4 className="font-bold text-amber-200 text-sm">दैनिक संचालन शुरू करें</h4>
              <p className="text-xs text-stone-300 mt-1">
                हाजिरी लगाएं, DCR नोट मिलान करें, व्हाट्सएप सूचनाएं भेजें और UDISE+ रिपोर्ट प्राप्त करें।
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-300 text-center sm:text-left">
              <span>🌟 विद्या भारती विद्यालयों के लिए निःशुल्क सेवा उपलब्ध • </span>
              <span className="text-amber-300 font-bold">100% सुरक्षित एवं विज्ञापन-मुक्त</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onOpenHelpGuide && (
                <button
                  type="button"
                  onClick={onOpenHelpGuide}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>उपयोगकर्ता मार्गदर्शिका</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenSignUp}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <span>🚀 नया विद्यालय पंजीकृत करें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
