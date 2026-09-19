import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import type { Student } from '../../types';
import { Printer, X, ArrowLeft } from 'lucide-react';

interface CharacterCertificateModalProps {
  student: Student;
  onClose: () => void;
}

export const CharacterCertificateModal: React.FC<CharacterCertificateModalProps> = ({ student, onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-hidden print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:max-w-none print:rounded-none print:m-0">
        {/* Action Header - Pinned at top */}
        <div className="shrink-0 bg-stone-900 text-white px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 border-b border-stone-800 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              title="वापस जाएं (Back)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">वापस</span>
            </button>
            <span className="text-lg sm:text-xl shrink-0">📜</span>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                चरित्र प्रमाण पत्र (Character Certificate)
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                {student.name} • {student.class} ({student.rollNo})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 sm:px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="प्रमाण पत्र प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">प्रमाण पत्र प्रिंट करें</span>
              <span className="sm:hidden">प्रिंट</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
              title="बंद करें (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Container - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 print:p-0 print:overflow-visible">
          <div className="p-4 sm:p-8 md:p-12 bg-amber-50/20 border-4 sm:border-8 border-double border-orange-800 rounded-xl sm:rounded-2xl relative print:border-8 print:p-10">
          
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-7xl sm:text-9xl font-serif font-black text-orange-950">SSM</span>
          </div>

          {/* School Header */}
          <div className="text-center space-y-1 pb-4 sm:pb-6 border-b-2 border-orange-800">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-1 text-[9px] sm:text-[10px] font-bold text-orange-900 uppercase">
              <span>संबद्ध: विद्या भारती अखिल भारतीय शिक्षा संस्थान</span>
              <span>प्रमाण पत्र क्र.: CC/{new Date().getFullYear()}/{student.rollNo}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-orange-800">ॐ</div>
            <h1 className="text-xl sm:text-3xl font-black text-stone-900 font-serif tracking-wide">
              {currentSchool.hindiName}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-stone-600">
              {currentSchool.address}, {currentSchool.city} ({currentSchool.prant})
            </p>
            <div className="pt-2 sm:pt-3">
              <span className="px-3 sm:px-6 py-1 rounded-full bg-orange-900 text-amber-100 font-bold text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase inline-block font-serif shadow-xs">
                चरित्र प्रमाण पत्र (CHARACTER CERTIFICATE)
              </span>
            </div>
          </div>

          {/* Certificate Content */}
          <div className="py-4 sm:py-8 space-y-4 sm:space-y-6 text-xs sm:text-sm text-stone-800 leading-relaxed sm:leading-loose">
            <p className="text-justify indent-4 sm:indent-8">
              प्रमाणित किया जाता है कि <strong>{student.gender === 'Bhaiya' ? 'भैया' : 'बहिन'} {student.name}</strong>, सुपुत्र/सुपुत्री श्री <strong>{student.fatherName}</strong> एवं श्रीमती <strong>{student.motherName || student.fatherName}</strong>, निवासी <strong>{student.address || currentSchool.city}</strong>, हमारे विद्यालय में कक्षा <strong>{student.class}</strong> (अनुक्रमांक <strong>{student.rollNo}</strong>) के नियमित विद्यार्थी रहे हैं।
            </p>

            <p className="text-justify indent-4 sm:indent-8">
              विद्यालय में अध्ययन के दौरान इनका आचरण, संस्कार, अनुशासन, नैतिक व्यवहार एवं गुरुजनों के प्रति आदरभाव <strong>उत्कृष्ट एवं आदर्श (Exemplary & Outstanding)</strong> रहा है। इन्होंने विद्यालय की दैनिक वंदना, योग, शारीरिक शिक्षा एवं सह-शैक्षणिक गतिविधियों में सक्रियता व निष्ठापूर्वक सहभागिता की है।
            </p>

            <p className="text-justify indent-4 sm:indent-8">
              हमारी जानकारी के अनुसार इनका नैतिक चरित्र पूर्णतया <strong>शुद्ध, उत्तम एवं संदेहरहित</strong> है।
            </p>

            <p className="font-bold text-orange-950 pt-1 sm:pt-2">
              हम इनके उज्ज्वल, यशस्वी एवं मंगलमय भविष्य की हार्दिक कामना करते हैं।
            </p>
          </div>

          {/* Footer & Date */}
          <div className="pt-8 sm:pt-12 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-4 text-xs font-bold text-stone-800 print:flex-row print:justify-between print:pt-12">
            <div className="text-center sm:text-left">
              <span className="block text-stone-500">जारी करने का दिनांक:</span>
              <span className="font-bold">{today}</span>
              <span className="block text-[10px] text-stone-400 mt-1">स्थान: {currentSchool.city}</span>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full border-2 border-dashed border-orange-800/40 flex items-center justify-center text-[9px] sm:text-[10px] text-stone-400 mb-1">
                विद्यालय मुहर (SEAL)
              </div>
            </div>

            <div className="text-center border-t border-stone-400 pt-2 px-4 sm:px-6">
              <span className="block text-xs sm:text-sm">{currentSchool.principalName || 'प्रधानाचार्य'}</span>
              <span>प्रधानाचार्य</span>
              <span className="block text-[10px] text-stone-400 font-normal">Principal / Headmaster</span>
            </div>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
};

