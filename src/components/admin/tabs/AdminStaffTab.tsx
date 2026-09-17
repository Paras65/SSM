import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import { formatWhatsAppPhone } from '../../../utils/whatsappAlerts';
import type { Staff } from '../../../types';
import {
  Briefcase,
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

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [stfName, setStfName] = useState('');
  const [stfGender, setStfGender] = useState<'Acharya' | 'Didi'>('Acharya');
  const [stfDesignation, setStfDesignation] = useState('');
  const [stfQualification, setStfQualification] = useState('');
  const [stfSubjects, setStfSubjects] = useState('');
  const [stfPhone, setStfPhone] = useState('');
  const [stfMonthlySalary, setStfMonthlySalary] = useState<number | ''>('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Acharya' | 'Didi'>('ALL');

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setStfName('');
    setStfGender('Acharya');
    setStfDesignation('');
    setStfQualification('');
    setStfSubjects('');
    setStfPhone('');
    setStfMonthlySalary('');
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
    setStfMonthlySalary(staff.monthlySalary || '');
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

      if (editingStaffId) {
        await api.updateStaff(editingStaffId, {
          name: stfName,
          gender: stfGender,
          designation: stfDesignation,
          qualification: stfQualification,
          subjects: stfSubjects,
          phone: stfPhone,
          monthlySalary: Number(stfMonthlySalary) || 0,
          basicPay: basic,
          daHra: da,
          pfDeduction: pf
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
          monthlySalary: Number(stfMonthlySalary),
          basicPay: basic,
          daHra: da,
          pfDeduction: pf,
          samitiDeduction: 500,
          joiningDate: new Date().toISOString().split('T')[0],
          status: 'Active'
        });
        showSuccess('नए आचार्य / कर्मचारी सफलतापूर्वक जोड़े गए!');
      }
      handleCancelEdit();
      onRefresh();
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

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staffList.filter(s => {
      if (roleFilter !== 'ALL' && s.gender !== roleFilter) return false;
      if (q) {
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesPhone = s.phone && s.phone.includes(q);
        const matchesDesig = s.designation && s.designation.toLowerCase().includes(q);
        const matchesSub = s.subjects && s.subjects.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesDesig && !matchesSub) return false;
      }
      return true;
    });
  }, [staffList, roleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              कुल शिक्षक एवं कर्मचारी
            </span>
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-stone-900">{staffList.length}</span>
            <p className="text-xs text-stone-500 mt-1">
              आचार्य: {staffList.filter(s => s.gender === 'Acharya').length} • दीदी जी:{' '}
              {staffList.filter(s => s.gender === 'Didi').length}
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
              ₹{staffList.reduce((acc, s) => acc + (s.monthlySalary || 0), 0).toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-stone-500 mt-1">मासिक संवितरण (Monthly Payroll)</p>
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

        {(searchQuery || roleFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('ALL');
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
                <th className="p-3 text-right">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-stone-500">
                    {searchQuery || roleFilter !== 'ALL'
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
                    <td className="p-3 font-semibold text-stone-700">{member.designation}</td>
                    <td className="p-3 text-stone-600">{member.qualification || 'स्नातकोत्तर'}</td>
                    <td className="p-3 text-stone-600">{member.subjects || '—'}</td>
                    <td className="p-3 text-stone-600 font-mono">{member.phone}</td>
                    <td className="p-3 font-bold text-emerald-700 font-mono">
                      ₹{member.monthlySalary?.toLocaleString('en-IN')}
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
                        onClick={() => handleDeleteStaff(member.id)}
                        className="p-1 text-stone-400 hover:text-red-600 rounded transition cursor-pointer"
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
  );
};

export const AdminStaffTab = React.memo(AdminStaffTabComponent);
