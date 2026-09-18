import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import {
  exportAttendanceToCSV,
  exportAbsenteesToCSV,
  downloadCSV,
  sanitizeCsvCell
} from '../../../utils/csvExport';
import { SSM_CLASSES, type AttendanceStatus, type Student } from '../../../types';
import { formatWhatsAppPhone } from '../../../utils/whatsappAlerts';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  MessageSquare,
  Search,
  Users,
  UserX,
  X,
  XCircle,
  Send,
  Check,
  Printer
} from 'lucide-react';

interface WhatsAppAlertPayload {
  title: string;
  recipientName: string;
  recipientPhone: string;
  studentClass: string;
  defaultMessage: string;
}

interface AdminAttendanceTabProps {
  requirePro?: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
  onOpenWhatsAppAlert: (payload: WhatsAppAlertPayload) => void;
  onOpenPrintableAttendanceSheet?: () => void;
}

const AdminAttendanceTabComponent: React.FC<AdminAttendanceTabProps> = ({
  onOpenWhatsAppAlert,
  onOpenPrintableAttendanceSheet
}) => {
  const {
    students,
    currentSchool,
    attendanceRecords,
    getAttendanceForDate,
    setStudentAttendance,
    bulkSetAttendance
  } = useSchool();
  const { showSuccess, showError, showInfo } = useToast();

  // Tab View Mode: 'daily' vs 'summary'
  const [viewMode, setViewMode] = useState<'daily' | 'summary'>('daily');

  // Daily attendance controls
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceClass, setAttendanceClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBatchAbsenteeModal, setShowBatchAbsenteeModal] = useState(false);
  const [sentStudentIds, setSentStudentIds] = useState<Record<string, boolean>>({});
  const [customAbsentNote, setCustomAbsentNote] = useState('');

  // Date Range Controls for Summary View (defaults to current month)
  const [rangeStart, setRangeStart] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [rangeEnd, setRangeEnd] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const todayAttendance = useMemo(
    () => getAttendanceForDate(attendanceDate),
    [getAttendanceForDate, attendanceDate]
  );

  // Cumulative overall attendance percentage per student across all records
  const getStudentOverallAttendancePct = (studentId: string): number | null => {
    const recs = attendanceRecords.filter(r => r.studentId === studentId);
    if (recs.length === 0) return null;
    const present = recs.filter(r => r.status === 'Present').length;
    return Math.round((present / recs.length) * 100);
  };

  // Filtered student list based on class and search query
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesClass =
        attendanceClass === 'ALL' ||
        s.class === attendanceClass ||
        s.class.startsWith(attendanceClass + ' ');
      if (!matchesClass) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        (s.fatherName && s.fatherName.toLowerCase().includes(q)) ||
        (s.contact && s.contact.includes(q))
      );
    });
  }, [students, attendanceClass, searchQuery]);

  // Live KPI Summary stats for the current filter view (Daily)
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let lowAttendanceCount = 0;

    filteredStudents.forEach(s => {
      const st: AttendanceStatus = todayAttendance[s.id] || 'Present';
      if (st === 'Present') present++;
      else if (st === 'Absent') absent++;
      else if (st === 'Leave') leave++;

      const overallPct = getStudentOverallAttendancePct(s.id);
      if (overallPct !== null && overallPct < 75) {
        lowAttendanceCount++;
      }
    });

    const total = filteredStudents.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, leave, rate, lowAttendanceCount };
  }, [filteredStudents, todayAttendance, attendanceRecords]);

  // Range Summary Calculation per student
  const rangeSummaryData = useMemo(() => {
    return filteredStudents.map(student => {
      const recs = attendanceRecords.filter(
        r => r.studentId === student.id && r.date >= rangeStart && r.date <= rangeEnd
      );
      const totalMarked = recs.length;
      const presentCount = recs.filter(r => r.status === 'Present').length;
      const absentCount = recs.filter(r => r.status === 'Absent').length;
      const leaveCount = recs.filter(r => r.status === 'Leave').length;
      const pct = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : null;
      return {
        student,
        totalMarked,
        presentCount,
        absentCount,
        leaveCount,
        pct,
        isLow: pct !== null && pct < 75
      };
    });
  }, [filteredStudents, attendanceRecords, rangeStart, rangeEnd]);

  // Range summary stats
  const rangeStats = useMemo(() => {
    const totalStudents = rangeSummaryData.length;
    const distinctDates = new Set(
      attendanceRecords
        .filter(r => r.date >= rangeStart && r.date <= rangeEnd)
        .map(r => r.date)
    ).size;
    const validPcts = rangeSummaryData.filter(d => d.pct !== null).map(d => d.pct as number);
    const avgPct = validPcts.length > 0 ? Math.round(validPcts.reduce((a, b) => a + b, 0) / validPcts.length) : 0;
    const lowAttendanceCount = rangeSummaryData.filter(d => d.isLow).length;
    return { totalStudents, distinctDates, avgPct, lowAttendanceCount };
  }, [rangeSummaryData, attendanceRecords, rangeStart, rangeEnd]);

  // Bulk Actions (No Paywalls)
  const handleMarkAll = async (status: AttendanceStatus) => {
    try {
      await bulkSetAttendance(attendanceClass, attendanceDate, status);
      showSuccess(
        status === 'Present'
          ? `सभी ${filteredStudents.length} छात्र उपस्थित अंकित किए गए!`
          : `सभी ${filteredStudents.length} छात्र अनुपस्थित अंकित किए गए!`
      );
    } catch (err: any) {
      showError('उपस्थिति अंकन में त्रुटि: ' + (err.message || 'त्रुटि'));
    }
  };

  // CSV Exports
  const handleExportDailyCSV = () => {
    exportAttendanceToCSV(attendanceRecords, students, attendanceDate);
    showSuccess(`दिनांक ${attendanceDate} की उपस्थिति CSV सफलतापूर्वक डाउनलोड हो गई!`);
  };

  const handleExportAbsenteesCSV = () => {
    const absList = attendanceRecords.filter(a => a.date === attendanceDate && a.status === 'Absent');
    if (absList.length === 0) {
      showInfo(`दिनांक ${attendanceDate} को कोई छात्र अनुपस्थित नहीं है।`);
      return;
    }
    exportAbsenteesToCSV(attendanceRecords, students, attendanceDate);
    showSuccess(`दिनांक ${attendanceDate} की अनुपस्थित छात्रों की सूची CSV डाउनलोड हो गई!`);
  };

  const absentStudentsList = useMemo(() => {
    return filteredStudents.filter(s => (todayAttendance[s.id] || 'Present') === 'Absent');
  }, [filteredStudents, todayAttendance]);

  const handleSendSingleAbsentee = (student: Student) => {
    const cleanPhone = formatWhatsAppPhone(student.contact);
    if (!cleanPhone || cleanPhone.length < 10) {
      showError(`छात्र '${student.name}' का 10-अंकीय मोबाइल नंबर उपलब्ध नहीं है।`);
      return;
    }

    const noteText = customAbsentNote.trim() ? `\n📌 *विशेष निर्देश:* ${customAbsentNote.trim()}\n` : '';
    const text = 
`🚩 *सादर नमस्ते जी* 🚩
*${currentSchool.hindiName || currentSchool.name}*
--------------------------------
*दैनिक अनुपस्थिति सूचना:*
आपके पाल्य/पाल्या *${student.name}* (कक्षा: ${student.class} - ${student.section}, रोल नं: ${student.rollNo}) आज दिनांक *${attendanceDate}* को विद्यालय में अनुपस्थित रहे हैं।
${noteText}
कृपया अस्वस्थता अथवा अनुपस्थिति का कारण विद्यालय डायरी में दर्ज करें अथवा संपर्क करने की कृपा करें।

धन्यवाद!
— प्रधानाचार्य कार्यालय, ${currentSchool.hindiName || currentSchool.name}`;

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    setSentStudentIds(prev => ({ ...prev, [student.id]: true }));
    showSuccess(`'${student.name}' के अभिभावक को WhatsApp अलर्ट प्रेषित!`);
  };

  const handleSendNextPending = () => {
    const nextPending = absentStudentsList.find(s => !sentStudentIds[s.id]);
    if (nextPending) {
      handleSendSingleAbsentee(nextPending);
    } else {
      showInfo('सभी अनुपस्थित छात्रों के अभिभावकों को WhatsApp भेजा जा चुका है!');
    }
  };

  const handleExportRangeSummaryCSV = () => {
    const headers = [
      'Roll No',
      'Student Name',
      'Class',
      'Section',
      'Total Days',
      'Present Days',
      'Absent Days',
      'Leave Days',
      'Attendance %',
      'Contact'
    ];
    const rows = rangeSummaryData.map(item => [
      sanitizeCsvCell(item.student.rollNo),
      sanitizeCsvCell(item.student.name),
      sanitizeCsvCell(item.student.class),
      sanitizeCsvCell(item.student.section),
      sanitizeCsvCell(item.totalMarked),
      sanitizeCsvCell(item.presentCount),
      sanitizeCsvCell(item.absentCount),
      sanitizeCsvCell(item.leaveCount),
      sanitizeCsvCell(item.pct !== null ? `${item.pct}%` : 'N/A'),
      sanitizeCsvCell(item.student.contact)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csv, `SSM_Attendance_Summary_${rangeStart}_to_${rangeEnd}.csv`);
    showSuccess(`अवधि सारांश (${rangeStart} से ${rangeEnd}) CSV सफलतापूर्वक डाउनलोड हो गई!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span>दैनिक एवं मासिक उपस्थिति पंजिका (Attendance Management)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            कक्षावार भैया-बहिनों की उपस्थिति अंकन, मासिक सारांश एवं अभिभावक अलर्ट।
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-white text-orange-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-orange-600" />
            <span>दैनिक अंकन (Daily)</span>
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              viewMode === 'summary'
                ? 'bg-white text-orange-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
            <span>मासिक / अवधि सारांश (Summary)</span>
          </button>
        </div>
      </div>

      {/* Mode-Specific Controls */}
      {viewMode === 'daily' ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>दिनांक:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <select
                value={attendanceClass}
                onChange={e => setAttendanceClass(e.target.value)}
                className="px-3 py-1 text-xs rounded-lg border border-stone-300 bg-white font-medium focus:ring-1 focus:ring-orange-500"
              >
                <option value="ALL">सभी कक्षाएं (All Classes)</option>
                {SSM_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleMarkAll('Present')}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1 cursor-pointer transition"
                title="वर्तमान कक्षा के सभी छात्रों को उपस्थित अंकित करें"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>सभी उपस्थित (Mark All Present)</span>
              </button>
              <button
                onClick={() => handleMarkAll('Absent')}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition"
                title="वर्तमान कक्षा के सभी छात्रों को अनुपस्थित अंकित करें"
              >
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>सभी अनुपस्थित</span>
              </button>
              {absentStudentsList.length > 0 && (
                <button
                  onClick={() => setShowBatchAbsenteeModal(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 active:to-teal-800 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition active:scale-95 animate-pulse"
                  title={`आज अनुपस्थित ${absentStudentsList.length} छात्रों के अभिभावकों को WhatsApp संदेश भेजें`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                  <span>अनुपस्थित व्हाट्सएप प्रसारण ({absentStudentsList.length})</span>
                </button>
              )}
              <button
                onClick={handleExportDailyCSV}
                className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
                title="दिनांक अनुसार सम्पूर्ण उपस्थिति CSV डाउनलोड करें"
              >
                <Download className="w-3.5 h-3.5 text-green-400" />
                <span>उपस्थिति CSV</span>
              </button>
              <button
                onClick={handleExportAbsenteesCSV}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
                title="आज अनुपस्थित छात्रों की सूची (दूरभाष सहित) CSV डाउनलोड करें"
              >
                <UserX className="w-3.5 h-3.5 text-rose-200" />
                <span>अनुपस्थित सूची CSV</span>
              </button>
              {onOpenPrintableAttendanceSheet && (
                <button
                  onClick={onOpenPrintableAttendanceSheet}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
                  title="कक्षा अनुसार 31-दिवसीय खाली/भरा हुआ उपस्थिति रजिस्टर (A4) प्रिंट करें"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-200" />
                  <span>31-दिवसीय पंजिका शीट</span>
                </button>
              )}
            </div>
          </div>

          {/* Daily KPI Stats Counter Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-500 uppercase">कुल छात्र (Total)</span>
                <Users className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <p className="text-xl font-black text-stone-900 mt-1">{stats.total}</p>
            </div>

            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">उपस्थित (Present)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-emerald-800 mt-1">
                {stats.present} <span className="text-xs font-bold text-emerald-600">({stats.rate}%)</span>
              </p>
            </div>

            <div className="bg-red-50/80 p-3 rounded-xl border border-red-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-red-700 uppercase">अनुपस्थित (Absent)</span>
                <XCircle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <p className="text-xl font-black text-red-800 mt-1">{stats.absent}</p>
            </div>

            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-700 uppercase">अवकाश (Leave)</span>
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <p className="text-xl font-black text-amber-800 mt-1">{stats.leave}</p>
            </div>

            <div className={`p-3 rounded-xl border shadow-2xs col-span-2 sm:col-span-1 ${
              stats.lowAttendanceCount > 0
                ? 'bg-rose-50 border-rose-300'
                : 'bg-stone-50 border-stone-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase ${
                  stats.lowAttendanceCount > 0 ? 'text-rose-700' : 'text-stone-500'
                }`}>
                  75% से कम उपस्थिति
                </span>
                {stats.lowAttendanceCount > 0 && (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                )}
              </div>
              <p className={`text-xl font-black mt-1 ${
                stats.lowAttendanceCount > 0 ? 'text-rose-800' : 'text-stone-700'
              }`}>
                {stats.lowAttendanceCount}
              </p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="नाम, अनुक्रमांक (Roll No), या पिता के नाम से खोजें..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>हटाएं</span>
              </button>
            )}
          </div>

          {/* Daily Attendance Roster Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">अनुक्रमांक</th>
                  <th className="p-3">छात्र का नाम</th>
                  <th className="p-3">कक्षा</th>
                  <th className="p-3 text-center">सत्र उपस्थिति (Overall %)</th>
                  <th className="p-3">वर्तमान स्थिति ({attendanceDate})</th>
                  <th className="p-3 text-center">उपस्थिति चयन (Toggle Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-500">
                      {searchQuery
                        ? 'खोज के अनुरूप कोई छात्र नहीं मिला।'
                        : 'इस कक्षा / शाखा में कोई छात्र नामांकित नहीं हैं।'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const currentStatus: AttendanceStatus = todayAttendance[student.id] || 'Present';
                    const overallPct = getStudentOverallAttendancePct(student.id);
                    const isLowAttendance = overallPct !== null && overallPct < 75;

                    return (
                      <tr key={student.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-stone-900">{student.rollNo}</td>
                        <td className="p-3 font-semibold text-stone-900">
                          {student.name}
                          <span className="ml-1 text-stone-500 font-normal">({student.gender})</span>
                        </td>
                        <td className="p-3 text-stone-600">{student.class} - {student.section}</td>
                        <td className="p-3 text-center">
                          {overallPct === null ? (
                            <span className="text-stone-400 text-[11px] italic">अंकन शेष</span>
                          ) : isLowAttendance ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold border border-red-200"
                              title={`सत्र उपस्थिति ${overallPct}% (बोर्ड 75% न्यूनतम सीमा से कम)`}
                            >
                              <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                              <span>⚠️ {overallPct}% (कम)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                              {overallPct}%
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                currentStatus === 'Present'
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : currentStatus === 'Absent'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {currentStatus === 'Present'
                                ? 'उपस्थित (Present)'
                                : currentStatus === 'Absent'
                                ? 'अनुपस्थित (Absent)'
                                : 'अवकाश (Leave)'}
                            </span>
                            {currentStatus === 'Absent' && (
                              <button
                                onClick={() => {
                                  onOpenWhatsAppAlert({
                                    title: 'अनुपस्थिति WhatsApp अभिभावक अलर्ट',
                                    recipientName: student.name,
                                    recipientPhone: student.contact,
                                    studentClass: student.class,
                                    defaultMessage: `🚩 *सादर नमस्ते जी* 🚩\n*${currentSchool.hindiName || currentSchool.name}*\n--------------------------------\n*दैनिक उपस्थिति सूचना:*\nआपके पाल्य/पाल्या *${student.name}* (कक्षा: ${student.class}) आज दिनांक *${attendanceDate}* को विद्यालय में अनुपस्थित रहे हैं।\n\nकृपया अस्वस्थता अथवा अनुपस्थिति का कारण विद्यालय डायरी में दर्ज करें अथवा इस नंबर पर सूचित करने की कृपा करें।\n\nधन्यवाद!\n— कार्यालय, ${currentSchool.hindiName || currentSchool.name}`
                                  });
                                }}
                                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                                title="Send WhatsApp Absentee Alert"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-700" />
                                <span>WhatsApp</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex rounded-lg border border-stone-200 overflow-hidden shadow-xs">
                            <button
                              onClick={() => setStudentAttendance(student.id, attendanceDate, 'Present')}
                              className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                                currentStatus === 'Present'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-white text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => setStudentAttendance(student.id, attendanceDate, 'Absent')}
                              className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                                currentStatus === 'Absent'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => setStudentAttendance(student.id, attendanceDate, 'Leave')}
                              className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                                currentStatus === 'Leave'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-white text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              L
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Range / Monthly Summary View */
        <div className="space-y-6">
          {/* Summary Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-700">
              <div className="flex items-center gap-1.5">
                <span>प्रारंभ:</span>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={e => setRangeStart(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span>समाप्ति:</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={e => setRangeEnd(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <select
                value={attendanceClass}
                onChange={e => setAttendanceClass(e.target.value)}
                className="px-3 py-1 text-xs rounded-lg border border-stone-300 bg-white font-medium"
              >
                <option value="ALL">सभी कक्षाएं (All Classes)</option>
                {SSM_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportRangeSummaryCSV}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
              title="चयनित अवधि का सम्पूर्ण उपस्थिति सारांश CSV डाउनलोड करें"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-yellow-300" />
              <span>अवधि सारांश CSV निर्यात</span>
            </button>
          </div>

          {/* Range Summary KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase">कुल छात्र (Enrolled)</span>
              <p className="text-xl font-black text-stone-900 mt-1">{rangeStats.totalStudents}</p>
            </div>
            <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 shadow-2xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase">कुल अंकन दिवस (Days Marked)</span>
              <p className="text-xl font-black text-blue-900 mt-1">{rangeStats.distinctDates} दिन</p>
            </div>
            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">औसत उपस्थिति दर (Average Rate)</span>
              <p className="text-xl font-black text-emerald-900 mt-1">{rangeStats.avgPct}%</p>
            </div>
            <div className={`p-3.5 rounded-xl border shadow-2xs ${
              rangeStats.lowAttendanceCount > 0 ? 'bg-rose-50 border-rose-300' : 'bg-stone-50 border-stone-200'
            }`}>
              <span className={`text-[10px] font-bold uppercase ${
                rangeStats.lowAttendanceCount > 0 ? 'text-rose-700' : 'text-stone-500'
              }`}>
                75% से कम उपस्थिति छात्र
              </span>
              <p className={`text-xl font-black mt-1 ${
                rangeStats.lowAttendanceCount > 0 ? 'text-rose-800' : 'text-stone-700'
              }`}>
                {rangeStats.lowAttendanceCount}
              </p>
            </div>
          </div>

          {/* Search Bar for Summary */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="नाम, अनुक्रमांक (Roll No), या पिता के नाम से खोजें..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>हटाएं</span>
              </button>
            )}
          </div>

          {/* Range Summary Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">अनुक्रमांक</th>
                  <th className="p-3">छात्र का नाम</th>
                  <th className="p-3">कक्षा एवं वर्ग</th>
                  <th className="p-3 text-center">अंकन दिवस</th>
                  <th className="p-3 text-center text-emerald-700">उपस्थित</th>
                  <th className="p-3 text-center text-red-700">अनुपस्थित</th>
                  <th className="p-3 text-center text-amber-700">अवकाश</th>
                  <th className="p-3 text-center">अवधि दर (%)</th>
                  <th className="p-3 text-right">कार्य (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rangeSummaryData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-stone-500">
                      इस फ़िल्टर के अनुरूप कोई छात्र नहीं मिला।
                    </td>
                  </tr>
                ) : (
                  rangeSummaryData.map(({ student, totalMarked, presentCount, absentCount, leaveCount, pct, isLow }) => (
                    <tr key={student.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono font-bold text-stone-900">{student.rollNo}</td>
                      <td className="p-3 font-semibold text-stone-900">
                        {student.name}
                        <span className="ml-1 text-stone-500 font-normal">({student.gender})</span>
                      </td>
                      <td className="p-3 text-stone-600">{student.class} - {student.section}</td>
                      <td className="p-3 text-center font-mono">{totalMarked}</td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-700">{presentCount}</td>
                      <td className="p-3 text-center font-mono font-bold text-red-700">{absentCount}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-700">{leaveCount}</td>
                      <td className="p-3 text-center">
                        {pct === null ? (
                          <span className="text-stone-400 text-[11px] italic">अंकन नहीं</span>
                        ) : isLow ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold border border-red-200"
                            title={`अवधि उपस्थिति ${pct}% (75% से कम)`}
                          >
                            <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                            <span>⚠️ {pct}% (कम)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            {pct}%
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {student.contact && (
                          <button
                            onClick={() => {
                              onOpenWhatsAppAlert({
                                title: 'उपस्थिति सारांश WhatsApp अभिभावक संपर्क',
                                recipientName: student.name,
                                recipientPhone: student.contact,
                                studentClass: student.class,
                                defaultMessage: `🚩 *सादर नमस्ते जी* 🚩\n*${currentSchool.hindiName || currentSchool.name}*\n--------------------------------\n*उपस्थिति प्रगति सूचना:*\nआपके पाल्य/पाल्या *${student.name}* (कक्षा: ${student.class}) की अवधि (${rangeStart} से ${rangeEnd}) में उपस्थिति दर *${pct !== null ? `${pct}%` : 'अंकन शेष'}* रही है।\nकुल कार्य दिवस: ${totalMarked} | उपस्थित: ${presentCount} | अनुपस्थित: ${absentCount}\n\nनियमित उपस्थिति हेतु सहयोग अपेक्षित है।\n\nधन्यवाद!\n— कार्यालय, ${currentSchool.hindiName || currentSchool.name}`
                              });
                            }}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            title="अभिभावक को व्हाट्सएप पर अवधि उपस्थिति सूचना भेजें"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-700" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch Absentee WhatsApp Broadcaster Modal */}
      {showBatchAbsenteeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    दैनिक अनुपस्थिति WhatsApp प्रसारण (Absentee Broadcaster)
                  </h4>
                  <p className="text-xs text-emerald-100">
                    दिनांक: {attendanceDate} • कुल अनुपस्थित: {absentStudentsList.length} • प्रेषित: {Object.keys(sentStudentIds).filter(id => absentStudentsList.some(s => s.id === id)).length}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchAbsenteeModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Optional Custom Note Input */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  अतिरिक्त निर्देश / टिप्पणी (वैकल्पिक):
                </label>
                <input
                  type="text"
                  placeholder="उदा. कल चिकित्सा प्रमाण पत्र / अवकाश पत्र अवश्य भेजें"
                  value={customAbsentNote}
                  onChange={e => setCustomAbsentNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-stone-500">
                  यह निर्देश सभी अभिभावकों के संदेश में स्वतः जुड़ जाएगा।
                </span>
              </div>

              {/* Action Quick Button */}
              <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                <span className="text-xs font-bold text-stone-700">
                  अनुपस्थित छात्र सूची ({absentStudentsList.length})
                </span>
                <button
                  type="button"
                  onClick={handleSendNextPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>अगला प्रेषित करें (Send Next)</span>
                </button>
              </div>

              {/* Student Cards List */}
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {absentStudentsList.length === 0 ? (
                  <p className="p-6 text-center text-xs text-stone-500">
                    वर्तमान कक्षा में कोई छात्र अनुपस्थित नहीं है।
                  </p>
                ) : (
                  absentStudentsList.map(st => {
                    const isSent = Boolean(sentStudentIds[st.id]);
                    const cleanPhone = formatWhatsAppPhone(st.contact);
                    const hasValidPhone = cleanPhone && cleanPhone.length >= 10;

                    return (
                      <div
                        key={st.id}
                        className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                          isSent
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                              रोल {st.rollNo}
                            </span>
                            <span className="text-xs font-bold text-stone-900 truncate">
                              {st.name}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              ({st.class} - {st.section})
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-600 mt-0.5 flex items-center gap-2">
                            <span>पिता: {st.fatherName || 'अभिभावक'}</span>
                            <span>•</span>
                            <span className={hasValidPhone ? 'font-mono text-stone-700' : 'text-red-500 font-semibold'}>
                              {hasValidPhone ? `📱 ${st.contact}` : '⚠️ नंबर उपलब्ध नहीं'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isSent && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                              <Check className="w-3 h-3" />
                              <span>प्रेषित</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSendSingleAbsentee(st)}
                            disabled={!hasValidPhone}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
                              isSent
                                ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isSent ? 'पुनः भेजें' : 'WhatsApp'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-stone-600">
                प्रेषित:{' '}
                <strong className="text-emerald-700 font-bold">
                  {Object.keys(sentStudentIds).filter(id => absentStudentsList.some(s => s.id === id)).length}
                </strong>{' '}
                / {absentStudentsList.length}
              </span>
              <button
                type="button"
                onClick={() => setShowBatchAbsenteeModal(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-bold cursor-pointer transition"
              >
                सम्पन्न (Done)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminAttendanceTab = React.memo(AdminAttendanceTabComponent);
