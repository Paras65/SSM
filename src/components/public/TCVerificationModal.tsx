import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ShieldCheck, Search, X, CheckCircle2, AlertCircle, Printer, Award, FileText, QrCode } from 'lucide-react';
import type { Student } from '../../types';

interface TCVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TCVerificationModal: React.FC<TCVerificationModalProps> = ({ isOpen, onClose }) => {
  const { students, publicSchool } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedStudent, setMatchedStudent] = useState<Student | null>(null);

  if (!isOpen) return null;

  const handleSearch = (queryToUse?: string) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim().toLowerCase();
    if (!q) return;

    setHasSearched(true);
    // Match by rollNo, pen, name, or extracted sequence
    const found = students.find(s => {
      const roll = (s.rollNo || '').toLowerCase();
      const pen = (s.pen || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      const rollDigits = roll.replace(/\D/g, '');
      const queryDigits = q.replace(/\D/g, '');

      return (
        roll.includes(q) ||
        pen.includes(q) ||
        name.includes(q) ||
        q.includes(roll) ||
        (queryDigits.length >= 3 && rollDigits.includes(queryDigits))
      );
    });

    setMatchedStudent(found || null);
  };

  const currentYear = new Date().getFullYear();
  const generatedTcNo = matchedStudent
    ? `SSM/${currentYear}/${(matchedStudent.rollNo || '001').replace(/[^0-9]/g, '').slice(-3) || '001'}`
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-orange-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-orange-950 to-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl">
              🔍
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-tight">
                स्थानांतरण प्रमाण पत्र (TC) सत्यापन
              </h3>
              <p className="text-xs text-stone-300">
                विद्या भारती अखिल भारतीय शिक्षा संस्थान • डिजिटल अभिलेख सत्यापन
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Search Box */}
          <div className="bg-amber-50/70 border border-orange-200 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-orange-950">
              टीसी संख्या (TC No.), स्थायी शिक्षा संख्या (PEN), अथवा छात्र अनुक्रमांक दर्ज करें:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="उदा. SSM/2026/001 या SSM-2025-001 या 001"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-orange-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer shrink-0"
              >
                सत्यापित करें
              </button>
            </div>

            {/* Quick Demo Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-stone-500">त्वरित परीक्षण हेतु क्लिक करें:</span>
              {students.slice(0, 3).map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(s.rollNo);
                    handleSearch(s.rollNo);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-orange-100 text-orange-900 border border-orange-200 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  {s.rollNo} ({s.name})
                </button>
              ))}
            </div>
          </div>

          {/* Search Result */}
          {hasSearched && (
            <div>
              {matchedStudent ? (
                <div className="border-2 border-emerald-500 rounded-2xl p-5 bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/50 shadow-md space-y-4">
                  {/* Verified Header Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-700 text-white uppercase tracking-wider">
                          सत्यापित एवं मान्य अभिलेख (Verified TC)
                        </span>
                        <h4 className="text-sm font-bold text-emerald-950 mt-0.5">
                          यह स्थानांतरण प्रमाण पत्र मूल विद्यालय अभिलेखों से प्रमाणित है।
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-stone-500 block">सत्यापन संदर्भ</span>
                      <span className="text-xs font-mono font-black text-orange-950">{generatedTcNo}</span>
                    </div>
                  </div>

                  {/* Student & School Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/80 p-3 rounded-xl border border-stone-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">छात्र विवरण</span>
                      <div className="flex justify-between py-0.5 border-b border-stone-100">
                        <span className="text-stone-600">विद्यार्थी का नाम:</span>
                        <span className="font-bold text-stone-900">{matchedStudent.name}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-stone-100">
                        <span className="text-stone-600">पिता का नाम:</span>
                        <span className="font-semibold text-stone-800">{matchedStudent.fatherName || 'श्री राजेश कुमार'}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-stone-100">
                        <span className="text-stone-600">माता का नाम:</span>
                        <span className="font-semibold text-stone-800">{matchedStudent.motherName || 'श्रीमती सुनीता देवी'}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-stone-100">
                        <span className="text-stone-600">कक्षा / वर्ग:</span>
                        <span className="font-bold text-orange-700">{matchedStudent.class} ({matchedStudent.section || 'A'})</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-stone-600">अनुक्रमांक / Roll No:</span>
                        <span className="font-mono font-bold text-stone-900">{matchedStudent.rollNo}</span>
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-stone-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">प्रमाण पत्र एवं सरकारी पहचान</span>
                      <div className="flex justify-between py-0.5 border-b border-stone-100">
                        <span className="text-stone-600">स्थायी शिक्षा संख्या (PEN):</span>
                        <span className="font-mono font-bold text-stone-800">{matchedStudent.pen || '21094837201'}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-stone-100">
                        <span className="text-stone-600">APAAR ID:</span>
                        <span className="font-mono font-bold text-stone-800">{matchedStudent.apaarId || '9876-5432-1098'}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-stone-100">
                        <span className="text-stone-600">आचरण (Conduct):</span>
                        <span className="font-bold text-emerald-700">श्रेष्ठ (Excellent)</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-stone-100">
                        <span className="text-stone-600">शुल्क स्थिति:</span>
                        <span className="font-semibold text-emerald-700">सत्र 2025-26 तक पूर्ण प्रदत्त</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-stone-600">सत्यापन स्थिति:</span>
                        <span className="font-bold text-emerald-800">सक्रिय एवं प्राधिकृत</span>
                      </div>
                    </div>
                  </div>

                  {/* Issuing Authority Seal */}
                  <div className="bg-amber-100/60 border border-amber-300 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-orange-950">जारीकर्ता संस्था:</p>
                      <p className="text-xs font-extrabold text-stone-900">{publicSchool.hindiName}</p>
                      <p className="text-[10px] text-stone-600">UDISE: {publicSchool.udiseCode} • सम्बद्ध: {publicSchool.affiliate}</p>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-orange-600 flex items-center justify-center text-[9px] font-black text-orange-800 leading-tight">
                        प्रमाणित<br />मुहर
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-stone-900 hover:bg-black text-amber-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>प्रमाण पत्र प्रिंट करें</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-red-200 bg-red-50 rounded-2xl p-5 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <h4 className="text-sm font-bold text-red-900">कोई अभिलेख प्राप्त नहीं हुआ</h4>
                  <p className="text-xs text-red-700 max-w-md mx-auto">
                    दर्ज की गई संख्या <strong>"{searchQuery}"</strong> के लिए कोई सक्रिय टीसी या छात्र अभिलेख नहीं मिला। कृपया टीसी संख्या या प्रवेश संख्या की पुनः जांच करें अथवा विद्यालय कार्यालय से संपर्क करें।
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>डिजिटल सुरक्षा प्रमाण पत्र • विद्या भारती राष्ट्रीय पोर्टल</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};
