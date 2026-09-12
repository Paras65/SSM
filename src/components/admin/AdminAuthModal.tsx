import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import { Lock, KeyRound, X, Sparkles, ShieldCheck, ArrowRight, Loader2, Building2 } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenSignUp?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess, onOpenSignUp }) => {
  const { currentSchool, schools, setCurrentSchoolId } = useSchool();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
      await api.loginAdmin(currentSchool.id, passcode.trim());
      setPasscode('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'अमान्य पासकोड! कृपया पुनः प्रयास करें।');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDemoUnlock = async () => {
    setIsAuthenticating(true);
    setError('');
    try {
      await api.loginAdmin(currentSchool.id, '1952');
      setPasscode('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'डेमो लॉगिन विफल रहा');
    } finally {
      setIsAuthenticating(false);
    }
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
              डिफ़ॉल्ट पासकोड: <strong>{currentSchool.adminPasscode || '1952'}</strong>
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

          {/* Quick Demo Assist */}
          <div className="pt-3 border-t border-stone-100 text-center space-y-2">
            <button
              type="button"
              onClick={handleDemoUnlock}
              disabled={isAuthenticating}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-orange-950 rounded-xl text-xs font-bold border border-orange-200 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>1-क्लिक डेमो लॉगिन (Demo Login)</span>
            </button>
            
            {onOpenSignUp && (
              <div className="pt-1">
                <span className="text-[11px] text-stone-500">
                  नवीन शाखा पंजीकृत करना चाहते हैं?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSignUp();
                    }}
                    className="text-orange-700 font-bold hover:underline cursor-pointer"
                  >
                    यहाँ साइन-अप करें (Sign Up)
                  </button>
                </span>
              </div>
            )}
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
