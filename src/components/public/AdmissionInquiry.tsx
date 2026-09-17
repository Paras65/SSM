import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, UserPlus, FileText, Phone, Send, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useSchool } from '../../context/SchoolContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { PrivacyPolicyModal } from '../common/PrivacyPolicyModal';
import { SSM_CLASSES } from '../../types';

export const AdmissionInquiry: React.FC = () => {
  const { schools, publicSchool, currentSchool } = useSchool();
  const { t } = useLanguage();
  const { showWarning, showError, showSuccess } = useToast();
  const [selectedSchoolId, setSelectedSchoolId] = useState(publicSchool?.id || '');

  useEffect(() => {
    if (publicSchool?.id) {
      setSelectedSchoolId(publicSchool.id);
    }
  }, [publicSchool?.id]);

  const activeBranch = schools.find(s => s.id === selectedSchoolId) || currentSchool;
  const helpdeskPhone = activeBranch.phone || '+91 551 2345678';
  const helpdeskTimings = activeBranch.timings || 'प्रातः 8:00 से दोपहर 2:00 बजे तक';
  const [formData, setFormData] = useState({
    studentName: '',
    gender: 'Bhaiya',
    applyingClass: 'Class 1',
    fatherName: '',
    motherName: '',
    phone: '',
    address: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId) {
      showWarning(t('selectBranch'));
      setSubmitError(t('selectBranch'));
      return;
    }
    if (!formData.studentName || !formData.phone) {
      showWarning(t('enterRequiredDetails'));
      setSubmitError(t('enterRequiredDetails'));
      return;
    }
    if (!guardianConsent) {
      showWarning(t('consentRequired'));
      setSubmitError(t('consentRequired'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.submitAdmission({
        ...formData,
        schoolId: selectedSchoolId,
        guardianConsent: true,
        consentPolicyVersion: 'DPDP-2023-V1'
      });
      setInquiryId(res.regNo);
      setSubmitted(true);
      showSuccess('प्रवेश आवेदन सफलतापूर्वक जमा हो गया!');
    } catch {
      setSubmitError(t('applicationFailed'));
      showError(t('applicationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="admissions" className="py-16 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Information & Guidelines */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>सत्र 2026-27 प्रवेश प्रक्रिया</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              अपने बच्चे को दें <br />
              <span className="text-orange-700">उत्कृष्ट संस्कार व आधुनिक शिक्षा</span>
            </h2>

            <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
              सरस्वती शिशु मंदिर में प्रवेश केवल एक कक्षा में दाखिला नहीं, अपितु जीवन निर्माण की यात्रा का शुभारंभ है।
              शिशु वाटिका (अरुण, उदय, प्रभात) से लेकर कक्षा 10वीं तक प्रवेश प्रारंभ हैं।
            </p>

            {/* Steps & Requirements */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-white rounded-xl border border-orange-200 shadow-xs flex items-start gap-3">
                <FileText className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-xs text-stone-700">
                  <strong className="block text-stone-900 text-sm mb-0.5">आवश्यक दस्तावेज (Documents Required):</strong>
                  जन्म प्रमाण पत्र (Birth Certificate), आधार कार्ड, पूर्व कक्षा की अंकतालिका, 4 पासपोर्ट साइज फोटो।
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-orange-200 shadow-xs flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-xs text-stone-700">
                  <strong className="block text-stone-900 text-sm mb-0.5">प्रवेश सहायता प्रकोष्ठ (Helpdesk):</strong>
                  {helpdeskTimings} विद्यालय कार्यालय में संपर्क करें अथवा{' '}
                  <a
                    href={`tel:${helpdeskPhone.split('/')[0].trim()}`}
                    className="text-orange-700 font-bold hover:underline"
                  >
                    {helpdeskPhone}
                  </a>{' '}
                  पर कॉल करें।
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-300 shadow-xl">
              
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900">
                    प्रवेश आवेदन सफलतापूर्वक दर्ज हुआ!
                  </h3>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl inline-block text-left">
                    <p className="text-xs text-stone-600 uppercase tracking-wider font-bold">आवेदन संदर्भ संख्या (Reference No):</p>
                    <p className="text-xl font-mono font-black text-orange-700">{inquiryId}</p>
                    <p className="text-xs text-stone-700 mt-1">
                      छात्र: <strong>{formData.studentName}</strong> ({formData.gender}) • कक्षा: <strong>{formData.applyingClass}</strong>
                    </p>
                  </div>
                  <p className="text-xs text-stone-600 max-w-md mx-auto">
                    हमारे विद्यालय कार्यालय द्वारा दिए गए नंबर ({formData.phone}) पर शीघ्र संपर्क किया जाएगा। कृपया आवश्यक दस्तावेजों के साथ विद्यालय पधारें।
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        studentName: '',
                        gender: 'Bhaiya',
                        applyingClass: 'Class 1',
                        fatherName: '',
                        motherName: '',
                        phone: '',
                        address: '',
                      });
                      setGuardianConsent(false);
                      setSubmitError('');
                    }}
                    className="px-5 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    अन्य आवेदन भरें
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
                    <UserPlus className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-bold text-stone-900">
                      ऑनलाइन प्रवेश पूछताछ / पंजीकरण फॉर्म (2026-27)
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      प्रवेश हेतु विद्यालय शाखा चुनें *
                    </label>
                    <select
                      required
                      value={selectedSchoolId}
                      onChange={e => setSelectedSchoolId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      <option value="">शाखा चुनें...</option>
                      {schools.filter(school => school.id !== 'ssm-platform').map(school => (
                        <option key={school.id} value={school.id}>
                          {school.hindiName || school.name} ({school.city})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-stone-500 mt-1">
                      आवेदन सीधे चुनी गई शाखा को भेजा जाएगा।
                    </p>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Student Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        छात्र / छात्रा का पूरा नाम *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. आर्यन शर्मा"
                        value={formData.studentName}
                        onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Gender (Bhaiya / Bahin) */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        वर्ग (भैया / बहिन) *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: 'Bhaiya' })}
                          className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                            formData.gender === 'Bhaiya'
                              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-orange-50'
                          }`}
                        >
                          भैया (Boy)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: 'Bahin' })}
                          className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                            formData.gender === 'Bahin'
                              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                              : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-orange-50'
                          }`}
                        >
                          बहिन (Girl)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Applying Class */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        प्रवेश हेतु कक्षा *
                      </label>
                      <select
                        value={formData.applyingClass}
                        onChange={e => setFormData({ ...formData, applyingClass: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        {SSM_CLASSES.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        अभिभावक का मोबाइल नंबर *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Father's Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        पिता का नाम
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. श्री राजेश शर्मा"
                        value={formData.fatherName}
                        onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {/* Mother's Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        माता का नाम
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. श्रीमती सुनीता शर्मा"
                        value={formData.motherName}
                        onChange={e => setFormData({ ...formData, motherName: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      स्थानीय निवास का पता
                    </label>
                    <textarea
                      rows={2}
                      placeholder="वार्ड, मोहल्ला, नगर, पिनकोड..."
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  {/* DPDP Act 2023 Compliant Verifiable Consent Box */}
                  <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>अभिभावक डेटा सुरक्षा सहमति:</span>
                    </div>
                    <label className="flex items-start gap-2.5 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={guardianConsent}
                        onChange={event => setGuardianConsent(event.target.checked)}
                        className="mt-0.5 accent-orange-700 w-4 h-4 rounded"
                      />
                      <span className="leading-snug">
                        {t('guardianConsent')}{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="font-bold text-orange-700 hover:text-orange-900 underline inline-flex items-center gap-0.5"
                        >
                          {t('privacyNotice')}
                        </button>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'पंजीकरण हो रहा है (Saving to MongoDB)...' : 'प्रवेश आवेदन प्रेषित करें (Submit Admission Form)'}</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* DPDP Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </section>
  );
};

