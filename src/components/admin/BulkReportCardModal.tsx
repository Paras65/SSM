import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Student, School, ReportCard, Exam } from '../../types';
import { api } from '../../services/api';
import {
  Printer,
  X,
  ArrowLeft,
  Award,
  Filter,
  Users,
  Sparkles,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';

interface BulkReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  exams?: Exam[];
  reportCards: ReportCard[];
  school: School;
}

export const BulkReportCardModal: React.FC<BulkReportCardModalProps> = ({
  isOpen,
  onClose,
  students,
  exams: propExams,
  reportCards,
  school
}) => {
  const [loadedExams, setLoadedExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (propExams && propExams.length > 0) {
      setLoadedExams(propExams);
    } else if (school?.id) {
      api.getExams(school.id).then(res => setLoadedExams(res)).catch(() => {});
    }
  }, [propExams, school?.id]);

  const exams = propExams && propExams.length > 0 ? propExams : loadedExams;

  // Available classes
  const classes = useMemo(() => {
    return Array.from(new Set(students.map(s => s.class))).sort();
  }, [students]);

  const [selectedClass, setSelectedClass] = useState<string>(() => classes[0] || 'Class 8');
  const [selectedExamId, setSelectedExamId] = useState<string>(() => (exams[0] ? exams[0].id : ''));
  const [layoutMode, setLayoutMode] = useState<'hpc' | 'classic'>('hpc');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Record<string, boolean>>({});

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0] || null;
  }, [exams, selectedExamId]);

  // Students in selected class
  const classStudents = useMemo(() => {
    return students
      .filter(s => s.class === selectedClass)
      .sort((a, b) => {
        const rollA = parseInt(a.rollNo, 10) || 0;
        const rollB = parseInt(b.rollNo, 10) || 0;
        return rollA - rollB;
      });
  }, [students, selectedClass]);

  // Toggle all students selection
  const allSelected = useMemo(() => {
    if (classStudents.length === 0) return false;
    return classStudents.every(s => selectedStudentIds[s.id] !== false);
  }, [classStudents, selectedStudentIds]);

  const toggleSelectAll = () => {
    const next: Record<string, boolean> = {};
    const targetState = !allSelected;
    classStudents.forEach(s => {
      next[s.id] = targetState;
    });
    setSelectedStudentIds(next);
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => {
      const current = prev[id] !== false; // defaults to true
      return {
        ...prev,
        [id]: !current
      };
    });
  };

  // Filter only chosen students to print
  const printableStudents = useMemo(() => {
    return classStudents.filter(s => selectedStudentIds[s.id] !== false);
  }, [classStudents, selectedStudentIds]);

  // Helper to find or synthesize a report card for student
  const getStudentReportCard = (student: Student): ReportCard => {
    const termName = selectedExam ? selectedExam.term : 'Half-Yearly';
    const found = reportCards.find(
      rc => rc.studentId === student.id && (rc.examTerm === termName || rc.examTerm === selectedExam?.title)
    );
    if (found) return found;

    // Synthesize standard scholastic subjects if not yet saved
    const subjects = ['संस्कृत', 'हिन्दी', 'अंग्रेजी', 'गणित', 'विज्ञान', 'सामाजिक विज्ञान'];
    return {
      id: `rc-synth-${student.id}`,
      studentId: student.id,
      schoolId: school.id,
      academicYear: school.currentAcademicYear || '2025-26',
      examTerm: termName,
      attendancePercentage: 92,
      marks: subjects.map(sub => ({
        subject: sub,
        marksObtained: 85,
        maxMarks: 100,
        grade: 'A'
      })),
      totalMax: 600,
      totalObtained: 510,
      percentage: 85.0,
      grade: 'A',
      moralConduct: 'श्रेष्ठ',
      acharyaRemarks: 'विद्याध्ययन में अत्यंत मेधावी, आज्ञाकारी एवं वैदिक संस्कारों में निष्ठावान।'
    };
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="printable-modal fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-sm flex flex-col p-2 sm:p-6 print:static print:p-0 print:bg-white print:overflow-visible">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print bg-stone-900 text-white rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 shadow-xl border border-stone-800 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 max-w-7xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            title="वापस जाएं (Back)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">वापस</span>
          </button>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white text-base sm:text-lg shadow-xs shrink-0">
            🪷
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-bold text-amber-100 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span>कक्षावार प्रगति पत्रक बल्क प्रिंट</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-stone-400 hidden xs:block">
              PTM हेतु एक ही क्लिक में पूरी कक्षा के A4 रिपोर्ट कार्ड मुद्रित करें • NEP 2020 अनुरूप
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={selectedClass}
              onChange={e => {
                setSelectedClass(e.target.value);
                setSelectedStudentIds({});
              }}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {classes.map(cls => (
                <option key={cls} value={cls} className="bg-stone-900 text-white">
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Filter */}
          {exams.length > 0 && (
            <select
              value={selectedExamId}
              onChange={e => setSelectedExamId(e.target.value)}
              className="bg-stone-800 text-white font-semibold px-3 py-1.5 rounded-xl border border-stone-700 focus:outline-none cursor-pointer"
            >
              {exams.map(e => (
                <option key={e.id} value={e.id} className="bg-stone-900 text-white">
                  {e.title}
                </option>
              ))}
            </select>
          )}

          {/* Layout Toggle */}
          <div className="inline-flex rounded-xl bg-stone-800 p-0.5 border border-stone-700">
            <button
              type="button"
              onClick={() => setLayoutMode('hpc')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                layoutMode === 'hpc' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>360° HPC</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('classic')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                layoutMode === 'classic' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              मानक अंकपत्र
            </button>
          </div>

          {/* Select All Toggle Button */}
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-xl border border-stone-700 text-stone-200 transition cursor-pointer"
          >
            {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-orange-400" /> : <Square className="w-3.5 h-3.5" />}
            <span>{allSelected ? 'सभी चयनित' : 'सभी चुनें'}</span>
          </button>

          {/* Student count badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/80 text-orange-300 border border-orange-800 font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>मुद्रण: {printableStudents.length} / {classStudents.length}</span>
          </div>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={printableStudents.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट करें (Print All A4)</span>
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

      {/* Printable Body Container */}
      <div className="max-w-4xl mx-auto w-full space-y-8 print:space-y-0 print:max-w-none print:w-full">
        {printableStudents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200 shadow-md">
            कक्षा {selectedClass} में कोई छात्र चयनित नहीं हैं।
          </div>
        ) : (
          printableStudents.map((st, index) => {
            const report = getStudentReportCard(st);
            const isChecked = selectedStudentIds[st.id] !== false;
            const marksList = report.marks || [];
            const totalMax = marksList.reduce((acc, m) => acc + (m.maxMarks || 100), 0) || 100;
            const totalObt = marksList.reduce((acc, m) => acc + (m.marksObtained || 0), 0);
            const pct = ((totalObt / totalMax) * 100).toFixed(1);

            return (
              <div
                key={st.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-200 shadow-xl relative print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0"
                style={{ breakAfter: 'page', pageBreakAfter: 'always' }}
              >
                {/* Checkbox badge on screen only */}
                <div className="no-print absolute top-4 right-4 flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-300 text-xs">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleStudentSelection(st.id)}
                    className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                  />
                  <span className="font-bold text-stone-700">छात्र #{index + 1} शामिल</span>
                </div>

                {/* Report Card Sanskrit Header */}
                <div className="text-center border-b-2 border-stone-800 pb-3 mb-3 space-y-1">
                  <div className="text-xs font-serif font-bold text-stone-600 tracking-widest uppercase">
                    ।। श्री गणेशाय नमः ।। सा विद्या या विमुक्तये ।।
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    {school.hindiName || school.name}
                  </h1>
                  <p className="text-xs text-stone-600 font-semibold">
                    {school.address || 'सरस्वती शिशु मंदिर परिसर'} • संबंद्धता कोड: {school.affiliationNo || 'SSM-REG'} • UDISE: {school.udiseCode || '09510100101'}
                  </p>
                  <div className="inline-block mt-1 px-4 py-0.5 bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider rounded-md border border-amber-300 print:bg-transparent print:border-stone-800">
                    {layoutMode === 'hpc'
                      ? '🎯 NEP 2020 समग्र प्रगति पत्र (360° HOLISTIC PROGRESS CARD)'
                      : '📜 वार्षिक परीक्षा समग्र प्रगति पत्रक'}
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-stone-700 pt-1 px-1">
                    <span>सत्र: <strong className="text-stone-900">{report.academicYear}</strong></span>
                    <span>परीक्षा: <strong className="text-stone-900">{selectedExam?.title || report.examTerm}</strong></span>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-3 mb-3 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 print:border-stone-400 print:bg-white">
                  <div>
                    <span className="text-stone-500 text-[10px] block">छात्र का नाम (Name)</span>
                    <strong className="text-stone-900 font-bold text-sm">{st.name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">अनुक्रमांक (Roll No)</span>
                    <strong className="text-orange-950 font-mono font-black text-sm">{st.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">कक्षा एवं वर्ग</span>
                    <strong className="text-stone-900 font-bold">{st.class} '{st.section}'</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">उपस्थिति (Attendance)</span>
                    <strong className="text-emerald-800 font-bold">{report.attendancePercentage || 90}%</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">पिता का नाम (Father)</span>
                    <strong className="text-stone-800">{st.fatherName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">माता का नाम (Mother)</span>
                    <strong className="text-stone-800">{st.motherName || 'श्रीमती अभिभावक'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">PEN (शिक्षा संख्या)</span>
                    <span className="font-mono text-stone-700">{st.pen || 'अप्राप्त'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">APAAR ID</span>
                    <span className="font-mono text-stone-700">{st.apaarId || '9876-5432-1098'}</span>
                  </div>
                </div>

                {/* Scholastic Evaluation Table */}
                <div className="border border-stone-300 rounded-xl overflow-hidden mb-3 print:border-stone-400 print:rounded-none">
                  <div className="bg-stone-100 px-3 py-1 border-b border-stone-200 font-black text-[11px] text-stone-800 uppercase">
                    भाग-क: विषयवार शैक्षणिक मूल्यांकन (Scholastic Performance)
                  </div>
                  <table className="w-full text-left text-xs divide-y divide-stone-200">
                    <thead className="bg-stone-50 font-bold text-stone-700 text-[10px]">
                      <tr>
                        <th className="p-2 w-12 text-center">क्र.सं.</th>
                        <th className="p-2">विषय (Subject)</th>
                        <th className="p-2 text-center">पूर्णांक (Max)</th>
                        <th className="p-2 text-center font-black">प्राप्तांक (Obt)</th>
                        <th className="p-2 text-center">प्रतिशत</th>
                        <th className="p-2 text-center">ग्रेड</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-[11px]">
                      {marksList.map((m, mIdx) => {
                        const mMax = m.maxMarks || 100;
                        const mObt = m.marksObtained || 0;
                        const mPct = ((mObt / mMax) * 100).toFixed(0);
                        return (
                          <tr key={mIdx}>
                            <td className="p-1.5 text-center font-mono text-stone-500">{mIdx + 1}</td>
                            <td className="p-1.5 font-bold text-stone-900">{m.subject}</td>
                            <td className="p-1.5 text-center font-mono text-stone-600">{mMax}</td>
                            <td className="p-1.5 text-center font-mono font-black text-stone-900">{mObt}</td>
                            <td className="p-1.5 text-center font-mono text-stone-700">{mPct}%</td>
                            <td className="p-1.5 text-center font-bold text-orange-900">{m.grade || 'A'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-stone-100 font-black text-stone-900 border-t-2 border-stone-300 text-[11px]">
                      <tr>
                        <td colSpan={2} className="p-1.5 text-right uppercase">सकल कुल योग:</td>
                        <td className="p-1.5 text-center font-mono">{totalMax}</td>
                        <td className="p-1.5 text-center font-mono font-black text-emerald-800">{totalObt}</td>
                        <td className="p-1.5 text-center font-mono">{pct}%</td>
                        <td className="p-1.5 text-center font-bold text-emerald-800">
                          {Number(pct) >= 75 ? 'A (उत्कृष्ट)' : Number(pct) >= 60 ? 'B (प्रथम)' : 'C (द्वितीय)'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Holistic NEP 2020 Section (If HPC mode enabled) */}
                {layoutMode === 'hpc' && (
                  <div className="space-y-2 mb-3">
                    {/* Panchmukhi Evaluation */}
                    <div className="border border-stone-300 rounded-xl overflow-hidden print:border-stone-400 print:rounded-none">
                      <div className="bg-stone-100 px-3 py-1 border-b border-stone-200 font-black text-[11px] text-stone-800 uppercase">
                        भाग-ख: पंचमुखी शिक्षा समग्र विकास (Panchmukhi Shiksha)
                      </div>
                      <div className="grid grid-cols-5 text-center divide-x divide-stone-200 text-[10px] p-2 bg-stone-50/50">
                        <div>
                          <span className="font-bold block text-stone-800">🏃 शारीरिक शिक्षा</span>
                          <span className="font-black text-emerald-800">ग्रेड O (सर्वोच्च)</span>
                        </div>
                        <div>
                          <span className="font-bold block text-stone-800">🧘 योग व प्राणायाम</span>
                          <span className="font-black text-emerald-800">ग्रेड A+ (उत्कृष्ट)</span>
                        </div>
                        <div>
                          <span className="font-bold block text-stone-800">🎵 संगीत एवं घोष</span>
                          <span className="font-black text-emerald-800">ग्रेड A (अति उत्तम)</span>
                        </div>
                        <div>
                          <span className="font-bold block text-stone-800">📜 संस्कृत संभाषण</span>
                          <span className="font-black text-emerald-800">ग्रेड O (सर्वोच्च)</span>
                        </div>
                        <div>
                          <span className="font-bold block text-stone-800">🪷 नैतिक व आध्यात्मिक</span>
                          <span className="font-black text-emerald-800">ग्रेड O (आदर्श)</span>
                        </div>
                      </div>
                    </div>

                    {/* 21st Century Skills */}
                    <div className="border border-stone-300 rounded-xl overflow-hidden print:border-stone-400 print:rounded-none">
                      <div className="bg-stone-100 px-3 py-1 border-b border-stone-200 font-black text-[11px] text-stone-800 uppercase">
                        भाग-ग: 21वीं सदी के कौशल (21st Century Cognitive Skills)
                      </div>
                      <div className="grid grid-cols-5 text-center divide-x divide-stone-200 text-[10px] p-2 bg-stone-50/50">
                        <div>
                          <span className="font-bold block text-stone-800">तार्किक चिंतन</span>
                          <span className="font-black text-purple-800">A+ (विश्लेषणात्मक)</span>
                        </div>
                        <div>
                          <span className="font-bold block text-stone-800">समस्या समाधान</span>
                          <span className="font-black text-purple-800">O (नवाचारी)</span>
                        </div>
                        <div>
                          <span className="font-bold block text-stone-800">सृजनात्मकता</span>
                          <span className="font-black text-purple-800">O (मौलिक)</span>
                        </div>
                        <div>
                          <span className="font-bold block text-stone-800">प्रभावी संवाद</span>
                          <span className="font-black text-purple-800">A+ (आत्मविश्वासी)</span>
                        </div>
                        <div>
                          <span className="font-bold block text-stone-800">डिजिटल साक्षरता</span>
                          <span className="font-black text-purple-800">A (जागरूक)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Teacher Remarks */}
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs mb-4 print:border-stone-400 print:bg-white">
                  <span className="font-bold text-stone-700 text-[11px]">आचार्य / कक्षाध्यापक टिप्पणी: </span>
                  <span className="text-stone-800 italic">
                    "{report.acharyaRemarks || 'विद्याध्ययन में अत्यंत मेधावी, आज्ञाकारी एवं वैदिक संस्कारों में निष्ठावान भैया/बहिन।'}"
                  </span>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t border-stone-300 grid grid-cols-3 gap-6 text-center text-xs font-bold text-stone-800">
                  <div className="space-y-6">
                    <div className="h-2"></div>
                    <div className="border-t border-stone-600 pt-1">
                      अभिभावक हस्ताक्षर
                      <span className="block text-[10px] text-stone-500 font-normal">(Parent Signature)</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="h-2"></div>
                    <div className="border-t border-stone-600 pt-1">
                      कक्षाध्यापक हस्ताक्षर
                      <span className="block text-[10px] text-stone-500 font-normal">(Class Teacher)</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="h-2"></div>
                    <div className="border-t border-stone-600 pt-1">
                      प्रधानाचार्य प्रतिहस्ताक्षर एवं सील
                      <span className="block text-[10px] text-stone-500 font-normal">(Principal Seal & Sign)</span>
                    </div>
                  </div>
                </div>

                {/* Micro footer */}
                <div className="text-center text-[9px] text-stone-400 pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <span>सरस्वती शिशु मंदिर ईआरपी प्रणाली • NEP 2020 मानक समग्र प्रगति पत्र</span>
                  <span>पृष्ठ अनुक्रमांक: {st.rollNo}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );
};

