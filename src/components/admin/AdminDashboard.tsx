import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { AddStudentModal } from './AddStudentModal';
import { FeeReceiptModal } from './FeeReceiptModal';
import { PragatiPatraModal } from './PragatiPatraModal';
import { StudentIdCardModal } from './StudentIdCardModal';
import { TransferCertificateModal } from './TransferCertificateModal';
import { SchoolManagementModal } from './SchoolManagementModal';
import { StaffSalarySlipModal } from './StaffSalarySlipModal';
import { WhatsAppAlertModal } from '../common/WhatsAppAlertModal';
import { TimetableSection } from '../common/TimetableSection';
import { StudentPhotoUploadModal } from './StudentPhotoUploadModal';
import { ProUpgradeModal } from './ProUpgradeModal';
import { BulkStudentImportModal } from './BulkStudentImportModal';
import { ExamManagementModal } from './ExamManagementModal';
import { AdmitCardModal } from './AdmitCardModal';
import { TimetableManagerModal } from './TimetableManagerModal';
import { LeaveManagementModal } from './LeaveManagementModal';
import { TransportManagementModal } from './TransportManagementModal';
import { LibraryManagementModal } from './LibraryManagementModal';
import { InventoryManagementModal } from './InventoryManagementModal';
import { CharacterCertificateModal } from './CharacterCertificateModal';
import { BonafideCertificateModal } from './BonafideCertificateModal';
import { BulkNotificationModal } from './BulkNotificationModal';
import { AuditLogModal } from './AuditLogModal';
import { SessionManagementModal } from './SessionManagementModal';
import { TabulationRegisterModal } from './TabulationRegisterModal';
import { HelpGuideModal } from './HelpGuideModal';
import { HelpTooltip } from '../common/HelpTooltip';
import { exportStudentsToCSV, exportFeesToCSV, exportAttendanceToCSV } from '../../utils/csvExport';
import { generateReportCardWhatsAppLink } from '../../utils/whatsappAlerts';
import { api } from '../../services/api';
import type { Student, FeeRecord, ReportCard, Homework, Staff, Exam } from '../../types';
import {
  Users,
  CheckCircle2,
  Receipt,
  Plus,
  Search,
  ArrowLeft,
  GraduationCap,
  Calendar,
  Printer,
  Sparkles,
  Award,
  Bell,
  Trash2,
  RefreshCw,
  IdCard,
  Check,
  Download,
  FileText,
  Building2,
  BookOpen,
  Briefcase,
  MessageSquare,
  Camera,
  IndianRupee,
  Crown,
  Lock,
  Shield,
  FileSpreadsheet
  ,LogOut
} from 'lucide-react';

type AdminTab = 'overview' | 'students' | 'attendance' | 'fees' | 'reports' | 'homework' | 'staff' | 'admissions' | 'notices';

