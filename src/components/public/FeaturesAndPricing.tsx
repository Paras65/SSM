import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Award,
  Zap,
  FileSpreadsheet,
  IdCard,
  MessageSquare,
  LogIn,
  Plus,
  BookOpen,
  Receipt,
  CalendarCheck
} from 'lucide-react';

interface FeaturesAndPricingProps {
  onOpenSignUp?: (plan: 'free' | 'pro') => void;
  onOpenLogin?: () => void;
}

export const FeaturesAndPricing: React.FC<FeaturesAndPricingProps> = ({
  onOpenSignUp,
  onOpenLogin
}) => {
  const { currentSchool, schools } = useSchool();

  const FREE_FEATURES = [
    { text: 'सार्वजनिक विद्यालय पोर्टल एवं होमपेज', highlight: false },
    { text: 'दैनिक वैदिक पंचांग, सुविचार एवं श्लोक', highlight: false },
    { text: 'छात्र एवं अभिभावक ऑनलाइन पोर्टल', highlight: false },
    { text: 'छात्र पंजिका एवं नवीन प्रवेश (Student Directory)', highlight: false },
    { text: 'व्यक्तिगत दैनिक उपस्थिति अंकन (Daily Attendance)', highlight: false },
    { text: 'शुल्क चालान, ऑनलाइन भुगतान व रसीद निर्गमन', highlight: false },
    { text: 'दैनिक गृहकार्य व अभ्यास डायरी (Homework)', highlight: false },
    { text: 'दैनिक परिपत्र एवं सूचना पटल (Notices & Circulars)', highlight: false },
    { text: 'ऑनलाइन प्रवेश आवेदन समीक्षा (Inquiries)', highlight: false },
    { text: 'सरस्वती वंदना, एकात्मता स्तोत्र व ऑडियो प्लेयर', highlight: false },
  ];

  const PRO_FEATURES = [
    { text: 'समस्त निःशुल्क (Free) योजना की सुविधाएं', highlight: false },
    { text: '360° समग्र प्रगति पत्र (Holistic Report Cards) — NEP 2020 अनुरूप', highlight: true },
    { text: 'आचार्य एवं वेतन पर्ची (Staff Payroll & Salary Slip PDF)', highlight: true },
    { text: 'व्हाट्सएप त्वरित अनुपस्थिति व शुल्क अलर्ट (WhatsApp Alerts)', highlight: true },
    { text: 'बारकोड युक्त डिजिटल छात्र परिचय पत्र (ID Cards)', highlight: true },
    { text: 'आधिकारिक स्थानांतरण प्रमाण पत्र (Transfer Certificate / TC)', highlight: true },
    { text: '1-क्लिक थोक उपस्थिति अंकन (Bulk Attendance Marking)', highlight: true },
    { text: 'एक्सेल / CSV संपूर्ण डेटा बैकअप एवं निर्यात', highlight: true },
    { text: 'प्राथमिकता संस्थागत तकनीकी सहायता', highlight: true },
  ];

  return (
    <section id="plans" className="py-16 sm:py-24 bg-gradient-to-b from-stone-50 via-amber-50/40 to-stone-100 border-b border-orange-200/80 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-orange-300/15 rounded-full blur-3xl pointer-events-none -ml-20" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -mr-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-300 text-orange-900 text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>विद्या भारती अखिल भारतीय शिक्षा संस्थान ईआरपी</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            सरस्वती शिशु मंदिर{' '}
            <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-600 bg-clip-text text-transparent">
              सुविधाएं एवं सदस्यता योजनाएं
            </span>
          </h2>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            प्रत्येक सरस्वती शिशु एवं विद्या मंदिर शाखा के लिए संपूर्ण डिजिटल समाधान। अपनी शाखा को तुरंत निःशुल्क पंजीकृत करें अथवा प्रो ईआरपी के साथ उन्नत सुविधाएं अनलॉक करें।
          </p>

          {/* Quick Stats / Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              बिना किसी क्रेडिट कार्ड के तुरंत शुरू करें
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {schools.length} शाखाएं पहले से पंजीकृत
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              क्लाउड आधारित सुरक्षित डेटाबेस
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* Card 1: Free Plan */}
          <div className="bg-white rounded-3xl border-2 border-stone-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all p-7 sm:p-9 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  आजीवन निःशुल्क (Free Forever)
                </span>
                <span className="text-xs font-semibold text-stone-500">बुनियादी प्रबंधन</span>
              </div>

              <h3 className="text-2xl font-black text-stone-900">
                निःशुल्क योजना (Free Plan)
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 mb-6 leading-relaxed">
                दैनिक उपस्थिति, प्रवेश पंजिका, शुल्क रसीदें एवं छात्र पोर्टल सहित सभी अनिवार्य सुविधाएं।
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 pb-6 mb-6 border-b border-stone-200">
                <span className="text-4xl sm:text-5xl font-black text-stone-900">₹0</span>
                <span className="text-stone-500 text-xs sm:text-sm font-medium">/ आजीवन (कोई छिपा शुल्क नहीं)</span>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  शामिल प्रमुख सुविधाएं:
                </span>
                {FREE_FEATURES.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5">
              <button
                type="button"
                onClick={() => onOpenSignUp?.('free')}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-stone-900 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Plus className="w-4 h-4" />
                <span>निःशुल्क शाखा पंजीकृत करें (Sign Up Free)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-center text-stone-500">
                तुरंत सक्रियण • किसी पूर्व स्वीकृति की आवश्यकता नहीं
              </p>
            </div>
          </div>

          {/* Card 2: Pro ERP Plan */}
          <div className="bg-gradient-to-b from-amber-50/80 via-white to-orange-50/50 rounded-3xl border-2 border-amber-400 shadow-xl hover:shadow-2xl transition-all p-7 sm:p-9 flex flex-col justify-between relative ring-4 ring-amber-400/20">
            {/* Best value banner */}
            <div className="absolute -top-3.5 right-6 sm:right-10 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[11px] font-black uppercase px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-yellow-200 fill-yellow-300" />
              <span>सर्वाधिक अनुशंसित (Recommended)</span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/90 text-amber-950 text-xs font-bold border border-amber-400 shadow-2xs">
                  <Crown className="w-3.5 h-3.5 text-amber-700 fill-amber-600" />
                  विद्या भारती प्रो ईआरपी
                </span>
                <span className="text-xs font-bold text-orange-700">असीमित छात्र व आचार्य</span>
              </div>

              <h3 className="text-2xl font-black text-stone-900">
                प्रो ईआरपी योजना (Pro Plan)
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 mb-6 leading-relaxed">
                360° समग्र प्रगति पत्र, आचार्य पेरोल, वेतन पर्ची, व्हाट्सएप अलर्ट व परिचय पत्र सहित सम्पूर्ण प्रबंधन।
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 pb-6 mb-6 border-b border-amber-200">
                <span className="text-4xl sm:text-5xl font-black text-orange-950">₹999</span>
                <span className="text-stone-600 text-xs sm:text-sm font-medium">/ प्रति माह (वार्षिक भुगतान पर छूट)</span>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <span className="text-xs font-bold text-orange-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  प्रो योजना के विशेष लाभ:
                </span>
                {PRO_FEATURES.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                      item.highlight
                        ? 'text-stone-900 font-semibold'
                        : 'text-stone-600'
                    }`}
                  >
                    <div className="p-0.5 rounded bg-amber-500 text-white shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-amber-200/80 space-y-2.5">
              <button
                type="button"
                onClick={() => onOpenSignUp?.('pro')}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Crown className="w-4 h-4 text-yellow-200 fill-yellow-300" />
                <span>प्रो शाखा पंजीकृत करें (Sign Up Pro)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-center text-stone-500">
                1-क्लिक परीक्षण उपलब्ध • कभी भी फ्री में स्विच करने की सुविधा
              </p>
            </div>
          </div>

        </div>

        {/* Existing School Login Banner */}
        <div className="mt-12 max-w-4xl mx-auto p-5 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900">
                क्या आपकी शाखा पहले से पंजीकृत है?
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                वर्तमान चयनित शाखा: <strong>{currentSchool.hindiName} ({currentSchool.city})</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-6 py-3 bg-stone-900 hover:bg-orange-700 text-amber-200 hover:text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>प्रशासक लॉगिन (Login)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

