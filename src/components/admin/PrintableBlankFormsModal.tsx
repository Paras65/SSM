import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { Student, School } from '../../types';
import {
  Printer,
  X,
  Calendar,
  Filter,
  ArrowLeft
} from 'lucide-react';

interface PrintableBlankFormsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'admission' | 'attendance';
  students: Student[];
  school: School;
}

const MONTHS_HINDI = [
  'अप्रैल (April)',
  'मई (May)',
  'जुलाई (July)',
  'अगस्त (August)',
  'सितम्बर (September)',
  'अक्टूबर (October)',
  'नवम्बर (November)',
  'दिसम्बर (December)',
  'जनवरी (January)',
  'फरवरी (February)',
  'मार्च (March)'
];

export const PrintableBlankFormsModal: React.FC<PrintableBlankFormsModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  students,
  school
}) => {
  const [activeMode, setActiveMode] = useState<'admission' | 'attendance'>(initialMode);
  const classes = useMemo(() => Array.from(new Set(students.map(s => s.class))).sort(), [students]);
  const [selectedClass, setSelectedClass] = useState<string>(() => classes[0] || 'Class 8');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS_HINDI[0]);
  const [prefillStudents, setPrefillStudents] = useState(true);

  // Sorted students for attendance register
  const classStudents = useMemo(() => {
    return students
      .filter(s => s.class === selectedClass)
      .sort((a, b) => (parseInt(a.rollNo, 10) || 0) - (parseInt(b.rollNo, 10) || 0));
  }, [students, selectedClass]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-sm flex flex-col p-2 sm:p-6 print:static print:p-0 print:bg-white print:overflow-visible">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="no-print bg-stone-900 text-white rounded-2xl p-4 mb-4 shadow-xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            title="वापस जाएं (Back)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">वापस</span>
          </button>
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white text-lg shadow-xs shrink-0">
            📄
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-amber-100 flex items-center gap-2 truncate">
              <span>ऑफलाइन हार्ड-कॉपी सेतु (Printable Forms)</span>
            </h3>
            <p className="text-xs text-stone-400 truncate">
              A4 मानक मुद्रण योग्य रिक्त प्रवेश प्रपत्र एवं कक्षावार 31-दिवसीय उपस्थिति पंजिका
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-stone-800 p-0.5 border border-stone-700">
            <button
              type="button"
              onClick={() => setActiveMode('admission')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                activeMode === 'admission' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>📄 रिक्त प्रवेश प्रपत्र (A4)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('attendance')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                activeMode === 'attendance' ? 'bg-orange-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              <span>📋 31-दिवसीय उपस्थिति शीट</span>
            </button>
          </div>

          {/* Conditional Filters for Attendance Sheet */}
          {activeMode === 'attendance' && (
            <>
              {/* Class Selector */}
              <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
                <Filter className="w-3.5 h-3.5 text-orange-400" />
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {classes.map(cls => (
                    <option key={cls} value={cls} className="bg-stone-900 text-white">
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {MONTHS_HINDI.map(m => (
                    <option key={m} value={m} className="bg-stone-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prefill Toggle */}
              <label className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefillStudents}
                  onChange={e => setPrefillStudents(e.target.checked)}
                  className="accent-orange-600 rounded"
                />
                <span className="text-stone-300">नामांकित छात्र भरें</span>
              </label>
            </>
          )}

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>A4 प्रिंट / PDF सेव करें</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            title="बंद करें (Close)"
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet Canvas */}
      <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-2xl print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 print:max-w-none">
        
        {/* ============================================================== */}
        {/* MODE 1: BLANK ADMISSION FORM (A4 रिक्त प्रवेश आवेदन प्रपत्र) */}
        {/* ============================================================== */}
        {activeMode === 'admission' && (
          <div className="space-y-4 text-xs font-sans text-stone-900 print:text-black">
            {/* Sanskrit Vedic Header */}
            <div className="text-center border-b-2 border-stone-800 pb-3 relative">
              <p className="text-[11px] font-serif font-bold text-stone-600 tracking-widest uppercase">
                ।। श्री गणेशाय नमः ।। सा विद्या या विमुक्तये ।।
              </p>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                {school.hindiName || school.name}
              </h1>
              <p className="text-xs font-semibold text-stone-700">
                {school.address || 'सरस्वती शिशु मंदिर परिसर'} • संबंद्धता कोड: {school.affiliationNo || 'SSM-REG'} • UDISE: {school.udiseCode || '09510100101'}
              </p>
              <div className="inline-block mt-2 px-6 py-1 bg-amber-100 text-amber-950 font-black text-sm uppercase tracking-wider rounded-md border border-amber-300 print:bg-transparent print:border-stone-800">
                छात्र प्रवेश आवेदन पत्र (STUDENT ADMISSION APPLICATION FORM)
              </div>

              <div className="flex justify-between items-center text-xs font-bold text-stone-800 pt-2 px-1">
                <span>शैक्षणिक सत्र: <strong>{school.currentAcademicYear || '2025-26'}</strong></span>
                <span>आवेदन / प्रवेश पंजी सं. (SR No.): <strong>________________</strong></span>
                <span>आवेदन दिनांक: <strong>____/____/202__</strong></span>
              </div>

              {/* Passport Photo Box (Absolute on print / top right) */}
              <div className="absolute right-1 top-1 w-24 h-28 border-2 border-dashed border-stone-400 bg-stone-50 rounded-lg flex flex-col items-center justify-center text-center p-1 text-[9px] text-stone-400">
                <span className="text-xl mb-1">📸</span>
                <span>नवीनतम रंगीन फोटो चिपकाएं</span>
              </div>
            </div>

            {/* Target Class Box */}
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-300 flex items-center justify-between text-xs font-bold print:bg-transparent">
              <div className="flex items-center gap-4">
                <span>प्रवेश हेतु इच्छित कक्षा (Class): <strong>____________________</strong></span>
                <span>वर्ग (Section): <strong>[   ]</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <span>माध्यम: [ ] हिन्दी  [ ] अंग्रेजी</span>
                <span>छात्र श्रेणी: [ ] नवीन प्रवेश  [ ] पुनःप्रवेश</span>
              </div>
            </div>

            {/* Section 1: Student Details */}
            <div className="border border-stone-300 rounded-xl overflow-hidden print:rounded-none">
              <div className="bg-stone-100 px-3 py-1 font-black text-[11px] text-stone-800 uppercase border-b border-stone-300">
                १. विद्यार्थी का पूर्ण विवरण (Student Particulars)
              </div>
              <div className="p-3 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-600 block text-[10px]">विद्यार्थी का नाम (हिंदी में):</span>
                    <div className="border-b border-dotted border-stone-400 h-5"></div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">Name in English (CAPITAL LETTERS):</span>
                    <div className="border-b border-dotted border-stone-400 h-5"></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-stone-600 block text-[10px]">जन्म तिथि (Date of Birth):</span>
                    <div className="border-b border-dotted border-stone-400 h-5 font-mono">DD / MM / YYYY</div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">जन्म तिथि शब्दों में:</span>
                    <div className="border-b border-dotted border-stone-400 h-5"></div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">लिंग (Gender):</span>
                    <div className="flex gap-4 pt-1 font-bold">
                      <span>[  ] भैया (Boy)</span>
                      <span>[  ] बहिन (Girl)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <span className="text-stone-600 block text-[10px]">आधार संख्या (Aadhaar No):</span>
                    <div className="border-b border-dotted border-stone-400 h-5 font-mono">____ - ____ - ____</div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">APAAR ID (यदि उपलब्ध हो):</span>
                    <div className="border-b border-dotted border-stone-400 h-5 font-mono"></div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">रक्त समूह (Blood Group):</span>
                    <div className="border-b border-dotted border-stone-400 h-5 font-mono"></div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">जाति / संवर्ग:</span>
                    <div className="flex gap-2 pt-1 font-semibold text-[10px]">
                      <span>[ ] Gen</span>
                      <span>[ ] OBC</span>
                      <span>[ ] SC</span>
                      <span>[ ] ST</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Parents Particulars */}
            <div className="border border-stone-300 rounded-xl overflow-hidden print:rounded-none">
              <div className="bg-stone-100 px-3 py-1 font-black text-[11px] text-stone-800 uppercase border-b border-stone-300">
                २. माता-पिता एवं अभिभावक का विवरण (Parents / Guardian Details)
              </div>
              <div className="p-3 space-y-2.5 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-stone-600 block text-[10px]">पिता का नाम (Father's Name):</span>
                    <div className="border-b border-dotted border-stone-400 h-5"></div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">व्यवसाय (Occupation):</span>
                    <div className="border-b border-dotted border-stone-400 h-5"></div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">मोबाइल नंबर (WhatsApp No.):</span>
                    <div className="border-b border-dotted border-stone-400 h-5 font-mono">+91 </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-stone-600 block text-[10px]">माता का नाम (Mother's Name):</span>
                    <div className="border-b border-dotted border-stone-400 h-5"></div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">व्यवसाय / योग्यता:</span>
                    <div className="border-b border-dotted border-stone-400 h-5"></div>
                  </div>
                  <div>
                    <span className="text-stone-600 block text-[10px]">अभिभावक वैकल्पिक मोबाइल:</span>
                    <div className="border-b border-dotted border-stone-400 h-5 font-mono">+91 </div>
                  </div>
                </div>

                <div>
                  <span className="text-stone-600 block text-[10px]">स्थायी एवं पत्राचार का पता (Residential Address):</span>
                  <div className="border-b border-dotted border-stone-400 h-5"></div>
                </div>

                {/* Sibling Auto-fill bridge */}
                <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-200 text-[11px] print:bg-transparent">
                  <span className="font-bold text-amber-950 block">सहोदर भाई/बहन जो इसी विद्यालय में अध्ययनरत हैं (Sibling Fee Discount):</span>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div>नाम: ________________________</div>
                    <div>कक्षा व वर्ग: ________________</div>
                    <div>अनुक्रमांक (Roll): ___________</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Previous Schooling & Transport */}
            <div className="border border-stone-300 rounded-xl overflow-hidden print:rounded-none">
              <div className="bg-stone-100 px-3 py-1 font-black text-[11px] text-stone-800 uppercase border-b border-stone-300">
                ३. पूर्व विद्यालय एवं सुविधाएं (Previous School & Facilities)
              </div>
              <div className="p-3 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-stone-600 block text-[10px]">पूर्व विद्यालय का नाम:</span>
                  <div className="border-b border-dotted border-stone-400 h-5"></div>
                </div>
                <div>
                  <span className="text-stone-600 block text-[10px]">पूर्व उत्तीर्ण कक्षा एवं प्रतिशत:</span>
                  <div className="border-b border-dotted border-stone-400 h-5"></div>
                </div>
                <div>
                  <span className="text-stone-600 block text-[10px]">स्थानांतरण प्रमाण पत्र (TC):</span>
                  <div className="flex gap-3 pt-1 font-semibold">
                    <span>[ ] टी.सी. संलग्न है</span>
                    <span>[ ] 15 दिन में देय</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Undertaking & Signatures */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-300 text-[11px] space-y-2 print:bg-transparent">
              <p className="text-stone-700 italic">
                <strong>अभिभावक घोषणा:</strong> मैं प्रमाणित करता/करती हूँ कि आवेदन में दी गई समस्त जानकारी सत्य है। मैं विद्यालय एवं विद्या भारती के समस्त नियमों, दैनिक वंदना, गणवेश, मासिक शुल्क भुगतान एवं संस्कार अनुशासन का पूर्ण पालन करने का वचन देता/देती हूँ।
              </p>
              <div className="pt-6 grid grid-cols-3 gap-4 text-center font-bold text-xs text-stone-800">
                <div>
                  <div className="border-t border-stone-600 pt-1">
                    माता / पिता के हस्ताक्षर
                  </div>
                </div>
                <div>
                  <div className="border-t border-stone-600 pt-1">
                    जांचकर्ता / कार्यालय लिपिक
                  </div>
                </div>
                <div>
                  <div className="border-t border-stone-600 pt-1">
                    प्रधानाचार्य स्वीकृति हस्ताक्षर एवं सील
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: MONTHLY 31-DAY ATTENDANCE SHEET (31-दिवसीय उपस्थिति पंजिका) */}
        {/* ============================================================== */}
        {activeMode === 'attendance' && (
          <div className="space-y-3 text-xs font-sans text-stone-900 print:text-black">
            {/* Sanskrit Register Header */}
            <div className="text-center border-b-2 border-stone-800 pb-2 space-y-0.5">
              <p className="text-[10px] font-serif font-bold text-stone-600 tracking-widest uppercase">
                ।। श्री गणेशाय नमः ।। सा विद्या या विमुक्तये ।।
              </p>
              <h2 className="text-xl font-black text-stone-900 tracking-tight">
                {school.hindiName || school.name}
              </h2>
              <div className="inline-block px-4 py-0.5 bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider rounded border border-amber-300 print:bg-transparent print:border-stone-800">
                मासिक छात्र उपस्थिति पंजिका (MONTHLY ATTENDANCE REGISTER)
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-stone-800 pt-1 px-1">
                <span>कक्षा व वर्ग: <strong>{selectedClass}</strong></span>
                <span>माह (Month): <strong>{selectedMonth}</strong></span>
                <span>सत्र: <strong>{school.currentAcademicYear || '2025-26'}</strong></span>
                <span>कुल नामांकित छात्र: <strong>{classStudents.length}</strong></span>
              </div>
            </div>

            {/* 31-Day Attendance Grid */}
            <div className="border border-stone-400 overflow-x-auto print:overflow-visible">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-400 font-bold text-stone-800 text-center">
                    <th className="p-1 border-r border-stone-300 w-8">क्र.</th>
                    <th className="p-1 border-r border-stone-300 w-10">रोल</th>
                    <th className="p-1 border-r border-stone-300 text-left min-w-[130px]">विद्यार्थी का नाम</th>
                    <th className="p-1 border-r border-stone-300 text-left min-w-[100px]">पिता का नाम</th>
                    {/* Days 1 to 31 */}
                    {Array.from({ length: 31 }, (_, i) => (
                      <th key={i + 1} className="p-0.5 border-r border-stone-200 w-5 font-mono text-[9px]">
                        {i + 1}
                      </th>
                    ))}
                    <th className="p-1 border-r border-stone-300 w-7">P</th>
                    <th className="p-1 border-r border-stone-300 w-7">A</th>
                    <th className="p-1 border-r border-stone-300 w-7">L</th>
                    <th className="p-1 w-9">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {(prefillStudents && classStudents.length > 0 ? classStudents : Array.from({ length: 25 }, (_, idx) => ({
                    id: `blank-${idx}`,
                    rollNo: String(idx + 1),
                    name: '',
                    fatherName: '',
                    class: selectedClass,
                    section: 'A'
                  }))).map((st, idx) => (
                    <tr key={st.id} className="h-6 hover:bg-stone-50">
                      <td className="p-1 border-r border-stone-300 text-center font-mono text-stone-500">{idx + 1}</td>
                      <td className="p-1 border-r border-stone-300 text-center font-mono font-bold text-stone-900">{st.rollNo}</td>
                      <td className="p-1 border-r border-stone-300 font-bold text-stone-900 truncate max-w-[140px]">{st.name}</td>
                      <td className="p-1 border-r border-stone-300 text-stone-600 truncate max-w-[110px]">{st.fatherName}</td>
                      {/* Empty day check cells for marking */}
                      {Array.from({ length: 31 }, (_, dIdx) => (
                        <td key={dIdx} className="border-r border-stone-200 text-center font-mono text-[9px] p-0"></td>
                      ))}
                      <td className="border-r border-stone-300 text-center font-mono text-[9px]"></td>
                      <td className="border-r border-stone-300 text-center font-mono text-[9px]"></td>
                      <td className="border-r border-stone-300 text-center font-mono text-[9px]"></td>
                      <td className="text-center font-mono text-[9px]"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attendance Legend & Signatures */}
            <div className="pt-2 flex justify-between items-center text-[10px] text-stone-600 border-t border-stone-300">
              <div className="flex gap-3 font-semibold">
                <span>संकेत:</span>
                <span><strong>P</strong> = उपस्थित (Present)</span>
                <span><strong>A</strong> = अनुपस्थित (Absent)</span>
                <span><strong>L</strong> = स्वीकृत अवकाश (Leave)</span>
                <span><strong>R</strong> = रविवार / अवकाश</span>
              </div>
              <div className="font-mono text-stone-400">
                कुल कार्य दिवस: ________
              </div>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs font-bold text-stone-800">
              <div>
                <div className="border-t border-stone-600 pt-1">
                  कक्षाध्यापक हस्ताक्षर
                  <span className="block text-[10px] text-stone-500 font-normal">(Class Teacher)</span>
                </div>
              </div>
              <div>
                <div className="border-t border-stone-600 pt-1">
                  उपस्थिति प्रभारी
                  <span className="block text-[10px] text-stone-500 font-normal">(Attendance In-Charge)</span>
                </div>
              </div>
              <div>
                <div className="border-t border-stone-600 pt-1">
                  प्रधानाचार्य प्रतिहस्ताक्षर एवं सील
                  <span className="block text-[10px] text-stone-500 font-normal">(Principal Seal & Sign)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

