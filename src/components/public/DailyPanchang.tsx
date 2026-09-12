import React, { useState } from 'react';
import { Calendar, Sun, Moon, Sparkles, Volume2, VolumeX } from 'lucide-react';

export const DailyPanchang: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const subhashita = {
    sanskrit: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः।\nन हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः॥',
    hindi: 'परिश्रम करने से ही सभी कार्य सिद्ध होते हैं, केवल मनोरथ (इच्छा) करने से नहीं। जिस प्रकार सोए हुए सिंह के मुख में हिरण स्वयं प्रवेश नहीं करता, उसे भी शिकार करना पड़ता है।',
    source: 'हितोपदेश (Hitopadesha)'
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(subhashita.sanskrit);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.85;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white py-6 border-y border-orange-400/50 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Daily Panchang Widget */}
          <div className="lg:col-span-5 bg-black/25 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-white/20 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/20">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  दैनिक पंचांग (Daily Vedic Panchang)
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                विक्रम संवत् २०८३
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/10 p-2 rounded-xl flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <span className="block text-[10px] text-amber-200">सूर्योदय व वार</span>
                  <strong className="text-white text-xs">06:12 AM • शनिवासरे</strong>
                </div>
              </div>

              <div className="bg-white/10 p-2 rounded-xl flex items-center gap-2">
                <Moon className="w-4 h-4 text-yellow-200 shrink-0" />
                <div>
                  <span className="block text-[10px] text-amber-200">पक्ष एवं तिथि</span>
                  <strong className="text-white text-xs">शुक्ल पक्ष • त्रयोदशी</strong>
                </div>
              </div>

              <div className="bg-white/10 p-2 rounded-xl">
                <span className="block text-[10px] text-amber-200">नक्षत्र</span>
                <strong className="text-white text-xs">पुष्य नक्षत्र (शुभ योग)</strong>
              </div>

              <div className="bg-white/10 p-2 rounded-xl">
                <span className="block text-[10px] text-amber-200">ऋतु व अयन</span>
                <strong className="text-white text-xs">वसन्त ऋतु • उत्तरायण</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Subhashita of the Day */}
          <div className="lg:col-span-7 bg-white/15 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-white/20 relative">
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
                <Sparkles className="w-4 h-4" />
                <span>आज का सुभाषितम् (Sanskrit Subhashita)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-amber-200 font-serif italic">
                  स्त्रोत: {subhashita.source}
                </span>
                <button
                  onClick={handleSpeech}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isPlaying ? 'bg-red-800 text-white animate-pulse' : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="Listen to Sanskrit recitation"
                >
                  {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{isPlaying ? 'रोकें' : 'श्रवण करें'}</span>
                </button>
              </div>
            </div>

            {/* Shloka Verse */}
            <div className="text-center sm:text-left py-1">
              <p className="text-sm sm:text-base font-bold font-serif text-yellow-100 tracking-wide whitespace-pre-line leading-relaxed">
                "{subhashita.sanskrit}"
              </p>
              <p className="text-xs text-stone-100 mt-2 font-normal leading-relaxed border-t border-white/15 pt-2">
                <strong>हिन्दी भावार्थ:</strong> {subhashita.hindi}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

