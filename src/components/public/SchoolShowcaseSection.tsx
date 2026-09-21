import React, { useState, useEffect } from 'react';
import { Camera, Users, Sparkles, PlayCircle } from 'lucide-react';
import { Gallery } from './Gallery';
import { AcharyaSection } from './AcharyaSection';
import { VideoShowcaseSection } from './VideoShowcaseSection';

type ShowcaseTab = 'gallery' | 'videos' | 'acharyas';

export const SchoolShowcaseSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('gallery');

  // Sync active tab with URL hash if user clicked an anchor link
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#gallery') {
        setActiveTab('gallery');
      } else if (hash === '#videos') {
        setActiveTab('videos');
      } else if (hash === '#acharyas') {
        setActiveTab('acharyas');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const tabs: { id: ShowcaseTab; label: string; icon: React.ReactNode; badge: string }[] = [
    {
      id: 'gallery',
      label: 'विद्यालय दर्शन एवं गतिविधियां',
      icon: <Camera className="w-4 h-4" />,
      badge: 'Activities & Gallery'
    },
    {
      id: 'videos',
      label: 'वार्षिकोत्सव एवं वीडियो वीथिका',
      icon: <PlayCircle className="w-4 h-4" />,
      badge: 'YouTube & Events'
    },
    {
      id: 'acharyas',
      label: 'आचार्य एवं दीदी परिवार',
      icon: <Users className="w-4 h-4" />,
      badge: 'Dedicated Faculty'
    }
  ];

  return (
    <section id="school-showcase" className="py-14 bg-stone-50 border-b border-orange-200">
      {/* Hidden anchors for smooth in-page navigation compatibility */}
      <div id="gallery" className="relative -top-24 pointer-events-none" />
      <div id="acharyas" className="relative -top-24 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Unified Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>परिसर जीवन एवं गुरु परंपरा</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            विद्यालय दर्शन एवं आचार्य परिवार
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600">
            अनुशासित शिक्षण, सांस्कृतिक उत्सव, खेलकूद प्रतियोगिताएं और बालकों के सर्वांगीण विकास को समर्पित मार्गदर्शक।
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
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md scale-105 ring-2 ring-orange-400/40'
                    : 'bg-white hover:bg-orange-50 text-stone-700 border border-stone-200 shadow-xs'
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
          {activeTab === 'gallery' && <Gallery isEmbedded />}
          {activeTab === 'videos' && <VideoShowcaseSection isEmbedded />}
          {activeTab === 'acharyas' && <AcharyaSection isEmbedded />}
        </div>

      </div>
    </section>
  );
};

