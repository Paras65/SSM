import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import { generateAdmissionWhatsAppUrl } from '../../../utils/whatsapp';
import { SSM_CLASSES } from '../../../types';
import {
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  FileText,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
  X
} from 'lucide-react';

interface AdminAdmissionsTabProps {
  admissions: any[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

const AdminAdmissionsTabComponent: React.FC<AdminAdmissionsTabProps> = ({
  admissions,
  onApprove,
  onDelete
}) => {
  const { currentSchool } = useSchool();
  const { showSuccess, showError } = useToast();

  // Detail & Edit Modal state
  const [selectedAdmission, setSelectedAdmission] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editClass, setEditClass] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editFather, setEditFather] = useState('');
  const [editMother, setEditMother] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Admitted' | 'Pending'>('ALL');

  const handleOpenDetail = (adm: any) => {
    setSelectedAdmission(adm);
    setIsEditing(false);
    setEditClass(adm.applyingClass || 'Class 1');
    setEditPhone(adm.phone || '');
    setEditAddress(adm.address || '');
    setEditFather(adm.fatherName || '');
    setEditMother(adm.motherName || '');
  };

  const handleCloseDetail = () => {
    setSelectedAdmission(null);
    setIsEditing(false);
  };

  const handleSaveAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmission) return;
    try {
      setIsSaving(true);
      const updated = await api.updateAdmission(selectedAdmission.id, {
        applyingClass: editClass,
        phone: editPhone,
        address: editAddress,
        fatherName: editFather,
        motherName: editMother
      });
      showSuccess('प्रवेश आवेदन विवरण सफलतापूर्वक अद्यतन (Updated) किया गया!');
      setSelectedAdmission((prev: any) => ({ ...prev, ...updated }));
      Object.assign(selectedAdmission, updated);
      setIsEditing(false);
    } catch (err: any) {
      showError('त्रुटि: ' + (err.message || 'Error updating admission'));
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered admissions
  const filteredAdmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return admissions.filter(adm => {
      // Class filter
      const matchesClass =
        selectedClass === 'ALL' ||
        adm.applyingClass === selectedClass ||
        (adm.applyingClass && adm.applyingClass.startsWith(selectedClass + ' '));
      if (!matchesClass) return false;

      // Status filter
      if (selectedStatus === 'Admitted' && adm.status !== 'Admitted') return false;
      if (selectedStatus === 'Pending' && adm.status === 'Admitted') return false;

      // Search
      if (q) {
        const matchesName = adm.studentName && adm.studentName.toLowerCase().includes(q);
        const matchesReg = (adm.regNo || adm.id) && (adm.regNo || adm.id).toLowerCase().includes(q);
        const matchesFather = adm.fatherName && adm.fatherName.toLowerCase().includes(q);
        const matchesPhone = adm.phone && adm.phone.includes(q);
        if (!matchesName && !matchesReg && !matchesFather && !matchesPhone) return false;
      }

      return true;
    });
  }, [admissions, selectedClass, selectedStatus, searchQuery]);

  // Admission KPI stats
  const stats = useMemo(() => {
    const total = filteredAdmissions.length;
    const enrolled = filteredAdmissions.filter(a => a.status === 'Admitted').length;
    const pending = total - enrolled;
    const conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;
    return { total, enrolled, pending, conversionRate };
  }, [filteredAdmissions]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            सत्र 2026-27 ऑनलाइन प्रवेश आवेदन समीक्षा (Admission Inquiries Review)
          </h3>
          <p className="text-xs text-stone-500">
            वेबसाइट के माध्यम से प्राप्त भैया-बहिनों के ऑनलाइन प्रवेश आवेदनों की समीक्षा करें एवं स्वीकृत कर सीधे छात्र पंजिका में जोड़ें।
          </p>
        </div>
      </div>

      {/* Admission KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase">कुल आवेदन (Total Inquiries)</span>
            <Users className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <p className="text-xl font-black text-stone-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-stone-500 font-medium">फ़िल्टर अनुसार प्राप्त</span>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase">समीक्षाधीन (Pending Review)</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-800 mt-1">{stats.pending}</p>
          <span className="text-[11px] text-amber-700 font-medium">काउंसलिंग एवं स्वीकृति शेष</span>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">नामांकित छात्र (Enrolled)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-800 mt-1">{stats.enrolled}</p>
          <span className="text-[11px] text-emerald-700 font-medium">पंजिका में स्वीकृत</span>
        </div>

        <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 uppercase">नामांकन दर (Conversion Rate)</span>
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-900 mt-1">{stats.conversionRate}%</p>
          <span className="text-[11px] text-blue-700 font-medium">आवेदन से नामांकन</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="विद्यार्थी का नाम, पंजीकरण सं., मोबाइल या पिता का नाम..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी कक्षाएं (All Classes)</option>
          {SSM_CLASSES.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value as any)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी स्थितियां (All Status)</option>
          <option value="Pending">समीक्षाधीन (Pending Review)</option>
          <option value="Admitted">नामांकित (Enrolled / Admitted)</option>
        </select>

        {(searchQuery || selectedClass !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>फ़िल्टर हटाएं</span>
          </button>
        )}
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
            {filteredAdmissions.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-stone-500">
                  {searchQuery || selectedClass !== 'ALL' || selectedStatus !== 'ALL'
                    ? 'खोज एवं फ़िल्टर के अनुरूप कोई प्रवेश आवेदन नहीं मिला।'
                    : 'कोई प्रवेश आवेदन लंबित नहीं है। वेबसाइट के प्रवेश फॉर्म से आवेदन प्राप्त होने पर यहाँ प्रदर्शित होंगे।'}
                </td>
              </tr>
            ) : (
              filteredAdmissions.map(adm => (
                <tr key={adm.id} className="hover:bg-stone-50 transition">
                  <td className="p-3 font-mono font-bold text-orange-900">{adm.regNo || adm.id}</td>
                  <td className="p-3 font-bold text-stone-900">{adm.studentName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        adm.gender === 'Bhaiya' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {adm.gender === 'Bhaiya' ? 'भैया' : 'बहिन'}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-stone-800">{adm.applyingClass}</td>
                  <td className="p-3 text-stone-600">
                    {adm.fatherName || '—'} {adm.motherName ? `• ${adm.motherName}` : ''}
                  </td>
                  <td className="p-3 text-stone-700 font-medium">{adm.phone}</td>
                  <td className="p-3 text-stone-500">
                    {adm.submissionDate || adm.createdAt?.split('T')[0] || '2026-03-12'}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        adm.status === 'Admitted'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {adm.status === 'Admitted' ? 'नामांकित (Enrolled)' : 'समीक्षाधीन (Pending)'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenDetail(adm)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded font-bold text-[11px] shadow-2xs inline-flex items-center gap-1 cursor-pointer transition"
                      title="आवेदन का पूर्ण विवरण देखें एवं संपादित करें"
                    >
                      <Eye className="w-3 h-3 text-stone-600" />
                      <span>विवरण</span>
                    </button>
                    {generateAdmissionWhatsAppUrl(
                      adm.phone,
                      adm.studentName,
                      adm.applyingClass,
                      currentSchool.hindiName || currentSchool.name,
                      currentSchool.city
                    ) && (
                      <a
                        href={
                          generateAdmissionWhatsAppUrl(
                            adm.phone,
                            adm.studentName,
                            adm.applyingClass,
                            currentSchool.hindiName || currentSchool.name,
                            currentSchool.city
                          )!
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-xs inline-flex items-center gap-1 transition"
                        title="अभिभावक को सीधे व्हाट्सएप पर प्रवेश सूचना संदेश भेजें"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {adm.status !== 'Admitted' && (
                      <button
                        onClick={() => onApprove(adm.id)}
                        className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[11px] shadow-xs inline-flex items-center gap-1 cursor-pointer"
                        title="स्वीकृत कर सीधे छात्र पंजिका में नामांकित करें"
                      >
                        <Check className="w-3 h-3" />
                        <span>स्वीकृत करें</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(adm.id)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                      title="आवेदन हटाएं"
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

      {/* Admission Application Detail & Edit Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-700 to-amber-700 text-white">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-base font-bold">प्रवेश आवेदन समीक्षा एवं विवरण</h3>
                  <p className="text-[11px] text-amber-100 font-mono">
                    पंजीकरण संख्या: {selectedAdmission.regNo || selectedAdmission.id}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-1.5 hover:bg-white/20 rounded-lg transition cursor-pointer"
                title="बंद करें"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[75vh] text-xs">
              {isEditing ? (
                <form onSubmit={handleSaveAdmission} id="edit-admission-form" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">आवेदित कक्षा (Class)*</label>
                      <select
                        value={editClass}
                        onChange={e => setEditClass(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 font-medium"
                      >
                        {SSM_CLASSES.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">दूरभाष नंबर (Phone)*</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">पिता का नाम (Father's Name)</label>
                      <input
                        type="text"
                        value={editFather}
                        onChange={e => setEditFather(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">माता का नाम (Mother's Name)</label>
                      <input
                        type="text"
                        value={editMother}
                        onChange={e => setEditMother(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-stone-700 font-bold mb-1">स्थाई पता (Full Address)</label>
                      <textarea
                        rows={2}
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 resize-none"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-700" />
                      <span className="font-bold text-sm text-stone-900">{selectedAdmission.studentName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {selectedAdmission.gender === 'Bhaiya' ? 'भैया' : 'बहिन'}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        selectedAdmission.status === 'Admitted'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {selectedAdmission.status === 'Admitted' ? '✓ नामांकित (Enrolled)' : '⏳ समीक्षाधीन (Pending)'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 bg-stone-50/70 p-4 rounded-xl border border-stone-200">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">आवेदित कक्षा</span>
                      <p className="text-xs font-bold text-stone-800 mt-0.5">{selectedAdmission.applyingClass}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">संपर्क दूरभाष</span>
                      <p className="text-xs font-mono font-bold text-stone-800 mt-0.5">{selectedAdmission.phone}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">पिता का नाम</span>
                      <p className="text-xs font-semibold text-stone-800 mt-0.5">{selectedAdmission.fatherName || '—'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">माता का नाम</span>
                      <p className="text-xs font-semibold text-stone-800 mt-0.5">{selectedAdmission.motherName || '—'}</p>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] font-bold text-stone-500 uppercase">स्थाई निवास पता</span>
                      <p className="text-xs text-stone-700 mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                        <span>{selectedAdmission.address || 'विवरण उपलब्ध नहीं'}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">आवेदन प्राप्ति दिनांक</span>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {selectedAdmission.submissionDate || selectedAdmission.createdAt?.split('T')[0] || '2026-03-12'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">DPDP सहमति सत्यापन</span>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>सहमति प्रमाणित ({selectedAdmission.consentPolicyVersion || '2026-09-12'})</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                {generateAdmissionWhatsAppUrl(
                  selectedAdmission.phone,
                  selectedAdmission.studentName,
                  selectedAdmission.applyingClass,
                  currentSchool.hindiName || currentSchool.name,
                  currentSchool.city
                ) && (
                  <a
                    href={
                      generateAdmissionWhatsAppUrl(
                        selectedAdmission.phone,
                        selectedAdmission.studentName,
                        selectedAdmission.applyingClass,
                        currentSchool.hindiName || currentSchool.name,
                        currentSchool.city
                      )!
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp संदेश</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold text-xs cursor-pointer"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      form="edit-admission-form"
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? 'सहेजा जा रहा है...' : 'अद्यतन सहेजें'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                      <span>संपादित करें</span>
                    </button>
                    {selectedAdmission.status !== 'Admitted' && (
                      <button
                        onClick={() => {
                          onApprove(selectedAdmission.id);
                          handleCloseDetail();
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>स्वीकृत कर नामांकित करें</span>
                      </button>
                    )}
                    <button
                      onClick={handleCloseDetail}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg font-bold text-xs cursor-pointer"
                    >
                      बंद करें
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminAdmissionsTab = React.memo(AdminAdmissionsTabComponent);
