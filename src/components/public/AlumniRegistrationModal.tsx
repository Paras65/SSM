import React, { useState } from 'react';
import { X, GraduationCap, CheckCircle2, Heart, Award, Send } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';

export interface AlumniRecord {
  id: string;
  name: string;
  batch: string;
  schoolBranch: string;
  qualification: string;
  profession: string;
  organisation: string;
  city: string;
  phone: string;
  email: string;
  contributionType: string;
  message: string;
  registeredAt: string;
}

interface AlumniRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AlumniRegistrationModal: React.FC<AlumniRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { publicSchool } = useSchool();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    batch: '2016',
    schoolBranch: publicSchool.city || 'गोरखपुर',
    qualification: '',
    profession: '',
    organisation: '',
    city: '',
    phone: '',
    email: '',
    contributionType: 'करियर मार्गदर्शन (Career Mentorship)',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alumniId, setAlumniId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      showError('कृपया पूरा नाम एवं संपर्क नंबर अनिवार्य रूप से भरें।');
      return;
    }

    const newId = `VB-ALUMNI-${Date.now().toString().slice(-6)}`;
    const newRecord: AlumniRecord = {
      ...formData,
      id: newId,
      registeredAt: new Date().toISOString()
    };

    try {
      const existingStr = localStorage.getItem('ssm_alumni_list') || '[]';
      const existingList: AlumniRecord[] = JSON.parse(existingStr);
      existingList.unshift(newRecord);
      localStorage.setItem('ssm_alumni_list', JSON.stringify(existingList));
    } catch {
      // localStorage fallback
    }

    setAlumniId(newId);
    setIsSubmitted(true);
    showSuccess('पूर्व छात्र परिषद में आपका पंजीकरण सफलतापूर्वक संपन्न हुआ!');
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-orange-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl">
              🎓
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-100 tracking-tight">
                पूर्व छात्र परिषद पंजीकरण (Alumni Registration)
              </h3>
              <p className="text-xs text-amber-100/90">
                विद्या भारती पुरातन छात्र परिषद • राष्ट्र निर्माण में सहभागिता
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-black text-stone-900">
                अभिनंदन, भैया/बहिन!
              </h4>
              <p className="text-sm text-stone-600 max-w-md mx-auto">
                विद्या भारती पूर्व छात्र परिषद में आपका पंजीकरण स्वीकार कर लिया गया है। आपकी पूर्व छात्र सदस्यता संख्या है:
              </p>
              <div className="inline-block px-5 py-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-orange-950 font-mono font-black text-base tracking-wider shadow-xs">
                {alumniId}
              </div>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                आपके विचार, अनुभव और मार्गदर्शन वर्तमान शिशु मंदिर के छात्र-छात्राओं के लिए अत्यंत प्रेरणादायी सिद्ध होंगे।
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  पूर्ण हुआ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50/70 border border-orange-200 rounded-2xl p-3.5 text-xs text-orange-950 leading-relaxed">
                🌟 सरस्वती शिशु मंदिर के संस्कार हमारे जीवन की अमूल्य धरोहर हैं। अपने विद्यालय परिवार से पुनः जुड़कर नई पीढ़ी को मार्गदर्शन दें।
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">पूरा नाम (Full Name) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="उदा. डॉ. विवेक कुमार शर्मा"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">उत्तीर्ण सत्र/वर्ष (Passing Batch) *</label>
                  <input
                    type="number"
                    min="1952"
                    max="2026"
                    required
                    value={formData.batch}
                    onChange={e => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">उच्चतम शिक्षा (Degree/Qualification)</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="उदा. B.Tech / MBBS / MBA / M.Sc / CA"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">वर्तमान पद / व्यवसाय (Profession)</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={e => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="उदा. सॉफ़्टवेयर इंजीनियर / चिकित्सक / सिविल सेवा"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">कार्यरत संस्था / कंपनी (Organisation)</label>
                  <input
                    type="text"
                    value={formData.organisation}
                    onChange={e => setFormData({ ...formData, organisation: e.target.value })}
                    placeholder="उदा. TCS / AIIMS / Govt. of India"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">वर्तमान नगर व राज्य (City/State)</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="उदा. नई दिल्ली, भारत"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">मोबाइल / व्हाट्सएप नंबर *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">ईमेल पता (Email)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alumni@example.com"
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1 text-xs">
                  विद्यालय एवं छात्र-छात्राओं हेतु सहयोग का प्रकार:
                </label>
                <select
                  value={formData.contributionType}
                  onChange={e => setFormData({ ...formData, contributionType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="करियर मार्गदर्शन (Career Mentorship)">करियर मार्गदर्शन (Career Mentorship)</option>
                  <option value="अतिथि व्याख्यान (Guest Lecture)">अतिथि व्याख्यान (Guest Lecture)</option>
                  <option value="मेधावी छात्रवृत्ति सहयोग (Student Scholarship)">मेधावी छात्रवृत्ति सहयोग (Student Scholarship)</option>
                  <option value="पुस्तकालय एवं वाचनालय सहयोग (Book Donation)">पुस्तकालय एवं वाचनालय सहयोग (Book Donation)</option>
                  <option value="खेलकूद एवं विज्ञान प्रयोगशाला सहयोग (Sports & Lab Support)">खेलकूद एवं विज्ञान प्रयोगशाला सहयोग (Sports & Lab Support)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1 text-xs">
                  शिशु मंदिर के भैया-बहिनों हेतु संदेश अथवा स्मृतियां:
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="अपने विद्यालय के दिनों की कोई प्रेरक स्मृति या संदेश..."
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>पंजीकरण सबमिट करें</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

