import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import type { Student, ReportCard } from '../../types';
import {
  X,
  Printer,
  Download,
  Filter,
  RefreshCw,
  Award,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Search,
  ArrowLeft
} from 'lucide-react';
import { HelpTooltip } from '../common/HelpTooltip';
import {
  StudentResultRow,
  ClassTabulationStatistics,
  DEFAULT_SUBJECT_LIST,
  computeStudentResultRow,
  computeClassStatistics,
  generateTabulationCSV
} from '../../utils/tabulationRegister';

interface TabulationRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TabulationRegisterModal: React.FC<TabulationRegisterModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool, students, reportCards: contextReports, refreshFromDb } = useSchool();
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Filters State
  const [selectedClass, setSelectedClass] = useState<string>('Class 6');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('वार्षिक परीक्षा');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(
    currentSchool.currentAcademicYear || '2025-26'
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [reports, setReports] = useState<ReportCard[]>(contextReports || []);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch reports on filter change
  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(currentSchool.id, selectedTerm, selectedAcademicYear);
      setReports(data || []);
    } catch {
      setReports(contextReports || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, currentSchool.id, selectedTerm, selectedAcademicYear]);

  // Available classes in school
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    students.forEach(s => {
      if (s.class) classSet.add(s.class);
    });
    if (classSet.size === 0) {
      return ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    }
    return Array.from(classSet).sort();
  }, [students]);

  // Filter students for the selected class and section
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        if (s.class !== selectedClass) return false;
        if (selectedSection !== 'all' && s.section !== selectedSection) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = (s.name || '').toLowerCase().includes(q);
          const matchRoll = (s.rollNo || '').toLowerCase().includes(q);
          const matchFather = (s.fatherName || '').toLowerCase().includes(q);
          if (!matchName && !matchRoll && !matchFather) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const rollA = parseInt(a.rollNo, 10) || 0;
        const rollB = parseInt(b.rollNo, 10) || 0;
        return rollA - rollB;
      });
  }, [students, selectedClass, selectedSection, searchTerm]);

  // Discover all distinct subjects for this class from reports
  const classSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    const studentIds = new Set(filteredStudents.map(s => s.id));

    reports.forEach(r => {
      if (studentIds.has(r.studentId) && Array.isArray(r.marks)) {
        r.marks.forEach(m => {
          if (m.subject) subjectSet.add(m.subject);
        });
      }
    });

    if (subjectSet.size === 0) {
      return DEFAULT_SUBJECT_LIST;
    }
    return Array.from(subjectSet);
  }, [filteredStudents, reports]);

  // Compute student result rows
  const studentResults: StudentResultRow[] = useMemo(() => {
    return filteredStudents.map(student => {
      const report = reports.find(
        r =>
          r.studentId === student.id &&
          (r.examTerm === selectedTerm || !r.examTerm) &&
          (r.academicYear === selectedAcademicYear || !r.academicYear)
      );
      return computeStudentResultRow(student, report, classSubjects);
    });
  }, [filteredStudents, reports, selectedTerm, selectedAcademicYear, classSubjects]);

  // Aggregate Class Statistics
  const statistics: ClassTabulationStatistics = useMemo(() => {
    return computeClassStatistics(studentResults);
  }, [studentResults]);

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (studentResults.length === 0) {
      alert('निर्यात करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।');
      return;
    }

    const csvContent = generateTabulationCSV(studentResults, classSubjects);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `SSM_TR_Sheet_${selectedClass}_${selectedTerm}_${selectedAcademicYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-300 w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden">
        
        {/* Top App Bar (Hidden on Print) */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-orange-950 via-stone-900 to-orange-950 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              title="वापस जाएं (Back)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">वापस</span>
            </button>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center text-xl shadow-inner shrink-0">
              📋
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-black text-white tracking-wide truncate">
                  समग्र परीक्षा परिणाम सारणी (TR Sheet)
                </h2>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  बोर्ड एवं विद्या भारती मानक
                </span>
              </div>
              <p className="text-xs text-stone-300 truncate">
                शाखा: <span className="text-amber-300 font-bold">{currentSchool.hindiName || currentSchool.name}</span> • सत्र {selectedAcademicYear} • {selectedTerm}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              title="लैंडस्केप प्रिंट करें"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">🖨️ लैंडस्केप प्रिंट</span>
              <span className="sm:hidden">प्रिंट</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={studentResults.length === 0}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-stone-700/80 hover:bg-stone-600 border border-stone-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              title="एक्सेल / CSV डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">CSV निर्यात</span>
              <span className="sm:hidden">CSV</span>
            </button>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="p-2 rounded-xl bg-stone-700/80 hover:bg-stone-600 border border-stone-600 text-white transition disabled:opacity-50 cursor-pointer"
              title="रिफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-red-900/60 text-stone-300 hover:text-white transition cursor-pointer"
              title="बंद करें (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar (Hidden on Print) */}
        <div className="p-3.5 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Class Selector */}
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-stone-700">कक्षा (Class):</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Section Selector */}
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-stone-700">वर्ग (Section):</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="all">सभी वर्ग (All)</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            {/* Exam Term Selector */}
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-stone-700">परीक्षा (Exam Term):</label>
              <select
                value={selectedTerm}
                onChange={e => setSelectedTerm(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/50 font-bold text-orange-950 focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="त्रैमासिक परीक्षा">त्रैमासिक परीक्षा (Traimasik / Quarterly)</option>
                <option value="अर्धवार्षिक परीक्षा">अर्धवार्षिक परीक्षा (Ardhvarshik / Half-Yearly)</option>
                <option value="वार्षिक परीक्षा">वार्षिक परीक्षा (Varshik / Annual Exam)</option>
                <option value="प्रथम आवधिक परीक्षा">प्रथम आवधिक परीक्षा (PT-1)</option>
                <option value="द्वितीय आवधिक परीक्षा">द्वितीय आवधिक परीक्षा (PT-2)</option>
              </select>
            </div>

            {/* Session Selector */}
            <div className="flex items-center gap-1.5">
              <label className="font-bold text-stone-700">सत्र (Session):</label>
              <select
                value={selectedAcademicYear}
                onChange={e => setSelectedAcademicYear(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="छात्र / रोल नं. खोजें..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs focus:ring-1 focus:ring-amber-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Printable Register Canvas */}
        <div ref={printContainerRef} className="flex-1 overflow-auto p-4 sm:p-6 bg-stone-100/50 print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white border border-stone-300 shadow-md p-6 rounded-2xl min-w-[1050px] print:min-w-0 print:border-none print:shadow-none print:p-0">
            
            {/* Official School Header for TR Register */}
            <div className="border-b-2 border-stone-900 pb-4 mb-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl text-orange-700 font-bold">🪷</span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-wide uppercase">
                    {currentSchool.name || 'SARASWATI SHISHU MANDIR'}
                  </h1>
                  <h2 className="text-sm sm:text-base font-bold text-orange-900">
                    {currentSchool.hindiName || 'सरस्वती शिशु मंदिर उच्चतर माध्यमिक विद्यालय'}
                  </h2>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    {currentSchool.address}, {currentSchool.city} ({currentSchool.state}) • विद्या भारती अखिल भारतीय शिक्षा संस्थान से सम्बद्ध
                  </p>
                </div>
              </div>

              <div className="mt-3 py-1 px-4 bg-stone-900 text-white inline-block rounded-md text-xs font-black uppercase tracking-widest shadow-2xs">
                समग्र परीक्षा परिणाम सारणी (TABULATION REGISTER - TR SHEET)
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-stone-800 mt-3 px-2 border-t border-stone-200 pt-2">
                <span>कक्षा व वर्ग: <strong className="text-orange-900">{selectedClass} {selectedSection !== 'all' ? `'${selectedSection}'` : ''}</strong></span>
                <span>परीक्षा: <strong className="text-orange-900">{selectedTerm}</strong></span>
                <span>सत्र: <strong className="text-orange-900">{selectedAcademicYear}</strong></span>
                <span>दिनांक: <strong>{new Date().toLocaleDateString('hi-IN')}</strong></span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-stone-900 text-center text-xs">
                <thead>
                  <tr className="bg-stone-200 text-stone-950 font-black border-b border-stone-900">
                    <th className="border border-stone-900 py-2 px-1 w-10">क्र.</th>
                    <th className="border border-stone-900 py-2 px-2 w-14">अनुक्रमांक</th>
                    <th className="border border-stone-900 py-2 px-3 text-left w-44">छात्र/छात्रा का नाम</th>
                    <th className="border border-stone-900 py-2 px-3 text-left w-40">पिता का नाम</th>
                    {classSubjects.map(sub => (
                      <th key={sub} className="border border-stone-900 py-1 px-1.5 min-w-[55px]">
                        <span className="block text-[11px] font-bold truncate max-w-[65px]" title={sub}>
                          {sub}
                        </span>
                        <span className="block text-[9px] font-mono text-stone-600">(100)</span>
                      </th>
                    ))}
                    <th className="border border-stone-900 py-2 px-2 w-16 bg-amber-100/70">कुल प्राप्तांक</th>
                    <th className="border border-stone-900 py-2 px-1.5 w-14 bg-amber-100/70">प्रतिशत</th>
                    <th className="border border-stone-900 py-2 px-1 w-12 bg-amber-100/70">ग्रेड</th>
                    <th className="border border-stone-900 py-2 px-2 w-20 bg-stone-300">श्रेणी (Div)</th>
                    <th className="border border-stone-900 py-2 px-2 w-20 bg-stone-300">परिणाम</th>
                  </tr>
                </thead>
                <tbody>
                  {studentResults.length === 0 ? (
                    <tr>
                      <td colSpan={8 + classSubjects.length} className="py-12 text-center text-stone-500 font-bold">
                        इस कक्षा व वर्ग में कोई छात्र या परीक्षा परिणाम उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    studentResults.map((row, idx) => {
                      const isFailed = row.resultStatus === 'अनुत्तीर्ण (FAIL)';
                      const isComp = row.resultStatus === 'पूरक (COMP)';
                      const isFirstDiv = row.division === 'प्रथम (I)';

                      return (
                        <tr
                          key={row.student.id}
                          className={`border-b border-stone-400 hover:bg-amber-50/50 transition ${
                            isFailed ? 'bg-red-50/40' : isComp ? 'bg-amber-50/30' : idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'
                          }`}
                        >
                          <td className="border border-stone-900 py-1.5 px-1 font-mono">{idx + 1}</td>
                          <td className="border border-stone-900 py-1.5 px-2 font-mono font-bold text-stone-900">
                            {row.student.rollNo}
                          </td>
                          <td className="border border-stone-900 py-1.5 px-3 text-left font-bold text-stone-950 truncate max-w-[170px]" title={row.student.name}>
                            {row.student.name}
                          </td>
                          <td className="border border-stone-900 py-1.5 px-3 text-left text-stone-700 truncate max-w-[160px]" title={row.student.fatherName}>
                            {row.student.fatherName || 'श्री अभिभावक'}
                          </td>

                          {/* Subject Columns */}
                          {classSubjects.map(sub => {
                            const score = row.subjectScores[sub];
                            const marks = score ? score.obtained : 0;
                            const isSubFail = score && (marks / (score.max || 100)) * 100 < 33;

                            return (
                              <td
                                key={sub}
                                className={`border border-stone-900 py-1.5 px-1 font-mono font-semibold ${
                                  isSubFail ? 'text-red-700 font-bold bg-red-100/60' : 'text-stone-800'
                                }`}
                              >
                                {score ? marks : '-'}
                              </td>
                            );
                          })}

                          {/* Totals */}
                          <td className="border border-stone-900 py-1.5 px-2 font-mono font-black text-stone-950 bg-amber-50/70">
                            {row.grandTotalObtained}
                            <span className="block text-[9px] font-normal text-stone-500">/{row.grandTotalMax}</span>
                          </td>

                          {/* Percentage */}
                          <td className="border border-stone-900 py-1.5 px-1.5 font-mono font-bold text-stone-900 bg-amber-50/70">
                            {row.percentage.toFixed(1)}%
                          </td>

                          {/* Grade */}
                          <td className="border border-stone-900 py-1.5 px-1 font-black text-stone-900 bg-amber-50/70">
                            {row.overallGrade}
                          </td>

                          {/* Division */}
                          <td className="border border-stone-900 py-1.5 px-1 font-bold text-[11px] whitespace-nowrap">
                            <span className={
                              isFirstDiv
                                ? 'text-emerald-800 font-black'
                                : isFailed
                                ? 'text-red-700'
                                : 'text-stone-800'
                            }>
                              {row.division}
                            </span>
                          </td>

                          {/* Result */}
                          <td className="border border-stone-900 py-1.5 px-1 font-bold text-[11px] whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                row.resultStatus === 'उत्तीर्ण (PASS)'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : isComp
                                  ? 'bg-amber-100 text-amber-900'
                                  : isFailed
                                  ? 'bg-red-100 text-red-900'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {row.resultStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Statistics Footer */}
            <div className="mt-5 pt-4 border-t-2 border-stone-900 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-300">
              <div className="space-y-1">
                <div className="text-stone-500 font-semibold">कुल छात्र / मूल्यांकित:</div>
                <div className="text-base font-black text-stone-900">
                  {statistics.totalStudents} / {statistics.evaluatedCount}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-stone-500 font-semibold">उत्तीर्ण प्रतिशत (Pass %):</div>
                <div className="text-base font-black text-emerald-700">
                  {statistics.passPercentage.toFixed(1)}%
                  <span className="text-xs text-stone-600 ml-1">({statistics.passCount} छात्र)</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-stone-500 font-semibold">श्रेणी विभाजन (Divisions):</div>
                <div className="text-xs font-bold text-stone-800">
                  I: <strong className="text-emerald-700">{statistics.firstDivCount}</strong> | 
                  II: <strong>{statistics.secondDivCount}</strong> | 
                  III: <strong>{statistics.thirdDivCount}</strong> | 
                  अनु.: <strong className="text-red-700">{statistics.failCount}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-stone-500 font-semibold">कक्षा टॉपर (Class Topper):</div>
                {statistics.topper ? (
                  <div className="text-xs font-black text-amber-900 truncate" title={`${statistics.topper.name} (${statistics.topper.pct.toFixed(1)}%)`}>
                    🏆 {statistics.topper.name} ({statistics.topper.pct.toFixed(1)}%)
                  </div>
                ) : (
                  <div className="text-stone-400 font-medium">अपेक्षित</div>
                )}
              </div>
            </div>

            {/* Official Inspection Signatures */}
            <div className="mt-10 pt-8 border-t border-stone-400 grid grid-cols-3 gap-6 text-center text-xs font-bold text-stone-900">
              <div>
                <div className="h-10"></div>
                <div className="border-t border-stone-900 pt-1.5">कक्षाध्यापक के हस्ताक्षर</div>
                <div className="text-[10px] text-stone-500 font-normal">(Class Teacher)</div>
              </div>

              <div>
                <div className="h-10"></div>
                <div className="border-t border-stone-900 pt-1.5">परीक्षा प्रभारी के हस्ताक्षर</div>
                <div className="text-[10px] text-stone-500 font-normal">(Examination In-Charge)</div>
              </div>

              <div>
                <div className="h-10"></div>
                <div className="border-t border-stone-900 pt-1.5">प्रधानाचार्य हस्ताक्षर एवं विद्यालय मुहर</div>
                <div className="text-[10px] text-stone-500 font-normal">(Principal & Seal)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Hidden on Print) */}
        <div className="p-3.5 border-t border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span>कुल छात्र: <strong className="text-stone-900">{studentResults.length}</strong></span>
            <span className="text-stone-300">•</span>
            <span>उत्तीर्ण: <strong className="text-emerald-700">{statistics.passCount}</strong> ({statistics.passPercentage.toFixed(1)}%)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> प्रिंट करें
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition"
            >
              बंद करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabulationRegisterModal;
