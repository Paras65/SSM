import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../../context/SchoolContext';
import type { School } from '../../types';
import {
  Building2,
  Plus,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Award,
  Search,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Crown,
  Gift,
  MessageSquare,
  Download,
  Printer
} from 'lucide-react';
import { generateSchoolOnboardingWhatsAppUrl } from '../../utils/whatsapp';
import { downloadStudentCsvTemplate } from '../../utils/csvExport';

interface SchoolManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'list' | 'add';
  initialPlan?: 'free' | 'pro';
}

const PRANT_STATE_MAP: Record<string, string> = {
  'गोरक्ष प्रांत': 'उत्तर प्रदेश',
  'अवध प्रांत': 'उत्तर प्रदेश',
  'काशी प्रांत': 'उत्तर प्रदेश',
  'कानपुर प्रांत': 'उत्तर प्रदेश',
  'मेरठ प्रांत': 'उत्तर प्रदेश',
  'ब्रज प्रांत': 'उत्तर प्रदेश',
  'दिल्ली प्रांत': 'दिल्ली',
  'उत्तरांचल प्रांत': 'उत्तराखंड',
  'मालवा प्रांत': 'मध्य प्रदेश',
  'महाकोशल प्रांत': 'मध्य प्रदेश',
  'छत्तीसगढ़ प्रांत': 'छत्तीसगढ़',
  'बिहार प्रांत': 'बिहार',
  'राजस्थान प्रांत': 'राजस्थान'
};

