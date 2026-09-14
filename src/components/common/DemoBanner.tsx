import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Sparkles, X, ShieldCheck, ArrowRight } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { isDemoMode, exitDemoMode, setViewMode } = useSchool();

  if (!isDemoMode) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md z-50 sticky top-0 border-b border-yellow-300/40 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="bg-yellow-300 text-orange-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-xs">
          🎮 लाइव सैंडबॉक्स
        </span>
        <p className="truncate text-amber-50 text-xs sm:text-sm">
          आप <strong>सरस्वती शिशु मंदिर ईआरपी</strong> के परीक्षण मोड में हैं। सभी सुविधाएं (हाजिरी, फीस, UDISE+, रिपोर्ट कार्ड) पूरी तरह सक्रिय हैं।
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          type="button"
          onClick={() => setViewMode('admin')}
          className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-black/20 hover:bg-black/30 rounded-lg text-xs font-bold text-yellow-200 border border-white/20 transition cursor-pointer"
        >
          <span>नियंत्रण पटल</span>
          <ArrowRight className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={exitDemoMode}
          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-50 text-orange-900 rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
          title="डेमो मोड समाप्त करके मुख्य वेबसाइट पर लौटें"
        >
          <span>डेमो बंद करें</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

