import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { generateReportCardWhatsAppLink } from '../../../utils/whatsappAlerts';
import { SSM_CLASSES, type Student, type ReportCard } from '../../../types';
import {
  Award,
  Crown,
  FileSpreadsheet,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  Printer,
  Search,
  Table as TableIcon,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';

interface AdminReportsTabProps {
  requirePro: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
  onOpenReportModal: (modal: { report: ReportCard; student: Student }) => void;
  onOpenTabulationModal: () => void;
  onOpenUpgradeModal: (feature: { name: string; desc?: string }) => void;
}

const AdminReportsTabComponent: React.FC<AdminReportsTabProps> = ({
  requirePro,
  onOpenReportModal,
  onOpenTabulationModal,
  onOpenUpgradeModal
}) => {
  const { students, currentSchool, reportCards, deleteReportCard } = useSchool();
  const isPro = currentSchool.plan === 'pro';

  // Filters and views
  const [reportTermFilter, setReportTermFilter] = useState<string>('All');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Student map for fast O(1) lookups
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach(s => map.set(s.id, s));
    return map;
  }, [students]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reportCards.filter(report => {
      // Term filter
      const matchesTerm =
        reportTermFilter === 'All' ||
        (report.examTerm && report.examTerm.includes(reportTermFilter));
      if (!matchesTerm) return false;

      const student = studentMap.get(report.studentId);
      if (!student) return false;

      // Class filter
      const matchesClass =
        selectedClass === 'ALL' ||
        student.class === selectedClass ||
        student.class.startsWith(selectedClass + ' ');
      if (!matchesClass) return false;

      // Search query (student name or roll number)
      if (q) {
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesRoll = student.rollNo.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll) return false;
      }

      return true;
    });
  }, [reportCards, studentMap, reportTermFilter, selectedClass, searchQuery]);

  // Academic KPI metrics
  const stats = useMemo(() => {
    const total = filteredReports.length;
    if (total === 0) {
      return { total: 0, averagePct: 0, highestPct: 0, topperName: '—', passRate: 0 };
    }

    let sumPct = 0;
    let highestPct = 0;
    let topperName = '—';
    let passCount = 0;

    filteredReports.forEach(r => {
      const pct = r.percentage || 0;
      sumPct += pct;
      if (pct >= 33) passCount++;
      if (pct > highestPct) {
        highestPct = pct;
        const student = studentMap.get(r.studentId);
        if (student) topperName = student.name;
      }
    });

    const averagePct = Math.round((sumPct / total) * 10) / 10;
    const passRate = Math.round((passCount / total) * 100);

    return {
      total,
      averagePct,
      highestPct: Math.round(highestPct * 10) / 10,
      topperName,
      passRate
    };
  }, [filteredReports, studentMap]);

  if (!isPro) {
    return (
      <div className="bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-sm my-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Crown className="w-8 h-8 text-amber-600 fill-amber-500" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            विद्या भारती प्रो फीचर (Pro ERP Suite)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
            360° समग्र प्रगति पत्र (Holistic Report Cards)
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
            NEP 2020 एवं विद्या भारती 5 आधार विषयों (योग, शारीरिक, संगीत, संस्कृत, नैतिक शिक्षा) सहित डिजिटल अंकसूची मुद्रण केवल प्रो योजना में उपलब्ध है।
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() =>
              onOpenUpgradeModal({
                name: '360° समग्र प्रगति पत्र (Report Cards)',
                desc: 'CBSE एवं NEP 2020 अनुरूप 360° समग्र प्रगति पत्र अंकसूची तैयार करने हेतु प्रो योजना सक्रिय करें।'
              })
            }
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 inline-flex items-center gap-2 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Crown className="w-4 h-4 text-yellow-200 fill-yellow-300" />
            <span>प्रो में अपग्रेड करें (Unlock Pro Plan)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            प्रगति पत्र मूल्यांकन (Pragati Patra Report Cards)
          </h3>
          <p className="text-xs text-stone-500">
            सत्र 2025-26 • त्रैमासिक, अर्धवार्षिक एवं वार्षिक परीक्षा परिणाम तथा पंचमुखी संस्कार मूल्यांकन
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenTabulationModal}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="कक्षावार समग्र परीक्षा परिणाम सारणी देखें व प्रिंट करें"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>समग्र परीक्षा परिणाम सारणी (TR Sheet)</span>
          </button>
        </div>
      </div>

      {/* Academic Performance KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase">कुल प्रगति पत्र</span>
            <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <p className="text-xl font-black text-stone-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-stone-500 font-medium">मूल्यांकित छात्र</span>
        </div>

        <div className="bg-orange-50/80 p-3.5 rounded-xl border border-orange-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-orange-700 uppercase">कक्षा औसत प्राप्तांक</span>
            <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <p className="text-xl font-black text-orange-900 mt-1">{stats.averagePct}%</p>
          <span className="text-[11px] text-orange-700 font-medium">सत्र सामान्य स्तर</span>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">सर्वोच्च प्राप्तांक (Topper)</span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-800 mt-1">{stats.highestPct}%</p>
          <span className="text-[11px] text-emerald-700 font-medium truncate block" title={stats.topperName}>
            {stats.topperName}
          </span>
        </div>

        <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 uppercase">उत्तीर्ण प्रतिशत (Pass Rate)</span>
            <Crown className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-900 mt-1">{stats.passRate}%</p>
          <span className="text-[11px] text-blue-700 font-medium">न्यूनतम 33% उत्तीर्ण सीमा</span>
        </div>
      </div>

      {/* Filter and View Layout Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="विद्यार्थी का नाम या अनुक्रमांक..."
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

          {/* Exam Term Filter */}
          <select
            value={reportTermFilter}
            onChange={e => setReportTermFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
          >
            <option value="All">समस्त परीक्षाएं (All)</option>
            <option value="त्रैमासिक">त्रैमासिक परीक्षा (Traimasik)</option>
            <option value="अर्धवार्षिक">अर्धवार्षिक परीक्षा (Ardhvarshik)</option>
            <option value="वार्षिक">वार्षिक परीक्षा (Varshik)</option>
          </select>

          {(searchQuery || selectedClass !== 'ALL' || reportTermFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedClass('ALL');
                setReportTermFilter('All');
              }}
              className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>फ़िल्टर हटाएं</span>
            </button>
          )}
        </div>

        {/* Grid / Table Toggle */}
        <div className="bg-stone-100 p-0.5 rounded-lg flex items-center border border-stone-200">
          <button
            type="button"
            onClick={() => setViewLayout('grid')}
            className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              viewLayout === 'grid'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="विस्तृत कार्ड दृश्य"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">कार्ड</span>
          </button>
          <button
            type="button"
            onClick={() => setViewLayout('table')}
            className={`p-1.5 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              viewLayout === 'table'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            title="तालिका दृश्य"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">तालिका</span>
          </button>
        </div>
      </div>

      {/* Content Rendering: Grid or Table */}
      {filteredReports.length === 0 ? (
        <div className="p-10 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
          चयनित फ़िल्टर के अनुरूप कोई प्रगति पत्र उपलब्ध नहीं है।
        </div>
      ) : viewLayout === 'grid' ? (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReports.map(report => {
            const student = studentMap.get(report.studentId);
            if (!student) return null;

            return (
              <div
                key={report.id}
                className="p-5 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-amber-50/50 to-white shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                        {report.examTerm}
                      </span>
                      <h4 className="text-base font-bold text-stone-900 mt-1">
                        {student.name}
                      </h4>
                      <p className="text-xs text-stone-600">
                        अनुक्रमांक: <strong>{student.rollNo}</strong> • {student.class} '{student.section}'
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-orange-800">
                        {report.percentage.toFixed(1)}%
                      </span>
                      <span className="block text-[10px] font-bold text-stone-500 uppercase">
                        श्रेणी: {report.grade.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Marks preview snapshot */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-stone-200/80 my-2">
                    {report.marks.slice(0, 4).map((m, idx) => (
                      <div key={idx} className="flex justify-between text-stone-700">
                        <span className="truncate pr-1">{m.subject.split(' ')[0]}:</span>
                        <span className="font-bold">{m.marksObtained}/{m.maxMarks}</span>
                      </div>
                    ))}
                  </div>

                  {/* Panchmukhi 360 snapshot */}
                  {report.panchmukhiEvaluation && (
                    <div className="flex flex-wrap gap-1 my-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-950">
                        🏃 शारीरिक: {report.panchmukhiEvaluation.sharirik.grade}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-950">
                        🧘 योग: {report.panchmukhiEvaluation.yog.grade}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-950">
                        🎵 संगीत: {report.panchmukhiEvaluation.sangeet.grade}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-950">
                        📜 संस्कृत: {report.panchmukhiEvaluation.sanskrit.grade}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-950">
                        🪷 नैतिक: {report.panchmukhiEvaluation.naitik.grade}
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-stone-600 italic line-clamp-2 mt-2">
                    "{report.acharyaRemarks}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-green-700">
                      संस्कार: {report.moralConduct}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-orange-900 font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                      NEP 2020 HPC
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        requirePro(
                          'व्हाट्सएप प्रगति पत्र (WhatsApp Report Cards)',
                          'परीक्षा फल एवं पंचमुखी प्रगति पत्र 1-क्लिक में अभिभावक के व्हाट्सएप पर भेजें।',
                          () => {
                            const pe = report.panchmukhiEvaluation;
                            const url = generateReportCardWhatsAppLink({
                              studentName: student.name,
                              className: `${student.class} '${student.section}'`,
                              rollNo: student.rollNo,
                              term: report.examTerm,
                              academicYear: report.academicYear,
                              percentage: report.percentage,
                              grade: report.grade,
                              moralConduct: report.moralConduct,
                              acharyaRemarks: report.acharyaRemarks,
                              panchmukhi: pe
                                ? {
                                    sharirikGrade: pe.sharirik?.grade || 'O',
                                    yogGrade: pe.yog?.grade || 'A+',
                                    sangeetGrade: pe.sangeet?.grade || 'A',
                                    sanskritGrade: pe.sanskrit?.grade || 'O',
                                    naitikGrade: pe.naitik?.grade || 'O'
                                  }
                                : undefined,
                              schoolName: currentSchool.hindiName || currentSchool.name,
                              phone: student.contact
                            });
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        );
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      title="अभिभावक को व्हाट्सएप पर भेजें"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>व्हाट्सएप</span>
                    </button>
                    <button
                      onClick={() => onOpenReportModal({ report, student })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>प्रगति पत्र देखें</span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `क्या आप ${student.name} का ${report.examTerm} का प्रगति पत्र स्थायी रूप से हटाना चाहते हैं?`
                          )
                        ) {
                          deleteReportCard(report.id);
                        }
                      }}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded transition inline-flex items-center cursor-pointer"
                      title="प्रगति पत्र हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE VIEW ================= */
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
              <tr>
                <th className="p-3">अनुक्रमांक</th>
                <th className="p-3">छात्र का नाम</th>
                <th className="p-3">कक्षा</th>
                <th className="p-3">परीक्षा सत्र</th>
                <th className="p-3 text-center">प्राप्तांक %</th>
                <th className="p-3">ग्रेड</th>
                <th className="p-3">नैतिक संस्कार</th>
                <th className="p-3 text-right">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredReports.map(report => {
                const student = studentMap.get(report.studentId);
                if (!student) return null;

                return (
                  <tr key={report.id} className="hover:bg-stone-50 transition">
                    <td className="p-3 font-mono font-bold text-stone-800">{student.rollNo}</td>
                    <td className="p-3 font-semibold text-stone-900">{student.name}</td>
                    <td className="p-3 text-stone-600">{student.class} - {student.section}</td>
                    <td className="p-3 font-medium text-stone-700">{report.examTerm}</td>
                    <td className="p-3 text-center font-bold text-orange-800">
                      {report.percentage.toFixed(1)}%
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
                        {report.grade}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-700 font-semibold">{report.moralConduct}</td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          requirePro(
                            'व्हाट्सएप प्रगति पत्र (WhatsApp Report Cards)',
                            'परीक्षा फल एवं पंचमुखी प्रगति पत्र 1-क्लिक में अभिभावक के व्हाट्सएप पर भेजें।',
                            () => {
                              const pe = report.panchmukhiEvaluation;
                              const url = generateReportCardWhatsAppLink({
                                studentName: student.name,
                                className: `${student.class} '${student.section}'`,
                                rollNo: student.rollNo,
                                term: report.examTerm,
                                academicYear: report.academicYear,
                                percentage: report.percentage,
                                grade: report.grade,
                                moralConduct: report.moralConduct,
                                acharyaRemarks: report.acharyaRemarks,
                                panchmukhi: pe
                                  ? {
                                      sharirikGrade: pe.sharirik?.grade || 'O',
                                      yogGrade: pe.yog?.grade || 'A+',
                                      sangeetGrade: pe.sangeet?.grade || 'A',
                                      sanskritGrade: pe.sanskrit?.grade || 'O',
                                      naitikGrade: pe.naitik?.grade || 'O'
                                    }
                                  : undefined,
                              schoolName: currentSchool.hindiName || currentSchool.name,
                              phone: student.contact
                            });
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        );
                      }}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      title="व्हाट्सएप"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-700" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => onOpenReportModal({ report, student })}
                      className="px-2.5 py-1 bg-orange-700 hover:bg-orange-800 text-white rounded font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>प्रिंट</span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `क्या आप ${student.name} का ${report.examTerm} का प्रगति पत्र स्थायी रूप से हटाना चाहते हैं?`
                          )
                        ) {
                          deleteReportCard(report.id);
                        }
                      }}
                      className="p-1 text-stone-400 hover:text-red-600 rounded transition inline-flex items-center cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
};

export const AdminReportsTab = React.memo(AdminReportsTabComponent);
