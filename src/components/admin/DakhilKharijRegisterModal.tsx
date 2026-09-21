import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { SSM_CLASSES, type Student } from '../../types';
import {
  convertDateToHindiWords,
  formatDateDDMMYYYY,
  getScholarNumber,
  downloadDakhilKharijCSV
} from '../../utils/dakhilKharijExport';
import {
  Printer,
  Download,
  X,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DakhilKharijRegisterModalProps {
  onClose: () => void;
  onOpenTc?: (student: Student) => void;
}

export const DakhilKharijRegisterModal: React.FC<DakhilKharijRegisterModalProps> = ({
  onClose,
  onOpenTc
}) => {
  const { students, currentSchool } = useSchool();
  const { showSuccess } = useToast();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'WITHDRAWN'>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const isKharij = student.status === 'transferred' || student.status === 'alumni';
      if (statusFilter === 'ACTIVE' && isKharij) return false;
      if (statusFilter === 'WITHDRAWN' && !isKharij) return false;

      if (selectedClass !== 'ALL' && student.class !== selectedClass) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = student.name?.toLowerCase().includes(q);
        const matchesRoll = student.rollNo?.toLowerCase().includes(q);
        const matchesFather = student.fatherName?.toLowerCase().includes(q);
        const matchesPen = student.pen?.toLowerCase().includes(q);
        const matchesId = student.id?.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesFather && !matchesPen && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [students, statusFilter, selectedClass, searchQuery]);

  const totalEnrolled = students.filter(s => s.status !== 'transferred' && s.status !== 'alumni').length;
  const totalWithdrawn = students.filter(s => s.status === 'transferred' || s.status === 'alumni').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    downloadDakhilKharijCSV(filteredStudents, currentSchool);
    showSuccess('दाखिल-खारिज पंजिका CSV सफलतापूर्वक डाउनलोड हो गई है।');
  };

  return (
    <div className="printable-modal print-landscape fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl max-w-[96vw] w-full border border-stone-200 overflow-hidden flex flex-col my-2 max-h-[96vh] print:max-h-none print:h-auto print:shadow-none print:border-none print:w-full print:rounded-none print:p-0 print:m-0 print:overflow-visible">
        
        {/* Top Header & Controls Bar (Hidden in Print) */}
        <div className="bg-stone-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amber-200">
                  दाखिल-खारिज पंजिका (General Admission & Withdrawal Register)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  S.R. Register
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {currentSchool.name || currentSchool.hindiName} • UDISE: {currentSchool.udiseCode || '09510100101'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-semibold transition shadow-xs"
              title="Export Register to CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-green-400" />
              <span>Excel/CSV निर्यात</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              title="Print Register (Landscape)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF सेव करें</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition cursor-pointer"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar (Hidden in Print) */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 print:hidden shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Tabs */}
            <div className="inline-flex rounded-lg border border-stone-300 bg-white p-0.5 text-xs font-medium">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-md transition ${statusFilter === 'ALL' ? 'bg-stone-900 text-white font-bold' : 'text-stone-600 hover:text-stone-900'}`}
              >
                सभी ({students.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${statusFilter === 'ACTIVE' ? 'bg-emerald-700 text-white font-bold' : 'text-stone-600 hover:text-stone-900'}`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                <span>केवल दाखिल ({totalEnrolled})</span>
              </button>
              <button
                onClick={() => setStatusFilter('WITHDRAWN')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${statusFilter === 'WITHDRAWN' ? 'bg-amber-700 text-white font-bold' : 'text-stone-600 hover:text-stone-900'}`}
              >
                <AlertCircle className="w-3 h-3 text-amber-300" />
                <span>केवल खारिज/TC ({totalWithdrawn})</span>
              </button>
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-white font-medium text-stone-700 focus:ring-1 focus:ring-orange-500"
            >
              <option value="ALL">सभी कक्षाएं (All Classes)</option>
              {SSM_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-stone-400" />
            <input
              type="text"
              placeholder="खोजें (नाम, प्रवेश क्र., रोल नं.)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Scrollable Register Body */}
        <div className="flex-1 overflow-auto p-4 print:p-0 print:overflow-visible relative">
          
          {/* Certified Copy Watermark for Print & View */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] select-none z-0">
            <span className="text-6xl sm:text-9xl font-black font-serif uppercase tracking-widest text-stone-900 rotate-[-25deg]">
              प्रमाणित प्रति • विद्या भारती
            </span>
          </div>
          
          {/* Official Printable Header */}
          <div className="text-center mb-4 border-b-2 border-stone-800 pb-3">
            <div className="inline-block px-3 py-0.5 bg-orange-100 text-orange-900 font-bold text-[11px] rounded-full uppercase tracking-wider mb-1 border border-orange-300">
              विद्या भारती अखिल भारतीय शिक्षा संस्थान
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {currentSchool.hindiName || currentSchool.name}
            </h1>
            <p className="text-xs text-stone-600 font-medium mt-0.5">
              {currentSchool.address}, {currentSchool.city} ({currentSchool.state}) • UDISE कोड: {currentSchool.udiseCode || '09510100101'} • सम्बद्धता क्र.: {currentSchool.affiliationNo || 'VB-UP-8822'}
            </p>
            <div className="mt-2 inline-flex items-center gap-2 border-y-2 border-stone-900 px-6 py-1 bg-stone-100">
              <span className="font-extrabold text-sm sm:text-base text-stone-900 tracking-wide uppercase">
                दाखिल-खारिज पंजिका (GENERAL ADMISSION & WITHDRAWAL REGISTER)
              </span>
            </div>
          </div>

          {/* Summary Stats Strip for Print */}
          <div className="flex justify-between items-center text-[11px] text-stone-600 mb-2 px-1 font-semibold">
            <span>सत्र: 2025-26 | पंजिका संकाय: प्राथमिक से उच्चतर माध्यमिक</span>
            <span>कुल प्रविष्टियां: {filteredStudents.length} (दाखिल: {filteredStudents.filter(s => s.status !== 'transferred' && s.status !== 'alumni').length} | खारिज: {filteredStudents.filter(s => s.status === 'transferred' || s.status === 'alumni').length})</span>
          </div>

          {/* 16-Column Legal Register Table */}
          <div className="overflow-x-auto border border-stone-900 shadow-xs print:overflow-visible">
            <table className="w-full border-collapse text-[10.5px] leading-tight text-left">
              <thead>
                <tr className="bg-stone-900 text-white text-center font-bold">
                  <th className="border border-stone-700 px-1.5 py-2 w-8">क्र.सं.</th>
                  <th className="border border-stone-700 px-2 py-2 w-16">प्रवेश / एस.आर. क्र.</th>
                  <th className="border border-stone-700 px-2 py-2 w-16">प्रवेश दिनांक</th>
                  <th className="border border-stone-700 px-2 py-2 w-14">प्रवेशित कक्षा</th>
                  <th className="border border-stone-700 px-2.5 py-2 min-w-[120px]">विद्यार्थी का नाम</th>
                  <th className="border border-stone-700 px-2 py-2 min-w-[110px]">पिता का नाम</th>
                  <th className="border border-stone-700 px-2 py-2 min-w-[100px]">माता का नाम</th>
                  <th className="border border-stone-700 px-2 py-2 w-18">जन्म तिथि (अंकों में)</th>
                  <th className="border border-stone-700 px-2.5 py-2 min-w-[130px]">जन्म तिथि (शब्दों में - हिंदी)</th>
                  <th className="border border-stone-700 px-1.5 py-2 w-12">वर्ग</th>
                  <th className="border border-stone-700 px-2 py-2 min-w-[120px]">स्थायी पता व संपर्क</th>
                  <th className="border border-stone-700 px-2 py-2 w-16">वर्तमान स्थिति</th>
                  <th className="border border-stone-700 px-2 py-2 w-16">खारिज दिनांक</th>
                  <th className="border border-stone-700 px-2 py-2 min-w-[110px]">टी.सी. क्रमांक व कारण</th>
                  <th className="border border-stone-700 px-2 py-2 w-20 print:table-cell">प्रधानाचार्य हस्ताक्षर</th>
                  {onOpenTc && (
                    <th className="border border-stone-700 px-2 py-2 w-14 print:hidden">कार्य</th>
                  )}
                </tr>
                <tr className="bg-stone-200 text-stone-700 text-center font-mono text-[9px]">
                  <th className="border border-stone-400 py-0.5">1</th>
                  <th className="border border-stone-400 py-0.5">2</th>
                  <th className="border border-stone-400 py-0.5">3</th>
                  <th className="border border-stone-400 py-0.5">4</th>
                  <th className="border border-stone-400 py-0.5">5</th>
                  <th className="border border-stone-400 py-0.5">6</th>
                  <th className="border border-stone-400 py-0.5">7</th>
                  <th className="border border-stone-400 py-0.5">8</th>
                  <th className="border border-stone-400 py-0.5">9</th>
                  <th className="border border-stone-400 py-0.5">10</th>
                  <th className="border border-stone-400 py-0.5">11</th>
                  <th className="border border-stone-400 py-0.5">12</th>
                  <th className="border border-stone-400 py-0.5">13</th>
                  <th className="border border-stone-400 py-0.5">14</th>
                  <th className="border border-stone-400 py-0.5 print:table-cell">15</th>
                  {onOpenTc && <th className="border border-stone-400 py-0.5 print:hidden">16</th>}
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="text-center py-8 text-stone-500 font-medium">
                      कोई छात्र रिकॉर्ड नहीं मिला। कृपया फ़िल्टर जांचें।
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => {
                    const scholarNo = getScholarNumber(student, idx);
                    const dobFigures = formatDateDDMMYYYY(student.dob);
                    const dobWords = convertDateToHindiWords(student.dob);
                    const admDate = formatDateDDMMYYYY(student.admissionDate);
                    const isKharij = student.status === 'transferred' || student.status === 'alumni';

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-amber-50/50 transition border-b border-stone-300 ${
                          isKharij ? 'bg-stone-50/70 text-stone-600' : 'bg-white'
                        }`}
                      >
                        {/* 1. S.No. */}
                        <td className="border-r border-stone-300 px-1 py-1.5 text-center font-mono font-medium text-stone-500">
                          {idx + 1}
                        </td>

                        {/* 2. Scholar / SR No */}
                        <td className="border-r border-stone-300 px-1.5 py-1.5 text-center font-mono font-bold text-stone-900">
                          {scholarNo}
                        </td>

                        {/* 3. Admission Date */}
                        <td className="border-r border-stone-300 px-1.5 py-1.5 text-center font-mono">
                          {admDate || '-'}
                        </td>

                        {/* 4. Admission Class */}
                        <td className="border-r border-stone-300 px-1.5 py-1.5 text-center font-semibold">
                          {student.class}
                        </td>

                        {/* 5. Student Name & PEN */}
                        <td className="border-r border-stone-300 px-2 py-1.5 font-bold text-stone-900">
                          <div>{student.name}</div>
                          {student.pen && (
                            <div className="text-[9px] font-mono text-stone-400 font-normal">
                              PEN: {student.pen}
                            </div>
                          )}
                        </td>

                        {/* 6. Father's Name */}
                        <td className="border-r border-stone-300 px-2 py-1.5 text-stone-800">
                          {student.fatherName || '-'}
                        </td>

                        {/* 7. Mother's Name */}
                        <td className="border-r border-stone-300 px-2 py-1.5 text-stone-800">
                          {student.motherName || '-'}
                        </td>

                        {/* 8. DOB (Figures) */}
                        <td className="border-r border-stone-300 px-1.5 py-1.5 text-center font-mono font-medium">
                          {dobFigures || '-'}
                        </td>

                        {/* 9. DOB (Words in Hindi) */}
                        <td className="border-r border-stone-300 px-2 py-1.5 text-stone-700 italic">
                          {dobWords || '-'}
                        </td>

                        {/* 10. Social Category */}
                        <td className="border-r border-stone-300 px-1 py-1.5 text-center font-semibold text-stone-700">
                          {student.socialCategory || 'Gen'}
                        </td>

                        {/* 11. Address & Contact */}
                        <td className="border-r border-stone-300 px-2 py-1.5 text-stone-700 text-[9.5px]">
                          <div>{student.address || '-'}</div>
                          {student.contact && (
                            <div className="font-mono text-stone-500">📞 {student.contact}</div>
                          )}
                        </td>

                        {/* 12. Current Status */}
                        <td className="border-r border-stone-300 px-1.5 py-1.5 text-center">
                          {isKharij ? (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9.5px] border border-amber-300">
                              खारिज (TC)
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[9.5px] border border-emerald-300">
                              दाखिल
                            </span>
                          )}
                        </td>

                        {/* 13. Leaving Date */}
                        <td className="border-r border-stone-300 px-1.5 py-1.5 text-center font-mono text-stone-600">
                          {isKharij ? formatDateDDMMYYYY(new Date().toISOString()) : '-'}
                        </td>

                        {/* 14. TC Details & Reason */}
                        <td className="border-r border-stone-300 px-2 py-1.5 text-[9.5px]">
                          {isKharij ? (
                            <div>
                              <span className="font-mono font-bold text-stone-800">TC/{scholarNo}</span>
                              <div className="text-stone-500">अभिभावक स्थानांतरण / उच्च शिक्षा</div>
                            </div>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>

                        {/* 15. Principal Signature Box */}
                        <td className="border-r border-stone-300 px-2 py-1.5 text-center print:table-cell">
                          <div className="h-6 flex items-end justify-center">
                            <span className="text-[8px] text-stone-400 font-serif italic">हस्ताक्षर</span>
                          </div>
                        </td>

                        {/* 16. Action (TC link in UI) */}
                        {onOpenTc && (
                          <td className="px-1.5 py-1.5 text-center print:hidden">
                            <button
                              onClick={() => onOpenTc(student)}
                              className="px-2 py-1 bg-stone-100 hover:bg-orange-100 text-orange-700 hover:text-orange-900 rounded font-semibold text-[10px] transition border border-stone-200 cursor-pointer"
                              title="टी.सी. देखें अथवा जारी करें"
                            >
                              TC
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Formal Certification / Signatures Block for Print */}
          <div className="mt-8 pt-6 border-t-2 border-stone-800 grid grid-cols-3 gap-6 text-center text-xs font-bold text-stone-800">
            <div>
              <div className="h-10"></div>
              <div className="border-t border-stone-500 pt-1">
                प्रवेश लिपिक / पंजिका प्रभारी
                <div className="text-[10px] text-stone-500 font-normal">(हस्ताक्षर एवं दिनांक)</div>
              </div>
            </div>

            <div>
              <div className="h-10"></div>
              <div className="border-t border-stone-500 pt-1">
                कार्यालय अधीक्षक / उप-प्रधानाचार्य
                <div className="text-[10px] text-stone-500 font-normal">(हस्ताक्षर एवं दिनांक)</div>
              </div>
            </div>

            <div>
              <div className="h-10"></div>
              <div className="border-t border-stone-500 pt-1">
                प्रधानाचार्य / संस्था प्रधान
                <div className="text-[10px] text-stone-500 font-normal">
                  {currentSchool.hindiName || currentSchool.name} (सील एवं मुहर)
                </div>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="mt-4 text-center text-[9px] text-stone-400 font-serif">
            यह पंजिका विद्यालय का स्थायी वैधानिक अभिलेख है। इसमें किया गया प्रत्येक परिवर्तन केवल सक्षम अधिकारी के अनुमोदन पर ही मान्य है। © {new Date().getFullYear()} विद्या भारती संस्थान।
          </div>

        </div>

      </div>
    </div>
  );
};

