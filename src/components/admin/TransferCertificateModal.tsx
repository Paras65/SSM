import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import type { Student } from '../../types';
import { Printer, X, Award, ShieldCheck, Download } from 'lucide-react';

interface TransferCertificateModalProps {
  student: Student;
  onClose: () => void;
}

export const TransferCertificateModal: React.FC<TransferCertificateModalProps> = ({
  student,
  onClose
}) => {
  const { currentSchool } = useSchool();
  const printRef = useRef<HTMLDivElement>(null);

  // TC dynamic details
  const [tcNumber] = useState(`SSM/${new Date().getFullYear()}/${student.rollNo.replace('SSM-2025-', '')}`);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [leavingReason, setLeavingReason] = useState('अभिभावक का स्थानांतरण (Parent Transfer)');
  const [conduct, setConduct] = useState<'उत्तम' | 'अति उत्तम' | 'श्रेष्ठ'>('श्रेष्ठ');
  const [totalDays, setTotalDays] = useState('224');
  const [presentDays, setPresentDays] = useState('212');
  const [duesCleared, setDuesCleared] = useState('हाँ, मार्च 2026 तक पूर्ण');
  const [promotedTo, setPromotedTo] = useState('अगली उच्च कक्षा हेतु योग्य (Promoted)');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-stone-200 overflow-hidden flex flex-col my-4 max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full">
        
        {/* Controls Bar (Hidden during print) */}
        <div className="bg-stone-900 text-white px-5 py-3 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                स्थानांतरण प्रमाण पत्र (Transfer Certificate / TC)
              </h3>
              <span className="text-[11px] text-stone-400">
                विद्या भारती मानक प्रारूप • छात्र: {student.name} ({student.rollNo})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF सेव करें</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Customization Options (Hidden during print) */}
        <div className="bg-amber-50/80 border-b border-amber-200 p-3 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs print:hidden shrink-0">
          <div>
            <label className="block text-[10px] font-bold text-amber-900 uppercase">जारी दिनांक</label>
            <input
              type="date"
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
              className="w-full bg-white border border-amber-300 rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-amber-900 uppercase">विद्यालय छोड़ने का कारण</label>
            <input
              type="text"
              value={leavingReason}
              onChange={e => setLeavingReason(e.target.value)}
              className="w-full bg-white border border-amber-300 rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-amber-900 uppercase">विद्यार्थी आचरण</label>
            <select
              value={conduct}
              onChange={e => setConduct(e.target.value as 'उत्तम' | 'अति उत्तम' | 'श्रेष्ठ')}
              className="w-full bg-white border border-amber-300 rounded px-2 py-1 text-xs"
            >
              <option value="श्रेष्ठ">श्रेष्ठ (Excellent)</option>
              <option value="अति उत्तम">अति उत्तम (Very Good)</option>
              <option value="उत्तम">उत्तम (Good)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-amber-900 uppercase">उपस्थिति (दिन)</label>
            <div className="flex gap-1">
              <input
                type="text"
                value={presentDays}
                onChange={e => setPresentDays(e.target.value)}
                placeholder="उपस्थित"
                className="w-1/2 bg-white border border-amber-300 rounded px-1.5 py-1 text-xs text-center"
              />
              <span className="self-center text-stone-400">/</span>
              <input
                type="text"
                value={totalDays}
                onChange={e => setTotalDays(e.target.value)}
                placeholder="कुल"
                className="w-1/2 bg-white border border-amber-300 rounded px-1.5 py-1 text-xs text-center"
              />
            </div>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div className="overflow-y-auto p-4 sm:p-8 print:p-0 flex justify-center bg-stone-100 print:bg-white">
          <div
            ref={printRef}
            className="w-full max-w-2xl bg-white border-[6px] border-double border-orange-800 p-6 sm:p-8 shadow-md relative print:shadow-none print:border-[4px] print:m-0"
          >
            {/* Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
              <span className="text-[140px] font-black text-orange-950">ॐ</span>
            </div>

            {/* Header / Emblem */}
            <div className="text-center relative pb-3 border-b-2 border-orange-800/60">
              <p className="text-xs font-bold tracking-widest text-orange-900 uppercase mb-1">
                ॥ सा विद्या या विमुक्तये ॥
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-orange-700 bg-orange-100 flex items-center justify-center text-2xl">
                  🪷
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-orange-950 tracking-tight">
                    {currentSchool.hindiName}
                  </h1>
                  <p className="text-xs font-semibold text-stone-700">
                    {currentSchool.affiliate} • {currentSchool.prant}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {currentSchool.address} • मान्यता कोड: {currentSchool.affiliationNo}
                  </p>
                </div>
              </div>
            </div>

            {/* Title Bar */}
            <div className="my-4 text-center">
              <span className="inline-block px-4 py-1 bg-orange-800 text-amber-100 font-bold text-sm tracking-wider uppercase rounded-sm shadow-xs">
                स्थानांतरण प्रमाण पत्र (TRANSFER CERTIFICATE)
              </span>
            </div>

            {/* Meta Top: TC No & Date */}
            <div className="flex justify-between items-center text-xs font-semibold text-stone-700 mb-4 pb-2 border-b border-stone-200">
              <div className="space-y-1">
                <div>
                  <span>क्रमांक (T.C. No.): </span>
                  <span className="font-mono font-bold text-orange-950">{tcNumber}</span>
                </div>
                <div>
                  <span>प्रवेश पंजिका क्रमांक (Scholar No.): </span>
                  <span className="font-mono font-bold text-stone-900">{student.rollNo}</span>
                </div>
                <div>
                  <span>दिनांक (Date): </span>
                  <span className="font-bold text-stone-900">{issueDate}</span>
                </div>
              </div>
              <div className="w-16 h-20 border border-stone-400 bg-stone-50 rounded flex items-center justify-center text-center overflow-hidden shrink-0">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] text-stone-400 leading-tight">छात्र फोटो<br/>(Photo)</span>
                )}
              </div>
            </div>

            {/* Body Fields */}
            <div className="space-y-2.5 text-xs text-stone-800 leading-relaxed">
              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">१. विद्यार्थी का नाम (Pupil's Name):</span>
                <span className="flex-1 font-bold text-stone-900 uppercase tracking-wide">{student.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-stone-100 rounded font-semibold text-stone-600">
                  {student.gender === 'Bhaiya' ? 'छात्र (भैया)' : 'छात्रा (बहिन)'}
                </span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">२. पिता / अभिभावक का नाम (Father's Name):</span>
                <span className="flex-1 font-semibold text-stone-900">{student.fatherName}</span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">३. माता का नाम (Mother's Name):</span>
                <span className="flex-1 font-semibold text-stone-900">{student.motherName || 'श्रीमती ' + student.fatherName.replace('श्री ', '')}</span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">४. राष्ट्रीयता (Nationality):</span>
                <span className="flex-1 font-semibold text-stone-900">भारतीय (Indian)</span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">५. जन्म तिथि (Date of Birth):</span>
                <span className="flex-1 font-semibold text-stone-900">
                  {student.dob || '15/07/2012'} (शब्दों में: पंद्रह जुलाई दो हज़ार बारह)
                </span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">६. प्रथम प्रवेश तिथि एवं कक्षा:</span>
                <span className="flex-1 font-semibold text-stone-900">
                  {student.admissionDate} (कक्षा: {student.class})
                </span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">७. अंतिम उत्तीर्ण / अध्ययनरत कक्षा:</span>
                <span className="flex-1 font-bold text-orange-950">
                  {student.class} - वर्ग '{student.section}'
                </span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">८. वार्षिक परीक्षा परिणाम (Result):</span>
                <span className="flex-1 font-semibold text-stone-900">{promotedTo}</span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">९. विद्यालय शुल्क अदायगी (School Dues):</span>
                <span className="flex-1 font-semibold text-green-800">{duesCleared}</span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">१०. कुल कार्य दिवस एवं उपस्थिति:</span>
                <span className="flex-1 font-semibold text-stone-900">
                  {presentDays} / {totalDays} दिवस ({Math.round((Number(presentDays) / Number(totalDays)) * 100)}%)
                </span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">११. सामान्य आचरण (General Conduct):</span>
                <span className="flex-1 font-bold text-orange-900">{conduct}</span>
              </div>

              <div className="flex items-baseline border-b border-dotted border-stone-300 pb-1">
                <span className="w-64 font-bold text-stone-700">१२. विद्यालय छोड़ने का कारण:</span>
                <span className="flex-1 font-semibold text-stone-900">{leavingReason}</span>
              </div>

              <div className="flex items-baseline pb-1">
                <span className="w-64 font-bold text-stone-700">१३. विशेष अभिरुचि / सह-पाठ्यक्रम:</span>
                <span className="flex-1 font-semibold text-stone-900">योग, घोष वादन एवं सुलेख में सक्रिय सहभागिता</span>
              </div>
            </div>

            {/* Certification Statement */}
            <div className="mt-5 p-2 bg-amber-50/50 rounded border border-amber-200 text-[11px] text-stone-700 italic text-center">
              प्रमाणित किया जाता है कि उपरोक्त विवरण विद्यालय की छात्र पंजिका (Student Register) के अनुसार पूर्णतः सत्य एवं प्रमाणित है।
            </div>

            {/* Signatures & Seal */}
            <div className="mt-10 pt-4 grid grid-cols-3 text-center text-xs font-bold text-stone-800">
              <div>
                <div className="h-10 flex items-end justify-center">
                  <span className="text-stone-400 font-normal italic text-[11px]">हस्ताक्षर</span>
                </div>
                <div className="border-t border-stone-400 pt-1">
                  लिपिक (Clerk)
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-dashed border-stone-300 flex items-center justify-center text-[10px] text-stone-400 mb-1">
                  विद्यालय मुहर (Seal)
                </div>
                <span className="text-[10px] text-stone-500 font-normal">कार्यालय मुहर</span>
              </div>

              <div>
                <div className="h-10 flex items-end justify-center">
                  <span className="text-orange-900 font-serif italic font-bold">{currentSchool.principalName}</span>
                </div>
                <div className="border-t border-stone-400 pt-1 text-orange-950 font-bold">
                  प्रधानाचार्य (Principal)
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

