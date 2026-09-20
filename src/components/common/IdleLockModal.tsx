import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lock, ShieldAlert, LogOut, KeyRound, ArrowRight } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';

interface IdleLockModalProps {
  isOpen: boolean;
  onUnlock: () => void;
  viewMode: 'admin' | 'teacher' | 'sankul';
}

export const IdleLockModal: React.FC<IdleLockModalProps> = ({ isOpen, onUnlock, viewMode }) => {
  const { currentSchool, setViewMode } = useSchool();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('कृपया पासकोड / पिन दर्ज करें');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      if (viewMode === 'admin') {
        await api.loginAdmin(currentSchool?.id || 'ssm-gorakhpur', passcode.trim());
        setPasscode('');
        onUnlock();
      } else if (viewMode === 'teacher') {
        const phone = sessionStorage.getItem('ssm_teacher_phone') || '';
        // If we don't have phone, try quick match or re-login
        if (phone) {
          await api.loginTeacher(currentSchool?.id || 'ssm-gorakhpur', phone, passcode.trim());
        }
        setPasscode('');
        onUnlock();
      } else if (viewMode === 'sankul') {
        const cluster = sessionStorage.getItem('ssm_sankul_name') || 'गोरखपुर संकुल';
        await api.loginSankul(cluster, passcode.trim());
        setPasscode('');
        onUnlock();
      } else {
        onUnlock();
      }
    } catch (err: any) {
      setError(err.message || 'अमान्य पासकोड! कृपया पुनः प्रयास करें।');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    if (viewMode === 'admin') api.logoutAdmin();
    if (viewMode === 'teacher') api.logoutTeacher();
    if (viewMode === 'sankul') api.logoutSankul();
    setViewMode('public');
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border-2 border-amber-400 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 via-orange-900 to-amber-900 text-white p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-amber-300 shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold">
            सत्र निष्क्रियता स्वतः-लॉक
          </h3>
          <p className="text-xs text-amber-200 mt-1">
            साझा कंप्यूटर सुरक्षा • {currentSchool?.city || 'विद्या मंदिर'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUnlock} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-stone-700 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              30 मिनट तक कोई गतिविधि न होने के कारण यह सत्र डेटा सुरक्षा हेतु स्वतः लॉक कर दिया गया है।
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium animate-in shake duration-150">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              {viewMode === 'teacher' ? 'आचार्य सुरक्षा पिन दर्ज करें' : 'व्यवस्थापक पासकोड दर्ज करें'}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={passcode}
                onChange={e => { setPasscode(e.target.value); setError(''); }}
                placeholder={viewMode === 'teacher' ? '4-अंकीय पिन' : 'पासकोड दर्ज करें'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-widest text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isVerifying ? 'सत्यापन हो रहा है...' : 'सत्र अनलॉक करें (Unlock)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>सुरक्षित लॉगआउट करें (Log Out)</span>
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};

