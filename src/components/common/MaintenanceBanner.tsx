import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, ShieldAlert } from 'lucide-react';
import { getMaintenanceConfig, MaintenanceConfig } from '../../utils/maintenanceConfig';

export const MaintenanceBanner: React.FC = () => {
  const [config, setConfig] = useState<MaintenanceConfig>(getMaintenanceConfig());
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('ssm_maintenance_banner_dismissed') === '1') {
      setIsDismissed(true);
    }

    const handleUpdate = () => {
      setConfig(getMaintenanceConfig());
    };

    window.addEventListener('ssm_maintenance_updated', handleUpdate);
    return () => window.removeEventListener('ssm_maintenance_updated', handleUpdate);
  }, []);

  // Only show when scheduledNotice is true, maintenance is not currently active, and not dismissed
  if (!config.scheduledNotice || config.enabled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('ssm_maintenance_banner_dismissed', '1');
  };

  return (
    <div className="no-print bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md z-40 sticky top-0 border-b border-amber-400/40 animate-fade-in">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="bg-amber-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs border border-amber-500/30">
          <Clock className="w-3 h-3" />
          <span>रखरखाव पूर्व-सूचना</span>
        </span>
        <p className="truncate text-amber-50 text-xs sm:text-sm">
          <strong>{config.title}:</strong> {config.scheduledWindow} ({config.message})
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 ml-2 p-1 rounded-md hover:bg-black/20 text-amber-200 hover:text-white transition cursor-pointer"
        title="सूचना बंद करें"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

