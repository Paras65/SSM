import React, { useState, useEffect } from 'react';
import { Wrench, RefreshCw, Phone, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { getMaintenanceConfig, MaintenanceConfig, isMaintenanceBypassed } from '../../utils/maintenanceConfig';

interface MaintenanceScreenProps {
  onOpenAdminLogin?: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ onOpenAdminLogin }) => {
  const [config, setConfig] = useState<MaintenanceConfig>(getMaintenanceConfig());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getMaintenanceConfig());
    };
    window.addEventListener('ssm_maintenance_updated', handleUpdate);
    return () => window.removeEventListener('ssm_maintenance_updated', handleUpdate);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // If maintenance is disabled or bypassed by admin, don't show the screen
  if (!config.enabled || isMaintenanceBypassed()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg w-full bg-stone-950/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 backdrop-blur-md">
        
        {/* Cultural Logo & Wrench Badge */}
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-serif font-black text-xl shadow-inner">
            ॐ
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Wrench className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Heading & Subheading */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950 text-orange-400 border border-orange-800/60 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>सिस्टम अपग्रेड एवं सर्वर रखरखाव</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {config.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-md mx-auto">
            {config.message}
          </p>
        </div>

        {/* Time Window Card */}
        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800/80 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400">रखरखाव समयावधि:</span>
            <span className="font-bold text-amber-400">{config.scheduledWindow}</span>
          </div>
          <div className="flex items-center justify-between text-xs border-t border-stone-800/60 pt-2">
            <span className="text-stone-400">अपेक्षित बहाली समय:</span>
            <span className="font-bold text-emerald-400">{config.estimatedEnd}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'जांच हो रही है...' : 'स्थिति पुनः जांचें'}</span>
          </button>

          {onOpenAdminLogin && (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>प्रशासनिक लॉगिन</span>
            </button>
          )}
        </div>

        {/* Footer Support Info */}
        <div className="pt-4 border-t border-stone-800/60 text-stone-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-stone-400" />
            <span>हेल्पडेस्क: {config.supportContact}</span>
          </span>
          <span className="font-serif text-stone-400">विद्या भारती अखिल भारतीय शिक्षा संस्थान</span>
        </div>
      </div>
    </div>
  );
};

