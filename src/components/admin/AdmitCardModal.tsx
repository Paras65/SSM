import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import type { Student, Exam } from '../../types';
import { Printer, X, Award, ShieldCheck } from 'lucide-react';

interface AdmitCardModalProps {
  student: Student;
  exam: Exam;
  onClose: () => void;
}

export const AdmitCardModal: React.FC<AdmitCardModalProps> = ({ student, exam, onClose }) => {
  const { currentSchool } = useSchool();

  const handlePrint = () => {
    window.print();
  };

  // Filter exam date sheet for the student's class
  const classSchedule = exam.dateSheet?.filter(d => d.class === student.class) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 relative my-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪪</span>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                परीक्षा प्रवेश पत्र (Examination Admit Card / Hall Ticket)
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
              <span>प्रिंट करें (Print Admit Card)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="mt-4 p-6 sm:p-8 bg-amber-50/20 border-4 border-double border-orange-800 rounded-2xl relative">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-9xl font-serif font-black text-orange-950">SSM</span>
          </div>

          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-orange-800 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-orange-900 uppercase">
              <span>संबद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान</span>
              <span>मान्यता क्र.: {currentSchool.affiliationNo || 'VB-2025/UP'}</span>
            </div>
            <div className="text-2xl font-serif text-orange-800">ॐ</div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-wide">
              {currentSchool.hindiName}
            </h1>
            <p className="text-xs font-semibold text-stone-600">
              {currentSchool.address}, {currentSchool.city} ({currentSchool.prant})
            </p>
            <div className="pt-2">
              <span className="px-4 py-1 rounded-full bg-orange-800 text-amber-100 font-bold text-xs uppercase tracking-wider inline-block">
                प्रवेश पत्र (HALL TICKET) • {exam.title}
              </span>
            </div>
          </div>

          {/* Student Info & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-5 border-b border-stone-300 text-xs">
            <div className="sm:col-span-3 grid grid-cols-2 gap-y-2.5 gap-x-4">
              <div>
                <span className="text-stone-400 font-bold uppercase text-[10px] block">विद्यार्थी का नाम (Candidate Name)</span>
                <span className="text-sm font-bold text-stone-900">{student.name}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[10px] block">अनुक्रमांक (Roll No.)</span>
                <span className="text-sm font-black font-mono text-orange-900">{student.rollNo}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[10px] block">कक्षा व वर्ग (Class & Section)</span>
                <span className="font-bold text-stone-800">{student.class} - '{student.section || 'A'}'</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[10px] block">सत्र (Academic Session)</span>
                <span className="font-bold text-stone-800">{exam.academicYear}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[10px] block">पिता का नाम (Father's Name)</span>
                <span className="font-bold text-stone-800">{student.fatherName}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[10px] block">जन्म तिथि (DOB)</span>
                <span className="font-bold text-stone-800">{student.dob || '01/01/2012'}</span>
              </div>
            </div>

            {/* Student Photo */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-24 h-28 rounded-xl border-2 border-dashed border-stone-400 flex items-center justify-center bg-stone-100 overflow-hidden">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-[10px] text-stone-400 font-semibold">
                    <span className="text-2xl block mb-1">📸</span>
                    छात्र चित्र
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Examination Date Sheet Table */}
          <div className="py-4 space-y-2">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-orange-700" />
              <span>परीक्षा कार्यक्रम एवं विषय सूची (Examination Schedule)</span>
            </h4>

            <div className="border border-stone-300 rounded-xl overflow-hidden bg-white text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-300 text-stone-700 font-bold text-[10px] uppercase">
                    <th className="p-2">क्र.</th>
                    <th className="p-2">दिनांक</th>
                    <th className="p-2">विषय (Subject)</th>
                    <th className="p-2">समय (Time)</th>
                    <th className="p-2">कक्ष (Room)</th>
                    <th className="p-2 text-center">कक्ष निरीक्षक हस्ताक्षर</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {classSchedule.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-stone-400">
                        समय-सारिणी निर्धारित की जा रही है।
                      </td>
                    </tr>
                  ) : (
                    classSchedule.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-mono text-stone-500">{idx + 1}</td>
                        <td className="p-2 font-bold text-stone-800">{item.date}</td>
                        <td className="p-2 font-bold text-orange-950">{item.subject}</td>
                        <td className="p-2 text-stone-600">{item.timing}</td>
                        <td className="p-2 text-stone-600">{item.roomNo || 'कक्ष 101'}</td>
                        <td className="p-2 text-center text-stone-300 font-serif">________</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exam Rules */}
          <div className="py-2 text-[10px] text-stone-600 space-y-1 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
            <span className="font-bold text-orange-900 block uppercase">परीक्षार्थी हेतु आवश्यक निर्देश:</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>परीक्षार्थियों को परीक्षा कक्ष में निर्धारित समय से 15 मिनट पूर्व उपस्थित होना अनिवार्य है।</li>
              <li>पूर्ण विद्यालय गणवेश (Uniform) एवं परिचय पत्र (ID Card) साथ लाना अनिवार्य है।</li>
              <li>परीक्षा भवन में किसी भी प्रकार का इलेक्ट्रॉनिक उपकरण, मोबाइल अथवा अनुचित साधन पूर्णतः वर्जित है।</li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="pt-10 flex justify-between items-end text-xs font-bold text-stone-800 text-center">
            <div className="border-t border-stone-400 pt-1.5 px-4">
              <span>परीक्षार्थी के हस्ताक्षर</span>
              <span className="block text-[10px] text-stone-400 font-normal">Candidate Sign</span>
            </div>
            <div className="border-t border-stone-400 pt-1.5 px-4">
              <span>कक्षाचार्य के हस्ताक्षर</span>
              <span className="block text-[10px] text-stone-400 font-normal">Class Teacher</span>
            </div>
            <div className="border-t border-stone-400 pt-1.5 px-4">
              <span className="block">{currentSchool.principalName || 'प्रधानाचार्य'}</span>
              <span>प्रधानाचार्य मुद्रा व हस्ताक्षर</span>
              <span className="block text-[10px] text-stone-400 font-normal">Principal Stamp & Sign</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

