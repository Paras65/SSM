import React, { useState, useMemo } from 'react';
import { Calendar, Sun, Moon, Sparkles, Volume2, VolumeX } from 'lucide-react';

export interface Subhashita {
  sanskrit: string;
  hindi: string;
  source: string;
}

export const WEEKLY_SUBHASHITAS: Subhashita[] = [
  // 0: Sunday (रविवासरे)
  {
    sanskrit: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः।\nन हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः॥',
    hindi: 'परिश्रम करने से ही सभी कार्य सिद्ध होते हैं, केवल इच्छा करने से नहीं। जिस प्रकार सोए हुए सिंह के मुख में हिरण स्वयं नहीं आता।',
    source: 'हितोपदेश (Hitopadesha)'
  },
  // 1: Monday (सोमवासरे)
  {
    sanskrit: 'विद्या ददाति विनयं विनयाद्याति पात्रताम्।\nपात्रत्वाद्धनमाप्नोति धनाद्धर्मं ततः सुखम्॥',
    hindi: 'विद्या विनम्रता देती है, विनम्रता से योग्यता आती है, योग्यता से धन, धन से धर्म और धर्म से परम सुख प्राप्त होता है।',
    source: 'हितोपदेश (Hitopadesha)'
  },
  // 2: Tuesday (मङ्गलवासरे)
  {
    sanskrit: 'अष्टादशपुराणेषु व्यासस्य वचनद्वयम्।\nपरोपकारः पुण्याय पापाय परपीडनम्॥',
    hindi: 'महर्षि वेदव्यास ने 18 पुराणों का सार दो वाक्यों में कहा है: परोपकार सबसे बड़ा पुण्य है और दूसरों को पीड़ा देना सबसे बड़ा पाप है।',
    source: 'व्यास सुभाषित (Maharshi Vyasa)'
  },
  // 3: Wednesday (बुधवासरे)
  {
    sanskrit: 'माता शत्रुः पिता वैरी येन बालो न पाठितः।\nन शोभते सभामध्ये हंसमध्ये बको यथा॥',
    hindi: 'वे माता-पिता शत्रु के समान हैं जो अपनी सन्तान को सुसंस्कृत विद्या नहीं दिलाते। अज्ञानी मनुष्य विद्वानों की सभा में हंसों के बीच बगुले जैसा रहता है।',
    source: 'चाणक्य नीति (Chanakya Niti)'
  },
  // 4: Thursday (गुरुवासरे)
  {
    sanskrit: 'गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः॥',
    hindi: 'गुरु ही ब्रह्मा हैं, गुरु ही विष्णु हैं, गुरु ही साक्षात् शिव हैं। गुरु ही साक्षात् परब्रह्म हैं; ऐसे पावन गुरुदेव को कोटि-कोटि नमन।',
    source: 'गुरु गीता (Guru Gita)'
  },
  // 5: Friday (शुक्रवासरे)
  {
    sanskrit: 'अभिवादनशीलस्य नित्यं वृद्धोपसेविनः।\nचत्वारि तस्य वर्धन्ते आयुर्विद्या यशो बलम्॥',
    hindi: 'जो नित्य माता-पिता व बड़ों का आदर करते हैं तथा वृद्धों की सेवा करते हैं, उनकी आयु, विद्या, यश और बल — ये चारों सदा बढ़ते हैं।',
    source: 'मनुस्मृति (Manusmriti)'
  },
  // 6: Saturday (शनिवासरे)
  {
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    hindi: 'तेरा अधिकार केवल कर्तव्य कर्म करने में है, फल में कभी नहीं। इसलिए फल की आसक्ति छोड़कर अनासक्त भाव से श्रेष्ठ कर्म करो।',
    source: 'श्रीमद्भगवद्गीता २.४७ (Gita)'
  }
];

const SANSKRIT_WEEKDAYS = [
  'रविवासरे (Sunday)',
  'सोमवासरे (Monday)',
  'मङ्गलवासरे (Tuesday)',
  'बुधवासरे (Wednesday)',
  'गुरुवासरे (Thursday)',
  'शुक्रवासरे (Friday)',
  'शनिवासरे (Saturday)'
];

const TITHI_NAMES = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा / अमावस्या'
];

const NAKSHATRAS = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य (शुभ)', 'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा',
  'पूर्वाभाद्रपद', 'उत्तराभाद्रपद', 'रेवती'
];

interface DailyPanchangProps {
  isEmbedded?: boolean;
}

