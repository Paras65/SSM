import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import type { School, SankulInspection, SankulNotice } from '../../types';
import { SANKUL_CLUSTERS } from './SankulAuthModal';
import {
  Building2,
  Users,
  Award,
  Calendar,
  Search,
  Filter,
  Printer,
  LogOut,
  CheckCircle2,
  TrendingUp,
  FileText,
  Star,
  Plus,
  Compass,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  ArrowLeft,
  Trash2,
  Share2,
  Download
} from 'lucide-react';

const INITIAL_INSPECTIONS: SankulInspection[] = [
  {
    id: 'insp-1',
    clusterName: 'दिल्ली प्रांत संकुल (Delhi Prant Cluster)',
    schoolId: 'ssm-national',
    schoolName: 'सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय, शास्त्री नगर',
    inspectionDate: '2026-08-15',
    inspectorName: 'डॉ. हरिश्चंद्र विद्यालंकार (संकुल प्रमुख)',
    academicRating: 5,
    infrastructureRating: 4,
    panchmukhiRating: 5,
    observations: 'दैनिक वंदना, योग एवं संस्कृत शिक्षण अत्यंत अनुशासित व श्रेष्ठ। प्रयोगशाला एवं पुस्तकालय सुसज्जित हैं।',
    recommendations: 'प्राथमिक कक्षाओं में डिजिटल स्मार्ट बोर्ड की संख्या में वृद्धि की जाए।'
  },
  {
    id: 'insp-2',
    clusterName: 'दिल्ली प्रांत संकुल (Delhi Prant Cluster)',
    schoolId: 'ssm-demo',
    schoolName: 'सरस्वती शिशु मंदिर उच्चतर माध्यमिक, आदर्श नगर',
    inspectionDate: '2026-07-20',
    inspectorName: 'श्री रामनारायण जी (सह-संकुल प्रभारी)',
    academicRating: 4,
    infrastructureRating: 5,
    panchmukhiRating: 4,
    observations: 'शारीरिक शिक्षा, घोष वादन एवं खेलकूद में छात्रों का प्रदर्शन सराहनीय। UDISE+ डेटा 100% सत्यापित।',
    recommendations: 'आचार्य स्वाध्याय वर्ग एवं त्रैमासिक अभिभावक गोष्ठी की नियमितता बनाए रखें।'
  }
];

const INITIAL_SANKUL_NOTICES: SankulNotice[] = [
  {
    id: 'snot-1',
    clusterName: 'समस्त संकुल (All Clusters - Prant Oversight)',
    title: 'संकुल स्तरीय वार्षिक खेलकूद एवं एथलेटिक्स प्रतियोगिता 2026-27',
    date: '2026-10-12',
    category: 'Sports',
    content: 'संकुल के समस्त विद्यालयों के कक्षा 6 से 12 तक के भैया-बहिनों की 100मी दौड़, कबड्डी, खो-खो एवं योगासन प्रतियोगिता का आयोजन।',
    issuedBy: 'संकुल क्रीड़ा प्रमुख'
  },
  {
    id: 'snot-2',
    clusterName: 'समस्त संकुल (All Clusters - Prant Oversight)',
    title: 'आचार्य क्षमता संवर्द्धन एवं NEP 2020 पंचमुखी कार्यशाला',
    date: '2026-09-28',
    category: 'Workshop',
    content: 'समस्त प्राथमिक एवं माध्यमिक आचार्यों हेतु राष्ट्रीय शिक्षा नीति 2020 एवं 360° समग्र प्रगति पत्र पर एक-दिवसीय प्रशिक्षण वर्ग।',
    issuedBy: 'संकुल शैक्षिक मार्गदर्शन समिति'
  },
  {
    id: 'snot-3',
    clusterName: 'गोरखपुर संकुल (Gorakhpur Cluster)',
    title: 'द्वितीय त्रैमासिक संकुल प्रधानाचार्य समीक्षा बैठक',
    date: '2026-09-25',
    category: 'Meeting',
    content: 'संकुल के सभी सम्बद्ध विद्यालयों के प्रधानाचार्यों की उपस्थिति अनिवार्य है। विषय: अर्धवार्षिक परीक्षा तैयारी एवं शुल्क समीक्षा।',
    issuedBy: 'संकुल प्रभारी'
  }
];

