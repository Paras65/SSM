import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import { Lock, X, Building2, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface SankulAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SANKUL_CLUSTERS = [
  'गोरखपुर संकुल (Gorakhpur Cluster)',
  'वाराणसी / काशी संकुल (Varanasi Cluster)',
  'दिल्ली प्रांत संकुल (Delhi Prant Cluster)',
  'अवध / लखनऊ संकुल (Awadh Cluster)',
  'कानपुर संकुल (Kanpur Cluster)',
  'मेरठ संकुल (Meerut Cluster)',
  'समस्त संकुल (All Clusters - Prant Oversight)'
];

export const SankulAuthModal: React.FC<SankulAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { schools } = useSchool();
  const [selectedCluster, setSelectedCluster] = useState(SANKUL_CLUSTERS[0]);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('कृपया संकुल प्रभारी पासकोड दर्ज करें');
      return;
    }

    setIsAuthenticating(true);
    setError('');

    try {
      await api.loginSankul(selectedCluster, passcode.trim());
      setPasscode('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'प्रमाणीकरण में त्रुटि हुई।');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border-2 border-amber-300 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-900 via-amber-800 to-orange-950 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="बंद करें (Close)"
            aria-label="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-amber-300 shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold">
            संकुल प्रभारी प्रवेश
          </h3>
          <p className="text-xs text-amber-200 mt-0.5">
            विद्या भारती बहु-विद्यालय क्लस्टर निरीक्षण पटल
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
              संबद्ध संकुल / क्षेत्र चुनें (Select Sankul Cluster)
            </label>
            <div className="relative">
              <select
                value={selectedCluster}
                onChange={e => setSelectedCluster(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition cursor-pointer shadow-2xs"
              >
                {SANKUL_CLUSTERS.map(cluster => (
                  <option key={cluster} value={cluster}>
                    {cluster}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              संकुल प्रभारी पासकोड (Passcode)
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="पासकोड दर्ज करें..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition shadow-2xs"
                autoFocus
              />
              <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
            </div>
            <p className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span>डेमो परीक्षण हेतु पासकोड <strong>1952</strong> का उपयोग करें।</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-800 via-amber-700 to-orange-900 hover:from-orange-900 hover:to-amber-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>सत्यापित हो रहा है...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                <span>संकुल पटल में प्रवेश करें</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>,
    document.body
  );
};

