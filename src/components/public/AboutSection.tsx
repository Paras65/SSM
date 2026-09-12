import React from 'react';
import { History, BookOpen, Users, Compass, CheckCircle } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-stone-50/70 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5 text-orange-600" />
            <span>गौरवशाली इतिहास एवं संकल्प</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            सरस्वती शिशु मंदिर का प्रादुर्भाव एवं उद्देश्य
          </h2>
          <p className="mt-2 text-base text-stone-600">
            स्वतंत्रता के उपरांत भारतीय संस्कृति, राष्ट्रीय चरित्र और मूल्यों पर आधारित शिक्षा प्रणाली के रूप में इसका बीजारोपण हुआ।
          </p>
        </div>

        {/* 2 Columns: Story & Principles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-4 text-stone-700 leading-relaxed text-sm sm:text-base">
            <div className="p-4 bg-orange-100/50 rounded-2xl border border-orange-200">
              <h3 className="text-lg font-bold text-orange-950 mb-1 flex items-center gap-2">
                <span>🚩</span> प्रथम शिशु मंदिर: गोरखपुर, 1952
              </h3>
              <p className="text-xs sm:text-sm text-stone-700">
                वर्ष 1952 में उत्तर प्रदेश के गोरखपुर नगर में राष्ट्रऋषि नानाजी देशमुख एवं पूज्य गुरुजी के पावन सान्निध्य में
                प्रथम 'सरस्वती शिशु मंदिर' की स्थापना एक छोटे से भवन में किराए पर की गई थी। आज यह वटवृक्ष बनकर पूरे देश में पल्लवित है।
              </p>
            </div>

            <p>
              आज <strong>विद्या भारती अखिल भारतीय शिक्षा संस्थान</strong> के अंतर्गत देश के कोने-कोने में, नगरों, ग्रामों तथा वनवासी क्षेत्रों में
              हजारों सरस्वती शिशु एवं विद्या मंदिर संचालित हैं।
            </p>

            <p>
              विद्यालय में आत्मीय पारिवारिक वातावरण रहता है। शिक्षकगण <strong>'आचार्य जी'</strong> व <strong>'दीदी जी'</strong> के रूप में
              छात्र-छात्राओं को अपने सगे <strong>'भैया'</strong> व <strong>'बहिन'</strong> तुल्य स्नेह और मार्गदर्शन प्रदान करते हैं।
            </p>

            {/* Checklist */}
            <div className="space-y-2 pt-2 text-xs sm:text-sm text-stone-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <span>सनातन भारतीय संस्कारों के साथ-साथ सीबीएसई व आधुनिक विज्ञान पाठ्यक्रम।</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <span>मातृभाषा, संस्कृत और राष्ट्रभाषा हिन्दी के साथ आंग्ल भाषा में निपुणता।</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
                <span>चरित्र निर्माण, पर्यावरण संरक्षण और समाजोपयोगी कार्यों में सहभागिता।</span>
              </div>
            </div>
          </div>

          {/* Cards Grid on Right */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1">
                शिशु मंदिर एवं विद्या मंदिर
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                शिशु वाटिका एवं प्राथमिक से माध्यमिक स्तर तक 'शिशु मंदिर' तथा उच्च एवं वरिष्ठ माध्यमिक स्तर पर 'विद्या मंदिर' के रूप में मार्गदर्शन।
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1">
                आत्मीय परिवार भाव
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                गुरु-शिष्य के पावन संबंध। 'आचार्य जी', 'दीदी जी', 'भैया' और 'बहिन' शब्दों का संबोधन परस्पर सम्मान और सौहार्द स्थापित करता है।
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1">
                राष्ट्र प्रथम की भावना
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                प्रातः राष्ट्रगान, वंदे मातरम्, भारत माता पूजन एवं अमर बलिदानी वीरों के जीवन प्रसंगों से देशप्रेम की स्थायी भावना।
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center mb-3">
                <span className="text-xl">🌿</span>
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1">
                प्रकृति व योग निष्ठा
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                नियमित योगाभ्यास, प्राणायाम, सूर्य नमस्कार, वृक्षारोपण और स्वच्छता संस्कार विद्यार्थियों की दिनचर्या का अनिवार्य अंग हैं।
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
