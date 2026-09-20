import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, BookOpen, HeartHandshake } from 'lucide-react';
import { DailyPanchang } from './DailyPanchang';
import { VandanaCorner } from './VandanaCorner';
import { PanchmukhiShiksha } from './PanchmukhiShiksha';

type CulturalTab = 'panchang' | 'vandana' | 'panchmukhi';

export const CulturalHeritageSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CulturalTab>('panchang');

  // Sync active tab with URL hash if user clicked an anchor link
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#panchang') {
        setActiveTab('panchang');
      } else if (hash === '#vandana') {
        setActiveTab('vandana');
      } else if (hash === '#panchmukhi') {
        setActiveTab('panchmukhi');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const tabs: { id: CulturalTab; label: string; icon: React.ReactNode; badge: string }[] = [
    {
      id: 'panchang',
      label: 'दैनिक पंचांग व सुभाषित',
      icon: <Calendar className="w-4 h-4" />,
      badge: 'Vedic Panchang'
    },
    {
      id: 'vandana',
      label: 'वंदना एवं नित्य प्रार्थना',
      icon: <Sparkles className="w-4 h-4" />,
      badge: 'Daily Mantras'
    },
    {
      id: 'panchmukhi',
      label: 'पंचमुखी शिक्षा (NEP 2020)',
      icon: <BookOpen className="w-4 h-4" />,
      badge: 'Holistic 5 Pillars'
    }
  ];

  return (
    <section id="cultural-heritage" className="py-14 bg-gradient-to-b from-orange-50/40 via-amber-50/20 to-white border-b border-orange-200">
      {/* Hidden anchors for smooth in-page navigation compatibility */}
      <div id="panchang" className="relative -top-24 pointer-events-none" />
      <div id="vandana" className="relative -top-24 pointer-events-none" />
      <div id="panchmukhi" className="relative -top-24 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Unified Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2">
            <HeartHandshake className="w-3.5 h-3.5 text-orange-600" />
            <span>संस्कृति, संस्कार एवं सर्वांगीण विकास</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            संस्कृति एवं संस्कार केंद्र
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600">
            दैनिक वैदिक पंचांग, पावन प्रार्थनाएं एवं विद्या भारती की पंचमुखी शिक्षा पद्धति का एकीकृत संगम।
          </p>
        </div>

        {/* Modular Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  window.history.replaceState(null, '', `#${tab.id}`);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md scale-105 ring-2 ring-orange-400/40'
                    : 'bg-white hover:bg-orange-50 text-stone-700 border border-orange-200 shadow-xs'
                }`}
              >
                <span className={isActive ? 'text-amber-200' : 'text-orange-600'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                <span
                  className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full font-normal ${
                    isActive ? 'bg-orange-800/60 text-amber-200' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="transition-all duration-300">
          {activeTab === 'panchang' && <DailyPanchang isEmbedded />}
          {activeTab === 'vandana' && <VandanaCorner isEmbedded />}
          {activeTab === 'panchmukhi' && <PanchmukhiShiksha isEmbedded />}
        </div>

      </div>
    </section>
  );
};

