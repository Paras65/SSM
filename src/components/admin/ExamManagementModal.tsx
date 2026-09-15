import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Exam, Student, ExamScheduleItem } from '../../types';
import { X, Calendar, Plus, Trash2, CheckCircle2, FileSpreadsheet, Clock, Award } from 'lucide-react';

interface ExamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmitCard?: (student: Student, exam: Exam) => void;
}

export const ExamManagementModal: React.FC<ExamManagementModalProps> = ({ isOpen, onClose, onOpenAdmitCard }) => {
  const { currentSchool, students } = useSchool();
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState<'exams' | 'marks'>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);

  // New Exam Form state
  const [showAddExam, setShowAddExam] = useState(false);
  const [examTitle, setExamTitle] = useState('अर्धवार्षिक परीक्षा 2025-26');
  const [examTerm, setExamTerm] = useState('Half-Yearly');
  const [examStart, setExamStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [examEnd, setExamEnd] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [scheduleItems, setScheduleItems] = useState<ExamScheduleItem[]>([
    { class: 'Class 8', subject: 'संस्कृत', date: new Date().toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' },
    { class: 'Class 8', subject: 'गणित', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' },
    { class: 'Class 8', subject: 'विज्ञान', date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' }
  ]);

  // Bulk Marks Entry state
  const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const [marksClass, setMarksClass] = useState('Class 8');
  const [marksSubject, setMarksSubject] = useState('गणित');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [studentMarks, setStudentMarks] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await api.getExams(currentSchool.id);
      setExams(data);
      if (data.length > 0 && !selectedExamId) {
        setSelectedExamId(data[0].id);
      }
    } catch (err) {
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

  if (!isOpen) return null;

  const handleAddScheduleItem = () => {
    setScheduleItems(prev => [
      ...prev,
      { class: 'Class 8', subject: '', date: new Date().toISOString().split('T')[0], timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: 'कक्ष 101' }
    ]);
  };

  const handleRemoveScheduleItem = (index: number) => {
    setScheduleItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createExam({
        schoolId: currentSchool.id,
        title: examTitle,
        academicYear: '2025-26',
        term: examTerm,
        classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
        startDate: examStart,
        endDate: examEnd,
        dateSheet: scheduleItems,
        status: 'Scheduled'
      });
      setExams(prev => [created, ...prev]);
      setShowAddExam(false);
      setSelectedExamId(created.id);
    } catch (err: any) {
      alert(err.message || 'परीक्षा निर्माण में त्रुटि आई।');
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('क्या आप इस परीक्षा समय-सारिणी को हटाना चाहते हैं?')) return;
    try {
      await api.deleteExam(id);
      setExams(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert('परीक्षा हटाने में त्रुटि आई।');
    }
  };

  const handleSaveMarks = async () => {
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) {
      alert('कृपया परीक्षा चुनें।');
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

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'अंक सुरक्षित करने में त्रुटि आई।');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(s => s.class === marksClass);
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
                  onClick={() => setShowAddExam(!showAddExam)}
                  className="px-3.5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>नई परीक्षा समय-सारिणी जोड़ें</span>
                </button>
              </div>

              {showAddExam && (
                <form onSubmit={handleCreateExam} className="bg-amber-50/70 p-5 rounded-2xl border border-orange-200 space-y-4">
                  <h4 className="font-bold text-orange-950 text-sm">नवीन परीक्षा समय-सारिणी प्रपत्र</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">परीक्षा शीर्षक</label>
                      <input
                        required
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">सत्र / टर्म</label>
                      <select
                        value={examTerm}
                        onChange={(e) => setExamTerm(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                      >
                        <option value="Unit-Test-1">इकाई परीक्षा 1 (Unit Test 1)</option>
                        <option value="Half-Yearly">अर्धवार्षिक परीक्षा (Half-Yearly)</option>
                        <option value="Unit-Test-2">इकाई परीक्षा 2 (Unit Test 2)</option>
                        <option value="Annual">वार्षिक परीक्षा (Annual Exam)</option>
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
                        className="text-orange-700 font-bold hover:underline"
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
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
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
                      onClick={() => setShowAddExam(false)}
                      className="px-4 py-2 bg-stone-200 text-stone-700 font-bold rounded-xl"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs"
                    >
                      समय-सारिणी सुरक्षित करें
                    </button>
                  </div>
                </form>
              )}

              {/* List of Scheduled Exams */}
              <div className="space-y-3">
                {exams.length === 0 ? (
                  <p className="text-center text-stone-400 py-8">कोई परीक्षा निर्धारित नहीं है।</p>
                ) : (
                  exams.map(exam => (
                    <div key={exam.id} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-900 text-sm">{exam.title}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900">
                              {exam.term}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                              {exam.status}
                            </span>
                          </div>
                          <p className="text-stone-500 text-[11px] mt-0.5">
                            अवधि: {exam.startDate} से {exam.endDate} • शैक्षणिक सत्र {exam.academicYear}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                            title="हटाएं"
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
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">परीक्षा</label>
                    <select
                      value={selectedExamId}
                      onChange={(e) => setSelectedExamId(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-bold"
                    >
                      {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
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
                      onChange={(e) => setMaxMarks(Number(e.target.value) || 100)}
                      className="w-20 px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveMarks}
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'सुरक्षित हो रहा है...' : 'अंक सुरक्षित करें'}</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>अंक सफलतापूर्वक सुरक्षित हो गए हैं एवं प्रगति पत्र में स्वतः जुड़ गए हैं!</span>
                </div>
              )}

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
                      filteredStudents.map(st => {
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
                                type="number"
                                min={0}
                                max={maxMarks}
                                value={studentMarks[st.id] ?? ''}
                                onChange={(e) => {
                                  const val = Math.min(maxMarks, Math.max(0, Number(e.target.value) || 0));
                                  setStudentMarks(prev => ({ ...prev, [st.id]: val }));
                                }}
                                placeholder="0"
                                className="w-20 px-2 py-1 rounded-lg border border-stone-300 font-bold text-xs"
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
                                  className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold rounded-lg text-[10px] transition"
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
    </div>
  );
};

