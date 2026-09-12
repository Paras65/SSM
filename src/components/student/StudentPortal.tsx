import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import type { Homework } from '../../types';
import { PragatiPatraModal } from '../admin/PragatiPatraModal';
import { FeeReceiptModal } from '../admin/FeeReceiptModal';
import { StudentIdCardModal } from '../admin/StudentIdCardModal';
import { TransferCertificateModal } from '../admin/TransferCertificateModal';
import {
  ArrowLeft,
  Calendar,
  Receipt,
  CheckCircle2,
  FileText,
  Printer,
  Sparkles,
  Award,
  IdCard,
  BookOpen,
  CheckSquare,
  Square,
  Clock
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const {
    setViewMode,
    currentSchool,
    students,
    selectedStudentId,
    setSelectedStudentId,
    feeRecords,
    reportCards,
    notices
  } = useSchool();

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const studentFee = currentStudent ? feeRecords.find(f => f.studentId === currentStudent.id) : undefined;
  const studentReport = currentStudent ? reportCards.find(r => r.studentId === currentStudent.id) : undefined;

  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [completedHw, setCompletedHw] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (currentStudent) {
      api.getHomework(currentSchool.id, currentStudent.class)
        .then(data => setHomeworkList(data))
        .catch(() => {});
    }
  }, [currentSchool.id, currentStudent?.class]);

  const toggleHwCompleted = (hwId: string) => {
    setCompletedHw(prev => ({
      ...prev,
      [hwId]: !prev[hwId]
    }));
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);

  return (
    <div className="min-h-screen bg-amber-50/40 text-stone-900 flex flex-col">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-800 via-amber-700 to-orange-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setViewMode('public')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-900/80 hover:bg-orange-900 text-xs font-semibold text-amber-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>वेबसाइट पर लौटें</span>
            </button>
            <div className="h-6 w-px bg-orange-700" />
            <div className="flex items-center space-x-2">
              <span className="text-xl">🪷</span>
              <div>
                <h1 className="text-sm font-bold text-amber-100">
                  छात्र एवं अभिभावक पोर्टल (Student & Parent Portal)
                </h1>
                <span className="text-[10px] text-orange-200">
                  सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय
                </span>
              </div>
            </div>
          </div>

          {/* Student Switcher dropdown */}
          {currentStudent && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="hidden sm:inline-block text-orange-200 font-medium">छात्र चुनें:</span>
              <select
                value={currentStudent.id}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-orange-950 border border-orange-700 text-amber-100 text-xs font-semibold focus:outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      {!currentStudent ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-12 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-orange-200 shadow-xl text-center max-w-lg space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-orange-700 flex items-center justify-center text-3xl mx-auto shadow-xs border border-orange-200">
              🏫
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-3 py-1 rounded-full border border-orange-300">
                {currentSchool.prant} • {currentSchool.city}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-2.5">
                {currentSchool.hindiName}
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-1">
                {currentSchool.name}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-xs text-stone-700 leading-relaxed">
              इस विद्यालय शाखा में अभी कोई छात्र पंजीकृत नहीं हैं। प्रशासनिक ERP में लॉगिन करके नवीन भैया/बहिन का प्रवेश दर्ज करें।
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => setViewMode('admin')}
                className="px-5 py-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                प्रशासनिक ERP खोलें →
              </button>
              <button
                onClick={() => setViewMode('public')}
                className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all border border-stone-200"
              >
                वेबसाइट पर लौटें
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Student Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-md">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-1 shadow-md shrink-0 overflow-hidden">
              {currentStudent.photoUrl ? (
                <img
                  src={currentStudent.photoUrl}
                  alt={currentStudent.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-orange-800 flex items-center justify-center text-4xl text-amber-100">
                  {currentStudent.gender === 'Bhaiya' ? '👦' : '👧'}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  {currentStudent.name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  currentStudent.gender === 'Bhaiya' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                }`}>
                  {currentStudent.gender}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
                  अनुक्रमांक: {currentStudent.rollNo}
                </span>
              </div>

              <p className="text-sm font-semibold text-orange-800">
                {currentStudent.class} • वर्ग '{currentStudent.section}' • सत्र 2025-26
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-stone-600">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="block text-stone-400 font-bold uppercase text-[10px]">पिता का नाम</span>
                  <span className="font-semibold text-stone-800">{currentStudent.fatherName}</span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="block text-stone-400 font-bold uppercase text-[10px]">माता का नाम</span>
                  <span className="font-semibold text-stone-800">{currentStudent.motherName}</span>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="block text-stone-400 font-bold uppercase text-[10px]">रक्त समूह (Blood Group)</span>
                  <span className="font-bold text-red-700 font-mono">{currentStudent.bloodGroup}</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                <button
                  onClick={() => setShowIdCardModal(true)}
                  className="px-3.5 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-orange-300 transition-colors shadow-xs"
                >
                  <IdCard className="w-4 h-4 text-orange-700" />
                  <span>छात्र परिचय पत्र (Student ID Card)</span>
                </button>

                <button
                  onClick={() => setShowTcModal(true)}
                  className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-amber-300 transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4 text-orange-700" />
                  <span>स्थानांतरण प्रमाण पत्र (TC देखें)</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Daily Homework & Diary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-700" />
                <span>दैनिक गृहकार्य एवं डायरी (Today's Homework — {currentStudent.class})</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                आचार्यों द्वारा प्रदत्त आज का गृहकार्य एवं स्वाध्याय निर्देश
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-100 text-orange-950 font-bold text-xs rounded-full">
                {homeworkList.length} कार्य सक्रिय
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full">
                {Object.values(completedHw).filter(Boolean).length} पूर्ण
              </span>
            </div>
          </div>

          {homeworkList.length === 0 ? (
            <div className="py-8 text-center text-stone-400">
              <BookOpen className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-xs font-semibold">आज आपकी कक्षा के लिए कोई नया गृहकार्य लंबित नहीं है।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworkList.map(hw => {
                const isDone = !!completedHw[hw.id];
                return (
                  <div
                    key={hw.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-stone-50/70 hover:bg-white border-stone-200 hover:border-orange-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-900">
                        {hw.subject}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-600" />
                        अंतिम तिथि: {hw.dueDate}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold mb-1.5 ${isDone ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                      {hw.title}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed bg-white p-2.5 rounded-xl border border-stone-200 mb-3">
                      {hw.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 text-xs">
                      <span className="text-stone-500 text-[11px]">
                        आचार्य: <strong className="text-stone-700">{hw.assignedBy}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleHwCompleted(hw.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-300'
                        }`}
                      >
                        {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        <span>{isDone ? 'पूर्ण हुआ (Done)' : 'पूर्ण मार्क करें'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3 Columns: Attendance, Fees, Pragati Patra */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Attendance KPI */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">उपस्थिति प्रतिशत</span>
                <div className="p-2 bg-green-100 text-green-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <span className="text-4xl font-black text-green-700">
                {studentReport?.attendancePercentage || 94}%
              </span>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                नियमित उपस्थिति से भैया/बहिन की दिनचर्या एवं संस्कार संवर्धन में निरंतरता बनी रहती है।
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-green-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>उत्कृष्ट उपस्थिति (Eligible for Exam)</span>
            </div>
          </div>

          {/* Fees Status */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">सत्र शुल्क स्थिति</span>
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>

              {studentFee ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-stone-900">
                      ₹ {studentFee.paidAmount}
                    </span>
                    <span className="text-xs text-stone-500">/ ₹ {studentFee.totalAmount}</span>
                  </div>
                  <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    studentFee.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {studentFee.status === 'Paid' ? 'पूर्ण जमा (Paid)' : 'शुल्क लंबित (Pending)'}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-stone-500">कोई शुल्क रिकॉर्ड उपलब्ध नहीं है।</p>
              )}
            </div>

            {studentFee && studentFee.status === 'Paid' && (
              <button
                onClick={() => setShowFeeModal(true)}
                className="mt-4 w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>शुल्क रसीद देखें / डाउनलोड</span>
              </button>
            )}
          </div>

          {/* Academic Report (Pragati Patra) */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">परीक्षा फल (Result)</span>
                <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              {studentReport ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-orange-800">
                      {studentReport.percentage.toFixed(1)}%
                    </span>
                    <span className="text-xs font-bold text-stone-600 uppercase">({studentReport.grade})</span>
                  </div>
                  {studentReport.panchmukhiEvaluation && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                        🏃 शारीरिक: {studentReport.panchmukhiEvaluation.sharirik.grade}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                        🧘 योग: {studentReport.panchmukhiEvaluation.yog.grade}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                        📜 संस्कृत: {studentReport.panchmukhiEvaluation.sanskrit.grade}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-stone-600 mt-2 line-clamp-2 italic">
                    "{studentReport.acharyaRemarks}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-stone-500">
                  इस सत्र का प्रगति पत्र तैयार किया जा रहा है।
                </p>
              )}
            </div>

            {studentReport && (
              <button
                onClick={() => setShowReportModal(true)}
                className="mt-4 w-full py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>प्रगति पत्र (Report Card) देखें</span>
              </button>
            )}
          </div>

        </div>

        {/* Notices & Announcements for Parents */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>अभिभावकों हेतु महत्वपूर्ण सूचनाएं</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.slice(0, 2).map(notice => (
              <div key={notice.id} className="p-4 rounded-xl bg-orange-50/50 border border-orange-200">
                <span className="text-[10px] font-bold uppercase text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                  {notice.category} • {notice.date}
                </span>
                <h4 className="text-sm font-bold text-stone-900 mt-1 mb-1">{notice.title}</h4>
                <p className="text-xs text-stone-600">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
      )}

      {/* Modals */}
      {showReportModal && studentReport && currentStudent && (
        <PragatiPatraModal
          reportCard={studentReport}
          student={currentStudent}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showFeeModal && studentFee && currentStudent && (
        <FeeReceiptModal
          fee={studentFee}
          student={currentStudent}
          onClose={() => setShowFeeModal(false)}
        />
      )}

      {showIdCardModal && currentStudent && (
        <StudentIdCardModal
          student={currentStudent}
          onClose={() => setShowIdCardModal(false)}
        />
      )}

      {showTcModal && currentStudent && (
        <TransferCertificateModal
          student={currentStudent}
          onClose={() => setShowTcModal(false)}
        />
      )}

    </div>
  );
};
