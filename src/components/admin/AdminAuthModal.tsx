import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import { Lock, KeyRound, X, Sparkles, ShieldCheck, ArrowRight, Loader2, Building2, Crown, Gift } from 'lucide-react';
import { SchoolPlansModal } from '../public/SchoolPlansModal';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenSignUp?: (plan?: 'free' | 'pro') => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess, onOpenSignUp }) => {
  const { currentSchool, schools, setCurrentSchoolId } = useSchool();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isDeveloperLogin, setIsDeveloperLogin] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('कृपया पासकोड दर्ज करें');
      return;
    }

    setIsAuthenticating(true);
    setError('');
    try {
      await api.loginAdmin(isDeveloperLogin ? '__developer__' : currentSchool.id, passcode.trim());
      setPasscode('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'अमान्य पासकोड! कृपया पुनः प्रयास करें।');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDemoUnlock = async () => {
    setError('सुरक्षित प्रवेश के लिए अपने विद्यालय का पासकोड दर्ज करें।');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border-2 border-orange-300 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-800 to-amber-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-yellow-300 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold">
            आचार्य एवं प्रशासकीय प्रवेश
          </h3>
          <p className="text-xs text-amber-200 mt-0.5">
            सरस्वती शिशु मंदिर ERP पटल सुरक्षा • {currentSchool.city}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleVerify} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium animate-in shake duration-150">
              {error}
            </div>
          )}

          <div>
            {!isDeveloperLogin && (
              <>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  विद्यालय शाखा चुनें (Select School Branch)
                </label>
                <div className="relative">
                  <select
                    value={currentSchool.id}
                    onChange={(e) => setCurrentSchoolId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer truncate"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.hindiName || s.name} ({s.city})
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-orange-600 absolute left-3 top-3 pointer-events-none" />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              प्रशासकीय सुरक्षा पासकोड (Admin Passcode)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                placeholder="पासकोड दर्ज करें..."
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-center tracking-widest text-lg font-bold"
              />
              <KeyRound className="w-5 h-5 text-stone-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1 text-center">
              {isDeveloperLogin ? 'सभी शाखाओं के डेवलपर प्रशासन के लिए कॉन्फ़िगर किया गया पासकोड दर्ज करें' : 'विद्यालय शाखा का पासकोड दर्ज करें'}
            </p>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>सत्यापित हो रहा है...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>सुरक्षित प्रवेश करें (Enter ERP)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsDeveloperLogin(!isDeveloperLogin);
              setPasscode('');
              setError('');
            }}
            className="w-full text-xs font-bold text-orange-700 hover:text-orange-900 hover:underline cursor-pointer"
          >
            {isDeveloperLogin ? 'शाखा व्यवस्थापक प्रवेश पर जाएं' : 'डेवलपर: सभी शाखाएं प्रबंधित करें'}
          </button>

          {/* Secure access hint */}
          <div className="pt-3 border-t border-stone-100 text-center space-y-2">
            <div className="w-full py-2 px-3 bg-amber-50 text-orange-950 rounded-xl text-xs font-bold border border-orange-200 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>सुरक्षित प्रवेश के लिए विद्यालय पासकोड का उपयोग करें</span>
            </div>

            {onOpenSignUp && (
              <div className="pt-2">
                <div className="p-3 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 rounded-2xl border border-amber-300 dark:border-amber-700/50 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-xs">
                      <Gift className="w-3 h-3 text-yellow-200" />
                      15-दिवसीय निःशुल्क ट्रायल
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      बिना किसी अग्रिम शुल्क
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-700 dark:text-stone-300 font-medium leading-tight">
                    क्या आप अन्य विद्यालय के प्रबंधक/प्रधानाचार्य हैं? 15 दिन अपने विद्यालय में निःशुल्क परीक्षण करें या ईआरपी योजनाएं देखें।
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSignUp('pro');
                      }}
                      className="flex-1 py-2 px-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>ट्रायल शुरू करें</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPlansModal(true)}
                      className="py-2 px-3 bg-white hover:bg-amber-50 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      title="ईआरपी योजनाएं व मूल्य देखें"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span>योजनाएं</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

      </div>

      {/* School ERP Plans & 15-Day Free Trial Modal */}
      <SchoolPlansModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        onSelectPlan={(plan) => {
          setShowPlansModal(false);
          onClose();
          onOpenSignUp?.(plan);
        }}
      />
    </div>,
    document.body
  );
};