export const DailyPanchang: React.FC<DailyPanchangProps> = ({ isEmbedded = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Compute dynamic daily panchang data based on real system date
  const panchangData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();
    const month = now.getMonth(); // 0-11
    const year = now.getFullYear();

    // Vikram Samvat calculation: Gregorian Year + 57
    const vikramSamvat = year + 57;
    // Devanagari numerals
    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    const samvatHindi = vikramSamvat
      .toString()
      .split('')
      .map(d => devanagariDigits[parseInt(d, 10)] || d)
      .join('');

    // Dynamic Sunrise (approximated for North India 05:45 - 06:15 depending on season)
    const sunriseMinutes = month >= 4 && month <= 7 ? '05:32 AM' : month >= 10 || month <= 1 ? '06:38 AM' : '06:05 AM';

    // Sanskrit Day Name
    const sanskritDay = SANSKRIT_WEEKDAYS[dayOfWeek];

    // Approximate Lunar Cycle (29.53 days)
    // Reference New Moon: Jan 11, 2024
    const refDate = new Date(2024, 0, 11).getTime();
    const daysSinceRef = (now.getTime() - refDate) / (1000 * 60 * 60 * 24);
    const lunarAge = ((daysSinceRef % 29.53059) + 29.53059) % 29.53059;

    const isShukla = lunarAge < 14.765;
    const paksha = isShukla ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';
    const tithiIndex = Math.min(14, Math.floor(isShukla ? lunarAge : lunarAge - 14.765));
    const tithiName = TITHI_NAMES[tithiIndex] || 'दशमी';

    // Nakshatra rotation (27 nakshatras)
    const nakshatraIndex = (dayOfMonth + month * 2) % NAKSHATRAS.length;
    const nakshatraName = NAKSHATRAS[nakshatraIndex];

    // Ritu & Ayana
    let ritu = 'वसन्त ऋतु';
    let ayana = 'उत्तरायण';
    if (month === 2 || month === 3) {
      ritu = 'वसन्त ऋतु';
      ayana = 'उत्तरायण';
    } else if (month === 4 || month === 5) {
      ritu = 'ग्रीष्म ऋतु';
      ayana = 'उत्तरायण';
    } else if (month === 6 || month === 7) {
      ritu = 'वर्षा ऋतु';
      ayana = 'दक्षिणायन';
    } else if (month === 8 || month === 9) {
      ritu = 'शरद ऋतु';
      ayana = 'दक्षिणायन';
    } else if (month === 10 || month === 11) {
      ritu = 'हेमन्त ऋतु';
      ayana = 'दक्षिणायन';
    } else {
      ritu = 'शिशिर ऋतु';
      ayana = 'उत्तरायण';
    }

    // Subhashita for today
    const subhashita = WEEKLY_SUBHASHITAS[dayOfWeek] || WEEKLY_SUBHASHITAS[0];

    return {
      samvatHindi,
      sunriseMinutes,
      sanskritDay,
      paksha,
      tithiName,
      nakshatraName,
      ritu,
      ayana,
      subhashita
    };
  }, []);

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(panchangData.subhashita.sanskrit);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.85;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div
      id="panchang"
      className={
        isEmbedded
          ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-orange-400/50'
          : 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white py-6 border-y border-orange-400/50 shadow-inner'
      }
    >
      <div className={isEmbedded ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        
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
                विक्रम संवत् {panchangData.samvatHindi}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/10 p-2 rounded-xl flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-300 shrink-0" />
                <div>
                  <span className="block text-[10px] text-amber-200">सूर्योदय व वार</span>
                  <strong className="text-white text-xs">{panchangData.sunriseMinutes} • {panchangData.sanskritDay.split(' ')[0]}</strong>
                </div>
              </div>

              <div className="bg-white/10 p-2 rounded-xl flex items-center gap-2">
                <Moon className="w-4 h-4 text-yellow-200 shrink-0" />
                <div>
                  <span className="block text-[10px] text-amber-200">पक्ष एवं तिथि</span>
                  <strong className="text-white text-xs">{panchangData.paksha} • {panchangData.tithiName}</strong>
                </div>
              </div>

              <div className="bg-white/10 p-2 rounded-xl">
                <span className="block text-[10px] text-amber-200">नक्षत्र</span>
                <strong className="text-white text-xs">{panchangData.nakshatraName} नक्षत्र</strong>
              </div>

              <div className="bg-white/10 p-2 rounded-xl">
                <span className="block text-[10px] text-amber-200">ऋतु व अयन</span>
                <strong className="text-white text-xs">{panchangData.ritu} • {panchangData.ayana}</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Subhashita of the Day */}
          <div className="lg:col-span-7 bg-white/15 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-white/20 relative">
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
                <Sparkles className="w-4 h-4" />
                <span>आज का सुभाषितम् ({panchangData.sanskritDay.split(' ')[0]})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-amber-200 font-serif italic">
                  स्त्रोत: {panchangData.subhashita.source}
                </span>
                <button
                  onClick={handleSpeech}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                "{panchangData.subhashita.sanskrit}"
              </p>
              <p className="text-xs text-stone-100 mt-2 font-normal leading-relaxed border-t border-white/15 pt-2">
                <strong>हिन्दी भावार्थ:</strong> {panchangData.subhashita.hindi}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
