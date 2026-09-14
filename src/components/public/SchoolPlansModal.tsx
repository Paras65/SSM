import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  X,
  Zap,
  Award,
  Users,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Gift,
  Building2,
  PhoneCall,
  Clock
} from 'lucide-react';

interface SchoolPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: (plan: 'free' | 'pro') => void;
}

export const SchoolPlansModal: React.FC<SchoolPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro');
  const upgradeContact = import.meta.env.VITE_UPGRADE_CONTACT || 'support@init65.co.in';
  const contactHref = upgradeContact.includes('@') ? `mailto:${upgradeContact}` : `tel:${upgradeContact}`;

  if (!isOpen) return null;

  const handleStartTrial = (plan: 'free' | 'pro') => {
    onClose();
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border-2 border-orange-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-orange-500/15 via-amber-400/10 to-transparent rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        {/* Modal Header */}
        <div className="relative z-10 px-5 sm:px-8 py-5 bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 text-white flex items-center justify-between border-b border-orange-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-md text-yellow-300 shrink-0">
              <Crown className="w-6 h-6 fill-yellow-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-yellow-100 text-[11px] font-bold tracking-wide uppercase mb-0.5">
                <Sparkles className="w-3 h-3 text-yellow-200" />
                <span>विद्या भारती ईआरपी समाधान • संस्थागत योजनाएं</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                सरस्वती शिशु मंदिर ईआरपी योजनाएं व 15-दिवसीय निःशुल्क ट्रायल
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer shrink-0"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 15-Day Free Trial Spotlight Banner */}
        <div className="relative z-10 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-5 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-extrabold text-sm sm:text-base text-yellow-100">
                  🎁 विशेष पेशकश: 15-दिवसीय पूर्ण निःशुल्क ट्रायल (15-Day Free Trial)
                </span>
                <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  0 जोखिम
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                बिना किसी अग्रिम शुल्क अथवा क्रेडिट कार्ड के — पहले 15 दिन अपने विद्यालय में चलाकर देखें, पूर्ण संतुष्टि के बाद ही निर्णय लें।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleStartTrial('pro')}
            className="whitespace-nowrap px-4 py-2 bg-white hover:bg-yellow-50 text-orange-950 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>निःशुल्क ट्रायल शुरू करें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Transparent 3-Tier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            
            {/* Plan 1: Free Community Tier */}
            <div
              onClick={() => setSelectedPlan('free')}
              className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all cursor-pointer ${
                selectedPlan === 'free'
                  ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/20 shadow-lg ring-3 ring-emerald-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:border-emerald-400'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    मूलभूत सेवा
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                    समुदाय सेवा
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    निःशुल्क सेवा (Free Seva)
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-stone-900 dark:text-white">₹0</span>
                    <span className="text-xs text-stone-500">/ आजीवन</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
                    छोटे विद्यालयों एवं प्रारंभिक डिजिटलीकरण हेतु बुनियादी प्रबंधन।
                  </p>
                </div>

                <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
                  <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase">शामिल सुविधाएं:</div>
                  <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>छात्र प्रवेश एवं रिकॉर्ड पंजिका</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>दैनिक छात्र उपस्थिति अंकन</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>मासिक शुल्क रसीद व संग्रह रजिस्टर</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>डिजिटल सूचना पट्ट व समय-सारणी</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>पंचमुखी शिक्षा व दैनिक पंचांग</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTrial('free');
                }}
                className="mt-5 w-full py-2.5 px-3 rounded-xl border border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-600 hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>निःशुल्क शुरू करें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Plan 2: Academic & Examination Pack */}
            <div
              onClick={() => setSelectedPlan('pro')}
              className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all cursor-pointer relative ${
                selectedPlan === 'pro'
                  ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/20 shadow-lg ring-3 ring-orange-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 hover:border-orange-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider">
                    परीक्षा एवं रिपोर्ट कार्ड
                  </span>
                  <span className="text-[11px] font-bold text-orange-700 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded-full">
                    सर्वाधिक लोकप्रिय
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    १. परीक्षा व प्रगति पत्र
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-orange-600 dark:text-orange-400">₹3,999</span>
                    <span className="text-xs text-stone-500">/ वर्ष (~₹330/माह)</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
                    NEP 2020 अनुरूप प्रगति पत्र, टीसी एवं आईडी कार्ड हेतु आदर्श।
                  </p>
                </div>

                <div className="pt-3 border-t border-orange-200/60 dark:border-orange-800/40 space-y-2">
                  <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase">शामिल सुविधाएं:</div>
                  <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                    <li className="flex items-start gap-2">
                      <Award className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <span><strong>NEP 360° समग्र प्रगति पत्र</strong> (होलिस्टिक रिपोर्ट कार्ड)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <span>5 आधार विषय एवं विद्या भारती मानक ग्रेडिंग</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <span>बारकोड युक्त <strong>डिजिटल छात्र आईडी कार्ड</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <span>आधिकारिक <strong>स्थानांतरण प्रमाण पत्र (TC)</strong> जनरेटर</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                      <span>परीक्षा सारिणी (TR Register Sheet)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTrial('pro');
                }}
                className="mt-5 w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>15-दिन ट्रायल शुरू करें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Plan 3: Full Smart ERP Tier */}
            <div
              onClick={() => setSelectedPlan('pro')}
              className="p-5 rounded-2xl border-2 border-amber-400 dark:border-amber-600/50 bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-amber-500/10 flex flex-col justify-between transition-all cursor-pointer relative shadow-md hover:border-amber-500"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    सम्पूर्ण स्मार्ट ईआरपी
                  </span>
                  <span className="text-[11px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-amber-700" />
                    ऑल-इन-वन
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                    २. सम्पूर्ण प्रो ईआरपी (Full ERP)
                  </h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400">₹7,999</span>
                    <span className="text-xs text-stone-500">/ वर्ष (~₹660/माह)</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
                    पेरोल, व्हाट्सएप, थोक उपस्थिति एवं बैकअप सहित सम्पूर्ण समाधान।
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-300/60 dark:border-amber-700/40 space-y-2">
                  <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase">शामिल उन्नत सुविधाएं:</div>
                  <ul className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                    <li className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Academic Pack की सभी सुविधाएं सम्मिलित</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>आचार्य एवं वेतन प्रबंधन (Staff & Payroll)</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>व्हाट्सएप त्वरित सूचना</strong> (अनुपस्थिति व गृहकार्य)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>1-क्लिक थोक उपस्थिति</strong> (Bulk Attendance)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>एक्सेल/CSV डेटा बैकअप व समर्पित तकनीकी सहयोग</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartTrial('pro');
                }}
                className="mt-5 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>15-दिन प्रो ट्रायल शुरू करें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Institutional Values & Trust Highlights */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 dark:text-white">
                  विद्या भारती विद्यालय गरिमा एवं DPDP Act 2023 अनुपालन
                </h4>
                <p className="text-stone-600 dark:text-stone-400 text-[11px] mt-0.5">
                  कोई व्यावसायिक विज्ञापन नहीं • 100% डेटा स्वामित्व आपके विद्यालय का • सुरक्षित भारतीय क्लाउड सर्वर
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={contactHref}
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>सलाहकार से बात करें</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 px-5 sm:px-8 py-3.5 bg-stone-50 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-600" />
            <span>15-दिन ट्रायल हेतु किसी क्रेडिट कार्ड की आवश्यकता नहीं है।</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800 font-medium transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