export const AdminDashboard: React.FC = () => {
  const {
    setViewMode,
    dbStatus,
    refreshFromDb,
    schools,
    currentSchool,
    setCurrentSchoolId,
    students,
    deleteStudent,
    attendanceRecords,
    setStudentAttendance,
    bulkSetAttendance,
    getAttendanceForDate,
    feeRecords,
    markFeePaid,
    reportCards,
    notices,
    addNotice,
    deleteNotice
  } = useSchool();

  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleLogout = () => {
    api.logoutAdmin();
    setViewMode('public');
  };

  const isPro = currentSchool.plan === 'pro';
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<{ name: string; desc?: string } | null>(null);

  const requirePro = (featureName: string, featureDesc: string, onAllowed: () => void) => {
    if (isPro) {
      onAllowed();
    } else {
      setUpgradeModalFeature({ name: featureName, desc: featureDesc });
    }
  };

  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolModalMode, setSchoolModalMode] = useState<'list' | 'add'>('list');
  
  // Selected items for modals
  const [activeFeeModal, setActiveFeeModal] = useState<{ fee: FeeRecord; student: Student } | null>(null);
  const [activeReportModal, setActiveReportModal] = useState<{ report: ReportCard; student: Student } | null>(null);
  const [activeIdCardStudent, setActiveIdCardStudent] = useState<Student | null>(null);
  const [activeTcStudent, setActiveTcStudent] = useState<Student | null>(null);

  // Homework & Staff State
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [developerMetrics, setDeveloperMetrics] = useState({
    students: 0,
    present: 0,
    attendanceRate: 0,
    collected: 0,
    pending: 0,
    admissions: 0
  });
  const isDeveloper = sessionStorage.getItem('ssm_admin_role') === 'developer';

  // New Modals State
  const [activeSalarySlipStaff, setActiveSalarySlipStaff] = useState<Staff | null>(null);
  const [activeWhatsAppAlert, setActiveWhatsAppAlert] = useState<{
    title: string;
    recipientName: string;
    recipientPhone: string;
    studentClass: string;
    defaultMessage: string;
  } | null>(null);
  const [activePhotoStudent, setActivePhotoStudent] = useState<Student | null>(null);

  // New Features Modal States
  const [showExamModal, setShowExamModal] = useState(false);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showBulkNotificationModal, setShowBulkNotificationModal] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [showSessionManagementModal, setShowSessionManagementModal] = useState(false);
  const [showHelpGuideModal, setShowHelpGuideModal] = useState(false);
  const [showTabulationModal, setShowTabulationModal] = useState(false);

  const [activeAdmitCard, setActiveAdmitCard] = useState<{ student: Student; exam: Exam } | null>(null);
  const [activeCharacterStudent, setActiveCharacterStudent] = useState<Student | null>(null);
  const [activeBonafideStudent, setActiveBonafideStudent] = useState<Student | null>(null);

  // Homework creation form state
  const [showAddHomework, setShowAddHomework] = useState(false);
  const [hwClass, setHwClass] = useState('Class 8');
  const [hwSubject, setHwSubject] = useState('');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDescription, setHwDescription] = useState('');
  const [hwAssignedBy, setHwAssignedBy] = useState('');
  const [hwDueDate, setHwDueDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  // Staff creation form state
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [stfName, setStfName] = useState('');
  const [stfGender, setStfGender] = useState<'Acharya' | 'Didi'>('Acharya');
  const [stfDesignation, setStfDesignation] = useState('');
  const [stfQualification, setStfQualification] = useState('');
  const [stfSubjects, setStfSubjects] = useState('');
  const [stfPhone, setStfPhone] = useState('');
  const [stfMonthlySalary, setStfMonthlySalary] = useState(25000);

  const fetchHomeworkAndStaff = useCallback(async () => {
    try {
      const [hwRes, staffRes] = await Promise.all([
        api.getHomework(currentSchool.id),
        api.getStaff(currentSchool.id)
      ]);
      setHomeworkList(hwRes);
      setStaffList(staffRes);
    } catch (err) {
      console.error('Error fetching homework and staff:', err);
    }
  }, [currentSchool.id]);

  useEffect(() => {
    fetchHomeworkAndStaff();
  }, [fetchHomeworkAndStaff]);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwSubject || !hwTitle || !hwDescription) {
      showWarning('कृपया विषय, शीर्षक और विवरण भरें।');
      return;
    }
    try {
      await api.createHomework({
        schoolId: currentSchool.id,
        class: hwClass,
        subject: hwSubject,
        title: hwTitle,
        description: hwDescription,
        assignedBy: hwAssignedBy || 'आचार्य जी',
        dueDate: hwDueDate,
        date: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      showSuccess('गृहकार्य सफलतापूर्वक प्रेषित किया गया!');
      setHwSubject('');
      setHwTitle('');
      setHwDescription('');
      setShowAddHomework(false);
      fetchHomeworkAndStaff();
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!confirm('क्या आप इस गृहकार्य को हटाना चाहते हैं?')) return;
    try {
      await api.deleteHomework(id);
      showSuccess('गृहकार्य सफलतापूर्वक हटा दिया गया!');
      setHomeworkList(prev => prev.filter(h => h.id !== id));
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stfName || !stfDesignation || !stfPhone) {
      showWarning('कृपया नाम, पद एवं संपर्क नंबर भरें।');
      return;
    }
    try {
      const basic = Math.round(stfMonthlySalary * 0.65);
      const da = Math.round(stfMonthlySalary * 0.35);
      const pf = Math.round(basic * 0.1);
      await api.createStaff({
        schoolId: currentSchool.id,
        name: stfName,
        gender: stfGender,
        designation: stfDesignation,
        qualification: stfQualification,
        subjects: stfSubjects,
        phone: stfPhone,
        monthlySalary: Number(stfMonthlySalary),
        basicPay: basic,
        daHra: da,
        pfDeduction: pf,
        samitiDeduction: 500,
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      showSuccess('नए आचार्य / कर्मचारी सफलतापूर्वक जोड़े गए!');
      setStfName('');
      setStfDesignation('');
      setStfQualification('');
      setStfSubjects('');
      setStfPhone('');
      setShowAddStaff(false);
      fetchHomeworkAndStaff();
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('क्या आप इस आचार्य/कर्मचारी का रिकॉर्ड हटाना चाहते हैं?')) return;
    try {
      await api.deleteStaff(id);
      showSuccess('आचार्य/कर्मचारी का रिकॉर्ड सफलतापूर्वक हटाया गया!');
      setStaffList(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  // Admissions list
  const [admissions, setAdmissions] = useState<any[]>([]);

  useEffect(() => {
    api.getAdmissions().then(res => setAdmissions(res)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isDeveloper || schools.length === 0) return;

    const loadDeveloperMetrics = async () => {
      const today = new Date().toISOString().split('T')[0];
      const branchResults = await Promise.allSettled(schools.map(async school => {
        const [branchStudents, branchAttendance, branchFees, branchAdmissions] = await Promise.all([
          api.getStudents(school.id),
          api.getAttendance(today, school.id),
          api.getFees(school.id),
          api.getAdmissions(school.id)
        ]);
        return {
          students: branchStudents.length,
          present: branchAttendance.filter(record => record.status === 'Present').length,
          marked: branchAttendance.length,
          collected: branchFees.filter(fee => fee.status === 'Paid').reduce((sum, fee) => sum + fee.paidAmount, 0),
          pending: branchFees.reduce((sum, fee) => sum + (fee.totalAmount - fee.paidAmount), 0),
          admissions: branchAdmissions.filter(admission => admission.status !== 'Admitted').length
        };
      }));

      const branchMetrics = branchResults
        .filter((result): result is PromiseFulfilledResult<{
          students: number;
          present: number;
          marked: number;
          collected: number;
          pending: number;
          admissions: number;
        }> => result.status === 'fulfilled')
        .map(result => result.value);

      const totals = branchMetrics.reduce((sum, branch) => ({
        students: sum.students + branch.students,
        present: sum.present + branch.present,
        marked: sum.marked + branch.marked,
        collected: sum.collected + branch.collected,
        pending: sum.pending + branch.pending,
        admissions: sum.admissions + branch.admissions
      }), { students: 0, present: 0, marked: 0, collected: 0, pending: 0, admissions: 0 });

      setDeveloperMetrics({
        students: totals.students,
        present: totals.present,
        attendanceRate: totals.students > 0 ? Math.round((totals.present / Math.max(totals.marked, totals.students)) * 100) : 0,
        collected: totals.collected,
        pending: totals.pending,
        admissions: totals.admissions
      });
    };

    loadDeveloperMetrics().catch(error => console.error('Error loading developer metrics:', error));
  }, [isDeveloper, schools]);

  const handleApproveAdmission = async (id: string) => {
    try {
      const res = await api.approveAdmission(id);
      if (res.success) {
        showSuccess(`प्रवेश स्वीकृत हुआ! ${res.student.name} को छात्र पंजिका में जोड़ दिया गया है।`);
        await refreshFromDb();
        const updatedAdmissions = await api.getAdmissions();
        setAdmissions(updatedAdmissions);
      }
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    if (!confirm('क्या आप इस प्रवेश आवेदन को हटाना चाहते हैं?')) return;
    try {
      await api.deleteAdmission(id);
      showSuccess('प्रवेश आवेदन सफलतापूर्वक हटाया गया!');
      setAdmissions(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  // Student directory filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');

  // Attendance controls
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceClass, setAttendanceClass] = useState<string>('ALL');

  // New Notice form
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'Academics' | 'Events' | 'Examinations' | 'Holidays' | 'Vidya Bharati'>('Academics');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);

  // Calculations for overview (memoized for performance)
  const totalStudents = students.length;
  const { totalBhaiya, totalBahin } = useMemo(() => {
    let bhaiya = 0;
    let bahin = 0;
    for (let i = 0; i < students.length; i++) {
      if (students[i].gender === 'Bhaiya') bhaiya++;
      else if (students[i].gender === 'Bahin') bahin++;
    }
    return { totalBhaiya: bhaiya, totalBahin: bahin };
  }, [students]);
  
  const todayAttendance = useMemo(() => getAttendanceForDate(attendanceDate), [getAttendanceForDate, attendanceDate]);
  const { presentCount, attendanceRate } = useMemo(() => {
    const vals = Object.values(todayAttendance);
    let present = 0;
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === 'Present') present++;
    }
    const marked = vals.length;
    const rate = totalStudents > 0 ? Math.round((present / (marked || totalStudents)) * 100) : 0;
    return { presentCount: present, attendanceRate: rate };
  }, [todayAttendance, totalStudents]);

  const { totalFeeCollected, totalFeePending } = useMemo(() => {
    let collected = 0;
    let pending = 0;
    for (let i = 0; i < feeRecords.length; i++) {
      const f = feeRecords[i];
      if (f.status === 'Paid') collected += f.paidAmount;
      pending += (f.totalAmount - f.paidAmount);
    }
    return { totalFeeCollected: collected, totalFeePending: pending };
  }, [feeRecords]);

  // Filtered students (memoized search & filter)
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter(student => {
      const matchesSearch = !q ||
        student.name.toLowerCase().includes(q) ||
        student.rollNo.toLowerCase().includes(q) ||
        student.fatherName.toLowerCase().includes(q);
      const matchesClass = selectedClass === 'ALL' || student.class.includes(selectedClass);
      const matchesGender = selectedGender === 'ALL' || student.gender === selectedGender;
      return matchesSearch && matchesClass && matchesGender;
    });
  }, [students, searchQuery, selectedClass, selectedGender]);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    addNotice({
      title: newNoticeTitle,
      category: newNoticeCategory,
      content: newNoticeContent,
      date: new Date().toISOString().split('T')[0],
      isUrgent: newNoticeUrgent
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeUrgent(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col w-full max-w-full overflow-x-hidden">
      
      {/* Top Bar for Admin */}
      <header className="bg-orange-900 text-white sticky top-0 z-30 shadow-md w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
          
          {/* Brand & Left Actions */}
          <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-800/80 hover:bg-orange-800 text-xs font-semibold text-amber-200 transition-colors shrink-0"
                title="वेबसाइट पर लौटें"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">वेबसाइट पर लौटें</span>
              </button>
              <div className="h-6 w-px bg-orange-700 hidden sm:block shrink-0" />
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                <span className="text-lg sm:text-xl shrink-0">🪷</span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs sm:text-sm font-bold text-amber-100 leading-tight truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[240px] md:max-w-none">
                    {currentSchool.hindiName}
                  </h2>
                  <span className="text-[10px] text-orange-300 font-medium hidden sm:block truncate">
                    सत्र 2025-26 • {currentSchool.prant} • प्रशासकीय नियंत्रण पटल
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-only Quick Buttons */}
            <div className="flex items-center gap-1.5 sm:hidden shrink-0">
              <button
                onClick={() => setShowAddStudent(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-white text-[11px] shadow-xs shrink-0"
                title="नया छात्र प्रवेश"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>छात्र</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white text-xs font-bold shrink-0"
                title="लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Controls: Branch Switcher, Plan, Sync, Desktop Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 text-xs w-full sm:w-auto pb-0.5 sm:pb-0">
            {/* School / Branch Switcher */}
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-orange-950 border border-orange-800 text-[11px] font-bold text-amber-200 min-w-0 max-w-[55%] sm:max-w-none">
              <Building2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <select
                value={currentSchool.id}
                onChange={(e) => {
                  if (e.target.value === 'ADD_NEW') {
                    setSchoolModalMode('add');
                    setShowSchoolModal(true);
                  } else {
                    setCurrentSchoolId(e.target.value);
                  }
                }}
                className="bg-transparent border-none text-[11px] font-bold text-amber-100 focus:outline-none cursor-pointer truncate w-full max-w-[110px] xs:max-w-[140px] sm:max-w-[170px] lg:max-w-[220px]"
                title="Switch School Branch"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id} className="text-stone-900 font-medium">
                    {s.city} ({s.prant})
                  </option>
                ))}
                <option value="ADD_NEW" className="text-orange-900 font-bold">+ नई शाखा जोड़ें...</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Plan Badge */}
              {isPro ? (
                <span
                  title="प्रो योजना सक्रिय है"
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 text-amber-200 text-[10px] sm:text-[11px] font-bold shadow-xs shrink-0"
                >
                  <Crown className="w-3 h-3 text-yellow-300 fill-yellow-400 shrink-0" />
                  <span className="hidden md:inline">प्रो सक्रिय</span>
                  <span>PRO 👑</span>
                </span>
              ) : (
                <button
                  onClick={() => setUpgradeModalFeature({
                    name: 'विद्या भारती प्रो ईआरपी',
                    desc: 'अपनी शाखा को प्रो योजना में अपग्रेड करें और 360° समग्र प्रगति पत्र, आचार्य पेरोल, व्हाट्सएप अलर्ट आदि अनलॉक करें।'
                  })}
                  title="निःशुल्क योजना सक्रिय है। प्रो में अपग्रेड करने हेतु क्लिक करें।"
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-[10px] sm:text-[11px] font-bold hover:bg-emerald-900 transition cursor-pointer shadow-xs shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>FREE</span>
                  <span className="text-[9px] px-1 py-0.2 bg-amber-400 text-stone-950 font-black rounded uppercase">
                    अपग्रेड ⚡
                  </span>
                </button>
              )}

              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-950 border border-orange-800 text-[11px] font-semibold shrink-0">
                <span className={`w-2 h-2 rounded-full ${
                  dbStatus === 'connected' ? 'bg-green-400 animate-pulse' : dbStatus === 'connecting' ? 'bg-yellow-400 animate-ping' : 'bg-stone-400'
                }`} />
                <span className="hidden md:inline text-amber-200">
                  {dbStatus === 'connected' ? 'MongoDB' : 'Offline'}
                </span>
                <button
                  onClick={() => refreshFromDb()}
                  className="p-0.5 hover:text-white text-orange-300"
                  title="Sync data with MongoDB"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setSchoolModalMode('list');
                setShowSchoolModal(true);
              }}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-800 hover:bg-orange-700 text-amber-200 text-[11px] font-bold border border-orange-700 transition-colors shrink-0"
              title="Manage all school branches"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>शाखाएं ({schools.length})</span>
            </button>

            <button
              onClick={() => setShowSessionManagementModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold border border-amber-400/40 transition-colors shrink-0"
              title="सत्र प्रबंधन, छात्र प्रोन्नति एवं बकाया शुल्क अंतरण"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>सत्र: {currentSchool.currentAcademicYear || '2025-26'} 🔄</span>
            </button>

            <span className="hidden lg:inline-block px-2.5 py-1 bg-orange-950 rounded-full border border-orange-800 text-amber-200 shrink-0">
              प्रधानाचार्य: {currentSchool.principalName}
            </span>

            {/* Desktop Logout and Add Student */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white text-xs font-bold transition-colors shrink-0"
              title="व्यवस्थापक सत्र से लॉगआउट करें"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>

            <button
              onClick={() => setShowAddStudent(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 font-bold text-white shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नया छात्र</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto text-xs font-medium border-t border-orange-800/60 w-full max-w-full scrollbar-none">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'overview'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            मुख्य पृष्ठ (Overview)
          </button>
          <button
            onClick={() => setCurrentTab('students')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'students'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            छात्र पंजिका ({totalStudents} छात्र)
          </button>
          <button
            onClick={() => setCurrentTab('attendance')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'attendance'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            दैनिक उपस्थिति (Attendance)
          </button>
          <button
            onClick={() => setCurrentTab('fees')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'fees'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            शुल्क प्रबंधन व रसीद (Fees)
          </button>
          <button
            onClick={() => {
              requirePro(
                '360° समग्र प्रगति पत्र (Holistic Report Cards)',
                'NEP 2020 एवं विद्या भारती 5 आधार विषयों (योग, शारीरिक, संगीत, संस्कृत, नैतिक शिक्षा) सहित समग्र प्रगति पत्र केवल प्रो योजना में उपलब्ध है।',
                () => setCurrentTab('reports')
              );
            }}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap inline-flex items-center gap-1.5 ${
              currentTab === 'reports'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <span>प्रगति पत्र (Report Cards)</span>
            {!isPro && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/50 text-[9px] font-black text-yellow-300 inline-flex items-center gap-0.5 uppercase">
                <Lock className="w-2.5 h-2.5 text-yellow-300" />
                <span>PRO</span>
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('homework')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'homework'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            दैनिक गृहकार्य ({homeworkList.length})
          </button>
          <button
            onClick={() => {
              requirePro(
                'आचार्य एवं वेतन प्रबंधन (Staff & Payroll)',
                'शिक्षकों का पूर्ण रिकॉर्ड, भत्ते एवं मासिक वेतन पर्ची (Salary Slip PDF) केवल प्रो योजना में उपलब्ध है।',
                () => setCurrentTab('staff')
              );
            }}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap inline-flex items-center gap-1.5 ${
              currentTab === 'staff'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <span>आचार्य एवं वेतन ({staffList.length})</span>
            {!isPro && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/50 text-[9px] font-black text-yellow-300 inline-flex items-center gap-0.5 uppercase">
                <Lock className="w-2.5 h-2.5 text-yellow-300" />
                <span>PRO</span>
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('admissions')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'admissions'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            प्रवेश समीक्षा ({admissions.length} आवेदन)
          </button>
          <button
            onClick={() => setCurrentTab('notices')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              currentTab === 'notices'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            सूचना प्रसारण (Notices)
          </button>
          <div className="h-5 w-px bg-orange-700/60 self-center" />
          <button
            onClick={() => setShowExamModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-amber-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>📝 परीक्षा व अंक</span>
          </button>
          <button
            onClick={() => setShowTabulationModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-amber-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
            title="कक्षावार समग्र परीक्षा परिणाम सारणी (Tabulation Register)"
          >
            <span>📋 टैबुलेशन रजिस्टर (TR)</span>
          </button>
          <button
            onClick={() => setShowTimetableModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-amber-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>🕒 समय सारिणी</span>
          </button>
          <button
            onClick={() => setShowLeaveModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-amber-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>🌴 अवकाश समीक्षा</span>
          </button>
          <button
            onClick={() => setShowTransportModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-amber-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>🚌 बस परिवहन</span>
          </button>
          <button
            onClick={() => setShowLibraryModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-amber-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>📚 पुस्तकालय</span>
          </button>
          <button
            onClick={() => setShowInventoryModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-amber-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>🎒 भंडार स्टॉक</span>
          </button>
          <button
            onClick={() => setShowBulkNotificationModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-emerald-300 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>📢 संदेश प्रसारण</span>
          </button>
          <button
            onClick={() => setShowAuditLogModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-cyan-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>🛡️ ऑडिट लॉग</span>
          </button>
          <button
            onClick={() => setShowSessionManagementModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-amber-300 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1"
          >
            <span>🎓 सत्र व प्रोन्नति</span>
          </button>
          <button
            onClick={() => setShowHelpGuideModal(true)}
            className="py-3 px-2.5 border-b-2 border-transparent text-emerald-200 hover:text-white whitespace-nowrap font-bold hover:bg-orange-800/30 transition flex items-center gap-1.5"
            title="व्यवस्थापक मार्गदर्शिका व समस्या निवारक"
          >
            <span>❓ मार्गदर्शिका</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-5 sm:space-y-6 overflow-x-hidden">
        
        {/* ================= TAB 1: OVERVIEW ================= */}
        {currentTab === 'overview' && (
          <div className="space-y-6">

            {isDeveloper && (
              <section className="bg-stone-900 text-white rounded-2xl border border-orange-700 p-3.5 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-amber-200">डेवलपर नेटवर्क अवलोकन</h2>
                    <p className="text-xs text-stone-300 mt-0.5 sm:mt-1">सभी पंजीकृत शाखाओं का संयुक्त संचालन सारांश</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-200 border border-amber-400/40 text-[11px] font-bold self-start sm:self-auto">
                    {schools.length} शाखाएं
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
                  <div className="bg-white/10 rounded-xl p-3"><Users className="w-4 h-4 text-amber-300 mb-2" /><strong className="block text-lg sm:text-xl">{developerMetrics.students}</strong><span className="text-[11px] text-stone-300">कुल छात्र</span></div>
                  <div className="bg-white/10 rounded-xl p-3"><Building2 className="w-4 h-4 text-amber-300 mb-2" /><strong className="block text-lg sm:text-xl">{schools.length}</strong><span className="text-[11px] text-stone-300">कुल शाखाएं</span></div>
                  <div className="bg-white/10 rounded-xl p-3"><CheckCircle2 className="w-4 h-4 text-emerald-300 mb-2" /><strong className="block text-xl">{developerMetrics.attendanceRate}%</strong><span className="text-[11px] text-stone-300">उपस्थिति</span></div>
                  <div className="bg-white/10 rounded-xl p-3"><Receipt className="w-4 h-4 text-amber-300 mb-2" /><strong className="block text-lg">₹{developerMetrics.collected.toLocaleString()}</strong><span className="text-[11px] text-stone-300">प्राप्त शुल्क</span></div>
                  <div className="bg-white/10 rounded-xl p-3"><Receipt className="w-4 h-4 text-red-300 mb-2" /><strong className="block text-lg">₹{developerMetrics.pending.toLocaleString()}</strong><span className="text-[11px] text-stone-300">बकाया शुल्क</span></div>
                  <div className="bg-white/10 rounded-xl p-3"><FileText className="w-4 h-4 text-amber-300 mb-2" /><strong className="block text-xl">{developerMetrics.admissions}</strong><span className="text-[11px] text-stone-300">लंबित आवेदन</span></div>
                </div>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-orange-200 p-3 sm:p-6 shadow-xs w-full max-w-full overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-black text-stone-900">दैनिक कक्षा समय-सारणी</h2>
                  <p className="text-xs text-stone-500 mt-1">{currentSchool.hindiName} • {currentSchool.city}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold self-start sm:self-auto">
                  चयनित शाखा
                </span>
              </div>
              <div className="w-full max-w-full overflow-x-auto">
                <TimetableSection />
              </div>
            </section>
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Total Students */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">कुल छात्र संख्या</span>
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-stone-900">{totalStudents}</span>
                  <div className="flex gap-2 text-xs text-stone-600 mt-1">
                    <span className="text-blue-700 font-semibold">{totalBhaiya} भैया</span>
                    <span>•</span>
                    <span className="text-pink-700 font-semibold">{totalBahin} बहिन</span>
                  </div>
                </div>
              </div>

              {/* Attendance Today */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">आज की उपस्थिति</span>
                  <div className="p-2 rounded-xl bg-green-100 text-green-700">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-stone-900">{attendanceRate}%</span>
                  <p className="text-xs text-stone-500 mt-1">
                    {presentCount} उपस्थित / {totalStudents} कुल नामांकित
                  </p>
                </div>
              </div>

              {/* Fee Collection */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">शुल्क संग्रह (सत्र)</span>
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-orange-800">₹ {totalFeeCollected.toLocaleString()}</span>
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    शेष शुल्क: ₹ {totalFeePending.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Acharyas & Didis */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">आचार्य व दीदी गण</span>
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-stone-900">{staffList.length}</span>
                  <p className="text-xs text-stone-500 mt-1">
                    समर्पित शिक्षक एवं प्रशिक्षक
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Actions & Recent Roster */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left: Quick Actions */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  त्वरित कार्य (Quick Actions)
                </h3>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 text-xs font-bold transition-all border border-orange-200"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-orange-700" />
                      नवीन भैया/बहिन प्रवेश जोड़ें
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('attendance')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      आज की उपस्थिति दर्ज करें
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('fees')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-600" />
                      शुल्क रसीद जनरेट करें
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('reports')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      प्रगति पत्र (Report Card) प्रिंट करें
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('homework')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      गृहकार्य (Homework) जारी करें
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('staff')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      आचार्य व वेतन (Payroll) प्रबंधन
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowExamModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/80 text-orange-950 text-xs font-bold transition-all border border-amber-200"
                  >
                    <span className="flex items-center gap-2">
                      <span>📝</span>
                      परीक्षा समय-सारिणी व मार्क्स एंट्री
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowTabulationModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 text-xs font-bold transition-all border border-orange-200"
                  >
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-orange-600" />
                      समग्र परीक्षा परिणाम सारणी (TR Sheet)
                    </span>
                    <span className="text-orange-600">→</span>
                  </button>

                  <button
                    onClick={() => setShowTimetableModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/80 text-orange-950 text-xs font-bold transition-all border border-amber-200"
                  >
                    <span className="flex items-center gap-2">
                      <span>🕒</span>
                      साप्ताहिक कक्षा समय-सारिणी (Timetable)
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <span>🌴</span>
                      अवकाश आवेदन समीक्षा (Leaves)
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowTransportModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <span>🚌</span>
                      विद्यालय वाहन व बस रूट (Transport)
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowLibraryModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <span>📚</span>
                      पुस्तकालय व ग्रंथ सूची (Library)
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowInventoryModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
                  >
                    <span className="flex items-center gap-2">
                      <span>🎒</span>
                      गणवेश व पुस्तक भंडार (Store Inventory)
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowBulkNotificationModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold transition-all border border-emerald-300"
                  >
                    <span className="flex items-center gap-2">
                      <span>📢</span>
                      अभिभावक संदेश प्रसारण (WhatsApp Broadcast)
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowAuditLogModal(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-cyan-50/70 hover:bg-cyan-100 text-cyan-950 text-xs font-bold transition-all border border-cyan-200"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-700" />
                      सुरक्षा ऑडिट ट्रेल व लॉग्स (Security Audit Trail)
                    </span>
                    <span>→</span>
                  </button>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 mt-4">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    स्मरण पत्र
                  </p>
                  <p className="leading-relaxed">
                    आगामी 25 मार्च को अर्धवार्षिक परीक्षा फल (प्रगति पत्र) वितरण एवं अभिभावक सम्मेलन निर्धारित है।
                  </p>
                </div>
              </div>

              {/* Right: Student Roster preview */}
              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-stone-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    नवीनतम नामांकित छात्र (Recent Students)
                  </h3>
                  <button
                    onClick={() => setCurrentTab('students')}
                    className="text-xs font-semibold text-orange-700 hover:underline"
                  >
                    सभी देखें ({totalStudents}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">अनुक्रमांक</th>
                        <th className="p-2.5">नाम</th>
                        <th className="p-2.5">कक्षा</th>
                        <th className="p-2.5">पिता का नाम</th>
                        <th className="p-2.5">संपर्क</th>
                        <th className="p-2.5 text-right">कार्य</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-stone-500">
                            इस शाखा में अभी कोई छात्र नामांकित नहीं हैं। ऊपर 'नवीन छात्र प्रवेश' बटन से जोड़ें।
                          </td>
                        </tr>
                      ) : (
                        students.slice(0, 5).map(student => (
                        <tr key={student.id} className="hover:bg-stone-50/70">
                          <td className="p-2.5 font-bold text-stone-900">{student.rollNo}</td>
                          <td className="p-2.5">
                            <span className="font-medium text-stone-900">{student.name}</span>
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              student.gender === 'Bhaiya' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                            }`}>
                              {student.gender}
                            </span>
                          </td>
                          <td className="p-2.5 text-stone-600">{student.class} - {student.section}</td>
                          <td className="p-2.5 text-stone-600">{student.fatherName}</td>
                          <td className="p-2.5 text-stone-600">{student.contact}</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => {
                                requirePro(
                                  '360° समग्र प्रगति पत्र (Report Card)',
                                  'डिजिटल प्रगति पत्र देखने एवं मुद्रण हेतु प्रो योजना सक्रिय करें।',
                                  () => {
                                    const report = reportCards.find(r => r.studentId === student.id);
                                    if (report) {
                                      setActiveReportModal({ report, student });
                                    } else {
                                      showInfo(`'${student.name}' का प्रगति पत्र अभी जनरेट नहीं किया गया है।`);
                                    }
                                  }
                                );
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-orange-800 rounded font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>प्रगति पत्र</span>
                              {!isPro && <Lock className="w-2.5 h-2.5 text-amber-700" />}
                            </button>
                          </td>
                        </tr>
                      )))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 2: STUDENTS DIRECTORY ================= */}
        {currentTab === 'students' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            
            {/* Search & Filter Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  छात्र पंजिका (Student Directory)
                </h3>
                <p className="text-xs text-stone-500">
                  कुल नामांकित: {totalStudents} (भैया: {totalBhaiya}, बहिन: {totalBahin})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="खोजें (नाम, अनुक्रमांक)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                >
                  <option value="ALL">सभी कक्षाएं</option>
                  <option value="Arun">अरुण (Nursery)</option>
                  <option value="Uday">उदय (LKG)</option>
                  <option value="Prabhat">प्रभात (Prep)</option>
                  <option value="Class 5">Class 5</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>

                <select
                  value={selectedGender}
                  onChange={e => setSelectedGender(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                >
                  <option value="ALL">सभी (भैया/बहिन)</option>
                  <option value="Bhaiya">केवल भैया</option>
                  <option value="Bahin">केवल बहिन</option>
                </select>

                <button
                  onClick={() => {
                    requirePro(
                      'छात्र पंजिका CSV / Excel डेटा निर्यात',
                      'समस्त छात्रों का पूर्ण रिकॉर्ड एक्सेल / CSV प्रारूप में बैकअप व निर्यात केवल प्रो योजना में उपलब्ध है।',
                      () => exportStudentsToCSV(filteredStudents.length > 0 ? filteredStudents : students)
                    );
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  title="Export Student Directory to CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-green-400" />
                  <span>CSV निर्यात</span>
                  {!isPro && <Lock className="w-2.5 h-2.5 text-amber-300 ml-0.5" />}
                </button>

                <button
                  onClick={() => setShowBulkImport(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
                  title="एक्सेल या CSV फ़ाइल से एक साथ कई छात्र जोड़ें (Bulk Import)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                  <span>एक्सेल आयात</span>
                </button>

                <button
                  onClick={() => setShowAddStudent(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>छात्र जोड़ें</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">अनुक्रमांक</th>
                    <th className="p-3">छात्र का नाम</th>
                    <th className="p-3">कक्षा एवं वर्ग</th>
                    <th className="p-3">पिता का नाम</th>
                    <th className="p-3">माता का नाम</th>
                    <th className="p-3">संपर्क नंबर</th>
                    <th className="p-3">रक्त समूह</th>
                    <th className="p-3 text-right">कार्य (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-500">
                        कोई छात्र नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-orange-950">{student.rollNo}</td>
                        <td className="p-3 font-semibold text-stone-900">
                          <div className="flex items-center gap-2">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                className="w-7 h-7 rounded-full object-cover border border-orange-300 shrink-0"
                              />
                            ) : (
                              <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs shrink-0">
                                {student.gender === 'Bhaiya' ? '👦' : '👧'}
                              </span>
                            )}
                            <div>
                              <span>{student.name}</span>
                              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                student.gender === 'Bhaiya' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                              }`}>
                                {student.gender}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-stone-700">{student.class} '{student.section}'</td>
                        <td className="p-3 text-stone-600">{student.fatherName}</td>
                        <td className="p-3 text-stone-600">{student.motherName}</td>
                        <td className="p-3 text-stone-600">{student.contact}</td>
                        <td className="p-3 text-stone-600 font-mono">{student.bloodGroup}</td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setActivePhotoStudent(student)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-[11px] inline-flex items-center gap-1"
                            title="Upload Passport Photo (पासपोर्ट फोटो अपलोड)"
                          >
                            <Camera className="w-3 h-3 text-amber-700" />
                            <span>फोटो</span>
                          </button>
                          <button
                            onClick={() => {
                              requirePro(
                                'छात्र परिचय पत्र (Student ID Card)',
                                'बारकोड युक्त बहु-रंगी डिजिटल छात्र पहचान पत्र प्रिंटिंग केवल प्रो योजना में उपलब्ध है।',
                                () => setActiveIdCardStudent(student)
                              );
                            }}
                            className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-950 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Print Student ID Card"
                          >
                            <IdCard className="w-3 h-3 text-orange-700" />
                            <span>परिचय पत्र</span>
                            {!isPro && <Lock className="w-2.5 h-2.5 text-amber-700 ml-0.5" />}
                          </button>
                          <button
                            onClick={() => {
                              requirePro(
                                'स्थानांतरण प्रमाण पत्र (Transfer Certificate / TC)',
                                'आधिकारिक स्थानांतरण प्रमाण पत्र (TC) जेनरेशन एवं प्रिंटिंग केवल प्रो योजना में उपलब्ध है।',
                                () => setActiveTcStudent(student)
                              );
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="Print Transfer Certificate (स्थानांतरण प्रमाण पत्र)"
                          >
                            <FileText className="w-3 h-3 text-orange-700" />
                            <span>टी.सी. (TC)</span>
                            {!isPro && <Lock className="w-2.5 h-2.5 text-amber-700 ml-0.5" />}
                          </button>
                          <button
                            onClick={() => {
                              requirePro(
                                '360° समग्र प्रगति पत्र (Report Card)',
                                'डिजिटल प्रगति पत्र देखने एवं मुद्रण हेतु प्रो योजना सक्रिय करें।',
                                () => {
                                  const report = reportCards.find(r => r.studentId === student.id);
                                  if (report) {
                                    setActiveReportModal({ report, student });
                                  } else {
                                    showInfo(`'${student.name}' का प्रगति पत्र अभी जनरेट नहीं किया गया है।`);
                                  }
                                }
                              );
                            }}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-orange-900 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="View Report Card"
                          >
                            <span>प्रगति पत्र</span>
                            {!isPro && <Lock className="w-2.5 h-2.5 text-amber-700 ml-0.5" />}
                          </button>
                          <button
                            onClick={() => setActiveCharacterStudent(student)}
                            className="px-2 py-1 bg-stone-100 hover:bg-orange-100 text-stone-800 hover:text-orange-950 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer border border-stone-200"
                            title="Print Character Certificate (चरित्र प्रमाण पत्र)"
                          >
                            <span>📜 चरित्र</span>
                          </button>
                          <button
                            onClick={() => setActiveBonafideStudent(student)}
                            className="px-2 py-1 bg-stone-100 hover:bg-orange-100 text-stone-800 hover:text-orange-950 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer border border-stone-200"
                            title="Print Bonafide Certificate (अध्ययनरत प्रमाण पत्र)"
                          >
                            <span>📄 अध्ययनरत</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`क्या आप '${student.name}' का रिकॉर्ड हटाना चाहते हैं?`)) {
                                deleteStudent(student.id);
                              }
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 3: ATTENDANCE ================= */}
        {currentTab === 'attendance' && (
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
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                >
                  <option value="ALL">सभी कक्षाएं (All Classes)</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>

                <div className="flex gap-2">
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

            {/* Attendance Roster Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">अनुक्रमांक</th>
                    <th className="p-3">छात्र का नाम</th>
                    <th className="p-3">कक्षा</th>
                    <th className="p-3">वर्तमान स्थिति ({attendanceDate})</th>
                    <th className="p-3 text-center">उपस्थिति चयन (Toggle Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {students.filter(s => attendanceClass === 'ALL' || s.class.includes(attendanceClass)).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-500">
                        इस कक्षा / शाखा में कोई छात्र नामांकित नहीं हैं।
                      </td>
                    </tr>
                  ) : (
                    students
                      .filter(s => attendanceClass === 'ALL' || s.class.includes(attendanceClass))
                      .map(student => {
                      const currentStatus = todayAttendance[student.id] || 'Present';
                      return (
                        <tr key={student.id} className="hover:bg-stone-50">
                          <td className="p-3 font-mono font-bold text-stone-900">{student.rollNo}</td>
                          <td className="p-3 font-semibold text-stone-900">
                            {student.name}
                            <span className="ml-1 text-stone-500 font-normal">({student.gender})</span>
                          </td>
                          <td className="p-3 text-stone-600">{student.class} - {student.section}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                currentStatus === 'Present'
                                  ? 'bg-green-100 text-green-800 border border-green-300'
                                  : currentStatus === 'Absent'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {currentStatus === 'Present' ? 'उपस्थित (Present)' : currentStatus === 'Absent' ? 'अनुपस्थित (Absent)' : 'अवकाश (Leave)'}
                              </span>
                              {currentStatus === 'Absent' && (
                                <button
                                  onClick={() => {
                                    requirePro(
                                      'व्हाट्सएप त्वरित अनुपस्थिति अलर्ट (WhatsApp Alerts)',
                                      'अभिभावकों के मोबाइल पर अनुपस्थिति का सीधा व्हाट्सएप संदेश भेजना केवल प्रो योजना में उपलब्ध है।',
                                      () => {
                                        setActiveWhatsAppAlert({
                                          title: 'अनुपस्थिति WhatsApp अभिभावक अलर्ट',
                                          recipientName: student.name,
                                          recipientPhone: student.contact,
                                          studentClass: student.class,
                                          defaultMessage: `🚩 *सादर नमस्ते जी* 🚩\n*${currentSchool.hindiName}*\n--------------------------------\n*दैनिक उपस्थिति सूचना:*\nआपके पाल्य/पाल्या *${student.name}* (कक्षा: ${student.class}) आज दिनांक *${attendanceDate}* को विद्यालय में अनुपस्थित रहे हैं।\n\nकृपया अस्वस्थता अथवा अनुपस्थिति का कारण विद्यालय डायरी में दर्ज करें अथवा इस नंबर पर सूचित करने की कृपा करें।\n\nधन्यवाद!\n— कार्यालय, ${currentSchool.hindiName}`
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
                                className={`px-3 py-1 text-xs font-bold transition-all ${
                                  currentStatus === 'Present'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-stone-600 hover:bg-stone-100'
                                }`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => setStudentAttendance(student.id, attendanceDate, 'Absent')}
                                className={`px-3 py-1 text-xs font-bold transition-all ${
                                  currentStatus === 'Absent'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-white text-stone-600 hover:bg-stone-100'
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => setStudentAttendance(student.id, attendanceDate, 'Leave')}
                                className={`px-3 py-1 text-xs font-bold transition-all ${
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
                    }))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 4: FEES & RECEIPTS ================= */}
        {currentTab === 'fees' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  शुल्क प्रबंधन एवं रसीद निर्गमन (Fee Management & Receipts)
                </h3>
                <p className="text-xs text-stone-500">
                  मासिक एवं त्रैमासिक शिक्षण शुल्क, क्रीड़ा निधि, एवं रसीद प्रिंटिंग
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <button
                  onClick={() => {
                    requirePro(
                      'शुल्क रजिस्टर CSV / Excel डेटा निर्यात',
                      'समस्त छात्र शुल्क, भुगतान स्थिति एवं बकाया विवरण का एक्सेल बैकअप केवल प्रो योजना में उपलब्ध है।',
                      () => exportFeesToCSV(feeRecords, students)
                    );
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  title="Export Fee Register to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-green-400" />
                  <span>शुल्क CSV निर्यात</span>
                  {!isPro && <Lock className="w-2.5 h-2.5 text-amber-300 ml-0.5" />}
                </button>
                <div className="p-2.5 bg-green-50 rounded-xl border border-green-200 text-green-950 font-semibold">
                  कुल प्राप्त: ₹ {totalFeeCollected.toLocaleString()}
                </div>
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-950 font-semibold">
                  कुल बकाया: ₹ {totalFeePending.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Fees Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">छात्र का नाम</th>
                    <th className="p-3">कक्षा</th>
                    <th className="p-3">शुल्क अवधि</th>
                    <th className="p-3">देय राशि</th>
                    <th className="p-3">प्राप्त राशि</th>
                    <th className="p-3">स्थिति</th>
                    <th className="p-3">रसीद संख्या</th>
                    <th className="p-3 text-right">कार्य</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {feeRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-500">
                        इस शाखा में अभी कोई शुल्क रिकॉर्ड उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    feeRecords.map(fee => {
                    const student = students.find(s => s.id === fee.studentId);
                    if (!student) return null;

                    return (
                      <tr key={fee.id} className="hover:bg-stone-50">
                        <td className="p-3 font-semibold text-stone-900">
                          {student.name}
                        </td>
                        <td className="p-3 text-stone-600">{student.class}</td>
                        <td className="p-3 text-stone-700">{fee.term}</td>
                        <td className="p-3 font-bold text-stone-900">₹ {fee.totalAmount}</td>
                        <td className="p-3 font-bold text-green-700">₹ {fee.paidAmount}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            fee.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : fee.status === 'Partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {fee.status === 'Paid' ? 'पूर्ण भुगतान' : fee.status === 'Partial' ? 'आंशिक' : 'लंबित'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-stone-600">
                          {fee.receiptNo || '—'}
                        </td>
                        <td className="p-3 text-right space-x-2 whitespace-nowrap">
                          {fee.status !== 'Paid' ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  const pendingAmount = fee.totalAmount - fee.paidAmount;
                                  requirePro(
                                    'शुल्क अनुस्मारक व्हाट्सएप अलर्ट (WhatsApp Alerts)',
                                    'शुल्क बकाया अनुस्मारक सीधे अभिभावक के व्हाट्सएप पर भेजना केवल प्रो योजना में उपलब्ध है।',
                                    () => {
                                      setActiveWhatsAppAlert({
                                        title: 'शुल्क अनुस्मारक WhatsApp अलर्ट',
                                        recipientName: student.name,
                                        recipientPhone: student.contact,
                                        studentClass: student.class,
                                        defaultMessage: `🚩 *सादर नमस्ते जी* 🚩\n*${currentSchool.hindiName}*\n--------------------------------\n*शिक्षण शुल्क अनुस्मारक सूचना:*\nअभिभावक जी, आपके पाल्य/पाल्या *${student.name}* (कक्षा: ${student.class}) का *${fee.term}* का शुल्क देय है:\n\n💰 *देय धनराशि:* ₹${pendingAmount.toLocaleString('en-IN')}\n\nकृपया ससमय विद्यालय कार्यालय अथवा ऑनलाइन माध्यम से शुल्क जमा कर अधिकृत रसीद प्राप्त करें।\n\nसहयोग हेतु आभार!\n— लेखा विभाग, ${currentSchool.hindiName}`
                                      });
                                    }
                                  );
                                }}
                                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                                title="Send Fee Reminder WhatsApp Alert"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-700" />
                                <span>WhatsApp अलर्ट</span>
                                {!isPro && <Lock className="w-2.5 h-2.5 text-emerald-700 ml-0.5" />}
                              </button>
                              <button
                                onClick={() => {
                                  markFeePaid(fee.id, 'Online UPI');
                                  const updatedStudent = students.find(s => s.id === fee.studentId);
                                  if (updatedStudent) {
                                    setActiveFeeModal({
                                      fee: {
                                        ...fee,
                                        paidAmount: fee.totalAmount,
                                        status: 'Paid',
                                        paidDate: new Date().toISOString().split('T')[0],
                                        receiptNo: fee.receiptNo || `SSM-REC-${new Date().getFullYear()}-${(currentSchool.id || 'SSM').slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}`
                                      },
                                      student: updatedStudent
                                    });
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[11px] shadow-xs"
                              >
                                शुल्क जमा करें (Pay)
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveFeeModal({ fee, student })}
                              className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold text-[11px] flex items-center gap-1 inline-flex"
                            >
                              <Printer className="w-3 h-3" />
                              <span>रसीद देखें / प्रिंट</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 5: REPORT CARDS (PRAGATI PATRA) ================= */}
        {currentTab === 'reports' && (
          !isPro ? (
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
                  onClick={() => setUpgradeModalFeature({
                    name: '360° समग्र प्रगति पत्र (Report Cards)',
                    desc: 'CBSE एवं NEP 2020 अनुरूप 360° समग्र प्रगति पत्र अंकसूची तैयार करने हेतु प्रो योजना सक्रिय करें।'
                  })}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 inline-flex items-center gap-2 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-yellow-200 fill-yellow-300" />
                  <span>प्रो में अपग्रेड करें (Unlock Pro Plan)</span>
                </button>
              </div>
            </div>
          ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  प्रगति पत्र मूल्यांकन (Pragati Patra Report Cards)
                </h3>
                <p className="text-xs text-stone-500">
                  सत्र 2025-26 • अर्धवार्षिक एवं वार्षिक परीक्षा परिणाम तथा पंचमुखी संस्कार मूल्यांकन
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTabulationModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  title="कक्षावार समग्र परीक्षा परिणाम सारणी देखें व प्रिंट करें"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>समग्र परीक्षा परिणाम सारणी (TR Sheet)</span>
                </button>
              </div>
            </div>

            {/* Report cards cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportCards.map(report => {
                const student = students.find(s => s.id === report.studentId);
                if (!student) return null;

                return (
                  <div
                    key={report.id}
                    className="p-5 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-amber-50/50 to-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
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
                                  panchmukhi: pe ? {
                                    sharirikGrade: pe.sharirik?.grade || 'O',
                                    yogGrade: pe.yog?.grade || 'A+',
                                    sangeetGrade: pe.sangeet?.grade || 'A',
                                    sanskritGrade: pe.sanskrit?.grade || 'O',
                                    naitikGrade: pe.naitik?.grade || 'O',
                                  } : undefined,
                                  schoolName: currentSchool.hindiName || currentSchool.name,
                                  phone: student.contact
                                });
                                window.open(url, '_blank', 'noopener,noreferrer');
                              }
                            );
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          title="अभिभावक को व्हाट्सएप पर भेजें"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>व्हाट्सएप</span>
                        </button>
                        <button
                          onClick={() => setActiveReportModal({ report, student })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>प्रगति पत्र देखें / प्रिंट</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
          )
        )}

        {/* ================= TAB 6: ADMISSIONS REVIEW ================= */}
        {currentTab === 'admissions' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  सत्र 2026-27 ऑनलाइन प्रवेश आवेदन समीक्षा (Admission Inquiries Review)
                </h3>
                <p className="text-xs text-stone-500">
                  वेबसाइट के माध्यम से प्राप्त भैया-बहिनों के ऑनलाइन प्रवेश आवेदनों की समीक्षा करें एवं स्वीकृत कर सीधे छात्र पंजिका में जोड़ें।
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-amber-100 text-orange-950 font-bold text-xs rounded-lg">
                  कुल आवेदन: {admissions.length}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-lg">
                  नामांकित: {admissions.filter(a => a.status === 'Admitted').length}
                </span>
              </div>
            </div>

            {/* Admissions Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3">पंजीकरण सं.</th>
                    <th className="p-3">छात्र का नाम</th>
                    <th className="p-3">वर्ग</th>
                    <th className="p-3">प्रवेश कक्षा</th>
                    <th className="p-3">अभिभावक विवरण</th>
                    <th className="p-3">मोबाइल नंबर</th>
                    <th className="p-3">आवेदन दिनांक</th>
                    <th className="p-3">स्थिति</th>
                    <th className="p-3 text-right">कार्य (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {admissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-stone-500">
                        कोई प्रवेश आवेदन लंबित नहीं है। वेबसाइट के प्रवेश फॉर्म से आवेदन प्राप्त होने पर यहाँ प्रदर्शित होंगे।
                      </td>
                    </tr>
                  ) : (
                    admissions.map(adm => (
                      <tr key={adm.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-bold text-orange-900">{adm.regNo || adm.id}</td>
                        <td className="p-3 font-bold text-stone-900">{adm.studentName}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            adm.gender === 'Bhaiya' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {adm.gender}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-stone-800">{adm.applyingClass}</td>
                        <td className="p-3 text-stone-600">
                          {adm.fatherName || '—'} {adm.motherName ? `• ${adm.motherName}` : ''}
                        </td>
                        <td className="p-3 text-stone-700 font-medium">{adm.phone}</td>
                        <td className="p-3 text-stone-500">{adm.submissionDate || adm.createdAt?.split('T')[0] || '2026-03-12'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            adm.status === 'Admitted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {adm.status === 'Admitted' ? 'नामांकित (Enrolled)' : 'समीक्षाधीन (Pending)'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {adm.status !== 'Admitted' && (
                            <button
                              onClick={() => handleApproveAdmission(adm.id)}
                              className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[11px] shadow-xs inline-flex items-center gap-1"
                              title="Approve and enroll into Student Directory"
                            >
                              <Check className="w-3 h-3" />
                              <span>स्वीकृत करें</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAdmission(adm.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 7: NOTICES PUBLISHER ================= */}
        {currentTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Create Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
                <Bell className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-stone-900">
                  नवीन परिपत्र / सूचना जारी करें
                </h3>
              </div>

              <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    सूचना का शीर्षक (Notice Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. सत्र 2026-27 प्रवेश परीक्षा तिथि..."
                    value={newNoticeTitle}
                    onChange={e => setNewNoticeTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    श्रेणी (Category)
                  </label>
                  <select
                    value={newNoticeCategory}
                    onChange={e => setNewNoticeCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Academics">Academics (शैक्षणिक)</option>
                    <option value="Events">Events (उत्सव व कार्यक्रम)</option>
                    <option value="Examinations">Examinations (परीक्षा)</option>
                    <option value="Holidays">Holidays (अवकाश)</option>
                    <option value="Vidya Bharati">Vidya Bharati (विद्या भारती)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    विस्तृत विवरण (Content) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="सूचना का पूर्ण विवरण यहाँ लिखें..."
                    value={newNoticeContent}
                    onChange={e => setNewNoticeContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="urgent-check"
                    checked={newNoticeUrgent}
                    onChange={e => setNewNoticeUrgent(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="urgent-check" className="font-semibold text-stone-700">
                    अति महत्वपूर्ण (Urgent Notice) चिह्नित करें
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-lg shadow-xs transition-colors"
                >
                  सूचना प्रकाशित करें (Publish Notice)
                </button>
              </form>
            </div>

            {/* Right: Active Notices List */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200">
              <h3 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
                सक्रिय सूचना पट्ट सूची ({notices.length} सूचनाएं)
              </h3>

              <div className="space-y-3">
                {notices.map(notice => (
                  <div
                    key={notice.id}
                    className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex justify-between items-start gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                          {notice.category}
                        </span>
                        <span className="text-[11px] text-stone-500">{notice.date}</span>
                        {notice.isUrgent && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                            महत्वपूर्ण
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">{notice.title}</h4>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">{notice.content}</p>
                    </div>

                    <button
                      onClick={() => deleteNotice(notice.id)}
                      className="text-stone-400 hover:text-red-600 p-1 rounded"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB: HOMEWORK (दैनिक गृहकार्य) ================= */}
        {currentTab === 'homework' && (
          <div className="space-y-6">
            
            {/* Header & Action Bar */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-700" />
                  <span>दैनिक गृहकार्य एवं डायरी (Daily Homework & Assignments)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  कक्षावार एवं विषयवार दैनिक गृहकार्य प्रेषित करें। छात्र एवं अभिभावक इसे छात्र पोर्टल पर तत्काल देख सकते हैं।
                </p>
              </div>

              <button
                onClick={() => setShowAddHomework(!showAddHomework)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddHomework ? 'फॉर्म बंद करें' : 'नया गृहकार्य जोड़ें (Assign)'}</span>
              </button>
            </div>

            {/* Create Homework Form */}
            {showAddHomework && (
              <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-300 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>नया दैनिक गृहकार्य प्रेषित करें</span>
                </h4>
                <form onSubmit={handleCreateHomework} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">लक्षित कक्षा (Class)*</label>
                    <select
                      value={hwClass}
                      onChange={e => setHwClass(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Class 8">Class 8</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 5">Class 5</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Arun">अरुण (Nursery)</option>
                      <option value="Uday">उदय (LKG)</option>
                      <option value="Prabhat">प्रभात (Prep)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">विषय (Subject)*</label>
                    <input
                      type="text"
                      placeholder="उदा: गणित / विज्ञान / संस्कृत"
                      value={hwSubject}
                      onChange={e => setHwSubject(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">जमा करने की अंतिम तिथि (Due Date)*</label>
                    <input
                      type="date"
                      value={hwDueDate}
                      onChange={e => setHwDueDate(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-stone-700 font-bold mb-1">गृहकार्य शीर्षक / अध्याय (Title)*</label>
                    <input
                      type="text"
                      placeholder="उदा: अध्याय 4: परिमेय संख्याएँ एवं समीकरण"
                      value={hwTitle}
                      onChange={e => setHwTitle(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">प्रदत्तकर्ता आचार्य (Assigned By)</label>
                    <input
                      type="text"
                      placeholder="उदा: श्री रामेश्वर त्रिपाठी"
                      value={hwAssignedBy}
                      onChange={e => setHwAssignedBy(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-stone-700 font-bold mb-1">गृहकार्य विवरण व निर्देश (Instructions)*</label>
                    <textarea
                      rows={3}
                      placeholder="उदा: प्रश्नावली 4.2 के प्रश्न संख्या 1 से 8 तक अभ्यास पुस्तिका में हल करें। प्रत्येक चरण को स्पष्ट लिखें।"
                      value={hwDescription}
                      onChange={e => setHwDescription(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 resize-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddHomework(false)}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold shadow-xs"
                    >
                      गृहकार्य जारी करें (Publish)
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Homework List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworkList.length === 0 ? (
                <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500">
                  <BookOpen className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                  <p className="font-semibold text-sm">वर्तमान में कोई गृहकार्य प्रेषित नहीं है।</p>
                  <p className="text-xs text-stone-400 mt-1">ऊपर दिए गए बटन से नया गृहकार्य जोड़ें।</p>
                </div>
              ) : (
                homeworkList.map(hw => (
                  <div key={hw.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-orange-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 font-bold rounded-full text-[10px]">
                            {hw.class}
                          </span>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded text-[10px]">
                            {hw.subject}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          अंतिम तिथि: {hw.dueDate}
                        </span>
                      </div>

                      <h4 className="font-bold text-stone-900 text-sm mb-1.5">{hw.title}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                        {hw.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>आचार्य: <strong className="text-stone-800">{hw.assignedBy}</strong></span>
                      <button
                        onClick={() => handleDeleteHomework(hw.id)}
                        className="text-stone-400 hover:text-red-600 p-1 rounded transition"
                        title="Delete Homework"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ================= TAB: STAFF & PAYROLL (आचार्य एवं वेतन) ================= */}
        {currentTab === 'staff' && (
          !isPro ? (
            <div className="bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-sm my-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Crown className="w-8 h-8 text-amber-600 fill-amber-500" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  विद्या भारती प्रो फीचर (Pro ERP Suite)
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
                  आचार्य एवं वेतन प्रबंधन (Staff & Payroll)
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
                  शिक्षकों का संपूर्ण सेवा विवरण, मासिक वेतन पर्ची (Salary Slip PDF) जनरेशन एवं आधिकारिक पेरोल प्रबंधन केवल प्रो योजना में उपलब्ध है।
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setUpgradeModalFeature({
                    name: 'आचार्य एवं वेतन प्रबंधन (Staff & Payroll)',
                    desc: 'शिक्षकों का पूर्ण रिकॉर्ड, भत्ते एवं मासिक वेतन पर्ची (Salary Slip PDF) केवल प्रो योजना में उपलब्ध है।'
                  })}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 inline-flex items-center gap-2 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-yellow-200 fill-yellow-300" />
                  <span>प्रो में अपग्रेड करें (Unlock Pro Plan)</span>
                </button>
              </div>
            </div>
          ) : (
          <div className="space-y-6">
            
            {/* Header & KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">कुल शिक्षक एवं कर्मचारी</span>
                  <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-stone-900">{staffList.length}</span>
                  <p className="text-xs text-stone-500 mt-1">
                    आचार्य: {staffList.filter(s => s.gender === 'Acharya').length} • दीदी जी: {staffList.filter(s => s.gender === 'Didi').length}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">मासिक कुल वेतन दायित्व</span>
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-stone-900">
                    ₹{staffList.reduce((acc, s) => acc + (s.monthlySalary || 0), 0).toLocaleString('en-IN')}
                  </span>
                  <p className="text-xs text-stone-500 mt-1">मासिक संवितरण (Monthly Payroll)</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">कर्मचारी प्रबंधन</span>
                  <p className="text-xs text-stone-600 mt-1">
                    आचार्यों का मानदेय निर्धारण एवं मासिक वेतन पर्ची (Salary Slip) प्रिंट करें।
                  </p>
                </div>
                <button
                  onClick={() => setShowAddStaff(!showAddStaff)}
                  className="mt-3 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddStaff ? 'फॉर्म बंद करें' : 'नए आचार्य/कर्मचारी जोड़ें'}</span>
                </button>
              </div>
            </div>

            {/* Create Staff Form */}
            {showAddStaff && (
              <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-300 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>नए आचार्य / कर्मचारी का विवरण भरें</span>
                </h4>
                <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">पूरा नाम (Full Name)*</label>
                    <input
                      type="text"
                      placeholder="उदा: श्री रामेश्वर त्रिपाठी"
                      value={stfName}
                      onChange={e => setStfName(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">पद संबोधन</label>
                    <select
                      value={stfGender}
                      onChange={e => setStfGender(e.target.value as any)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Acharya">आचार्य जी (Acharya)</option>
                      <option value="Didi">दीदी जी (Didi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">पद / पदनाम (Designation)*</label>
                    <input
                      type="text"
                      placeholder="उदा: वरिष्ठ प्रवक्ता (गणित)"
                      value={stfDesignation}
                      onChange={e => setStfDesignation(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">शैक्षणिक योग्यता (Qualification)</label>
                    <input
                      type="text"
                      placeholder="उदा: M.Sc. (Math), B.Ed."
                      value={stfQualification}
                      onChange={e => setStfQualification(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">विषय दायित्व (Subjects)</label>
                    <input
                      type="text"
                      placeholder="उदा: गणित, वैदिक गणित"
                      value={stfSubjects}
                      onChange={e => setStfSubjects(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">दूरभाष नंबर (Phone)*</label>
                    <input
                      type="text"
                      placeholder="उदा: +91 94501 23456"
                      value={stfPhone}
                      onChange={e => setStfPhone(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">मासिक मानदेय / वेतन (₹)*</label>
                    <input
                      type="number"
                      placeholder="उदा: 28000"
                      value={stfMonthlySalary}
                      onChange={e => setStfMonthlySalary(Number(e.target.value))}
                      className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStaff(false)}
                      className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold shadow-xs"
                    >
                      आचार्य जोड़ें (Save Staff)
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Staff Roster Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                  आचार्य एवं कर्मचारी विवरण सूची ({staffList.length} पद)
                </h4>
                <span className="text-[11px] text-stone-500">
                  सत्र 2025-26 • {currentSchool.name}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">आई.डी.</th>
                      <th className="p-3">कर्मचारी / आचार्य नाम</th>
                      <th className="p-3">पद (Designation)</th>
                      <th className="p-3">योग्यता</th>
                      <th className="p-3">विषय दायित्व</th>
                      <th className="p-3">दूरभाष</th>
                      <th className="p-3">मासिक वेतन</th>
                      <th className="p-3 text-right">कार्य (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {staffList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-stone-500">
                          कोई कर्मचारी रिकॉर्ड उपलब्ध नहीं है।
                        </td>
                      </tr>
                    ) : (
                      staffList.map(member => (
                        <tr key={member.id} className="hover:bg-stone-50/80">
                          <td className="p-3 font-mono font-bold text-orange-950 uppercase">{member.id}</td>
                          <td className="p-3 font-bold text-stone-900">
                            {member.name}
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              member.gender === 'Acharya' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                            }`}>
                              {member.gender === 'Acharya' ? 'आचार्य जी' : 'दीदी जी'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-stone-700">{member.designation}</td>
                          <td className="p-3 text-stone-600">{member.qualification || 'स्नातकोत्तर'}</td>
                          <td className="p-3 text-stone-600">{member.subjects || '—'}</td>
                          <td className="p-3 text-stone-600 font-mono">{member.phone}</td>
                          <td className="p-3 font-bold text-emerald-700 font-mono">
                            ₹{member.monthlySalary?.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setActiveSalarySlipStaff(member)}
                              className="px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-orange-950 border border-orange-300 rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition"
                              title="Generate Official Monthly Salary Slip (मासिक वेतन पर्ची)"
                            >
                              <FileText className="w-3 h-3 text-orange-700" />
                              <span>वेतन पर्ची (Slip)</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="p-1 text-stone-400 hover:text-red-600 rounded transition"
                              title="Delete Staff"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          )
        )}

      </main>

      {/* Modals */}
      {showAddStudent && (
        <AddStudentModal onClose={() => setShowAddStudent(false)} />
      )}

      {activeFeeModal && (
        <FeeReceiptModal
          fee={activeFeeModal.fee}
          student={activeFeeModal.student}
          onClose={() => setActiveFeeModal(null)}
        />
      )}

      {activeReportModal && (
        <PragatiPatraModal
          reportCard={activeReportModal.report}
          student={activeReportModal.student}
          onClose={() => setActiveReportModal(null)}
        />
      )}

      {activeIdCardStudent && (
        <StudentIdCardModal
          student={activeIdCardStudent}
          onClose={() => setActiveIdCardStudent(null)}
        />
      )}

      {activeTcStudent && (
        <TransferCertificateModal
          student={activeTcStudent}
          onClose={() => setActiveTcStudent(null)}
        />
      )}

      {showSchoolModal && (
        <SchoolManagementModal
          isOpen={showSchoolModal}
          onClose={() => setShowSchoolModal(false)}
          initialMode={schoolModalMode}
        />
      )}

      {activeSalarySlipStaff && (
        <StaffSalarySlipModal
          staff={activeSalarySlipStaff}
          onClose={() => setActiveSalarySlipStaff(null)}
        />
      )}

      {activeWhatsAppAlert && (
        <WhatsAppAlertModal
          title={activeWhatsAppAlert.title}
          recipientName={activeWhatsAppAlert.recipientName}
          recipientPhone={activeWhatsAppAlert.recipientPhone}
          studentClass={activeWhatsAppAlert.studentClass}
          defaultMessage={activeWhatsAppAlert.defaultMessage}
          onClose={() => setActiveWhatsAppAlert(null)}
        />
      )}

      {activePhotoStudent && (
        <StudentPhotoUploadModal
          student={activePhotoStudent}
          onSave={async (photoUrl) => {
            await api.updateStudent(activePhotoStudent.id, { photoUrl });
            await refreshFromDb();
          }}
          onClose={() => setActivePhotoStudent(null)}
        />
      )}

      <BulkStudentImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
      />

      <ProUpgradeModal
        isOpen={!!upgradeModalFeature}
        featureName={upgradeModalFeature?.name}
        featureDescription={upgradeModalFeature?.desc}
        onClose={() => setUpgradeModalFeature(null)}
      />

      {/* New Module Modals */}
      <ExamManagementModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        onOpenAdmitCard={(student, exam) => {
          setShowExamModal(false);
          setActiveAdmitCard({ student, exam });
        }}
      />

      <TimetableManagerModal
        isOpen={showTimetableModal}
        onClose={() => setShowTimetableModal(false)}
      />

      <LeaveManagementModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
      />

      <TransportManagementModal
        isOpen={showTransportModal}
        onClose={() => setShowTransportModal(false)}
      />

      <LibraryManagementModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      />

      <InventoryManagementModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
      />

      <BulkNotificationModal
        isOpen={showBulkNotificationModal}
        onClose={() => setShowBulkNotificationModal(false)}
      />

      <AuditLogModal
        isOpen={showAuditLogModal}
        onClose={() => setShowAuditLogModal(false)}
      />

      <SessionManagementModal
        isOpen={showSessionManagementModal}
        onClose={() => setShowSessionManagementModal(false)}
      />

      <TabulationRegisterModal
        isOpen={showTabulationModal}
        onClose={() => setShowTabulationModal(false)}
      />

      <HelpGuideModal
        isOpen={showHelpGuideModal}
        onClose={() => setShowHelpGuideModal(false)}
        onOpenSessionModal={() => setShowSessionManagementModal(true)}
        onOpenAuditModal={() => setShowAuditLogModal(true)}
      />

      {/* Single Item Document Modals */}
      {activeAdmitCard && (
        <AdmitCardModal
          student={activeAdmitCard.student}
          exam={activeAdmitCard.exam}
          onClose={() => setActiveAdmitCard(null)}
        />
      )}

      {activeCharacterStudent && (
        <CharacterCertificateModal
          student={activeCharacterStudent}
          onClose={() => setActiveCharacterStudent(null)}
        />
      )}

      {activeBonafideStudent && (
        <BonafideCertificateModal
          student={activeBonafideStudent}
          onClose={() => setActiveBonafideStudent(null)}
        />
      )}

    </div>
  );
};
