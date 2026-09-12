import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Phone, User } from 'lucide-react';
import { formatWhatsAppPhone } from '../../utils/whatsappAlerts';

interface WhatsAppAlertModalProps {
  title: string;
  recipientName: string;
  recipientPhone: string;
  studentClass: string;
  defaultMessage: string;
  onClose: () => void;
}

export const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({
  title,
  recipientName,
  recipientPhone,
  studentClass,
  defaultMessage,
  onClose
}) => {
  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  const cleanPhone = formatWhatsAppPhone(recipientPhone);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-200" />
            <h3 className="text-base font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें"
            className="p-1 rounded-lg hover:bg-white/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Recipient info badge */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-stone-900 block text-sm">{recipientName}</strong>
                <span className="text-stone-600">कक्षा: {studentClass}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
              <Phone className="w-3.5 h-3.5" />
              <span>+{cleanPhone || recipientPhone}</span>
            </div>
          </div>

          {/* Editable text preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                संदेश प्रारूप (Message Preview - सम्पादन योग्य):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">कॉपी हुआ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>कॉपी करें</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs font-sans p-3 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800 leading-relaxed resize-none"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              💡 यह संदेश सीधे अभिभावक के पंजीकृत WhatsApp नंबर पर खुलेगा। आप भेजने से पहले इसमें अतिरिक्त टिप्पणी जोड़ सकते हैं।
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition"
          >
            रद्द करें
          </button>
          <button
            onClick={handleSend}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            WhatsApp पर भेजें
          </button>
        </div>

      </div>
    </div>
  );
};

