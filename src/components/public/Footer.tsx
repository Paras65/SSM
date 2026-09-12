import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { publicSchool } = useSchool();
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white pt-14 pb-8 border-t-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          
          {/* Col 1: About SSM */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-xl text-yellow-300 shadow-md">
                🪷
              </div>
              <div>
                <h4 className="text-base font-bold text-orange-400 leading-tight">
                  {publicSchool.hindiName}
                </h4>
                <span className="text-[10px] text-amber-200 uppercase tracking-wider block">
                  {publicSchool.prant} • विद्या भारती
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              एक सरल डिजिटल मंच, जो प्रत्येक शाखा को छात्र प्रबंधन, उपस्थिति, शुल्क, गृहकार्य और संचार की सामान्य सुविधाएं देता है।
            </p>
            <div className="pt-1">
              <span className="inline-block px-2.5 py-1 bg-orange-950 border border-orange-800 rounded-md text-[11px] font-mono text-orange-300">
                ध्येय: "{publicSchool.tagline}"
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
              महत्वपूर्ण संपर्क व कड़ियाँ
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li><a href="#about" className="hover:text-orange-400 transition-colors">विद्यालय परिचय एवं इतिहास</a></li>
              <li><a href="#panchmukhi" className="hover:text-orange-400 transition-colors">पंचमुखी शिक्षा आयाम</a></li>
              <li><a href="#vandana" className="hover:text-orange-400 transition-colors">दैनिक सरस्वती वंदना एवं मंत्र</a></li>
              <li><a href="#notices" className="hover:text-orange-400 transition-colors">सूचनाएं एवं परीक्षा कार्यक्रम</a></li>
              <li><a href="#admissions" className="hover:text-orange-400 transition-colors">सत्र 2026-27 प्रवेश फॉर्म</a></li>
              <li><a href="#acharyas" className="hover:text-orange-400 transition-colors">आचार्य एवं दीदी जी परिचय</a></li>
              <li><a href="#privacy" className="hover:text-orange-400 transition-colors">{t('privacyNotice')}</a></li>
              <li><a href="#terms" className="hover:text-orange-400 transition-colors">{t('termsOfUse')}</a></li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
              संपर्क एवं पता (Address)
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{publicSchool.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{publicSchool.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{publicSchool.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{publicSchool.timings}</span>
              </div>
            </div>
          </div>

          {/* Col 4: Auspicious Shanti Mantra */}
          <div className="space-y-3 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
            <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>सदा स्मरणीय शांति मंत्र</span>
            </h4>
            <p className="text-xs text-amber-100/90 font-serif leading-relaxed italic">
              "ॐ सर्वे भवन्तु सुखिनः <br />
              सर्वे सन्तु निरामयाः। <br />
              सर्वे भद्राणि पश्यन्तु <br />
              मा कश्चिद्दुःखभाग्भवेत्॥ <br />
              ॐ शान्तिः शान्तिः शान्तिः॥"
            </p>
            <p className="text-[10px] text-stone-400">
              सबका कल्याण हो, सभी निरोगी रहें, सब शुभ देखें और कोई भी दुःखी न हो।
            </p>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-3">
          <p>© {new Date().getFullYear()} {publicSchool.hindiName}. सर्वाधिकार सुरक्षित।</p>
          <p className="flex items-center gap-1">
            <span>विद्या भारती अखिल भारतीय शिक्षा संस्थान के मार्गदर्शन में समर्पित</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>

      </div>
    </footer>
  );
};

