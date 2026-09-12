import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../../context/SchoolContext';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  X,
  Zap,
  FileSpreadsheet,
  Users,
  MessageSquare,
  Award,
  IdCard,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  featureDescription?: string;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureName,
  featureDescription
}) => {
  const { currentSchool } = useSchool();
  const [error, setError] = useState('');
  const [contactStep, setContactStep] = useState<'details' | 'contact'>('details');
  const upgradeContact = import.meta.env.VITE_UPGRADE_CONTACT || 'support@init65.co.in';
  const contactHref = upgradeContact.includes('@') ? `mailto:${upgradeContact}` : `tel:${upgradeContact}`;

  const handleClose = () => {
    setContactStep('details');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const PRO_BENEFITS = [
    {
      icon: Users,
      title: 'आचार्य एवं वेतन प्रबंधन (Staff & Payroll)',
      desc: 'शिक्षकों का पूरा रिकॉर्ड, मासिक वेतन पर्ची (Salary Slip) एवं भत्ते प्रबंधन'
    },
    {
      icon: Award,
      title: '360° समग्र प्रगति पत्र (Holistic Report Cards)',
      desc: 'NEP 2020 एवं विद्या भारती मानक अनुरूप 5 आधार विषयों सहित अंकसूची'
    },
    {
      icon: MessageSquare,
      title: 'व्हाट्सएप त्वरित सूचना (WhatsApp Alerts)',
      desc: 'अनुपस्थिति, गृहकार्य और शुल्क देयता का सीधा संदेश अभिभावकों के मोबाइल पर'
    },
    {
      icon: IdCard,
      title: 'छात्र परिचय पत्र एवं टीसी (ID Cards & TC)',
      desc: 'बारकोड युक्त डिजिटल आईडी कार्ड प्रिंटिंग व आधिकारिक स्थानांतरण प्रमाण पत्र'
    },
    {
      icon: Zap,
      title: 'थोक उपस्थिति अंकन (Bulk Attendance)',
      desc: 'पूरी कक्षा की उपस्थिति एक क्लिक में दर्ज करें, समय की भारी बचत'
    },
    {
      icon: FileSpreadsheet,
      title: 'एक्सेल/CSV डेटा निर्यात (Data Export)',
      desc: 'छात्र, शुल्क और उपस्थिति रिकॉर्ड्स का त्वरित एक्सेल बैकअप एवं रिपोर्ट'
    }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-500/30 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/20 via-orange-400/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/15 via-yellow-400/10 to-transparent rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header */}
        <div className="relative z-10 px-6 sm:px-8 pt-7 pb-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg text-white">
              <Crown className="w-7 h-7 text-yellow-200 fill-yellow-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 text-yellow-100 text-xs font-bold tracking-wide uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Vidya Bharati ERP — Seva & Technical Support
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                तकनीकी सहयोग व प्रो ईआरपी (Technical Support & AMC)
              </h2>
              <p className="text-white/90 text-xs sm:text-sm mt-0.5">
                शाखा: <span className="font-semibold text-yellow-100">{currentSchool?.hindiName || currentSchool?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            title="बंद करें"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Feature Specific Highlight Banner (if clicked from a locked feature) */}
        {featureName && (
          <div className="relative z-10 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/40 px-6 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-amber-900 dark:text-amber-200">
                लॉक्ड फीचर: {featureName}
              </span>
              <p className="text-amber-700 dark:text-amber-300/80 text-[11px] sm:text-xs">
                {featureDescription || 'यह सुविधा समर्पित सर्वर एवं तकनीकी सहयोग (AMC Support) में सक्रिय शाखाओं के लिए उपलब्ध है।'}
              </p>
            </div>
          </div>
        )}

        {/* Body content with scroll */}
        <div className="relative z-10 p-6 sm:p-8 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}
          {contactStep === 'details' ? (
          <>
          {/* Pro Benefits Grid */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              तकनीकी सहयोग के अंतर्गत मिलने वाली उन्नत सुविधाएं:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRO_BENEFITS.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-amber-300 dark:hover:border-amber-600/40 transition-colors flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-300 dark:border-amber-600/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold mb-1">
                न्यूनतम तकनीकी अनुरक्षण सहयोग (AMC Support)
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">₹799</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ प्रति माह (अथवा ₹8,000 / वार्षिक न्यूनतम सहयोग)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                बिना किसी व्यावसायिक लाभ के, केवल समर्पित सर्वर, 360° NEP रिपोर्ट कार्ड व दैनिक बैकअप रखरखाव हेतु।
              </p>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setContactStep('contact');
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
              >
                <>
                  <ShieldCheck className="w-5 h-5 text-yellow-200" />
                  तकनीकी सहयोग डेस्क से संपर्क करें
                  <ArrowRight className="w-4 h-4" />
                </>
              </button>
            </div>
          </div>
          </>
          ) : (
            <div className="text-center space-y-5">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">तकनीकी सहयोग (AMC) सक्रियण हेतु संपर्क करें</h3>
                <p className="text-xs text-slate-500 mt-1">शाखा सत्यापन और समर्पित सर्वर आवंटन के बाद तकनीकी सहयोग प्रो सक्रिय किया जाएगा।</p>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-950">
                <p className="font-bold">तकनीकी सहायता एवं सर्वर अनुरक्षण डेस्क</p>
                <p className="font-mono mt-2 break-all">{upgradeContact}</p>
                <p className="text-xs mt-3">शाखा का नाम और आवश्यक तकनीकी सहयोग (AMC) आवश्यकताएं साझा करें।</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button type="button" onClick={() => setContactStep('details')} className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                  वापस जाएं
                </button>
                <a href={contactHref} className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">Contact Support</a>
              </div>
              <p className="text-[11px] text-slate-500">समर्पित सर्वर आवंटन के बाद तुरंत प्रभाव से सेवाएं सक्रिय कर दी जाती हैं।</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-10 px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>* वर्तमान में आप निःशुल्क योजना (Free Plan) का उपयोग कर रहे हैं</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            निःशुल्क जारी रखें (Continue Free)
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

