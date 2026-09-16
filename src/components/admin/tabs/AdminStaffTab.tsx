import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import type { Staff } from '../../../types';
import {
  Crown,
  Briefcase,
  IndianRupee,
  Plus,
  Sparkles,
  FileText,
  Trash2
} from 'lucide-react';

interface AdminStaffTabProps {
  staffList: Staff[];
  onRefresh: () => void;
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  onOpenSalarySlip: (staff: Staff) => void;
  onOpenUpgradeModal: (feature: { name: string; desc?: string }) => void;
}

export const AdminStaffTab: React.FC<AdminStaffTabProps> = ({
  staffList,
  onRefresh,
  setStaffList,
  onOpenSalarySlip,
  onOpenUpgradeModal
}) => {
  const { currentSchool } = useSchool();
  const { showSuccess, showError, showWarning } = useToast();
  const isPro = currentSchool.plan === 'pro';

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [stfName, setStfName] = useState('');
  const [stfGender, setStfGender] = useState<'Acharya' | 'Didi'>('Acharya');
  const [stfDesignation, setStfDesignation] = useState('');
  const [stfQualification, setStfQualification] = useState('');
  const [stfSubjects, setStfSubjects] = useState('');
  const [stfPhone, setStfPhone] = useState('');
  const [stfMonthlySalary, setStfMonthlySalary] = useState<number | ''>('');

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
      setStfMonthlySalary('');
      setShowAddStaff(false);
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

  if (!isPro) {
    return (
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
            onClick={() =>
              onOpenUpgradeModal({
                name: 'आचार्य एवं वेतन प्रबंधन (Staff & Payroll)',
                desc: 'शिक्षकों का पूर्ण रिकॉर्ड, भत्ते एवं मासिक वेतन पर्ची (Salary Slip PDF) केवल प्रो योजना में उपलब्ध है।'
              })
            }
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 inline-flex items-center gap-2 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Crown className="w-4 h-4 text-yellow-200 fill-yellow-300" />
            <span>प्रो में अपग्रेड करें (Unlock Pro Plan)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
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

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
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

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              कर्मचारी प्रबंधन
            </span>
            <p className="text-xs text-stone-600 mt-1">
              आचार्यों का मानदेय निर्धारण एवं मासिक वेतन पर्ची (Salary Slip) प्रिंट करें।
            </p>
          </div>
          <button
            onClick={() => setShowAddStaff(!showAddStaff)}
            className="mt-3 flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
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
                onChange={e => setStfGender(e.target.value as 'Acharya' | 'Didi')}
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
                onChange={e => setStfMonthlySalary(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddStaff(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
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
                      <button
                        onClick={() => onOpenSalarySlip(member)}
                        className="px-2.5 py-1 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-orange-950 border border-orange-300 rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                        title="Generate Official Monthly Salary Slip (मासिक वेतन पर्ची)"
                      >
                        <FileText className="w-3 h-3 text-orange-700" />
                        <span>वेतन पर्ची (Slip)</span>
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

