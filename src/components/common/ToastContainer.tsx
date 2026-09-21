import React from 'react';
import { useToast, ToastType } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastConfig: Record<ToastType, { bg: string; border: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    icon: CheckCircle2
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-900',
    icon: AlertCircle
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
    icon: AlertTriangle
  },
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-900',
    icon: Info
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="no-print fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      aria-live="polite"
    >
      {toasts.map(toast => {
        const config = toastConfig[toast.type] || toastConfig.info;
        const IconComponent = config.icon;

        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg ${config.bg} ${config.border} ${config.text} transition-all duration-200 animate-in fade-in slide-in-from-top-2`}
          >
            <IconComponent className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-stone-400 hover:text-stone-700 transition-colors p-0.5 rounded cursor-pointer"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;

