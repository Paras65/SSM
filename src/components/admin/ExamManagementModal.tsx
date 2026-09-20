import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Exam, Student, ExamScheduleItem } from '../../types';
import { SSM_STANDARD_CLASSES } from '../../types';
import { X, Calendar, Plus, Trash2, CheckCircle2, FileSpreadsheet, Clock, Award, AlertTriangle, Lock, Unlock, Edit3 } from 'lucide-react';

interface ExamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmitCard?: (student: Student, exam: Exam) => void;
  onOpenBulkReportCard?: () => void;
}

export const ExamManagementModal: React.FC<ExamManagementModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmitCard,
  onOpenBulkReportCard
}) => {
  const { currentSchool, students, reportCards, refreshFromDb } = useSchool();
  const { showError, showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<'exams' | 'marks'>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // New / Edit Exam Form state
  const [showAddExam, setShowAddExam] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examTitle, setExamTitle] = useState('अर्धवार्षिक परीक्षा 2025-26');
  const [examAcademicYear, setExamAcademicYear] = useState(() => currentSchool.currentAcademicYear || '2025-26');
  const [examTerm, setExamTerm] = useState('Half-Yearly');
  const [examStart, setExamStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [examEnd, setExamEnd] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [scheduleItems, setScheduleItems] = useState<ExamScheduleItem[]>([
    { class: 'Class 8', subject: 'संस्कृत', date: new Date().toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' },
    { class: 'Class 8', subject: 'गणित', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' },
    { class: 'Class 8', subject: 'विज्ञान', date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' }
  ]);
  const [deleteConfirmExam, setDeleteConfirmExam] = useState<Exam | null>(null);
  const [isTogglingLock, setIsTogglingLock] = useState<string | null>(null);

  // Bulk Marks Entry state
  const CLASSES = SSM_STANDARD_CLASSES;
  const [marksClass, setMarksClass] = useState('Class 8');
  const [marksSubject, setMarksSubject] = useState('गणित');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [studentMarks, setStudentMarks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await api.getExams(currentSchool.id);
      setExams(data);
      if (data.length > 0 && !selectedExamId) {
        setSelectedExamId(data[0].id);
      }
    } catch (err) {
      setFetchError(true);
      showError('परीक्षा डेटा लोड करने में त्रुटि। कृपया पुनः प्रयास करें।');
      console.error('Failed to fetch exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExams();
    }
  }, [isOpen, currentSchool.id]);

  // Pre-fill student marks from existing report cards when exam, class, or subject changes
  const filteredStudents = students.filter(s => s.class === marksClass);

  useEffect(() => {
    if (!selectedExamId || !marksSubject) return;
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) return;

    const initialMarks: Record<string, number> = {};
    filteredStudents.forEach(st => {
      const report = reportCards.find(
        rc => rc.studentId === st.id && (rc.examTerm === exam.term || rc.examTerm === exam.title)
      );
      if (report && Array.isArray(report.marks)) {
        const foundSub = report.marks.find(
          m => m.subject.trim().toLowerCase() === marksSubject.trim().toLowerCase()
        );
        if (foundSub) {
          initialMarks[st.id] = foundSub.marksObtained;
          if (foundSub.maxMarks && foundSub.maxMarks !== maxMarks) {
            setMaxMarks(foundSub.maxMarks);
          }
        }
      }
    });
    setStudentMarks(initialMarks);
  }, [selectedExamId, marksClass, marksSubject, exams, reportCards]);

  if (!isOpen) return null;

  const openNewExamForm = () => {
    setEditingExam(null);
    setExamTitle(`अर्धवार्षिक परीक्षा ${currentSchool.currentAcademicYear || '2025-26'}`);
    setExamAcademicYear(currentSchool.currentAcademicYear || '2025-26');
    setExamTerm('Half-Yearly');
    setExamStart(new Date().toISOString().split('T')[0]);
    setExamEnd(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setScheduleItems([
      { class: 'Class 8', subject: 'संस्कृत', date: new Date().toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' },
      { class: 'Class 8', subject: 'गणित', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' },
      { class: 'Class 8', subject: 'विज्ञान', date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' }
    ]);
    setShowAddExam(true);
  };

  const openEditExamForm = (exam: Exam) => {
    if (exam.isLocked) {
      showError('यह परीक्षा लॉक (स्थिर) है। इसके विवरण में परिवर्तन वर्जित है।');
      return;
    }
    setEditingExam(exam);
    setExamTitle(exam.title);
    setExamAcademicYear(exam.academicYear || currentSchool.currentAcademicYear || '2025-26');
    setExamTerm(exam.term);
    setExamStart(exam.startDate);
    setExamEnd(exam.endDate);
    setScheduleItems(exam.dateSheet && exam.dateSheet.length > 0 ? [...exam.dateSheet] : [
      { class: 'Class 8', subject: 'संस्कृत', date: exam.startDate, timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' }
    ]);
    setShowAddExam(true);
  };

  const handleAddScheduleItem = () => {
    setScheduleItems(prev => [
      ...prev,
      { class: 'Class 8', subject: '', date: new Date().toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' }
    ]);
  };

  const handleRemoveScheduleItem = (index: number) => {
    setScheduleItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExam) {
        const updated = await api.updateExam(editingExam.id, {
          title: examTitle,
          academicYear: examAcademicYear,
          term: examTerm,
          startDate: examStart,
          endDate: examEnd,
          dateSheet: scheduleItems
        });
        setExams(prev => prev.map(e => e.id === editingExam.id ? updated : e));
        showSuccess('परीक्षा समय-सारिणी सफलतापूर्वक अद्यतित की गई।');
        setEditingExam(null);
      } else {
        const created = await api.createExam({
          schoolId: currentSchool.id,
          title: examTitle,
          academicYear: examAcademicYear,
          term: examTerm,
          classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
          startDate: examStart,
          endDate: examEnd,
          dateSheet: scheduleItems,
          status: 'Scheduled'
        });
        setExams(prev => [created, ...prev]);
        showSuccess('परीक्षा समय-सारिणी सफलतापूर्वक जोड़ी गई।');
        setSelectedExamId(created.id);
      }
      setShowAddExam(false);
    } catch (err: any) {
      showError(err.message || 'परीक्षा सुरक्षित करने में त्रुटि आई।');
    }
  };

  const handleToggleLock = async (exam: Exam) => {
    setIsTogglingLock(exam.id);
    try {
      const res = await api.toggleExamLock(exam.id, !exam.isLocked);
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, isLocked: res.isLocked } : e));
      showSuccess(res.isLocked ? 'परीक्षा सफलतापूर्वक लॉक (स्थिर) कर दी गई है।' : 'परीक्षा सफलतापूर्वक अनलॉक कर दी गई है।');
    } catch (err: any) {
      showError(err.message || 'परीक्षा लॉक स्थिति बदलने में त्रुटि।');
    } finally {
      setIsTogglingLock(null);
    }
  };

  const confirmDeleteExam = async () => {
    if (!deleteConfirmExam) return;
    try {
      await api.deleteExam(deleteConfirmExam.id);
      setExams(prev => prev.filter(e => e.id !== deleteConfirmExam.id));
      showSuccess('परीक्षा सफलतापूर्वक हटाई गई।');
      setDeleteConfirmExam(null);
    } catch (err: any) {
      showError(err.message || 'परीक्षा हटाने में त्रुटि आई।');
    }
  };

  const handleSaveMarks = async () => {
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) {
      showError('कृपया परीक्षा चुनें।');
      return;
    }
    if (exam.isLocked) {
      showError('यह परीक्षा लॉक (स्थिर) है। इसके अंकों में परिवर्तन वर्जित है।');
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const marksList = Object.entries(studentMarks).map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained: Number(marksObtained) || 0,
        maxMarks
      }));

      await api.submitBulkMarks({
        schoolId: currentSchool.id,
        examTerm: exam.term,
        academicYear: exam.academicYear,
        subject: marksSubject,
        marksList
      });

      if (refreshFromDb) {
        refreshFromDb();
      }

      setSaveSuccess(true);
      showSuccess('अंक सफलतापूर्वक सुरक्षित हो गए हैं एवं प्रगति पत्र में स्वतः जुड़ गए हैं!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      showError(err.message || 'अंक सुरक्षित करने में त्रुटि आई।');
    } finally {
      setIsSaving(false);
    }
  };

  const activeExam = exams.find(e => e.id === selectedExamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl font-black">
              📝
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                परीक्षा प्रबंधन एवं अंक प्रविष्टि (Exam Management & Gradebook)
              </h3>
              <p className="text-xs text-stone-500">
                {currentSchool.hindiName} • समय-सारिणी (Date Sheet) व अंक प्रविष्टि
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 pt-3 pb-2 border-b border-stone-100 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'exams'
                ? 'bg-orange-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>परीक्षा समय-सारिणी (Date Sheet)</span>
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'marks'
                ? 'bg-orange-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>मार्क्स एंट्री मैट्रिक्स (Marks Entry)</span>
          </button>

          {onOpenBulkReportCard && (
            <button
              type="button"
              onClick={onOpenBulkReportCard}
              className="ml-auto px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="कक्षावार सभी छात्रों के 360° समग्र प्रगति पत्रक (HPC Report Cards) एक क्लिक में प्रिंट करें"
            >
              <Award className="w-4 h-4" />
              <span>🖨️ बल्क प्रगति पत्र (Bulk HPC)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
          {/* ================= TAB: EXAMS & DATE SHEETS ================= */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-700">
                  सक्रिय परीक्षाएं ({exams.length})
                </span>
                <button
                  onClick={openNewExamForm}
                  className="px-3.5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>नई परीक्षा समय-सारिणी जोड़ें</span>
                </button>
              </div>

              {showAddExam && (
                <form onSubmit={handleSaveExam} className="bg-amber-50/70 p-5 rounded-2xl border border-orange-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-orange-950 text-sm">
                      {editingExam ? 'परीक्षा समय-सारिणी संपादन प्रपत्र (Edit Date Sheet)' : 'नवीन परीक्षा समय-सारिणी प्रपत्र (New Date Sheet)'}
                    </h4>
                    {editingExam && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                        ID: {editingExam.id}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">परीक्षा शीर्षक</label>
                      <input
                        required
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        placeholder="उदा. वार्षिक परीक्षा 2025-26"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">शैक्षणिक सत्र (Academic Year)</label>
                      <input
                        required
                        value={examAcademicYear}
                        onChange={(e) => setExamAcademicYear(e.target.value)}
                        placeholder="2025-26"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">सत्र / टर्म</label>
                      <select
                        value={examTerm}
                        onChange={(e) => setExamTerm(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium"
                      >
                        <option value="Traimasik">त्रैमासिक परीक्षा (Traimasik / Quarterly)</option>
                        <option value="Half-Yearly">अर्धवार्षिक परीक्षा (Ardhvarshik / Half-Yearly)</option>
                        <option value="Annual">वार्षिक परीक्षा (Varshik / Annual Exam)</option>
                        <option value="Unit-Test-1">इकाई परीक्षा 1 (Unit Test 1)</option>
                        <option value="Unit-Test-2">इकाई परीक्षा 2 (Unit Test 2)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">आरंभ व समाप्ति तिथि</label>
                      <div className="flex gap-1">
                        <input
                          type="date"
                          value={examStart}
                          onChange={(e) => setExamStart(e.target.value)}
                          className="w-1/2 px-2 py-2 rounded-xl border border-stone-300 bg-white text-[11px]"
                        />
                        <input
                          type="date"
                          value={examEnd}
                          onChange={(e) => setExamEnd(e.target.value)}
                          className="w-1/2 px-2 py-2 rounded-xl border border-stone-300 bg-white text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedule Items Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-stone-800">परीक्षा विषय एवं समय-सारिणी (Date Sheet)</label>
                      <button
                        type="button"
                        onClick={handleAddScheduleItem}
                        className="text-orange-700 font-bold hover:underline cursor-pointer"
                      >
                        + विषय जोड़ें
                      </button>
                    </div>

                    <div className="space-y-2">
                      {scheduleItems.map((item, idx) => (
                        <div key={idx} className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-xl border border-orange-200">
                          <input
                            placeholder="कक्षा (Class 8)"
                            value={item.class}
                            onChange={(e) => {
                              const val = e.target.value;
                              setScheduleItems(prev => prev.map((it, i) => i === idx ? { ...it, class: val } : it));
                            }}
                            className="w-24 px-2 py-1.5 rounded-lg border border-stone-300"
                          />
                          <input
                            placeholder="विषय (Subject)"
                            value={item.subject}
                            onChange={(e) => {
                              const val = e.target.value;
                              setScheduleItems(prev => prev.map((it, i) => i === idx ? { ...it, subject: val } : it));
                            }}
                            className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg border border-stone-300 font-bold"
                          />
                          <input
                            type="date"
                            value={item.date}
                            onChange={(e) => {
                              const val = e.target.value;
                              setScheduleItems(prev => prev.map((it, i) => i === idx ? { ...it, date: val } : it));
                            }}
                            className="w-32 px-2 py-1.5 rounded-lg border border-stone-300"
                          />
                          <input
                            placeholder="समय (Timing)"
                            value={item.timing}
                            onChange={(e) => {
                              const val = e.target.value;
                              setScheduleItems(prev => prev.map((it, i) => i === idx ? { ...it, timing: val } : it));
                            }}
                            className="w-36 px-2 py-1.5 rounded-lg border border-stone-300"
                          />
                          <input
                            type="number"
                            placeholder="पूर्णांक"
                            value={item.maxMarks}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 100;
                              setScheduleItems(prev => prev.map((it, i) => i === idx ? { ...it, maxMarks: val } : it));
                            }}
                            className="w-16 px-2 py-1.5 rounded-lg border border-stone-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScheduleItem(idx)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddExam(false);
                        setEditingExam(null);
                      }}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl cursor-pointer"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs cursor-pointer transition"
                    >
                      {editingExam ? 'परिवर्तन सुरक्षित करें' : 'समय-सारिणी सुरक्षित करें'}
                    </button>
                  </div>
                </form>
              )}

              {/* List of Scheduled Exams */}
              <div className="space-y-3">
                {loading ? (
                  <p className="text-center text-stone-400 py-8">परीक्षा डेटा लोड हो रहा है...</p>
                ) : fetchError ? (
                  <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-stone-600">
                    <AlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-1" />
                    <p className="font-bold text-red-700">परीक्षा डेटा लोड करने में त्रुटि</p>
                    <p className="text-xs text-stone-400 mt-1">सर्वर से संपर्क नहीं हो सका।</p>
                    <button
                      onClick={fetchExams}
                      className="mt-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      🔄 पुनः प्रयास करें
                    </button>
                  </div>
                ) : exams.length === 0 ? (
                  <p className="text-center text-stone-400 py-8">कोई परीक्षा निर्धारित नहीं है।</p>
                ) : (
                  exams.map(exam => (
                    <div key={exam.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-stone-900 text-sm">{exam.title}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900">
                              {exam.term}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                              {exam.status}
                            </span>
                            {exam.isLocked ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>स्थिर/लॉक (Locked)</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                <Unlock className="w-2.5 h-2.5" />
                                <span>खुला (Editable)</span>
                              </span>
                            )}
                          </div>
                          <p className="text-stone-500 text-[11px] mt-0.5">
                            अवधि: {exam.startDate} से {exam.endDate} • शैक्षणिक सत्र {exam.academicYear}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle Lock Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleLock(exam)}
                            disabled={isTogglingLock === exam.id}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              exam.isLocked
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
                            }`}
                            title={exam.isLocked ? 'अनलॉक करें (संपादन सक्षम करें)' : 'स्थिर/लॉक करें (अंक प्रविष्टि फ्रीज करें)'}
                          >
                            {exam.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            <span>{exam.isLocked ? 'अनलॉक' : 'लॉक'}</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditExamForm(exam)}
                            disabled={exam.isLocked}
                            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition flex items-center gap-1 border border-stone-300 cursor-pointer"
                            title={exam.isLocked ? 'परीक्षा लॉक है, संपादन वर्जित है' : 'परीक्षा संपादित करें'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>संपादन</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmExam(exam)}
                            disabled={exam.isLocked}
                            className="p-1.5 text-stone-400 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-red-50 transition cursor-pointer"
                            title={exam.isLocked ? 'परीक्षा लॉक है, हटाना वर्जित है' : 'हटाएं'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Date Sheet Table */}
                      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                              <th className="p-2.5">दिनांक</th>
                              <th className="p-2.5">कक्षा</th>
                              <th className="p-2.5">विषय</th>
                              <th className="p-2.5">समय</th>
                              <th className="p-2.5">पूर्णांक</th>
                              <th className="p-2.5">कक्ष</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {exam.dateSheet?.map((item, i) => (
                              <tr key={i} className="hover:bg-amber-50/20">
                                <td className="p-2.5 font-semibold text-stone-800">{item.date}</td>
                                <td className="p-2.5 text-stone-600">{item.class}</td>
                                <td className="p-2.5 font-bold text-stone-900">{item.subject}</td>
                                <td className="p-2.5 text-stone-600">{item.timing}</td>
                                <td className="p-2.5 font-semibold text-orange-800">{item.maxMarks}</td>
                                <td className="p-2.5 text-stone-500">{item.roomNo || 'कक्ष 101'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB: BULK MARKS ENTRY ================= */}
          {activeTab === 'marks' && (
            <div className="space-y-4">
              {activeExam?.isLocked && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 font-bold rounded-xl flex items-center gap-2 text-xs">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    यह परीक्षा ('{activeExam.title}') लॉक (स्थिर) कर दी गई है। प्राप्तांक केवल देखे जा सकते हैं, किसी भी प्रकार का संपादन वर्जित है।
                  </span>
                </div>
              )}

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">परीक्षा</label>
                    <select
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-bold"
                    >
                      {exams.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.title} {e.isLocked ? '(🔒 Locked)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">कक्षा</label>
                    <select
                      value={marksClass}
                      onChange={(e) => setMarksClass(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-bold"
                    >
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">विषय</label>
                    <input
                      value={marksSubject}
                      onChange={(e) => setMarksSubject(e.target.value)}
                      className="w-28 px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">पूर्णांक</label>
                    <input
                      type="number"
                      value={maxMarks}
                      disabled={activeExam?.isLocked}
                      onChange={(e) => setMaxMarks(Number(e.target.value) || 100)}
                      className="w-20 px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-bold disabled:bg-stone-100 disabled:text-stone-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveMarks}
                  disabled={isSaving || activeExam?.isLocked}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSaving
                      ? 'सुरक्षित हो रहा है...'
                      : activeExam?.isLocked
                      ? '🔒 परीक्षा लॉक है'
                      : 'अंक सुरक्षित करें'}
                  </span>
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>अंक सफलतापूर्वक सुरक्षित हो गए हैं एवं प्रगति पत्र में स्वतः जुड़ गए हैं!</span>
                </div>
              )}

              {/* Fast Keyboard Navigation Tip */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 px-3.5 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
                <span>💡 <strong>तीव्र कीबोर्ड प्रविष्टि:</strong> अंक लिखकर कीबोर्ड का <strong>Enter (↵)</strong> या <strong>↓ (Down Arrow)</strong> दबाएं — कर्सर स्वतः अगले छात्र पर जाएगा!</span>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px] uppercase">
                      <th className="p-3">अनुक्रमांक</th>
                      <th className="p-3">छात्र का नाम</th>
                      <th className="p-3">पूर्णांक</th>
                      <th className="p-3">प्राप्तांक</th>
                      <th className="p-3">प्रतिशत</th>
                      <th className="p-3">ग्रेड</th>
                      <th className="p-3 text-right">प्रवेश पत्र</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400">
                          इस कक्षा में कोई छात्र नहीं मिले।
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st, idx) => {
                        const marks = studentMarks[st.id] ?? 0;
                        const pct = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
                        const grade = pct >= 90 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 45 ? 'C' : 'D';

                        return (
                          <tr key={st.id} className="hover:bg-amber-50/20">
                            <td className="p-3 font-bold font-mono text-stone-800">{st.rollNo}</td>
                            <td className="p-3 font-bold text-stone-900">{st.name}</td>
                            <td className="p-3 font-semibold text-stone-600">{maxMarks}</td>
                            <td className="p-3">
                              <input
                                id={`exam-marks-input-${idx}`}
                                type="number"
                                min={0}
                                max={maxMarks}
                                disabled={activeExam?.isLocked}
                                value={studentMarks[st.id] ?? ''}
                                onFocus={(e) => e.target.select()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const next = document.getElementById(`exam-marks-input-${idx + 1}`);
                                    if (next) (next as HTMLInputElement).focus();
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    const prev = document.getElementById(`exam-marks-input-${idx - 1}`);
                                    if (prev) (prev as HTMLInputElement).focus();
                                  }
                                }}
                                onChange={(e) => {
                                  const val = Math.min(maxMarks, Math.max(0, Number(e.target.value) || 0));
                                  setStudentMarks(prev => ({ ...prev, [st.id]: val }));
                                }}
                                placeholder="0"
                                className="w-20 px-2 py-1 rounded-lg border border-stone-300 font-bold text-xs disabled:bg-stone-100 disabled:text-stone-400 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                              />
                            </td>
                            <td className="p-3 font-bold text-orange-900">{pct.toFixed(1)}%</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-100">
                                {grade}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {activeExam && onOpenAdmitCard && (
                                <button
                                  onClick={() => onOpenAdmitCard(st, activeExam)}
                                  className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  प्रवेश पत्र 🪪
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
          )}
        </div>
      </div>

      {/* Styled Delete Confirmation Dialog */}
      {deleteConfirmExam && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">परीक्षा समय-सारिणी हटाएं</h4>
                <p className="text-xs text-stone-500">स्थायी विलोपन पुष्टि</p>
              </div>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              क्या आप निश्चित रूप से <strong>"{deleteConfirmExam.title}"</strong> ({deleteConfirmExam.term} - सत्र {deleteConfirmExam.academicYear}) को स्थायी रूप से हटाना चाहते हैं?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmExam(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={confirmDeleteExam}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                हां, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

