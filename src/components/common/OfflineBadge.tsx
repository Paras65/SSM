import React, { useState, useEffect } from 'react';
import { subscribeOnlineStatus } from '../../services/pwa';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    return subscribeOnlineStatus(online => setIsOnline(online));
  }, []);

  if (isOnline) return null;

  return (
    <div className="no-print bg-stone-900 text-amber-200 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-amber-600/40 shadow-md">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>
          <strong>ऑफलाइन मोड सक्रिय:</strong> इंटरनेट संपर्क विच्छेदित है। आप कैश्ड दैनिक वंदना, छात्र विवरण एवं परिपत्र देख सकते हैं।
        </span>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
      >
        <RefreshCw className="w-3 h-3" />
        <span>पुनः जांचें</span>
      </button>
    </div>
  );
};

