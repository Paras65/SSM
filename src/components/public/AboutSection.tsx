import React from 'react';
import { History, BookOpen, Users, Compass, CheckCircle, Sparkles, ShieldCheck, Crown, ArrowRight, Laptop, FileText } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface AboutSectionProps {
  onOpenSignUp?: (plan?: 'free' | 'pro') => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenSignUp }) => {
  const { publicSchool } = useSchool();

  return (
    <section id="about" className="py-16 sm:py-20 bg-stone-50/80 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-orange-950 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <History className="w-3.5 h-3.5 text-orange-700" />
            <span>गौरवशाली परंपरा एवं आधुनिक ईआरपी संकल्प</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            संस्कारयुक्त शिक्षा एवं आधुनिक डिजिटल ईआरपी का संगम
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            वर्ष 1952 में गोरखपुर की पावन धरा से शुरू हुआ यह आंदोलन आज <strong>विद्या भारती अखिल भारतीय शिक्षा संस्थान</strong> के 
            मार्गदर्शन में आधुनिक क्लाउड ईआरपी तकनीक के साथ प्रत्येक भैया-बहिन के सर्वांगीण विकास को समर्पित है।
          </p>
        </div>

        {/* 2 Columns: Heritage Story & ERP Foundation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-12">
          
          {/* Left Column: Legacy and ERP Vision */}
          <div className="lg:col-span-6 space-y-5 text-stone-700 leading-relaxed text-sm sm:text-base flex flex-col justify-between">
            <div className="p-5 bg-gradient-to-r from-orange-100/70 via-amber-50 to-orange-100/50 rounded-2xl border border-orange-200 shadow-2xs space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-orange-950 flex items-center gap-2">
                <span>🚩</span>
                <span>प्रथम शिशु मंदिर: गोरखपुर, 1952</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                राष्ट्रऋषि नानाजी देशमुख एवं पूज्य गुरुजी माधवराव सदाशिवराव गोलवलकर के पावन सान्निध्य में
                प्रथम 'सरस्वती शिशु मंदिर' की नींव गोरखपुर में रखी गई थी। आज यह व्यवस्था देश के कोने-कोने में, 
                महानगरों से लेकर वनवासी व सीमांत क्षेत्रों तक हजारों विद्यालयों के रूप में राष्ट्र सेवा कर रही है।
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <Laptop className="w-5 h-5 text-orange-600" />
                <span>विद्या भारती ईआरपी: तकनीक से सेवा का संवर्धन</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                यह विद्यालय प्रबंधन प्रणाली (ERP) सरस्वती शिशु मंदिरों की विशिष्ट आवश्यकताओं — पंचमुखी शिक्षा, 
                आचार्य-दीदी जी पारिवारिक भाव, एवं भारतीय पंचांग को ध्यान में रखकर तैयार की गई है। इसके माध्यम से 
                कागजी औपचारिकताएं शून्य होती हैं, जिससे आचार्य पूर्ण निष्ठा से छात्रों के चरित्र निर्माण में संलग्न रह पाते हैं।
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 pt-1 text-xs sm:text-sm text-stone-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>NEP 2020 अनुपालन:</strong> 360° समग्र प्रगति पत्र (HPC) एवं सर्वांगीण विकास मूल्यांकन।</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>शून्य-लागत व्हाट्सएप संवाद:</strong> उपस्थिति, परीक्षा अंक एवं परिपत्र सीधे अभिभावकों के फोन पर।</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>डेटा सुरक्षा:</strong> 100% विज्ञापन-मुक्त, सुरक्षित एवं स्वायत्त बहु-शाखा डेटाबेस।</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>कागज-रहित प्रशासन:</strong> डिजिटल प्रवेश पंजिका, स्वचालित शुल्क रसीदें एवं 1-क्लिक टीसी सत्यापन।</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Strategic ERP & Cultural Pillars */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-orange-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-orange-600" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-1.5">
                  पंचमुखी शिक्षा व संस्कार
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  शारीरिक, योग, संगीत, संस्कृत एवं नैतिक-आध्यात्मिक शिक्षा के पांचों आयामों का दैनिक पाठ्यक्रम में समावेश।
                </p>
              </div>
              <span className="text-[11px] font-bold text-orange-700 mt-3 pt-2 border-t border-stone-100 block">
                सा विद्या या विमुक्तये
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-amber-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-amber-700" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-1.5">
                  आत्मीय परिवार भाव व पेरोल
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  आचार्य जी, दीदी जी एवं भैया-बहिन का पावन संबंध। साथ ही आचार्य उपस्थिति, मानदेय व पेरोल का पारदर्शी डिजिटल प्रबंधन।
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-800 mt-3 pt-2 border-t border-stone-100 block">
                पारिवारिक आत्मीयता
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-1.5">
                  डिजिटल छात्र पंजिका व टीसी
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  यू-डायस (UDISE+) संगत डेटा, डिजिटल आईडी कार्ड, फोटो प्रबंधन एवं ऑनलाइन क्यूआर/पिन आधारित स्थानांतरण प्रमाण पत्र (TC)।
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 mt-3 pt-2 border-t border-stone-100 block">
                100% पारदर्शी अभिलेख
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-orange-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center mb-3">
                  <Compass className="w-5 h-5 text-orange-700" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-1.5">
                  राष्ट्र प्रथम एवं बहु-शाखा क्लाउड
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  दैनिक सरस्वती वंदना, पंचांग व राष्ट्रीय पर्वों का उत्सव। प्रत्येक शाखा का पृथक सुरक्षित डेटाबेस और स्वायत्त नियंत्रण।
                </p>
              </div>
              <span className="text-[11px] font-bold text-orange-800 mt-3 pt-2 border-t border-stone-100 block">
                स्वायत्त एवं सुरक्षित
              </span>
            </div>

          </div>

        </div>

        {/* Bottom Banner: 15-Day ERP Trial Invite */}
        <div className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-amber-400/30">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl text-yellow-300 shrink-0">
              🪷
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-100 flex items-center gap-2 justify-center md:justify-start">
                <span>अपने विद्यालय में विद्या भारती ईआरपी लागू करें</span>
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  15-दिन ट्रायल
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-orange-200 mt-1 max-w-2xl">
                वर्तमान में <strong>{publicSchool.hindiName}</strong> सहित विभिन्न शाखाएं इस ईआरपी का सफल उपयोग कर रही हैं। 
                अपनी शाखा को 1-क्लिक में जोड़ें और 15-दिवसीय पूर्ण निःशुल्क परीक्षण प्राप्त करें।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenSignUp?.('pro')}
            className="whitespace-nowrap px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-orange-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Crown className="w-4 h-4 text-orange-950 fill-orange-950" />
            <span>15-दिवसीय निःशुल्क ट्रायल शुरू करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

