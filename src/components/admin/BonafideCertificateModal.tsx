import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import type { Student } from '../../types';
import { Printer, X } from 'lucide-react';

interface BonafideCertificateModalProps {
  student: Student;
  onClose: () => void;
}

export const BonafideCertificateModal: React.FC<BonafideCertificateModalProps> = ({ student, onClose }) => {
  const { currentSchool } = useSchool();

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 relative my-6">
        {/* Action Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                अध्ययनरत प्रमाण पत्र (Bonafide Student Certificate)
              </h3>
              <p className="text-[11px] text-stone-500">
                {student.name} • {student.class} ({student.rollNo})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>प्रमाण पत्र प्रिंट करें</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate */}
        <div className="mt-4 p-8 sm:p-12 bg-amber-50/20 border-8 border-double border-orange-800 rounded-2xl relative">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-9xl font-serif font-black text-orange-950">SSM</span>
          </div>

          {/* Header */}
          <div className="text-center space-y-1 pb-6 border-b-2 border-orange-800">
            <div className="flex justify-between items-center text-[10px] font-bold text-orange-900 uppercase">
              <span>संबद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान</span>
              <span>प्रमाण पत्र क्र.: BON/{new Date().getFullYear()}/{student.rollNo}</span>
            </div>
            <div className="text-3xl font-serif text-orange-800">ॐ</div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif tracking-wide">
              {currentSchool.hindiName}
            </h1>
            <p className="text-xs font-semibold text-stone-600">
              {currentSchool.address}, {currentSchool.city} ({currentSchool.prant})
            </p>
            <div className="pt-3">
              <span className="px-6 py-1 rounded-full bg-orange-900 text-amber-100 font-bold text-sm tracking-widest uppercase inline-block font-serif shadow-xs">
                अध्ययनरत प्रमाण पत्र (BONAFIDE CERTIFICATE)
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="py-8 space-y-6 text-sm text-stone-800 leading-loose">
            <p className="text-justify indent-8">
              प्रमाणित किया जाता है कि <strong>{student.gender === 'Bhaiya' ? 'भैया' : 'बहिन'} {student.name}</strong>, सुपुत्र/सुपुत्री श्री <strong>{student.fatherName}</strong> एवं श्रीमती <strong>{student.motherName || student.fatherName}</strong>, वर्तमान शैक्षणिक सत्र <strong>2025-26</strong> में हमारे विद्यालय की कक्षा <strong>{student.class}</strong>, वर्ग <strong>'{student.section || 'A'}'</strong> के नियमित एवं प्रामाणिक विद्यार्थी (Bonafide Student) हैं।
            </p>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 font-bold uppercase block text-[10px]">अनुक्रमांक (Roll No.)</span>
                <span className="font-bold text-stone-900 text-sm font-mono">{student.rollNo}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase block text-[10px]">प्रवेश तिथि (Admission Date)</span>
                <span className="font-bold text-stone-900 text-sm">{student.admissionDate || '01/07/2023'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase block text-[10px]">जन्म तिथि (DOB)</span>
                <span className="font-bold text-stone-900 text-sm">{student.dob || '15/08/2012'}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase block text-[10px]">रक्त समूह (Blood Group)</span>
                <span className="font-bold text-red-700 text-sm">{student.bloodGroup || 'B+'}</span>
              </div>
            </div>

            <p className="text-justify indent-8">
              यह प्रमाण पत्र विद्यार्थी अथवा अभिभावक के विशेष अनुरोध पर छात्रवृत्ति (Scholarship), बस/रेलवे पास रियायत, आधार प्रमाणीकरण अथवा अन्य प्रशासनिक प्रयोजनार्थ जारी किया जा रहा है।
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-12 flex justify-between items-end text-xs font-bold text-stone-800">
            <div>
              <span className="block text-stone-500">जारी करने का दिनांक:</span>
              <span className="font-bold">{today}</span>
              <span className="block text-[10px] text-stone-400 mt-1">स्थान: {currentSchool.city}</span>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-orange-800/40 flex items-center justify-center text-[10px] text-stone-400 mb-1">
                विद्यालय मुहर (SEAL)
              </div>
            </div>

            <div className="text-center border-t border-stone-400 pt-2 px-6">
              <span className="block text-sm">{currentSchool.principalName || 'प्रधानाचार्य'}</span>
              <span>प्रधानाचार्य</span>
              <span className="block text-[10px] text-stone-400 font-normal">Principal / Headmaster</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

