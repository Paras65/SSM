import React, { useState } from 'react';
import { PANCHMUKHI_PILLARS } from '../../data/mockData';
import { Shield, Flower2, Music, BookMarked, Heart, CheckCircle2, Sparkles } from 'lucide-react';

export const PanchmukhiShiksha: React.FC = () => {
  const [activeTab, setActiveTab] = useState(PANCHMUKHI_PILLARS[0].id);

  const getPillarIcon = (id: string) => {
    switch (id) {
      case 'sharirik':
        return <Shield className="w-5 h-5" />;
      case 'yog':
        return <Flower2 className="w-5 h-5" />;
      case 'sangeet':
        return <Music className="w-5 h-5" />;
      case 'sanskrit':
        return <BookMarked className="w-5 h-5" />;
      case 'naitik':
        return <Heart className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const selectedPillar = PANCHMUKHI_PILLARS.find(p => p.id === activeTab) || PANCHMUKHI_PILLARS[0];

  return (
    <section id="panchmukhi" className="py-16 bg-white border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">
            विद्या भारती की विशिष्ट शिक्षण पद्धति
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            पंचमुखी शिक्षा (Panchmukhi Shiksha)
          </h2>
          <p className="mt-3 text-base text-stone-600">
            सरस्वती शिशु मंदिर में बालक-बालिकाओं के सर्वांगीण विकास के लिए केवल पुस्तकीय ज्ञान नहीं,
            अपितु जीवन के पांच आधारभूत स्तंभों पर संतुलित शिक्षा प्रदान की जाती है।
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {PANCHMUKHI_PILLARS.map(pillar => {
            const isActive = activeTab === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveTab(pillar.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-xs ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md scale-105'
                    : 'bg-stone-50 hover:bg-orange-50 text-stone-700 border border-stone-200'
                }`}
              >
                {getPillarIcon(pillar.id)}
                <span>{pillar.hindiTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Showcase Card */}
        <div className="bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-stone-50 rounded-3xl p-6 sm:p-10 border border-orange-200 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-block px-3 py-1 rounded-md bg-orange-100 text-orange-800 font-mono text-xs font-bold">
                संस्कृत ध्येय वाक्य: {selectedPillar.sanskritMotto}
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold text-orange-950 flex items-center gap-3">
                <span className="p-2 bg-orange-600 text-white rounded-xl shadow-xs">
                  {getPillarIcon(selectedPillar.id)}
                </span>
                <span>{selectedPillar.hindiTitle} ({selectedPillar.title})</span>
              </h3>

              <p className="text-stone-700 leading-relaxed text-base">
                {selectedPillar.description}
              </p>

              {/* Specific practical activities */}
              <div className="pt-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-orange-900 mb-3">
                  विद्यालय में प्रमुख गतिविधियां एवं अभ्यास:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedPillar.activities.map((act, index) => (
                    <div key={index} className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-orange-100 shadow-xs text-sm text-stone-800">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Cultural context quote card */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border-2 border-orange-200 shadow-md text-center">
              <div className="text-4xl mb-3">🚩</div>
              <blockquote className="text-base font-serif italic text-stone-800 mb-4 leading-relaxed">
                "{selectedPillar.sanskritMotto}"
              </blockquote>
              <div className="w-16 h-0.5 bg-orange-400 mx-auto mb-4" />
              <p className="text-xs text-stone-600">
                विद्या भारती का ध्येय है ऐसे नवयुवकों का निर्माण करना जो हिंदुत्व-निष्ठ, राष्ट्रभक्त, शारीरिक दृष्टि से बलिष्ठ और मानसिक रूप से प्रबुद्ध हों।
              </p>
            </div>

          </div>
        </div>

        {/* 5 Quick Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          {PANCHMUKHI_PILLARS.map(pillar => (
            <div
              key={pillar.id}
              onClick={() => setActiveTab(pillar.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                activeTab === pillar.id
                  ? 'bg-amber-100/70 border-orange-500 shadow-md'
                  : 'bg-white hover:bg-orange-50/50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2 text-orange-700 font-bold text-sm mb-1">
                {getPillarIcon(pillar.id)}
                <span>{pillar.hindiTitle}</span>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

