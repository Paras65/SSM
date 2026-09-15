import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import type { AuditLogEntry } from '../../types';
import {
  X,
  Shield,
  Clock,
  User,
  Filter,
  RefreshCw,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  Key,
  IndianRupee,
  Eye,
  Copy,
  Check,
  Calendar,
  Laptop,
  GraduationCap,
  BookOpen,
  ArrowUpDown,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActionCategory = 'all' | 'auth' | 'security' | 'financial' | 'exams' | 'students_staff' | 'other';

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool } = useSchool();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<ActionCategory>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Inspector Modal
  const [inspectedLog, setInspectedLog] = useState<AuditLogEntry | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fetchLogs = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const data = await api.getAuditLogs(currentSchool.id);
      setLogs(data || []);
    } catch {
      setLogs([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      setCurrentPage(1);
    }
  }, [isOpen, currentSchool.id]);

  // Helper to categorize actions
  const getActionCategory = (action: string): ActionCategory => {
    const act = (action || '').toUpperCase();
    if (act.includes('LOGIN')) return 'auth';
    if (act.includes('PASSCODE') || act.includes('LOCK') || act.includes('REVOKE')) return 'security';
    if (act.includes('FEE') || act.includes('PAYMENT') || act.includes('ARREAR')) return 'financial';
    if (act.includes('EXAM') || act.includes('MARKS') || act.includes('REPORT')) return 'exams';
    if (act.includes('STUDENT') || act.includes('STAFF') || act.includes('DPDP') || act.includes('ADMISSION')) return 'students_staff';
    return 'other';
  };

  // KPIs Calculations
  const kpis = useMemo(() => {
    let logins = 0;
    let alerts = 0;
    let financial = 0;
    let security = 0;

    for (const log of logs) {
      const act = (log.action || '').toUpperCase();
      if (act.includes('LOGIN_SUCCESS') || act === 'TEACHER_LOGIN') logins++;
      if (act.includes('FAILED') || act.includes('ANONYMIZED') || act.includes('DELETED')) alerts++;
      if (act.includes('FEE') || act.includes('PAYMENT')) financial++;
      if (act.includes('PASSCODE') || act.includes('LOCK')) security++;
    }

    return {
      total: logs.length,
      logins,
      alerts,
      financial,
      security
    };
  }, [logs]);

  // Filter & Sort Logic
  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        // Actor Filter
        if (filterRole !== 'all' && log.actorType !== filterRole) return false;

        // Category Filter
        if (filterCategory !== 'all') {
          const cat = getActionCategory(log.action);
          if (cat !== filterCategory) return false;
        }

        // Time Range Filter
        if (filterTimeRange !== 'all') {
          const logDate = new Date(log.createdAt).getTime();
          const now = Date.now();
          if (filterTimeRange === 'today') {
            const startOfToday = new Date().setHours(0, 0, 0, 0);
            if (logDate < startOfToday) return false;
          } else if (filterTimeRange === '7days') {
            if (now - logDate > 7 * 24 * 60 * 60 * 1000) return false;
          } else if (filterTimeRange === '30days') {
            if (now - logDate > 30 * 24 * 60 * 60 * 1000) return false;
          }
        }

        // Search Term Filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchDesc = (log.description || '').toLowerCase().includes(q);
          const matchActor = (log.actorName || '').toLowerCase().includes(q);
          const matchAction = (log.action || '').toLowerCase().includes(q);
          const matchIp = (log.ip || '').toLowerCase().includes(q);
          const matchId = (log.id || '').toLowerCase().includes(q);
          if (!matchDesc && !matchActor && !matchAction && !matchIp && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, filterRole, filterCategory, filterTimeRange, searchTerm, sortOrder]);

  // Pagination Slicing
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilterRole('all');
    setFilterCategory('all');
    setFilterTimeRange('all');
    setSearchTerm('');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('निर्यात करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।');
      return;
    }

    const headers = ['लॉग_आईडी', 'दिनांक_समय', 'कर्ता_प्रकार', 'कर्ता_नाम', 'कार्य_कोड', 'विवरण', 'IP_पता'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.createdAt).toLocaleString('hi-IN'),
      l.actorType,
      `"${(l.actorName || '').replace(/"/g, '""')}"`,
      l.action,
      `"${(l.description || '').replace(/"/g, '""')}"`,
      l.ip || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SSM_Audit_Trail_${currentSchool.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy details helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  // Visual Badges Helpers
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <User className="w-3 h-3" /> व्यवस्थापक
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <BookOpen className="w-3 h-3" /> आचार्य
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3 h-3" /> छात्र
          </span>
        );
      case 'developer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Laptop className="w-3 h-3" /> डेवलपर
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
            <Shield className="w-3 h-3" /> सिस्टम
          </span>
        );
    }
  };

  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('FAILED')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-red-100 text-red-800 border border-red-200">
          <AlertTriangle className="w-3 h-3 text-red-600" /> {action}
        </span>
      );
    }
    if (act.includes('LOGIN_SUCCESS') || act === 'TEACHER_LOGIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {action}
        </span>
      );
    }
    if (act.includes('PASSCODE') || act.includes('LOCK')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-orange-100 text-orange-800 border border-orange-200">
          <Key className="w-3 h-3 text-orange-600" /> {action}
        </span>
      );
    }
    if (act.includes('FEE') || act.includes('PAYMENT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-200">
          <IndianRupee className="w-3 h-3 text-teal-600" /> {action}
        </span>
      );
    }
    if (act.includes('EXAM') || act.includes('MARKS')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <BookOpen className="w-3 h-3 text-indigo-600" /> {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200">
        <Shield className="w-3 h-3 text-stone-500" /> {action}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  सुरक्षा ऑडिट ट्रेल व सुशासन कंसोल (Security Audit Trail)
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Lock className="w-2.5 h-2.5" /> अपरिवर्तनीय डिजिटल लेज़र
                </span>
              </div>
              <p className="text-xs text-stone-300">
                शाखा: <span className="font-semibold text-amber-300">{currentSchool.name || 'सरस्वती शिशु मंदिर'}</span> ({currentSchool.id}) • समस्त प्रशासनिक, वित्तीय व प्रमाणीकरण कार्यों की अपरिवर्तनीय समय-सारणी
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="px-3.5 py-2 rounded-xl bg-stone-700/80 hover:bg-stone-600 border border-stone-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              title="ऑडिट रिकॉर्ड्स CSV डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV निर्यात</span>
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-xl bg-stone-700/80 hover:bg-stone-600 border border-stone-600 text-white transition disabled:opacity-50"
              title="रिफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-red-900/60 text-stone-300 hover:text-white transition"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-500">कुल घटनाएं (Total)</div>
              <div className="text-base font-extrabold text-stone-800">{kpis.total}</div>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-500">सफल लॉगिन (Logins)</div>
              <div className="text-base font-extrabold text-emerald-700">{kpis.logins}</div>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-500">सुरक्षा चेतावनी / विफलताएं</div>
              <div className="text-base font-extrabold text-rose-700">{kpis.alerts}</div>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-stone-500">वित्तीय / क्रेडेंशियल कार्य</div>
              <div className="text-base font-extrabold text-teal-700">{kpis.financial + kpis.security}</div>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="खोजें (कार्य, नाम, विवरण, IP पता)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Actor Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-stone-600 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-stone-400" /> कर्ता:
            </span>
            <div className="inline-flex rounded-xl bg-stone-100 p-1 border border-stone-200">
              {[
                { id: 'all', label: 'सभी' },
                { id: 'admin', label: 'व्यवस्थापक' },
                { id: 'teacher', label: 'आचार्य' },
                { id: 'student', label: 'छात्र' },
                { id: 'developer', label: 'डेवलपर' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterRole(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    filterRole === tab.id
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-stone-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-stone-400" /> श्रेणी:
            </span>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value as ActionCategory);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-bold focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">समस्त क्रियाएं (All)</option>
              <option value="auth">🔐 प्रमाणीकरण (Auth)</option>
              <option value="security">🔑 सुरक्षा व पासकोड (Security)</option>
              <option value="financial">💰 वित्तीय लेनदेन (Fees)</option>
              <option value="exams">🎓 परीक्षा व प्राप्तांक (Exams)</option>
              <option value="students_staff">👥 छात्र व कर्मचारी (Staff/Students)</option>
            </select>
          </div>

          {/* Time Range */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={filterTimeRange}
              onChange={(e) => {
                setFilterTimeRange(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 font-bold focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">समस्त अवधि (All Time)</option>
              <option value="today">आज (Today)</option>
              <option value="7days">पिछले 7 दिन (Past 7 Days)</option>
              <option value="30days">पिछले 30 दिन (Past 30 Days)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(filterRole !== 'all' || filterCategory !== 'all' || filterTimeRange !== 'all' || searchTerm) && (
            <button
              onClick={handleResetFilters}
              className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
            >
              फ़िल्टर रीसेट करें
            </button>
          )}
        </div>

        {/* Dedicated Audit Trail Table */}
        <div className="flex-1 overflow-auto bg-stone-50/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-stone-100/95 backdrop-blur-xs border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider z-10">
              <tr>
                <th
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="py-3 px-4 cursor-pointer hover:bg-stone-200/60 transition select-none w-48"
                >
                  <div className="flex items-center gap-1.5">
                    <span>दिनांक व समय (Time)</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3 px-4 w-40">कर्ता (Actor)</th>
                <th className="py-3 px-4 w-52">कार्य (Action Code)</th>
                <th className="py-3 px-4">विवरण (Description)</th>
                <th className="py-3 px-4 w-32">IP पता (Client IP)</th>
                <th className="py-3 px-4 text-center w-24">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
                    ऑडिट लॉग्स लोड हो रहे हैं...
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-400">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-red-400" />
                    <p className="font-bold text-red-600">ऑडिट लॉग लोड करने में त्रुटि</p>
                    <p className="text-xs text-stone-400 mt-1">सर्वर से कनेक्ट नहीं हो सका। कृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।</p>
                    <button
                      onClick={fetchLogs}
                      className="mt-3 px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition"
                    >
                      🔄 पुनः प्रयास करें
                    </button>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-stone-400">
                    <Shield className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                    <p className="font-bold text-stone-600">कोई ऑडिट लॉग रिकॉर्ड नहीं मिला</p>
                    <p className="text-xs text-stone-400 mt-1">दिए गए फ़िल्टर मानदंडों के अनुसार कोई घटना दर्ज नहीं है।</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/40 transition group">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-stone-600 font-medium">
                      <div className="font-bold text-stone-900">
                        {new Date(log.createdAt).toLocaleDateString('hi-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(log.createdAt).toLocaleTimeString('hi-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <div>{getRoleBadge(log.actorType)}</div>
                        <span className="font-bold text-stone-800 truncate max-w-[140px]" title={log.actorName}>
                          {log.actorName || 'अज्ञात'}
                        </span>
                        {log.actorId && (
                          <span className="text-[10px] text-stone-400 font-mono">#{log.actorId}</span>
                        )}
                      </div>
                    </td>

                    {/* Action Code */}
                    <td className="py-3 px-4">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-stone-800 leading-relaxed font-medium">
                      <p>{log.description}</p>
                    </td>

                    {/* Client IP */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.ip ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-stone-100 text-stone-700 border border-stone-200">
                          <Laptop className="w-3 h-3 text-stone-400" />
                          {log.ip}
                        </span>
                      ) : (
                        <span className="text-stone-300 font-mono text-xs">-</span>
                      )}
                    </td>

                    {/* Details Action */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setInspectedLog(log)}
                        className="p-1.5 rounded-lg border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-500 hover:text-amber-800 transition"
                        title="विस्तृत विवरण देखें"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="p-3.5 border-t border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span>
              कुल रिकॉर्ड्स: <strong className="text-stone-900">{filteredLogs.length}</strong>
            </span>
            <span className="text-stone-300">•</span>
            <span>
              पृष्ठ <strong className="text-stone-900">{currentPage}</strong> of <strong className="text-stone-900">{totalPages}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-40 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> पिछला
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 disabled:opacity-40 transition flex items-center gap-1"
            >
              अगला <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="ml-2 px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition"
            >
              बंद करें
            </button>
          </div>
        </div>
      </div>

      {/* Log Inspector Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-sm">ऑडिट प्रविष्टि विस्तृत विवरण (Inspector)</h3>
              </div>
              <button
                onClick={() => setInspectedLog(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-400 block text-[10px] font-bold uppercase">लॉग ID</span>
                  <span className="font-mono font-bold text-stone-800 select-all">{inspectedLog.id}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] font-bold uppercase">शाखा ID</span>
                  <span className="font-mono font-bold text-stone-800">{inspectedLog.schoolId || currentSchool.id}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] font-bold uppercase">दिनांक व समय</span>
                  <span className="font-medium text-stone-800">
                    {new Date(inspectedLog.createdAt).toLocaleString('hi-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] font-bold uppercase">क्लाइंट IP पता</span>
                  <span className="font-mono font-bold text-stone-800">{inspectedLog.ip || 'अनुपलब्ध'}</span>
                </div>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase mb-1">कार्य कोड (Action Code)</span>
                {getActionBadge(inspectedLog.action)}
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase mb-1">कर्ता विवरण (Actor)</span>
                <div className="flex items-center gap-2">
                  {getRoleBadge(inspectedLog.actorType)}
                  <span className="font-bold text-stone-900">{inspectedLog.actorName}</span>
                  {inspectedLog.actorId && (
                    <span className="text-stone-400 font-mono text-[10px]">({inspectedLog.actorId})</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] font-bold uppercase mb-1">विवरण (Description)</span>
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-stone-800 leading-relaxed font-medium">
                  {inspectedLog.description}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs">
              <button
                onClick={() => handleCopy(JSON.stringify(inspectedLog, null, 2), inspectedLog.id)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 font-bold transition flex items-center gap-1.5"
              >
                {copiedId === inspectedLog.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>कॉपी हुआ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>JSON कॉपी करें</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setInspectedLog(null)}
                className="px-4 py-1.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition"
              >
                ठीक है
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogModal;
