import React from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { generateAdmissionWhatsAppUrl } from '../../../utils/whatsapp';
import {
  MessageSquare,
  Check,
  Trash2
} from 'lucide-react';

interface AdminAdmissionsTabProps {
  admissions: any[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AdminAdmissionsTab: React.FC<AdminAdmissionsTabProps> = ({
  admissions,
  onApprove,
  onDelete
}) => {
  const { currentSchool } = useSchool();

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            सत्र 2026-27 ऑनलाइन प्रवेश आवेदन समीक्षा (Admission Inquiries Review)
          </h3>
          <p className="text-xs text-stone-500">
            वेबसाइट के माध्यम से प्राप्त भैया-बहिनों के ऑनलाइन प्रवेश आवेदनों की समीक्षा करें एवं स्वीकृत कर सीधे छात्र पंजिका में जोड़ें।
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-amber-100 text-orange-950 font-bold text-xs rounded-lg">
            कुल आवेदन: {admissions.length}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-lg">
            नामांकित: {admissions.filter(a => a.status === 'Admitted').length}
          </span>
        </div>
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
            {admissions.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-stone-500">
                  कोई प्रवेश आवेदन लंबित नहीं है। वेबसाइट के प्रवेश फॉर्म से आवेदन प्राप्त होने पर यहाँ प्रदर्शित होंगे।
                </td>
              </tr>
            ) : (
              admissions.map(adm => (
                <tr key={adm.id} className="hover:bg-stone-50">
                  <td className="p-3 font-mono font-bold text-orange-900">{adm.regNo || adm.id}</td>
                  <td className="p-3 font-bold text-stone-900">{adm.studentName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        adm.gender === 'Bhaiya' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {adm.gender}
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
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {adm.status === 'Admitted' ? 'नामांकित (Enrolled)' : 'समीक्षाधीन (Pending)'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
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
                        title="Approve and enroll into Student Directory"
                      >
                        <Check className="w-3 h-3" />
                        <span>स्वीकृत करें</span>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(adm.id)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                      title="Delete Inquiry"
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
  );
};

