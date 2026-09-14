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
  MessageSquare,
  Users,
  Smartphone,
  Database
} from 'lucide-react';

interface ERPModulesSectionProps {
  onOpenSignUp?: () => void;
  onOpenLogin?: () => void;
}

export const ERPModulesSection: React.FC<ERPModulesSectionProps> = ({ onOpenSignUp, onOpenLogin }) => {
  const modules = [
    {
      id: 'attendance',
      icon: CheckCircle2,
      badge: '1-क्लिक हाजिरी',
      badgeColor: 'bg-green-100 text-green-800 border-green-200',
      title: 'दैनिक उपस्थिति व व्हाट्सएप अलर्ट',
      desc: 'आचार्य केवल 30 सेकंड में कक्षा की हाजिरी लगाएं। अनुपस्थित भैया/बहिन के अभिभावक को 1-क्लिक में सम्मानजनक व्हाट्सएप संदेश प्रेषित करें।',
      features: ['कक्षावार दैनिक हाजिरी', 'सीधा व्हाट्सएप अलर्ट लिंक', 'मासिक उपस्थिति विवरण']
    },
    {
      id: 'fees',
      icon: Receipt,
      badge: 'पक्की रसीद',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      title: 'शुल्क प्रबंधन व पक्की रसीद',
      desc: 'पारदर्शी शुल्क खाता, मासिक देय विवरण और 1-क्लिक में सुंदर हिंदी शुल्क रसीद प्रिंट। अभिभावकों को बकाया शुल्क का स्मरण पत्र भेजना अत्यंत सरल।',
      features: ['नकद व UPI शुल्क प्रविष्टि', 'पक्की प्रिंट रसीद', 'बकाया अग्रसारण सुरक्षा']
    },
    {
      id: 'reports',
      icon: Award,
      badge: 'NEP 2020 अनुरूप',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      title: '360° समग्र प्रगति पत्र (Report Card)',
      desc: 'शैक्षणिक अंकों के साथ-साथ विद्या भारती के पंचमुखी आयामों (शारीरिक, योग, संगीत, संस्कृत एवं नैतिक शिक्षा) का व्यापक 360° मूल्यांकन।',
      features: ['पंचमुखी विकास ग्रेडिंग', 'टैबुलेशन रजिस्टर (TR Sheet)', 'सत्रवार प्रोन्नति']
    },
    {
      id: 'udise',
      icon: FileSpreadsheet,
      badge: 'भारत सरकार अनुपालित',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      title: 'UDISE+ SDMS सरकारी कंप्लायंस',
      desc: 'छात्रों के 11-अंकीय PEN, APAAR ID, और सामाजिक श्रेणी (Gen/OBC/SC/ST) का पूर्ण संधारण। 21-कॉलम सरकारी बैच CSV 1-क्लिक में डाउनलोड करें।',
      features: ['स्थायी शिक्षा संख्या (PEN)', 'सामाजिक श्रेणी व CWSN', '1-क्लिक UDISE+ CSV एक्सपोर्ट']
    },
    {
      id: 'id-cards',
      icon: IdCard,
      badge: 'A4 बल्क प्रिंट',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      title: 'कक्षावार बल्क पहचान पत्र (ID Cards)',
      desc: 'A4 पेपर पर 8 पहचान पत्र कटिंग गाइड्स के साथ एक साथ प्रिंट करें। साथ ही स्थानांतरण प्रमाण पत्र (TC), चरित्र व बोनाफाइड सर्टिफिकेट जनरेट करें।',
      features: ['8 कार्ड प्रति A4 शीट', 'फोटो व ब्लड ग्रुप सहित', 'डिजिटल TC व प्रमाण पत्र']
    },
    {
      id: 'security',
      icon: ShieldCheck,
      badge: 'सुरक्षित डेटा',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'डेटा सुरक्षा व सामान्य बैकअप',
      desc: 'सुरक्षित डेटा संरक्षण, ऑफलाइन कैशिंग और शाम को 1-क्लिक सुरक्षित बैकअप की सुविधा। आपके विद्यालय का डिजिटल डेटा हमेशा संरक्षित और सुलभ रहता है।',
      features: ['ऑफलाइन PWA समर्थन', '1-क्लिक JSON बैकअप व रीस्टोर', 'ज़ीरो डेटा लीक गारंटी']
    }
  ];

  return (
    <section id="modules" className="py-16 sm:py-20 bg-gradient-to-b from-white via-orange-50/40 to-stone-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>सम्पूर्ण विद्यालय ईआरपी संचालन प्रणाली</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            सरस्वती शिशु मंदिर ईआरपी के <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-600 bg-clip-text text-transparent">
              ६ प्रमुख डिजिटल स्तंभ
            </span>
          </h2>
          <p className="mt-3 text-base text-stone-600 leading-relaxed">
            विद्या भारती के आदर्शों, सनातन संस्कारों एवं भारत सरकार के शैक्षणिक नियमों को ध्यान में रखकर तैयार किया गया सरलतम ईआरपी सॉफ़्टवेयर।
          </p>
        </div>

        {/* 6 Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 group-hover:bg-orange-600 text-orange-700 group-hover:text-white border border-orange-200 flex items-center justify-center transition-colors shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${mod.badgeColor}`}>
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-950 transition-colors">
                    {mod.title}
                  </h3>
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
                कक्षावार छात्रों का नामांकन करें या एक्सेल/CSV फ़ाइल से 1-क्लिक में थोक आयात (Bulk Import) करें।
              </p>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <span className="w-8 h-8 rounded-full bg-amber-400 text-stone-900 font-black text-sm flex items-center justify-center mb-3 mx-auto md:mx-0">
                ३
              </span>
              <h4 className="font-bold text-amber-200 text-sm">दैनिक संचालन शुरू करें</h4>
              <p className="text-xs text-stone-300 mt-1">
                हाजिरी लगाएं, फीस रसीद काटें, व्हाट्सएप सूचनाएं भेजें और UDISE+ रिपोर्ट प्राप्त करें।
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-300 text-center sm:text-left">
              <span>🌟 विद्या भारती विद्यालयों के लिए निःशुल्क सेवा उपलब्ध • </span>
              <span className="text-amber-300 font-bold">100% सुरक्षित एवं विज्ञापन-मुक्त</span>
            </div>

            <div className="flex items-center gap-3">
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

