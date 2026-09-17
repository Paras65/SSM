import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { exportFeesToCSV } from '../../../utils/csvExport';
import { SSM_CLASSES, type Student, type FeeRecord } from '../../../types';
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Download,
  IndianRupee,
  Lock,
  MessageSquare,
  Printer,
  Receipt,
  Search,
  Trash2,
  X
} from 'lucide-react';

interface WhatsAppAlertPayload {
  title: string;
  recipientName: string;
  recipientPhone: string;
  studentClass: string;
  defaultMessage: string;
}

interface AdminFeesTabProps {
  totalFeeCollected: number;
  totalFeePending: number;
  requirePro: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
  onOpenFeeModal: (modal: { fee: FeeRecord; student: Student }) => void;
  onOpenWhatsAppAlert: (payload: WhatsAppAlertPayload) => void;
}

interface CollectPaymentState {
  fee: FeeRecord;
  student: Student;
  payAmount: number;
  paymentMode: 'Cash' | 'Online UPI' | 'Cheque' | 'Bank Transfer';
  referenceNo: string;
}

const AdminFeesTabComponent: React.FC<AdminFeesTabProps> = ({
  totalFeeCollected,
  totalFeePending,
  requirePro,
  onOpenFeeModal,
  onOpenWhatsAppAlert
}) => {
  const { students, currentSchool, feeRecords, markFeePaid, deleteFeeRecord } = useSchool();
  const isPro = currentSchool.plan === 'pro';

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Paid' | 'Pending' | 'Partial'>('ALL');

  // Interactive Fee Collection Dialog State
  const [collectingPayment, setCollectingPayment] = useState<CollectPaymentState | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Student map for fast O(1) lookup
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.id, s));
    return map;
  }, [students]);

  // Filtered fee records
  const filteredFees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return feeRecords.filter(fee => {
      const student = studentMap.get(fee.studentId);
      if (!student) return false;

      // Class filter
      const matchesClass =
        selectedClass === 'ALL' ||
        student.class === selectedClass ||
        student.class.startsWith(selectedClass + ' ');
      if (!matchesClass) return false;

      // Status filter
      if (selectedStatus !== 'ALL' && fee.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (q) {
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesRoll = student.rollNo.toLowerCase().includes(q);
        const matchesFather = student.fatherName && student.fatherName.toLowerCase().includes(q);
        const matchesReceipt = fee.receiptNo && fee.receiptNo.toLowerCase().includes(q);
        const matchesTerm = fee.term && fee.term.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesFather && !matchesReceipt && !matchesTerm) {
          return false;
        }
      }

      return true;
    });
  }, [feeRecords, studentMap, selectedClass, selectedStatus, searchQuery]);

  // Filtered financial KPI calculations
  const stats = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    let pendingCount = 0;
    let paidCount = 0;

    filteredFees.forEach(fee => {
      totalDue += fee.totalAmount || 0;
      totalPaid += fee.paidAmount || 0;
      if (fee.status === 'Paid') {
        paidCount++;
      } else {
        pendingCount++;
      }
    });

    const totalBalance = Math.max(0, totalDue - totalPaid);
    return {
      totalRecords: filteredFees.length,
      totalDue,
      totalPaid,
      totalBalance,
      pendingCount,
      paidCount
    };
  }, [filteredFees]);

  // Handle open fee collection modal
  const handleOpenCollectModal = (fee: FeeRecord, student: Student) => {
    const remaining = Math.max(0, fee.totalAmount - (fee.paidAmount || 0));
    setCollectingPayment({
      fee,
      student,
      payAmount: remaining > 0 ? remaining : fee.totalAmount,
      paymentMode: 'Cash',
      referenceNo: ''
    });
  };

  // Handle submit payment
  const handleConfirmPayment = async () => {
    if (!collectingPayment) return;
    const { fee, student, payAmount, paymentMode } = collectingPayment;
    if (payAmount <= 0) return;

    setIsProcessingPayment(true);
    try {
      const currentPaid = fee.paidAmount || 0;
      const newTotalPaid = Math.min(fee.totalAmount, currentPaid + payAmount);
      await markFeePaid(fee.id, paymentMode, newTotalPaid);

      // Generate receipt object for immediate view/print
      const schoolSuffix = (currentSchool.id || 'SSM').slice(-4).toUpperCase();
      const generatedReceiptNo =
        fee.receiptNo ||
        `SSM-REC-${new Date().getFullYear()}-${schoolSuffix}-${Date.now().toString().slice(-6)}`;

      const updatedFee: FeeRecord = {
        ...fee,
        paidAmount: newTotalPaid,
        status: newTotalPaid >= fee.totalAmount ? 'Paid' : 'Partial',
        paidDate: new Date().toISOString().split('T')[0],
        receiptNo: generatedReceiptNo,
        paymentMode
      };

      setCollectingPayment(null);
      // Automatically open receipt view modal
      onOpenFeeModal({ fee: updatedFee, student });
    } catch (err) {
      console.error('Error submitting payment:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            शुल्क प्रबंधन एवं रसीद निर्गमन (Fee Management & Receipts)
          </h3>
          <p className="text-xs text-stone-500">
            मासिक एवं त्रैमासिक शिक्षण शुल्क, क्रीड़ा निधि, एवं तत्काल रसीद प्रिंटिंग
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => {
              requirePro(
                'शुल्क रजिस्टर CSV / Excel डेटा निर्यात',
                'समस्त छात्र शुल्क, भुगतान स्थिति एवं बकाया विवरण का एक्सेल बैकअप केवल प्रो योजना में उपलब्ध है।',
                () => exportFeesToCSV(feeRecords, students)
              );
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            title="Export Fee Register to CSV"
          >
            <Download className="w-3.5 h-3.5 text-green-400" />
            <span>शुल्क CSV निर्यात</span>
            {!isPro && <Lock className="w-2.5 h-2.5 text-amber-300 ml-0.5" />}
          </button>
        </div>
      </div>

      {/* KPI Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase">कुल प्रविष्टियां (Records)</span>
            <Receipt className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <p className="text-xl font-black text-stone-900 mt-1">{stats.totalRecords}</p>
          <span className="text-[11px] text-stone-500 font-medium">कुल मांग: ₹{stats.totalDue.toLocaleString('en-IN')}</span>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">कुल प्राप्त राशि (Collected)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-800 mt-1">₹{stats.totalPaid.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-700 font-medium">{stats.paidCount} छात्र पूर्ण भुगतान</span>
        </div>

        <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase">कुल शेष बकाया (Pending)</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-800 mt-1">₹{stats.totalBalance.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-rose-700 font-medium">{stats.pendingCount} छात्रों का शुल्क देय</span>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase">विद्यालय कुल प्राप्त (All Time)</span>
            <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-900 mt-1">₹{totalFeeCollected.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-amber-700 font-medium">कुल बकाया: ₹{totalFeePending.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="छात्र का नाम, अनुक्रमांक, पिता का नाम, या रसीद सं..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी कक्षाएं (All Classes)</option>
          {SSM_CLASSES.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value as any)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी स्थितियां (All Status)</option>
          <option value="Pending">लंबित (Pending Only)</option>
          <option value="Partial">आंशिक (Partial Paid)</option>
          <option value="Paid">पूर्ण भुगतान (Paid Only)</option>
        </select>

        {/* Reset Filter */}
        {(searchQuery || selectedClass !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>फ़िल्टर हटाएं</span>
          </button>
        )}
      </div>

      {/* Fees Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
            <tr>
              <th className="p-3">अनुक्रमांक</th>
              <th className="p-3">छात्र का नाम</th>
              <th className="p-3">कक्षा</th>
              <th className="p-3">शुल्क अवधि</th>
              <th className="p-3">देय राशि</th>
              <th className="p-3">प्राप्त राशि</th>
              <th className="p-3">शेष बकाया</th>
              <th className="p-3">स्थिति</th>
              <th className="p-3">रसीद सं.</th>
              <th className="p-3 text-right">कार्य</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredFees.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-stone-500">
                  {searchQuery || selectedClass !== 'ALL' || selectedStatus !== 'ALL'
                    ? 'खोज एवं फ़िल्टर के अनुरूप कोई शुल्क रिकॉर्ड नहीं मिला।'
                    : 'इस शाखा में अभी कोई शुल्क रिकॉर्ड उपलब्ध नहीं है।'}
                </td>
              </tr>
            ) : (
              filteredFees.map(fee => {
                const student = studentMap.get(fee.studentId);
                if (!student) return null;
                const remaining = Math.max(0, fee.totalAmount - (fee.paidAmount || 0));

                return (
                  <tr key={fee.id} className="hover:bg-stone-50 transition">
                    <td className="p-3 font-mono font-bold text-stone-800">{student.rollNo}</td>
                    <td className="p-3">
                      <div className="font-semibold text-stone-900">{student.name}</div>
                      {student.fatherName && (
                        <div className="text-[10px] text-stone-500">पिता: {student.fatherName}</div>
                      )}
                    </td>
                    <td className="p-3 text-stone-600">{student.class} - {student.section}</td>
                    <td className="p-3 font-medium text-stone-700">{fee.term}</td>
                    <td className="p-3 font-bold text-stone-900">₹{fee.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-emerald-700">₹{fee.paidAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-rose-700">
                      {remaining > 0 ? `₹${remaining.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          fee.status === 'Paid'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : fee.status === 'Partial'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {fee.status === 'Paid'
                          ? 'पूर्ण भुगतान'
                          : fee.status === 'Partial'
                          ? `आंशिक (₹${remaining} बकाया)`
                          : 'लंबित'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-stone-600">
                      {fee.receiptNo || '—'}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      {fee.status !== 'Paid' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              requirePro(
                                'शुल्क अनुस्मारक व्हाट्सएप अलर्ट (WhatsApp Alerts)',
                                'शुल्क बकाया अनुस्मारक सीधे अभिभावक के व्हाट्सएप पर भेजना केवल प्रो योजना में उपलब्ध है।',
                                () => {
                                  onOpenWhatsAppAlert({
                                    title: 'शुल्क अनुस्मारक WhatsApp अलर्ट',
                                    recipientName: student.name,
                                    recipientPhone: student.contact,
                                    studentClass: student.class,
                                    defaultMessage: `🚩 *सादर नमस्ते जी* 🚩\n*${currentSchool.hindiName || currentSchool.name}*\n--------------------------------\n*शिक्षण शुल्क अनुस्मारक सूचना:*\nअभिभावक जी, आपके पाल्य/पाल्या *${student.name}* (कक्षा: ${student.class}) का *${fee.term}* का शुल्क देय है:\n\n💰 *देय धनराशि:* ₹${remaining.toLocaleString('en-IN')}\n\nकृपया ससमय विद्यालय कार्यालय अथवा ऑनलाइन माध्यम से शुल्क जमा कर अधिकृत रसीद प्राप्त करें।\n\nसहयोग हेतु आभार!\n— लेखा विभाग, ${currentSchool.hindiName || currentSchool.name}`
                                  });
                                }
                              );
                            }}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Send Fee Reminder WhatsApp Alert"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-700" />
                            <span>WhatsApp</span>
                            {!isPro && <Lock className="w-2.5 h-2.5 text-emerald-700 ml-0.5" />}
                          </button>

                          <button
                            onClick={() => handleOpenCollectModal(fee, student)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>शुल्क जमा करें</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenFeeModal({ fee, student })}
                          className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold text-[11px] flex items-center gap-1 inline-flex cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>रसीद देखें / प्रिंट</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `क्या आप ${student.name} का ${fee.term} का शुल्क रिकॉर्ड स्थायी रूप से हटाना चाहते हैं?`
                            )
                          ) {
                            deleteFeeRecord(fee.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded transition inline-flex items-center cursor-pointer"
                        title="शुल्क रिकॉर्ड हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= INTERACTIVE FEE COUNTER COLLECTION MODAL ================= */}
      {collectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-700 to-amber-600 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-200" />
                <h4 className="font-bold text-sm">शुल्क काउंटर प्रविष्टि (Collect Student Fee)</h4>
              </div>
              <button
                onClick={() => setCollectingPayment(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Student and Fee Summary Card */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-stone-900 text-sm">{collectingPayment.student.name}</span>
                    <p className="text-stone-500 text-[11px]">
                      अनुक्रमांक: {collectingPayment.student.rollNo} • कक्षा: {collectingPayment.student.class} '{collectingPayment.student.section}'
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-bold text-[10px]">
                    {collectingPayment.fee.term}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-200 text-center">
                  <div>
                    <span className="text-[10px] text-stone-500 font-semibold block">कुल देय शुल्क</span>
                    <span className="font-bold text-stone-900">₹{collectingPayment.fee.totalAmount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-semibold block">पूर्व जमा राशि</span>
                    <span className="font-bold text-emerald-700">₹{collectingPayment.fee.paidAmount || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-semibold block">शेष देय राशि</span>
                    <span className="font-bold text-rose-700">
                      ₹{Math.max(0, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Amount Input & Quick Chips */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  जमा की जाने वाली राशि (Amount to Collect in ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={Math.max(0, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0))}
                    value={collectingPayment.payAmount || ''}
                    onChange={e =>
                      setCollectingPayment(prev =>
                        prev ? { ...prev, payAmount: Number(e.target.value) } : null
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 text-sm font-bold rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Quick Fill Chips */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const rem = Math.max(0, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0));
                      setCollectingPayment(prev => (prev ? { ...prev, payAmount: rem } : null));
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                  >
                    पूरा भुगतान (₹{Math.max(0, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0))})
                  </button>
                  {Math.max(0, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0)) > 500 && (
                    <button
                      type="button"
                      onClick={() => {
                        const rem = Math.max(0, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0));
                        setCollectingPayment(prev => (prev ? { ...prev, payAmount: Math.round(rem / 2) } : null));
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                    >
                      50% आंशिक (₹{Math.round(Math.max(0, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0)) / 2)})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  भुगतान माध्यम (Payment Mode) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'Cash', label: 'नकद (Cash)', icon: Banknote },
                    { id: 'Online UPI', label: 'UPI / QR', icon: CreditCard },
                    { id: 'Cheque', label: 'बैंक चेक', icon: Receipt },
                    { id: 'Bank Transfer', label: 'NEFT / RTGS', icon: IndianRupee }
                  ].map(mode => {
                    const Icon = mode.icon;
                    const isSelected = collectingPayment.paymentMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() =>
                          setCollectingPayment(prev =>
                            prev ? { ...prev, paymentMode: mode.id as any } : null
                          )
                        }
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 font-bold text-center transition ${
                          isSelected
                            ? 'bg-orange-50 border-orange-500 text-orange-950 ring-1 ring-orange-500'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-orange-600' : 'text-stone-400'}`} />
                        <span className="text-[11px]">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCollectingPayment(null)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-bold"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={isProcessingPayment || collectingPayment.payAmount <= 0}
                onClick={handleConfirmPayment}
                className="px-4 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessingPayment ? 'प्रक्रियाधीन...' : 'भुगतान दर्ज करें एवं रसीद देखें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminFeesTab = React.memo(AdminFeesTabComponent);
