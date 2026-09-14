import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { BookOpen, ShieldCheck, HeartHandshake, ArrowRight, Sparkles, Plus, LogIn } from 'lucide-react';

interface HeroProps {
  onOpenSignUp?: () => void;
  onOpenLogin?: () => void;
  onOpenTeacherLogin?: () => void;
  onOpenBranchList?: () => void;
  onOpenVerifyTc?: () => void;
  onStartDemo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenSignUp,
  onOpenLogin,
  onOpenTeacherLogin,
  onOpenBranchList,
  onOpenVerifyTc,
  onStartDemo
}) => {
  const { setViewMode, publicSchool } = useSchool();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-orange-100/70 via-amber-50/50 to-white pt-10 pb-16 border-b border-orange-200">
      {/* Background Decorative patterns */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-orange-300/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Main Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-300 text-orange-900 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>{publicSchool.affiliate} • डिजिटल ईआरपी मंच</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              सरस्वती शिशु मंदिर <br />
              <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-600 bg-clip-text text-transparent">
                डिजिटल ईआरपी प्रणाली <span className="whitespace-nowrap text-[0.86em]">(SSM ERP)</span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-700 max-w-xl leading-relaxed">
              एक मंच पर विद्यालय प्रशासन, शिक्षकों, छात्रों और अभिभावकों के लिए सरल, सुरक्षित और डिजिटल प्रबंधन।
              हाजिरी, शुल्क, परीक्षाएं, रिपोर्ट कार्ड और प्रगति ट्रैकिंग अब एक ही सिस्टम में।
            </p>

            {/* Motto & Heritage Badge */}
            <div className="p-3.5 bg-gradient-to-r from-amber-100 to-orange-50 rounded-xl border border-orange-300 flex items-center justify-center lg:justify-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ॐ
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-orange-900 font-bold">संकल्प</span>
                <span className="text-sm sm:text-base font-bold text-orange-950 font-serif">
                  "{publicSchool.tagline}"
                </span>
              </div>
            </div>

            {/* 3 One-Tap Gateway Cards: Student, Teacher, Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
              {/* 1. Student & Parent Portal */}
              <button
                type="button"
                onClick={() => setViewMode('student')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="p-2 rounded-xl bg-white/20 text-white text-base shadow-xs">
                    🎓
                  </span>
                  <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <span className="block font-black text-xs sm:text-sm tracking-wide">छात्र व अभिभावक</span>
                  <span className="block text-[10px] text-emerald-100 font-medium mt-0.5">हाजिरी, गृहकार्य, प्रगति पत्र</span>
                </div>
              </button>

              {/* 2. Acharya (Teacher) Portal */}
              <button
                type="button"
                onClick={onOpenTeacherLogin}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="p-2 rounded-xl bg-white/20 text-white text-base shadow-xs">
                    👨‍🏫
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-200 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <span className="block font-black text-xs sm:text-sm tracking-wide">आचार्य पोर्टल</span>
                  <span className="block text-[10px] text-amber-100 font-medium mt-0.5">दैनिक उपस्थिति, परीक्षा अंक</span>
                </div>
              </button>

              {/* 3. Principal & Office Admin Portal */}
              <button
                type="button"
                onClick={onOpenLogin}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-white shadow-md hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer border border-stone-700"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="p-2 rounded-xl bg-white/20 text-amber-400 text-base shadow-xs">
                    🏛️
                  </span>
                  <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <span className="block font-black text-xs sm:text-sm tracking-wide text-amber-200">प्रशासन व कार्यालय</span>
                  <span className="block text-[10px] text-stone-300 font-medium mt-0.5">शुल्क, UDISE+, पूर्ण नियंत्रण</span>
                </div>
              </button>
            </div>

            {/* Platform Action Buttons */}
            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start pt-1 text-xs">
              <button
                type="button"
                onClick={onOpenSignUp}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🚀 अपने विद्यालय को जोड़ें</span>
              </button>

              {onStartDemo && (
                <button
                  type="button"
                  onClick={onStartDemo}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-amber-300"
                  title="बिना पासवर्ड तुरंत लाइव डेमो का अनुभव लें"
                >
                  <span>🎮 लाइव डेमो</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenBranchList}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-stone-900 font-bold border border-orange-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="नजदीकी सरस्वती शिशु मंदिर खोजें (School Locator)"
              >
                <span>🔍</span>
                <span>{publicSchool.id === 'ssm-national' ? 'विद्यालय खोजें' : `शाखा: ${publicSchool.city}`}</span>
              </button>

              {onOpenVerifyTc && (
                <button
                  type="button"
                  onClick={onOpenVerifyTc}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-orange-950 font-bold border border-orange-300 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="स्थानांतरण प्रमाण पत्र (TC) ऑनलाइन सत्यापित करें"
                >
                  <span>✅ टीसी सत्यापन</span>
                </button>
              )}
            </div>

            {/* Highlights row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-orange-200/80">
              <div className="text-left bg-white/70 p-2.5 rounded-lg border border-orange-100">
                <span className="block text-2xl font-black text-orange-700">100%</span>
                <span className="text-xs text-stone-600 font-medium">कागज-रहित ईआरपी</span>
              </div>
              <div className="text-left bg-white/70 p-2.5 rounded-lg border border-orange-100">
                <span className="block text-xl sm:text-2xl font-black text-orange-700">NEP 2020</span>
                <span className="text-xs text-stone-600 font-medium">360° प्रगति पत्र</span>
              </div>
              <div className="text-left bg-white/70 p-2.5 rounded-lg border border-orange-100">
                <span className="block text-2xl font-black text-orange-700">5+</span>
                <span className="text-xs text-stone-600 font-medium">पंचमुखी आयाम</span>
              </div>
              <div className="text-left bg-white/70 p-2.5 rounded-lg border border-orange-100">
                <span className="block text-xl sm:text-2xl font-black text-orange-700">बहु-शाखा</span>
                <span className="text-xs text-stone-600 font-medium">स्वायत्त क्लाउड</span>
              </div>
            </div>

          </div>

          {/* Hero Visual Card / Saraswati Blessing Motif */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-white to-amber-50 p-6 sm:p-8 rounded-3xl border-2 border-orange-300 shadow-xl relative text-center">
              <div className="absolute top-3 right-3 px-3 py-1 bg-amber-200/80 rounded-full text-[11px] font-bold text-orange-900">
                ज्ञान • शील • राष्ट्रसेवा
              </div>
              
              <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-1 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-5xl">
                  🪷
                </div>
              </div>

              <h2 className="text-2xl font-bold text-orange-950 mb-1">
                माँ सरस्वती कृपा
              </h2>
              <p className="text-xs text-stone-600 italic mb-4">
                "ज्ञानदायिनी, वीणावादिनी, हंसवाहिनी भगवती शारदा को शत-शत नमन"
              </p>

              {/* Core Pillars preview */}
              <div className="space-y-2 text-left text-xs text-stone-800">
                <div className="flex items-center gap-2.5 p-2 bg-orange-100/50 rounded-lg border border-orange-200">
                  <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                  <span><strong>शारीरिक एवं घोष:</strong> दंड, नियुद्ध, खेलकूद, घोष वादन</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 bg-amber-100/50 rounded-lg border border-amber-200">
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>संस्कृत व वैदिक गणित:</strong> तीव्र गणना एवं श्लोक कंठस्थीकरण</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 bg-rose-100/50 rounded-lg border border-rose-200">
                  <HeartHandshake className="w-4 h-4 text-rose-600 shrink-0" />
                  <span><strong>नैतिक व आध्यात्मिक:</strong> मातृ-पितृ-गुरु भक्ति एवं सेवा भाव</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-orange-200 flex items-center justify-between text-xs text-stone-600">
                <span>सम्बद्ध: सीबीएसई एवं विद्या भारती</span>
                <span className="font-semibold text-orange-700">कक्षा: शिशु से द्वादश (12वीं)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
