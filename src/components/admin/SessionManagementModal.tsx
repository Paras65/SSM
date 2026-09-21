import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Exam } from '../../types';
import {
  X,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  RefreshCw,
  Users,
  Receipt,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';

interface SessionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLASS_PROGRESSION_MAP: Record<string, string> = {
  'Shishu Vatika': 'Nursery',
  'Nursery': 'LKG',
  'LKG': 'UKG',
  'UKG': 'Class 1',
  'Class 1': 'Class 2',
  'Class 2': 'Class 3',
  'Class 3': 'Class 4',
  'Class 4': 'Class 5',
  'Class 5': 'Class 6',
  'Class 6': 'Class 7',
  'Class 7': 'Class 8',
  'Class 8': 'Class 9',
  'Class 9': 'Class 10',
  'Class 10': 'Alumni',
  'Class 11': 'Class 12',
  'Class 12': 'Alumni'
};

// Generate academic year options dynamically: current year-1 through current year+2
function generateAcademicYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let y = currentYear - 3; y <= currentYear + 3; y++) {
    years.push(`${y}-${String(y + 1).slice(-2)}`);
  }
  return years;
}

export const SessionManagementModal: React.FC<SessionManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool, students, feeRecords, refreshFromDb } = useSchool();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const academicYears = generateAcademicYears();

  const [activeTab, setActiveTab] = useState<'promotion' | 'fee_rollover' | 'exam_lock' | 'update_year'>('promotion');
  const [fromSession, setFromSession] = useState(() => {
    const cy = new Date().getFullYear();
    return `${cy - 1}-${String(cy).slice(-2)}`;
  });
  const [toSession, setToSession] = useState(currentSchool.currentAcademicYear || (() => {
    const cy = new Date().getFullYear();
    return `${cy}-${String(cy + 1).slice(-2)}`;
  })());

  // Promotion Tab State
  const [selectedClass, setSelectedClass] = useState('Class 5');
  const [targetClass, setTargetClass] = useState('Class 6');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Record<string, boolean>>({});
  const [studentActions, setStudentActions] = useState<Record<string, 'promote' | 'detain' | 'alumni'>>({});
  const [studentNewRollNos, setStudentNewRollNos] = useState<Record<string, string>>({});
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionResult, setPromotionResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fee Rollover State
  const [isRollingOverFees, setIsRollingOverFees] = useState(false);
  const [feeRolloverResult, setFeeRolloverResult] = useState<{ success: boolean; message: string; amount?: number; count?: number } | null>(null);

  // Exam Lock State
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [examActionId, setExamActionId] = useState<string | null>(null);

  // Step 4: Update School currentAcademicYear State
  const [isUpdatingSchoolYear, setIsUpdatingSchoolYear] = useState(false);
  const [schoolYearUpdateResult, setSchoolYearUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  // Filter students by selectedClass
  const classStudents = useMemo(() => {
    return students.filter(s => s.class === selectedClass && (s.status !== 'alumni'));
  }, [students, selectedClass]);

  // Update targetClass automatically when selectedClass changes
  useEffect(() => {
    const next = CLASS_PROGRESSION_MAP[selectedClass] || 'Class 1';
    setTargetClass(next);
    
    // Select all by default and initialize actions
    const newSelected: Record<string, boolean> = {};
    const newActions: Record<string, 'promote' | 'detain' | 'alumni'> = {};
    const newRolls: Record<string, string> = {};

    classStudents.forEach((st, idx) => {
      newSelected[st.id] = true;
      newActions[st.id] = next === 'Alumni' ? 'alumni' : 'promote';
      newRolls[st.id] = String(101 + idx);
    });

    setSelectedStudentIds(newSelected);
    setStudentActions(newActions);
    setStudentNewRollNos(newRolls);
  }, [selectedClass, classStudents.length]);

  // Calculate pending fee arrears for fromSession
  const pendingArrearsList = useMemo(() => {
    const map = new Map<string, { student: any; totalDues: number; paid: number; arrears: number }>();
    feeRecords
      .filter(f => f.academicYear === fromSession && (f.status === 'Pending' || f.status === 'Partial'))
      .forEach(f => {
        const student = students.find(s => s.id === f.studentId);
        const unpaid = Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));
        if (unpaid > 0) {
          const current = map.get(f.studentId) || { student, totalDues: 0, paid: 0, arrears: 0 };
          current.totalDues += f.totalAmount;
          current.paid += f.paidAmount;
          current.arrears += unpaid;
          map.set(f.studentId, current);
        }
      });
    return Array.from(map.values());
  }, [feeRecords, students, fromSession]);

  const totalArrearsAmount = useMemo(() => {
    return pendingArrearsList.reduce((sum, item) => sum + item.arrears, 0);
  }, [pendingArrearsList]);

  // Load exams when on exam_lock tab
  const loadExams = async () => {
    if (!currentSchool.id) return;
    setIsLoadingExams(true);
    try {
      const data = await api.getExams(currentSchool.id);
      setExams(data);
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingExams(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'exam_lock') {
      loadExams();
    }
  }, [isOpen, activeTab, currentSchool.id]);

  if (!isOpen) return null;

  const handleSelectAll = (checked: boolean) => {
    const updated: Record<string, boolean> = {};
    classStudents.forEach(st => {
      updated[st.id] = checked;
    });
    setSelectedStudentIds(updated);
  };

  const handlePromoteBatch = async () => {
    const promotions = classStudents
      .filter(st => selectedStudentIds[st.id])
      .map(st => ({
        studentId: st.id,
        nextClass: studentActions[st.id] === 'promote' ? targetClass : st.class,
        nextSection: st.section || 'A',
        nextRollNo: studentNewRollNos[st.id] || st.rollNo,
        action: studentActions[st.id] || 'promote',
        remarks: `सत्र ${fromSession} से ${toSession} प्रोन्नति`
      }));

    if (promotions.length === 0) {
      showWarning('कृपया कम से कम एक छात्र का चयन करें।');
      return;
    }

    setIsPromoting(true);
    setPromotionResult(null);

    try {
      const res = await api.promoteStudents({
        schoolId: currentSchool.id,
        fromAcademicYear: fromSession,
        toAcademicYear: toSession,
        promotions
      });

      const successMsg = res.message || `${res.count} छात्रों की प्रोन्नति सफलतापूर्वक संपन्न हुई!`;
      setPromotionResult({
        success: true,
        message: successMsg
      });
      showSuccess(successMsg);
      await refreshFromDb();
    } catch (err: any) {
      const errorMsg = err.message || 'छात्र प्रोन्नति विफल रही।';
      setPromotionResult({
        success: false,
        message: errorMsg
      });
      showError(errorMsg);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleRolloverFees = async () => {
    if (pendingArrearsList.length === 0) {
      showInfo(`सत्र ${fromSession} में कोई बकाया शुल्क शेष नहीं है।`);
      return;
    }

    if (!confirm(`क्या आप सत्र ${fromSession} का कुल ₹${totalArrearsAmount.toLocaleString()} बकाया शुल्क नए सत्र ${toSession} में ट्रांसफर करना चाहते हैं?`)) {
      return;
    }

    setIsRollingOverFees(true);
    setFeeRolloverResult(null);

    try {
      const res = await api.rolloverFeeArrears({
        schoolId: currentSchool.id,
        fromAcademicYear: fromSession,
        toAcademicYear: toSession
      });

      const successMsg = res.message || `सत्र ${toSession} में कुल ₹${res.totalArrearsAmount?.toLocaleString()} बकाया शुल्क सफलतापूर्वक रोलओवर किया गया!`;
      setFeeRolloverResult({
        success: true,
        message: successMsg,
        amount: res.totalArrearsAmount,
        count: res.rolledOverCount
      });
      showSuccess(successMsg);
      await refreshFromDb();
    } catch (err: any) {
      const errorMsg = err.message || 'शुल्क रोलओवर में समस्या उत्पन्न हुई।';
      setFeeRolloverResult({
        success: false,
        message: errorMsg
      });
      showError(errorMsg);
    } finally {
      setIsRollingOverFees(false);
    }
  };

  const handleToggleLock = async (exam: Exam) => {
    setExamActionId(exam.id);
    try {
      const targetLock = !exam.isLocked;
      const res = await api.toggleExamLock(exam.id, targetLock);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, isLocked: res.isLocked } : e));
      showSuccess(res.isLocked ? 'परीक्षा सफलतापूर्वक लॉक (स्थिर) कर दी गई है।' : 'परीक्षा सफलतापूर्वक अनलॉक कर दी गई है।');
    } catch (err: any) {
      showError(err.message || 'परीक्षा लॉक बदलने में विफल।');
    } finally {
      setExamActionId(null);
    }
  };

  const handleUpdateSchoolYear = async () => {
    if (!currentSchool.id || !toSession) return;
    if (currentSchool.currentAcademicYear === toSession) {
      showInfo(`विद्यालय का वर्तमान शैक्षणिक सत्र पहले से ही ${toSession} है।`);
      return;
    }
    setIsUpdatingSchoolYear(true);
    setSchoolYearUpdateResult(null);
    try {
      await api.updateSchool(currentSchool.id, { currentAcademicYear: toSession });
      setSchoolYearUpdateResult({
        success: true,
        message: `✅ विद्यालय का शैक्षणिक सत्र सफलतापूर्वक ${toSession} में अद्यतन किया गया!`
      });
      showSuccess(`विद्यालय का वर्तमान शैक्षणिक सत्र ${toSession} में अद्यतन किया गया।`);
      await refreshFromDb();
    } catch (err: any) {
      const msg = err.message || 'शैक्षणिक सत्र अद्यतन विफल।';
      setSchoolYearUpdateResult({ success: false, message: msg });
      showError(msg);
    } finally {
      setIsUpdatingSchoolYear(false);
    }
  };

  const availableClasses = Object.keys(CLASS_PROGRESSION_MAP);


  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
              🎓
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                शैक्षणिक सत्र एवं छात्र प्रोन्नति प्रबंधन
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-400/30">
                  {currentSchool.hindiName}
                </span>
              </h2>
              <p className="text-xs text-orange-200 mt-0.5">
                वार्षिक सत्र परिवर्तन, कक्षा प्रोन्नति, बकाया शुल्क अंतरण एवं परीक्षा स्थिरीकरण
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Session Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <Calendar className="w-4 h-4 text-orange-700" />
            <span>सत्र चक्र चयन:</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-stone-600 font-medium">वर्तमान / पूर्व सत्र:</label>
            <select
              value={fromSession}
              onChange={e => setFromSession(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-stone-800 focus:ring-2 focus:ring-orange-500"
            >
              {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <ArrowRight className="w-4 h-4 text-orange-600" />

            <label className="text-stone-600 font-medium">नया लक्ष्य सत्र:</label>
            <select
              value={toSession}
              onChange={e => setToSession(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white font-bold text-orange-900 focus:ring-2 focus:ring-orange-500"
            >
              {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* 3-Step Wizard Roadmap Banner */}
        <div className="bg-white px-5 sm:px-6 py-2.5 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto text-[11px] sm:text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('promotion')}
            className={`flex items-center gap-1.5 font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'promotion' ? 'text-orange-800' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeTab === 'promotion' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-200 text-stone-700'
            }`}>
              1
            </span>
            <span>चरण १: छात्र प्रोन्नति</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

          <button
            type="button"
            onClick={() => setActiveTab('fee_rollover')}
            className={`flex items-center gap-1.5 font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'fee_rollover' ? 'text-orange-800' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeTab === 'fee_rollover' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-200 text-stone-700'
            }`}>
              2
            </span>
            <span>चरण २: बकाया शुल्क अंतरण</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

          <button
            type="button"
            onClick={() => setActiveTab('exam_lock')}
            className={`flex items-center gap-1.5 font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'exam_lock' ? 'text-orange-800' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeTab === 'exam_lock' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-200 text-stone-700'
            }`}>
              3
            </span>
            <span>चरण ३: परीक्षा परिणाम स्थिरीकरण</span>
          </button>

          <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

          <button
            type="button"
            onClick={() => setActiveTab('update_year')}
            className={`flex items-center gap-1.5 font-bold transition cursor-pointer shrink-0 ${
              activeTab === 'update_year' ? 'text-orange-800' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeTab === 'update_year' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-stone-200 text-stone-700'
            }`}>
              4
            </span>
            <span>चरण ४: विद्यालय सत्र अद्यतन</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 sm:px-6 text-xs sm:text-sm font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('promotion')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'promotion'
                ? 'border-orange-700 text-orange-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>1. कक्षा-वार छात्र प्रोन्नति ({classStudents.length})</span>
            <HelpTooltip
              title="छात्र प्रोन्नति"
              content="वार्षिक परीक्षा परिणाम के बाद ही छात्रों को प्रमोट करें। 10वीं/12वीं के उत्तीर्ण छात्र Alumni बन जाएंगे और पिछला शैक्षणिक इतिहास सुरक्षित रहेगा।"
            />
          </button>
          <button
            onClick={() => setActiveTab('fee_rollover')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'fee_rollover'
                ? 'border-orange-700 text-orange-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>2. बकाया शुल्क अंतरण (₹{totalArrearsAmount.toLocaleString()})</span>
            <HelpTooltip
              title="बकाया शुल्क अंतरण"
              content="गत सत्र का बकाया शुल्क नए सत्र में स्थानांतरित करें। सिस्टम छात्र-वार जांच करता है ताकि एक ही सत्र का बकाया दो बार न जुड़े।"
            />
          </button>
          <button
            onClick={() => setActiveTab('exam_lock')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'exam_lock'
                ? 'border-orange-700 text-orange-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. परीक्षा परिणाम स्थिरीकरण / लॉक</span>
            <HelpTooltip
              title="परीक्षा स्थिरीकरण"
              content="परीक्षा को लॉक करने के बाद शिक्षक या अन्य उपयोगकर्ता अंकों में अनपेक्षित फेरबदल नहीं कर सकेंगे।"
            />
          </button>
          <button
            onClick={() => setActiveTab('update_year')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 shrink-0 ${
              activeTab === 'update_year'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>4. विद्यालय सत्र अद्यतन 🎯</span>
            <HelpTooltip
              title="विद्यालय शैक्षणिक सत्र अद्यतन"
              content="छात्र प्रोन्नति और शुल्क रोलओवर के बाद यह अंतिम चरण है। इससे विद्यालय का डिफ़ॉल्ट शैक्षणिक सत्र नए सत्र में अद्यतन हो जाता है जो सभी डैशबोर्ड और रिपोर्ट में प्रदर्शित होगा।"
            />
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-stone-900">
          
          {/* ================= TAB 1: STUDENT PROMOTION ================= */}
          {activeTab === 'promotion' && (
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-stone-700">कक्षा का चयन करें:</div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-stone-900 text-sm focus:ring-2 focus:ring-orange-500"
                    >
                      {availableClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                    <div className="text-xs font-bold text-orange-900">
                      प्रस्तावित लक्ष्य: <span className="bg-orange-200 px-2 py-1 rounded-lg text-sm">{targetClass}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePromoteBatch}
                    disabled={isPromoting || classStudents.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    {isPromoting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                    <span>चयनित छात्रों को प्रमोट करें</span>
                  </button>
                </div>
              </div>

              {promotionResult && (
                <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                  promotionResult.success ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : 'bg-red-50 border border-red-300 text-red-800'
                }`}>
                  {promotionResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                  <span>{promotionResult.message}</span>
                </div>
              )}

              {classStudents.length === 0 ? (
                <div className="p-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <Users className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                  <p className="font-semibold text-sm">इस कक्षा में कोई सक्रिय छात्र नामांकित नहीं है।</p>
                </div>
              ) : (
                <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="max-h-[50vh] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-stone-100 sticky top-0 text-stone-700 font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-3 w-10">
                            <input
                              type="checkbox"
                              checked={classStudents.every(s => selectedStudentIds[s.id])}
                              onChange={e => handleSelectAll(e.target.checked)}
                              className="rounded text-orange-600 focus:ring-orange-500"
                            />
                          </th>
                          <th className="p-3">वर्तमान अनुक्रमांक</th>
                          <th className="p-3">छात्र / छात्रा का नाम</th>
                          <th className="p-3">पिता का नाम</th>
                          <th className="p-3">कार्यवाही (Action)</th>
                          <th className="p-3">नया रोल नंबर</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {classStudents.map(st => (
                          <tr key={st.id} className="hover:bg-amber-50/50 transition">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={Boolean(selectedStudentIds[st.id])}
                                onChange={e => setSelectedStudentIds(prev => ({ ...prev, [st.id]: e.target.checked }))}
                                className="rounded text-orange-600 focus:ring-orange-500"
                              />
                            </td>
                            <td className="p-3 font-semibold text-stone-600">{st.rollNo}</td>
                            <td className="p-3 font-bold text-stone-900">{st.name}</td>
                            <td className="p-3 text-stone-600">{st.fatherName}</td>
                            <td className="p-3">
                              <select
                                value={studentActions[st.id] || 'promote'}
                                onChange={e => setStudentActions(prev => ({ ...prev, [st.id]: e.target.value as 'promote' | 'detain' | 'alumni' }))}
                                className="px-2 py-1 rounded-lg border border-stone-300 font-medium text-xs bg-white focus:ring-2 focus:ring-orange-500"
                              >
                                <option value="promote">प्रमोट करें ({targetClass})</option>
                                <option value="detain">सत्र दोहराव (Detain)</option>
                                <option value="alumni">उत्तीर्ण / पूर्व छात्र (Alumni)</option>
                              </select>
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={studentNewRollNos[st.id] || ''}
                                onChange={e => setStudentNewRollNos(prev => ({ ...prev, [st.id]: e.target.value }))}
                                className="w-20 px-2 py-1 rounded-lg border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-orange-500"
                                placeholder="नया रोल"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: FEE ARREARS ROLLOVER ================= */}
          {activeTab === 'fee_rollover' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-black text-amber-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-orange-700" />
                    सत्र {fromSession} से {toSession} का बकाया शुल्क अंतरण
                  </h3>
                  <p className="text-xs text-stone-600">
                    पूर्व सत्र में शेष बकाये को नए सत्र में <code className="bg-amber-100 px-1 py-0.5 rounded text-orange-800 font-bold">Past Session Arrears</code> मद में स्वतः ट्रांसफर करें।
                  </p>
                </div>
                <button
                  onClick={handleRolloverFees}
                  disabled={isRollingOverFees || pendingArrearsList.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  {isRollingOverFees ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                  <span>बकाया शुल्क अग्रसारित करें</span>
                </button>
              </div>

              {feeRolloverResult && (
                <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                  feeRolloverResult.success ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : 'bg-red-50 border border-red-300 text-red-800'
                }`}>
                  {feeRolloverResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                  <span>{feeRolloverResult.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-semibold text-stone-500">कुल बकाया छात्र</span>
                  <p className="text-2xl font-black text-stone-900 mt-1">{pendingArrearsList.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-semibold text-stone-500">कुल अंतरण योग्य बकाया राशि</span>
                  <p className="text-2xl font-black text-red-700 mt-1">₹{totalArrearsAmount.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-semibold text-stone-500">सत्र स्थिति</span>
                  <p className="text-sm font-bold text-emerald-700 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> डुप्लीकेशन-रहित (Idempotent)
                  </p>
                </div>
              </div>

              {pendingArrearsList.length === 0 ? (
                <div className="p-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="font-semibold text-sm">सत्र {fromSession} में कोई बकाया शुल्क शेष नहीं है। सभी शुल्क चुकता हैं!</p>
                </div>
              ) : (
                <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="max-h-[40vh] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-stone-100 sticky top-0 text-stone-700 font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-3">छात्र का नाम</th>
                          <th className="p-3">कक्षा</th>
                          <th className="p-3">कुल देय</th>
                          <th className="p-3">प्राप्त</th>
                          <th className="p-3 text-red-700">शेष बकाया (Arrears)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white">
                        {pendingArrearsList.map(item => (
                          <tr key={item.student?.id || Math.random()} className="hover:bg-amber-50/50 transition">
                            <td className="p-3 font-bold text-stone-900">{item.student?.name || 'अज्ञात छात्र'}</td>
                            <td className="p-3 text-stone-600">{item.student?.class || '-'}</td>
                            <td className="p-3 font-semibold text-stone-700">₹{item.totalDues.toLocaleString()}</td>
                            <td className="p-3 text-emerald-700 font-semibold">₹{item.paid.toLocaleString()}</td>
                            <td className="p-3 text-red-700 font-black">₹{item.arrears.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: EXAM LOCKING ================= */}
          {activeTab === 'exam_lock' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-stone-900">परीक्षा परिणाम स्थिरीकरण (Exam Freezing & Historical Protection)</h3>
                  <p className="text-xs text-stone-600">
                    परीक्षा परिणाम घोषित होने के बाद परीक्षा को लॉक करें। लॉक होने पर आचार्यों द्वारा अंकों में कोई आकस्मिक फेरबदल नहीं हो सकेगा।
                  </p>
                </div>
                <button
                  onClick={loadExams}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingExams ? 'animate-spin' : ''}`} />
                  <span>ताज़ा करें</span>
                </button>
              </div>

              {exams.length === 0 ? (
                <div className="p-12 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                  <Calendar className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                  <p className="font-semibold text-sm">इस विद्यालय में अभी कोई परीक्षा दर्ज नहीं है।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exams.map(exam => (
                    <div
                      key={exam.id}
                      className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        exam.isLocked ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-900">{exam.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            exam.isLocked ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {exam.isLocked ? '🔒 लॉक (स्थिर)' : '🔓 संपादन योग्य'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 flex items-center gap-2">
                          <span>सत्र: {exam.academicYear}</span>
                          <span>•</span>
                          <span>{exam.term}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleLock(exam)}
                        disabled={examActionId === exam.id}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs ${
                          exam.isLocked
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-red-700 hover:bg-red-800 text-white'
                        }`}
                      >
                        {examActionId === exam.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : exam.isLocked ? (
                          <Unlock className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        <span>{exam.isLocked ? 'अनलॉक करें' : 'लॉक करें'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: UPDATE SCHOOL ACADEMIC YEAR ================= */}
          {activeTab === 'update_year' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <h3 className="text-sm sm:text-base font-black text-emerald-900 flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-emerald-700" />
                  चरण ४ (अंतिम): विद्यालय का वर्तमान शैक्षणिक सत्र अद्यतन करें
                </h3>
                <p className="text-xs text-stone-600">
                  यह अंतिम चरण है। छात्र प्रोन्नति और बकाया शुल्क रोलओवर के बाद विद्यालय का डिफ़ॉल्ट शैक्षणिक सत्र भी अद्यतन करें।
                  इसके बाद सभी डैशबोर्ड, रिपोर्ट और शुल्क काउंटर नए सत्र <strong>{toSession}</strong> पर स्वतः स्विच हो जाएंगे।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-stone-200">
                  <span className="text-xs font-semibold text-stone-500">वर्तमान सक्रिय सत्र</span>
                  <p className="text-xl font-black text-orange-800 mt-1">{currentSchool.currentAcademicYear || '—'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-emerald-300">
                  <span className="text-xs font-semibold text-stone-500">नया लक्ष्य सत्र</span>
                  <p className="text-xl font-black text-emerald-800 mt-1">{toSession}</p>
                </div>
              </div>

              {schoolYearUpdateResult && (
                <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                  schoolYearUpdateResult.success ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' : 'bg-red-50 border border-red-300 text-red-800'
                }`}>
                  {schoolYearUpdateResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
                  <span>{schoolYearUpdateResult.message}</span>
                </div>
              )}

              {currentSchool.currentAcademicYear === toSession ? (
                <div className="p-5 text-center text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200 font-semibold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  विद्यालय का वर्तमान शैक्षणिक सत्र पहले से ही <strong className="ml-1">{toSession}</strong> है। कोई कार्यवाही आवश्यक नहीं।
                </div>
              ) : (
                <button
                  onClick={handleUpdateSchoolYear}
                  disabled={isUpdatingSchoolYear}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {isUpdatingSchoolYear ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  <span>विद्यालय का शैक्षणिक सत्र {toSession} में अद्यतन करें</span>
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500 font-medium">
            सभी प्रोन्नति व रोलओवर रिकॉर्ड्स डिजिटल ऑडिट लॉग में दर्ज होते हैं।
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};

export default SessionManagementModal;

