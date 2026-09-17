import React, { useState, useEffect, useCallback } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import { PragatiPatraModal } from '../admin/PragatiPatraModal';
import { FeeReceiptModal } from '../admin/FeeReceiptModal';
import { StudentIdCardModal } from '../admin/StudentIdCardModal';
import { TransferCertificateModal } from '../admin/TransferCertificateModal';
import { LeaveApplicationModal } from '../common/LeaveApplicationModal';
import { AdmitCardModal } from '../admin/AdmitCardModal';
import { CharacterCertificateModal } from '../admin/CharacterCertificateModal';
import { BonafideCertificateModal } from '../admin/BonafideCertificateModal';
import { HelpTooltip } from '../common/HelpTooltip';
import type { Homework, Exam, Student, FeeRecord, ReportCard, AttendanceRecord } from '../../types';
import { SSM_CLASSES } from '../../types';
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
    setSelectedStudentId,
    feeRecords,
    reportCards,
    notices
  } = useSchool();

  const [isStudentAuthenticated, setIsStudentAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem('ssm_student_token'))
  );
  const [rollNo, setRollNo] = useState('');
  const [contact, setContact] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [pin, setPin] = useState('');
  const [dob, setDob] = useState('');
  const [showSecurityFields, setShowSecurityFields] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const classes = SSM_CLASSES;
  const [liveStudent, setLiveStudent] = useState<Student | null>(null);
  const [liveFees, setLiveFees] = useState<FeeRecord[]>([]);
  const [liveReports, setLiveReports] = useState<ReportCard[]>([]);
  const [liveAttendance, setLiveAttendance] = useState<AttendanceRecord[]>([]);
  const [isStudentDataLoading, setIsStudentDataLoading] = useState(() => Boolean(sessionStorage.getItem('ssm_student_token')));

  const fetchStudentSelfData = useCallback(async () => {
    if (!sessionStorage.getItem('ssm_student_token')) return;
    setIsStudentDataLoading(true);
    try {
      const data = await api.getStudentMe();
      if (data && data.student) {
        setLiveStudent(data.student);
        setLiveFees(data.fees || []);
        setLiveReports(data.reportCards || []);
        setLiveAttendance(data.attendance || []);
      }
    } catch (err) {
      console.warn('Could not fetch student self data:', err);
    } finally {
      setIsStudentDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isStudentAuthenticated) {
      fetchStudentSelfData();
    }
  }, [isStudentAuthenticated, fetchStudentSelfData]);

  const authenticatedStudentId = sessionStorage.getItem('ssm_student_id');
  const currentStudent = liveStudent || students.find(s => s.id === authenticatedStudentId);
  const studentFee = liveFees.length > 0
    ? liveFees[0]
    : (currentStudent ? feeRecords.find(f => f.studentId === currentStudent.id) : undefined);
  const studentReport = liveReports.length > 0
    ? liveReports[0]
    : (currentStudent ? reportCards.find(r => r.studentId === currentStudent.id) : undefined);

  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [completedHw, setCompletedHw] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentStudent) return;

    api.getHomework(currentSchool.id, currentStudent.class)
      .then(data => setHomeworkList(data))
      .catch(() => {});
  }, [currentSchool.id, currentStudent?.class, currentStudent?.id]);

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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAdmitCardModal, setShowAdmitCardModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [showBonafideModal, setShowBonafideModal] = useState(false);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  const isAnyStudentModalOpen = Boolean(
    showReportModal ||
    showFeeModal ||
    showIdCardModal ||
    showTcModal ||
    showLeaveModal ||
    showAdmitCardModal ||
    showCharacterModal ||
    showBonafideModal
  );

  const closeAllStudentModals = useCallback(() => {
    setShowReportModal(false);
    setShowFeeModal(false);
    setShowIdCardModal(false);
    setShowTcModal(false);
    setShowLeaveModal(false);
    setShowAdmitCardModal(false);
    setShowCharacterModal(false);
    setShowBonafideModal(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAnyStudentModalOpen) {
          e.preventDefault();
          closeAllStudentModals();
        } else {
          e.preventDefault();
          setViewMode('public');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnyStudentModalOpen, closeAllStudentModals, setViewMode]);

  useEffect(() => {
    const handlePopState = () => {
      if (isAnyStudentModalOpen) {
        closeAllStudentModals();
      } else {
        setViewMode('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAnyStudentModalOpen, closeAllStudentModals, setViewMode]);

  useEffect(() => {
    if (!currentSchool.id) return;
    api.getExams(currentSchool.id)
      .then(exams => {
        if (exams && exams.length > 0) {
          setActiveExam(exams[0]);
        }
      })
      .catch(() => {});
  }, [currentSchool.id]);

  const handleStudentLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const result = await api.loginStudent(
        currentSchool.id,
        rollNo,
        contact,
        studentClass || undefined,
        dob || undefined,
        pin || undefined
      );
      setSelectedStudentId(result.student.id);
      setLiveStudent(result.student);
      setIsStudentAuthenticated(true);
      fetchStudentSelfData();
    } catch (error: any) {
      if (error.code === 'PIN_REQUIRED') {
        setShowSecurityFields(true);
        setLoginError('इस छात्र खाते के लिए विद्यालय द्वारा 4-अंकीय सुरक्षा पिन निर्धारित किया गया है। कृपया नीचे पिन दर्ज करें।');
      } else if (error.code === 'AMBIGUOUS_STUDENT_MATCH' || error.message?.includes('सहोदर') || error.message?.includes('कक्षा')) {
        setLoginError('समान अनुक्रमांक व मोबाइल पर एक से अधिक छात्र पंजीकृत हैं। कृपया ऊपर अपनी कक्षा का चयन करें।');
      } else {
        setLoginError(error.message || 'छात्र विवरण सत्यापित नहीं हो सके। कृपया अनुक्रमांक व मोबाइल की जांच करें।');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStudentLogout = () => {
    sessionStorage.removeItem('ssm_student_token');
    sessionStorage.removeItem('ssm_student_id');
    setLiveStudent(null);
    setLiveFees([]);
    setLiveReports([]);
    setLiveAttendance([]);
    setIsStudentAuthenticated(false);
    setViewMode('public');
  };

  if (!isStudentAuthenticated) {
    return (
      <div className="min-h-screen bg-amber-50/40 flex items-center justify-center p-4">
        <form onSubmit={handleStudentLogin} className="bg-white w-full max-w-md rounded-3xl border-2 border-orange-200 shadow-xl p-6 sm:p-8 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center text-3xl">🪷</div>
            <h1 className="text-xl font-black text-stone-900 mt-3">छात्र एवं अभिभावक पोर्टल</h1>
            <p className="text-xs text-stone-500 mt-1">अपनी शाखा, अनुक्रमांक और पंजीकृत मोबाइल से प्रवेश करें</p>
          </div>
          {loginError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{loginError}</div>}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">विद्यालय शाखा</label>
            <div className="px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-sm font-semibold text-stone-800">{currentSchool.hindiName} ({currentSchool.city})</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">अनुक्रमांक (Roll No)</label>
              <input required value={rollNo} onChange={event => setRollNo(event.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm" placeholder="उदा. 101" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">कक्षा (सहोदर हेतु)</label>
                <HelpTooltip
                  title="सहोदर टकराव निवारण"
                  content="यदि एक ही मोबाइल नंबर पर दो भाई-बहन पंजीकृत हैं, तो उस बच्चे की कक्षा चुनें जिसका पोर्टल खोलना चाहते हैं।"
                />
              </div>
              <select value={studentClass} onChange={event => setStudentClass(event.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white">
                <option value="">सभी कक्षाएं</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">पंजीकृत मोबाइल नंबर</label>
              <HelpTooltip
                title="मोबाइल नंबर सहायता"
                content="विद्यालय में पंजीकृत 10 अंकों का मोबाइल नंबर दर्ज करें। +91 या 0 लगाने की आवश्यकता नहीं है।"
              />
            </div>
            <input required type="tel" value={contact} onChange={event => setContact(event.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="+91 98765 43210" />
          </div>

          <div className="pt-1 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowSecurityFields(prev => !prev)}
              className="text-xs font-semibold text-orange-700 hover:text-orange-800 flex items-center gap-1.5 cursor-pointer py-1"
            >
              <span className="text-[10px]">{showSecurityFields ? '▼' : '▶'}</span>
              <span>सुरक्षा पिन / जन्म तिथि (वैकल्पिक सुरक्षा जांच)</span>
            </button>
            {showSecurityFields && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">सुरक्षा पिन (PIN)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                    placeholder="उदा. 1234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">जन्म तिथि (DOB)</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoggingIn} className="w-full py-3 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-60 text-white text-sm font-bold">{isLoggingIn ? 'सत्यापन हो रहा है...' : 'सुरक्षित प्रवेश करें'}</button>
          <button type="button" onClick={() => setViewMode('public')} className="w-full py-2 text-xs font-semibold text-stone-600 hover:text-orange-700">वेबसाइट पर लौटें</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40 text-stone-900 flex flex-col w-full max-w-full overflow-x-hidden">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-800 via-amber-700 to-orange-900 text-white shadow-md sticky top-0 z-30 w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={handleStudentLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-orange-900/80 hover:bg-orange-900 text-xs font-semibold text-amber-200 transition-colors shrink-0 cursor-pointer shadow-xs"
              title="मुख्य वेबसाइट पर लौटें / लॉगआउट"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>वेबसाइट पर लौटें</span>
            </button>
            <div className="h-5 w-px bg-orange-700 hidden sm:block shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg sm:text-xl shrink-0">🪷</span>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-amber-100 truncate">
                  छात्र एवं अभिभावक पोर्टल
                </h1>
                <span className="text-[10px] text-orange-200 hidden sm:block truncate">
                  {currentSchool.hindiName}
                </span>
              </div>
            </div>
          </div>

          {/* Authenticated student identity */}
          {currentStudent && (
            <div className="flex items-center gap-2 text-xs shrink-0 ml-auto">
              <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-orange-950 border border-orange-700 text-amber-100 text-[11px] sm:text-xs font-semibold truncate max-w-[130px] sm:max-w-none">
                {currentStudent.name} ({currentStudent.class})
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      {isStudentDataLoading ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-12 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-orange-200 shadow-xl text-center max-w-md space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base font-bold text-stone-900">छात्र विवरण लोड हो रहा है...</h3>
            <p className="text-xs text-stone-500">कृपया प्रतीक्षा करें, आपकी शैक्षणिक व शुल्क जानकारी संकलित की जा रही है।</p>
          </div>
        </main>
      ) : !currentStudent ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-12 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-red-200 shadow-xl text-center max-w-lg space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center text-3xl mx-auto shadow-xs border border-red-200">
              ⚠️
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">
                छात्र सत्र समाप्त या अमान्य
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                छात्र प्रमाणीकरण सत्र समाप्त हो चुका है अथवा रिकॉर्ड उपलब्ध नहीं है।
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <button
                onClick={handleStudentLogout}
                className="px-5 py-2.5 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                पुनः लॉगिन करें
              </button>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-5 sm:space-y-6 overflow-x-hidden">
        
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
                  onClick={() => setShowLeaveModal(true)}
                  className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-amber-300 transition-colors shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-orange-700" />
                  <span>अवकाश आवेदन (Apply Leave)</span>
                </button>

                {activeExam && (
                  <button
                    onClick={() => setShowAdmitCardModal(true)}
                    className="px-3.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-emerald-300 transition-colors shadow-xs"
                  >
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>परीक्षा प्रवेश पत्र (Admit Card)</span>
                  </button>
                )}

                <button
                  onClick={() => setShowTcModal(true)}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-stone-300 transition-colors shadow-xs"
                >
                  <FileText className="w-4 h-4 text-stone-600" />
                  <span>स्थानांतरण प्रमाण पत्र (TC)</span>
                </button>

                <button
                  onClick={() => setShowCharacterModal(true)}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-stone-300 transition-colors shadow-xs"
                >
                  <span>📜 चरित्र प्रमाण पत्र</span>
                </button>

                <button
                  onClick={() => setShowBonafideModal(true)}
                  className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border border-stone-300 transition-colors shadow-xs"
                >
                  <span>📄 अध्ययनरत प्रमाण पत्र</span>
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

      {showLeaveModal && currentStudent && (
        <LeaveApplicationModal
          student={currentStudent}
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
        />
      )}

      {showAdmitCardModal && currentStudent && activeExam && (
        <AdmitCardModal
          student={currentStudent}
          exam={activeExam}
          onClose={() => setShowAdmitCardModal(false)}
        />
      )}

      {showCharacterModal && currentStudent && (
        <CharacterCertificateModal
          student={currentStudent}
          onClose={() => setShowCharacterModal(false)}
        />
      )}

      {showBonafideModal && currentStudent && (
        <BonafideCertificateModal
          student={currentStudent}
          onClose={() => setShowBonafideModal(false)}
        />
      )}

    </div>
  );
};
