import React from 'react';
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
  Sun,
  Clock,
  Users,
  Lock,
  Sparkle
} from 'lucide-react';

interface ERPModulesSectionProps {
  onOpenSignUp?: () => void;
  onOpenLogin?: () => void;
  onOpenHelpGuide?: () => void;
}

interface WorkflowItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  badge?: string;
}

interface MasterPillar {
  id: string;
  pillarNo: string;
  title: string;
  englishTitle: string;
  subtitle: string;
  timingBadge: string;
  badgeColor: string;
  borderColor: string;
  cardBg: string;
  headerIcon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  workflows: WorkflowItem[];
  footerNote: string;
}

export const ERPModulesSection: React.FC<ERPModulesSectionProps> = ({
  onOpenSignUp,
  onOpenHelpGuide
}) => {
  const masterPillars: MasterPillar[] = [
    {
      id: 'daily-ops',
      pillarNo: 'स्तम्भ १',
      title: 'प्रातःकालीन व दैनिक विद्यालयी संचालन',
      englishTitle: 'Daily School Operations',
      subtitle: 'विद्यालय खुलते ही उपस्थिति, शुल्क काउंटर, दैनिक रोकड़ बही व सूचना प्रसारण।',
      timingBadge: 'प्रातः 07:00 से सायं 04:00 (दैनिक दिनचर्या)',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      cardBg: 'bg-gradient-to-b from-emerald-50/30 via-white to-white',
      headerIcon: Sun,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      workflows: [
        {
          icon: CheckCircle2,
          title: 'दैनिक उपस्थिति, WhatsApp व प्रधानाचार्य सार',
          desc: 'आचार्य 30 सेकंड में हाजिरी लगाएं। अनुपस्थित छात्रों के अभिभावकों को संदेश भेजें तथा दोपहर 3 बजे प्रधानाचार्य को 1-क्लिक दैनिक प्रशासनिक सार प्रेषित करें।',
          badge: 'Sec 32, 42'
        },
        {
          icon: Receipt,
          title: 'शुल्क काउंटर, रसीद व DCR भौतिक नोट मिलान',
          desc: '↵ Enter दबाकर तुरंत छात्र खोजें और पक्की रसीद काटें। शाम को ₹500, ₹200, ₹100 नोटों का मिलान कर A4 ऑडिट-रेडी रोकड़ बही प्रिंट करें।',
          badge: 'Sec 33'
        },
        {
          icon: Bus,
          title: 'आचार्य पटल, गृहकार्य व 8-घंटी समय-सारिणी',
          desc: 'बोलकर (वॉइस) 1-क्लिक में गृहकार्य असाइन करें। 8-कालखंड टकराव-मुक्त रोस्टर, कक्षावार डायरी और आधिकारिक परिपत्र प्रसारण।',
          badge: 'Sec 6, 30'
        }
      ],
      footerNote: '✨ दैनिक प्रशासनिक समय की बचत • व्यवस्थित विद्यालयी संचालन'
    },
    {
      id: 'exams-evaluation',
      pillarNo: 'स्तम्भ २',
      title: 'परीक्षा, स्मार्ट प्रश्न पत्र व 360° मूल्यांकन',
      englishTitle: 'Exams, Smart Papers & 360° Evaluation',
      subtitle: 'इकाई मूल्यांकन व त्रैमासिक परीक्षा से लेकर वार्षिक 360° प्रगति पत्र एवं TR शीट तक।',
      timingBadge: 'इकाई मूल्यांकन से वार्षिक परिणाम तक',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      borderColor: 'border-purple-200 hover:border-purple-400',
      cardBg: 'bg-gradient-to-b from-purple-50/30 via-white to-white',
      headerIcon: Award,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      workflows: [
        {
          icon: FileText,
          title: 'स्मार्ट प्रश्न पत्र निर्माता व बौद्धिक ब्लूप्रिंट',
          desc: 'NEP 2020 ब्लूप्रिंट अनुसार ज्ञान, बोध, अनुप्रयोग व चिंतन आधारित संतुलित A4 प्रश्न पत्र तैयार करें। अंतर्निहित प्रश्न बैंक व सजीव अंक संतुलन।',
          badge: 'Sec 38'
        },
        {
          icon: IdCard,
          title: 'परीक्षा समय-सारिणी, हॉल टिकट व बोर्ड फ़ोटो संग्रह',
          desc: 'परीक्षा डेट शीट, कक्ष आवंटन रोस्टर, A4 पेपर पर 8-पहचान पत्र तथा 10वीं/12वीं बोर्ड परीक्षा हेतु 1-क्लिक छात्र पासपोर्ट फ़ोटो संग्रह निर्यात।',
          badge: 'Sec 5, 26, 42'
        },
        {
          icon: Award,
          title: '360° समग्र प्रगति पत्र (HPC) व TR शीट',
          desc: 'पंचमुखी आयामों (शारीरिक, योग, संगीत, संस्कृत) सहित 360° रिपोर्ट कार्ड, कीबोर्ड अंक प्रविष्टि (↑ / ↓) व परीक्षा लॉक सुरक्षा।',
          badge: 'Sec 25, 34'
        }
      ],
      footerNote: '✨ NEP 2020 एवं पंचमुखी शिक्षा पूर्णतः समाहित'
    },
    {
      id: 'registry-compliance',
      pillarNo: 'स्तम्भ ३',
      title: 'छात्र अभिलेख, दाखिला व शासकीय अनुपालन',
      englishTitle: 'Registry, Admissions & Govt Compliance',
      subtitle: 'प्रवेश से लेकर टी.सी. निर्गमन एवं भारत सरकार UDISE+ व APAAR ID तक का वैधानिक अभिलेख।',
      timingBadge: 'प्रवेश, वैधानिक पंजिका व UDISE+',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      borderColor: 'border-rose-200 hover:border-rose-400',
      cardBg: 'bg-gradient-to-b from-rose-50/30 via-white to-white',
      headerIcon: BookOpen,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700',
      workflows: [
        {
          icon: Users,
          title: 'नवीन दाखिला व सहोदर (Sibling) ऑटो-फिल',
          desc: 'नए छात्र का पंजीकरण; यदि उसी परिवार का दूसरा बच्चा पढ़ता है तो 1-क्लिक में पारिवारिक विवरण व Family ID स्वतः भर जाती है।',
          badge: 'Sec 1, 31'
        },
        {
          icon: BookOpen,
          title: 'दाखिल-खारिज (SR Register) व प्रमाणित वाटरमार्क',
          desc: '17-कॉलम पारंपरिक वैधानिक स्कॉलर पंजिका, आजीवन छात्र रिकॉर्ड, और आधिकारिक "प्रमाणित प्रति • विद्या भारती" वाटरमार्क युक्त मुद्रण।',
          badge: 'Sec 28, 42'
        },
        {
          icon: FileCheck,
          title: 'डायनामिक टी.सी. व सजीव नो-ड्यूज (Dynamic TC)',
          desc: 'TC जनरेट करते ही उपस्थित दिवसों की स्वतः गणना (उदा. 212/224 दिन), वास्तविक समय बकाया शुल्क जांच व ऑनलाइन QR सत्यापन।',
          badge: 'Sec 35, 42'
        },
        {
          icon: FileSpreadsheet,
          title: 'UDISE+ SDMS (PEN/APAAR) व स्मार्ट स्कैनर',
          desc: '11-अंकीय PEN, 12-अंकीय APAAR ID, 21-कॉलम सरकारी CSV एक्सपोर्ट और पुराने रजिस्टरों की फोटो खींचकर OCR से त्वरित डेटा प्रविष्टि।',
          badge: 'Sec 22, 31'
        }
      ],
      footerNote: '✨ भारत सरकार एवं शिक्षा विभाग मानकों के अनुरूप'
    },
    {
      id: 'logistics-governance',
      pillarNo: 'स्तम्भ ४',
      title: 'संसाधन, संकुल व संस्थागत सुरक्षा',
      englishTitle: 'Logistics, Cluster & Governance',
      subtitle: 'विद्यालय की भौतिक संपत्ति, वाहन, पुस्तकालय, संकुल क्लस्टर निरीक्षण व सुरक्षित बैकअप।',
      timingBadge: 'संपत्ति, संकुल क्लस्टर व डेटा सुरक्षा',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      borderColor: 'border-amber-200 hover:border-amber-400',
      cardBg: 'bg-gradient-to-b from-amber-50/30 via-white to-white',
      headerIcon: ShieldCheck,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800',
      workflows: [
        {
          icon: Bus,
          title: 'बस रूट, पुस्तकालय व गणवेश भंडार स्टॉक',
          desc: 'वाहन रूट व स्टॉप किराया, पुस्तक निर्गमन/वापसी व जुर्माना, तथा गणवेश, उत्तर-पुस्तिकाओं व खेल सामग्री का इन्वेंट्री स्टॉक।',
          badge: 'Sec 8, 9, 10'
        },
        {
          icon: Building2,
          title: 'संकुल प्रभारी पटल (Cluster Supervision)',
          desc: 'संकुल स्तर पर 5-15 संबद्ध विद्यालयों की समग्र समीक्षा, पंचमुखी व भौतिक निरीक्षण पंजिका, स्टार रेटिंग और आधिकारिक परिपत्र।',
          badge: 'Sec 37'
        },
        {
          icon: Lock,
          title: 'सत्र प्रोन्नति, 80% स्टोरेज अलर्ट व 1-क्लिक बैकअप',
          desc: 'वार्षिक कक्षा प्रोन्नति, 80% स्टोरेज स्तर पर स्वतः पूर्व-चेतावनी, शाम को 1-क्लिक सुरक्षित ऑफ़लाइन JSON बैकअप व DPDP 2023 गोपनीयता ऑडिट।',
          badge: 'Sec 13, 23, 42'
        },
        {
          icon: Command,
          title: 'ग्लोबल क्विक कमांड पैलेट (Ctrl + K)',
          desc: 'कीबोर्ड पर Ctrl + K दबाएं और छात्र, रसीद या कोई भी मॉड्यूल तुरंत खोजें। सुगम व त्वरित नेविगेशन।',
          badge: 'Sec 30'
        }
      ],
      footerNote: '✨ बहु-शाखा टेनेंट सुरक्षा एवं DPDP Act 2023 अनुपालन'
    }
  ];

  return (
    <section id="modules" className="py-16 sm:py-20 bg-gradient-to-b from-white via-orange-50/40 to-stone-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-950 text-xs font-bold uppercase tracking-wider mb-2.5 border border-orange-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>४ प्रमुख उपयोग-मामले • शून्य जटिलता</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            सरस्वती शिशु मंदिर ईआरपी के <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-600 bg-clip-text text-transparent">
              ४ प्रमुख डिजिटल स्तम्भ (4 Core Pillars)
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            १४ बिखरे हुए टूल्स के बजाय, संपूर्ण विद्यालयी संचालन को ४ स्वाभाविक कार्यप्रवाह स्तम्भों में समेटा गया है — ताकि कोई भी गैर-तकनीकी उपयोगकर्ता १ नज़र में अपना काम समझ सके।
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
                <span>📖 संपूर्ण उपयोगकर्ता मार्गदर्शिका (User Manual) देखें</span>
                <ChevronRight className="w-3.5 h-3.5 text-orange-600" />
              </button>
            </div>
          )}
        </div>

        {/* Exactly 4 Master Pillar Cards in 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {masterPillars.map((pillar) => {
            const HeaderIcon = pillar.headerIcon;
            return (
              <div
                key={pillar.id}
                className={`rounded-3xl border ${pillar.borderColor} ${pillar.cardBg} p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group`}
              >
                {/* Master Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${pillar.iconBg} ${pillar.iconColor} flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                        <HeaderIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-orange-700">
                            {pillar.pillarNo}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-snug">
                          {pillar.title}
                        </h3>
                        <span className="text-[11px] font-bold text-stone-600 tracking-wide">
                          {pillar.englishTitle}
                        </span>
                      </div>
                    </div>

                    <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${pillar.badgeColor}`}>
                      {pillar.timingBadge}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mb-5 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-stone-200/70">
                    {pillar.subtitle}
                  </p>

                  {/* Workflows List */}
                  <div className="space-y-3.5">
                    {pillar.workflows.map((wf, idx) => {
                      const WfIcon = wf.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs hover:border-orange-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-orange-50 text-orange-700 shrink-0 mt-0.5">
                              <WfIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
                                  {wf.title}
                                </h4>
                                {wf.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
                                    {wf.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                                {wf.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Master Card Footer */}
                <div className="mt-6 pt-4 border-t border-stone-200/70 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-600">
                    {pillar.footerNote}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3-Step How It Works Banner */}
        <div className="mt-14 sm:mt-16 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-orange-700 shadow-xl">
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
