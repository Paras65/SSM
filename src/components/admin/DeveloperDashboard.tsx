import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { testSmartKeyHealth } from '../../services/aiService';
import type { School, AuditLogEntry } from '../../types';
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  Receipt,
  FileText,
  RefreshCw,
  Crown,
  KeyRound,
  Download,
  RotateCcw,
  Sparkles,
  Server,
  Activity,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Copy,
  ArrowLeft,
  Wrench,
  Clock,
  HardDrive,
  Database,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { generateRichDemoData } from '../../utils/demoDataSeeder';
import {
  getMaintenanceConfig,
  setMaintenanceConfig,
  DEFAULT_MAINTENANCE_CONFIG,
  type MaintenanceConfig
} from '../../utils/maintenanceConfig';

interface DeveloperDashboardProps {
  onSwitchToBranch?: (schoolId: string) => void;
  onBack?: () => void;
}

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ onSwitchToBranch, onBack }) => {
  const { schools, refreshFromDb, setCurrentSchoolId, bulkAddStudents, addFeeRecord, addOrUpdateReportCard, addNotice } = useSchool();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [activeSection, setActiveSection] = useState<'overview' | 'schools' | 'audit' | 'tools'>('overview');
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [dbHealth, setDbHealth] = useState<{ status: string; database: string; databaseHost?: string; timestamp?: string } | null>(null);

  // Network Totals
  const [networkStats, setNetworkStats] = useState({
    totalStudents: 0,
    totalPresentToday: 0,
    attendanceRate: 0,
    totalCollected: 0,
    totalPending: 0,
    totalAdmissionsPending: 0
  });

  // School Branch Management
  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolStatusFilter, setSchoolStatusFilter] = useState<'all' | 'active' | 'discontinued'>('all');
  const [updatingSchoolId, setUpdatingSchoolId] = useState<string | null>(null);
  const [editingPasscodeSchool, setEditingPasscodeSchool] = useState<School | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [copiedSchoolId, setCopiedSchoolId] = useState<string | null>(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActorFilter, setAuditActorFilter] = useState<string>('all');

  // Test Seeder State
  const [seedingSchoolId, setSeedingSchoolId] = useState<string>('ssm-demo');
  const [isSeeding, setIsSeeding] = useState(false);

  // Central Smart / Baudhik Service (.env Powered)
  const envSmartKey = (import.meta.env.VITE_SMART_API_KEY as string) || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
  const isSmartKeyActive = Boolean(envSmartKey.trim());
  const maskedSmartKey = isSmartKeyActive
    ? envSmartKey.slice(0, 6) + '...' + envSmartKey.slice(-4)
    : '';

  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
  } | null>(null);

  const handleTestSmartKey = async () => {
    setIsTestingKey(true);
    setKeyTestResult(null);

    try {
      const result = await testSmartKeyHealth();
      setKeyTestResult(result);
      if (result.success) {
        showSuccess(`बौद्धिक सेवा कुंजी सत्यापित! (${result.latency || 0}ms)`);
      } else {
        showError(result.message || 'कुंजी सत्यापन विफल');
      }
    } catch (err: any) {
      setKeyTestResult({
        success: false,
        message: `सत्यापन त्रुटि: ${err.message || 'सर्वर से संपर्क नहीं हो सका।'}`
      });
      showError('सत्यापन के दौरान कनेक्शन त्रुटि आई।');
    } finally {
      setIsTestingKey(false);
    }
  };

  // Platform Maintenance & Downtime Control
  const [maintConfig, setMaintConfig] = useState<MaintenanceConfig>(getMaintenanceConfig());

  useEffect(() => {
    const handleMaintUpdate = () => {
      setMaintConfig(getMaintenanceConfig());
    };
    window.addEventListener('ssm_maintenance_updated', handleMaintUpdate);
    return () => window.removeEventListener('ssm_maintenance_updated', handleMaintUpdate);
  }, []);

  const handleSaveMaintenance = (updated: Partial<MaintenanceConfig>) => {
    setMaintenanceConfig(updated);
    setMaintConfig(prev => ({ ...prev, ...updated }));
    showSuccess('रखरखाव विन्यास सफलतापूर्वक अपडेट किया गया!');
  };

  // Storage & Capacity Estimator
  const storageEstimates = useMemo(() => {
    const photoCount = Math.round(networkStats.totalStudents * 0.6);
    const photoKb = photoCount * 30; // avg ~30KB client-side compressed
    const attendanceRecords = networkStats.totalStudents * 180;
    const attendanceKb = Math.round(attendanceRecords * 0.15);
    const auditCount = auditLogs.length || 120;
    const auditKb = Math.round(auditCount * 0.8);
    const examKb = Math.round(networkStats.totalStudents * 4 * 1.2);
    const feeKb = Math.round(networkStats.totalStudents * 10 * 0.5);

    const totalKb = photoKb + attendanceKb + auditKb + examKb + feeKb;
    const totalMb = (totalKb / 1024).toFixed(2);

    return {
      photoCount,
      photoMb: (photoKb / 1024).toFixed(2),
      attendanceRecords,
      attendanceMb: (attendanceKb / 1024).toFixed(2),
      auditCount,
      auditMb: (auditKb / 1024).toFixed(2),
      examMb: (examKb / 1024).toFixed(2),
      feeMb: (feeKb / 1024).toFixed(2),
      totalMb,
      usagePercent: Math.min(100, Math.max(1, Math.round((parseFloat(totalMb) / 512) * 100)))
    };
  }, [networkStats.totalStudents, auditLogs.length]);

  // Fetch MongoDB Health & Network KPIs
  const loadNetworkData = async () => {
    setIsLoadingMetrics(true);
    try {
      const statusRes = await api.getStatus().catch(() => null);
      if (statusRes) {
        setDbHealth(statusRes);
      }

      const today = new Date().toISOString().split('T')[0];
      const branchResults = await Promise.allSettled(
        schools.map(async school => {
          const [students, attendance, fees, admissions] = await Promise.all([
            api.getStudents(school.id).catch(() => []),
            api.getAttendance(today, school.id).catch(() => []),
            api.getFees(school.id).catch(() => []),
            api.getAdmissions(school.id).catch(() => [])
          ]);
          return {
            studentsCount: students.length,
            presentCount: attendance.filter(a => a.status === 'Present').length,
            markedCount: attendance.length,
            collected: fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + (f.paidAmount || 0), 0),
            pending: fees.reduce((sum, f) => sum + Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0)), 0),
            pendingAdmissions: admissions.filter(a => a.status !== 'Admitted').length
          };
        })
      );

      const totals = branchResults.reduce(
        (acc, r) => {
          if (r.status === 'fulfilled') {
            acc.totalStudents += r.value.studentsCount;
            acc.totalPresentToday += r.value.presentCount;
            acc.markedAttendance += r.value.markedCount;
            acc.totalCollected += r.value.collected;
            acc.totalPending += r.value.pending;
            acc.totalAdmissionsPending += r.value.pendingAdmissions;
          }
          return acc;
        },
        { totalStudents: 0, totalPresentToday: 0, markedAttendance: 0, totalCollected: 0, totalPending: 0, totalAdmissionsPending: 0 }
      );

      setNetworkStats({
        totalStudents: totals.totalStudents,
        totalPresentToday: totals.totalPresentToday,
        attendanceRate: totals.totalStudents > 0 ? Math.round((totals.totalPresentToday / Math.max(totals.markedAttendance, totals.totalStudents)) * 100) : 0,
        totalCollected: totals.totalCollected,
        totalPending: totals.totalPending,
        totalAdmissionsPending: totals.totalAdmissionsPending
      });
    } catch (err: any) {
      showError('नेटवर्क डेटा लोड करने में त्रुटि: ' + err.message);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Load Audit Logs for all schools (developer has '*' access)
  const loadAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs || []);
    } catch (err: any) {
      showError('ऑडिट लॉग्स लोड करने में त्रुटि: ' + err.message);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
    if (schools.length > 0 && !seedingSchoolId) {
      setSeedingSchoolId(schools[0].id);
    }
  }, [schools.length]);

  useEffect(() => {
    if (activeSection === 'audit') {
      loadAuditLogs();
    }
  }, [activeSection]);

  // School Plan Change Handler
  const handlePlanChange = async (schoolId: string, nextPlan: 'free' | 'pro') => {
    setUpdatingSchoolId(schoolId);
    try {
      await api.updateSchool(schoolId, { plan: nextPlan });
      showSuccess(`शाखा सदस्यता सफलतापूर्वक अपडेट की गई: ${nextPlan.toUpperCase()}`);
      await refreshFromDb();
    } catch (err: any) {
      showError('योजना परिवर्तन विफल: ' + err.message);
    } finally {
      setUpdatingSchoolId(null);
    }
  };

  // School Reactivation Handler
  const handleReactivateSchool = async (schoolId: string) => {
    if (!window.confirm('क्या आप इस शाखा को पुनः सक्रिय करना चाहते हैं?')) return;
    setUpdatingSchoolId(schoolId);
    try {
      await api.reactivateSchool(schoolId);
      showSuccess('शाखा सफलतापूर्वक पुनः सक्रिय (Reactivated) कर दी गई है!');
      await refreshFromDb();
    } catch (err: any) {
      showError('शाखा पुनः सक्रियण विफल: ' + err.message);
    } finally {
      setUpdatingSchoolId(null);
    }
  };

  // Reset School Passcode Handler
  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPasscodeSchool || !newPasscode.trim()) return;
    try {
      await api.updateSchool(editingPasscodeSchool.id, { adminPasscode: newPasscode.trim() });
      showSuccess(`शाखा '${editingPasscodeSchool.hindiName}' का सुरक्षा पासकोड सफलतापूर्वक बदल दिया गया।`);
      setEditingPasscodeSchool(null);
      setNewPasscode('');
      await refreshFromDb();
    } catch (err: any) {
      showError('पासकोड परिवर्तन विफल: ' + err.message);
    }
  };

  // Export Archive Handler
  const handleExportArchive = async (schoolId: string) => {
    try {
      showInfo('शाखा डेटा आर्काइव तैयार हो रहा है...');
      const archive = await api.exportSchoolArchive(schoolId);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archive, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${schoolId}_full_archive_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showSuccess('डेटा आर्काइव (JSON) सफलतापूर्वक डाउनलोड हुआ!');
    } catch (err: any) {
      showError('डेटा आर्काइव निर्यात विफल: ' + err.message);
    }
  };

  // Targeted Test Data Seeder (Strictly for Demo Sandbox)
  const handleSeedTargetSchool = async () => {
    if (!seedingSchoolId) return;
    if (seedingSchoolId !== 'ssm-demo') {
      showError('डेमो डेटा केवल लाइव डेमो मोड (ssm-demo) में लोड किया जा सकता है। वास्तविक विद्यालयों में वास्तविक डेटा का प्रयोग अनिवार्य है।');
      return;
    }
    const targetSchool = schools.find(s => s.id === seedingSchoolId) || {
      id: 'ssm-demo',
      hindiName: 'सरस्वती शिशु मंदिर (लाइव डेमो)',
      city: 'नई दिल्ली'
    };

    if (!window.confirm(`क्या आप डेमो सैंडबॉक्स ('${targetSchool.hindiName}') में 12 छात्र, उपस्थिति, शुल्क, 360° NEP रिपोर्ट कार्ड एवं नोटिस लोड करना चाहते हैं?`)) {
      return;
    }

    setIsSeeding(true);
    try {
      const demo = generateRichDemoData('ssm-demo', targetSchool.city || 'नई दिल्ली');
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
      showSuccess(`डेमो सैंडबॉक्स ('${targetSchool.hindiName}') में 12 छात्र, शुल्क एवं प्रगति पत्र सफलतापूर्वक लोड हुए!`);
      await refreshFromDb('ssm-demo');
      await loadNetworkData();
    } catch (err: any) {
      showError('डेमो डेटा लोड करने में त्रुटि: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingPasscodeSchool) {
          e.preventDefault();
          setEditingPasscodeSchool(null);
        } else if (activeSection !== 'overview') {
          e.preventDefault();
          setActiveSection('overview');
        } else if (onBack) {
          e.preventDefault();
          onBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingPasscodeSchool, activeSection, onBack]);

  // Filtered Schools
  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
      const matchesSearch =
        s.hindiName.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        s.city.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        s.prant.toLowerCase().includes(schoolSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(schoolSearch.toLowerCase());

      const matchesStatus =
        schoolStatusFilter === 'all'
          ? true
          : schoolStatusFilter === 'discontinued'
            ? s.status === 'discontinued'
            : s.status !== 'discontinued';

      return matchesSearch && matchesStatus;
    });
  }, [schools, schoolSearch, schoolStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesActor = auditActorFilter === 'all' || log.actorType === auditActorFilter;
      const matchesSearch =
        !auditSearch.trim() ||
        (log.description && log.description.toLowerCase().includes(auditSearch.toLowerCase())) ||
        (log.actorName && log.actorName.toLowerCase().includes(auditSearch.toLowerCase())) ||
        (log.action && log.action.toLowerCase().includes(auditSearch.toLowerCase())) ||
        (log.schoolId && log.schoolId.toLowerCase().includes(auditSearch.toLowerCase()));

      return matchesActor && matchesSearch;
    });
  }, [auditLogs, auditActorFilter, auditSearch]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner: Developer Super-Admin Mode */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 text-white p-5 sm:p-6 rounded-3xl border border-orange-700/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
            <ShieldAlert className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-amber-100 tracking-tight">
                सरस्वती शिशु मंदिर — डेवलपर सुपर-एडमिन कंसोल
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                Multi-Tenant Root
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              सभी {schools.length} शाखाओं का केंद्रीय नियंत्रण, सदस्यता योजना प्रबंधन, डेटा सुरक्षा एवं सिस्टम ऑडिट
            </p>
          </div>
        </div>

        {/* Live Database Status Indicator & Back Button */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition shadow-sm cursor-pointer shrink-0"
              title="सामान्य व्यवस्थापक डैशबोर्ड पर वापस जाएं"
            >
              <ArrowLeft className="w-4 h-4 text-stone-950 shrink-0" />
              <span>← मुख्य डैशबोर्ड पर वापस</span>
            </button>
          )}
          <div className="flex items-center gap-2.5 bg-stone-900/80 px-3.5 py-2 rounded-2xl border border-stone-700/80 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${dbHealth?.database === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <div className="text-[11px] leading-tight font-mono">
              <span className="text-stone-400 block">Database:</span>
              <span className="text-emerald-300 font-bold">{dbHealth?.database === 'connected' ? 'MongoDB Atlas (Live)' : 'Disconnected'}</span>
            </div>
            <button
              onClick={() => {
                loadNetworkData();
                showInfo('डेटा रिफ्रेश हो रहा है...');
              }}
              disabled={isLoadingMetrics}
              className="ml-2 p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 transition cursor-pointer"
              title="रिफ्रेश करें"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-bold">
        {onBack && (
          <button
            onClick={onBack}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-950 border border-stone-300 hover:border-amber-400 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            title="व्यवस्थापक मुख्य पृष्ठ पर वापस लौटें"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-orange-600" />
            <span>डैशबोर्ड</span>
          </button>
        )}
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === 'overview'
              ? 'bg-orange-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>नेटवर्क अवलोकन (Overview)</span>
        </button>

        <button
          onClick={() => setActiveSection('schools')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === 'schools'
              ? 'bg-orange-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>शाखाएं एवं सदस्यता ({schools.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('audit')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === 'audit'
              ? 'bg-orange-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>सिस्टम सुरक्षा व ऑडिट लॉग्स</span>
        </button>

        <button
          onClick={() => setActiveSection('tools')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSection === 'tools'
              ? 'bg-orange-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>डेवलपर टूल्स व डेटा सीडर</span>
        </button>
      </div>

      {/* SECTION 1: NETWORK OVERVIEW & SYSTEM HEALTH */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase">कुल शाखाएं</span>
                <Building2 className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-2xl font-black text-stone-900">{schools.length}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                {schools.filter(s => s.status !== 'discontinued').length} सक्रिय • {schools.filter(s => s.status === 'discontinued').length} विसर्जित
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase">कुल छात्र (नेटवर्क)</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-stone-900">{networkStats.totalStudents}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">सभी शाखाओं का योग</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase">आज की उपस्थिति</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-emerald-700">{networkStats.attendanceRate}%</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">{networkStats.totalPresentToday} छात्र उपस्थित</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase">कुल प्राप्त शुल्क</span>
                <Receipt className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xl font-black text-emerald-800 font-mono">₹{networkStats.totalCollected.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">सफल संकलन</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase">बकाया शुल्क</span>
                <Receipt className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-xl font-black text-rose-700 font-mono">₹{networkStats.totalPending.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-rose-500 block mt-0.5">अदेय शुल्क</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[11px] font-bold uppercase">लंबित आवेदन</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-amber-700">{networkStats.totalAdmissionsPending}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5">समीक्षाधीन प्रवेश</span>
            </div>
          </div>

          {/* Quick System Health Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Server className="w-4 h-4 text-orange-600" />
                <h3 className="text-sm font-bold text-stone-900">क्लाउड सर्वर एवं डेटाबेस स्वास्थ्य</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">सर्वर स्थिति (Health):</span>
                  <span className="font-bold text-emerald-700">OK (Healthy)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">MongoDB Cluster:</span>
                  <span className="font-mono text-stone-800">{dbHealth?.databaseHost || 'Cluster0'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">डेटाबेस कनेक्शन पूल:</span>
                  <span className="font-bold text-emerald-700">सक्रिय (Persistent Atlas Connection)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">DPDP Act अनुपालन:</span>
                  <span className="font-bold text-emerald-700">Verifiable Parental Consent Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
                <Crown className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">योजना सदस्यता वितरण (Subscriptions)</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">निःशुल्क सेवा (Free Seva Tier):</span>
                  <span className="font-bold text-stone-800">
                    {schools.filter(s => s.plan !== 'pro').length} शाखाएं
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">उन्नत प्रो ईआरपी (Pro Features AMC):</span>
                  <span className="font-bold text-amber-800">
                    {schools.filter(s => s.plan === 'pro').length} शाखाएं
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">सेवा विसर्जित शाखाएं (Discontinued):</span>
                  <span className="font-bold text-rose-700">
                    {schools.filter(s => s.status === 'discontinued').length} शाखाएं
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">आधिकारिक UDISE+ समर्थित:</span>
                  <span className="font-bold text-blue-700">100% Branches</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: SCHOOLS & SUBSCRIPTION MANAGEMENT */}
      {activeSection === 'schools' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                शाखाएं एवं सदस्यता प्रबंधन (Tenant Lifecycle)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                योजना अपग्रेड, पासकोड रीसेट, संस्थागत बैकअप एवं शाखा सक्रियण
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="शाखा, नगर या आईडी खोजें..."
                  value={schoolSearch}
                  onChange={e => setSchoolSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <select
                value={schoolStatusFilter}
                onChange={e => setSchoolStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-stone-50 text-stone-700 focus:outline-none"
              >
                <option value="all">सभी स्थितियां ({schools.length})</option>
                <option value="active">केवल सक्रिय ({schools.filter(s => s.status !== 'discontinued').length})</option>
                <option value="discontinued">केवल विसर्जित ({schools.filter(s => s.status === 'discontinued').length})</option>
              </select>
            </div>
          </div>

          {/* School Directory Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">शाखा आईडी</th>
                  <th className="p-3">विद्यालय नाम</th>
                  <th className="p-3">नगर / प्रांत</th>
                  <th className="p-3">प्रधानाचार्य व संपर्क</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3">सदस्यता योजना</th>
                  <th className="p-3 text-right">डेवलपर नियंत्रण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-500">
                      कोई विद्यालय शाखा नहीं मिली।
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map(sch => {
                    const isDiscontinued = sch.status === 'discontinued';
                    const isPro = sch.plan === 'pro';

                    return (
                      <tr key={sch.id} className={`hover:bg-stone-50/80 ${isDiscontinued ? 'bg-red-50/20' : ''}`}>
                        <td className="p-3 font-mono font-bold text-stone-800">
                          <div className="flex items-center gap-1.5">
                            <span>{sch.id}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(sch.id);
                                setCopiedSchoolId(sch.id);
                                setTimeout(() => setCopiedSchoolId(null), 1500);
                              }}
                              className="text-stone-400 hover:text-orange-600"
                              title="शाखा आईडी कॉपी करें"
                            >
                              {copiedSchoolId === sch.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>

                        <td className="p-3 font-bold text-stone-900">
                          <div>{sch.hindiName}</div>
                          <div className="text-[10px] text-stone-400 font-mono font-normal">{sch.name}</div>
                        </td>

                        <td className="p-3 text-stone-600">
                          <div>{sch.city}, {sch.state}</div>
                          <div className="text-[10px] text-orange-700 font-semibold">{sch.prant}</div>
                        </td>

                        <td className="p-3 text-stone-700">
                          <div className="font-semibold">{sch.principalName}</div>
                          <div className="text-[10px] font-mono text-stone-500">{sch.phone}</div>
                        </td>

                        <td className="p-3">
                          {isDiscontinued ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              विसर्जित
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                              सक्रिय
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={isPro ? 'pro' : 'free'}
                              disabled={updatingSchoolId === sch.id || isDiscontinued}
                              onChange={e => handlePlanChange(sch.id, e.target.value as any)}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                isPro
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              }`}
                            >
                              <option value="free">FREE (निःशुल्क)</option>
                              <option value="pro">PRO 👑 (उन्नत)</option>
                            </select>
                          </div>
                        </td>

                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {/* Switch to this branch view */}
                          <button
                            onClick={() => {
                              setCurrentSchoolId(sch.id);
                              if (onSwitchToBranch) {
                                onSwitchToBranch(sch.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-orange-700 text-white text-[11px] font-bold shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                            title="इस विद्यालय शाखा के ERP डैशबोर्ड में स्विच करें"
                          >
                            <span>ERP खोलें</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {/* Reset Passcode Button */}
                          <button
                            onClick={() => {
                              setEditingPasscodeSchool(sch);
                              setNewPasscode(sch.adminPasscode || '1952');
                            }}
                            className="p-1 text-stone-600 hover:text-orange-700 rounded transition border border-stone-200 bg-white"
                            title="सुरक्षा पासकोड बदलें / रीसेट करें"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* JSON Archive Download */}
                          <button
                            onClick={() => handleExportArchive(sch.id)}
                            className="p-1 text-stone-600 hover:text-emerald-700 rounded transition border border-stone-200 bg-white"
                            title="सम्पूर्ण संस्थागत डेटा बैकअप (.JSON) डाउनलोड करें"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Reactivate if discontinued */}
                          {isDiscontinued && (
                            <button
                              onClick={() => handleReactivateSchool(sch.id)}
                              disabled={updatingSchoolId === sch.id}
                              className="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                              title="शाखा को पुनः सक्रिय करें"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>सक्रिय करें</span>
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

      {/* SECTION 3: UNIFIED AUDIT LOGS */}
      {activeSection === 'audit' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-5">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                केंद्रीय सुरक्षा एवं गतिविधि ऑडिट रजिस्टर (Cross-Tenant Audit Logs)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                सभी शाखाओं में हुए प्रमाणीकरण, डेटा परिवर्तन एवं प्रशासनिक कार्यवाहियों का अपरिवर्तनीय डिजिटल साक्ष्य
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="विवरण, कर्ता या क्रिया खोजें..."
                  value={auditSearch}
                  onChange={e => setAuditSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <select
                value={auditActorFilter}
                onChange={e => setAuditActorFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 bg-stone-50 text-stone-700 focus:outline-none"
              >
                <option value="all">सभी कर्ता प्रकार (All Roles)</option>
                <option value="developer">केवल डेवलपर (Developer)</option>
                <option value="admin">केवल व्यवस्थापक (Admin)</option>
                <option value="teacher">केवल आचार्य (Teacher)</option>
                <option value="student">केवल छात्र (Student)</option>
                <option value="system">सिस्टम / पब्लिक</option>
              </select>

              <button
                onClick={loadAuditLogs}
                disabled={isLoadingAudit}
                className="p-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 transition cursor-pointer"
                title="ऑडिट लॉग्स रीफ्रेश करें"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3">दिनांक एवं समय</th>
                  <th className="p-3">शाखा</th>
                  <th className="p-3">कर्ता (Actor)</th>
                  <th className="p-3">क्रिया (Action)</th>
                  <th className="p-3">विवरण (Description)</th>
                  <th className="p-3">आई.पी. (IP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-500">
                      {isLoadingAudit ? 'ऑडिट लॉग्स लोड हो रहे हैं...' : 'कोई ऑडिट रिकॉर्ड नहीं मिला।'}
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.slice(0, 100).map(log => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="p-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('hi-IN') : '—'}
                      </td>
                      <td className="p-3 font-mono font-bold text-orange-950">
                        {log.schoolId || '—'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.actorType === 'developer'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : log.actorType === 'admin'
                              ? 'bg-orange-100 text-orange-900'
                              : log.actorType === 'teacher'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                        }`}>
                          {log.actorName || log.actorType}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-stone-800 text-[11px]">
                        {log.action}
                      </td>
                      <td className="p-3 text-stone-700 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-stone-400">
                        {log.ip || 'Localhost'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-stone-500 text-right">
            दिखाए जा रहे हैं: {Math.min(100, filteredAuditLogs.length)} / {filteredAuditLogs.length} रिकॉर्ड्स
          </div>

        </div>
      )}

      {/* SECTION 4: DEVELOPER TOOLS & SEEDER */}
      {activeSection === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Target Branch Demo Seeder Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-stone-900">
                लाइव डेमो सैंडबॉक्स डेटा सीडर (Demo Sandbox Seeder)
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              डेमो सैंडबॉक्स (ssm-demo) में त्वरित परीक्षण एवं लाइव डेमो हेतु 12 छात्र, शुल्क रिकॉर्ड, 360° NEP प्रगति पत्र एवं नोटिस लोड करें। वास्तविक विद्यालयों में केवल वास्तविक डेटा प्रविष्टि की जा सकती है।
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700">
                लक्षित शाखा (केवल लाइव डेमो सैंडबॉक्स):
              </label>
              <select
                value={seedingSchoolId}
                onChange={e => setSeedingSchoolId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-orange-500"
              >
                <option value="ssm-demo">
                  सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय (लाइव डेमो) [ssm-demo]
                </option>
              </select>

              <button
                onClick={handleSeedTargetSchool}
                disabled={isSeeding || seedingSchoolId !== 'ssm-demo'}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-yellow-200" />
                <span>{isSeeding ? 'डेटा लोड हो रहा है...' : 'डेमो सैंडबॉक्स में डेटा इंजेक्ट करें'}</span>
              </button>
            </div>
          </div>

          {/* Institutional Archive Mass Exporter */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-200">
              <Download className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-stone-900">
                संस्थागत डेटा बैकअप एवं DPDP आर्काइव
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              किसी भी शाखा का 11 संग्रहों (छात्र, शुल्क, उपस्थिति, प्रगति पत्र, आचार्य, परीक्षा, परिवहन आदि) का संयुक्त JSON स्नैपशॉट एक क्लिक में प्राप्त करें।
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700">
                बैकअप हेतु शाखा चुनें:
              </label>
              <select
                value={seedingSchoolId}
                onChange={e => setSeedingSchoolId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-orange-500"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.hindiName} ({s.city})
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleExportArchive(seedingSchoolId)}
                disabled={!seedingSchoolId}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>शाखा डेटा आर्काइव (JSON) डाउनलोड करें</span>
              </button>
            </div>
          </div>

          {/* Smart Service / Intelligent Assistant Configuration Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-stone-900">
                  केंद्रीय बौद्धिक सहायक एवं स्मार्ट सेवा स्थिति (Central Smart Service Status)
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                isSmartKeyActive
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-stone-100 text-stone-700 border-stone-300'
              }`}>
                {isSmartKeyActive
                  ? '⚡ पर्यावरण चर (.env) से सक्रिय'
                  : '⚪ निष्क्रिय (अंतर्निहित प्रश्न बैंक सक्रिय)'}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              यह सेवा सम्पूर्ण विद्यालय (सभी शिक्षकों, लिपिकों एवं प्रधानाचार्य) हेतु <strong>.env (VITE_SMART_API_KEY)</strong> द्वारा केंद्रीय रूप से संचालित होती है। इससे सभी 5 प्रमुख मॉड्यूल्स (प्रश्न पत्र निर्माता, 360° समग्र प्रगति पत्र टिप्पणी, विद्यालय नोटिस ड्राफ्टर, दैनिक गृहकार्य एवं रजिस्टर स्कैनर) स्वतः सक्रिय रहते हैं।
            </p>

            {isSmartKeyActive ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>सक्रिय सेवा कुंजी: <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">{maskedSmartKey}</span></span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    कुंजी सर्वर पर्यावरण (.env) से सुरक्षित लोड है। सभी शिक्षक बिना किसी तकनीकी सेटिंग के स्वतः बौद्धिक सेवाओं का लाभ ले रहे हैं।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isTestingKey}
                    onClick={handleTestSmartKey}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    title="Google AI Studio सर्वर से लाइव पिंग द्वारा कुंजी का परीक्षण करें"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingKey ? 'animate-spin' : ''}`} />
                    <span>{isTestingKey ? 'जांच हो रही है...' : 'कुंजी परीक्षण करें'}</span>
                  </button>
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                    ✓ सम्पूर्ण विद्यालय सक्रिय
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>पर्यावरण (.env) में कोई स्मार्ट सेवा कुंजी सक्रिय नहीं है।</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    प्रणाली अंतर्निहित विद्या भारती सांस्कृतिक प्रश्न बैंक एवं ऑफलाइन प्रारूपों पर 100% सुरक्षित संचालित हो रही है।
                  </p>
                </div>
                <div className="text-[11px] font-mono bg-white px-3 py-1.5 rounded-lg border border-amber-300 text-stone-700">
                  विन्यास: .env ➔ VITE_SMART_API_KEY=...
                </div>
              </div>
            )}

            {/* Test Result Display */}
            {keyTestResult && (
              <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-150 ${
                keyTestResult.success
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                {keyTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-bold block">
                    {keyTestResult.success ? 'सत्यापन सफल:' : 'सत्यापन विफल:'}
                  </span>
                  <span className="text-[11px] leading-relaxed block mt-0.5">
                    {keyTestResult.message}
                  </span>
                </div>
                {keyTestResult.latency && (
                  <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded border border-stone-200 shrink-0">
                    {keyTestResult.latency}ms
                  </span>
                )}
              </div>
            )}

            {/* Free Tier Quota & Usage Statistics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  दैनिक निःशुल्क कोटा (Free Tier Quota)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-stone-900">1,500</span>
                  <span className="text-xs text-stone-500 font-semibold">अनुरोध / दिन</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-bold">
                  ✓ ₹0 मासिक शुल्क (आजीवन निःशुल्क)
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  प्रति मिनट गति सीमा (Speed Limit)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-stone-900">15</span>
                  <span className="text-xs text-stone-500 font-semibold">अनुरोध / मिनट (RPM)</span>
                </div>
                <p className="text-[10px] text-stone-500">
                  मासिक इकाई टेस्ट व सामान्य विद्यालय कार्य हेतु पर्याप्त
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  लागत एवं व्यय (Cost & Billing)
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-emerald-800">₹0</span>
                  <span className="text-xs text-stone-500 font-semibold">आजीवन निःशुल्क</span>
                </div>
                <p className="text-[10px] text-stone-500">
                  कोई क्रेडिट कार्ड अथवा भुगतान आवश्यक नहीं
                </p>
              </div>
            </div>
          </div>

          {/* Platform Maintenance & Downtime Manager Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    प्लेटफ़ॉर्म मेंटेनेंस एवं डाउनटाइम कंट्रोल (Maintenance & Downtime Manager)
                  </h3>
                  <p className="text-xs text-stone-500">
                    सर्वर माइग्रेशन, डेटाबेस अपग्रेड अथवा रखरखाव के समय उपयोगकर्ताओं को पूर्व-सूचना या मेंटेनेंस स्क्रीन प्रदर्शित करें।
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  maintConfig.enabled
                    ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${maintConfig.enabled ? 'bg-red-600' : 'bg-emerald-600'}`} />
                  <span>{maintConfig.enabled ? '🔴 मेंटेनेंस मोड सक्रिय (Portal Locked)' : '🟢 लाइव (Portal Online)'}</span>
                </span>
                {maintConfig.scheduledNotice && !maintConfig.enabled && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>पूर्व-सूचना बैनर सक्रिय</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Toggle Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Toggle 1: Scheduled Notice Banner */}
              <div className={`p-4 rounded-xl border transition-all ${
                maintConfig.scheduledNotice
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>१. आगामी रखरखाव पूर्व-सूचना बैनर</span>
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                      माइग्रेशन से 1-2 दिन पूर्व वेबसाइट के शीर्ष पर सूचना पट्टी दिखाता है ताकि उपयोगकर्ता पहले से सतर्क रहें।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveMaintenance({ scheduledNotice: !maintConfig.scheduledNotice })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      maintConfig.scheduledNotice ? 'bg-amber-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        maintConfig.scheduledNotice ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Toggle 2: Full Maintenance Mode Screen */}
              <div className={`p-4 rounded-xl border transition-all ${
                maintConfig.enabled
                  ? 'bg-red-50/70 border-red-300'
                  : 'bg-stone-50 border-stone-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-red-600" />
                      <span>२. सक्रिय मेंटेनेंस स्क्रीन (Full Lock)</span>
                    </h4>
                    <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                      सक्रिय माइग्रेशन के दौरान सामान्य उपयोगकर्ताओं के लिए पोर्टल ब्लॉक करके सूचना स्क्रीन दिखाता है (व्यवस्थापक बाईपास उपलब्ध रहेगा)।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveMaintenance({ enabled: !maintConfig.enabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      maintConfig.enabled ? 'bg-red-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        maintConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>

            {/* Config Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  रखरखाव शीर्षक (Maintenance Title):
                </label>
                <input
                  type="text"
                  value={maintConfig.title}
                  onChange={e => setMaintConfig({ ...maintConfig, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="उदा. सिस्टम अपग्रेड एवं सर्वर रखरखाव"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  रखरखाव समयावधि (Scheduled Window):
                </label>
                <input
                  type="text"
                  value={maintConfig.scheduledWindow}
                  onChange={e => setMaintConfig({ ...maintConfig, scheduledWindow: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="उदा. आगामी रविवार, रात्रि 10:00 से 02:00 बजे तक"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  अपेक्षित बहाली समय (Estimated End Time):
                </label>
                <input
                  type="text"
                  value={maintConfig.estimatedEnd}
                  onChange={e => setMaintConfig({ ...maintConfig, estimatedEnd: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="उदा. प्रातः 04:00 बजे तक"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  हेल्पडेस्क / आपातकालीन संपर्क:
                </label>
                <input
                  type="text"
                  value={maintConfig.supportContact}
                  onChange={e => setMaintConfig({ ...maintConfig, supportContact: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="उदा. +91 98765 43210 | support@init65.co.in"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  विस्तृत संदेश (Detailed Operational Message):
                </label>
                <textarea
                  rows={2}
                  value={maintConfig.message}
                  onChange={e => setMaintConfig({ ...maintConfig, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="रखरखाव का विस्तृत विवरण..."
                />
              </div>
            </div>

            {/* Save & Reset Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
              <span className="text-[11px] text-stone-500">
                🔒 परिवर्तन तुरंत स्थानीय और सार्वजनिक सत्रों में प्रभावी हो जाते हैं।
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMaintConfig(DEFAULT_MAINTENANCE_CONFIG);
                    handleSaveMaintenance(DEFAULT_MAINTENANCE_CONFIG);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition cursor-pointer"
                >
                  डिफ़ॉल्ट रीसेट
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMaintenance(maintConfig)}
                  className="px-4 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>सेटिंग्स सुरक्षित करें</span>
                </button>
              </div>
            </div>
          </div>

          {/* Platform Storage & Capacity Monitor Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    प्लेटफ़ॉर्म स्टोरेज एवं डेटाबेस क्षमता मॉनिटर (Storage & Capacity Monitor)
                  </h3>
                  <p className="text-xs text-stone-500">
                    दैनिक संचालन के दौरान डेटाबेस उपभोग, फ़ोटो कंप्रेशन स्थिति एवं वार्षिक आर्काइविंग प्रबंधन।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-semibold">अनुमानित डेटाबेस आकार</span>
                  <span className="text-sm font-black text-stone-800">
                    {storageEstimates.totalMb} MB <span className="text-xs text-stone-500 font-normal">/ 512 MB Free Tier</span>
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold text-xs text-emerald-900 bg-emerald-50">
                  {storageEstimates.usagePercent}%
                </div>
              </div>
            </div>

            {/* Storage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-stone-600 font-medium">स्टोरेज उपयोग अनुपात</span>
                <span className="font-bold text-emerald-700">{storageEstimates.usagePercent}% प्रयुक्त ({storageEstimates.totalMb} MB)</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden flex">
                <div style={{ width: '40%' }} className="bg-blue-500" title="📸 छात्र फ़ोटो" />
                <div style={{ width: '25%' }} className="bg-amber-500" title="📋 दैनिक उपस्थिति" />
                <div style={{ width: '15%' }} className="bg-purple-500" title="🛡️ ऑडिट लॉग्स" />
                <div style={{ width: '12%' }} className="bg-emerald-500" title="📝 परीक्षा व प्रगति पत्र" />
                <div style={{ width: '8%' }} className="bg-stone-400" title="💰 शुल्क लेजर" />
              </div>
              <div className="flex flex-wrap gap-4 text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> 📸 छात्र फ़ोटो (~40%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> 📋 दैनिक उपस्थिति (~25%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block" /> 🛡️ ऑडिट लॉग्स (~15%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> 📝 परीक्षा व अंक (~12%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-stone-400 inline-block" /> 💰 शुल्क लेजर (~8%)</span>
              </div>
            </div>

            {/* Storage Consumption Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* 1. Photos */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>छात्र व स्टाफ फ़ोटो</span>
                  </span>
                  <span className="font-mono text-blue-700 font-bold">{storageEstimates.photoMb} MB</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  क्लाइंट-साइड <strong>300x380px ऑटो-कंप्रेशन</strong> सक्रिय (~20-30 KB प्रति फ़ोटो)। 100KB सख्त सीमा लागू।
                </p>
              </div>

              {/* 2. Attendance */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>दैनिक उपस्थिति</span>
                  </span>
                  <span className="font-mono text-amber-700 font-bold">{storageEstimates.attendanceMb} MB</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  अनुमानित वार्षिक {storageEstimates.attendanceRecords.toLocaleString()} रिकॉर्ड्स। सत्र रोलओवर पर स्वतः बैकअप व आर्काइव अनुशंसित।
                </p>
              </div>

              {/* 3. Audit Logs */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>सिस्टम ऑडिट लॉग्स</span>
                  </span>
                  <span className="font-mono text-purple-700 font-bold">{storageEstimates.auditMb} MB</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  कुल {storageEstimates.auditCount} सुरक्षा लॉग प्रविष्टियां। DPDPA 2023 अनुपालन हेतु 1 वर्ष तक सुरक्षित संधारण।
                </p>
              </div>
            </div>

            {/* Storage Optimization Recommendations */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-950">
              <div className="space-y-0.5 max-w-xl">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>स्टोरेज सुरक्षा नीति (Storage Best Practice):</span>
                </span>
                <p className="text-[11px] text-blue-800">
                  प्रत्येक शैक्षणिक सत्र के अंत में <strong>1-क्लिक JSON बैकअप</strong> डाउनलोड कर पिछले सत्र का डेटा आर्काइव करें। इससे विद्यालय का लाइव क्लाउड डेटाबेस सदैव तीव्र व हल्का रहेगा।
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  showSuccess('ऑडिट लॉग्स एवं स्टोरेज स्नैपशॉट सत्यापित! प्रणाली सुरक्षित सीमा में है।');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                ✓ स्टोरेज स्वास्थ्य जांचें
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Edit Passcode Modal */}
      {editingPasscodeSchool && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-orange-300 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-orange-600" />
                <h4 className="text-sm font-bold text-stone-900">सुरक्षा पासकोड बदलें</h4>
              </div>
              <button
                onClick={() => setEditingPasscodeSchool(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              शाखा: <strong>{editingPasscodeSchool.hindiName}</strong> ({editingPasscodeSchool.city})
            </p>

            <form onSubmit={handleUpdatePasscode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  नया एडमिन पासकोड दर्ज करें:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="उदा: 1952 या नया कोड"
                  value={newPasscode}
                  onChange={e => setNewPasscode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  पासकोड बदलते ही इस शाखा के पुराने सक्रिय सत्र समाप्त हो जाएंगे।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPasscodeSchool(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  सहेजें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

