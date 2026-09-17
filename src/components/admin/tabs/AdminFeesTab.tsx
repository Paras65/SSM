import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import { exportFeesToCSV } from '../../../utils/csvExport';
import { SSM_CLASSES, type Student, type FeeRecord } from '../../../types';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightCircle,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Edit3,
  History,
  IndianRupee,
  MessageSquare,
  Plus,
  Printer,
  Receipt,
  RotateCcw,
  Search,
  Trash2,
  User,
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
  requirePro?: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
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

export const AdminFeesTabComponent: React.FC<AdminFeesTabProps> = ({
  totalFeeCollected,
  totalFeePending,
  onOpenFeeModal,
  onOpenWhatsAppAlert
}) => {
  const {
    students,
    currentSchool,
    feeRecords,
    markFeePaid,
    addFeeRecord,
    updateFeeRecord,
    deleteFeeRecord,
    refreshFromDb
  } = useSchool();
  const { showSuccess, showError, showInfo } = useToast();

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Paid' | 'Pending' | 'Partial'>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Interactive Fee Collection Dialog State
  const [collectingPayment, setCollectingPayment] = useState<CollectPaymentState | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // New Fee Demand Modal State
  const [showAddDemandModal, setShowAddDemandModal] = useState(false);
  const [newDemandStudentId, setNewDemandStudentId] = useState('');
  const [newDemandYear, setNewDemandYear] = useState(() => currentSchool.currentAcademicYear || '2025-26');
  const [newDemandTerm, setNewDemandTerm] = useState('प्रथम त्रैमासिक शिक्षण शुल्क (Q1)');
  const [newDemandAmount, setNewDemandAmount] = useState(1500);

  // Edit Fee Demand Modal State
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [editTerm, setEditTerm] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [editYear, setEditYear] = useState('');

  // Arrears Rollover Modal State
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [fromRolloverYear, setFromRolloverYear] = useState('2024-25');
  const [toRolloverYear, setToRolloverYear] = useState('2025-26');
  const [isRollingOver, setIsRollingOver] = useState(false);

  // Student Fee History Modal State
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);

  // Delete Confirmation Modal State
  const [deletingFee, setDeletingFee] = useState<{ fee: FeeRecord; studentName: string } | null>(null);

  // Student map for fast lookup
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.id, s));
    return map;
  }, [students]);

  // Derived available academic years for filtering
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    if (currentSchool.currentAcademicYear) set.add(currentSchool.currentAcademicYear);
    feeRecords.forEach(f => {
      if (f.academicYear) set.add(f.academicYear);
    });
    set.add('2024-25');
    set.add('2025-26');
    set.add('2026-27');
    return Array.from(set).sort().reverse();
  }, [currentSchool, feeRecords]);

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

      // Academic Year filter
      if (selectedYear !== 'ALL' && fee.academicYear !== selectedYear) {
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
  }, [feeRecords, studentMap, selectedClass, selectedStatus, selectedYear, searchQuery]);

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
      showSuccess(`₹${payAmount} का शुल्क भुगतान सफलतापूर्वक दर्ज किया गया!`);
      onOpenFeeModal({ fee: updatedFee, student });
    } catch (err: any) {
      showError('भुगतान दर्ज करने में त्रुटि: ' + (err.message || 'त्रुटि'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Create Fee Demand
  const handleCreateDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDemandStudentId) {
      showError('कृपया छात्र का चयन करें।');
      return;
    }
    if (newDemandAmount <= 0) {
      showError('कृपया वैध शुल्क राशि दर्ज करें।');
      return;
    }

    try {
      await addFeeRecord({
        studentId: newDemandStudentId,
        academicYear: newDemandYear,
        term: newDemandTerm,
        totalAmount: Number(newDemandAmount),
        paidAmount: 0,
        status: 'Pending'
      });
      const st = studentMap.get(newDemandStudentId);
      showSuccess(`'${st ? st.name : 'छात्र'}' के लिए ₹${newDemandAmount} की शुल्क मांग सृजित की गई!`);
      setShowAddDemandModal(false);
      setNewDemandStudentId('');
      setNewDemandAmount(1500);
    } catch (err: any) {
      showError('शुल्क मांग सृजित करने में त्रुटि: ' + (err.message || 'त्रुटि'));
    }
  };

  // Open Edit Fee Demand
  const handleOpenEdit = (fee: FeeRecord) => {
    setEditingFee(fee);
    setEditTerm(fee.term);
    setEditAmount(fee.totalAmount);
    setEditYear(fee.academicYear);
  };

  // Save Edit Fee Demand
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFee) return;
    if (editAmount < (editingFee.paidAmount || 0)) {
      showError(`कुल देय राशि प्राप्त राशि (₹${editingFee.paidAmount || 0}) से कम नहीं हो सकती।`);
      return;
    }

    const newStatus = (editingFee.paidAmount || 0) >= editAmount ? 'Paid' : (editingFee.paidAmount || 0) > 0 ? 'Partial' : 'Pending';

    try {
      await updateFeeRecord(editingFee.id, {
        term: editTerm,
        totalAmount: Number(editAmount),
        academicYear: editYear,
        status: newStatus
      });
      showSuccess('शुल्क मांग विवरण सफलतापूर्वक अद्यतन किया गया!');
      setEditingFee(null);
    } catch (err: any) {
      showError('शुल्क विवरण अद्यतन विफल: ' + (err.message || 'त्रुटि'));
    }
  };

  // Execute Arrears Rollover
  const handleExecuteRollover = async () => {
    if (fromRolloverYear === toRolloverYear) {
      showError('प्रारंभिक और लक्ष्य सत्र भिन्न होने चाहिए।');
      return;
    }
    setIsRollingOver(true);
    try {
      const res = await api.rolloverArrears({
        schoolId: currentSchool.id,
        fromAcademicYear: fromRolloverYear,
        toAcademicYear: toRolloverYear
      });
      showSuccess(res.message || `बकाया रोलओवर पूर्ण: ${res.rolledOverCount} छात्रों के लिए ₹${res.totalArrearsAmount}`);
      await refreshFromDb();
      setShowRolloverModal(false);
    } catch (err: any) {
      showError('रोलओवर विफल: ' + (err.message || 'त्रुटि'));
    } finally {
      setIsRollingOver(false);
    }
  };

  // Delete Fee Record
  const handleConfirmDelete = async () => {
    if (!deletingFee) return;
    try {
      await deleteFeeRecord(deletingFee.fee.id);
      showSuccess('शुल्क रिकॉर्ड सफलतापूर्वक हटा दिया गया!');
      setDeletingFee(null);
    } catch (err: any) {
      showError('शुल्क रिकॉर्ड हटाने में त्रुटि: ' + (err.message || 'त्रुटि'));
    }
  };

  // Student Fee History records
  const studentHistoryFees = useMemo(() => {
    if (!historyStudent) return [];
    return feeRecords
      .filter(f => f.studentId === historyStudent.id)
      .sort((a, b) => (b.academicYear || '').localeCompare(a.academicYear || ''));
  }, [historyStudent, feeRecords]);

  const historyTotals = useMemo(() => {
    let due = 0;
    let paid = 0;
    studentHistoryFees.forEach(f => {
      due += f.totalAmount || 0;
      paid += f.paidAmount || 0;
    });
    return { due, paid, balance: Math.max(0, due - paid) };
  }, [studentHistoryFees]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-orange-600" />
            <span>शुल्क प्रबंधन एवं रसीद निर्गमन (Fee Counter & Arrears)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            मासिक एवं त्रैमासिक शिक्षण शुल्क, बकाया रोलओवर, एवं तत्काल रसीद प्रिंटिंग।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowAddDemandModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition"
            title="नवीन शुल्क मांग प्रविष्टि सृजित करें"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नवीन शुल्क मांग (Add Demand)</span>
          </button>

          <button
            onClick={() => setShowRolloverModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs cursor-pointer transition"
            title="विगत सत्र का बकाया वर्तमान सत्र में अग्रसारित करें"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>बकाया रोलओवर (Rollover)</span>
          </button>

          <button
            onClick={() => {
              exportFeesToCSV(filteredFees.length > 0 ? filteredFees : feeRecords, students);
              showSuccess('शुल्क रजिस्टर CSV / Excel सफलतापूर्वक डाउनलोड हो गया!');
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded-lg font-bold shadow-xs cursor-pointer transition"
            title="Export Fee Register to CSV"
          >
            <Download className="w-3.5 h-3.5 text-green-400" />
            <span>शुल्क CSV निर्यात</span>
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
          <span className="text-[11px] text-rose-700 font-medium">{stats.pendingCount} छात्रों पर शेष</span>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase">विद्यालय समग्र स्थिति</span>
            <Banknote className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-900 mt-1">
            ₹{totalFeeCollected.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">कुल संचित संग्रह</span>
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

        {/* Academic Year Filter */}
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी सत्र (All Academic Years)</option>
          {availableYears.map(yr => (
            <option key={yr} value={yr}>सत्र: {yr}</option>
          ))}
        </select>

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
        {(searchQuery || selectedClass !== 'ALL' || selectedStatus !== 'ALL' || selectedYear !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('ALL');
              setSelectedStatus('ALL');
              setSelectedYear('ALL');
            }}
            className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>हटाएं</span>
          </button>
        )}
      </div>

      {/* Fees Roster Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
            <tr>
              <th className="p-3">रसीद सं.</th>
              <th className="p-3">अनुक्रमांक</th>
              <th className="p-3">छात्र का नाम</th>
              <th className="p-3">कक्षा</th>
              <th className="p-3">सत्र</th>
              <th className="p-3">शुल्क मद (Term)</th>
              <th className="p-3">कुल देय (Due)</th>
              <th className="p-3">जमा (Paid)</th>
              <th className="p-3">शेष (Balance)</th>
              <th className="p-3">स्थिति</th>
              <th className="p-3 text-right">कार्य (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredFees.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-stone-500">
                  {searchQuery || selectedClass !== 'ALL' || selectedStatus !== 'ALL' || selectedYear !== 'ALL'
                    ? 'खोज एवं फ़िल्टर के अनुरूप कोई शुल्क रिकॉर्ड नहीं मिला।'
                    : 'कोई शुल्क रिकॉर्ड उपलब्ध नहीं है। "नवीन शुल्क मांग" से प्रविष्टि जोड़ें।'}
                </td>
              </tr>
            ) : (
              filteredFees.map(fee => {
                const student = studentMap.get(fee.studentId);
                if (!student) return null;

                const balance = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));

                return (
                  <tr key={fee.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3 font-mono text-stone-500">
                      {fee.receiptNo ? (
                        <span className="text-orange-950 font-bold">{fee.receiptNo}</span>
                      ) : (
                        <span className="text-stone-400 italic">देय शेष</span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-stone-900">{student.rollNo}</td>
                    <td className="p-3 font-semibold text-stone-900">
                      <button
                        onClick={() => setHistoryStudent(student)}
                        className="hover:text-orange-600 underline text-left font-bold cursor-pointer"
                        title="छात्र का सम्पूर्ण शुल्क इतिहास देखें"
                      >
                        {student.name}
                      </button>
                    </td>
                    <td className="p-3 text-stone-600">{student.class} '{student.section}'</td>
                    <td className="p-3 font-mono text-[11px] text-stone-600">{fee.academicYear || '2025-26'}</td>
                    <td className="p-3 text-stone-800 font-medium">{fee.term}</td>
                    <td className="p-3 font-bold text-stone-900">₹{(fee.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-emerald-700">₹{(fee.paidAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-rose-700">
                      {balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          fee.status === 'Paid'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : fee.status === 'Partial'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {fee.status === 'Paid'
                          ? 'पूर्ण भुगतान'
                          : fee.status === 'Partial'
                          ? 'आंशिक भुगतान'
                          : 'लंबित (Due)'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      {/* History Button */}
                      <button
                        onClick={() => setHistoryStudent(student)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded cursor-pointer inline-flex items-center"
                        title="छात्र का सम्पूर्ण शुल्क इतिहास देखें"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(fee)}
                        className="p-1.5 text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded cursor-pointer inline-flex items-center"
                        title="शुल्क मांग संशोधित करें"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {fee.status !== 'Paid' ? (
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp Reminder (No Paywall) */}
                          <button
                            onClick={() => {
                              onOpenWhatsAppAlert({
                                title: 'शुल्क बकाया WhatsApp अभिभावक सूचना',
                                recipientName: student.name,
                                recipientPhone: student.contact,
                                studentClass: student.class,
                                defaultMessage: `🚩 *सादर नमस्ते जी* 🚩\n*${currentSchool.hindiName || currentSchool.name}*\n--------------------------------\n*शुल्क बकाया सूचना:*\nआपके पाल्य/पाल्या *${student.name}* (अनुक्रमांक: ${student.rollNo}, कक्षा: ${student.class}) का *${fee.term}* का कुल बकाया शुल्क *₹${balance.toLocaleString('en-IN')}* देय है।\n\nकृपया ससमय विद्यालय कार्यालय अथवा ऑनलाइन माध्यम से शुल्क जमा कर रसीद प्राप्त करें।\n\nधन्यवाद!\n— लेखा विभाग, ${currentSchool.hindiName || currentSchool.name}`
                              });
                            }}
                            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                            title="Send WhatsApp Payment Reminder"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-700" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Collect Fee Button */}
                          <button
                            onClick={() => handleOpenCollectModal(fee, student)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center gap-1 transition"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>शुल्क जमा करें</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenFeeModal({ fee, student })}
                          className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold text-[11px] flex items-center gap-1 inline-flex cursor-pointer transition"
                        >
                          <Printer className="w-3 h-3" />
                          <span>रसीद देखें / प्रिंट</span>
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeletingFee({ fee, studentName: student.name })}
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

      {/* ================= MODAL 1: ADD FEE DEMAND ================= */}
      {showAddDemandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-orange-700 to-amber-600 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-300" />
                <h4 className="font-bold text-sm">नवीन शुल्क मांग सृजित करें (New Fee Demand)</h4>
              </div>
              <button
                onClick={() => setShowAddDemandModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  छात्र का चयन करें (Select Student) *
                </label>
                <select
                  value={newDemandStudentId}
                  onChange={e => setNewDemandStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- छात्र चुनें --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      [{s.rollNo}] {s.name} - {s.class} '{s.section}'
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    शैक्षणिक सत्र (Academic Year) *
                  </label>
                  <select
                    value={newDemandYear}
                    onChange={e => setNewDemandYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    {availableYears.filter(y => y !== 'ALL').map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    शुल्क राशि (Amount ₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newDemandAmount}
                    onChange={e => setNewDemandAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  शुल्क मद / अवधि (Fee Term / Head) *
                </label>
                <input
                  type="text"
                  required
                  value={newDemandTerm}
                  onChange={e => setNewDemandTerm(e.target.value)}
                  placeholder="उदा. प्रथम त्रैमासिक शिक्षण शुल्क (Q1)..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    'प्रथम त्रैमासिक (Q1)',
                    'द्वितीय त्रैमासिक (Q2)',
                    'तृतीय त्रैमासिक (Q3)',
                    'चतुर्थ त्रैमासिक (Q4)',
                    'वार्षिक शिक्षण शुल्क',
                    'क्रीड़ा व गतिविधि निधि'
                  ].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewDemandTerm(preset)}
                      className="px-2 py-0.5 bg-stone-100 hover:bg-orange-100 hover:text-orange-950 text-stone-700 rounded text-[10px] cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDemandModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg cursor-pointer transition shadow-xs"
                >
                  शुल्क मांग सृजित करें (Create Demand)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: EDIT FEE DEMAND ================= */}
      {editingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-stone-800 to-stone-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-yellow-300" />
                <h4 className="font-bold text-sm">शुल्क मांग संशोधित करें (Edit Fee Demand)</h4>
              </div>
              <button
                onClick={() => setEditingFee(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                <p className="text-[11px] text-stone-500">छात्र विवरण:</p>
                <p className="font-bold text-stone-900 mt-0.5">
                  {studentMap.get(editingFee.studentId)?.name} (अनुक्रमांक: {studentMap.get(editingFee.studentId)?.rollNo})
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                  अब तक जमा राशि: ₹{editingFee.paidAmount || 0} ({editingFee.status})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  शुल्क मद / शीर्षक (Fee Term) *
                </label>
                <input
                  type="text"
                  required
                  value={editTerm}
                  onChange={e => setEditTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    कुल देय राशि (Amount ₹) *
                  </label>
                  <input
                    type="number"
                    min={editingFee.paidAmount || 1}
                    required
                    value={editAmount}
                    onChange={e => setEditAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    सत्र (Academic Year) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editYear}
                    onChange={e => setEditYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFee(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg cursor-pointer transition shadow-xs"
                >
                  परिवर्तन सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ARREARS ROLLOVER ================= */}
      {showRolloverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-yellow-300" />
                <h4 className="font-bold text-sm">विगत सत्र बकाया रोलओवर (Arrears Rollover)</h4>
              </div>
              <button
                onClick={() => setShowRolloverModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                <span className="font-bold">⚠️ रोलओवर कार्यप्रणाली:</span> यह सुविधा चयनित विगत सत्र के सभी अप्रदत्त एवं आंशिक बकाया शुल्कों की गणना करके, लक्ष्य सत्र में प्रत्येक छात्र के नाम पर 'Past Session Arrears' के रूप में स्वतः प्रविष्टि दर्ज करती है।
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    विगत सत्र (From Session) *
                  </label>
                  <select
                    value={fromRolloverYear}
                    onChange={e => setFromRolloverYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium"
                  >
                    {availableYears.filter(y => y !== 'ALL').map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    वर्तमान/नवीन सत्र (To Session) *
                  </label>
                  <select
                    value={toRolloverYear}
                    onChange={e => setToRolloverYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white font-medium"
                  >
                    {availableYears.filter(y => y !== 'ALL').map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRolloverModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  disabled={isRollingOver}
                  onClick={handleExecuteRollover}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer transition shadow-xs inline-flex items-center gap-1.5"
                >
                  {isRollingOver && <Clock className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isRollingOver ? 'रोलओवर प्रगति पर...' : 'रोलओवर निष्पादित करें'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: STUDENT FEE HISTORY DRAWER ================= */}
      {historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-orange-800 to-stone-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-700/80 flex items-center justify-center text-lg">
                  🎓
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    {historyStudent.name} — सम्पूर्ण शुल्क इतिहास (Fee Ledger)
                  </h4>
                  <p className="text-[11px] text-orange-200">
                    अनुक्रमांक: {historyStudent.rollNo} | कक्षा: {historyStudent.class} '{historyStudent.section}' | दूरभाष: {historyStudent.contact}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryStudent(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Lifetime Financial Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">कुल देय (Total Billed)</span>
                  <p className="text-base font-black text-stone-900 mt-1">₹{historyTotals.due.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">कुल प्रदत्त (Paid)</span>
                  <p className="text-base font-black text-emerald-800 mt-1">₹{historyTotals.paid.toLocaleString('en-IN')}</p>
                </div>
                <div className={`p-3 rounded-xl border ${historyTotals.balance > 0 ? 'bg-rose-50 border-rose-300' : 'bg-stone-50 border-stone-200'}`}>
                  <span className={`text-[10px] font-bold uppercase ${historyTotals.balance > 0 ? 'text-rose-700' : 'text-stone-500'}`}>कुल बकाया (Balance)</span>
                  <p className={`text-base font-black mt-1 ${historyTotals.balance > 0 ? 'text-rose-800' : 'text-stone-700'}`}>
                    ₹{historyTotals.balance.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Fee Ledger Table */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">सत्र</th>
                      <th className="p-2.5">शुल्क मद</th>
                      <th className="p-2.5">देय</th>
                      <th className="p-2.5">जमा</th>
                      <th className="p-2.5">शेष</th>
                      <th className="p-2.5">स्थिति</th>
                      <th className="p-2.5 text-right">रसीद</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {studentHistoryFees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-stone-400">
                          इस छात्र के लिए कोई शुल्क मांग दर्ज नहीं है।
                        </td>
                      </tr>
                    ) : (
                      studentHistoryFees.map(fee => {
                        const bal = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));
                        return (
                          <tr key={fee.id} className="hover:bg-stone-50">
                            <td className="p-2.5 font-mono text-stone-600">{fee.academicYear}</td>
                            <td className="p-2.5 font-semibold text-stone-900">{fee.term}</td>
                            <td className="p-2.5 font-bold text-stone-900">₹{(fee.totalAmount || 0).toLocaleString('en-IN')}</td>
                            <td className="p-2.5 font-bold text-emerald-700">₹{(fee.paidAmount || 0).toLocaleString('en-IN')}</td>
                            <td className="p-2.5 font-bold text-rose-700">{bal > 0 ? `₹${bal.toLocaleString('en-IN')}` : '—'}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                fee.status === 'Paid' ? 'bg-green-100 text-green-800' : fee.status === 'Partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {fee.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right">
                              {fee.paidAmount > 0 && (
                                <button
                                  onClick={() => onOpenFeeModal({ fee, student: historyStudent })}
                                  className="px-2 py-0.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold text-[10px] cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>रसीद</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: DELETE CONFIRMATION ================= */}
      {deletingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">शुल्क मांग हटाएं?</h4>
                <p className="text-xs text-stone-500 mt-0.5">यह क्रिया अपरिवर्तनीय है।</p>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-700">
              <p><span className="font-semibold">छात्र:</span> {deletingFee.studentName}</p>
              <p><span className="font-semibold">शुल्क मद:</span> {deletingFee.fee.term}</p>
              <p><span className="font-semibold">कुल राशि:</span> ₹{deletingFee.fee.totalAmount}</p>
              <p><span className="font-semibold">सत्र:</span> {deletingFee.fee.academicYear}</p>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setDeletingFee(null)}
                className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer transition shadow-xs"
              >
                रिकॉर्ड हटाएं (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= INTERACTIVE FEE COUNTER COLLECTION MODAL ================= */}
      {collectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-orange-700 to-amber-600 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-300" />
                <h4 className="font-bold text-sm">शुल्क पटल - तत्काल रसीद काउंटर (Fee Counter)</h4>
              </div>
              <button
                onClick={() => setCollectingPayment(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-stone-900">{collectingPayment.student.name}</h5>
                  <p className="text-stone-500">
                    अनुक्रमांक: {collectingPayment.student.rollNo} • कक्षा: {collectingPayment.student.class} '{collectingPayment.student.section}'
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-500 uppercase">कुल देय राशि</span>
                  <p className="text-base font-black text-stone-900">
                    ₹{collectingPayment.fee.totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">पूर्व में जमा</span>
                  <p className="text-sm font-black text-emerald-800 mt-0.5">
                    ₹{(collectingPayment.fee.paidAmount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">वर्तमान शेष</span>
                  <p className="text-sm font-black text-rose-800 mt-0.5">
                    ₹{Math.max(0, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0)).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  प्राप्त की जाने वाली राशि (Amount to Collect ₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, collectingPayment.fee.totalAmount - (collectingPayment.fee.paidAmount || 0))}
                  value={collectingPayment.payAmount}
                  onChange={e =>
                    setCollectingPayment({
                      ...collectingPayment,
                      payAmount: Math.max(0, Number(e.target.value))
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  भुगतान माध्यम (Payment Mode) *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Cash', 'Online UPI', 'Cheque', 'Bank Transfer'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setCollectingPayment({ ...collectingPayment, paymentMode: mode })
                      }
                      className={`py-2 text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        collectingPayment.paymentMode === mode
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {mode === 'Cash' ? 'नकद (Cash)' : mode === 'Online UPI' ? 'UPI' : mode === 'Cheque' ? 'चेक' : 'बैंक'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  संदर्भ / यूटीआर संख्या (Transaction / Ref No.)
                </label>
                <input
                  type="text"
                  placeholder="उदा. UPI-987654321 / Cheque 102938..."
                  value={collectingPayment.referenceNo}
                  onChange={e =>
                    setCollectingPayment({
                      ...collectingPayment,
                      referenceNo: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCollectingPayment(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment || collectingPayment.payAmount <= 0}
                  onClick={handleConfirmPayment}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg cursor-pointer transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>
                    {isProcessingPayment
                      ? 'प्रक्रियाधीन...'
                      : `₹${collectingPayment.payAmount.toLocaleString('en-IN')} जमा कर रसीद प्रिंट करें`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminFeesTab = React.memo(AdminFeesTabComponent);
