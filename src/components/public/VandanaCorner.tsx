import React, { useState } from 'react';
import { PRAYERS } from '../../data/mockData';
import { Volume2, VolumeX, Copy, Check, BookOpen, Sparkles, Printer } from 'lucide-react';

export const VandanaCorner: React.FC = () => {
  const [selectedPrayerId, setSelectedPrayerId] = useState(PRAYERS[0].id);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const selectedPrayer = PRAYERS.find(p => p.id === selectedPrayerId) || PRAYERS[0];

  const handleCopy = () => {
    const text = `${selectedPrayer.title} (${selectedPrayer.subtitle})\n\n[संस्कृत श्लोक]\n${selectedPrayer.sanskrit}\n\n[हिन्दी भावार्थ]\n${selectedPrayer.hindi}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedPrayer.sanskrit);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.85; // slightly slower for solemn Vedic chanting feel
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <section id="vandana" className="py-16 bg-gradient-to-b from-orange-50/50 via-amber-50/30 to-white border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>दैनिक संस्कार व नित्य प्रार्थना</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            वंदना एवं दैनिक मंत्र (Vandana & Mantras)
          </h2>
          <p className="mt-2 text-base text-stone-600">
            सरस्वती शिशु मंदिर में प्रातः कालीन प्रार्थना सभा से लेकर मध्याह्न भोजन और सायंकालीन शांति पाठ तक,
            प्रत्येक दिन ईश वंदना और राष्ट्र स्मरण के साथ आरंभ व संपन्न होता है।
          </p>
        </div>

        {/* Prayer Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
          {PRAYERS.map(prayer => {
            const isSelected = selectedPrayerId === prayer.id;
            return (
              <button
                key={prayer.id}
                onClick={() => {
                  setSelectedPrayerId(prayer.id);
                  if (isPlaying) {
                    window.speechSynthesis.cancel();
                    setIsPlaying(false);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-orange-700 text-white shadow-md'
                    : 'bg-white hover:bg-orange-50 text-stone-700 border border-orange-200'
                }`}
              >
                {prayer.subtitle} ({prayer.title})
              </button>
            );
          })}
        </div>

        {/* Main Prayer Card */}
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-white to-amber-50/40 rounded-3xl border-2 border-orange-300 shadow-xl overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider bg-orange-800/60 px-2.5 py-0.5 rounded-full text-amber-200 font-medium">
                {selectedPrayer.occasion}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 font-serif">
                {selectedPrayer.subtitle} • {selectedPrayer.title}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSpeech}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all ${
                  isPlaying ? 'bg-red-700 text-white animate-pulse' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title="Listen to chanting"
              >
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlaying ? 'रोकें (Stop)' : 'श्रवण करें (Listen)'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition-all"
                title="Copy Shloka & Meaning"
              >
                {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'कॉपी हो गया' : 'कॉपी करें'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all"
                title="Print Prayer"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Verses & Meaning */}
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Sanskrit Shloka */}
            <div className="text-center bg-amber-50/70 p-6 sm:p-8 rounded-2xl border border-orange-200 relative shadow-inner">
              <span className="absolute top-2 left-4 text-xs font-bold text-orange-700 font-mono tracking-wider uppercase">
                संस्कृत श्लोक (मूल पाठ)
              </span>
              <p className="text-lg sm:text-2xl font-bold text-orange-950 font-serif leading-loose whitespace-pre-line mt-3 tracking-wide">
                {selectedPrayer.sanskrit}
              </p>
            </div>

            {/* Hindi Bhavarth */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 mb-2 text-orange-900 font-bold text-sm">
                <BookOpen className="w-4 h-4 text-orange-600" />
                <span>हिन्दी भावार्थ एवं महत्व</span>
              </div>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-base font-normal">
                {selectedPrayer.hindi}
              </p>
            </div>

            {/* Practical Instruction for Shishu Mandir Students */}
            <div className="bg-orange-100/50 p-4 rounded-xl border border-orange-200 flex items-start gap-3 text-xs text-orange-950">
              <span className="text-lg leading-none">🙏</span>
              <div>
                <strong>विद्या मंदिर नियम:</strong> छात्र-छात्राएं दोनों हाथ जोड़कर, नेत्र बंद कर, शांत मन से एकाग्रचित्त होकर इस मंत्र का उच्चारण करते हैं।
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

