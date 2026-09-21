import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import { formatWhatsAppPhone } from '../../../utils/whatsappAlerts';
import { exportPayrollToCSV } from '../../../utils/csvExport';
import type { Staff } from '../../../types';
import {
  Briefcase,
  Download,
  Edit3,
  FileText,
  IndianRupee,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';

interface AdminStaffTabProps {
  staffList: Staff[];
  onRefresh: () => void;
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  onOpenSalarySlip: (staff: Staff) => void;
  onOpenUpgradeModal?: (feature: { name: string; desc?: string }) => void;
}

const AdminStaffTabComponent: React.FC<AdminStaffTabProps> = ({
  staffList,
  onRefresh,
  setStaffList,
  onOpenSalarySlip,
  onOpenUpgradeModal
}) => {
  const { currentSchool } = useSchool();
  const { showSuccess, showError, showWarning } = useToast();

  const generateRandomPin = () => Math.floor(1000 + Math.random() * 9000).toString();

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [stfName, setStfName] = useState('');
  const [stfGender, setStfGender] = useState<'Acharya' | 'Didi'>('Acharya');
  const [stfDesignation, setStfDesignation] = useState('');
  const [stfQualification, setStfQualification] = useState('');
  const [stfSubjects, setStfSubjects] = useState('');
  const [stfPhone, setStfPhone] = useState('');
  const [stfPin, setStfPin] = useState(generateRandomPin);
  const [stfMonthlySalary, setStfMonthlySalary] = useState<number | ''>('');
  const [stfStatus, setStfStatus] = useState<'Active' | 'OnLeave' | 'Resigned'>('Active');
  const [stfAssignedClasses, setStfAssignedClasses] = useState('');
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Acharya' | 'Didi'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'OnLeave' | 'Resigned'>('ALL');

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setStfName('');
    setStfGender('Acharya');
    setStfDesignation('');
    setStfQualification('');
    setStfSubjects('');
    setStfPhone('');
    setStfPin(generateRandomPin());
    setStfMonthlySalary('');
    setStfStatus('Active');
    setStfAssignedClasses('');
    setShowAddStaff(false);
  };

  const handleStartEdit = (staff: Staff) => {
    setEditingStaffId(staff.id);
    setStfName(staff.name);
    setStfGender((staff.gender as any) || 'Acharya');
    setStfDesignation(staff.designation || '');
    setStfQualification(staff.qualification || '');
    setStfSubjects(staff.subjects || '');
    setStfPhone(staff.phone || '');
    setStfPin(staff.pin || generateRandomPin());
    setStfMonthlySalary(staff.monthlySalary || '');
    setStfStatus((staff.status as any) || 'Active');
    setStfAssignedClasses((staff.assignedClasses || []).join(', '));
    setShowAddStaff(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stfName || !stfDesignation || !stfPhone) {
      showWarning('कृपया नाम, पद एवं संपर्क नंबर भरें।');
      return;
    }
    try {
      const basic = Math.round(Number(stfMonthlySalary) * 0.6) || 15000;
      const da = Math.round(Number(stfMonthlySalary) * 0.3) || 7500;
      const pf = Math.round(Number(stfMonthlySalary) * 0.05) || 1250;
      const parsedAssignedClasses = stfAssignedClasses
        ? stfAssignedClasses.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      if (editingStaffId) {
        await api.updateStaff(editingStaffId, {
          name: stfName,
          gender: stfGender,
          designation: stfDesignation,
          qualification: stfQualification,
          subjects: stfSubjects,
          phone: stfPhone,
          pin: stfPin || '1234',
          assignedClasses: parsedAssignedClasses,
          monthlySalary: Number(stfMonthlySalary) || 0,
          basicPay: basic,
          daHra: da,
          pfDeduction: pf,
          status: stfStatus
        });
        showSuccess('आचार्य/कर्मचारी विवरण सफलतापूर्वक अद्यतन (Updated) किया गया!');
      } else {
        await api.createStaff({
          schoolId: currentSchool.id,
          name: stfName,
          gender: stfGender,
          designation: stfDesignation,
          qualification: stfQualification,
          subjects: stfSubjects,
          phone: stfPhone,
          pin: stfPin || '1234',
          assignedClasses: parsedAssignedClasses,
          monthlySalary: Number(stfMonthlySalary),
          basicPay: basic,
          daHra: da,
          pfDeduction: pf,
          samitiDeduction: 500,
          joiningDate: new Date().toISOString().split('T')[0],
          status: stfStatus
        });
        showSuccess('नए आचार्य / कर्मचारी सफलतापूर्वक जोड़े गए!');
      }
      handleCancelEdit();
      onRefresh();
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    try {
      await api.deleteStaff(staffToDelete.id);
      showSuccess('आचार्य/कर्मचारी का रिकॉर्ड सफलतापूर्वक हटाया गया!');
      setStaffList(prev => prev.filter(s => s.id !== staffToDelete.id));
      setStaffToDelete(null);
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staffList.filter(s => {
      if (roleFilter !== 'ALL' && s.gender !== roleFilter) return false;
      if (statusFilter !== 'ALL' && (s.status || 'Active') !== statusFilter) return false;
      if (q) {
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesPhone = s.phone && s.phone.includes(q);
        const matchesDesig = s.designation && s.designation.toLowerCase().includes(q);
        const matchesSub = s.subjects && s.subjects.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesDesig && !matchesSub) return false;
      }
      return true;
    });
  }, [staffList, roleFilter, statusFilter, searchQuery]);

  const activeStaff = useMemo(() => staffList.filter(s => s.status !== 'Resigned'), [staffList]);
  const resignedStaff = useMemo(() => staffList.filter(s => s.status === 'Resigned'), [staffList]);

  return (
    <div className="space-y-6">
      {/* Header & KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              सक्रिय शिक्षक एवं कर्मचारी
            </span>
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-stone-900">{activeStaff.length}</span>
            <p className="text-xs text-stone-500 mt-1">
              आचार्य: {activeStaff.filter(s => s.gender === 'Acharya').length} • दीदी जी:{' '}
              {activeStaff.filter(s => s.gender === 'Didi').length}
              {resignedStaff.length > 0 && (
                <span className="text-amber-700 font-semibold"> • {resignedStaff.length} सेवामुक्त</span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              मासिक कुल वेतन दायित्व
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-stone-900">
              ₹{activeStaff.reduce((acc, s) => acc + (s.monthlySalary || 0), 0).toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-stone-500 mt-1">मासिक संवितरण (सक्रिय स्टाफ)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              कर्मचारी प्रबंधन
            </span>
            <p className="text-xs text-stone-600 mt-1">
              आचार्यों का मानदेय निर्धारण एवं मासिक वेतन पर्ची (Salary Slip) प्रिंट करें।
            </p>
          </div>
          <button
            onClick={() => {
              if (showAddStaff) {
                handleCancelEdit();
              } else {
                setShowAddStaff(true);
              }
            }}
            className="mt-3 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
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
            <span>{editingStaffId ? 'आचार्य / कर्मचारी विवरण संपादित करें' : 'नए आचार्य / कर्मचारी का विवरण भरें'}</span>
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
                onChange={e => setStfGender(e.target.value as 'Acharya' | 'Didi')}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 font-medium"
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-stone-700 font-bold">लॉगिन सुरक्षा पिन (PIN)*</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    सुरक्षित 4-अंकीय पिन
                  </span>
                  <button
                    type="button"
                    onClick={() => setStfPin(generateRandomPin())}
                    className="text-[10px] text-orange-700 hover:text-orange-900 font-bold hover:underline cursor-pointer"
                    title="नया यादृच्छिक पिन जनरेट करें"
                  >
                    🔄 नया पिन
                  </button>
                </div>
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="उदा. 4829"
                value={stfPin}
                onChange={e => setStfPin(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 font-mono tracking-widest font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">मासिक मानदेय / वेतन (₹)*</label>
              <input
                type="number"
                placeholder="उदा: 28000"
                value={stfMonthlySalary}
                onChange={e => setStfMonthlySalary(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">कार्यरत स्थिति (Status)</label>
              <select
                value={stfStatus}
                onChange={e => setStfStatus(e.target.value as any)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 font-medium"
              >
                <option value="Active">सक्रिय (Active)</option>
                <option value="OnLeave">अवकाश पर (On Leave)</option>
                <option value="Resigned">कार्यमुक्त / सेवानिवृत्त (Resigned)</option>
              </select>
            </div>

            <div className="sm:col-span-3 bg-white/80 p-3 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-stone-800 font-bold">
                  🎓 कक्षाध्यापक दायित्व / आवंटित कक्षाएं (Assigned Classes for Class Teacher Scope)
                </label>
                <span className="text-[10px] text-stone-500">वैकल्पिक (Optional)</span>
              </div>
              <input
                type="text"
                placeholder="उदा: Class 8, Class 5-A, Class 6"
                value={stfAssignedClasses}
                onChange={e => setStfAssignedClasses(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 font-medium"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                आचार्य को जिस कक्षा का कक्षाध्यापक (Class Teacher) बनाना हो, उन कक्षाओं के नाम कॉमा (,) लगाकर दर्ज करें।
              </p>
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                {editingStaffId ? 'अद्यतन सहेजें (Update)' : 'आचार्य जोड़ें (Save Staff)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="नाम, दूरभाष, पद या विषय से खोजें..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as any)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी वर्ग (Acharya & Didi)</option>
          <option value="Acharya">केवल आचार्य जी</option>
          <option value="Didi">केवल दीदी जी</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी स्थितियां (All Status)</option>
          <option value="Active">सक्रिय (Active)</option>
          <option value="OnLeave">अवकाश पर (On Leave)</option>
          <option value="Resigned">कार्यमुक्त (Resigned)</option>
        </select>

        <button
          type="button"
          onClick={() =>
            exportPayrollToCSV(
              filteredStaff,
              currentSchool.hindiName || currentSchool.name,
              new Date().toLocaleDateString('hi-IN', { month: 'long', year: 'numeric' })
            )
          }
          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          title="मासिक पेरोल शीट CSV डाउनलोड करें"
        >
          <Download className="w-3.5 h-3.5 text-stone-600" />
          <span>मासिक पेरोल CSV</span>
        </button>

        {(searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>फ़िल्टर हटाएं</span>
          </button>
        )}
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
            आचार्य एवं कर्मचारी विवरण सूची ({filteredStaff.length} पद)
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
                <th className="p-3">स्थिति</th>
                <th className="p-3 text-right">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-stone-500">
                    {searchQuery || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                      ? 'खोज एवं फ़िल्टर के अनुरूप कोई कर्मचारी रिकॉर्ड नहीं मिला।'
                      : 'कोई कर्मचारी रिकॉर्ड उपलब्ध नहीं है।'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map(member => (
                  <tr key={member.id} className="hover:bg-stone-50/80 transition">
                    <td className="p-3 font-mono font-bold text-orange-950 uppercase">{member.id}</td>
                    <td className="p-3 font-bold text-stone-900">
                      {member.name}
                      <span
                        className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          member.gender === 'Acharya'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        {member.gender === 'Acharya' ? 'आचार्य जी' : 'दीदी जी'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-stone-700">{member.designation}</div>
                      {member.assignedClasses && member.assignedClasses.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {member.assignedClasses.map((cls, cIdx) => (
                            <span
                              key={cIdx}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 border border-orange-200 text-[10px] font-bold"
                              title="कक्षाध्यापक दायित्व"
                            >
                              🎓 {cls}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-stone-600">{member.qualification || 'स्नातकोत्तर'}</td>
                    <td className="p-3 text-stone-600">{member.subjects || '—'}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-stone-800 font-semibold">{member.phone}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-orange-800 font-mono bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded w-fit" title="लॉगिन सुरक्षा पिन">
                          🔑 पिन: {member.pin || '1234'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-emerald-700 font-mono">
                      ₹{member.monthlySalary?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.status === 'OnLeave'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : member.status === 'Resigned'
                            ? 'bg-red-100 text-red-800 border border-red-200 font-bold'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {member.status === 'OnLeave'
                          ? 'अवकाश पर'
                          : member.status === 'Resigned'
                          ? 'सेवामुक्त (लॉगिन बंद)'
                          : 'सक्रिय'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      {member.phone && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=${formatWhatsAppPhone(member.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs transition"
                          title="आचार्य/दीदी से सीधे व्हाट्सएप पर संवाद करें"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-700" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleStartEdit(member)}
                        className="p-1 text-stone-400 hover:text-orange-600 rounded transition cursor-pointer"
                        title="आचार्य विवरण संपादित करें (Edit Staff Details)"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenSalarySlip(member)}
                        className="px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-orange-950 border border-orange-300 rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                        title="Generate Official Monthly Salary Slip (मासिक वेतन पर्ची)"
                      >
                        <FileText className="w-3 h-3 text-orange-700" />
                        <span>वेतन पर्ची</span>
                      </button>
                      <button
                        onClick={() => setStaffToDelete(member)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
                        title="आचार्य हटाएं"
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

      {/* Styled Delete Confirmation Dialog */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">आचार्य / कर्मचारी हटाएं</h4>
                <p className="text-xs text-stone-500">स्थायी विलोपन पुष्टि</p>
              </div>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              क्या आप निश्चित रूप से <strong>"{staffToDelete.name}"</strong> (पद: {staffToDelete.designation || 'आचार्य'}, आई.डी.: {staffToDelete.id}) का रिकॉर्ड स्थायी रूप से हटाना चाहते हैं?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={confirmDeleteStaff}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
              >
                हां, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminStaffTab = React.memo(AdminStaffTabComponent);
