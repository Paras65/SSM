import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  CheckCircle, 
  Headphones, 
  Crown, 
  ArrowRight,
  HelpCircle,
  School,
  Globe
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

interface ContactSectionProps {
  onOpenSignUp?: (plan?: 'free' | 'pro') => void;
  onOpenBranchList?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  onOpenSignUp, 
  onOpenBranchList 
}) => {
  const { publicSchool } = useSchool();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'parent',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const envPhone = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPPORT_PHONE || import.meta.env?.VITE_DEFAULT_PHONE)) || '+91 94150 00000';
  const envAddress = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DEFAULT_ADDRESS) || 'SSM ERP';
  const displayAddress = (publicSchool.id === 'ssm-national' || !publicSchool.address || publicSchool.address.includes('विद्या भारती अखिल भारतीय शिक्षा संस्थान')) ? envAddress : publicSchool.address;
  const displayPhone = (publicSchool.id === 'ssm-national' || !publicSchool.phone || publicSchool.phone.includes('1800-180-5522')) ? envPhone : publicSchool.phone;
  const displayEmail = publicSchool.email || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_UPGRADE_CONTACT) || 'support@init65.co.in';
  const displayWebsite = publicSchool.website || 'https://www.init65.co.in';

  // Clean phone number for WhatsApp URL
  const phoneClean = displayPhone.replace(/[^0-9]/g, '');
  const waTarget = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setSubmitted(true);
  };

  const getWhatsAppMessageUrl = (presetText?: string) => {
    const text = presetText || `सादर नमस्ते,\nमेरा नाम: ${formData.name || 'अभिभावक'}\nसंपर्क: ${formData.phone || ''}\nश्रेणी: ${
      formData.category === 'parent' ? 'अभिभावक' : formData.category === 'new_school' ? 'अन्य विद्यालय प्रबंधन' : 'सामान्य'
    }\nसंदेश: ${formData.message || 'विद्यालय/ईआरपी संबंधी जानकारी चाहिए।'}`;
    return `https://wa.me/${waTarget}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-gradient-to-b from-stone-50 via-white to-orange-50/40 border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100 border border-orange-300 text-orange-950 text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Headphones className="w-3.5 h-3.5 text-orange-700" />
            <span>संपर्क एवं ईआरपी सहायता केंद्र (Contact & Helpdesk)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            हमसे संपर्क करें एवं तकनीकी सहायता प्राप्त करें
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            विद्यालय परिसर कार्यालय, प्रवेश व शुल्क सहायता, अथवा अन्य विद्या भारती विद्यालयों हेतु 
            <strong> 15-दिवसीय निःशुल्क ईआरपी पायलट</strong> के लिए हमारी टीम सदैव तत्पर है।
          </p>
        </div>

        {/* 3 Interactive Contact Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Pillar 1: Campus Office */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                विद्यालय परिसर कार्यालय
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                प्राथमिक व माध्यमिक प्रशासनिक कार्यालय, प्रधानाचार्य कक्ष एवं पूछताछ केंद्र।
              </p>
              
              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>{displayAddress}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{publicSchool.timings}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                  <a href={`tel:${displayPhone}`} className="hover:text-orange-700 font-semibold underline decoration-orange-300">
                    {displayPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-orange-600 shrink-0" />
                  <a href={`mailto:${displayEmail}`} className="hover:text-orange-700 font-semibold">
                    {displayEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-orange-600 shrink-0" />
                  <a
                    href={displayWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-700 font-mono font-bold underline decoration-orange-300"
                  >
                    {displayWebsite.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
              <span>मान्यता: {publicSchool.prant || 'काशी प्रांत'}</span>
              <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-[10px]">
                सत्र: {publicSchool.currentAcademicYear || '2026-27'}
              </span>
            </div>
          </div>

          {/* Pillar 2: 1-Click WhatsApp Quick Desk */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 rounded-2xl p-6 border border-emerald-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-lg font-bold text-stone-900">
                  1-क्लिक व्हाट्सएप सहायता
                </h3>
              </div>
              <p className="text-xs text-stone-600 mb-4">
                कार्यालय समय में तुरंत समाधान। अभिभावक एवं शिक्षक सीधे व्हाट्सएप संदेश भेजें:
              </p>

              <div className="space-y-2 mb-4">
                <a
                  href={getWhatsAppMessageUrl('सादर नमस्ते, मुझे सत्र 2026-27 नए प्रवेश प्रक्रिया के संबंध में जानकारी चाहिए।')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-semibold transition"
                >
                  <span>📝 प्रवेश संबंधी पूछताछ</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                </a>
                <a
                  href={getWhatsAppMessageUrl('सादर नमस्ते, मुझे छात्र शुल्क रसीद व बकाया विवरण की जानकारी चाहिए।')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-semibold transition"
                >
                  <span>💳 शुल्क व रसीद सत्यापन</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                </a>
                <a
                  href={getWhatsAppMessageUrl('सादर नमस्ते, मुझे ऑनलाइन स्थानांतरण प्रमाण पत्र (TC) सत्यापन में सहायता चाहिए।')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-semibold transition"
                >
                  <span>🔍 टीसी व अंकतालिका सहायता</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                </a>
              </div>
            </div>

            <a
              href={`https://wa.me/${waTarget}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>सीधे व्हाट्सएप पर चैट करें</span>
            </a>
          </div>

          {/* Pillar 3: ERP 15-Day Pilot Desk */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-50 to-amber-100/40 rounded-2xl p-6 border-2 border-amber-300 shadow-2xs hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
              <School className="w-36 h-36 text-orange-950" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 border border-amber-400 text-orange-950 text-[11px] font-black uppercase tracking-wider">
                  15-दिन निःशुल्क ट्रायल
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 mb-2">
                अन्य विद्यालयों हेतु ईआरपी डेस्क
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                क्या आप भी अपने सरस्वती शिशु/विद्या मंदिर में 100% कागज-रहित डिजिटल प्रबंधन, 
                NEP 2020 रिपोर्ट कार्ड एवं व्हाट्सएप अलर्ट शुरू करना चाहते हैं?
              </p>

              <div className="space-y-2 text-xs text-stone-800 mb-5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>बिना किसी अग्रिम शुल्क के 15 दिन निःशुल्क ट्रायल</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>छात्र व आचार्य डेटा का 1-क्लिक एक्सेल/CSV आयात</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>DPDP Act 2023 के तहत पूर्ण डेटा संप्रभुता</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onOpenSignUp?.('pro')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>निशुल्क 15-दिवसीय ट्रायल शुरू करें</span>
              </button>

              {onOpenBranchList && (
                <button
                  type="button"
                  onClick={onOpenBranchList}
                  className="w-full py-2 px-3 bg-white hover:bg-orange-50 text-stone-700 border border-stone-200 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>पंजीकृत शाखाएं व संकुल देखें</span>
                  <ArrowRight className="w-3 h-3 text-stone-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Inquiry Form & Quick Assistance */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-800 bg-orange-100 px-3 py-1 rounded-full">
                <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
                <span>त्वरित संदेश प्रेषण</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                सीधे विद्यालय प्रशासन या ईआरपी टीम को संदेश भेजें
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                अपना प्रश्न या आवश्यकता दर्ज करें। हमारा प्रशासनिक व तकनीकी दल आपसे 
                यथाशीघ्र संपर्क करेगा। आप चाहें तो सीधे व्हाट्सएप पर भी अग्रेषित कर सकते हैं।
              </p>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs text-stone-700">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>डेटा गोपनीयता व सुरक्षा प्रतिज्ञा</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  आपकी व्यक्तिगत जानकारी (नाम, फोन नंबर) केवल संपर्क के उद्देश्य से सुरक्षित रखी जाती है।
                  यह किसी भी तीसरे पक्ष के साथ साझा नहीं की जाती।
                </p>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-4 animate-in fade-in duration-200">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-950">
                      आपका संदेश सफलतापूर्वक दर्ज कर लिया गया है!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      धन्यवाद {formData.name} जी। विद्यालय कार्यालय दल शीघ्र आपसे संपर्क करेगा।
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href={getWhatsAppMessageUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>व्हाट्सएप पर भी तुरंत भेजें</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({ name: '', phone: '', category: 'parent', message: '' });
                      }}
                      className="px-4 py-2.5 bg-white text-stone-700 hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-medium transition cursor-pointer"
                    >
                      नया संदेश दर्ज करें
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        आपका नाम <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="उदा. राजेश कुमार"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        मोबाइल / व्हाट्सएप नंबर <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="उदा. 98XXXXXXXX"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      आपकी श्रेणी
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'parent', label: 'अभिभावक' },
                        { id: 'new_school', label: 'अन्य विद्यालय' },
                        { id: 'alumni_general', label: 'पूर्व छात्र / सामान्य' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: item.id })}
                          className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition cursor-pointer ${
                            formData.category === item.id
                              ? 'bg-orange-600 text-white border-orange-600 font-bold shadow-2xs'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      संदेश या प्रश्न
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="अपने प्रश्न अथवा आवश्यकता का संक्षिप्त विवरण लिखें..."
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>संदेश भेजें (Submit Inquiry)</span>
                    </button>

                    <a
                      href={getWhatsAppMessageUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                      title="सीधे व्हाट्सएप पर भेजें"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>व्हाट्सएप पर भेजें</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
