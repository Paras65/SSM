import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogIn,
  Plus,
  HeartHandshake,
  Server,
  Lock
} from 'lucide-react';

interface FeaturesAndPricingProps {
  onOpenSignUp?: (plan: 'free' | 'pro') => void;
  onOpenLogin?: () => void;
}

export const FeaturesAndPricing: React.FC<FeaturesAndPricingProps> = ({
  onOpenSignUp,
  onOpenLogin
}) => {
  const { schools } = useSchool();

  const FREE_FEATURES = [
    { text: 'सार्वजनिक विद्यालय पोर्टल एवं होमपेज', highlight: false },
    { text: 'दैनिक वैदिक पंचांग, सुविचार एवं श्लोक', highlight: false },
    { text: 'छात्र एवं अभिभावक ऑनलाइन पोर्टल', highlight: false },
    { text: 'छात्र पंजिका एवं नवीन प्रवेश (Student Directory)', highlight: false },
    { text: 'दैनिक उपस्थिति अंकन (Daily Attendance)', highlight: false },
    { text: 'शुल्क चालान, ऑनलाइन भुगतान व रसीद निर्गमन', highlight: false },
    { text: 'दैनिक गृहकार्य व अभ्यास डायरी (Homework)', highlight: false },
    { text: 'दैनिक परिपत्र एवं सूचना पटल (Notices & Circulars)', highlight: false },
    { text: 'ऑनलाइन प्रवेश आवेदन समीक्षा (Inquiries)', highlight: false },
    { text: 'सरस्वती वंदना, एकात्मता स्तोत्र व ऑडियो प्लेयर', highlight: false },
  ];

  const ACADEMIC_FEATURES = [
    { text: 'समस्त निःशुल्क सेवा योजना की सुविधाएं', highlight: false },
    { text: '360° समग्र प्रगति पत्र (Holistic Report Cards) — NEP 2020 अनुरूप', highlight: true },
    { text: 'बारकोड युक्त डिजिटल छात्र परिचय पत्र (ID Cards)', highlight: true },
    { text: 'आधिकारिक स्थानांतरण प्रमाण पत्र (Transfer Certificate / TC)', highlight: true },
    { text: 'दैनिक क्लाउड डेटाबेस बैकअप एवं सुरक्षा', highlight: true },
    { text: 'एक्सेल / CSV संपूर्ण डेटा निर्यात', highlight: true },
    { text: 'संस्थागत तकनीकी सहायता एवं प्रशिक्षण', highlight: true },
  ];

  const SMART_ERP_FEATURES = [
    { text: 'समस्त परीक्षा एवं प्रगति पत्र (Academic) सुविधाएं', highlight: false },
    { text: 'आचार्य एवं वेतन पर्ची (Staff Payroll & Salary Slip PDF)', highlight: true },
    { text: 'व्हाट्सएप त्वरित अनुपस्थिति व शुल्क अलर्ट (WhatsApp Alerts)', highlight: true },
    { text: '1-क्लिक थोक उपस्थिति अंकन (Bulk Attendance Marking)', highlight: true },
    { text: 'समर्पित क्लाउड सर्वर एवं उच्च गति डेटाबेस', highlight: true },
    { text: 'उच्च प्राथमिकता ऑन-कॉल तकनीकी सहायता', highlight: true },
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
            <HeartHandshake className="w-4 h-4 text-orange-700" />
            <span>विद्या भारती संस्कार अनुरूप — सुविधा-आधारित योजनाएं (Feature-Wise Plans)</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            सरस्वती शिशु मंदिर{' '}
            <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-600 bg-clip-text text-transparent">
              सुविधा-आधारित ईआरपी मॉडल
            </span>
          </h2>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            विद्या भारती के आदर्शों के अनुरूप पारदर्शी सुविधा-वार व्यवस्था। किसी छात्र संख्या या स्थान के प्रतिबंध के बिना — 
            विद्यालय को जो सुविधाएं चाहिए, वे केवल उन्हीं का चयन कर सकते हैं।
          </p>

          {/* Quick Stats / Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-stone-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% सुविधा-आधारित पारदर्शिता
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {schools.length} शाखाएं सक्रिय
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              शून्य डेटा मुद्रीकरण (Zero Data Selling)
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid (3-Tier: Free Seva, Academic Pack, Smart ERP Pack) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 items-stretch max-w-7xl mx-auto">
          
          {/* Card 1: Free Seva Tier */}
          <div className="bg-white rounded-3xl border-2 border-stone-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all p-6 sm:p-7 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-700" />
                  बुनियादी प्रबंधन
                </span>
                <span className="text-xs font-semibold text-stone-500">आजीवन निःशुल्क</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                निःशुल्क सेवा (Free Seva)
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 mb-5 leading-relaxed">
                दैनिक उपस्थिति, छात्र पंजिका, शुल्क रसीदें, गृहकार्य डायरी एवं सार्वजनिक पोर्टल।
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 pb-5 mb-5 border-b border-stone-200">
                <span className="text-3xl sm:text-4xl font-black text-stone-900">₹0</span>
                <span className="text-stone-500 text-xs font-medium">/ आजीवन (100% निःशुल्क सेवा)</span>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 mb-6">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  शामिल प्रमुख सुविधाएं:
                </span>
                {FREE_FEATURES.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <button
                type="button"
                onClick={() => onOpenSignUp?.('free')}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-900 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Plus className="w-4 h-4" />
                <span>निःशुल्क शुरू करें (Start Free)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-center text-stone-500">
                बिना किसी क्रेडिट कार्ड के तुरंत शुरू करें
              </p>
            </div>
          </div>

          {/* Card 2: Academic & Examination Pack */}
          <div className="bg-gradient-to-b from-emerald-50/70 via-white to-amber-50/40 rounded-3xl border-2 border-emerald-400 shadow-lg hover:shadow-xl transition-all p-6 sm:p-7 flex flex-col justify-between relative ring-4 ring-emerald-400/20">
            {/* Top Ribbon */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>सर्वाधिक अनुशंसित (Academic Pack)</span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-200/90 text-emerald-950 text-xs font-bold border border-emerald-400 shadow-2xs">
                  <Server className="w-3.5 h-3.5 text-emerald-800" />
                  परीक्षा एवं छात्र रिकॉर्ड्स
                </span>
                <span className="text-xs font-bold text-emerald-800">~₹330/माह मात्र</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                परीक्षा व प्रगति पत्र (Academic Pack)
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 mb-5 leading-relaxed">
                360° समग्र प्रगति पत्र (NEP 2020), बारकोड परिचय पत्र (ID Cards), स्थानांतरण प्रमाण पत्र एवं बैकअप।
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 pb-5 mb-5 border-b border-emerald-200">
                <span className="text-3xl sm:text-4xl font-black text-emerald-950">₹3,999</span>
                <span className="text-stone-600 text-xs font-medium">/ प्रति वर्ष (न्यूनतम संस्थागत सहयोग)</span>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 mb-6">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  एकेडेमिक पैक सुविधाएं:
                </span>
                {ACADEMIC_FEATURES.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 text-xs ${
                      item.highlight ? 'text-stone-900 font-semibold' : 'text-stone-600'
                    }`}
                  >
                    <div className="p-0.5 rounded bg-emerald-600 text-white shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-emerald-200/80 space-y-2">
              <button
                type="button"
                onClick={() => onOpenSignUp?.('pro')}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>एकेडेमिक पैक चुनें (Academic Pack)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-center text-stone-500">
                बिना किसी छात्र संख्या सीमा के • वार्षिक सक्रियण
              </p>
            </div>
          </div>

          {/* Card 3: Full Smart ERP Pack */}
          <div className="bg-gradient-to-b from-amber-50/80 via-white to-orange-50/50 rounded-3xl border-2 border-amber-400 shadow-xl hover:shadow-2xl transition-all p-6 sm:p-7 flex flex-col justify-between relative ring-4 ring-amber-400/20">
            {/* Top Ribbon */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-yellow-200 fill-yellow-300" />
              <span>सम्पूर्ण प्रबंधन एवं पेरोल</span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/90 text-amber-950 text-xs font-bold border border-amber-400 shadow-2xs">
                  <Crown className="w-3.5 h-3.5 text-amber-700 fill-amber-600" />
                  पेरोल, व्हाट्सएप व थोक उपस्थिति
                </span>
                <span className="text-xs font-bold text-orange-700">समर्पित सर्वर</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                सम्पूर्ण स्मार्ट ईआरपी (Full Smart ERP)
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1 mb-5 leading-relaxed">
                आचार्य पेरोल व वेतन पर्ची, व्हाट्सएप त्वरित अलर्ट, थोक उपस्थिति एवं समर्पित क्लाउड सर्वर।
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 pb-5 mb-5 border-b border-amber-200">
                <span className="text-3xl sm:text-4xl font-black text-orange-950">₹7,999</span>
                <span className="text-stone-600 text-xs font-medium">/ वर्ष (अथवा ₹799/माह)</span>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 mb-6">
                <span className="text-xs font-bold text-orange-950 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  स्मार्ट ईआरपी विशेष लाभ:
                </span>
                {SMART_ERP_FEATURES.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 text-xs ${
                      item.highlight ? 'text-stone-900 font-semibold' : 'text-stone-600'
                    }`}
                  >
                    <div className="p-0.5 rounded bg-amber-500 text-white shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-amber-200/80 space-y-2">
              <button
                type="button"
                onClick={() => onOpenSignUp?.('pro')}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Crown className="w-4 h-4 text-yellow-200 fill-yellow-300" />
                <span>स्मार्ट ईआरपी चुनें (Get Smart ERP)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[11px] text-center text-stone-500">
                समर्पित क्लाउड बैकअप व प्राथमिकता तकनीकी सहायता
              </p>
            </div>
          </div>

        </div>

        {/* Our Ethical Pledge Banner */}
        <div className="mt-12 max-w-5xl mx-auto p-6 sm:p-8 bg-gradient-to-r from-amber-50 via-orange-50/70 to-stone-50 rounded-3xl border-2 border-orange-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-200/80 text-orange-900 text-xs font-bold">
                <Lock className="w-3.5 h-3.5 text-orange-700" />
                <span>हमारा संकल्प (Our Pledge to Vidya Bharati)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                संस्कार, सेवा एवं पूर्ण डेटा शुचिता का अटूट विश्वास
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm text-stone-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>कोई विज्ञापन नहीं:</strong> पोर्टल 100% विज्ञापन-मुक्त है।</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>शून्य डेटा बिक्री:</strong> किसी छात्र या विद्यालय का डेटा कभी नहीं बेचा जाता (DPDPA 2023 अनुपालन)।</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>ग्रामीण उत्थान:</strong> छोटे व ग्रामीण विद्यालयों के लिए बुनियादी सेवा सदैव निःशुल्क रहेगी।</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Existing School Login Banner */}
        <div className="mt-8 max-w-5xl mx-auto p-5 sm:p-6 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900">
                क्या आपकी शाखा पहले से पंजीकृत है?
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                अपनी शाखा चुनें या नई शाखा निःशुल्क पंजीकृत करें।
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

