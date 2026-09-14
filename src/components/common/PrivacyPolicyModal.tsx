import React, { useState } from 'react';
import { X, ShieldCheck, Lock, FileText, UserCheck, Mail, CheckCircle2, AlertTriangle, EyeOff } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [activeLang, setActiveLang] = useState<'hi' | 'en'>('hi');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-orange-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <ShieldCheck className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">
                {activeLang === 'hi' ? 'डेटा गोपनीयता एवं छात्र सुरक्षा नीति' : 'Data Privacy & Student Protection Policy'}
              </h3>
              <p className="text-xs text-orange-100 flex items-center gap-1.5 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-yellow-300" />
                <span>डेटा सुरक्षा एवं गोपनीयता नीति</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex bg-orange-950/40 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveLang('hi')}
                className={`px-2.5 py-1 rounded-md transition ${activeLang === 'hi' ? 'bg-white text-orange-800 shadow-xs' : 'text-orange-100 hover:text-white'}`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('en')}
                className={`px-2.5 py-1 rounded-md transition ${activeLang === 'en' ? 'bg-white text-orange-800 shadow-xs' : 'text-orange-100 hover:text-white'}`}
              >
                English
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
          {activeLang === 'hi' ? (
            <>
              {/* Hindi Content */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-normal font-medium">
                  सरस्वती शिशु मंदिर (SSM) ईआरपी प्रणाली भारत सरकार के <strong>डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDP Act 2023)</strong> के सभी वैधानिक प्रावधानों का पूर्णतः पालन करती है।
                </p>
              </div>

              {/* Section 1: Legal Roles */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-xs">१</span>
                  वैधानिक भूमिकाएं (Legal Roles)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
                  <li><strong>डेटा न्यासी (Data Fiduciary):</strong> संबंधित सरस्वती शिशु मंदिर विद्यालय प्रबंध समिति एवं विद्या भारती।</li>
                  <li><strong>डेटा संसाधक (Data Processor & Host):</strong> <code className="bg-stone-100 px-1 py-0.5 rounded text-orange-800">init65.co.in</code> (क्लाउड अवसंरचना एवं सॉफ्टवेयर प्रदाता)।</li>
                  <li><strong>डेटा स्वामी (Data Principal):</strong> विद्यार्थी एवं उनके अधिकृत माता-पिता / संरक्षक।</li>
                </ul>
              </div>

              {/* Section 2: Minor Data Protection */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-xs">२</span>
                  नाबालिग बच्चों के डेटा का संरक्षण (धारा 9 - Section 9)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 text-xs">सत्यापनीय अभिभावकीय सहमति</strong>
                      <span className="text-[11px] text-stone-500">बिना माता-पिता/संरक्षक की स्पष्ट सहमति के किसी भी बच्चे का डेटा एकत्र नहीं किया जाता।</span>
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                    <EyeOff className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 text-xs">कोई ट्रैकिंग या प्रोफाइलिंग नहीं</strong>
                      <span className="text-[11px] text-stone-500">बच्चों के व्यवहार की निगरानी, ट्रैकिंग या कमर्शियल प्रोफाइलिंग पूर्णतः प्रतिबंधित है।</span>
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 text-xs">100% विज्ञापन-मुक्त (No Ads)</strong>
                      <span className="text-[11px] text-stone-500">छात्रों या अभिभावकों को कभी भी लक्षित विज्ञापन (Targeted Commercial Ads) नहीं दिखाए जाते।</span>
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 text-xs">डेटा का दुरुपयोग नहीं</strong>
                      <span className="text-[11px] text-stone-500">डेटा कभी किसी तृतीय-पक्ष (Third Party) को विपणन हेतु बेचा या साझा नहीं किया जाता।</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Purpose of Collection */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-xs">३</span>
                  डेटा संकलन के उद्देश्य (Purpose Limitation)
                </h4>
                <p className="text-stone-600 mb-1.5">
                  एकत्रित किया गया डेटा केवल निम्नलिखित वैध शैक्षणिक व प्रशासनिक कार्यों के लिए उपयोग किया जाता है:
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
                  <li>छात्र प्रवेश पंजीकरण, दैनिक कक्षा उपस्थिति व अनुपस्थिति SMS/अलर्ट।</li>
                  <li>परीक्षा मूल्यांकन, प्रगति पत्र (Report Card) एवं बोर्ड पंजीकरण।</li>
                  <li>पारदर्शी शुल्क प्रबंधन, रसीद निर्गमन एवं छात्रवृत्ति सत्यापन।</li>
                  <li>आपातकालीन स्थिति में माता-पिता/अभिभावक से त्वरित संपर्क।</li>
                </ul>
              </div>

              {/* Section 4: Parental Rights */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-xs">४</span>
                  अभिभावकों के कानूनी अधिकार (Rights of Parents)
                </h4>
                <p className="text-stone-600 mb-1.5">
                  DPDP Act 2023 के तहत अभिभावक अपने बच्चे के डेटा के संबंध में निम्नलिखित अधिकारों का प्रयोग कर सकते हैं:
                </p>
                <div className="space-y-1.5 pl-2 text-stone-600">
                  <p>• <strong>सूचना का अधिकार:</strong> छात्र पोर्टल के माध्यम से बच्चे के समस्त रिकॉर्ड का अवलोकन।</p>
                  <p>• <strong>सुधार का अधिकार:</strong> अमान्य या पुराने संपर्क/पते में संशोधन का अनुरोध।</p>
                  <p>• <strong>स्थानांतरण (TC) उपरांत डेटा अनामीकरण:</strong> विद्यालय छोड़ने के पश्चात व्यक्तिगत संपर्क व पते को अनामीकृत (Anonymize/Mask) कराने का अधिकार।</p>
                </div>
              </div>

              {/* Section 5: Grievance Officer */}
              <div className="bg-stone-900 text-stone-200 rounded-xl p-4 space-y-2 border border-stone-800">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  डेटा संरक्षण एवं शिकायत निवारण अधिकारी (Data Grievance Officer)
                </h4>
                <p className="text-xs text-stone-300">
                  डेटा सुरक्षा, गोपनीयता अथवा किसी भी आपत्ति के निवारण हेतु अभिभावक सीधे हमारे डेटा संरक्षण अधिकारी से संपर्क कर सकते हैं:
                </p>
                <div className="text-xs space-y-1 font-mono text-amber-200 bg-stone-950 p-3 rounded-lg border border-stone-800">
                  <p>पद: मुख्य डेटा संरक्षण एवं शिकायत निवारण अधिकारी (CPO)</p>
                  <p>ईमेल: <a href="mailto:support@init65.co.in" className="text-orange-400 underline font-bold">support@init65.co.in</a></p>
                  <p>निवारण समय सीमा: अधिकतम 30 कार्यदिवस (Statutory 30 Days)</p>
                  <p>सॉफ्टवेयर अवसंरचना प्रदाता: init65.co.in</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* English Content */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-normal font-medium">
                  Saraswati Shishu Mandir (SSM) ERP strictly adheres to the legal mandates of India’s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act 2023)</strong>.
                </p>
              </div>

              {/* Section 1: Legal Roles */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-xs">1</span>
                  Legal Roles & Entities
                </h4>
                <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
                  <li><strong>Data Fiduciary:</strong> Respective School Management Committee (SSM) & Vidya Bharati.</li>
                  <li><strong>Data Processor & Host:</strong> <code className="bg-stone-100 px-1 py-0.5 rounded text-orange-800">init65.co.in</code> (Cloud & Software Infrastructure).</li>
                  <li><strong>Data Principal:</strong> Enrolled students and their parents / legal guardians.</li>
                </ul>
              </div>

              {/* Section 2: Minor Data Protection */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-xs">2</span>
                  Protection of Children’s Personal Data (Section 9)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 text-xs">Verifiable Parental Consent</strong>
                      <span className="text-[11px] text-stone-500">No child's data is processed without explicit, informed parental consent and timestamped digital audit trail.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                    <EyeOff className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 text-xs">No Behavioral Tracking</strong>
                      <span className="text-[11px] text-stone-500">Tracking, behavioral monitoring, or profiling of children is strictly prohibited and technically absent.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 text-xs">100% Ad-Free Platform</strong>
                      <span className="text-[11px] text-stone-500">Targeted commercial advertising to students or guardians is completely disallowed.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-stone-900 text-xs">No Detrimental Processing</strong>
                      <span className="text-[11px] text-stone-500">Data is never monetized, sold, or shared with commercial marketing entities.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Purpose of Collection */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-xs">3</span>
                  Purpose of Collection (Purpose Limitation)
                </h4>
                <p className="text-stone-600 mb-1.5">
                  Personal data collected is utilized solely for lawful institutional and academic administration:
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-600 pl-2">
                  <li>Admission enrolment, daily attendance logging, and absence communication.</li>
                  <li>Academic examination grading, report card generation, and board registration.</li>
                  <li>Fee reconciliation, transparent receipts, and scholarship compliance.</li>
                  <li>Emergency parental contact and communication.</li>
                </ul>
              </div>

              {/* Section 4: Parental Rights */}
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center justify-center text-xs">4</span>
                  Rights of Parents & Guardians (Data Principals)
                </h4>
                <div className="space-y-1.5 pl-2 text-stone-600">
                  <p>• <strong>Right to Information:</strong> Access complete academic and fee records via the student portal.</p>
                  <p>• <strong>Right to Correction:</strong> Request updates to outdated or incorrect demographic information.</p>
                  <p>• <strong>Right to Erasure / Anonymization:</strong> Upon issuance of Transfer Certificate (TC), request masking/anonymization of personal contact numbers and residential addresses.</p>
                </div>
              </div>

              {/* Section 5: Grievance Officer */}
              <div className="bg-stone-900 text-stone-200 rounded-xl p-4 space-y-2 border border-stone-800">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  Data Grievance Redressal Officer (DPDP Act 2023)
                </h4>
                <p className="text-xs text-stone-300">
                  For privacy inquiries, rights enforcement, or grievance redressal, parents may contact our designated Grievance Officer:
                </p>
                <div className="text-xs space-y-1 font-mono text-amber-200 bg-stone-950 p-3 rounded-lg border border-stone-800">
                  <p>Designation: Chief Data Protection & Grievance Officer (CPO)</p>
                  <p>Email: <a href="mailto:support@init65.co.in" className="text-orange-400 underline font-bold">support@init65.co.in</a></p>
                  <p>Statutory Redressal Period: Within 30 Business Days</p>
                  <p>Technology Partner: init65.co.in</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm"
          >
            {activeLang === 'hi' ? 'समझ गए (Understood & Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;