export const SankulPortal: React.FC = () => {
  const { schools, setViewMode, setCurrentSchoolId, currentSchool, students, attendanceRecords, feeRecords, addNotice } = useSchool();
  const [activeTab, setActiveTab] = useState<'overview' | 'schools' | 'inspections' | 'notices'>('overview');
  const [selectedCluster, setSelectedCluster] = useState<string>(() => {
    return sessionStorage.getItem('ssm_sankul_name') || SANKUL_CLUSTERS[0];
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Persistent storage for inspections
  const [inspections, setInspections] = useState<SankulInspection[]>(() => {
    try {
      const saved = localStorage.getItem('ssm_sankul_inspections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved inspections:', e);
    }
    return INITIAL_INSPECTIONS;
  });

  // Persistent storage for notices
  const [notices, setNotices] = useState<SankulNotice[]>(() => {
    try {
      const saved = localStorage.getItem('ssm_sankul_notices');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved notices:', e);
    }
    return INITIAL_SANKUL_NOTICES;
  });

  const [showAddInspectionModal, setShowAddInspectionModal] = useState(false);
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [selectedAuditSchool, setSelectedAuditSchool] = useState<School | null>(null);

  // New inspection form state
  const [newInspSchool, setNewInspSchool] = useState(schools[0]?.name || '');
  const [newInspDate, setNewInspDate] = useState(new Date().toISOString().split('T')[0]);
  const [newInspInspector, setNewInspInspector] = useState('संकुल प्रभारी');
  const [newInspAcadRating, setNewInspAcadRating] = useState(5);
  const [newInspInfraRating, setNewInspInfraRating] = useState(4);
  const [newInspPanchRating, setNewInspPanchRating] = useState(5);
  const [newInspObs, setNewInspObs] = useState('');
  const [newInspRec, setNewInspRec] = useState('');

  // New notice form state
  const [newNotTitle, setNewNotTitle] = useState('');
  const [newNotCategory, setNewNotCategory] = useState<'Sports' | 'Academic' | 'Workshop' | 'Meeting' | 'Cultural'>('Academic');
  const [newNotContent, setNewNotContent] = useState('');
  const [newNotIssuer, setNewNotIssuer] = useState('संकुल कार्यालय');

  // Persistence helpers
  const handleSaveInspections = (updated: SankulInspection[]) => {
    setInspections(updated);
    try {
      localStorage.setItem('ssm_sankul_inspections', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist inspections:', e);
    }
  };

  const handleSaveNotices = (updated: SankulNotice[]) => {
    setNotices(updated);
    try {
      localStorage.setItem('ssm_sankul_notices', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist notices:', e);
    }
  };

  // Filter schools based on selected cluster and search
  const clusterSchools = useMemo(() => {
    let filtered = schools;

    if (selectedCluster && !selectedCluster.includes('समस्त')) {
      const clusterKeywords = selectedCluster
        .replace(/संकुल|\(|\)|Cluster|Prant/gi, '')
        .split('/')
        .map(k => k.trim().toLowerCase())
        .filter(Boolean);

      const matched = schools.filter(s => {
        const text = `${s.name} ${s.hindiName} ${s.city} ${s.address} ${s.prant || ''} ${s.state || ''}`.toLowerCase();
        return clusterKeywords.some(kw => text.includes(kw));
      });

      if (matched.length > 0) {
        filtered = matched;
      }
    }

    if (!searchTerm.trim()) return filtered;

    const term = searchTerm.toLowerCase();
    return filtered.filter(s =>
      s.name.toLowerCase().includes(term) ||
      (s.hindiName && s.hindiName.toLowerCase().includes(term)) ||
      s.city.toLowerCase().includes(term) ||
      (s.principalName && s.principalName.toLowerCase().includes(term))
    );
  }, [schools, selectedCluster, searchTerm]);

  // Dynamic Live & Baseline KPI Calculations
  const totalSchools = clusterSchools.length || 1;
  const liveStudentCount = students?.length || 0;
  const totalStudents = liveStudentCount > 0
    ? Math.max(liveStudentCount, totalSchools * 380)
    : totalSchools * 420;

  const bhaiyaCount = useMemo(() => {
    if (students && students.length > 0) {
      const bh = students.filter(s => s.gender === 'Bhaiya').length;
      const ratio = bh / students.length;
      return Math.round(totalStudents * ratio);
    }
    return Math.round(totalStudents * 0.54);
  }, [students, totalStudents]);

  const bahinCount = totalStudents - bhaiyaCount;
  const totalAcharyas = Math.round(totalStudents / 18);

  const avgAttendance = useMemo(() => {
    if (attendanceRecords && attendanceRecords.length > 0) {
      const present = attendanceRecords.filter(a => a.status === 'Present').length;
      return Math.round((present / attendanceRecords.length) * 1000) / 10;
    }
    return 93.8;
  }, [attendanceRecords]);

  const avgFeeRecovery = useMemo(() => {
    if (feeRecords && feeRecords.length > 0) {
      const demand = feeRecords.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
      const paid = feeRecords.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
      if (demand > 0) {
        return Math.round((paid / demand) * 1000) / 10;
      }
    }
    return 91.5;
  }, [feeRecords]);

  const handleLogout = () => {
    sessionStorage.removeItem('ssm_sankul_token');
    sessionStorage.removeItem('ssm_sankul_name');
    setViewMode('public');
  };

  // Distinct school metrics calculation (Live for active school, profile/calculated for others)
  const getSchoolMetrics = (school: School) => {
    const isCurrentActive = school.id === currentSchool?.id;
    const studentCount = (isCurrentActive && liveStudentCount > 0)
      ? liveStudentCount
      : (school.enrolledStudentsCount || (340 + (parseInt(school.id.replace(/\D/g, '') || '10', 10) % 120)));

    const acharyaCount = (isCurrentActive && liveStudentCount > 0)
      ? Math.max(12, Math.round(liveStudentCount / 18))
      : (school.totalTeachersCount || Math.max(14, Math.round(studentCount / 18)));

    const attRate = (isCurrentActive && attendanceRecords && attendanceRecords.length > 0)
      ? avgAttendance
      : (school.attendanceRate || (93 + (parseInt(school.id.replace(/\D/g, '') || '2', 10) % 5)));

    const feeRate = (isCurrentActive && feeRecords && feeRecords.length > 0)
      ? avgFeeRecovery
      : (school.feeRecoveryRate || (90 + (parseInt(school.id.replace(/\D/g, '') || '3', 10) % 6)));

    return { studentCount, acharyaCount, attRate, feeRate };
  };

  // Filter inspections by active cluster
  const clusterInspections = useMemo(() => {
    if (!selectedCluster || selectedCluster.includes('समस्त')) {
      return inspections;
    }
    return inspections.filter(insp => !insp.clusterName || insp.clusterName === selectedCluster);
  }, [inspections, selectedCluster]);

  // Filter notices by active cluster
  const clusterNotices = useMemo(() => {
    if (!selectedCluster || selectedCluster.includes('समस्त')) {
      return notices;
    }
    return notices.filter(n => !n.clusterName || n.clusterName === selectedCluster || n.clusterName.includes('समस्त'));
  }, [notices, selectedCluster]);

  const handleOpenSchoolAudit = (school: School) => {
    setSelectedAuditSchool(school);
    setNewInspSchool(school.hindiName || school.name);
    setNewInspDate(new Date().toISOString().split('T')[0]);
    setNewInspAcadRating(5);
    setNewInspInfraRating(4);
    setNewInspPanchRating(5);
    setNewInspObs('');
    setNewInspRec('');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportSankulBackup = () => {
    const data = {
      version: '1.0',
      cluster: selectedCluster,
      exportDate: new Date().toISOString(),
      inspections: clusterInspections,
      notices: clusterNotices
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sankul-backup-${selectedCluster.split(' ')[0]}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspObs.trim()) return;

    const targetSchoolName = selectedAuditSchool
      ? (selectedAuditSchool.hindiName || selectedAuditSchool.name)
      : newInspSchool;

    const targetSchoolId = selectedAuditSchool
      ? selectedAuditSchool.id
      : (schools.find(s => (s.hindiName || s.name) === newInspSchool)?.id || 'school-custom');

    const newRecord: SankulInspection = {
      id: `insp-${Date.now()}`,
      clusterName: selectedCluster,
      schoolId: targetSchoolId,
      schoolName: targetSchoolName,
      inspectionDate: newInspDate,
      inspectorName: newInspInspector,
      academicRating: Number(newInspAcadRating),
      infrastructureRating: Number(newInspInfraRating),
      panchmukhiRating: Number(newInspPanchRating),
      observations: newInspObs.trim(),
      recommendations: newInspRec.trim()
    };

    handleSaveInspections([newRecord, ...inspections]);
    setShowAddInspectionModal(false);
    setSelectedAuditSchool(null);
    setNewInspObs('');
    setNewInspRec('');
  };

  const handleDeleteInspection = (id: string) => {
    if (window.confirm('क्या आप इस निरीक्षण रिकॉर्ड को हटाना चाहते हैं?')) {
      const updated = inspections.filter(insp => insp.id !== id);
      handleSaveInspections(updated);
    }
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotTitle.trim() || !newNotContent.trim()) return;

    const newNotice: SankulNotice = {
      id: `snot-${Date.now()}`,
      clusterName: selectedCluster,
      title: newNotTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      category: newNotCategory,
      content: newNotContent.trim(),
      issuedBy: newNotIssuer.trim()
    };

    handleSaveNotices([newNotice, ...notices]);
    setShowAddNoticeModal(false);
    setNewNotTitle('');
    setNewNotContent('');

    // Auto-broadcast into school's general noticeboard
    try {
      addNotice?.({
        title: `[संकुल परिपत्र - ${selectedCluster}] ${newNotTitle.trim()}`,
        category: 'Vidya Bharati',
        date: new Date().toISOString().split('T')[0],
        content: newNotContent.trim(),
        isUrgent: true
      });
    } catch (e) {
      console.warn('Could not sync notice to school noticeboard:', e);
    }
  };

  const handleDeleteNotice = (id: string) => {
    if (window.confirm('क्या आप इस संकुल परिपत्र को हटाना चाहते हैं?')) {
      const updated = notices.filter(n => n.id !== id);
      handleSaveNotices(updated);
    }
  };

  const handleShareNoticeWhatsApp = (notice: SankulNotice) => {
    const categoryLabels: Record<string, string> = {
      Sports: 'खेलकूद प्रतियोगिता',
      Academic: 'शैक्षणिक सूचना',
      Workshop: 'आचार्य कार्यशाला',
      Meeting: 'प्रधानाचार्य बैठक',
      Cultural: 'सांस्कृतिक आयोजन'
    };
    const catText = categoryLabels[notice.category] || notice.category;
    const text = `🚩 *विद्या भारती - संकुल परिपत्र* 🚩\n*संकुल:* ${selectedCluster}\n\n📢 *विषय:* ${notice.title}\n🏷️ *श्रेणी:* ${catText}\n📅 *दिनांक:* ${notice.date}\n✍️ *निर्गमन कर्ता:* ${notice.issuedBy}\n\n📝 *विवरण:*\n${notice.content}\n\n_समस्त सम्बद्ध सरस्वती शिशु/विद्या मंदिर प्रधानाचार्य कृपया संज्ञान लें एवं आवश्यक क्रियान्वयन सुनिश्चित करें।_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 print:bg-white">
      
      {/* Pinned Top Navigation Bar (Hidden when printing) */}
      <header className="shrink-0 no-print sticky top-0 z-30 bg-gradient-to-r from-orange-950 via-stone-900 to-orange-950 text-white shadow-xl border-b border-orange-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl shadow-md shrink-0">
              🪷
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide truncate">
                  संकुल प्रभारी पटल (Cluster Oversight Portal)
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  विद्या भारती अखिल भारतीय शिक्षा संस्थान
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-stone-300 shrink-0">सक्रिय संकुल:</span>
                <select
                  value={selectedCluster}
                  onChange={e => {
                    setSelectedCluster(e.target.value);
                    sessionStorage.setItem('ssm_sankul_name', e.target.value);
                  }}
                  className="bg-stone-900/90 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-lg border border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[260px] truncate"
                  title="सक्रिय संकुल बदलें"
                >
                  {SANKUL_CLUSTERS.map(c => (
                    <option key={c} value={c} className="bg-stone-900 text-stone-100">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              title="संकुल रिपोर्ट प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">🖨️ संकुल रिपोर्ट प्रिंट</span>
              <span className="sm:hidden">प्रिंट</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-red-900/80 text-stone-200 hover:text-white text-xs font-bold rounded-xl border border-stone-700 transition cursor-pointer shadow-xs"
              title="मुख्य पृष्ठ पर वापस जाएं"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 text-xs border-t border-stone-800 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>समग्र समीक्षा (Overview)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schools')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'schools'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>सम्बद्ध विद्यालय पंजिका ({clusterSchools.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspections')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inspections'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>निरीक्षण व गुणवत्ता पंजिका ({inspections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'notices'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>संकुल परिपत्र व आयोजन ({notices.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6 print:p-0 print:m-0 print:max-w-none">
        
        {/* Printable Official Header (Visible ONLY during print) */}
        <div className="hidden print:block text-center border-b-2 border-stone-900 pb-4 mb-6">
          <p className="text-xs font-serif font-bold text-stone-700 tracking-widest uppercase">
            ॥ श्री गणेशाय नमः ॥ सा विद्या या विमुक्तये ॥
          </p>
          <h1 className="text-2xl font-black text-stone-950 mt-1">
            विद्या भारती अखिल भारतीय शिक्षा संस्थान
          </h1>
          <h2 className="text-lg font-bold text-orange-900">
            {selectedCluster} • संकुल स्तरीय वार्षिक प्रशासनिक एवं शैक्षणिक प्रतिवेदन
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            सत्र: 2026-27 • प्रतिवेदन निर्गमन तिथि: {new Date().toLocaleDateString('hi-IN')}
          </p>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & AGGREGATE KPI METRICS */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Aggregate KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-2xl shrink-0">
                  🏛️
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-semibold block">सम्बद्ध विद्यालय</span>
                  <span className="text-2xl font-black text-stone-900">{totalSchools}</span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">सक्रिय शाखाएं</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl shrink-0">
                  👥
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-semibold block">कुल छात्र संख्या</span>
                  <span className="text-2xl font-black text-stone-900">{totalStudents.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-blue-700 font-bold block mt-0.5">भैया: {bhaiyaCount.toLocaleString('en-IN')} • बहिन: {bahinCount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shrink-0">
                  👨‍🏫
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-semibold block">आचार्य एवं दीदी</span>
                  <span className="text-2xl font-black text-stone-900">{totalAcharyas}</span>
                  <span className="text-[10px] text-amber-800 font-bold block mt-0.5">छात्र-शिक्षक अनुपात: 18:1</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shrink-0">
                  📊
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-semibold block">औसत संकुल उपस्थिति</span>
                  <span className="text-2xl font-black text-emerald-700">{avgAttendance}%</span>
                  <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">🟢 उत्कृष्ट स्तर</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl shrink-0">
                  💰
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-semibold block">शुल्क वसूली दर</span>
                  <span className="text-2xl font-black text-purple-900">{avgFeeRecovery}%</span>
                  <span className="text-[10px] text-purple-700 font-bold block mt-0.5">पारदर्शी डिजिटल लेजर</span>
                </div>
              </div>

            </div>

            {/* Strategic Oversight Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Pillar 1: NEP 2020 & Panchmukhi Compliance */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🌸</span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">
                        पंचमुखी शिक्षा एवं NEP 2020 क्रियान्वयन स्थिति
                      </h3>
                      <p className="text-xs text-stone-500">संकुल के सभी विद्यालयों में 5 सनातन आयामों का मूल्यांकन</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    100% संकुल कवरेज
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>1. शारीरिक शिक्षा (खेलकूद, दंड, नियुद्ध)</span>
                      <span className="text-orange-800">95% विद्यालय पूर्ण</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-600 rounded-full w-[95%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>2. योग एवं प्राणायाम (दैनिक सूर्य नमस्कार, आसन)</span>
                      <span className="text-amber-800">98% विद्यालय पूर्ण</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[98%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>3. संगीत एवं घोष (वंदना, देशभक्ति गीत, वंशी/आनक)</span>
                      <span className="text-emerald-800">92% विद्यालय पूर्ण</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full w-[92%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>4. संस्कृत एवं संस्कृति (सुभाषित, सरल संस्कृत)</span>
                      <span className="text-blue-800">90% विद्यालय पूर्ण</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full w-[90%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>5. नैतिक एवं आध्यात्मिक शिक्षा (संस्कार, गुरु भक्ति)</span>
                      <span className="text-purple-800">96% विद्यालय पूर्ण</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full w-[96%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Statutory Compliance & UDISE Readiness */}
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-stone-900">
                        सरकारी अनुपालन एवं UDISE+ SDMS समीक्षा
                      </h3>
                      <p className="text-xs text-stone-500">शिक्षा मंत्रालय भारत सरकार के नवीनतम मानकों की स्थिति</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                    सत्र 2026-27
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                    <span className="text-stone-500 font-semibold block">11-अंकीय PEN नामांकन</span>
                    <span className="text-lg font-black text-emerald-700">96.8%</span>
                    <p className="text-[10px] text-stone-500">स्थायी शिक्षा संख्या जनरेटेड</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                    <span className="text-stone-500 font-semibold block">12-अंकीय APAAR ID</span>
                    <span className="text-lg font-black text-blue-700">94.2%</span>
                    <p className="text-[10px] text-stone-500">अभिभावक सहमति सहित लिंक</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                    <span className="text-stone-500 font-semibold block">दाखिल-खारिज पंजिका (16-Col)</span>
                    <span className="text-lg font-black text-amber-700">100%</span>
                    <p className="text-[10px] text-stone-500">विधिक देवनागरी शब्दों सहित अद्यतन</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                    <span className="text-stone-500 font-semibold block">UDISE+ 42-कॉलम एक्सपोर्ट</span>
                    <span className="text-lg font-black text-purple-700">तैयार</span>
                    <p className="text-[10px] text-stone-500">DoSEL पोर्टल अपलोड योग्य</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SCHOOLS DIRECTORY & COMPARATIVE METRICS */}
        {/* ============================================================== */}
        {activeTab === 'schools' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
            
            {/* Search and Filters Bar (Hidden on print) */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50 print:hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-stone-800">सम्बद्ध विद्यालय तालिका</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 text-xs font-bold">
                  कुल: {clusterSchools.length}
                </span>
              </div>

              <div className="relative min-w-[220px] max-w-sm w-full sm:w-auto">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="विद्यालय, शहर या प्रधानाचार्य खोजें..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Schools Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="p-3 w-12 text-center">क्र.</th>
                    <th className="p-3">विद्यालय का नाम एवं पता</th>
                    <th className="p-3">प्रधानाचार्य एवं संपर्क</th>
                    <th className="p-3 text-center">संबद्धता क्र. / UDISE</th>
                    <th className="p-3 text-center">छात्र संख्या</th>
                    <th className="p-3 text-center">शिक्षक</th>
                    <th className="p-3 text-center">उपस्थिति</th>
                    <th className="p-3 text-center no-print">क्रियाएं (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {clusterSchools.map((school, idx) => {
                    const { studentCount: schoolStudentCount, acharyaCount: schoolAcharyaCount, attRate: schoolAttRate } = getSchoolMetrics(school);

                    return (
                      <tr key={school.id} className="hover:bg-amber-50/40 transition">
                        <td className="p-3 text-center font-mono text-stone-500">{idx + 1}</td>
                        <td className="p-3">
                          <span className="font-bold text-stone-900 block text-sm">
                            {school.hindiName || school.name}
                          </span>
                          <span className="text-[11px] text-stone-500 block">
                            {school.address}, {school.city} ({school.prant || school.state})
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-stone-800 block">
                            {school.principalName || 'प्रधानाचार्य'}
                          </span>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {school.phone || '—'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">
                          <span className="block text-stone-700 font-bold">{school.affiliationNo || 'VB-UP-2025'}</span>
                          <span className="block text-[10px] text-stone-400">UDISE: {school.udiseCode || '07010100101'}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-stone-900">
                          {schoolStudentCount}
                        </td>
                        <td className="p-3 text-center font-bold text-stone-900">
                          {schoolAcharyaCount}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-700">
                          {schoolAttRate}%
                        </td>
                        <td className="p-3 text-center no-print">
                          <button
                            type="button"
                            onClick={() => handleOpenSchoolAudit(school)}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs"
                            title="इस विद्यालय का सुरक्षित ऑडिट एवं निरीक्षण प्रपत्र खोलें"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>निरीक्षण करें</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SANKUL INSPECTIONS & QUALITY AUDIT LOG */}
        {/* ============================================================== */}
        {activeTab === 'inspections' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Action Bar (Hidden on print) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  संकुल निरीक्षण एवं गुणवत्ता समीक्षा पंजिका (Inspection Register)
                </h3>
                <p className="text-xs text-stone-500">
                  संबद्ध विद्यालयों के भौतिक, शैक्षणिक एवं पंचमुखी आयामों का नियमित मूल्यांकन
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportSankulBackup}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 shadow-2xs transition cursor-pointer"
                  title="संकुल निरीक्षण व परिपत्र बैकअप (JSON) डाउनलोड करें"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>📥 संकुल बैकअप (JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddInspectionModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-700 to-amber-700 hover:from-orange-800 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ नया निरीक्षण दर्ज करें</span>
                </button>
              </div>
            </div>

            {/* Inspections Cards Grid */}
            {clusterInspections.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-2">
                <span className="text-3xl block">🔍</span>
                <p className="text-sm font-bold text-stone-700">इस संकुल में कोई निरीक्षण दर्ज नहीं है</p>
                <p className="text-xs text-stone-500">ऊपर दिए गए बटन से नया निरीक्षण रिकॉर्ड जोड़ें।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {clusterInspections.map(insp => (
                  <div key={insp.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
                    <div className="flex justify-between items-start gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 leading-snug">
                          {insp.schoolName}
                        </h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          निरीक्षक: <strong>{insp.inspectorName}</strong> • दिनांक: {insp.inspectionDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                          ★ {((insp.academicRating + insp.infrastructureRating + insp.panchmukhiRating) / 3).toFixed(1)} / 5
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteInspection(insp.id)}
                          className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition cursor-pointer no-print"
                          title="निरीक्षण रिकॉर्ड हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Rating Badges */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-xl bg-orange-50/70 border border-orange-200">
                        <span className="text-stone-500 block text-[10px]">शैक्षणिक स्तर</span>
                        <span className="font-bold text-orange-900">{'★'.repeat(insp.academicRating)} ({insp.academicRating}/5)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200">
                        <span className="text-stone-500 block text-[10px]">भौतिक संसाधन</span>
                        <span className="font-bold text-blue-900">{'★'.repeat(insp.infrastructureRating)} ({insp.infrastructureRating}/5)</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200">
                        <span className="text-stone-500 block text-[10px]">पंचमुखी आयाम</span>
                        <span className="font-bold text-emerald-900">{'★'.repeat(insp.panchmukhiRating)} ({insp.panchmukhiRating}/5)</span>
                      </div>
                    </div>

                    {/* Observations & Recommendations */}
                    <div className="space-y-2 text-xs">
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="font-bold text-stone-700 block mb-0.5">📋 निरीक्षण मुख्य बिंदु:</span>
                        <p className="text-stone-600 leading-relaxed">{insp.observations}</p>
                      </div>

                      <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-900 block mb-0.5">💡 सुधार हेतु अनुशंसाएं:</span>
                        <p className="text-amber-950 leading-relaxed">{insp.recommendations}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SANKUL CIRCULARS & INTER-SCHOOL EVENTS */}
        {/* ============================================================== */}
        {activeTab === 'notices' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Action Bar (Hidden on print) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  संकुल परिपत्र एवं अंतर-विद्यालयी सूचनाएं (Cluster Circulars & Events)
                </h3>
                <p className="text-xs text-stone-500">
                  संकुल स्तरीय खेलकूद, कार्यशालाएं एवं प्रधानाचार्य बैठकों के आधिकारिक निर्देश
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddNoticeModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-700 to-amber-700 hover:from-orange-800 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ नया परिपत्र जारी करें</span>
              </button>
            </div>

            {/* Circulars List */}
            {clusterNotices.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-2">
                <span className="text-3xl block">📢</span>
                <p className="text-sm font-bold text-stone-700">इस संकुल के लिए कोई परिपत्र उपलब्ध नहीं है</p>
                <p className="text-xs text-stone-500">ऊपर दिए गए बटन से नया संकुल परिपत्र जारी करें।</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clusterNotices.map(notice => (
                  <div key={notice.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-950">
                          {notice.category}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-stone-900">
                          {notice.title}
                        </h4>
                      </div>
                      <span className="text-xs text-stone-500 font-medium">
                        दिनांक: {notice.date}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {notice.content}
                    </p>

                    <div className="text-[11px] text-stone-500 font-semibold pt-2 border-t border-stone-100 flex flex-wrap justify-between items-center gap-2">
                      <span>निर्गमन कर्ता: <strong>{notice.issuedBy}</strong></span>
                      <div className="flex items-center gap-2 no-print">
                        <button
                          type="button"
                          onClick={() => handleShareNoticeWhatsApp(notice)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                          title="WhatsApp पर प्रधानाचार्यों को प्रसारित करें"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>📱 WhatsApp प्रसारण</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition cursor-pointer"
                          title="परिपत्र हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* MODAL 0: READ-ONLY SCHOOL AUDIT & INSPECTION MODAL */}
      {/* ============================================================== */}
      {selectedAuditSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-amber-400 flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="shrink-0 bg-gradient-to-r from-orange-900 via-amber-800 to-orange-950 text-white px-6 py-4 flex items-center justify-between border-b border-amber-400/30">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-300 text-xl shrink-0">
                  🏛️
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black truncate">
                      {selectedAuditSchool.hindiName || selectedAuditSchool.name}
                    </h3>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                      सुरक्षित ऑडिट
                    </span>
                  </div>
                  <p className="text-xs text-amber-200 truncate mt-0.5">
                    {selectedAuditSchool.address}, {selectedAuditSchool.city} • UDISE: {selectedAuditSchool.udiseCode || '07010100101'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAuditSchool(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer shrink-0"
                title="बंद करें (Close)"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content: 1. Read-Only Institutional KPIs, 2. Inline Inspection Form */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
              
              {/* Section 1: Read-Only Audit Scorecard */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <span>👁️</span>
                    <span>विद्यालय संस्थागत संकेतक (Read-Only Audit Overview)</span>
                  </h4>
                  <span className="text-[10px] text-stone-500 font-medium">
                    प्राचार्य: <strong>{selectedAuditSchool.principalName || 'प्रधानाचार्य'}</strong> ({selectedAuditSchool.phone || '—'})
                  </span>
                </div>

                {(() => {
                  const m = getSchoolMetrics(selectedAuditSchool);
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200">
                        <span className="text-[10px] text-stone-500 font-semibold block">छात्र शक्ति</span>
                        <span className="text-base font-black text-orange-950">
                          {m.studentCount}
                        </span>
                        <span className="text-[10px] text-orange-700 font-bold block mt-0.5">सक्रिय नामांकित</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
                        <span className="text-[10px] text-stone-500 font-semibold block">आचार्य / दीदी</span>
                        <span className="text-base font-black text-amber-950">
                          {m.acharyaCount}
                        </span>
                        <span className="text-[10px] text-amber-800 font-bold block mt-0.5">18:1 अनुपात</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                        <span className="text-[10px] text-stone-500 font-semibold block">दैनिक उपस्थिति</span>
                        <span className="text-base font-black text-emerald-700">
                          {m.attRate}%
                        </span>
                        <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">संतोषजनक</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200">
                        <span className="text-[10px] text-stone-500 font-semibold block">शुल्क अदायगी</span>
                        <span className="text-base font-black text-purple-900">
                          {m.feeRate}%
                        </span>
                        <span className="text-[10px] text-purple-700 font-bold block mt-0.5">लेजर अद्यतन</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Statutory Readiness Strip */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-600">
                  <span className="px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 font-medium">
                    ✅ 11-अंकीय PEN: 96.8%
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 font-medium">
                    ✅ 12-अंकीय APAAR: 94.2%
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 font-medium">
                    ✅ 16-कॉलम SR पंजिका: 100%
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 font-medium">
                    ✅ UDISE+ SDMS: तैयार
                  </span>
                </div>
              </div>

              {/* Section 2: Inline Inspection & Quality Rating Form */}
              <form onSubmit={handleCreateInspection} className="space-y-4 pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-600" />
                    <span>संकुल निरीक्षण एवं गुणवत्ता समीक्षा दर्ज करें</span>
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono">
                    ID: {selectedAuditSchool.affiliationNo || selectedAuditSchool.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">निरीक्षण तिथि</label>
                    <input
                      type="date"
                      value={newInspDate}
                      onChange={e => setNewInspDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">निरीक्षक का नाम</label>
                    <input
                      type="text"
                      value={newInspInspector}
                      onChange={e => setNewInspInspector(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* 3-Dimensional 5-Star Ratings */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-orange-50/50 border border-orange-200">
                    <label className="block font-bold text-orange-950 mb-1">शैक्षणिक स्तर (1-5)</label>
                    <select
                      value={newInspAcadRating}
                      onChange={e => setNewInspAcadRating(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-orange-300 rounded-xl font-bold text-orange-900"
                    >
                      {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
                    </select>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200">
                    <label className="block font-bold text-blue-950 mb-1">भौतिक संसाधन (1-5)</label>
                    <select
                      value={newInspInfraRating}
                      onChange={e => setNewInspInfraRating(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-blue-300 rounded-xl font-bold text-blue-900"
                    >
                      {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
                    </select>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
                    <label className="block font-bold text-emerald-950 mb-1">पंचमुखी आयाम (1-5)</label>
                    <select
                      value={newInspPanchRating}
                      onChange={e => setNewInspPanchRating(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-900"
                    >
                      {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">निरीक्षण मुख्य बिंदु (Observations)</label>
                  <textarea
                    rows={3}
                    value={newInspObs}
                    onChange={e => setNewInspObs(e.target.value)}
                    placeholder="दैनिक वंदना, अनुशासन, शिक्षण गुणवत्ता, पंजिका स्थिति आदि..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">सुधार हेतु आधिकारिक अनुशंसाएं (Recommendations)</label>
                  <textarea
                    rows={2}
                    value={newInspRec}
                    onChange={e => setNewInspRec(e.target.value)}
                    placeholder="प्रबंध समिति एवं प्रधानाचार्य हेतु सुधारात्मक निर्देश..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAuditSchool(null)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-orange-700 to-amber-700 hover:from-orange-800 hover:to-amber-800 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>निरीक्षण रिपोर्ट सहेजें</span>
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: ADD NEW INSPECTION RECORD */}
      {/* ============================================================== */}
      {showAddInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-300 flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-orange-800 to-amber-700 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold">नया विद्यालय निरीक्षण दर्ज करें</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddInspectionModal(false)}
                className="p-1 rounded-lg hover:bg-orange-900 text-white cursor-pointer"
                title="बंद करें (Close)"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateInspection} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">विद्यालय चुनें (Select School)</label>
                <select
                  value={newInspSchool}
                  onChange={e => setNewInspSchool(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.hindiName || s.name}>{s.hindiName || s.name} ({s.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">निरीक्षण तिथि</label>
                  <input
                    type="date"
                    value={newInspDate}
                    onChange={e => setNewInspDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">निरीक्षक का नाम</label>
                  <input
                    type="text"
                    value={newInspInspector}
                    onChange={e => setNewInspInspector(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">शैक्षणिक रेटिंग (1-5)</label>
                  <select
                    value={newInspAcadRating}
                    onChange={e => setNewInspAcadRating(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-orange-900"
                  >
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">संसाधन रेटिंग (1-5)</label>
                  <select
                    value={newInspInfraRating}
                    onChange={e => setNewInspInfraRating(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-blue-900"
                  >
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">पंचमुखी रेटिंग (1-5)</label>
                  <select
                    value={newInspPanchRating}
                    onChange={e => setNewInspPanchRating(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-emerald-900"
                  >
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">निरीक्षण मुख्य बिंदु (Observations)</label>
                <textarea
                  rows={3}
                  value={newInspObs}
                  onChange={e => setNewInspObs(e.target.value)}
                  placeholder="दैनिक वंदना, अनुशासन, शिक्षण गुणवत्ता आदि..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">सुधार हेतु अनुशंसाएं (Recommendations)</label>
                <textarea
                  rows={2}
                  value={newInspRec}
                  onChange={e => setNewInspRec(e.target.value)}
                  placeholder="प्रबंध समिति एवं प्रधानाचार्य हेतु निर्देश..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddInspectionModal(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  निरीक्षण सहेजें
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD NEW CIRCULAR / NOTICE */}
      {/* ============================================================== */}
      {showAddNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-300 flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-orange-800 to-amber-700 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="text-sm font-bold">नया संकुल परिपत्र जारी करें</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddNoticeModal(false)}
                className="p-1 rounded-lg hover:bg-orange-900 text-white cursor-pointer"
                title="बंद करें (Close)"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateNotice} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">परिपत्र शीर्षक (Title)</label>
                <input
                  type="text"
                  value={newNotTitle}
                  onChange={e => setNewNotTitle(e.target.value)}
                  placeholder="उदा. संकुल स्तरीय खेलकूद प्रतियोगिता..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">श्रेणी (Category)</label>
                  <select
                    value={newNotCategory}
                    onChange={e => setNewNotCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Sports">खेलकूद (Sports)</option>
                    <option value="Academic">शैक्षणिक (Academic)</option>
                    <option value="Workshop">कार्यशाला (Workshop)</option>
                    <option value="Meeting">बैठक (Meeting)</option>
                    <option value="Cultural">सांस्कृतिक (Cultural)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">निर्गमन कर्ता</label>
                  <input
                    type="text"
                    value={newNotIssuer}
                    onChange={e => setNewNotIssuer(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">परिपत्र विवरण (Circular Details)</label>
                <textarea
                  rows={4}
                  value={newNotContent}
                  onChange={e => setNewNotContent(e.target.value)}
                  placeholder="समस्त संबद्ध विद्यालयों हेतु आवश्यक निर्देश..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoticeModal(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  परिपत्र जारी करें
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

