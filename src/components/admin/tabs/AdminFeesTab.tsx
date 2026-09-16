import React from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { exportFeesToCSV } from '../../../utils/csvExport';
import type { Student, FeeRecord } from '../../../types';
import {
  Download,
  Lock,
  MessageSquare,
  Printer,
  Trash2
} from 'lucide-react';

interface WhatsAppAlertPayload {
  title: string;
  recipientName: string;
  recipientPhone: string;
  studentClass: string;
  defaultMessage: string;
}

interface AdminFeesTabProps {
  totalFeeCollected: number;
  totalFeePending: number;
  requirePro: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
  onOpenFeeModal: (modal: { fee: FeeRecord; student: Student }) => void;
  onOpenWhatsAppAlert: (payload: WhatsAppAlertPayload) => void;
}

export const AdminFeesTab: React.FC<AdminFeesTabProps> = ({
  totalFeeCollected,
  totalFeePending,
  requirePro,
  onOpenFeeModal,
  onOpenWhatsAppAlert
}) => {
  const { students, currentSchool, feeRecords, markFeePaid, deleteFeeRecord } = useSchool();
  const isPro = currentSchool.plan === 'pro';

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            शुल्क प्रबंधन एवं रसीद निर्गमन (Fee Management & Receipts)
          </h3>
          <p className="text-xs text-stone-500">
            मासिक एवं त्रैमासिक शिक्षण शुल्क, क्रीड़ा निधि, एवं रसीद प्रिंटिंग
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => {
              requirePro(
                'शुल्क रजिस्टर CSV / Excel डेटा निर्यात',
                'समस्त छात्र शुल्क, भुगतान स्थिति एवं बकाया विवरण का एक्सेल बैकअप केवल प्रो योजना में उपलब्ध है।',
                () => exportFeesToCSV(feeRecords, students)
              );
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            title="Export Fee Register to CSV"
          >
            <Download className="w-3.5 h-3.5 text-green-400" />
            <span>शुल्क CSV निर्यात</span>
            {!isPro && <Lock className="w-2.5 h-2.5 text-amber-300 ml-0.5" />}
          </button>
          <div className="p-2.5 bg-green-50 rounded-xl border border-green-200 text-green-950 font-semibold">
            कुल प्राप्त: ₹ {totalFeeCollected.toLocaleString()}
          </div>
          <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-950 font-semibold">
            कुल बकाया: ₹ {totalFeePending.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
            <tr>
              <th className="p-3">छात्र का नाम</th>
              <th className="p-3">कक्षा</th>
              <th className="p-3">शुल्क अवधि</th>
              <th className="p-3">देय राशि</th>
              <th className="p-3">प्राप्त राशि</th>
              <th className="p-3">स्थिति</th>
              <th className="p-3">रसीद संख्या</th>
              <th className="p-3 text-right">कार्य</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {feeRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-stone-500">
                  इस शाखा में अभी कोई शुल्क रिकॉर्ड उपलब्ध नहीं है।
                </td>
              </tr>
            ) : (
              feeRecords.map(fee => {
                const student = students.find(s => s.id === fee.studentId);
                if (!student) return null;

                return (
                  <tr key={fee.id} className="hover:bg-stone-50">
                    <td className="p-3 font-semibold text-stone-900">
                      {student.name}
                    </td>
                    <td className="p-3 text-stone-600">{student.class}</td>
                    <td className="p-3 text-stone-700">{fee.term}</td>
                    <td className="p-3 font-bold text-stone-900">₹ {fee.totalAmount}</td>
                    <td className="p-3 font-bold text-green-700">₹ {fee.paidAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          fee.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : fee.status === 'Partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {fee.status === 'Paid' ? 'पूर्ण भुगतान' : fee.status === 'Partial' ? 'आंशिक' : 'लंबित'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-stone-600">
                      {fee.receiptNo || '—'}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      {fee.status !== 'Paid' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const pendingAmount = fee.totalAmount - fee.paidAmount;
                              requirePro(
                                'शुल्क अनुस्मारक व्हाट्सएप अलर्ट (WhatsApp Alerts)',
                                'शुल्क बकाया अनुस्मारक सीधे अभिभावक के व्हाट्सएप पर भेजना केवल प्रो योजना में उपलब्ध है।',
                                () => {
                                  onOpenWhatsAppAlert({
                                    title: 'शुल्क अनुस्मारक WhatsApp अलर्ट',
                                    recipientName: student.name,
                                    recipientPhone: student.contact,
                                    studentClass: student.class,
                                    defaultMessage: `🚩 *सादर नमस्ते जी* 🚩\n*${currentSchool.hindiName || currentSchool.name}*\n--------------------------------\n*शिक्षण शुल्क अनुस्मारक सूचना:*\nअभिभावक जी, आपके पाल्य/पाल्या *${student.name}* (कक्षा: ${student.class}) का *${fee.term}* का शुल्क देय है:\n\n💰 *देय धनराशि:* ₹${pendingAmount.toLocaleString('en-IN')}\n\nकृपया ससमय विद्यालय कार्यालय अथवा ऑनलाइन माध्यम से शुल्क जमा कर अधिकृत रसीद प्राप्त करें।\n\nसहयोग हेतु आभार!\n— लेखा विभाग, ${currentSchool.hindiName || currentSchool.name}`
                                  });
                                }
                              );
                            }}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition cursor-pointer"
                            title="Send Fee Reminder WhatsApp Alert"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-700" />
                            <span>WhatsApp अलर्ट</span>
                            {!isPro && <Lock className="w-2.5 h-2.5 text-emerald-700 ml-0.5" />}
                          </button>
                          <button
                            onClick={() => {
                              markFeePaid(fee.id, 'Online UPI');
                              const updatedStudent = students.find(s => s.id === fee.studentId);
                              if (updatedStudent) {
                                onOpenFeeModal({
                                  fee: {
                                    ...fee,
                                    paidAmount: fee.totalAmount,
                                    status: 'Paid',
                                    paidDate: new Date().toISOString().split('T')[0],
                                    receiptNo:
                                      fee.receiptNo ||
                                      `SSM-REC-${new Date().getFullYear()}-${(currentSchool.id || 'SSM')
                                        .slice(-4)
                                        .toUpperCase()}-${Date.now().toString().slice(-6)}`
                                  },
                                  student: updatedStudent
                                });
                              }
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-[11px] shadow-xs cursor-pointer"
                          >
                            शुल्क जमा करें (Pay)
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenFeeModal({ fee, student })}
                          className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold text-[11px] flex items-center gap-1 inline-flex cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>रसीद देखें / प्रिंट</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `क्या आप ${student.name} का ${fee.term} का शुल्क रिकॉर्ड स्थायी रूप से हटाना चाहते हैं?`
                            )
                          ) {
                            deleteFeeRecord(fee.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded transition inline-flex items-center cursor-pointer"
                        title="शुल्क रिकॉर्ड हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

