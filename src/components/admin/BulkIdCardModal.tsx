import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Student, School } from '../../types';
import { Printer, X, ShieldCheck, Filter, Users } from 'lucide-react';

interface BulkIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  school: School;
}

export const BulkIdCardModal: React.FC<BulkIdCardModalProps> = ({
  isOpen,
  onClose,
  students,
  school
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  if (!isOpen) return null;

  // Extract unique classes
  const classes = Array.from(new Set(students.map(s => s.class))).sort();

  const filteredStudents = selectedClass === 'ALL'
    ? students
    : students.filter(s => s.class === selectedClass);

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-sm flex flex-col p-2 sm:p-6 print:static print:p-0 print:bg-white print:overflow-visible">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-stone-900 text-white rounded-2xl p-4 mb-4 shadow-xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white text-lg">
            🪷
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-amber-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>कक्षावार परिचय पत्र (Bulk Student ID Cards Printing)</span>
            </h3>
            <p className="text-xs text-stone-400">
              A4 शीट पर मुद्रण हेतु अनुकूलित • 8 कार्ड प्रति पृष्ठ (Dashed कटिंग गाइड्स सहित)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-stone-900 text-white">समस्त कक्षाएं (All Classes)</option>
              {classes.map(cls => (
                <option key={cls} value={cls} className="bg-stone-900 text-white">{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/80 text-orange-300 border border-orange-800 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>कुल छात्र: {filteredStudents.length}</span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट करें (Print / Save PDF)</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Grid of ID Cards */}
      <div className="bg-stone-200/50 rounded-3xl p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full print:bg-white print:p-0 print:m-0 print:max-w-none">
        
        {filteredStudents.length === 0 ? (
          <div className="text-center py-20 text-stone-500 font-semibold bg-white rounded-2xl border border-stone-300">
            चयनित कक्षा में कोई छात्र नामांकित नहीं हैं।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 print:grid-cols-2 print:gap-3">
            {filteredStudents.map((std, idx) => (
              <div
                key={std.id}
                className="bg-white rounded-2xl border-2 border-dashed border-stone-300 overflow-hidden shadow-xs print:shadow-none print:border-dashed print:border-stone-400 flex flex-col justify-between break-inside-avoid print:mb-2"
                style={{ minHeight: '235px' }}
              >
                {/* ID Card Header */}
                <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-700 text-white p-2.5 flex items-center justify-between border-b-2 border-yellow-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white text-orange-700 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      🪷
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight leading-tight line-clamp-1">
                        {school.hindiName || school.name}
                      </h4>
                      <p className="text-[9px] text-yellow-200 uppercase tracking-wider font-semibold">
                        {school.prant} • विद्या भारती अखिल भारतीय शिक्षा संस्थान
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-black/30 font-bold font-mono">
                      सत्र {school.currentAcademicYear || '2025-26'}
                    </span>
                  </div>
                </div>

                {/* ID Card Body */}
                <div className="p-3 flex items-start gap-3 bg-gradient-to-b from-amber-50/20 to-white flex-1">
                  {/* Photo Placeholder */}
                  <div className="w-20 h-24 rounded-xl border-2 border-orange-300 bg-stone-100 flex flex-col items-center justify-center text-center shrink-0 p-1">
                    <span className="text-2xl mb-1">
                      {std.gender === 'Bahin' ? '👧' : '👦'}
                    </span>
                    <span className="text-[8px] font-bold text-stone-500 uppercase tracking-tighter">
                      फोटो (PHOTO)
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-[11px] leading-tight flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <strong className="text-xs sm:text-sm font-black text-stone-900 truncate">
                        {std.name}
                      </strong>
                      <span className="font-mono font-bold text-orange-800 bg-orange-100 px-1.5 py-0.2 rounded text-[10px] shrink-0">
                        अनु.: {std.rollNo}
                      </span>
                    </div>

                    <div className="text-stone-700 flex items-center gap-2">
                      <span>कक्षा: <strong className="text-stone-900">{std.class} - {std.section}</strong></span>
                      {std.bloodGroup && (
                        <span className="text-red-700 font-bold bg-red-50 px-1.5 py-0.2 rounded border border-red-200 text-[10px]">
                          रक्त: {std.bloodGroup}
                        </span>
                      )}
                    </div>

                    {std.fatherName && (
                      <div className="text-stone-600 truncate">
                        पिता: <span className="font-semibold text-stone-800">{std.fatherName}</span>
                      </div>
                    )}

                    {std.dob && (
                      <div className="text-stone-600">
                        जन्मतिथि: <span className="font-mono text-stone-800">{std.dob}</span>
                      </div>
                    )}

                    <div className="text-stone-600 truncate">
                      पता: <span className="text-stone-800">{std.address || school.city}</span>
                    </div>

                    <div className="text-stone-600">
                      आपातकालीन फोन: <strong className="text-stone-900 font-mono">{std.contact}</strong>
                    </div>
                  </div>
                </div>

                {/* ID Card Footer */}
                <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[9px] text-stone-600">
                  <div className="italic text-orange-950 font-serif font-semibold truncate max-w-[200px]">
                    "{school.tagline || 'सा विद्या या विमुक्तये'}"
                  </div>
                  <div className="text-right shrink-0">
                    <span className="border-t border-stone-800 pt-0.5 px-2 font-bold text-[9px] block text-stone-800">
                      प्रधानाचार्य हस्ताक्षर
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print styling helper */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

