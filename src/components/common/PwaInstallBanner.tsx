import React, { useState, useEffect } from 'react';
import { subscribePwaInstall, promptPwaInstall } from '../../services/pwa';
import { Download, X, Sparkles } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('ssm_pwa_dismissed') === 'true');

  useEffect(() => {
    return subscribePwaInstall(available => setCanInstall(available));
  }, []);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    await promptPwaInstall();
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('ssm_pwa_dismissed', 'true');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-gradient-to-r from-orange-800 via-amber-700 to-orange-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-yellow-400/60 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        
        {/* App Icon Preview */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-md shrink-0 flex items-center justify-center">
          <div className="w-full h-full rounded-[10px] bg-orange-900 flex items-center justify-center text-2xl">
            🪷
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-yellow-300 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>ऑफिशियल मोबाइल ऐप</span>
          </div>

          <h4 className="text-sm font-black text-white leading-tight">
            सरस्वती शिशु मंदिर ऐप इंस्टॉल करें
          </h4>

          <p className="text-[11px] text-amber-100/90 leading-tight">
            बिना इंटरनेट दैनिक वंदना, उपस्थिति एवं प्रगति पत्र सीधे अपने फोन की होम स्क्रीन से खोलें।
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-orange-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>अभी इंस्टॉल करें</span>
            </button>

            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 text-xs text-amber-200 hover:text-white"
            >
              बाद में
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white p-1 rounded-lg"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

