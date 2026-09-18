import React from 'react';
import type { Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Printer, X, Award, ShieldCheck, QrCode } from 'lucide-react';

interface StudentIdCardModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({ student, onClose }) => {
  const { currentSchool } = useSchool();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-orange-300 print:shadow-none print:border-none print:w-auto print:max-w-none">
        
        {/* Action Header */}
        <div className="no-print bg-gradient-to-r from-orange-800 to-amber-700 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-yellow-300" />
            <span>छात्र परिचय पत्र (Student ID Card)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-white text-orange-900 hover:bg-orange-50 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें (Print)</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-orange-900 text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable ID Card Body */}
        <div className="p-6 bg-stone-100 flex justify-center print:bg-white print:p-0">
          
          <div className="w-80 bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-600 relative">
            
            {/* Top School Header */}
            <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-700 text-white text-center py-3 px-3 relative">
              <div className="flex items-center justify-center gap-2 mb-0.5">
                <span className="text-2xl">🪷</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black tracking-tight leading-tight line-clamp-1">
                    {currentSchool.hindiName}
                  </h3>
                  <p className="text-[8px] uppercase tracking-wider text-amber-200">
                    {currentSchool.prant} • Vidya Bharati
                  </p>
                </div>
              </div>
              <p className="text-[8px] text-orange-100 italic">
                "{currentSchool.tagline}" • सत्र 2025-26
              </p>
              <div className="bg-orange-950 text-amber-300 text-[9px] font-bold uppercase tracking-wider py-0.5 mt-1 rounded">
                छात्र परिचय पत्र • IDENTITY CARD
              </div>
            </div>

            {/* Student Details & Photo */}
            <div className="p-4 space-y-3 text-stone-800 text-xs">
              
              <div className="flex items-center gap-3">
                <div className="w-20 h-24 bg-gradient-to-tr from-amber-200 to-orange-200 rounded-xl border-2 border-orange-400 p-0.5 flex flex-col items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <span className="text-4xl">
                        {student.gender === 'Bhaiya' ? '👦' : '👧'}
                      </span>
                      <span className="text-[9px] font-bold text-orange-900 mt-1 uppercase">
                        {student.gender}
                      </span>
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-black text-stone-900 leading-tight">
                    {student.name}
                  </h4>
                  <div className="text-[11px] text-orange-800 font-bold">
                    कक्षा: {student.class} '{student.section}'
                  </div>
                  <div className="text-[10px] text-stone-600">
                    अनुक्रमांक (Roll): <strong className="text-stone-900">{student.rollNo}</strong>
                  </div>
                  <div className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold text-[10px] border border-red-200">
                    रक्त समूह: {student.bloodGroup}
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/60 p-2.5 rounded-xl border border-orange-200 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-stone-500">पिता का नाम:</span>
                  <span className="font-semibold text-stone-900">{student.fatherName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">जन्म तिथि:</span>
                  <span className="font-semibold text-stone-900">{student.dob || '2012-04-15'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">आपातकालीन संपर्क:</span>
                  <span className="font-bold text-orange-900">{student.contact}</span>
                </div>
                {student.pen && (
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-stone-500">PEN:</span>
                    <span className="font-bold text-emerald-800">{student.pen}</span>
                  </div>
                )}
                {student.apaarId && (
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-stone-500">APAAR ID:</span>
                    <span className="font-bold text-blue-800">{student.apaarId}</span>
                  </div>
                )}
                <div className="text-[10px] text-stone-600 pt-0.5 border-t border-orange-200 truncate">
                  पता: {student.address || currentSchool.address}
                </div>
              </div>


              {/* Barcode & Signature */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 font-mono tracking-widest text-stone-800 text-[10px]">
                    ||||| | |||| || | |||
                  </div>
                  <span className="text-[8px] text-stone-500 block">ID: {student.id}</span>
                </div>

                <div className="text-center">
                  <div className="text-[9px] font-serif italic text-orange-800">
                    हस्ताक्षर
                  </div>
                  <div className="text-[8px] font-bold text-stone-600 border-t border-stone-400 pt-0.5">
                    प्रधानाचार्य
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Color Bar */}
            <div className="h-2 bg-gradient-to-r from-orange-600 via-amber-500 to-red-600" />

          </div>

        </div>

      </div>
    </div>
  );
};