export const SchoolManagementModal: React.FC<SchoolManagementModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'list',
  initialPlan = 'free'
}) => {
  const { schools, currentSchool, setCurrentSchoolId, registerSchool } = useSchool();
  const [activeTab, setActiveTab] = useState<'list' | 'add'>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');

  // New School Form State
  const [hindiName, setHindiName] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('उत्तर प्रदेश');
  const [prant, setPrant] = useState('गोरक्ष प्रांत');
  const [affiliationNo, setAffiliationNo] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('1952');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro'>(initialPlan);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSchool, setCreatedSchool] = useState<School | null>(null);

  // Sync state when modal opens or initialMode/initialPlan changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setPlan(initialPlan);
      setCreatedSchool(null);
    }
  }, [isOpen, initialMode, initialPlan]);

  // Sync state with prant automatically
  const handlePrantChange = (selectedPrant: string) => {
    setPrant(selectedPrant);
    if (PRANT_STATE_MAP[selectedPrant]) {
      setState(PRANT_STATE_MAP[selectedPrant]);
    }
  };

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hindiName.trim() || !city.trim() || !principalName.trim()) {
      alert('कृपया विद्यालय का नाम (हिंदी), नगर एवं प्रधानाचार्य का नाम अनिवार्य रूप से भरें।');
      return;
    }

    setIsSubmitting(true);
    try {
      // Clean fallback slug generation for email and affiliation
      const cleanCitySlug = city.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanNameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fallbackPrefix = cleanCitySlug || cleanNameSlug || `branch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      
      const newSchool = await registerSchool({
        name: name.trim() || hindiName.trim(),
        hindiName: hindiName.trim(),
        city: city.trim(),
        state: state.trim() || 'उत्तर प्रदेश',
        prant,
        affiliationNo: affiliationNo.trim() || `VB-${fallbackPrefix.slice(0, 3).toUpperCase()}-2026`,
        principalName: principalName.trim(),
        adminPasscode: adminPasscode.trim() || '1952',
        phone: phone.trim() || '+91 94150 00000',
        email: email.trim() || `${fallbackPrefix}@ssm.edu.in`,
        address: address.trim() || `${city}, ${state}`,
        tagline: 'सा विद्या या विमुक्तये',
        affiliate: 'सम्बद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान',
        established: new Date().getFullYear().toString(),
        timings: 'प्रातः 7:30 बजे से दोपहर 1:30 बजे तक (सोम-शनि)',
        plan
      });

      setCreatedSchool(newSchool);
      // Reset form
      setHindiName('');
      setName('');
      setCity('');
      setPrincipalName('');
      setAdminPasscode('1952');
      setPhone('');
      setEmail('');
      setAddress('');
      setPlan('free');
    } catch (err: any) {
      alert('त्रुटि: ' + (err.message || 'पंजीकरण विफल रहा'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSchools = schools.filter(s =>
    s.hindiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.prant.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl md:max-w-5xl lg:max-w-6xl w-full border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-700/80 border border-amber-300/50 flex items-center justify-center text-2xl shadow-sm shrink-0">
              🏫
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold text-amber-100 tracking-tight">
                  {initialMode === 'add'
                    ? 'नवीन विद्यालय शाखा पंजीकरण एवं 15-दिवसीय निःशुल्क ट्रायल'
                    : 'विद्या भारती विद्यालय एवं शाखा प्रबंधन'}
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-950/90 text-amber-200 border border-orange-700 font-mono font-semibold">
                  {initialMode === 'add' ? '15-Day Free Trial' : 'Multi-School ERP'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-orange-200 mt-1">
                {initialMode === 'add'
                  ? 'सरस्वती शिशु मंदिर ईआरपी प्रणाली में अपनी शाखा तुरंत जोड़ें और निःशुल्क परीक्षण शुरू करें'
                  : `वर्तमान सक्रिय शाखा: ${currentSchool.hindiName} (${currentSchool.city}, ${currentSchool.prant})`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-orange-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="बंद करें"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation - Only shown when managing branches in 'list' mode */}
        {initialMode !== 'add' && (
          <div className="bg-amber-50/90 border-b border-amber-200 px-6 sm:px-8 pt-3 flex items-center justify-between shrink-0">
            <div className="flex space-x-3 sm:space-x-4">
              <button
                onClick={() => {
                  setActiveTab('list');
                  setCreatedSchool(null);
                }}
                className={`pb-3.5 px-4 sm:px-5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'border-orange-600 text-orange-950'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-orange-700" />
                <span>पंजीकृत शाखाएं</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-200/80 text-orange-950 text-xs font-mono font-bold">
                  {schools.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('add');
                  setCreatedSchool(null);
                }}
                className={`pb-3.5 px-4 sm:px-5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'add'
                    ? 'border-orange-600 text-orange-950'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <Plus className="w-4 h-4 text-orange-600" />
                <span>+ नवीन शाखा पंजीकरण (Add Branch)</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 bg-stone-50/30">
          
          {/* ================= TAB 1: ADD BRANCH FORM ================= */}
          {activeTab === 'add' && (
            <div className="space-y-6">
              
              {/* Success Banner if newly created */}
              {createdSchool ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto border border-emerald-300">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 bg-emerald-200/80 text-emerald-900 rounded-full text-xs font-bold mb-1">
                      शाखा सफलतापूर्वक पंजीकृत एवं सक्रिय हुई!
                    </span>
                    <h3 className="text-xl font-bold text-stone-900">
                      {createdSchool.hindiName}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      {createdSchool.city}, {createdSchool.state} • {createdSchool.prant}
                    </p>
                    {createdSchool.plan === 'pro' ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-xs font-bold text-amber-900 mt-2">
                        <Gift className="w-3.5 h-3.5 text-amber-700" />
                        <span>🎁 15-दिवसीय प्रो ट्रायल सक्रिय (15-Day Free Trial Active)</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full text-xs font-bold text-emerald-900 mt-2">
                        <span>निःशुल्क आजीवन सेवा सक्रिय (Free Tier Active)</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left bg-white p-4 rounded-xl border border-emerald-200 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">प्रधानाचार्य</span>
                      <strong className="text-stone-800">{createdSchool.principalName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">एडमिन पासकोड</span>
                      <strong className="text-stone-800 font-mono">{createdSchool.adminPasscode}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">संबद्धता क्रमांक</span>
                      <strong className="text-stone-800 font-mono">{createdSchool.affiliationNo}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center pt-3">
                    <button
                      onClick={() => {
                        setCurrentSchoolId(createdSchool.id);
                        onClose();
                      }}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>इस शाखा का ERP नियंत्रण पटल खोलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {generateSchoolOnboardingWhatsAppUrl(
                      createdSchool.phone,
                      createdSchool.hindiName,
                      createdSchool.city,
                      createdSchool.principalName,
                      createdSchool.adminPasscode,
                      createdSchool.affiliationNo,
                      createdSchool.plan === 'pro'
                    ) && (
                      <a
                        href={generateSchoolOnboardingWhatsAppUrl(
                          createdSchool.phone,
                          createdSchool.hindiName,
                          createdSchool.city,
                          createdSchool.principalName,
                          createdSchool.adminPasscode,
                          createdSchool.affiliationNo,
                          createdSchool.plan === 'pro'
                        )!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        title="प्रधानाचार्य के व्हाट्सएप नंबर पर तुरंत लॉगिन विवरण व पासकोड भेजें"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-100" />
                        <span>प्रधानाचार्य के WhatsApp पर विवरण भेजें</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={downloadStudentCsvTemplate}
                      className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold transition border border-amber-300 flex items-center gap-1.5 cursor-pointer"
                      title="छात्रों की सूची 1-क्लिक में तैयार करने हेतु आधिकारिक एक्सेल प्रारूप डाउनलोड करें"
                    >
                      <Download className="w-4 h-4 text-amber-800" />
                      <span>छात्र सूची प्रारूप (Excel/CSV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition border border-stone-300 flex items-center gap-1.5 cursor-pointer"
                      title="पंजीकरण पर्ची प्रिंट अथवा पीडीएफ सेव करें"
                    >
                      <Printer className="w-4 h-4 text-stone-600" />
                      <span>पंजीकरण रसीद प्रिंट करें</span>
                    </button>

                    {initialMode !== 'add' ? (
                      <button
                        onClick={() => {
                          setCreatedSchool(null);
                          setActiveTab('list');
                        }}
                        className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition border border-stone-200 cursor-pointer"
                      >
                        सभी शाखाएं देखें
                      </button>
                    ) : (
                      <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition border border-stone-200 cursor-pointer"
                      >
                        बंद करें
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                  
                  {/* 15-Day Free Pilot Trial Banner */}
                  <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border border-amber-400 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-yellow-200 shrink-0 shadow-xs">
                        <Gift className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm sm:text-base text-yellow-100">
                            🎁 विशेष पेशकश: 15-दिवसीय पूर्ण निःशुल्क ट्रायल (15-Day Free Pilot Trial)
                          </span>
                          <span className="bg-emerald-800 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                            0 अग्रिम शुल्क • 0 जोखिम
                          </span>
                        </div>
                        <p className="text-xs text-white/95 mt-1 leading-relaxed">
                          पंजीकरण करते ही आपकी शाखा का स्वायत्त डेटाबेस तुरंत सक्रिय हो जाएगा। पहले 15 दिन सभी सुविधाओं का पूर्ण निःशुल्क अनुभव लें।
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Basic School Info */}
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-4.5 h-4.5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-stone-900">
                          1. विद्यालय प्राथमिक विवरण (Basic Information)
                        </h4>
                        <p className="text-xs text-stone-500">विद्यालय का आधिकारिक नाम, नगर, प्रांत एवं राज्य विवरण</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      <div className="lg:col-span-2">
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          विद्यालय का नाम (हिंदी में) <span className="text-red-600 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. सरस्वती शिशु मंदिर, माधव नगर"
                          value={hindiName}
                          onChange={e => setHindiName(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                        />
                      </div>

                      <div className="lg:col-span-1">
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          School Name (English)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Saraswati Shishu Mandir, Madhav Nagar"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          नगर / शहर (City) <span className="text-red-600 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. लखनऊ, रायपुर, अयोध्या, वाराणसी"
                          value={city}
                          onChange={e => setCity(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          विद्या भारती प्रांत (Prant) <span className="text-red-600 font-bold">*</span>
                        </label>
                        <select
                          value={prant}
                          onChange={e => handlePrantChange(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-semibold focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs cursor-pointer"
                        >
                          <option value="गोरक्ष प्रांत">गोरक्ष प्रांत</option>
                          <option value="अवध प्रांत">अवध प्रांत</option>
                          <option value="काशी प्रांत">काशी प्रांत</option>
                          <option value="कानपुर प्रांत">कानपुर प्रांत</option>
                          <option value="मेरठ प्रांत">मेरठ प्रांत</option>
                          <option value="ब्रज प्रांत">ब्रज प्रांत</option>
                          <option value="दिल्ली प्रांत">दिल्ली प्रांत</option>
                          <option value="उत्तरांचल प्रांत">उत्तरांचल प्रांत</option>
                          <option value="मालवा प्रांत">मालवा प्रांत</option>
                          <option value="महाकोशल प्रांत">महाकोशल प्रांत</option>
                          <option value="छत्तीसगढ़ प्रांत">छत्तीसगढ़ प्रांत</option>
                          <option value="बिहार प्रांत">बिहार प्रांत</option>
                          <option value="राजस्थान प्रांत">राजस्थान प्रांत</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          राज्य (State) <span className="text-red-600 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. उत्तर प्रदेश, दिल्ली, बिहार, मध्य प्रदेश"
                          value={state}
                          onChange={e => setState(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                        />
                      </div>

                      <div className="lg:col-span-3">
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          संबद्धता क्रमांक (Affiliation No.)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. VB-UP-2026-088 (रिक्त छोड़ने पर स्वतः जनरेट होगा)"
                          value={affiliationNo}
                          onChange={e => setAffiliationNo(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-mono focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Administration & Security */}
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4.5 h-4.5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-stone-900">
                          2. प्रशासन एवं सुरक्षा नियंत्रण (Administration & Security)
                        </h4>
                        <p className="text-xs text-stone-500">प्रधानाचार्य का नाम एवं शाखा एडमिन सुरक्षा पासकोड</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          प्रधानाचार्य का नाम (Principal) <span className="text-red-600 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="उदा. आचार्य सतीश चंद्र गुप्त"
                          value={principalName}
                          onChange={e => setPrincipalName(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          शाखा सुरक्षा पासकोड (Admin Passcode)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="डैशबोर्ड लॉगिन हेतु (उदा. 1952)"
                            value={adminPasscode}
                            onChange={e => setAdminPasscode(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-mono font-bold focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs"
                          />
                          <KeyRound className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <span className="text-xs text-stone-500 mt-1.5 block">
                          डिफ़ॉल्ट पासकोड 1952 है। इसे बाद में भी बदला जा सकता है।
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Contact Details */}
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Phone className="w-4.5 h-4.5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-stone-900">
                          3. संपर्क एवं आधिकारिक पता (Contact & Address)
                        </h4>
                        <p className="text-xs text-stone-500">विद्यालय का दूरभाष, आधिकारिक ईमेल एवं परिसर का पूरा पता</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          संपर्क दूरभाष (Phone Number)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. +91 94150 12345"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          शाखा ईमेल (Official Email)
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="उदा. lucknow@ssm.edu.in"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                          />
                          <Mail className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block font-semibold text-stone-700 mb-1.5 text-xs sm:text-sm">
                          विद्यालय का संपूर्ण पता (Complete Address)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="उदा. विद्या भारती परिसर, माधव नगर, लखनऊ - 226001"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl border border-stone-300 bg-stone-50/40 hover:bg-white focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs placeholder:text-stone-400"
                          />
                          <MapPin className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Plan Selection */}
                  <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-stone-200">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Crown className="w-4.5 h-4.5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-stone-900">
                          4. सुविधा-आधारित ईआरपी मॉडल (Feature-Based ERP Plans)
                        </h4>
                        <p className="text-xs text-stone-500">विद्यालय की आवश्यकतानुसार बुनियादी निःशुल्क सेवा अथवा उन्नत प्रो सुविधाओं का चयन करें</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Free Plan Card */}
                      <div
                        onClick={() => setPlan('free')}
                        className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          plan === 'free'
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-3 ring-emerald-500/15'
                            : 'border-stone-200 bg-stone-50/40 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                              निःशुल्क सेवा (Free Seva Tier)
                            </span>
                            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                              ₹0 / आजीवन
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed mb-3">
                            दैनिक छात्र उपस्थिति, प्रवेश पंजिका, शुल्क रसीदें, गृहकार्य डायरी एवं परिपत्र सूचनाएं।
                          </p>
                        </div>
                        <div className="flex items-center text-xs font-bold text-emerald-700 gap-1.5 pt-2 border-t border-emerald-200/60">
                          {plan === 'free' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-stone-300" />}
                          <span>{plan === 'free' ? 'वर्तमान में चयनित' : 'निःशुल्क सेवा चुनें'}</span>
                        </div>
                      </div>

                      {/* Pro Plan Card */}
                      <div
                        onClick={() => setPlan('pro')}
                        className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                          plan === 'pro'
                            ? 'border-amber-500 bg-amber-50/70 shadow-md ring-3 ring-amber-500/15'
                            : 'border-stone-200 bg-stone-50/40 hover:border-amber-300'
                        }`}
                      >
                        {/* 15-Day Free Trial Corner Badge */}
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-600 to-amber-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                          <Gift className="w-3 h-3 text-yellow-200" />
                          <span>15-दिवसीय निःशुल्क ट्रायल</span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2 pr-28">
                            <span className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                              <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
                              उन्नत प्रो सुविधाएं (Pro Features AMC)
                            </span>
                          </div>

                          <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-2.5 mb-3">
                            <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                              <Gift className="w-3.5 h-3.5 text-orange-700" />
                              <span>पहले 15 दिन ₹0 (पूर्णतः निःशुल्क ट्रायल)</span>
                            </span>
                            <p className="text-[11px] text-amber-900 mt-0.5 font-medium leading-tight">
                              कोई अग्रिम शुल्क नहीं। 15-दिवसीय परीक्षण उपरांत Academic: ₹3,999/वर्ष अथवा Smart ERP: ₹7,999/वर्ष।
                            </p>
                          </div>

                          <p className="text-xs text-stone-600 leading-relaxed mb-3">
                            NEP 360° समग्र प्रगति पत्र, डिजिटल आईडी कार्ड, आचार्य पेरोल, व्हाट्सएप सूचनाएं व स्वचालित बैकअप।
                          </p>
                        </div>
                        <div className="flex items-center text-xs font-bold text-amber-800 gap-1.5 pt-2 border-t border-amber-200/60">
                          {plan === 'pro' ? <CheckCircle2 className="w-4 h-4 text-amber-600" /> : <div className="w-4 h-4 rounded-full border border-stone-300" />}
                          <span>{plan === 'pro' ? 'वर्तमान में चयनित (15-दिन ट्रायल)' : 'प्रो 15-दिवसीय ट्रायल चुनें'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Row */}
                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        if (initialMode === 'add') {
                          onClose();
                        } else {
                          setActiveTab('list');
                        }
                      }}
                      className="px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm sm:text-base font-semibold transition border border-stone-300 cursor-pointer"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-sm sm:text-base font-bold shadow-lg hover:shadow-orange-600/25 transition flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
                    >
                      {plan === 'pro' ? <Gift className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      <span>
                        {isSubmitting
                          ? 'पंजीकरण प्रगति पर है...'
                          : plan === 'pro'
                            ? '15-दिवसीय निःशुल्क ट्रायल के साथ शाखा पंजीकृत करें'
                            : 'शाखा पंजीकृत करें (निःशुल्क सेवा)'}
                      </span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* ================= TAB 2: REGISTERED SCHOOLS LIST ================= */}
          {activeTab === 'list' && (
            <div className="space-y-6">
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
                <div className="relative w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="शाखा, नगर या प्रांत खोजें..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 focus:outline-none focus:ring-3 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs font-medium placeholder:text-stone-400"
                  />
                  <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="text-xs sm:text-sm text-stone-600 w-full sm:w-auto text-right font-medium">
                  दिखाए जा रहे हैं: <strong className="text-stone-900 text-sm sm:text-base">{filteredSchools.length}</strong> / {schools.length} विद्यालय
                </div>
              </div>

              {/* Grid of School Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSchools.map(sch => {
                  const isActive = sch.id === currentSchool.id;
                  return (
                    <div
                      key={sch.id}
                      className={`p-5 sm:p-6 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isActive
                          ? 'border-orange-500 bg-gradient-to-b from-orange-50/80 to-white shadow-md ring-3 ring-orange-500/15'
                          : 'border-stone-200 bg-white hover:border-orange-300 hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-orange-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                              🪷
                            </div>
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300">
                                {sch.prant}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(sch.plan === 'pro' || (sch.id === 'ssm-gorakhpur' && !sch.plan)) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold shadow-2xs">
                                <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                                <span>तकनीकी सहयोग (Tech Support)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-semibold shadow-2xs">
                                <span>निःशुल्क सेवा (Free Seva)</span>
                              </span>
                            )}

                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-300 shadow-2xs">
                                <Check className="w-3.5 h-3.5 text-green-700" />
                                <span>सक्रिय शाखा</span>
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <h4 className="text-base sm:text-lg font-bold text-stone-900 mt-1 leading-snug">
                          {sch.hindiName}
                        </h4>
                        <p className="text-xs sm:text-sm text-stone-500 font-mono mt-0.5 truncate">
                          {sch.name}
                        </p>

                        <div className="mt-4 space-y-2 text-xs sm:text-sm text-stone-600">
                          <div className="flex items-center gap-2" title={sch.address}>
                            <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                            <span className="truncate">{sch.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>प्रधानाचार्य: <strong className="text-stone-800">{sch.principalName}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{sch.phone}</span>
                            </span>
                            <span className="text-stone-300">•</span>
                            <span className="font-mono text-stone-500 text-xs">{sch.affiliationNo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-xs font-mono text-stone-500">
                          सम्बद्धता: <strong className="text-stone-800 font-mono">{sch.affiliationNo || 'सत्यापित'}</strong>
                        </span>

                        {isActive ? (
                          <span className="text-xs sm:text-sm font-bold text-green-700 flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-green-700" />
                            <span>वर्तमान चयनित</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setCurrentSchoolId(sch.id);
                              onClose();
                            }}
                            className="px-4 py-2 bg-stone-900 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>इस शाखा में स्विच करें</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSchools.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
                  खोज के अनुरूप कोई विद्यालय शाखा नहीं मिली।
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
};
