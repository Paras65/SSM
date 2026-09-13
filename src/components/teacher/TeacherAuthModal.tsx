import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import { X, Lock, Phone, GraduationCap, AlertCircle } from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (teacher: any) => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentSchool, schools, setCurrentSchoolId } = useSchool();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.loginTeacher(currentSchool.id, phone, pin);
      onSuccess(res.teacher);
    } catch (err: any) {
      setError(err.message || 'लॉगिन विफल रहा। कृपया मोबाइल नंबर और पिन जांचें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-orange-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center text-2xl shadow-xs border border-orange-200 mb-3">
            <GraduationCap className="w-8 h-8 text-orange-700" />
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            आचार्य / दीदी लॉगिन
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            सरस्वती शिशु मंदिर शिक्षक एवं कक्षा प्रबंधन पोर्टल
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">
              विद्यालय शाखा (Branch)
            </label>
            <select
              value={currentSchool.id}
              onChange={(e) => setCurrentSchoolId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.hindiName} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-700">
                पंजीकृत मोबाइल नंबर (Registered Mobile)
              </label>
              <HelpTooltip
                title="आचार्य मोबाइल नंबर"
                content="विद्यालय रिकॉर्ड में पंजीकृत 10 अंकों का मोबाइल नंबर दर्ज करें।"
              />
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="उदा. 9876543210"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-stone-700">
                सुरक्षा पिन (4-Digit PIN)
              </label>
              <HelpTooltip
                title="आचार्य सुरक्षा पिन"
                content="विद्यालय द्वारा निर्धारित 4-अंकीय पिन दर्ज करें। डिफ़ॉल्ट पिन '1234' है। यदि आप पिन भूल गए हैं, तो अपने विद्यालय व्यवस्थापक से संपर्क करें।"
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="उदा. 1234"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <span className="block text-[10px] text-stone-400 mt-1">
              (डिफ़ॉल्ट पिन: 1234 - यदि पिन भूल गए हों तो व्यवस्थापक से संपर्क करें)
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? 'सत्यापन हो रहा है...' : 'शिक्षक पोर्टल में प्रवेश करें'}
          </button>
        </form>
      </div>
    </div>
  );
};

