import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import { generateAdmissionWhatsAppUrl } from '../../../utils/whatsapp';
import { exportAdmissionsToCSV } from '../../../utils/csvExport';
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
  X,
  Printer,
  Download,
  AlertTriangle,
  XCircle,
  Ban
} from 'lucide-react';

interface AdminAdmissionsTabProps {
  admissions: any[];
  onApprove: (id: string, options?: { section?: string; bloodGroup?: string; rollNo?: string }) => void;
  onReject?: (id: string, reason?: string) => void;
  onDelete: (id: string) => void;
}

const AdminAdmissionsTabComponent: React.FC<AdminAdmissionsTabProps> = ({
  admissions,
  onApprove,
  onReject,
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

  // Approval Modal state
  const [admissionToApprove, setAdmissionToApprove] = useState<any | null>(null);
  const [approveSection, setApproveSection] = useState('A');
  const [approveBloodGroup, setApproveBloodGroup] = useState('B+');
  const [approveRollNo, setApproveRollNo] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Rejection Modal state
  const [admissionToReject, setAdmissionToReject] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Delete confirmation & Slip print state
  const [admissionToDelete, setAdmissionToDelete] = useState<any | null>(null);
  const [slipAdmission, setSlipAdmission] = useState<any | null>(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Admitted' | 'Pending' | 'Rejected'>('ALL');

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
      if (selectedStatus === 'Pending' && (adm.status === 'Admitted' || adm.status === 'Rejected')) return false;
      if (selectedStatus === 'Rejected' && adm.status !== 'Rejected') return false;

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
    const rejected = filteredAdmissions.filter(a => a.status === 'Rejected').length;
    const pending = total - enrolled - rejected;
    const conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;
    return { total, enrolled, rejected, pending, conversionRate };
  }, [filteredAdmissions]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            सत्र {currentSchool.currentAcademicYear || '2026-27'} ऑनलाइन प्रवेश आवेदन समीक्षा (Admission Inquiries Review)
          </h3>
          <p className="text-xs text-stone-500">
            वेबसाइट के माध्यम से प्राप्त भैया-बहिनों के ऑनलाइन प्रवेश आवेदनों की समीक्षा करें एवं स्वीकृत कर सीधे छात्र पंजिका में जोड़ें।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAdmissionsToCSV(filteredAdmissions, currentSchool.hindiName || currentSchool.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            title="प्रवेश आवेदन सूची एक्सेल/CSV में डाउनलोड करें"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>आवेदन सूची CSV</span>
          </button>
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
            <span className="text-[10px] font-bold text-amber-700 uppercase">समीक्षाधीन (Pending)</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-800 mt-1">{stats.pending}</p>
          <span className="text-[11px] text-amber-700 font-medium">काउंसलिंग शेष</span>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">नामांकित छात्र (Enrolled)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-800 mt-1">{stats.enrolled}</p>
          <span className="text-[11px] text-emerald-700 font-medium">पंजिका में स्वीकृत</span>
        </div>

        <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase">अस्वीकृत (Rejected)</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-800 mt-1">{stats.rejected}</p>
          <span className="text-[11px] text-rose-700 font-medium">अस्वीकृत आवेदन</span>
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
          <option value="Rejected">अस्वीकृत (Rejected)</option>
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
                          : adm.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {adm.status === 'Admitted'
                        ? 'नामांकित (Enrolled)'
                        : adm.status === 'Rejected'
                        ? 'अस्वीकृत (Rejected)'
                        : 'समीक्षाधीन (Pending)'}
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
                    <button
                      onClick={() => setSlipAdmission(adm)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-[11px] shadow-2xs inline-flex items-center gap-1 cursor-pointer transition"
                      title="प्रवेश पावती पर्ची देखें एवं प्रिंट करें"
                    >
                      <Printer className="w-3 h-3 text-amber-700" />
                      <span>पावती</span>
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
                    {adm.status !== 'Admitted' && adm.status !== 'Rejected' && (
                      <>
                        <button
                          onClick={() => {
                            setAdmissionToApprove(adm);
                            setApproveSection('A');
                            setApproveBloodGroup('B+');
                            setApproveRollNo('');
                          }}
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[11px] shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          title="स्वीकृत कर सीधे छात्र पंजिका में नामांकित करें"
                        >
                          <Check className="w-3 h-3" />
                          <span>स्वीकृत करें</span>
                        </button>
                        {onReject && (
                          <button
                            onClick={() => {
                              setAdmissionToReject(adm);
                              setRejectReason('');
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded font-bold text-[11px] shadow-xs inline-flex items-center gap-1 cursor-pointer"
                            title="प्रवेश आवेदन अस्वीकृत करें"
                          >
                            <Ban className="w-3 h-3 text-rose-600" />
                            <span>अस्वीकृत</span>
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setAdmissionToDelete(adm)}
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
                          setAdmissionToApprove(selectedAdmission);
                          setApproveSection('A');
                          setApproveBloodGroup('B+');
                          setApproveRollNo('');
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

      {/* 1. Admission Approval Customization Modal */}
      {admissionToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <h3 className="text-base font-bold">प्रवेश स्वीकृति एवं कक्षा आवंटन</h3>
              </div>
              <button
                onClick={() => setAdmissionToApprove(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <p className="font-bold text-emerald-950 text-sm">{admissionToApprove.studentName}</p>
                <p className="text-emerald-800 mt-0.5">
                  आवेदित कक्षा: <strong>{admissionToApprove.applyingClass}</strong> • पंजीकरण: <span className="font-mono">{admissionToApprove.regNo || admissionToApprove.id}</span>
                </p>
                <p className="text-stone-600 mt-1">अभिभावक: {admissionToApprove.fatherName || '—'} ({admissionToApprove.phone})</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">वर्ग (Section)*</label>
                  <select
                    value={approveSection}
                    onChange={e => setApproveSection(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="A">Section A (अ)</option>
                    <option value="B">Section B (ब)</option>
                    <option value="C">Section C (स)</option>
                    <option value="D">Section D (द)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">रक्त समूह (Blood Group)</label>
                  <select
                    value={approveBloodGroup}
                    onChange={e => setApproveBloodGroup(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="B+">B+ (बी पॉजिटिव)</option>
                    <option value="A+">A+ (ए पॉजिटिव)</option>
                    <option value="O+">O+ (ओ पॉजिटिव)</option>
                    <option value="AB+">AB+ (एबी पॉजिटिव)</option>
                    <option value="B-">B- (बी नेगेटिव)</option>
                    <option value="A-">A- (ए नेगेटिव)</option>
                    <option value="O-">O- (ओ नेगेटिव)</option>
                    <option value="AB-">AB- (एबी नेगेटिव)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  अनुक्रमांक / Roll Number <span className="text-stone-400 font-normal">(खाली छोड़ने पर स्वतः क्रमिक आवंटित होगा)</span>
                </label>
                <input
                  type="text"
                  value={approveRollNo}
                  onChange={e => setApproveRollNo(e.target.value)}
                  placeholder="उदा. 101, 102 या स्वतः (Auto)"
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <p className="text-[11px] text-stone-500 italic">
                💡 स्वीकृति उपरांत छात्र स्वतः छात्र पंजिका (Student Register) में नामांकित हो जाएगा एवं पोर्टल क्रेडेंशियल्स सृजित होंगे।
              </p>
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdmissionToApprove(null)}
                className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-lg transition cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={isApproving}
                onClick={async () => {
                  try {
                    setIsApproving(true);
                    await onApprove(admissionToApprove.id, {
                      section: approveSection,
                      bloodGroup: approveBloodGroup,
                      rollNo: approveRollNo
                    });
                    setAdmissionToApprove(null);
                  } finally {
                    setIsApproving(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition shadow cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isApproving ? 'स्वीकृत कर रहे हैं...' : 'स्वीकृत कर पंजिका में जोड़ें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Admission Rejection Modal */}
      {admissionToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-700 to-red-700 text-white">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-200" />
                <h3 className="text-base font-bold">प्रवेश आवेदन अस्वीकृत करें</h3>
              </div>
              <button
                onClick={() => setAdmissionToReject(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
                <p className="font-bold text-rose-950 text-sm">{admissionToReject.studentName}</p>
                <p className="text-rose-800 mt-0.5">
                  आवेदित कक्षा: <strong>{admissionToReject.applyingClass}</strong> • पंजीकरण: <span className="font-mono">{admissionToReject.regNo || admissionToReject.id}</span>
                </p>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  अस्वीकृति का कारण (Rejection Reason) <span className="text-stone-400 font-normal">(वैकल्पिक)</span>
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="उदा. कक्षा में सीटें पूर्ण / अपूर्ण दस्तावेज / अमान्य आयु"
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <p className="text-[11px] text-stone-500">
                ⚠️ आवेदन को अस्वीकृत करने पर यह पंजिका में नहीं जुड़ेगा और ऑडिट ट्रेल में सुरक्षित रहेगा।
              </p>
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdmissionToReject(null)}
                className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-lg transition cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={isRejecting}
                onClick={async () => {
                  if (onReject) {
                    try {
                      setIsRejecting(true);
                      await onReject(admissionToReject.id, rejectReason);
                      setAdmissionToReject(null);
                    } finally {
                      setIsRejecting(false);
                    }
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition shadow cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>{isRejecting ? 'प्रक्रियाधीन...' : 'आवेदन अस्वीकृत करें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Custom Delete Confirmation Modal */}
      {admissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-700 to-rose-700 text-white">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">प्रवेश आवेदन हटाने की पुष्टि</h3>
              </div>
              <button
                onClick={() => setAdmissionToDelete(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-xs text-stone-700 space-y-3">
              <p className="text-sm">
                क्या आप वास्तव में छात्र <strong className="text-stone-900">{admissionToDelete.studentName}</strong> (पंजीकरण सं: <span className="font-mono font-bold text-red-700">{admissionToDelete.regNo || admissionToDelete.id}</span>) का प्रवेश आवेदन हटाना चाहते हैं?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px]">
                यह क्रिया अपरिवर्तनीय है। यह आवेदन स्थायी रूप से डेटाबेस से हट जाएगा।
              </div>
            </div>
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdmissionToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-200 hover:bg-stone-300 rounded-lg transition cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(admissionToDelete.id);
                  setAdmissionToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg transition shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>हटाएं (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Printable Admission Acknowledgement Slip Modal */}
      {slipAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150 print:max-h-none print:shadow-none print:border-none print:overflow-visible print:w-full">
            {/* Screen Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-800 via-amber-800 to-stone-800 text-white print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-bold">ऑनलाइन प्रवेश पंजीकरण पावती पर्ची</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold transition shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिंट करें</span>
                </button>
                <button
                  onClick={() => setSlipAdmission(null)}
                  className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-6 md:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible text-stone-900">
              <div className="border-2 border-orange-800 rounded-xl p-6 bg-amber-50/20 relative">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                  <span className="text-8xl font-black text-orange-950 rotate-[-25deg]">विद्या भारती</span>
                </div>

                {/* Header */}
                <div className="text-center border-b-2 border-orange-800 pb-3 mb-4">
                  <p className="text-xs font-bold text-orange-800 tracking-wider">
                    ॥ {currentSchool.tagline || 'सा विद्या या विमुक्तये'} ॥
                  </p>
                  <h2 className="text-xl md:text-2xl font-black text-stone-950 mt-1">
                    {currentSchool.hindiName || currentSchool.name}
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {currentSchool.address} • दूरभाष: {currentSchool.phone}
                  </p>
                  <p className="text-[11px] font-semibold text-orange-700 mt-0.5">
                    {currentSchool.affiliate} • सम्बद्धता सं.: {currentSchool.affiliationNo}
                  </p>
                  <div className="mt-2 inline-block bg-orange-800 text-amber-100 text-xs font-bold px-4 py-0.5 rounded-full uppercase tracking-wider">
                    ऑनलाइन प्रवेश आवेदन पावती पर्ची (Admission Acknowledgement Slip) — सत्र {currentSchool.currentAcademicYear || '2026-27'}
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-white p-3 rounded-lg border border-orange-200 text-xs mb-4">
                  <div>
                    <span className="text-stone-500 block">पंजीकरण संख्या:</span>
                    <strong className="text-orange-950 font-mono text-xs">{slipAdmission.regNo || slipAdmission.id}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">आवेदन तिथि:</span>
                    <strong className="text-stone-900">{slipAdmission.submissionDate || (slipAdmission.createdAt ? new Date(slipAdmission.createdAt).toISOString().split('T')[0] : '—')}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">आवेदित कक्षा:</span>
                    <strong className="text-orange-900 font-bold">{slipAdmission.applyingClass}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">वर्तमान स्थिति:</span>
                    <span className="font-bold text-emerald-800">
                      {slipAdmission.status === 'Admitted' ? 'नामांकित (Admitted)' : slipAdmission.status === 'Rejected' ? 'अस्वीकृत (Rejected)' : 'समीक्षाधीन (Pending)'}
                    </span>
                  </div>
                </div>

                {/* Student & Guardian Info */}
                <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-100 text-xs mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 p-2.5 gap-2">
                    <div>
                      <span className="text-stone-500">छात्र / छात्रा का नाम: </span>
                      <strong className="text-stone-900">{slipAdmission.studentName}</strong> ({slipAdmission.gender === 'Bhaiya' ? 'भैया' : 'बहिन'})
                    </div>
                    <div>
                      <span className="text-stone-500">मोबाइल नंबर: </span>
                      <strong className="text-stone-900 font-mono">{slipAdmission.phone}</strong>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 p-2.5 gap-2">
                    <div>
                      <span className="text-stone-500">पिता का नाम: </span>
                      <strong className="text-stone-900">{slipAdmission.fatherName || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500">माता का नाम: </span>
                      <strong className="text-stone-900">{slipAdmission.motherName || '—'}</strong>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <span className="text-stone-500">स्थाई पता: </span>
                    <span className="text-stone-800 font-medium">{slipAdmission.address || '—'}</span>
                  </div>
                </div>

                {/* Instructions & Required Documents Checklist */}
                <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200 text-[11px] mb-6 space-y-1.5">
                  <p className="font-bold text-orange-950">📋 सत्यापन हेतु आवश्यक मूल अभिलेख (Verification Checklist):</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-stone-700 list-disc list-inside">
                    <li>पूर्व विद्यालय का स्थानांतरण प्रमाण पत्र (TC - Original)</li>
                    <li>जन्म प्रमाण पत्र / नगर निगम प्रमाण पत्र (Birth Certificate)</li>
                    <li>छात्र एवं अभिभावक के आधार कार्ड की छायाप्रति</li>
                    <li>विद्यार्थी की 4 नवीनतम पासपोर्ट साइज फोटो</li>
                  </ul>
                  <p className="text-[10px] text-stone-500 pt-1 border-t border-orange-200">
                    डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP Act 2023) के अंतर्गत अभिभावक की सहमति प्राप्त एवं डिजिटल रूप से प्रमाणित है।
                  </p>
                </div>

                {/* Signature Blocks */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-stone-300 text-center text-xs">
                  <div>
                    <div className="h-8"></div>
                    <p className="border-t border-dashed border-stone-400 pt-1 text-stone-600 font-medium">
                      हस्ताक्षर अभिभावक
                    </p>
                  </div>
                  <div>
                    <div className="h-8"></div>
                    <p className="border-t border-dashed border-stone-400 pt-1 text-stone-600 font-medium">
                      प्रवेश प्रभारी
                    </p>
                  </div>
                  <div>
                    <div className="h-8 flex items-center justify-center">
                      <span className="text-[9px] text-orange-800 font-bold border border-orange-600 px-1.5 py-0.2 rounded">
                        सील / SEAL
                      </span>
                    </div>
                    <p className="border-t border-dashed border-stone-400 pt-1 text-stone-900 font-bold">
                      {currentSchool.principalName || 'प्रधानाचार्य'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen Footer */}
            <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setSlipAdmission(null)}
                className="px-4 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition cursor-pointer"
              >
                बंद करें
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-orange-700 hover:bg-orange-800 rounded-lg transition shadow cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रिंट पावती (Print Slip)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminAdmissionsTab = React.memo(AdminAdmissionsTabComponent);
