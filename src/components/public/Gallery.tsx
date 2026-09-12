import React, { useState } from 'react';
import { Camera } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  emoji: string;
  desc: string;
  gradient: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'वार्षिक घोष संचलन एवं कदमताल',
    category: 'Ghosh & Drill',
    emoji: '🥁',
    desc: 'विद्यालय के भैया-बहिनों द्वारा अनुशासित घोष वादन एवं पद संचलन प्रदर्शन।',
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'g-2',
    title: 'सामूहिक सूर्यनमस्कार एवं योगाभ्यास',
    category: 'Yog Divas',
    emoji: '🧘',
    desc: 'प्रातः काल में 108 सामूहिक सूर्यनमस्कार एवं प्राणायाम का आयोजन।',
    gradient: 'from-orange-500 to-red-600'
  },
  {
    id: 'g-3',
    title: 'अखिल भारतीय विज्ञान व वैदिक गणित मेला',
    category: 'Vigyan Mela',
    emoji: '🔬',
    desc: 'छात्रों द्वारा निर्मित सौर ऊर्जा मॉडल एवं प्राचीन भारतीय गणितीय प्रमेयों की प्रदर्शनी।',
    gradient: 'from-amber-600 to-yellow-600'
  },
  {
    id: 'g-4',
    title: 'मातृ सम्मेलन एवं अभिभावक संवाद',
    category: 'Matri Sammelan',
    emoji: '👩‍👧‍👦',
    desc: 'बालक के प्रथम गुरु माता के सम्मान एवं संस्कार निर्माण हेतु विशेष सम्मेलन।',
    gradient: 'from-rose-500 to-orange-500'
  },
  {
    id: 'g-5',
    title: 'बसंत पंचमी एवं माँ सरस्वती पूजन',
    category: 'Saraswati Puja',
    emoji: '🪷',
    desc: 'ज्ञानदायिनी माँ शारदा की पावन वंदना, हवन एवं अक्षराभ्यास संस्कार।',
    gradient: 'from-yellow-500 to-amber-600'
  },
  {
    id: 'g-6',
    title: 'पारंपरिक भारतीय खेल प्रतियोगिता (कबड्डी व खो-खो)',
    category: 'Khel Kood',
    emoji: '🏆',
    desc: 'शारीरिक बलिष्ठता एवं सौहार्द हेतु अंतर-शाखा पारंपरिक खेलकूद प्रतियोगिता।',
    gradient: 'from-orange-600 to-red-700'
  }
];

export const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Ghosh & Drill', 'Yog Divas', 'Vigyan Mela', 'Saraswati Puja', 'Khel Kood'];

  const filteredItems = selectedCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <section id="gallery" className="py-16 bg-stone-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Camera className="w-3.5 h-3.5 text-orange-600" />
            <span>चित्र दीर्घा • उत्सव एवं गतिविधियां</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            विद्यालयी गतिविधियां एवं कार्यक्रम (School Activities)
          </h2>
          <p className="mt-2 text-base text-stone-600">
            सरस्वती शिशु मंदिर में वर्षभर विविध उत्सवों, राष्ट्रीय पर्वों एवं प्रतियोगिताओं के माध्यम से जीवन मूल्यों का निर्माण होता है।
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-orange-700 text-white shadow-xs'
                  : 'bg-white hover:bg-orange-50 text-stone-700 border border-stone-200'
              }`}
            >
              {cat === 'All' ? 'सभी झलकियां' : cat}
            </button>
          ))}
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className={`h-40 bg-gradient-to-tr ${item.gradient} p-6 flex flex-col items-center justify-center text-white relative overflow-hidden`}>
                <div className="text-5xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                  {item.emoji}
                </div>
                <span className="px-2.5 py-0.5 bg-black/25 backdrop-blur-xs rounded-full text-[11px] font-bold tracking-wider">
                  {item.category}
                </span>
              </div>
              <div className="p-5">
                <h4 className="text-base font-bold text-stone-900 mb-1 group-hover:text-orange-700 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
