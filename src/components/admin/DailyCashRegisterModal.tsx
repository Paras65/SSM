import React, { useState, useMemo } from 'react';
import type { FeeRecord, Student, School } from '../../types';
import { exportDailyCashRegisterToCSV } from '../../utils/csvExport';
import {
  Printer,
  X,
  Calendar,
  IndianRupee,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Download,
  BookOpen,
  Calculator,
  RefreshCw
} from 'lucide-react';

interface DailyCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeRecords: FeeRecord[];
  students: Student[];
  currentSchool: School;
}

interface Denominations {
  n500: number;
  n200: number;
  n100: number;
  n50: number;
  n20: number;
  n10: number;
  coins: number;
}

export const DailyCashRegisterModal: React.FC<DailyCashRegisterModalProps> = ({
  isOpen,
  onClose,
  feeRecords,
  students,
  currentSchool
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [denominations, setDenominations] = useState<Denominations>({
    n500: 0,
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    coins: 0
  });

  const [remarks, setRemarks] = useState('');

  // Fast student lookup map
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.id, s));
    return map;
  }, [students]);

  // Filter fee collections for the selected date
  const dailyFees = useMemo(() => {
    return feeRecords.filter(f => {
      if ((f.paidAmount || 0) <= 0) return false;
      if (f.paidDate === selectedDate) return true;
      // Also match if paidDate starts with selectedDate (ISO timestamp format)
      if (f.paidDate && f.paidDate.split('T')[0] === selectedDate) return true;
      return false;
    });
  }, [feeRecords, selectedDate]);

  // Breakdown by mode
  const summary = useMemo(() => {
    let cash = 0;
    let online = 0;
    let cheque = 0;
    let other = 0;

    dailyFees.forEach(f => {
      const amount = f.paidAmount || 0;
      const mode = (f.paymentMode || 'Cash').toLowerCase();
      if (mode.includes('cash') || mode.includes('नकद')) {
        cash += amount;
      } else if (mode.includes('online') || mode.includes('upi') || mode.includes('transfer')) {
        online += amount;
      } else if (mode.includes('cheque') || mode.includes('चेक')) {
        cheque += amount;
      } else {
        other += amount;
      }
    });

    const grandTotal = cash + online + cheque + other;
    return {
      count: dailyFees.length,
      cash,
      online,
      cheque,
      other,
      grandTotal
    };
  }, [dailyFees]);

  // Physical cash calculated from denominations
  const physicalCashTotal = useMemo(() => {
    return (
      denominations.n500 * 500 +
      denominations.n200 * 200 +
      denominations.n100 * 100 +
      denominations.n50 * 50 +
      denominations.n20 * 20 +
      denominations.n10 * 10 +
      (Number(denominations.coins) || 0)
    );
  }, [denominations]);

  const cashDifference = physicalCashTotal - summary.cash;

  const handleDenominationChange = (field: keyof Denominations, val: string) => {
    const parsed = Math.max(0, parseInt(val, 10) || 0);
    setDenominations(prev => ({
      ...prev,
      [field]: parsed
    }));
  };

  const handleResetDenominations = () => {
    setDenominations({
      n500: 0,
      n200: 0,
      n100: 0,
      n50: 0,
      n20: 0,
      n10: 0,
      coins: 0
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    exportDailyCashRegisterToCSV(dailyFees, students, selectedDate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-stone-200 print:shadow-none print:border-none print:max-w-none print:rounded-none">
        {/* Interactive Header / Action Bar (Hidden on print) */}
        <div className="no-print bg-stone-900 text-white px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-600 rounded-xl text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                दैनिक रोकड़ बही एवं नकद मिलान
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  DCR Register
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                काउंटर नकद दराज (Cash Drawer) व ऑनलाइन संग्रह का दैनिक मिलान व A4 मुद्रण
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-700">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>

            {/* Today Button */}
            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg transition"
              >
                आज
              </button>
            )}

            {/* CSV Export */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={dailyFees.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              title="दैनिक रोकड़ बही CSV डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV निर्यात</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black tracking-wide transition shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 रोकड़ बही प्रिंट</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Container */}
        <div className="p-4 sm:p-6 max-h-[84vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-2 space-y-6">
          {/* Printable Formal Header */}
          <div className="text-center border-b-2 border-stone-800 pb-4 space-y-1">
            <div className="text-xs font-serif font-bold text-stone-600 tracking-widest uppercase">
              ।। श्री गणेशाय नमः ।। सा विद्या या विमुक्तये ।।
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {currentSchool.hindiName || currentSchool.name}
            </h1>
            <p className="text-xs text-stone-600 font-medium">
              {currentSchool.address || 'सरस्वती शिशु मंदिर परिसर'} • संबंद्धता / कोड:{' '}
              {currentSchool.affiliationNo || 'SSM-REG'}
            </p>
            <div className="inline-block mt-2 px-4 py-1 bg-amber-100 text-amber-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-md border border-amber-300 print:bg-transparent print:border-stone-800">
              दैनिक रोकड़ बही एवं नकद मिलान पंजी (DAILY CASH REGISTER - DCR)
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 pt-2 px-1">
              <span>
                दिनांक:{' '}
                <strong className="text-stone-900 font-mono text-sm">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('hi-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </strong>
              </span>
              <span>
                सत्र: <strong className="text-stone-900">{currentSchool.currentAcademicYear || '2025-26'}</strong>
              </span>
            </div>
          </div>

          {/* KPI Summary Cards (Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 print:border-stone-400">
              <div className="flex items-center justify-between text-stone-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">कुल रसीदें (Receipts)</span>
                <BookOpen className="w-3.5 h-3.5 text-stone-400 no-print" />
              </div>
              <p className="text-xl font-black text-stone-900 mt-1">{summary.count}</p>
              <span className="text-[11px] text-stone-500 font-medium">कुल लेनदेन संख्या</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 print:border-stone-400 print:bg-white">
              <div className="flex items-center justify-between text-emerald-800">
                <span className="text-[10px] font-bold uppercase tracking-wider">नकद संग्रह (Cash)</span>
                <Banknote className="w-3.5 h-3.5 text-emerald-600 no-print" />
              </div>
              <p className="text-xl font-black text-emerald-900 mt-1">₹{summary.cash.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-emerald-700 font-medium">दराज में देय नकद</span>
            </div>

            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 print:border-stone-400 print:bg-white">
              <div className="flex items-center justify-between text-sky-800">
                <span className="text-[10px] font-bold uppercase tracking-wider">ऑनलाइन / UPI संग्रह</span>
                <Smartphone className="w-3.5 h-3.5 text-sky-600 no-print" />
              </div>
              <p className="text-xl font-black text-sky-900 mt-1">₹{summary.online.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-sky-700 font-medium">बैंक खाते में प्रत्यक्ष</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 print:border-stone-400 print:bg-white">
              <div className="flex items-center justify-between text-amber-900">
                <span className="text-[10px] font-bold uppercase tracking-wider">कुल दैनिक संग्रह (Grand Total)</span>
                <IndianRupee className="w-3.5 h-3.5 text-amber-700 no-print" />
              </div>
              <p className="text-xl font-black text-amber-950 mt-1">₹{summary.grandTotal.toLocaleString('en-IN')}</p>
              <span className="text-[11px] text-amber-800 font-medium">समग्र प्राप्ति</span>
            </div>
          </div>

          {/* Cash Drawer Denomination Reconciliation (रोकड़ दराज नोट मिलान) */}
          <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-4 print:border-stone-400 print:bg-white print-avoid-break">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                  भौतिक नकद दराज नोट मिलान (Physical Cash Drawer Denominations)
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {/* Physical cash total indicator */}
                <div className="text-xs font-bold text-stone-700">
                  भौतिक कुल:{' '}
                  <span className="font-mono text-stone-900 font-black text-sm">
                    ₹{physicalCashTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Match Status Badge */}
                {physicalCashTotal > 0 || summary.cash > 0 ? (
                  cashDifference === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      पूर्ण मिलान (₹0 अंतर)
                    </span>
                  ) : cashDifference > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      ₹{cashDifference.toLocaleString('en-IN')} नकद अधिक
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      ₹{Math.abs(cashDifference).toLocaleString('en-IN')} नकद कम
                    </span>
                  )
                ) : null}

                <button
                  type="button"
                  onClick={handleResetDenominations}
                  className="no-print p-1 text-stone-400 hover:text-stone-700 rounded transition cursor-pointer"
                  title="नोट गणना रीसेट करें"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Denomination Inputs Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-3">
              {[
                { label: '₹500', value: 500, key: 'n500' as const },
                { label: '₹200', value: 200, key: 'n200' as const },
                { label: '₹100', value: 100, key: 'n100' as const },
                { label: '₹50', value: 50, key: 'n50' as const },
                { label: '₹20', value: 20, key: 'n20' as const },
                { label: '₹10', value: 10, key: 'n10' as const }
              ].map(d => (
                <div key={d.key} className="bg-white p-2 rounded-xl border border-stone-200 text-center shadow-2xs">
                  <span className="text-[11px] font-bold text-stone-600 block">{d.label} नोट</span>
                  <input
                    type="number"
                    min="0"
                    value={denominations[d.key] || ''}
                    onChange={e => handleDenominationChange(d.key, e.target.value)}
                    placeholder="0"
                    className="w-full text-center font-mono font-bold text-sm text-stone-900 border border-stone-200 rounded-lg py-1 mt-1 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-400 font-mono block mt-1">
                    = ₹{(denominations[d.key] * d.value).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              <div className="bg-white p-2 rounded-xl border border-stone-200 text-center shadow-2xs">
                <span className="text-[11px] font-bold text-stone-600 block">सिक्का राशि</span>
                <input
                  type="number"
                  min="0"
                  value={denominations.coins || ''}
                  onChange={e => handleDenominationChange('coins', e.target.value)}
                  placeholder="₹ 0"
                  className="w-full text-center font-mono font-bold text-sm text-stone-900 border border-stone-200 rounded-lg py-1 mt-1 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 font-mono block mt-1">
                  = ₹{(denominations.coins || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Daily Receipts Table */}
          <div className="border border-stone-300 rounded-2xl overflow-hidden shadow-2xs print:border-stone-400 print:rounded-none">
            <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between">
              <span className="text-xs font-black text-stone-800 uppercase tracking-wide">
                दैनिक प्राप्त रसीदों का विस्तृत विवरण (Itemized Daily Receipts)
              </span>
              <span className="text-xs font-mono font-bold text-stone-600">
                कुल प्रविष्टियां: {dailyFees.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-stone-200">
                <thead className="bg-stone-50 font-bold text-stone-700 text-[11px]">
                  <tr>
                    <th className="p-2.5 text-center w-12">क्र.सं.</th>
                    <th className="p-2.5">रसीद संख्या</th>
                    <th className="p-2.5">अनुक्रमांक</th>
                    <th className="p-2.5">छात्र का नाम</th>
                    <th className="p-2.5">कक्षा व वर्ग</th>
                    <th className="p-2.5">शुल्क विवरण / मद</th>
                    <th className="p-2.5 text-center">माध्यम</th>
                    <th className="p-2.5 text-right font-black">प्राप्त राशि (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {dailyFees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-500 italic">
                        चयनित दिनांक ({selectedDate}) को कोई शुल्क रसीद निर्गमित नहीं हुई है।
                      </td>
                    </tr>
                  ) : (
                    dailyFees.map((fee, idx) => {
                      const student = studentMap.get(fee.studentId);
                      const isCash = (fee.paymentMode || 'Cash').toLowerCase().includes('cash');

                      return (
                        <tr key={fee.id} className="hover:bg-stone-50 transition-colors">
                          <td className="p-2.5 text-center font-mono text-stone-500">{idx + 1}</td>
                          <td className="p-2.5 font-mono font-bold text-stone-900">
                            {fee.receiptNo || `SSM-DCR-${idx + 1}`}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-stone-800">{student?.rollNo || '—'}</td>
                          <td className="p-2.5 font-bold text-stone-900">{student?.name || 'अज्ञात छात्र'}</td>
                          <td className="p-2.5 text-stone-700">
                            {student ? `${student.class} '${student.section}'` : '—'}
                          </td>
                          <td className="p-2.5 text-stone-600">{fee.term}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCash
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-sky-100 text-sky-800 border border-sky-300'
                              }`}
                            >
                              {fee.paymentMode || 'Cash'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-black text-stone-900">
                            ₹{(fee.paidAmount || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {dailyFees.length > 0 && (
                  <tfoot className="bg-stone-100 font-black text-stone-900 border-t-2 border-stone-300">
                    <tr>
                      <td colSpan={6} className="p-2.5 text-right text-xs uppercase tracking-wider">
                        सकल कुल योग (Grand Total Collection):
                      </td>
                      <td className="p-2.5 text-center font-mono text-[11px] text-stone-600">
                        {summary.count} रसीदें
                      </td>
                      <td className="p-2.5 text-right font-mono text-sm text-stone-900">
                        ₹{summary.grandTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="print-avoid-break">
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              दैनिक टिप्पणी / रोकड़िया प्रविष्टि (Daily Audit Remarks):
            </label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="उदा. आज बैंक में जमा की गई नकद राशि, या विशेष छूट विवरण..."
              className="w-full text-xs p-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none print:border-b print:border-stone-400 print:bg-transparent"
            />
          </div>

          {/* Signatures & Certification Footer */}
          <div className="pt-8 border-t border-stone-300 grid grid-cols-3 gap-6 text-center text-xs font-bold text-stone-800 print-avoid-break">
            <div className="space-y-8">
              <p className="text-stone-500 text-[10px] font-mono">
                प्रविष्टि समय: {new Date().toLocaleTimeString('hi-IN')}
              </p>
              <div className="border-t border-stone-600 pt-1.5">
                रोकड़िया / लिपिक हस्ताक्षर
                <span className="block text-[10px] text-stone-500 font-normal">(Cashier / Clerk)</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="h-4"></div>
              <div className="border-t border-stone-600 pt-1.5">
                लेखाकार / प्रबंधक
                <span className="block text-[10px] text-stone-500 font-normal">(Accountant / Manager)</span>
              </div>
            </div>

            <div className="space-y-8">
              <div className="h-4"></div>
              <div className="border-t border-stone-600 pt-1.5">
                प्रधानाचार्य प्रतिहस्ताक्षर एवं सील
                <span className="block text-[10px] text-stone-500 font-normal">(Principal Seal & Sign)</span>
              </div>
            </div>
          </div>

          {/* Software footer */}
          <div className="text-center text-[10px] text-stone-400 pt-3 border-t border-stone-100">
            सरस्वती शिशु मंदिर ईआरपी प्रणाली • init65.co.in द्वारा सुरक्षित एवं स्वचालित दैनिक रोकड़ बही
          </div>
        </div>
      </div>
    </div>
  );
};

