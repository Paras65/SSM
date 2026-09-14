import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { BookOpen, ShieldCheck, HeartHandshake, ArrowRight, Sparkles, Plus, LogIn } from 'lucide-react';

interface HeroProps {
  onOpenSignUp?: () => void;
  onOpenLogin?: () => void;
  onOpenTeacherLogin?: () => void;
  onOpenBranchList?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenLogin, onOpenTeacherLogin, onOpenBranchList }) => {
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
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-300 text-orange-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>{publicSchool.affiliate} • {publicSchool.prant}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              संस्कारयुक्त शिक्षा, <br />
              <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-600 bg-clip-text text-transparent">
                राष्ट्रभक्ति एवं सर्वांगीण विकास
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-700 max-w-2xl leading-relaxed">
              <strong>{publicSchool.hindiName}</strong> में हम आधुनिक विज्ञान, गणित व तकनीकी शिक्षा के साथ-साथ
              भारतीय सनातन संस्कृति, पंचमुखी शिक्षा और श्रेष्ठ नैतिक मूल्यों का सिंचन करते हैं।
            </p>

            {/* Motto Badge */}
            <div className="p-3.5 bg-gradient-to-r from-amber-100 to-orange-50 rounded-xl border border-orange-300 flex items-center justify-center lg:justify-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ॐ
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase tracking-wider text-orange-900 font-bold">धैर्य एवं प्रेरणा वाक्य</span>
                <span className="text-sm sm:text-base font-bold text-orange-950 font-serif">
                  "{publicSchool.tagline}"
                </span>
              </div>
            </div>

            {/* Quick Access Portal Gateways for Parents & Teachers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              {/* Student & Parent Portal Card */}
              <button
                type="button"
                onClick={() => setViewMode('student')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-white/20 text-white text-lg shadow-xs">
                    🎓
                  </span>
                  <div>
                    <span className="block font-black text-xs sm:text-sm tracking-wide">छात्र एवं अभिभावक पोर्टल</span>
                    <span className="block text-[10px] text-emerald-100 font-medium">प्रगति पत्र, गृहकार्य, रसीदें</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {/* Acharya (Teacher) Portal Card */}
              <button
                type="button"
                onClick={onOpenTeacherLogin}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-white/20 text-white text-lg shadow-xs">
                    👨‍🏫
                  </span>
                  <div>
                    <span className="block font-black text-xs sm:text-sm tracking-wide">आचार्य पोर्टल (Teacher)</span>
                    <span className="block text-[10px] text-amber-100 font-medium">हाजिरी, गृहकार्य, परीक्षा अंक</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-200 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>

            {/* Secondary Action Row: Admissions, Notices & Admin */}
            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start pt-1 text-xs">
              <a
                href="#admissions"
                className="px-4 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-bold border border-orange-300 shadow-2xs transition-all flex items-center gap-1.5"
              >
                <span>📝 नवीन प्रवेश आवेदन (2026-27)</span>
              </a>
              <a
                href="#notices"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold border border-stone-300 shadow-2xs transition-all flex items-center gap-1.5"
              >
                <span>📢 सूचना पट्ट (Notices)</span>
              </a>
              <button
                type="button"
                onClick={onOpenBranchList}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="अपनी विद्यालय शाखा चुनें या बदलें"
              >
                <span>🏫</span>
                <span>{publicSchool.id === 'ssm-national' ? 'विद्यालय शाखा चुनें' : `शाखा: ${publicSchool.city}`}</span>
              </button>

              <button
                type="button"
                onClick={onOpenLogin}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>कार्यालय प्रशासन (Admin)</span>
              </button>
            </div>

            {/* Highlights row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-orange-200/80">
              <div className="text-left bg-white/70 p-2.5 rounded-lg border border-orange-100">
                <span className="block text-2xl font-black text-orange-700">100%</span>
                <span className="text-xs text-stone-600 font-medium">डिजिटल तैयार</span>
              </div>
              <div className="text-left bg-white/70 p-2.5 rounded-lg border border-orange-100">
                <span className="block text-2xl font-black text-orange-700">100%</span>
                <span className="text-xs text-stone-600 font-medium">बोर्ड परीक्षा परिणाम</span>
              </div>
              <div className="text-left bg-white/70 p-2.5 rounded-lg border border-orange-100">
                <span className="block text-2xl font-black text-orange-700">5+</span>
                <span className="text-xs text-stone-600 font-medium">पंचमुखी आयाम</span>
              </div>
              <div className="text-left bg-white/70 p-2.5 rounded-lg border border-orange-100">
                <span className="block text-2xl font-black text-orange-700">1000+</span>
                <span className="text-xs text-stone-600 font-medium">सफल पुरातन छात्र</span>
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
