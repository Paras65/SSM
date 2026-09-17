import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { exportAttendanceToCSV } from '../../../utils/csvExport';
import { SSM_CLASSES, type AttendanceStatus } from '../../../types';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  MessageSquare,
  Search,
  Users,
  X,
  XCircle
} from 'lucide-react';

interface WhatsAppAlertPayload {
  title: string;
  recipientName: string;
  recipientPhone: string;
  studentClass: string;
  defaultMessage: string;
}

interface AdminAttendanceTabProps {
  requirePro: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
  onOpenWhatsAppAlert: (payload: WhatsAppAlertPayload) => void;
}

const AdminAttendanceTabComponent: React.FC<AdminAttendanceTabProps> = ({
  requirePro,
  onOpenWhatsAppAlert
}) => {
  const {
    students,
    currentSchool,
    attendanceRecords,
    getAttendanceForDate,
    setStudentAttendance,
    bulkSetAttendance
  } = useSchool();
  const isPro = currentSchool.plan === 'pro';

  // Attendance controls
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceClass, setAttendanceClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayAttendance = useMemo(
    () => getAttendanceForDate(attendanceDate),
    [getAttendanceForDate, attendanceDate]
  );

  // Cumulative overall attendance percentage per student
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

  // Live KPI Summary stats for the current filter view
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

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            दैनिक उपस्थिति पंजिका (Daily Attendance Marker)
          </h3>
          <p className="text-xs text-stone-500">
            कक्षावार भैया-बहिनों की उपस्थिति, अनुपस्थिति एवं अवकाश का अंकन करें।
          </p>
        </div>

        {/* Date and Class Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>दिनांक:</span>
            <input
              type="date"
              value={attendanceDate}
              onChange={e => setAttendanceDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <select
            value={attendanceClass}
            onChange={e => setAttendanceClass(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
          >
            <option value="ALL">सभी कक्षाएं (All Classes)</option>
            {SSM_CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                requirePro(
                  'थोक उपस्थिति अंकन (Bulk Attendance)',
                  'सम्पूर्ण कक्षा की उपस्थिति एक क्लिक में दर्ज करना केवल प्रो योजना में उपलब्ध है। निःशुल्क योजना में आप छात्रवार उपस्थिति दर्ज कर सकते हैं।',
                  () => bulkSetAttendance(attendanceClass, attendanceDate, 'Present')
                );
              }}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1 cursor-pointer"
            >
              <span>सभी उपस्थित (Mark All Present)</span>
              {!isPro && <Lock className="w-2.5 h-2.5 text-white/80" />}
            </button>
            <button
              onClick={() => {
                requirePro(
                  'थोक उपस्थिति अंकन (Bulk Attendance)',
                  'सम्पूर्ण कक्षा की अनुपस्थिति एक क्लिक में दर्ज करना केवल प्रो योजना में उपलब्ध है।',
                  () => bulkSetAttendance(attendanceClass, attendanceDate, 'Absent')
                );
              }}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>सभी अनुपस्थित</span>
              {!isPro && <Lock className="w-2.5 h-2.5 text-red-700" />}
            </button>
            <button
              onClick={() => {
                requirePro(
                  'दैनिक उपस्थिति CSV निर्यात',
                  'दैनिक उपस्थिति पंजिका का एक्सेल/CSV प्रारूप में बैकअप व निर्यात केवल प्रो योजना में उपलब्ध है।',
                  () => exportAttendanceToCSV(attendanceRecords, students, attendanceDate)
                );
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              title="Export Attendance Sheet to CSV"
            >
              <Download className="w-3.5 h-3.5 text-green-400" />
              <span>उपस्थिति CSV</span>
              {!isPro && <Lock className="w-2.5 h-2.5 text-amber-300 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Counter Strip */}
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

      {/* Attendance Roster Table */}
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
                              requirePro(
                                'व्हाट्सएप त्वरित अनुपस्थिति अलर्ट (WhatsApp Alerts)',
                                'अभिभावकों के मोबाइल पर अनुपस्थिति का सीधा व्हाट्सएप संदेश भेजना केवल प्रो योजना में उपलब्ध है।',
                                () => {
                                  onOpenWhatsAppAlert({
                                    title: 'अनुपस्थिति WhatsApp अभिभावक अलर्ट',
                                    recipientName: student.name,
                                    recipientPhone: student.contact,
                                    studentClass: student.class,
                                    defaultMessage: `🚩 *सादर नमस्ते जी* 🚩\n*${currentSchool.hindiName || currentSchool.name}*\n--------------------------------\n*दैनिक उपस्थिति सूचना:*\nआपके पाल्य/पाल्या *${student.name}* (कक्षा: ${student.class}) आज दिनांक *${attendanceDate}* को विद्यालय में अनुपस्थित रहे हैं।\n\nकृपया अस्वस्थता अथवा अनुपस्थिति का कारण विद्यालय डायरी में दर्ज करें अथवा इस नंबर पर सूचित करने की कृपा करें।\n\nधन्यवाद!\n— कार्यालय, ${currentSchool.hindiName || currentSchool.name}`
                                  });
                                }
                              );
                            }}
                            className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Send WhatsApp Absentee Alert"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-700" />
                            <span>WhatsApp</span>
                            {!isPro && <Lock className="w-2.5 h-2.5 text-emerald-700 ml-0.5" />}
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
  );
};

export const AdminAttendanceTab = React.memo(AdminAttendanceTabComponent);

