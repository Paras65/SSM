import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import type { Student, Exam } from '../../types';
import { Printer, X, Award, ShieldCheck, QrCode } from 'lucide-react';

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

  // Verification QR data URL
  const qrVerificationData = encodeURIComponent(
    `SSM-ADMIT-CARD|${currentSchool.id}|Roll:${student.rollNo}|Name:${student.name}|Class:${student.class}-${student.section}|Exam:${exam.title}|Session:${exam.academicYear}`
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=2&data=${qrVerificationData}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-stone-200 relative my-6 print:shadow-none print:border-none print:max-w-none print:rounded-none print:p-0 print:m-0">
        
        {/* Action Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-3 border-b border-stone-200">
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
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-orange-700 to-amber-700 hover:from-orange-800 hover:to-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट करें (Print Admit Card)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="mt-4 p-5 sm:p-7 bg-amber-50/20 border-4 border-double border-orange-800 rounded-2xl relative print:border-2 print:m-0 print:p-5 print-avoid-break">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <span className="text-9xl font-serif font-black text-orange-950">ॐ</span>
          </div>

          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-orange-800 space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-orange-900 uppercase tracking-wide">
              <span>संबद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान</span>
              <span>मान्यता क्र.: {currentSchool.affiliationNo || 'VB-2025/UP'}</span>
            </div>
            <div className="text-2xl font-serif text-orange-800 font-bold leading-none">ॐ</div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-serif tracking-wide">
              {currentSchool.hindiName || currentSchool.name}
            </h1>
            <p className="text-xs font-semibold text-stone-600">
              {currentSchool.address}, {currentSchool.city} ({currentSchool.prant})
            </p>
            <div className="pt-1.5">
              <span className="px-4 py-1 rounded-full bg-orange-800 text-amber-100 font-bold text-xs uppercase tracking-wider inline-block shadow-2xs">
                प्रवेश पत्र (HALL TICKET) • {exam.title} • सत्र {exam.academicYear}
              </span>
            </div>
          </div>

          {/* Student Info, QR Verification & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 py-4 border-b border-stone-300 text-xs items-center">
            {/* Biodata Columns */}
            <div className="sm:col-span-3 grid grid-cols-2 gap-y-2 gap-x-3">
              <div>
                <span className="text-stone-400 font-bold uppercase text-[9.5px] block">विद्यार्थी का नाम (Candidate Name)</span>
                <span className="text-sm font-bold text-stone-900">{student.name}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[9.5px] block">अनुक्रमांक (Roll No.)</span>
                <span className="text-sm font-black font-mono text-orange-900">{student.rollNo}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[9.5px] block">कक्षा व वर्ग (Class & Section)</span>
                <span className="font-bold text-stone-800">{student.class} - '{student.section || 'A'}'</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[9.5px] block">सत्र (Session)</span>
                <span className="font-bold text-stone-800">{exam.academicYear}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[9.5px] block">पिता का नाम (Father's Name)</span>
                <span className="font-bold text-stone-800">{student.fatherName}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold uppercase text-[9.5px] block">जन्म तिथि (DOB)</span>
                <span className="font-bold text-stone-800">{student.dob || '01/01/2012'}</span>
              </div>
            </div>

            {/* QR Verification Code */}
            <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-stone-200 rounded-xl">
              <img
                src={qrCodeUrl}
                alt="Verification QR"
                className="w-16 h-16 object-contain"
              />
              <span className="text-[8px] font-bold text-stone-500 mt-1 uppercase flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                सत्यापित पत्रक
              </span>
            </div>

            {/* Student Photo Box */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-22 h-26 rounded-xl border-2 border-stone-300 flex items-center justify-center bg-stone-100 overflow-hidden shadow-2xs">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2 text-[9.5px] text-stone-400 font-semibold">
                    <span className="text-xl block mb-0.5">📸</span>
                    छात्र चित्र
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Examination Date Sheet Table */}
          <div className="py-3 space-y-1.5">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-orange-700" />
              <span>परीक्षा कार्यक्रम एवं विषय सूची (Examination Schedule)</span>
            </h4>

            <div className="border border-stone-300 rounded-xl overflow-x-auto bg-white text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-300 text-stone-700 font-bold text-[10px] uppercase">
                    <th className="p-2 w-10 text-center">क्र.</th>
                    <th className="p-2 w-28">दिनांक</th>
                    <th className="p-2">विषय (Subject)</th>
                    <th className="p-2 w-32">समय (Time)</th>
                    <th className="p-2 w-24">कक्ष (Room)</th>
                    <th className="p-2 w-32 text-center">कक्ष निरीक्षक हस्ताक्षर</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs">
                  {classSchedule.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-stone-400">
                        समय-सारिणी निर्धारित की जा रही है।
                      </td>
                    </tr>
                  ) : (
                    classSchedule.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'}>
                        <td className="p-1.5 text-center font-mono text-stone-500">{idx + 1}</td>
                        <td className="p-1.5 font-bold text-stone-800">{item.date}</td>
                        <td className="p-1.5 font-bold text-orange-950">{item.subject}</td>
                        <td className="p-1.5 text-stone-600">{item.timing}</td>
                        <td className="p-1.5 text-stone-600">{item.roomNo || 'कक्ष 101'}</td>
                        <td className="p-1.5 text-center text-stone-300 font-serif">________</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exam Rules */}
          <div className="py-2 text-[9.5px] text-stone-600 space-y-0.5 bg-orange-50/60 p-2.5 rounded-xl border border-orange-200">
            <span className="font-bold text-orange-900 block uppercase">परीक्षार्थी हेतु आवश्यक निर्देश:</span>
            <ul className="list-disc list-inside space-y-0.5">
              <li>परीक्षार्थियों को परीक्षा कक्ष में निर्धारित समय से 15 मिनट पूर्व उपस्थित होना अनिवार्य है।</li>
              <li>पूर्ण विद्यालय गणवेश (Uniform) एवं मूल प्रवेश पत्र (Admit Card) साथ लाना अनिवार्य है।</li>
              <li>परीक्षा भवन में किसी भी प्रकार का इलेक्ट्रॉनिक उपकरण, मोबाइल अथवा अनुचित साधन पूर्णतः वर्जित है।</li>
            </ul>
          </div>

          {/* Signatures & Official Stamp */}
          <div className="pt-6 grid grid-cols-4 gap-2 text-xs font-bold text-stone-800 text-center items-end">
            <div className="border-t border-stone-400 pt-1 px-1">
              <span>परीक्षार्थी हस्ताक्षर</span>
              <span className="block text-[9px] text-stone-400 font-normal">Candidate Sign</span>
            </div>
            <div className="border-t border-stone-400 pt-1 px-1">
              <span>कक्षाचार्य हस्ताक्षर</span>
              <span className="block text-[9px] text-stone-400 font-normal">Class Teacher</span>
            </div>
            
            {/* Circular School Seal Placeholder */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-orange-800/70 flex flex-col items-center justify-center text-center p-1 text-orange-950 select-none bg-orange-50/40">
                <span className="text-[6px] font-bold uppercase tracking-wider">सरस्वती शिशु मंदिर</span>
                <span className="text-xs my-0.5">🪷</span>
                <span className="text-[6px] font-bold uppercase">विद्यालय मुहर • SEAL</span>
              </div>
            </div>

            <div className="border-t border-stone-400 pt-1 px-1">
              <span className="block text-stone-900">{currentSchool.principalName || 'प्रधानाचार्य'}</span>
              <span>प्रधानाचार्य हस्ताक्षर</span>
              <span className="block text-[9px] text-stone-400 font-normal">Principal Stamp & Sign</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdmitCardModal;
