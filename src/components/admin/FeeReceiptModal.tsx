import React, { useState } from 'react';
import type { FeeRecord, Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Printer, X, CheckCircle, QrCode, MessageSquare, Sparkles, Copy, Check, ArrowLeft } from 'lucide-react';
import { formatWhatsAppPhone } from '../../utils/whatsappAlerts';

interface FeeReceiptModalProps {
  fee: FeeRecord;
  student: Student;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({ fee, student, onClose }) => {
  const { currentSchool } = useSchool();
  const [activeView, setActiveView] = useState<'receipt' | 'qr'>('receipt');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handlePrint = () => {
    setActiveView('receipt');
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Standard UPI URI format accepted by all Indian UPI apps (PhonePe, GPay, Paytm, BHIM)
  const isUpiEnabled = Boolean(currentSchool?.features?.enableDynamicUpi && currentSchool?.features?.upiVpa);
  const schoolVpa = currentSchool?.features?.upiVpa || '';
  const payeeName = currentSchool?.features?.upiPayeeName || currentSchool.name;
  const amountToPay = fee.paidAmount > 0 ? fee.paidAmount : fee.totalAmount;
  const note = `Fee-${student.rollNo}-${student.name.slice(0, 15)}`;
  const upiUri = isUpiEnabled
    ? `upi://pay?pa=${encodeURIComponent(schoolVpa)}&pn=${encodeURIComponent(payeeName.slice(0, 25))}&am=${amountToPay}&cu=INR&tn=${encodeURIComponent(note)}`
    : '';
  const qrImageUrl = isUpiEnabled
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(upiUri)}`
    : '';

  const handleCopyUpi = () => {
    if (!schoolVpa) return;
    navigator.clipboard.writeText(schoolVpa);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = formatWhatsAppPhone(student.contact);
    const text = 
`🚩 * सादर नमस्ते जी * 🚩
*${currentSchool.hindiName || currentSchool.name}*
--------------------------------
🧾 *शुल्क भुगतान पावती (Fee Payment Receipt)*
रसीद सं.: *${fee.receiptNo || 'SSM-REC-ONLINE'}*
दिनांक: *${fee.paidDate || new Date().toISOString().split('T')[0]}*

👤 *छात्र:* ${student.name}
🔢 *अनुक्रमांक:* ${student.rollNo}
🏫 *कक्षा:* ${student.class} '${student.section}'
📅 *सत्र व अवधि:* ${fee.academicYear} • ${fee.term}

💰 *प्राप्त धनराशि:* ₹${fee.paidAmount.toLocaleString('en-IN')}
💳 *भुगतान माध्यम:* ${fee.paymentMode || 'Online UPI'}
✅ *स्थिति:* पूर्ण भुगतान (Paid)

धन्यवाद!
— लेखा कार्यालय, ${currentSchool.name}`;

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="printable-modal fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-hidden print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-orange-200 flex flex-col max-h-[92vh] sm:max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:max-w-none print:rounded-none print:m-0">
        
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="shrink-0 no-print bg-gradient-to-r from-orange-800 to-amber-700 text-white px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 border-b border-orange-900/30">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-amber-100 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              title="वापस जाएं (Back)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">वापस</span>
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate">
                {isUpiEnabled ? 'शुल्क रसीद एवं UPI' : 'शुल्क प्राप्ति रसीद'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Toggle Views (Only displayed if school has dynamic UPI enabled) */}
            {isUpiEnabled && (
              <div className="bg-black/20 p-0.5 rounded-lg flex items-center text-xs">
                <button
                  type="button"
                  onClick={() => setActiveView('receipt')}
                  className={`px-2.5 py-1 rounded-md font-bold transition ${
                    activeView === 'receipt' ? 'bg-white text-orange-950 shadow-xs' : 'text-orange-100 hover:text-white'
                  }`}
                >
                  रसीद पत्र
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('qr')}
                  className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                    activeView === 'qr' ? 'bg-amber-300 text-stone-900 shadow-xs' : 'text-orange-100 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI QR</span>
                </button>
              </div>
            )}

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              title="अभिभावक को व्हाट्सएप रसीद भेजें"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">व्हाट्सएप</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1 bg-white text-orange-900 hover:bg-orange-50 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट</span>
            </button>

            <button
              onClick={onClose}
              aria-label="बंद करें"
              title="बंद करें (Close)"
              className="p-1 rounded-lg hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto print:overflow-visible">
          {/* VIEW 1: Printable Receipt Content */}
          {activeView === 'receipt' && (
            <div className="p-4 sm:p-8 text-stone-900 bg-white print:p-4" id="receipt-print-area">
            
            {/* School Header */}
            <div className="text-center border-b-2 border-orange-600 pb-4 mb-5">
              <div className="flex items-center justify-center gap-3 mb-1">
                <span className="text-3xl">🪷</span>
                <div>
                  <h2 className="text-2xl font-bold text-orange-950 tracking-tight">
                    {currentSchool.hindiName || currentSchool.name}
                  </h2>
                  <p className="text-xs font-semibold text-orange-800 uppercase tracking-wider">
                    {currentSchool.name}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                {currentSchool.affiliate} • {currentSchool.address}
              </p>
              <p className="text-[10px] text-stone-500 font-serif italic mt-0.5">
                ध्येय वाक्य: "{currentSchool.tagline || 'सा विद्या या विमुक्तये'}"
              </p>
            </div>

            {/* Receipt Title & Meta */}
            <div className="flex justify-between items-center text-xs font-semibold pb-3 mb-4 border-b border-stone-200">
              <div>
                <span className="text-stone-500">रसीद संख्या (Receipt No): </span>
                <span className="font-mono text-orange-900 font-bold">{fee.receiptNo || 'SSM-REC-2025-MANUAL'}</span>
              </div>
              <div>
                <span className="text-stone-500">दिनांक (Date): </span>
                <span className="text-stone-900 font-bold">{fee.paidDate || new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-orange-200 grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-5">
              <div>
                <span className="text-stone-500">छात्र / छात्रा का नाम: </span>
                <span className="font-bold text-stone-900">{student.name} ({student.gender})</span>
              </div>
              <div>
                <span className="text-stone-500">अनुक्रमांक (Roll No): </span>
                <span className="font-bold text-stone-900">{student.rollNo}</span>
              </div>
              <div>
                <span className="text-stone-500">कक्षा एवं वर्ग: </span>
                <span className="font-bold text-stone-900">{student.class} - {student.section}</span>
              </div>
              <div>
                <span className="text-stone-500">अभिभावक / पिता का नाम: </span>
                <span className="font-bold text-stone-900">{student.fatherName}</span>
              </div>
              <div>
                <span className="text-stone-500">सत्र (Academic Session): </span>
                <span className="font-bold text-stone-900">{fee.academicYear}</span>
              </div>
              <div>
                <span className="text-stone-500">शुल्क अवधि (Term): </span>
                <span className="font-bold text-stone-900">{fee.term}</span>
              </div>
            </div>

            {/* Fee Table */}
            <table className="w-full text-xs text-left mb-5 border border-stone-300">
              <thead className="bg-orange-100/70 text-orange-950 font-bold">
                <tr>
                  <th className="p-2.5 border-b border-stone-300">क्र. सं.</th>
                  <th className="p-2.5 border-b border-stone-300">विवरण (Fee Head)</th>
                  <th className="p-2.5 border-b border-stone-300 text-right">धनराशि (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-2.5">1</td>
                  <td className="p-2.5">शिक्षण शुल्क (Tuition Fee)</td>
                  <td className="p-2.5 text-right">₹ {(fee.paidAmount * 0.65).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2.5">2</td>
                  <td className="p-2.5">क्रीड़ा, शारीरिक व घोष शुल्क (Sports & Ghosh Fee)</td>
                  <td className="p-2.5 text-right">₹ {(fee.paidAmount * 0.15).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2.5">3</td>
                  <td className="p-2.5">विज्ञान प्रयोगशाला व संगणक (Lab & Computer Fee)</td>
                  <td className="p-2.5 text-right">₹ {(fee.paidAmount * 0.10).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2.5">4</td>
                  <td className="p-2.5">परीक्षा एवं सांस्कृतिक निधि (Exam & Cultural Fund)</td>
                  <td className="p-2.5 text-right">₹ {(fee.paidAmount * 0.10).toFixed(2)}</td>
                </tr>
                <tr className="bg-amber-100/50 font-bold text-stone-950">
                  <td className="p-2.5" colSpan={2}>कुल प्राप्त धनराशि (Total Amount Received)</td>
                  <td className="p-2.5 text-right text-orange-800 text-sm">₹ {fee.paidAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Payment Mode Note & Compact Verification QR */}
            <div className="flex justify-between items-center text-xs text-stone-600 mb-6 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="space-y-1">
                <div>
                  <span>भुगतान माध्यम (Mode): </span>
                  <strong className="text-stone-800">{fee.paymentMode || 'Online UPI'}</strong>
                </div>
                <div>
                  <span>स्थिति (Status): </span>
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-bold">पूर्ण भुगतान (Paid)</span>
                </div>
              </div>

              {/* Compact Verification QR stamp */}
              <div className="flex items-center gap-2 text-right">
                <div className="text-[10px] text-stone-500 hidden sm:block">
                  <span className="block font-bold text-stone-700">डिजिटल सत्यापन QR</span>
                  <span>स्कैन कर विवरण जांचें</span>
                </div>
                <img
                  src={qrImageUrl}
                  alt="Payment QR"
                  className="w-14 h-14 rounded-lg border border-stone-300 bg-white p-0.5"
                />
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="grid grid-cols-2 gap-10 pt-4 text-center text-xs text-stone-700">
              <div className="space-y-10">
                <div className="h-8 flex items-center justify-center">
                  <span className="font-serif italic text-stone-400">हस्ताक्षर / लेखाकार</span>
                </div>
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold">
                  कार्यालय लिपिक / लेखाकार (Cashier)
                </div>
              </div>

              <div className="space-y-10">
                <div className="h-8 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-orange-500 text-orange-600 flex flex-col items-center justify-center text-[7px] font-bold rotate-[-12deg] opacity-75">
                    <span>सरस्वती शिशु मंदिर</span>
                    <span>★ अधिकृत ★</span>
                  </div>
                </div>
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold">
                  प्रधानाचार्य मुद्रा (Principal Seal)
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: Interactive Dynamic UPI QR Code for Counter / Mobile scanning */}
        {isUpiEnabled && activeView === 'qr' && (
          <div className="p-6 sm:p-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>भारत सरकार NPCI अधिकृत डायनेमिक UPI QR</span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900 mb-1">
                स्कैन करें एवं सीधे विद्यालय खाते में भुगतान करें
              </h3>
              <p className="text-xs text-stone-600">
                छात्र: <strong>{student.name}</strong> • अनुक्रमांक: <strong>{student.rollNo}</strong> • कक्षा: <strong>{student.class}</strong>
              </p>
            </div>

            {/* Big QR Card */}
            <div className="bg-gradient-to-b from-amber-50 to-orange-50 p-6 rounded-3xl border-2 border-orange-300 max-w-sm mx-auto shadow-lg">
              
              <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-sm inline-block mb-4">
                <img
                  src={qrImageUrl}
                  alt="Dynamic UPI QR Code"
                  className="w-48 h-48 mx-auto rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-black text-orange-950">
                  ₹{amountToPay.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-stone-600 font-medium">
                  सत्र: {fee.academicYear} ({fee.term})
                </p>

                {/* VPA Copy Pill */}
                <div className="pt-2 flex items-center justify-center gap-2">
                  <span className="text-[11px] font-mono bg-white px-3 py-1 rounded-lg border border-orange-200 text-stone-800">
                    {schoolVpa}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 transition"
                    title="UPI ID कॉपी करें"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Supported Apps Banner */}
              <div className="mt-5 pt-4 border-t border-orange-200/80 flex items-center justify-center gap-3 text-[11px] text-stone-600 font-semibold">
                <span>Google Pay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM UPI</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveView('receipt')}
                className="px-5 py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                रसीद पत्र देखें एवं प्रिंट करें →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
);
};
