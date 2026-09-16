import React from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { TimetableSection } from '../../common/TimetableSection';
import type { AdminTab } from './types';
import type { Student, ReportCard } from '../../../types';
import {
  Users,
  Building2,
  CheckCircle2,
  Receipt,
  FileText,
  ArrowRight,
  Plus,
  Bell,
  IdCard,
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  FileSpreadsheet,
  Shield,
  Sparkles,
  Lock
} from 'lucide-react';

interface AdminOverviewTabProps {
  isDeveloper: boolean;
  developerMetrics: {
    students: number;
    present: number;
    attendanceRate: number;
    collected: number;
    pending: number;
    admissions: number;
  };
  staffCount: number;
  totalBhaiya: number;
  totalBahin: number;
  attendanceRate: number;
  presentCount: number;
  totalFeeCollected: number;
  totalFeePending: number;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenHelpGuide: () => void;
  onOpenAddStudent: () => void;
  onOpenBulkIdCard: () => void;
  onOpenExamModal: () => void;
  onOpenTabulationModal: () => void;
  onOpenTimetableModal: () => void;
  onOpenLeaveModal: () => void;
  onOpenTransportModal: () => void;
  onOpenLibraryModal: () => void;
  onOpenInventoryModal: () => void;
  onOpenBulkNotificationModal: () => void;
  onOpenAuditLogModal: () => void;
  requirePro: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
  onOpenReportModal: (modal: { report: ReportCard; student: Student }) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  isDeveloper,
  developerMetrics,
  staffCount,
  totalBhaiya,
  totalBahin,
  attendanceRate,
  presentCount,
  totalFeeCollected,
  totalFeePending,
  onNavigateTab,
  onOpenHelpGuide,
  onOpenAddStudent,
  onOpenBulkIdCard,
  onOpenExamModal,
  onOpenTabulationModal,
  onOpenTimetableModal,
  onOpenLeaveModal,
  onOpenTransportModal,
  onOpenLibraryModal,
  onOpenInventoryModal,
  onOpenBulkNotificationModal,
  onOpenAuditLogModal,
  requirePro,
  onOpenReportModal
}) => {
  const { currentSchool, schools, students, reportCards } = useSchool();
  const { showInfo } = useToast();
  const isPro = currentSchool.plan === 'pro';
  const totalStudents = students.length;

  return (
    <div className="space-y-6">
      {isDeveloper && (
        <section className="bg-stone-900 text-white rounded-2xl border border-orange-700 p-3.5 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-200">डेवलपर नेटवर्क अवलोकन</h2>
              <p className="text-xs text-stone-300 mt-0.5 sm:mt-1">सभी पंजीकृत शाखाओं का संयुक्त संचालन सारांश</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => onNavigateTab('developer')}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-stone-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🛠️ पूर्ण डेवलपर कंसोल खोलें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-200 border border-amber-400/40 text-[11px] font-bold">
                {schools.length} शाखाएं
              </span>
            </div>
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
      
      {/* Non-Tech Friendly: 1-Click Daily Routine Strip */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 rounded-2xl border border-amber-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse shrink-0" />
            <h2 className="text-sm sm:text-base font-black text-stone-900">
              दैनिक त्वरित कार्य (Daily Routine Shortcuts)
            </h2>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold border border-orange-200">
              1-क्लिक में काम पूरा करें
            </span>
          </div>
          <button
            onClick={onOpenHelpGuide}
            className="text-xs font-bold text-orange-800 hover:text-orange-950 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>💡 काम कैसे करें? (सरल 1-मिनट गाइड देखें)</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* 1. Daily Attendance */}
          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex flex-col items-start p-3 sm:p-3.5 rounded-xl bg-white hover:bg-green-50 border border-green-200 shadow-2xs hover:shadow-xs transition group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-900 group-hover:text-green-800">
              आज की हाजिरी
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 leading-tight">
              कक्षा चुनें व हाजिरी दर्ज करें
            </span>
          </button>

          {/* 2. New Admission */}
          <button
            onClick={onOpenAddStudent}
            className="flex flex-col items-start p-3 sm:p-3.5 rounded-xl bg-white hover:bg-orange-50 border border-orange-200 shadow-2xs hover:shadow-xs transition group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-900 group-hover:text-orange-800">
              नया छात्र प्रवेश
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 leading-tight">
              भैया/बहिन का नया नामांकन
            </span>
          </button>

          {/* 3. Collect Fee & Receipt */}
          <button
            onClick={() => onNavigateTab('fees')}
            className="flex flex-col items-start p-3 sm:p-3.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 shadow-2xs hover:shadow-xs transition group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-900 group-hover:text-amber-800">
              शुल्क जमा व रसीद
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 leading-tight">
              फीस लेकर पक्की रसीद काटें
            </span>
          </button>

          {/* 4. WhatsApp / Notice */}
          <button
            onClick={() => onNavigateTab('notices')}
            className="flex flex-col items-start p-3 sm:p-3.5 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs hover:shadow-xs transition group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-900 group-hover:text-blue-800">
              व्हाट्सएप सूचना
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 leading-tight">
              अभिभावकों को संदेश भेजें
            </span>
          </button>

          {/* 5. Bulk ID Cards */}
          <button
            onClick={onOpenBulkIdCard}
            className="flex flex-col items-start p-3 sm:p-3.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 shadow-2xs hover:shadow-xs transition group cursor-pointer text-left col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <IdCard className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-stone-900 group-hover:text-purple-800">
              बल्क आईडी कार्ड
            </span>
            <span className="text-[10px] text-stone-500 mt-0.5 leading-tight">
              A4 शीट पर 8 कार्ड प्रिंट करें
            </span>
          </button>
        </div>
      </div>

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
            <span className="text-3xl font-black text-stone-900">{staffCount}</span>
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
              onClick={onOpenAddStudent}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 text-xs font-bold transition-all border border-orange-200"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-orange-700" />
                नवीन भैया/बहिन प्रवेश जोड़ें
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigateTab('attendance')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                आज की उपस्थिति दर्ज करें
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigateTab('fees')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                शुल्क रसीद जनरेट करें
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                प्रगति पत्र (Report Card) प्रिंट करें
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigateTab('homework')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                गृहकार्य (Homework) जारी करें
              </span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigateTab('staff')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                आचार्य व वेतन (Payroll) प्रबंधन
              </span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenExamModal}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/80 text-orange-950 text-xs font-bold transition-all border border-amber-200"
            >
              <span className="flex items-center gap-2">
                <span>📝</span>
                परीक्षा समय-सारिणी व मार्क्स एंट्री
              </span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenTabulationModal}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 text-xs font-bold transition-all border border-orange-200"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-orange-600" />
                समग्र परीक्षा परिणाम सारणी (TR Sheet)
              </span>
              <span className="text-orange-600">→</span>
            </button>

            <button
              onClick={onOpenTimetableModal}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/80 text-orange-950 text-xs font-bold transition-all border border-amber-200"
            >
              <span className="flex items-center gap-2">
                <span>🕒</span>
                साप्ताहिक कक्षा समय-सारिणी (Timetable)
              </span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenLeaveModal}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <span>🌴</span>
                अवकाश आवेदन समीक्षा (Leaves)
              </span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenTransportModal}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <span>🚌</span>
                विद्यालय वाहन व बस रूट (Transport)
              </span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenLibraryModal}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <span>📚</span>
                पुस्तकालय व ग्रंथ सूची (Library)
              </span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenInventoryModal}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all border border-stone-200"
            >
              <span className="flex items-center gap-2">
                <span>🎒</span>
                गणवेश व पुस्तक भंडार (Store Inventory)
              </span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenBulkNotificationModal}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold transition-all border border-emerald-300"
            >
              <span className="flex items-center gap-2">
                <span>📢</span>
                अभिभावक संदेश प्रसारण (WhatsApp Broadcast)
              </span>
              <span>→</span>
            </button>

            <button
              onClick={onOpenAuditLogModal}
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
              onClick={() => onNavigateTab('students')}
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
                                  onOpenReportModal({ report, student });
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

