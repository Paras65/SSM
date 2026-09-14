import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { INITIAL_ACHARYAS } from '../../data/mockData';
import { Users, Sparkles, Award, GraduationCap, BookOpen, Heart } from 'lucide-react';

export const AcharyaSection: React.FC = () => {
  const { currentSchool } = useSchool();

  // Faculty list with active school's principal dynamically updated
  const facultyList = INITIAL_ACHARYAS.map((ach, idx) => {
    if (idx === 0 && currentSchool.principalName) {
      return {
        ...ach,
        name: currentSchool.principalName
      };
    }
    return ach;
  });

  return (
    <section id="acharyas" className="py-16 bg-gradient-to-b from-stone-50 via-amber-50/30 to-white border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-orange-600" />
            <span>गुरु परम्परा एवं मार्गदर्शक</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            हमारे समर्पित आचार्य एवं दीदी जी
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed">
            विद्या भारती के आदर्शों के अनुरूप आत्मीय भाव, अनुशासन और ज्ञान से भैया-बहिनों के जीवन को गढ़ने वाले प्रेरक शिक्षक।
          </p>
        </div>

        {/* Faculty Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facultyList.map((ach, idx) => (
            <div
              key={ach.id}
              className={`p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl flex flex-col justify-between relative overflow-hidden bg-white ${
                idx === 0
                  ? 'border-2 border-orange-400 shadow-md ring-4 ring-orange-500/10'
                  : 'border-stone-200 hover:border-orange-300'
              }`}
            >
              {/* Top Accent Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-orange-900 text-xs font-bold">
                  {idx === 0 ? <Award className="w-3.5 h-3.5 text-orange-600" /> : <GraduationCap className="w-3.5 h-3.5 text-orange-600" />}
                  <span>{ach.title}</span>
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  अनुभव: {ach.experience}
                </span>
              </div>

              {/* Avatar Icon & Details */}
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-md mb-3">
                  {ach.title.includes('दीदी') ? '🌸' : '🪷'}
                </div>
                <h3 className="text-lg font-bold text-stone-900 leading-snug">
                  {ach.name}
                </h3>
                <div className="text-xs font-semibold text-orange-700">
                  {ach.designation}
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {ach.qualification}
                </p>
              </div>

              {/* Subject Chips */}
              <div className="pt-4 mt-4 border-t border-stone-100">
                <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  मार्गदर्शन विषय:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {ach.subjects.map((sub, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 text-[11px] font-medium border border-stone-200/60"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Value Proposition Callout */}
        <div className="mt-10 p-5 rounded-2xl bg-orange-50 border border-orange-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3 text-stone-800">
            <Heart className="w-5 h-5 text-orange-600 shrink-0" />
            <span>
              <strong>आत्मीय पारिवारिक भाव:</strong> हमारे विद्यालय में केवल पुस्तकीय ज्ञान नहीं, अपितु गुरु-शिष्य की स्नेहिल परम्परा का पालन होता है।
            </span>
          </div>
          <a
            href="#admissions"
            className="whitespace-nowrap px-4 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs shadow-xs transition"
          >
            नवीन प्रवेश हेतु मिलें
          </a>
        </div>

      </div>
    </section>
  );
};
