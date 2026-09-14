import React, { useState } from 'react';
import { GraduationCap, HeartHandshake, Award, Building, Sparkles, UserCheck, ArrowRight } from 'lucide-react';
import { AlumniRegistrationModal } from './AlumniRegistrationModal';

export const AlumniSection: React.FC = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const distinguishedAlumni = [
    {
      name: 'डॉ. विवेक कुमार शर्मा',
      batch: 'सत्र 2004',
      role: 'वरिष्ठ वैज्ञानिक, ISRO',
      achievement: 'चंद्रयान एवं गगनयान मिशन परियोजना में महत्वपूर्ण योगदान',
      quote: 'सरस्वती शिशु मंदिर में सीखी अनुशासन और एकाग्रता ही मेरी सबसे बड़ी शक्ति बनी।'
    },
    {
      name: 'मेजर सुमित विक्रम सिंह',
      batch: 'सत्र 2008',
      role: 'अधिकारी, भारतीय थलसेना (सेना मेडल)',
      achievement: 'शौर्य एवं राष्ट्र रक्षा में असाधारण नेतृत्व',
      quote: 'दैनिक वंदना और देशभक्ति के गीतों ने बाल्यकाल से ही भारत माता की सेवा का संकल्प जगाया।'
    },
    {
      name: 'सुश्री स्वाति मिश्रा',
      batch: 'सत्र 2014',
      role: 'भारतीय प्रशासनिक सेवा (IAS)',
      achievement: 'ग्रामीण विकास एवं महिला सशक्तिकरण में विशिष्ट पहल',
      quote: 'आचार्यों द्वारा दिए गए नैतिक मूल्य जीवन के प्रत्येक प्रशासनिक निर्णय का मार्गदर्शन करते हैं।'
    },
    {
      name: 'श्री अतुल गर्ग',
      batch: 'सत्र 2011',
      role: 'संस्थापक एवं CEO, टेक इनोवेशन्स',
      achievement: 'स्टार्टअप इंडिया के अंतर्गत 200+ युवाओं को रोजगार',
      quote: 'शिशु मंदिर का पंचमुखी शिक्षण केवल किताबी ज्ञान नहीं, जीवन की हर चुनौती जीतने का सामर्थ्य देता है।'
    }
  ];

  return (
    <section id="alumni" className="py-14 bg-gradient-to-b from-stone-50 via-amber-50/40 to-stone-50 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-300 text-orange-900 text-xs font-bold shadow-2xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>राष्ट्र निर्माण में समर्पित हमारे गौरव</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            पूर्व छात्र परिषद (Purva Chhatra Parishad)
          </h2>
          <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
            विद्या भारती के संस्कारवान भैया-बहिन आज विज्ञान, रक्षा, सिविल सेवा, उद्योग एवं समाज सेवा के प्रत्येक क्षेत्र में भारत का मान बढ़ा रहे हैं।
          </p>
        </div>

        {/* Impact Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-2xs text-center">
            <span className="block text-2xl font-black text-orange-600">5,000+</span>
            <span className="text-xs font-bold text-stone-700">पुरातन छात्र संजाल</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-2xs text-center">
            <span className="block text-2xl font-black text-amber-600">100%</span>
            <span className="text-xs font-bold text-stone-700">संस्कारयुक्त राष्ट्र सेवा</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-2xs text-center">
            <span className="block text-2xl font-black text-emerald-600">25+</span>
            <span className="text-xs font-bold text-stone-700">प्रांतीय पूर्व छात्र परिषद</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-2xs text-center">
            <span className="block text-2xl font-black text-purple-600">सत्र 1952</span>
            <span className="text-xs font-bold text-stone-700">से अखंड परंपरा</span>
          </div>
        </div>

        {/* Distinguished Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {distinguishedAlumni.map((alum, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-5 border border-orange-200/80 hover:border-orange-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-orange-700 flex items-center justify-center font-black text-lg mb-3 shadow-inner">
                  {alum.name.charAt(3) || 'श'}
                </div>
                <h4 className="font-extrabold text-stone-900 text-sm">{alum.name}</h4>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 text-[10px] font-bold">
                    {alum.batch}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-500 truncate">
                    {alum.role}
                  </span>
                </div>
                <p className="text-xs text-stone-600 font-medium leading-snug mb-3">
                  {alum.achievement}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 bg-amber-50/40 p-2.5 rounded-xl">
                <p className="text-[11px] text-stone-700 italic leading-tight">
                  "{alum.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Registration CTA Banner */}
        <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-amber-200 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              <span>पुरातन छात्र-छात्राएं सादर आमंत्रित हैं</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              क्या आप भी सरस्वती शिशु मंदिर के पूर्व छात्र हैं?
            </h3>
            <p className="text-amber-100 text-xs sm:text-sm max-w-xl">
              अपने विद्यालय से जुड़ें, नई पीढ़ी के भैया-बहिनों का करियर मार्गदर्शन करें और विद्या भारती परिवार को सशक्त बनाएं।
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="px-6 py-3 bg-white hover:bg-amber-50 text-orange-950 font-black text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>🎓 पूर्व छात्र पंजीकरण करें</span>
              <ArrowRight className="w-4 h-4 text-orange-700" />
            </button>
          </div>
        </div>

      </div>

      <AlumniRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </section>
  );
};

