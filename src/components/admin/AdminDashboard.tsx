import React, { useCallback, useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';

// Lazy-loaded Admin Modals (Phase 1 Code-Splitting)
const AddStudentModal = React.lazy(() => import('./AddStudentModal').then(m => ({ default: m.AddStudentModal })));
const FeeReceiptModal = React.lazy(() => import('./FeeReceiptModal').then(m => ({ default: m.FeeReceiptModal })));
const PragatiPatraModal = React.lazy(() => import('./PragatiPatraModal').then(m => ({ default: m.PragatiPatraModal })));
const StudentIdCardModal = React.lazy(() => import('./StudentIdCardModal').then(m => ({ default: m.StudentIdCardModal })));
const TransferCertificateModal = React.lazy(() => import('./TransferCertificateModal').then(m => ({ default: m.TransferCertificateModal })));
const SchoolManagementModal = React.lazy(() => import('./SchoolManagementModal').then(m => ({ default: m.SchoolManagementModal })));
const StaffSalarySlipModal = React.lazy(() => import('./StaffSalarySlipModal').then(m => ({ default: m.StaffSalarySlipModal })));
const WhatsAppAlertModal = React.lazy(() => import('../common/WhatsAppAlertModal').then(m => ({ default: m.WhatsAppAlertModal })));
const StudentPhotoUploadModal = React.lazy(() => import('./StudentPhotoUploadModal').then(m => ({ default: m.StudentPhotoUploadModal })));
const ProUpgradeModal = React.lazy(() => import('./ProUpgradeModal').then(m => ({ default: m.ProUpgradeModal })));
const BulkStudentImportModal = React.lazy(() => import('./BulkStudentImportModal').then(m => ({ default: m.BulkStudentImportModal })));
const ExamManagementModal = React.lazy(() => import('./ExamManagementModal').then(m => ({ default: m.ExamManagementModal })));
const AdmitCardModal = React.lazy(() => import('./AdmitCardModal').then(m => ({ default: m.AdmitCardModal })));
const TimetableManagerModal = React.lazy(() => import('./TimetableManagerModal').then(m => ({ default: m.TimetableManagerModal })));
const LeaveManagementModal = React.lazy(() => import('./LeaveManagementModal').then(m => ({ default: m.LeaveManagementModal })));
const TransportManagementModal = React.lazy(() => import('./TransportManagementModal').then(m => ({ default: m.TransportManagementModal })));
const LibraryManagementModal = React.lazy(() => import('./LibraryManagementModal').then(m => ({ default: m.LibraryManagementModal })));
const InventoryManagementModal = React.lazy(() => import('./InventoryManagementModal').then(m => ({ default: m.InventoryManagementModal })));
const CharacterCertificateModal = React.lazy(() => import('./CharacterCertificateModal').then(m => ({ default: m.CharacterCertificateModal })));
const BonafideCertificateModal = React.lazy(() => import('./BonafideCertificateModal').then(m => ({ default: m.BonafideCertificateModal })));
const BulkNotificationModal = React.lazy(() => import('./BulkNotificationModal').then(m => ({ default: m.BulkNotificationModal })));
const AuditLogModal = React.lazy(() => import('./AuditLogModal').then(m => ({ default: m.AuditLogModal })));
const SessionManagementModal = React.lazy(() => import('./SessionManagementModal').then(m => ({ default: m.SessionManagementModal })));
const TabulationRegisterModal = React.lazy(() => import('./TabulationRegisterModal').then(m => ({ default: m.TabulationRegisterModal })));
const HelpGuideModal = React.lazy(() => import('./HelpGuideModal').then(m => ({ default: m.HelpGuideModal })));
const SchoolProposalModal = React.lazy(() => import('./SchoolProposalModal').then(m => ({ default: m.SchoolProposalModal })));
const BulkIdCardModal = React.lazy(() => import('./BulkIdCardModal').then(m => ({ default: m.BulkIdCardModal })));
const DakhilKharijRegisterModal = React.lazy(() => import('./DakhilKharijRegisterModal').then(m => ({ default: m.DakhilKharijRegisterModal })));
const DeveloperDashboard = React.lazy(() => import('./DeveloperDashboard').then(m => ({ default: m.DeveloperDashboard })));

// Tab Subcomponents (Phase 2 Monolith Decomposition)
import { AdminOverviewTab } from './tabs/AdminOverviewTab';
import { AdminStudentsTab } from './tabs/AdminStudentsTab';
import { AdminAttendanceTab } from './tabs/AdminAttendanceTab';
import { AdminFeesTab } from './tabs/AdminFeesTab';
import { AdminReportsTab } from './tabs/AdminReportsTab';
import { AdminAdmissionsTab } from './tabs/AdminAdmissionsTab';
import { AdminNoticesTab } from './tabs/AdminNoticesTab';
import { AdminHomeworkTab } from './tabs/AdminHomeworkTab';
import { AdminStaffTab } from './tabs/AdminStaffTab';
import type { AdminTab } from './tabs/types';

import { HelpTooltip } from '../common/HelpTooltip';
import { TabErrorBoundary } from '../common/TabErrorBoundary';
import { downloadFullSchoolBackup, parseAndValidateBackupJSON } from '../../utils/backupExport';
import { generateRichDemoData } from '../../utils/demoDataSeeder';
import { api } from '../../services/api';
import type { Student, FeeRecord, ReportCard, Homework, Staff, Exam } from '../../types';
import {
  Users,
  Plus,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Printer,
  Download,
  Upload,
  RefreshCw,
  Building2,
  Crown,
  Lock,
  LogOut,
  ArrowRight,
  Sliders
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    setViewMode,
    dbStatus,
    refreshFromDb,
    schools,
    currentSchool,
    setCurrentSchoolId,
    students,
    attendanceRecords,
    feeRecords,
    reportCards,
    notices,
    bulkAddStudents,
    addFeeRecord,
    addOrUpdateReportCard,
    addNotice,
    getAttendanceForDate
  } = useSchool();

  const { showSuccess, showError, showInfo } = useToast();

  const isPro = true; // All onboarded schools have full ERP feature access
  const [upgradeModalFeature, setUpgradeModalFeature] = useState<{ name: string; desc?: string } | null>(null);

  const requirePro = (_featureName: string, _featureDesc: string, onAllowed: () => void) => {
    onAllowed();
  };

  const [currentTab, setCurrentTab] = useState<AdminTab>(() => {
    try {
      const param = new URLSearchParams(window.location.search).get('tab');
      const validTabs: AdminTab[] = ['overview', 'students', 'attendance', 'fees', 'reports', 'homework', 'staff', 'admissions', 'notices', 'developer'];
      if (param && validTabs.includes(param as AdminTab)) return param as AdminTab;
    } catch {}
    return 'overview';
  });
  const [showMobileModules, setShowMobileModules] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [activeEditStudent, setActiveEditStudent] = useState<Student | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [schoolModalMode, setSchoolModalMode] = useState<'list' | 'add' | 'settings'>('list');
  
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

  // Modal States
  const [activeSalarySlipStaff, setActiveSalarySlipStaff] = useState<Staff | null>(null);
  const [activeWhatsAppAlert, setActiveWhatsAppAlert] = useState<{
    title: string;
    recipientName: string;
    recipientPhone: string;
    studentClass: string;
    defaultMessage: string;
  } | null>(null);
  const [activePhotoStudent, setActivePhotoStudent] = useState<Student | null>(null);

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
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showBulkIdCardModal, setShowBulkIdCardModal] = useState(false);
  const [showDakhilKharijModal, setShowDakhilKharijModal] = useState(false);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = parseAndValidateBackupJSON(text);

      const confirmMsg = `बैकअप फ़ाइल सफलतापूर्वक सत्यापित हुई! (संस्करण: ${backup.backupVersion})\n\nडेटा विवरण:\n• छात्र: ${backup.counts.students}\n• शुल्क रिकॉर्ड: ${backup.counts.fees}\n• उपस्थिति रिकॉर्ड: ${backup.counts.attendance}\n• समग्र रिपोर्ट कार्ड: ${backup.counts.reportCards}\n• सूचनाएं: ${backup.counts.notices}\n\nक्या आप यह सम्पूर्ण डेटा '${currentSchool.hindiName || currentSchool.name}' में रीस्टोर करना चाहते हैं?`;

      if (!window.confirm(confirmMsg)) {
        if (backupFileInputRef.current) backupFileInputRef.current.value = '';
        return;
      }

      if (backup.data.students.length > 0 && bulkAddStudents) {
        await bulkAddStudents(backup.data.students);
      }
      for (const fee of backup.data.fees) {
        await addFeeRecord(fee);
      }
      for (const rep of backup.data.reportCards) {
        await addOrUpdateReportCard(rep);
      }
      for (const not of backup.data.notices) {
        await addNotice(not);
      }

      showSuccess(`बैकअप सफलतापूर्वक रीस्टोर हुआ! (${backup.counts.students} छात्र, ${backup.counts.fees} शुल्क रिकॉर्ड)`);
      await refreshFromDb();
    } catch (err: any) {
      showError('बैकअप रीस्टोर करने में त्रुटि: ' + (err.message || 'Error'));
    } finally {
      if (backupFileInputRef.current) backupFileInputRef.current.value = '';
    }
  };

  const handleSeedDemoData = async () => {
    if (currentSchool.id !== 'ssm-demo') {
      showError('डेमो डेटा केवल लाइव डेमो मोड (Demo Sandbox) में ही लोड किया जा सकता है। वास्तविक विद्यालयों में केवल वास्तविक डेटा प्रविष्टि की जा सकती है।');
      return;
    }
    if (!window.confirm(`क्या आप डेमो सैंडबॉक्स में 12 छात्र, उपस्थिति, शुल्क, 360° NEP रिपोर्ट कार्ड एवं नोटिस लोड करना चाहते हैं?`)) {
      return;
    }
    try {
      const demo = generateRichDemoData('ssm-demo', currentSchool.city || 'नई दिल्ली');
      if (bulkAddStudents) {
        await bulkAddStudents(demo.students);
      }
      for (const f of demo.feeRecords) {
        await addFeeRecord(f);
      }
      for (const r of demo.reportCards) {
        await addOrUpdateReportCard(r);
      }
      for (const n of demo.notices) {
        await addNotice(n);
      }
      showSuccess('डेमो सैंडबॉक्स में रिच डेमो डेटा (12 छात्र, उपस्थिति, शुल्क, समग्र प्रगति पत्र) सफलतापूर्वक लोड हो गया है।');
      await refreshFromDb('ssm-demo');
    } catch (err: any) {
      showError('डेमो डेटा लोड करने में त्रुटि: ' + (err.message || 'Error'));
    }
  };

  const [activeAdmitCard, setActiveAdmitCard] = useState<{ student: Student; exam: Exam } | null>(null);
  const [activeCharacterStudent, setActiveCharacterStudent] = useState<Student | null>(null);
  const [activeBonafideStudent, setActiveBonafideStudent] = useState<Student | null>(null);

  // Check if any admin modal is currently active
  const isAnyModalOpen = Boolean(
    upgradeModalFeature ||
    showAddStudent ||
    activeEditStudent ||
    showBulkImport ||
    showSchoolModal ||
    activeFeeModal ||
    activeReportModal ||
    activeIdCardStudent ||
    activeTcStudent ||
    activeSalarySlipStaff ||
    activeWhatsAppAlert ||
    activePhotoStudent ||
    showExamModal ||
    showTimetableModal ||
    showLeaveModal ||
    showTransportModal ||
    showLibraryModal ||
    showInventoryModal ||
    showBulkNotificationModal ||
    showAuditLogModal ||
    showSessionManagementModal ||
    showHelpGuideModal ||
    showTabulationModal ||
    showProposalModal ||
    showBulkIdCardModal ||
    showDakhilKharijModal ||
    activeAdmitCard ||
    activeCharacterStudent ||
    activeBonafideStudent
  );

  const closeAllModals = useCallback(() => {
    setUpgradeModalFeature(null);
    setShowAddStudent(false);
    setActiveEditStudent(null);
    setShowBulkImport(false);
    setShowSchoolModal(false);
    setActiveFeeModal(null);
    setActiveReportModal(null);
    setActiveIdCardStudent(null);
    setActiveTcStudent(null);
    setActiveSalarySlipStaff(null);
    setActiveWhatsAppAlert(null);
    setActivePhotoStudent(null);
    setShowExamModal(false);
    setShowTimetableModal(false);
    setShowLeaveModal(false);
    setShowTransportModal(false);
    setShowLibraryModal(false);
    setShowInventoryModal(false);
    setShowBulkNotificationModal(false);
    setShowAuditLogModal(false);
    setShowSessionManagementModal(false);
    setShowHelpGuideModal(false);
    setShowTabulationModal(false);
    setShowProposalModal(false);
    setShowBulkIdCardModal(false);
    setShowDakhilKharijModal(false);
    setActiveAdmitCard(null);
    setActiveCharacterStudent(null);
    setActiveBonafideStudent(null);
  }, []);

  const navigateTab = useCallback((newTab: AdminTab) => {
    if (newTab !== currentTab) {
      window.history.pushState({ adminTab: newTab }, '', `?tab=${newTab}`);
      setCurrentTab(newTab);
    }
  }, [currentTab]);

  const handleLogout = () => {
    api.logoutAdmin();
    setViewMode('public');
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isAnyModalOpen) {
        closeAllModals();
        return;
      }
      if (e.state?.adminTab) {
        setCurrentTab(e.state.adminTab);
      } else if (currentTab !== 'overview') {
        setCurrentTab('overview');
      } else {
        setViewMode('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAnyModalOpen, closeAllModals, currentTab, setViewMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAnyModalOpen) {
          e.preventDefault();
          closeAllModals();
        } else if (currentTab !== 'overview') {
          e.preventDefault();
          navigateTab('overview');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnyModalOpen, closeAllModals, currentTab, navigateTab]);

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

  // Admissions list
  const [admissions, setAdmissions] = useState<any[]>([]);

  useEffect(() => {
    if (!currentSchool?.id) return;
    api.getAdmissions(currentSchool.id).then(res => setAdmissions(res)).catch(() => {});
  }, [currentSchool?.id]);

  const lastLoadedSchoolCountRef = useRef<number>(-1);

  useEffect(() => {
    if (!isDeveloper || schools.length === 0 || currentTab !== 'overview') return;
    if (lastLoadedSchoolCountRef.current === schools.length) return;

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
          collected: branchFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0),
          pending: branchFees.reduce((sum, fee) => sum + Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0)), 0),
          admissions: branchAdmissions.filter(admission => admission.status === 'Pending' || (!['Admitted', 'Rejected'].includes(admission.status))).length
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
        attendanceRate: totals.students > 0 ? Math.round((totals.present / totals.students) * 100) : 0,
        collected: totals.collected,
        pending: totals.pending,
        admissions: totals.admissions
      });
      lastLoadedSchoolCountRef.current = schools.length;
    };

    loadDeveloperMetrics().catch(error => console.error('Error loading developer metrics:', error));
  }, [isDeveloper, schools, currentTab]);

  const handleApproveAdmission = async (id: string, options?: { section?: string; bloodGroup?: string; rollNo?: string }) => {
    try {
      const res = await api.approveAdmission(id, options);
      if (res.success) {
        showSuccess(`प्रवेश स्वीकृत हुआ! ${res.student.name} को छात्र पंजिका में जोड़ दिया गया है।`);
        await refreshFromDb();
        const updatedAdmissions = await api.getAdmissions(currentSchool.id);
        setAdmissions(updatedAdmissions);
      }
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleRejectAdmission = async (id: string, reason?: string) => {
    try {
      const res = await api.rejectAdmission(id, reason);
      if (res.success) {
        showSuccess('प्रवेश आवेदन अस्वीकृत (Rejected) के रूप में चिन्हित किया गया।');
        const updatedAdmissions = await api.getAdmissions(currentSchool.id);
        setAdmissions(updatedAdmissions);
      }
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleDeleteAdmission = async (id: string) => {
    try {
      await api.deleteAdmission(id);
      showSuccess('प्रवेश आवेदन सफलतापूर्वक हटाया गया!');
      setAdmissions(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  // Calculations for overview stats (memoized for performance)
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
  
  const todayAttendance = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return getAttendanceForDate(today);
  }, [getAttendanceForDate]);

  const { presentCount, attendanceRate } = useMemo(() => {
    const vals = Object.values(todayAttendance);
    let present = 0;
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === 'Present') present++;
    }
    const marked = vals.length;
    const rate = totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0;
    return { presentCount: present, attendanceRate: rate };
  }, [todayAttendance, totalStudents]);

  const { totalFeeCollected, totalFeePending } = useMemo(() => {
    let collected = 0;
    let pending = 0;
    for (let i = 0; i < feeRecords.length; i++) {
      const f = feeRecords[i];
      collected += (f.paidAmount || 0);
      pending += Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));
    }
    return { totalFeeCollected: collected, totalFeePending: pending };
  }, [feeRecords]);

  const activeStaffList = useMemo(() => {
    return staffList.filter(s => s.status !== 'Resigned');
  }, [staffList]);
  const resignedStaffCount = staffList.length - activeStaffList.length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col w-full max-w-full overflow-x-hidden">
      
      {/* Top Bar for Admin */}
      <header className="bg-orange-900 text-white sticky top-0 z-30 shadow-md w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2 sm:min-h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
          
          {/* Brand & Left Actions */}
          <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
              <button
                onClick={() => {
                  if (currentTab !== 'overview') {
                    navigateTab('overview');
                  } else {
                    handleLogout();
                  }
                }}
                className="p-1 rounded-lg bg-orange-800/80 hover:bg-orange-700 text-amber-200 hover:text-white transition flex items-center justify-center shrink-0"
                title={currentTab !== 'overview' ? "मुख्य डैशबोर्ड पर वापस जाएं" : "सार्वजनिक पोर्टल पर जाएं"}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">🚩</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-sm sm:text-base font-black tracking-tight text-amber-100 truncate">
                      {currentSchool.hindiName || currentSchool.name}
                    </h1>
                    <HelpTooltip
                      content="विद्या भारती ईआरपी व्यवस्थापक कंसोल: यहाँ से आप छात्र पंजिका, शुल्क, उपस्थिति, परीक्षा, एवं आचार्य पेरोल का संपूर्ण संचालन कर सकते हैं।"
                      position="bottom"
                    />
                  </div>
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
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 font-bold text-white text-[11px] shadow-xs shrink-0 cursor-pointer"
                title="नया छात्र प्रवेश"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>छात्र</span>
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                title="लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Controls: Branch Switcher, Plan, Sync, Desktop Buttons */}
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5 sm:gap-2 text-xs w-full sm:w-auto pb-0.5 sm:pb-0">
            {/* School / Branch Switcher (Super-Admin / Developer Only) */}
            {isDeveloper ? (
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
                  title="Switch School Branch (Developer Only)"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id} className="text-stone-900 font-medium">
                      {s.city} ({s.prant})
                    </option>
                  ))}
                  <option value="ADD_NEW" className="text-orange-900 font-bold">+ नई शाखा जोड़ें...</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-950/80 border border-orange-800/60 text-[11px] font-bold text-amber-200 shrink-0">
                <Building2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[200px]" title={currentSchool.name}>
                  {currentSchool.city} ({currentSchool.prant})
                </span>
              </div>
            )}

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
                  className="p-0.5 hover:text-white text-orange-300 cursor-pointer"
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
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-800 hover:bg-orange-700 text-amber-200 text-[11px] font-bold border border-orange-700 transition-colors shrink-0 cursor-pointer"
              title="Manage all school branches"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>शाखाएं ({schools.length})</span>
            </button>

            <button
              onClick={() => {
                setSchoolModalMode('settings');
                setShowSchoolModal(true);
              }}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-900/80 hover:bg-orange-800 text-amber-200 text-[11px] font-bold border border-orange-700 transition-colors shrink-0 cursor-pointer"
              title="शाखा सुविधा सेटिंग्स (UPI QR, LOP आदि) कॉन्फ़िगर करें"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>सुविधा सेटिंग्स</span>
            </button>

            <button
              onClick={() => setShowSessionManagementModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold border border-amber-400/40 transition-colors shrink-0 cursor-pointer"
              title="सत्र प्रबंधन, छात्र प्रोन्नति एवं बकाया शुल्क अंतरण"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>सत्र: {currentSchool.currentAcademicYear || '2025-26'} 🔄</span>
            </button>

            {/* 15-Day Free Trial / Pro Active Badge */}
            {currentSchool.plan === 'pro' && (
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 text-[11px] font-bold border border-amber-400/40 shrink-0"
                title="15-दिवसीय प्रो पायलट ट्रायल सक्रिय है। समस्त उन्नत सुविधाएं (NEP रिपोर्ट कार्ड, डिजिटल आईडी, व्हाट्सएप सूचनाएं) उपलब्ध हैं।"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>15-दिवसीय प्रो ट्रायल सक्रिय</span>
              </div>
            )}

            {/* Proposal Print Button (Developer Only) */}
            {isDeveloper && (
              <button
                onClick={() => setShowProposalModal(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-[11px] font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                title="प्रधानाचार्य / प्रबंधक हेतु आधिकारिक A4 प्रस्ताव पत्र व कोटेशन प्रिंट करें"
              >
                <Printer className="w-3.5 h-3.5 text-yellow-200" />
                <span className="hidden sm:inline">प्रस्ताव पत्र</span>
              </button>
            )}

            {/* 1-Click Full Backup Button */}
            <button
              onClick={() => {
                downloadFullSchoolBackup(currentSchool, students, feeRecords, attendanceRecords, reportCards, notices);
                showSuccess('सम्पूर्ण विद्यालय डेटा बैकअप (.JSON) सफलतापूर्वक डाउनलोड हो गया है।');
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold border border-stone-700 transition-colors shrink-0 cursor-pointer"
              title="सम्पूर्ण विद्यालय डेटा बैकअप फाइल अपने कंप्यूटर में डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>डेटा बैकअप (डाउनलोड)</span>
            </button>

            {/* Hidden Backup File Input for Restore */}
            <input
              ref={backupFileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
            {/* 1-Click Restore Backup Button */}
            <button
              onClick={() => backupFileInputRef.current?.click()}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold border border-stone-700 transition-colors shrink-0 cursor-pointer"
              title="पूर्व में डाउनलोड की गई सुरक्षित बैकअप फाइल से डेटा वापस लाएं"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>डेटा रीस्टोर (फ़ाइल से)</span>
            </button>

            {/* Pitching Demo Seeder Button (Developer Only, strictly in Demo Sandbox) */}
            {isDeveloper && currentSchool.id === 'ssm-demo' && (
              <button
                onClick={handleSeedDemoData}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-950/80 hover:bg-orange-900 text-yellow-300 text-[11px] font-bold border border-orange-800/80 transition-colors shrink-0 cursor-pointer"
                title="डेमो सैंडबॉक्स हेतु 12 छात्र, उपस्थिति, शुल्क एवं 360° रिपोर्ट कार्ड लोड करें"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>डेमो लोड</span>
              </button>
            )}

            <span className="hidden lg:inline-block px-2.5 py-1 bg-orange-950 rounded-full border border-orange-800 text-amber-200 shrink-0">
              प्रधानाचार्य: {currentSchool.principalName}
            </span>

            <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900 rounded-full border border-stone-700 text-stone-300 font-mono text-[11px] shrink-0" title="भारत सरकार UDISE+ विद्यालय कोड">
              <span className="text-amber-400 font-bold">UDISE:</span> {currentSchool.udiseCode || '09510100101'}
            </span>

            {/* Desktop Logout and Add Student */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white text-xs font-bold transition-colors shrink-0 cursor-pointer"
              title="व्यवस्थापक सत्र से लॉगआउट करें"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>

            <button
              onClick={() => setShowAddStudent(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 font-bold text-white shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नया छात्र</span>
            </button>
          </div>
        </div>

        {/* Mobile module navigation */}
        <div className="sm:hidden border-t border-orange-800/60 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <label htmlFor="mobile-admin-section" className="sr-only">वर्तमान अनुभाग चुनें</label>
            <select
              id="mobile-admin-section"
              value={currentTab}
              onChange={(e) => {
                const nextTab = e.target.value as AdminTab;
                if (nextTab === 'reports' && !isPro) {
                  requirePro(
                    '360° समग्र प्रगति पत्र (Holistic Report Cards)',
                    'NEP 2020 एवं विद्या भारती 5 आधार विषयों सहित समग्र प्रगति पत्र केवल प्रो योजना में उपलब्ध है।',
                    () => setCurrentTab(nextTab)
                  );
                  return;
                }
                if (nextTab === 'staff' && !isPro) {
                  requirePro(
                    'आचार्य एवं वेतन प्रबंधन (Staff & Payroll)',
                    'शिक्षकों का पूर्ण रिकॉर्ड एवं मासिक वेतन पर्ची केवल प्रो योजना में उपलब्ध है।',
                    () => setCurrentTab(nextTab)
                  );
                  return;
                }
                setCurrentTab(nextTab);
              }}
              className="min-w-0 flex-1 rounded-lg border border-orange-700 bg-orange-950 px-3 py-2 text-xs font-bold text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="overview">मुख्य पृष्ठ (Overview)</option>
              <option value="students">छात्र पंजिका ({totalStudents})</option>
              <option value="attendance">दैनिक उपस्थिति</option>
              <option value="fees">शुल्क प्रबंधन व रसीद</option>
              <option value="reports">प्रगति पत्र {isPro ? '' : '(PRO)'}</option>
              <option value="homework">दैनिक गृहकार्य ({homeworkList.length})</option>
              <option value="staff">आचार्य एवं वेतन ({activeStaffList.length}) {isPro ? '' : '(PRO)'}</option>
              <option value="admissions">प्रवेश समीक्षा ({admissions.length})</option>
              <option value="notices">सूचना प्रसारण</option>
              {isDeveloper && <option value="developer">🛠️ डेवलपर कंसोल (Developer Super-Admin)</option>}
            </select>
            <button
              type="button"
              onClick={() => setShowMobileModules(value => !value)}
              aria-expanded={showMobileModules}
              className="shrink-0 rounded-lg border border-amber-400/50 bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-100 cursor-pointer"
            >
              {showMobileModules ? 'बंद करें' : 'सभी मॉड्यूल'}
            </button>
          </div>

          {showMobileModules && (
            <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-orange-950/70 p-2">
              {([
                ['📝', 'परीक्षा व अंक', () => setShowExamModal(true)],
                ['📋', 'टैबुलेशन रजिस्टर', () => setShowTabulationModal(true)],
                ['📖', 'दाखिल-खारिज पंजिका', () => setShowDakhilKharijModal(true)],
                ['🕒', 'समय सारिणी', () => setShowTimetableModal(true)],
                ['🌴', 'अवकाश समीक्षा', () => setShowLeaveModal(true)],
                ['🚌', 'बस परिवहन', () => setShowTransportModal(true)],
                ['📚', 'पुस्तकालय', () => setShowLibraryModal(true)],
                ['🎒', 'भंडार स्टॉक', () => setShowInventoryModal(true)],
                ['📢', 'संदेश प्रसारण', () => setShowBulkNotificationModal(true)],
                ['🛡️', 'गतिविधि रजिस्टर', () => setShowAuditLogModal(true)],
                ['🎓', 'सत्र व प्रोन्नति', () => setShowSessionManagementModal(true)],
                ['💡', 'मदद गाइड', () => setShowHelpGuideModal(true)],
                ['⚙️', 'शाखा प्रबंधन', () => {
                  setSchoolModalMode('list');
                  setShowSchoolModal(true);
                }],
                ['🎛️', 'सुविधा सेटिंग्स', () => {
                  setSchoolModalMode('settings');
                  setShowSchoolModal(true);
                }]
              ] as Array<[string, string, () => void]>).map(([icon, label, action]) => (
                <button
                  key={label as string}
                  type="button"
                  onClick={() => {
                    (action as () => void)();
                    setShowMobileModules(false);
                  }}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-orange-800 bg-orange-900/70 px-2.5 py-2 text-left text-[11px] font-bold text-amber-100 hover:bg-orange-800 cursor-pointer"
                >
                  <span aria-hidden="true">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop tab navigation */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5 overflow-x-visible text-xs font-medium border-t border-orange-800/60 w-full max-w-full">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'overview'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            मुख्य पृष्ठ (Overview)
          </button>
          <button
            onClick={() => setCurrentTab('students')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'students'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            छात्र पंजिका ({totalStudents} छात्र)
          </button>
          <button
            onClick={() => setCurrentTab('attendance')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'attendance'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            दैनिक उपस्थिति (Attendance)
          </button>
          <button
            onClick={() => setCurrentTab('fees')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'fees'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            शुल्क प्रबंधन व रसीद (Fees)
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'reports'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <span>प्रगति पत्र (Report Cards)</span>
          </button>
          <button
            onClick={() => setCurrentTab('homework')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'homework'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            दैनिक गृहकार्य ({homeworkList.length})
          </button>
          <button
            onClick={() => setCurrentTab('staff')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'staff'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <span>आचार्य एवं वेतन ({activeStaffList.length})</span>
          </button>
          <button
            onClick={() => setCurrentTab('admissions')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'admissions'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            प्रवेश समीक्षा ({admissions.length} आवेदन)
          </button>
          <button
            onClick={() => setCurrentTab('notices')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              currentTab === 'notices'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            सूचना प्रसारण (Notices)
          </button>
          <div className="h-5 w-px bg-orange-700/60 self-center" />
          {/* Grouped Secondary Utilities Dropdown */}
          <div className="relative self-center my-1">
            <button
              type="button"
              onClick={() => setShowMoreMenu(prev => !prev)}
              className="py-1.5 px-3 rounded-xl bg-orange-950/90 hover:bg-orange-900 text-amber-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-orange-700/60 shadow-xs"
              title="अतिरिक्त विद्यालय सेवाएं (परीक्षा, समय-सारणी, बस, पुस्तकालय, भंडार, सत्र)"
            >
              <span>⚙️ अन्य सुविधाएं (More)</span>
              <span className="text-[9px]">{showMoreMenu ? '▲' : '▼'}</span>
            </button>
            {showMoreMenu && (
              <div
                className="absolute left-0 sm:right-0 top-full mt-1.5 w-60 bg-stone-900 border border-orange-700 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-stone-800 text-xs animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowMoreMenu(false)}
              >
                <div className="py-1 px-1">
                  <button
                    type="button"
                    onClick={() => { setShowExamModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>📝</span>
                    <span>परीक्षा व अंक तालिका (Exams)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowTabulationModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>📋</span>
                    <span>टैबुलेशन रजिस्टर (TR Sheet)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDakhilKharijModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>📖</span>
                    <span>दाखिल-खारिज पंजिका (General Register)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowTimetableModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>🕒</span>
                    <span>समय सारिणी (Timetable)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowLeaveModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>🌴</span>
                    <span>अवकाश समीक्षा (Leaves)</span>
                  </button>
                </div>
                <div className="py-1 px-1">
                  <button
                    type="button"
                    onClick={() => { setShowTransportModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>🚌</span>
                    <span>बस परिवहन (Transport)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowLibraryModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>📚</span>
                    <span>पुस्तकालय (Library)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowInventoryModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>🎒</span>
                    <span>गणवेश व भंडार (Store)</span>
                  </button>
                </div>
                <div className="py-1 px-1">
                  <button
                    type="button"
                    onClick={() => { setShowSessionManagementModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-stone-200 hover:bg-orange-950 hover:text-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>🎓</span>
                    <span>सत्र व प्रोन्नति (Promotion)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAuditLogModal(true); setShowMoreMenu(false); }}
                    className="w-full text-left px-3 py-2 text-cyan-300 hover:bg-orange-950 hover:text-cyan-200 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>🛡️</span>
                    <span>सुरक्षा गतिविधि रजिस्टर</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowHelpGuideModal(true)}
            className="my-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 hover:text-white border border-amber-400/50 whitespace-nowrap font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="गैर-तकनीकी स्टाफ व नए आचार्यों हेतु 1-मिनट सरल मार्गदर्शिका"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>💡 मदद चाहिए? (गाइड)</span>
          </button>
          {isDeveloper && (
            <button
              onClick={() => setCurrentTab('developer')}
              className={`my-1.5 px-3 py-1.5 rounded-xl border whitespace-nowrap font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                currentTab === 'developer'
                  ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-300'
                  : 'bg-orange-950 text-amber-200 border-amber-400/50 hover:bg-orange-800'
              }`}
              title="डेवलपर सुपर-एडमिन कंसोल (सभी शाखाएं, सदस्यताएं व ऑडिट)"
            >
              <span>🛠️ डेवलपर कंसोल</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-5 sm:space-y-6 overflow-x-hidden">
        
        {/* Sub-tab In-line Back Navigation Bar */}
        {currentTab !== 'overview' && (
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-orange-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => navigateTab('overview')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 font-bold text-xs border border-orange-200 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-orange-700 shrink-0" />
              <span>← मुख्य डैशबोर्ड पर वापस (Back to Overview)</span>
            </button>
            <span className="text-xs font-semibold text-stone-500 capitalize hidden sm:inline">
              वर्तमान अनुभाग: {currentTab}
            </span>
          </div>
        )}

        {/* Tab Subcomponents */}
        {currentTab === 'overview' && (
          <TabErrorBoundary tabName="मुख्य पृष्ठ (Overview)">
            <AdminOverviewTab
              isDeveloper={isDeveloper}
              developerMetrics={developerMetrics}
              staffCount={activeStaffList.length}
              resignedStaffCount={resignedStaffCount}
              totalBhaiya={totalBhaiya}
              totalBahin={totalBahin}
              attendanceRate={attendanceRate}
              presentCount={presentCount}
              totalFeeCollected={totalFeeCollected}
              totalFeePending={totalFeePending}
              onNavigateTab={navigateTab}
              onOpenHelpGuide={() => setShowHelpGuideModal(true)}
              onOpenAddStudent={() => setShowAddStudent(true)}
              onOpenBulkIdCard={() => setShowBulkIdCardModal(true)}
              onOpenExamModal={() => setShowExamModal(true)}
              onOpenTabulationModal={() => setShowTabulationModal(true)}
              onOpenTimetableModal={() => setShowTimetableModal(true)}
              onOpenLeaveModal={() => setShowLeaveModal(true)}
              onOpenTransportModal={() => setShowTransportModal(true)}
              onOpenLibraryModal={() => setShowLibraryModal(true)}
              onOpenInventoryModal={() => setShowInventoryModal(true)}
              onOpenBulkNotificationModal={() => setShowBulkNotificationModal(true)}
              onOpenAuditLogModal={() => setShowAuditLogModal(true)}
              requirePro={requirePro}
              onOpenReportModal={setActiveReportModal}
            />
          </TabErrorBoundary>
        )}

        {currentTab === 'students' && (
          <TabErrorBoundary tabName="छात्र पंजिका (Students)">
            <AdminStudentsTab
              totalBhaiya={totalBhaiya}
              totalBahin={totalBahin}
              requirePro={requirePro}
              onOpenAddStudent={() => setShowAddStudent(true)}
              onOpenEditStudent={setActiveEditStudent}
              onOpenBulkImport={() => setShowBulkImport(true)}
              onOpenBulkIdCard={() => setShowBulkIdCardModal(true)}
              onOpenPhotoUpload={setActivePhotoStudent}
              onOpenIdCard={setActiveIdCardStudent}
              onOpenTc={setActiveTcStudent}
              onOpenReportModal={setActiveReportModal}
              onOpenCharacterCertificate={setActiveCharacterStudent}
              onOpenBonafideCertificate={setActiveBonafideStudent}
              onOpenDakhilKharij={() => setShowDakhilKharijModal(true)}
            />
          </TabErrorBoundary>
        )}

        {currentTab === 'attendance' && (
          <TabErrorBoundary tabName="दैनिक उपस्थिति (Attendance)">
            <AdminAttendanceTab
              requirePro={requirePro}
              onOpenWhatsAppAlert={setActiveWhatsAppAlert}
            />
          </TabErrorBoundary>
        )}

        {currentTab === 'fees' && (
          <TabErrorBoundary tabName="शुल्क प्रबंधन (Fees)">
            <AdminFeesTab
              totalFeeCollected={totalFeeCollected}
              totalFeePending={totalFeePending}
              requirePro={requirePro}
              onOpenFeeModal={setActiveFeeModal}
              onOpenWhatsAppAlert={setActiveWhatsAppAlert}
            />
          </TabErrorBoundary>
        )}

        {currentTab === 'reports' && (
          <TabErrorBoundary tabName="प्रगति पत्र (Reports)">
            <AdminReportsTab
              requirePro={requirePro}
              onOpenReportModal={setActiveReportModal}
              onOpenTabulationModal={() => setShowTabulationModal(true)}
              onOpenUpgradeModal={setUpgradeModalFeature}
            />
          </TabErrorBoundary>
        )}

        {currentTab === 'admissions' && (
          <TabErrorBoundary tabName="प्रवेश समीक्षा (Admissions)">
            <AdminAdmissionsTab
              admissions={admissions}
              onApprove={handleApproveAdmission}
              onReject={handleRejectAdmission}
              onDelete={handleDeleteAdmission}
            />
          </TabErrorBoundary>
        )}

        {currentTab === 'notices' && (
          <TabErrorBoundary tabName="सूचना प्रसारण (Notices)">
            <AdminNoticesTab />
          </TabErrorBoundary>
        )}

        {currentTab === 'homework' && (
          <TabErrorBoundary tabName="दैनिक गृहकार्य (Homework)">
            <AdminHomeworkTab
              homeworkList={homeworkList}
              onRefresh={fetchHomeworkAndStaff}
              setHomeworkList={setHomeworkList}
            />
          </TabErrorBoundary>
        )}

        {currentTab === 'staff' && (
          <TabErrorBoundary tabName="आचार्य एवं वेतन (Staff)">
            <AdminStaffTab
              staffList={staffList}
              onRefresh={fetchHomeworkAndStaff}
              setStaffList={setStaffList}
              onOpenSalarySlip={setActiveSalarySlipStaff}
              onOpenUpgradeModal={setUpgradeModalFeature}
            />
          </TabErrorBoundary>
        )}

        {/* ================= TAB: DEVELOPER CONSOLE (डेवलपर सुपर-एडमिन कंसोल) ================= */}
        {currentTab === 'developer' && (
          <TabErrorBoundary tabName="डेवलपर कंसोल (Developer)">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-24">
                <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mb-3" />
                <p className="text-stone-500 text-sm font-hindi">कंसोल लोड हो रहा है...</p>
              </div>
            }>
              <DeveloperDashboard
                onBack={() => navigateTab('overview')}
                onSwitchToBranch={(branchId) => {
                  navigateTab('overview');
                }}
              />
            </Suspense>
          </TabErrorBoundary>
        )}

      </main>

      {/* Lazy-Loaded Modals */}
      <Suspense fallback={null}>
        {(showAddStudent || activeEditStudent) && (
          <AddStudentModal
            studentToEdit={activeEditStudent}
            onClose={() => {
              setShowAddStudent(false);
              setActiveEditStudent(null);
            }}
          />
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

        {showBulkImport && (
          <BulkStudentImportModal
            isOpen={showBulkImport}
            onClose={() => setShowBulkImport(false)}
          />
        )}

        {upgradeModalFeature && (
          <ProUpgradeModal
            isOpen={!!upgradeModalFeature}
            featureName={upgradeModalFeature?.name}
            featureDescription={upgradeModalFeature?.desc}
            onClose={() => setUpgradeModalFeature(null)}
          />
        )}

        {/* New Module Modals */}
        {showExamModal && (
          <ExamManagementModal
            isOpen={showExamModal}
            onClose={() => setShowExamModal(false)}
            onOpenAdmitCard={(student, exam) => {
              setShowExamModal(false);
              setActiveAdmitCard({ student, exam });
            }}
          />
        )}

        {showTimetableModal && (
          <TimetableManagerModal
            isOpen={showTimetableModal}
            onClose={() => setShowTimetableModal(false)}
          />
        )}

        {showLeaveModal && (
          <LeaveManagementModal
            isOpen={showLeaveModal}
            onClose={() => setShowLeaveModal(false)}
          />
        )}

        {showTransportModal && (
          <TransportManagementModal
            isOpen={showTransportModal}
            onClose={() => setShowTransportModal(false)}
          />
        )}

        {showLibraryModal && (
          <LibraryManagementModal
            isOpen={showLibraryModal}
            onClose={() => setShowLibraryModal(false)}
          />
        )}

        {showInventoryModal && (
          <InventoryManagementModal
            isOpen={showInventoryModal}
            onClose={() => setShowInventoryModal(false)}
          />
        )}

        {showBulkNotificationModal && (
          <BulkNotificationModal
            isOpen={showBulkNotificationModal}
            onClose={() => setShowBulkNotificationModal(false)}
          />
        )}

        {showAuditLogModal && (
          <AuditLogModal
            isOpen={showAuditLogModal}
            onClose={() => setShowAuditLogModal(false)}
          />
        )}

        {showSessionManagementModal && (
          <SessionManagementModal
            isOpen={showSessionManagementModal}
            onClose={() => setShowSessionManagementModal(false)}
          />
        )}

        {showTabulationModal && (
          <TabulationRegisterModal
            isOpen={showTabulationModal}
            onClose={() => setShowTabulationModal(false)}
          />
        )}

        {showDakhilKharijModal && (
          <DakhilKharijRegisterModal
            onClose={() => setShowDakhilKharijModal(false)}
            onOpenTc={setActiveTcStudent}
          />
        )}

        {showHelpGuideModal && (
          <HelpGuideModal
            isOpen={showHelpGuideModal}
            onClose={() => setShowHelpGuideModal(false)}
            onOpenSessionModal={() => setShowSessionManagementModal(true)}
            onOpenAuditModal={() => setShowAuditLogModal(true)}
          />
        )}

        {showProposalModal && (
          <SchoolProposalModal
            isOpen={showProposalModal}
            onClose={() => setShowProposalModal(false)}
          />
        )}

        {showBulkIdCardModal && (
          <BulkIdCardModal
            isOpen={showBulkIdCardModal}
            onClose={() => setShowBulkIdCardModal(false)}
            students={students}
            school={currentSchool}
          />
        )}

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
      </Suspense>

    </div>
  );
};
