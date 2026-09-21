import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Phone, Mail, MapPin, Clock, Heart, ShieldCheck, Lock, Crown, Globe } from 'lucide-react';
import { PrivacyPolicyModal } from '../common/PrivacyPolicyModal';
import { SchoolPlansModal } from './SchoolPlansModal';
import { TCVerificationModal } from './TCVerificationModal';

interface FooterProps {
  onOpenHelpGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenHelpGuide }) => {
  const { publicSchool } = useSchool();
  const { t } = useLanguage();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);

  const envPhone = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPPORT_PHONE || import.meta.env?.VITE_DEFAULT_PHONE)) || '+91 94150 00000';
  const envAddress = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEFAULT_ADDRESS) || 'SSM ERP';
  const displayAddress = (publicSchool.id === 'ssm-national' || !publicSchool.address || publicSchool.address.includes('विद्या भारती अखिल भारतीय शिक्षा संस्थान')) ? envAddress : publicSchool.address;
  const displayPhone = (publicSchool.id === 'ssm-national' || !publicSchool.phone || publicSchool.phone.includes('1800-180-5522')) ? envPhone : publicSchool.phone;
  const displayEmail = publicSchool.email || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_UPGRADE_CONTACT) || 'support@init65.co.in';
  const displayWebsite = publicSchool.website || 'https://www.init65.co.in';

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
                  {publicSchool.id === 'ssm-national' ? 'SSM ERP' : publicSchool.hindiName}
                </h4>
                <span className="text-[10px] text-amber-200 uppercase tracking-wider block">
                  {publicSchool.id === 'ssm-national' 
                    ? 'सरस्वती शिशु मंदिर डिजिटल ईआरपी प्रणाली • विद्या भारती' 
                    : `${publicSchool.prant} • विद्या भारती`}
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
              <li><a href="#contact" className="hover:text-orange-400 transition-colors text-amber-300 font-medium">📞 संपर्क व ईआरपी सहायता केंद्र</a></li>
              {onOpenHelpGuide && (
                <li>
                  <button
                    type="button"
                    onClick={onOpenHelpGuide}
                    className="hover:text-orange-400 transition-colors text-left flex items-center gap-1.5 text-amber-300 font-semibold cursor-pointer"
                  >
                    <span>📖 संपूर्ण उपयोगकर्ता मार्गदर्शिका (43 अध्याय)</span>
                  </button>
                </li>
              )}
              <li><a href="#panchmukhi" className="hover:text-orange-400 transition-colors">पंचमुखी शिक्षा आयाम</a></li>
              <li><a href="#vandana" className="hover:text-orange-400 transition-colors">दैनिक सरस्वती वंदना एवं मंत्र</a></li>
              <li><a href="#admissions" className="hover:text-orange-400 transition-colors">सत्र 2026-27 प्रवेश फॉर्म</a></li>
              <li><a href="#acharyas" className="hover:text-orange-400 transition-colors">आचार्य एवं दीदी जी परिचय</a></li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowTcModal(true)}
                  className="hover:text-orange-400 transition-colors text-left flex items-center gap-1.5 text-stone-300 hover:text-amber-200 font-medium cursor-pointer"
                >
                  <span>🔍 ऑनलाइन टीसी सत्यापन (Verify TC)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowPlansModal(true)}
                  className="hover:text-orange-400 transition-colors text-left flex items-center gap-1.5 text-amber-300 font-medium cursor-pointer"
                  title="अन्य विद्यालयों हेतु 15-दिवसीय निःशुल्क ट्रायल एवं ईआरपी योजनाएं देखें"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>अन्य विद्यालयों हेतु ईआरपी (15-दिन ट्रायल)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-orange-400 transition-colors text-left flex items-center gap-1.5 text-amber-300 font-medium cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>{t('privacyNotice')}</span>
                </button>
              </li>
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
                <span>{displayAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <a href={`tel:${displayPhone}`} className="hover:text-amber-300 transition">
                  {displayPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <a href={`mailto:${displayEmail}`} className="hover:text-amber-300 transition">
                  {displayEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-500 shrink-0" />
                <a
                  href={displayWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-300 hover:text-white font-mono font-bold hover:underline transition"
                >
                  {displayWebsite.replace(/^https?:\/\//, '')}
                </a>
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

        {/* DPDP Act 2023 Trust & Compliance Bar */}
        <div className="my-6 p-3.5 bg-stone-900/90 border border-orange-900/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <span className="p-1.5 rounded-lg bg-orange-950 border border-orange-800 text-orange-400">
              <Lock className="w-4 h-4" />
            </span>
            <span>
              <strong className="text-amber-300">डेटा सुरक्षा का अनुपालन:</strong> छात्र डेटा 100% सुरक्षित, एन्क्रिप्टेड एवं विज्ञापन-मुक्त (No Ads & No Tracking) है।
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-orange-400 hover:text-orange-300 underline font-medium text-[11px]"
            >
              पूर्ण नीति पढ़ें
            </button>
            <span className="text-stone-700">•</span>
            <a
              href="mailto:support@init65.co.in"
              className="text-stone-400 hover:text-amber-300 text-[11px] flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-orange-400" />
              <span>शिकायत अधिकारी: support@init65.co.in</span>
            </a>
          </div>
        </div>

        {/* Developer Vision & Portfolio Credit */}
        <div className="pt-4 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400 gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p>© {new Date().getFullYear()} {publicSchool.id === 'ssm-national' ? 'SSM ERP' : publicSchool.hindiName}। • सॉफ्टवेयर कॉपीराइट: <span className="text-amber-300 font-bold">init65.co.in</span></p>
            <p className="text-[11px] text-stone-500 max-w-xl">
              सरस्वती शिशु मंदिर के भैया-बहिनों, आचार्यों एवं विद्यालय प्रबंधन की व्यावहारिक समस्याओं के समाधान हेतु समर्पित स्वतंत्र ईआरपी प्रणाली।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-xs font-medium">निर्माता एवं डेवलपर:</span>
            <a
              href="https://www.init65.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-orange-950/80 border border-orange-700/60 text-amber-300 hover:text-white hover:border-amber-400 font-mono font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <span>🌐 init65.co.in</span>
            </a>
          </div>
        </div>

      </div>

      {/* DPDP Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* School ERP Plans & 15-Day Free Trial Modal */}
      <SchoolPlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
      />

      {/* Public TC Verification Modal */}
      <TCVerificationModal
        isOpen={showTcModal}
        onClose={() => setShowTcModal(false)}
      />
    </footer>
  );
};

