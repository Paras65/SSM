import React, { useState } from 'react';
import { X, Printer, IndianRupee, FileText, CheckCircle, Save } from 'lucide-react';
import type { Staff } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface StaffSalarySlipModalProps {
  staff: Staff;
  onClose: () => void;
}

export const StaffSalarySlipModal: React.FC<StaffSalarySlipModalProps> = ({ staff, onClose }) => {
  const { currentSchool } = useSchool();
  const { showSuccess, showError } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('सितम्बर 2026');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const basicPay = staff.basicPay || Math.round(staff.monthlySalary * 0.65);
  const daHra = staff.daHra || Math.round(staff.monthlySalary * 0.35);
  const grossPay = basicPay + daHra;

  const pf = staff.pfDeduction || Math.round(basicPay * 0.1);
  const samitiKosh = staff.samitiDeduction || 500;
  const totalDeductions = pf + samitiKosh;

  const netSalary = grossPay - totalDeductions;

  const saveSalarySlipToDb = async () => {
    try {
      setIsSaving(true);
      await api.createSalarySlip({
        schoolId: currentSchool.id,
        staffId: staff.id,
        staffName: staff.name,
        designation: staff.designation,
        month: selectedMonth,
        academicYear: currentSchool.currentAcademicYear || '2025-26',
        basicPay,
        daHra,
        grossPay,
        pfDeduction: pf,
        samitiDeduction: samitiKosh,
        totalDeductions,
        netSalary,
        paymentStatus: 'Disbursed',
        paymentMode: 'Bank Transfer (NEFT/RTGS)',
        disbursedDate: new Date().toISOString().split('T')[0]
      });
      setIsSaved(true);
      showSuccess(`माह ${selectedMonth} की वेतन पर्ची डेटाबेस में सुरक्षित हो गई!`);
    } catch (err: any) {
      showError('वेतन पर्ची सहेजने में त्रुटि: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = async () => {
    if (!isSaved) {
      await saveSalarySlipToDb();
    }
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 print:max-h-none print:shadow-none print:border-none print:overflow-visible print:w-full">
        
        {/* Header - Screen only */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-saffron-800 via-saffron-700 to-amber-700 text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-bold">आचार्य / कर्मचारी मासिक वेतन पर्ची (Salary Slip)</h3>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="वेतन माह चुनें"
              className="bg-saffron-900/80 text-white text-xs px-3 py-1.5 rounded-lg border border-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="सितम्बर 2026">सितम्बर 2026</option>
              <option value="अगस्त 2026">अगस्त 2026</option>
              <option value="जुलाई 2026">जुलाई 2026</option>
              <option value="जून 2026">जून 2026</option>
            </select>
            <button
              onClick={saveSalarySlipToDb}
              disabled={isSaving || isSaved}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                isSaved ? 'bg-emerald-600 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
              }`}
              title="वेतन पर्ची डेटाबेस में सुरक्षित करें"
            >
              {isSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'सुरक्षित (Saved)' : isSaving ? 'सहेज रहे हैं...' : 'डेटाबेस में सहेजें'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-saffron-950 rounded-lg text-xs font-bold transition shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              प्रिंट करें
            </button>
            <button
              onClick={onClose}
              aria-label="बंद करें"
              className="p-1 rounded-lg hover:bg-white/10 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Slip Content */}
        <div className="p-6 md:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible">
          <div className="border-2 border-saffron-800/80 rounded-xl p-6 bg-amber-50/20 relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <span className="text-8xl font-black text-saffron-950 rotate-[-25deg]">विद्या भारती</span>
            </div>

            {/* School Header */}
            <div className="text-center border-b-2 border-saffron-800/60 pb-4 mb-5">
              <p className="text-xs font-bold text-saffron-800 tracking-wider">
                ॥ {currentSchool.tagline || 'सा विद्या या विमुक्तये'} ॥
              </p>
              <h2 className="text-xl md:text-2xl font-black text-saffron-950 mt-1">
                {currentSchool.hindiName || currentSchool.name}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                {currentSchool.address} • दूरभाष: {currentSchool.phone}
              </p>
              <p className="text-[11px] font-semibold text-saffron-700 mt-1">
                {currentSchool.affiliate} • सम्बद्धता क्र.: {currentSchool.affiliationNo}
              </p>
              <div className="mt-3 inline-block bg-saffron-800 text-amber-100 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                मासिक वेतन पर्ची / Monthly Salary Slip — {selectedMonth}
              </div>
            </div>

            {/* Employee Meta Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-lg border border-saffron-200 text-xs mb-5">
              <div>
                <span className="text-stone-500 block">कर्मचारी कोड / ID:</span>
                <strong className="text-stone-800 uppercase font-mono">{staff.id}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">कर्मचारी का नाम:</span>
                <strong className="text-stone-900">{staff.name}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">पद / Designation:</span>
                <strong className="text-saffron-900">{staff.designation}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">योग्यता / Degree:</span>
                <strong className="text-stone-800">{staff.qualification || 'स्नातकोत्तर'}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">विषय दायित्व:</span>
                <strong className="text-stone-800">{staff.subjects || 'अकादमिक'}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">दूरभाष / Phone:</span>
                <strong className="text-stone-800">{staff.phone}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">कार्यभार ग्रहण तिथि:</span>
                <strong className="text-stone-800">{staff.joiningDate}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">कार्य स्थिति:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle className="w-3 h-3" /> सक्रिय (Active)
                </span>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* Earnings */}
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <div className="bg-emerald-50 text-emerald-900 px-3 py-2 text-xs font-bold border-b border-emerald-200">
                  उपलब्धियाँ / Earnings (₹)
                </div>
                <div className="divide-y divide-stone-100 text-xs bg-white">
                  <div className="flex justify-between px-3 py-2">
                    <span className="text-stone-600">मूल वेतन (Basic Pay)</span>
                    <span className="font-semibold font-mono">₹{basicPay.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2">
                    <span className="text-stone-600">महंगाई एवं आवास भत्ता (DA & HRA)</span>
                    <span className="font-semibold font-mono">₹{daHra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-emerald-50/50 font-bold text-emerald-950">
                    <span>सकल वेतन (Gross Salary)</span>
                    <span className="font-mono">₹{grossPay.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <div className="bg-rose-50 text-rose-900 px-3 py-2 text-xs font-bold border-b border-rose-200">
                  कटौतियां / Deductions (₹)
                </div>
                <div className="divide-y divide-stone-100 text-xs bg-white">
                  <div className="flex justify-between px-3 py-2">
                    <span className="text-stone-600">भविष्य निधि (Provident Fund - PF)</span>
                    <span className="font-semibold font-mono">₹{pf.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2">
                    <span className="text-stone-600">समिति कल्याण कोष / Samiti Kosh</span>
                    <span className="font-semibold font-mono">₹{samitiKosh.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-rose-50/50 font-bold text-rose-950">
                    <span>कुल कटौती (Total Deductions)</span>
                    <span className="font-mono">₹{totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Banner */}
            <div className="bg-gradient-to-r from-saffron-100 via-amber-50 to-amber-100 border border-amber-300 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 mb-8">
              <div>
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
                  शुद्ध संदेय वेतन (Net Payable Amount)
                </span>
                <p className="text-xs text-stone-700 italic mt-0.5">
                  खाते में अंतरित / Paid by Bank Transfer
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-2xl md:text-3xl font-black text-saffron-950">
                <IndianRupee className="w-6 h-6 text-saffron-800" />
                <span>₹{netSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-300 text-center text-xs">
              <div>
                <div className="h-10"></div>
                <p className="border-t border-dashed border-stone-400 pt-1 text-stone-600 font-medium">
                  हस्ताक्षर कर्मचारी / आचार्य
                </p>
              </div>
              <div>
                <div className="h-10"></div>
                <p className="border-t border-dashed border-stone-400 pt-1 text-stone-600 font-medium">
                  लेखाकार / Accountant
                </p>
              </div>
              <div>
                <div className="h-10 flex items-center justify-center">
                  <span className="text-[10px] text-saffron-800 font-bold border border-saffron-600 px-2 py-0.5 rounded">
                    मुद्रा / SEAL
                  </span>
                </div>
                <p className="border-t border-dashed border-stone-400 pt-1 text-stone-900 font-bold">
                  {currentSchool.principalName || 'प्रधानाचार्य'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition"
          >
            बंद करें (Close)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-saffron-700 hover:bg-saffron-800 rounded-lg shadow transition"
          >
            <Printer className="w-4 h-4" />
            प्रिंट वेतन पर्ची (Print Slip)
          </button>
        </div>

      </div>
    </div>
  );
};

