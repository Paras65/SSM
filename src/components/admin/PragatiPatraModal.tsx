import React, { useState } from 'react';
import type { ReportCard, Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { Printer, X, Award, MessageSquare, Sparkles, Mic, ShieldCheck } from 'lucide-react';
import { generateReportCardWhatsAppLink } from '../../utils/whatsappAlerts';

interface PragatiPatraModalProps {
  reportCard: ReportCard;
  student: Student;
  onClose: () => void;
}

export const PragatiPatraModal: React.FC<PragatiPatraModalProps> = ({ reportCard, student, onClose }) => {
  const { currentSchool } = useSchool();
  const { showWarning } = useToast();
  const [currentRemarks, setCurrentRemarks] = useState(reportCard.acharyaRemarks);
  const [isListening, setIsListening] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Division calculation
  const division = reportCard.percentage >= 75
    ? 'विशिष्ट योग्यता (Distinction)'
    : reportCard.percentage >= 60
    ? 'प्रथम श्रेणी (I Division)'
    : reportCard.percentage >= 45
    ? 'द्वितीय श्रेणी (II Division)'
    : reportCard.percentage >= 33
    ? 'तृतीय श्रेणी (III Division)'
    : 'अनुत्तीर्ण (Failed)';

  // Verification QR data URL
  const qrVerificationData = encodeURIComponent(
    `SSM-HPC-REPORT|${currentSchool.id}|Roll:${student.rollNo}|Name:${student.name}|Class:${student.class}-${student.section}|Marks:${reportCard.totalObtained}/${reportCard.totalMax}|Pct:${reportCard.percentage.toFixed(1)}%|Grade:${reportCard.grade}|Division:${division}|Term:${reportCard.examTerm}`
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=2&data=${qrVerificationData}`;

  const handleShareWhatsApp = () => {
    const pe = reportCard.panchmukhiEvaluation;
    const url = generateReportCardWhatsAppLink({
      studentName: student.name,
      className: `${student.class} '${student.section}'`,
      rollNo: student.rollNo,
      term: reportCard.examTerm,
      academicYear: reportCard.academicYear,
      percentage: reportCard.percentage,
      grade: reportCard.grade,
      moralConduct: reportCard.moralConduct,
      acharyaRemarks: currentRemarks,
      panchmukhi: {
        sharirikGrade: pe?.sharirik?.grade || 'O',
        yogGrade: pe?.yog?.grade || 'A+',
        sangeetGrade: pe?.sangeet?.grade || 'A',
        sanskritGrade: pe?.sanskrit?.grade || 'O',
        naitikGrade: pe?.naitik?.grade || 'O',
      },
      schoolName: currentSchool.hindiName || currentSchool.name,
      phone: student.contact
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showWarning('आपके ब्राउज़र में वॉइस टाइपिंग उपलब्ध नहीं है। कृपया Google Chrome का उपयोग करें।');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentRemarks(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const pe = reportCard.panchmukhiEvaluation;
  const panchmukhiList = [
    {
      icon: '🏃',
      name: 'शारीरिक शिक्षा (Physical)',
      grade: pe?.sharirik?.grade || 'O',
      gradeText: pe?.sharirik?.grade === 'O' ? 'सर्वोच्च' : 'उत्कृष्ट',
      skills: pe?.sharirik?.skills || 'दंड, नियुद्ध, 100 मी दौड़, संचलन, पारंपरिक खेल',
      remarks: pe?.sharirik?.remarks || 'शारीरिक सौष्ठव एवं संचलन में उत्कृष्ट नेतृत्व'
    },
    {
      icon: '🧘',
      name: 'योग एवं प्राणायाम (Yoga)',
      grade: pe?.yog?.grade || 'A+',
      gradeText: pe?.yog?.grade === 'O' ? 'सर्वोच्च' : 'अति उत्तम',
      skills: pe?.yog?.skills || 'सूर्य नमस्कार (12 मंत्र सहित), पद्मासन, भ्रामरी प्राणायाम',
      remarks: pe?.yog?.remarks || 'दैनिक आसनों में लचीलापन एवं नियमितता'
    },
    {
      icon: '🎵',
      name: 'संगीत एवं घोष (Music)',
      grade: pe?.sangeet?.grade || 'A',
      gradeText: pe?.sangeet?.grade === 'O' ? 'सर्वोच्च' : 'उत्तम',
      skills: pe?.sangeet?.skills || 'सरस्वती वंदना, एकात्मता स्तोत्र, घोष वादन (वंशी/आनक)',
      remarks: pe?.sangeet?.remarks || 'प्रार्थना सभा में लयबद्ध वादन एवं गायन'
    },
    {
      icon: '📜',
      name: 'संस्कृत शिक्षा (Sanskrit)',
      grade: pe?.sanskrit?.grade || 'O',
      gradeText: 'सर्वोच्च',
      skills: pe?.sanskrit?.skills || 'गीता श्लोक कंठस्थीकरण, सुभाषित, सरल संस्कृत संभाषण',
      remarks: pe?.sanskrit?.remarks || 'स्पष्ट एवं शुद्ध उच्चारण, उत्कृष्ट स्मरण शक्ति'
    },
    {
      icon: '🪷',
      name: 'नैतिक व आध्यात्मिक (Moral)',
      grade: pe?.naitik?.grade || 'O',
      gradeText: 'सर्वोच्च',
      skills: pe?.naitik?.skills || 'मातृ-पितृ चरण स्पर्श, गुरु भक्ति, समयबद्धता, सेवाभाव',
      remarks: pe?.naitik?.remarks || 'आदर्श संस्कारयुक्त आचरण एवं अनुकरणीय अनुशासन'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-orange-300 print:shadow-none print:border-none print:max-w-none print:rounded-none print:p-0 print:m-0">
        
        {/* Action Header (Hidden in Print) */}
        <div className="no-print bg-gradient-to-r from-orange-800 to-amber-700 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Award className="w-4 h-4 text-yellow-300" />
            <span>प्रगति पत्र • 360° समग्र मूल्यांकन (NEP 2020 HPC)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="अभिभावक के व्हाट्सएप पर प्रगति पत्र भेजें"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>व्हाट्सएप पर भेजें</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-orange-900 hover:bg-orange-50 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें (Print)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-orange-900 text-white transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Sheet */}
        <div className="p-4 sm:p-6 text-stone-900 bg-white print:p-3 print-avoid-break" id="report-card-print">
          
          {/* Ornate Frame Border */}
          <div className="border-4 border-double border-orange-800 p-5 rounded-2xl relative print:border-2 print:p-4">
            
            {/* Top Motto Bar */}
            <div className="text-center pb-1.5 border-b border-orange-300 mb-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-orange-900 font-serif">
                <span>ॐ श्री सरस्वत्यै नमः</span>
                <span>विद्या भारती अखिल भारतीय शिक्षा संस्थान</span>
                <span>{currentSchool.tagline || 'सा विद्या या विमुक्तये'}</span>
              </div>
            </div>

            {/* School Header */}
            <div className="text-center mb-3">
              <div className="w-9 h-9 mx-auto mb-1 rounded-full bg-orange-700 text-white flex items-center justify-center text-lg shadow-xs">
                🪷
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-orange-950 font-serif tracking-tight">
                {currentSchool.hindiName || currentSchool.name}
              </h2>
              <p className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                {currentSchool.name}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">
                {currentSchool.address} • {currentSchool.affiliate}
              </p>

              <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 bg-orange-100 border border-orange-400 rounded-full text-xs font-bold text-orange-950">
                <span>समग्र प्रगति पत्र (HOLISTIC PROGRESS REPORT)</span>
                <span>•</span>
                <span>सत्र: {reportCard.academicYear}</span>
                <span>•</span>
                <span>{reportCard.examTerm}</span>
              </div>
            </div>

            {/* Student Biodata with QR Code & Photo */}
            <div className="bg-amber-50/70 p-3 rounded-xl border border-orange-200 grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs mb-4 items-center">
              {/* Info Columns */}
              <div className="sm:col-span-3 grid grid-cols-2 gap-y-1.5 gap-x-3">
                <div>
                  <span className="text-stone-500 text-[11px]">नाम (Name): </span>
                  <span className="font-bold text-stone-900">{student.name}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px]">अनुक्रमांक (Roll No): </span>
                  <span className="font-black font-mono text-orange-900">{student.rollNo}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px]">कक्षा एवं वर्ग: </span>
                  <span className="font-bold text-stone-900">{student.class} '{student.section}'</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px]">उपस्थिति (Attendance): </span>
                  <span className="font-bold text-orange-800">{reportCard.attendancePercentage}%</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px]">पिता का नाम: </span>
                  <span className="font-bold text-stone-900">{student.fatherName}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[11px]">माता का नाम: </span>
                  <span className="font-bold text-stone-900">{student.motherName || 'श्रीमती अभिभावक'}</span>
                </div>
              </div>

              {/* Digital Verification QR */}
              <div className="flex flex-col items-center justify-center p-1 bg-white border border-stone-200 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="Verification QR"
                  className="w-14 h-14 object-contain"
                />
                <span className="text-[7.5px] font-bold text-stone-500 mt-0.5 uppercase flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                  प्रमाणित पत्रक
                </span>
              </div>

              {/* Photo Box */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-18 h-22 rounded-lg border border-stone-300 flex items-center justify-center bg-stone-100 overflow-hidden shadow-2xs">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-1 text-[8.5px] text-stone-400 font-semibold">
                      <span className="text-base block">📸</span>
                      छात्र चित्र
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section A: Scholastic Evaluation */}
            <div className="mb-4">
              <div className="text-xs font-bold text-orange-950 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-600" />
                <span>भाग-क: विषयवार शैक्षणिक मूल्यांकन (Scholastic Evaluation)</span>
              </div>
              <div className="border border-stone-300 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-orange-800 text-white font-bold">
                    <tr>
                      <th className="p-1.5 border border-stone-300 w-10 text-center">क्र.</th>
                      <th className="p-1.5 border border-stone-300">विषय (Subjects)</th>
                      <th className="p-1.5 border border-stone-300 w-24 text-center">पूर्णांक (Max)</th>
                      <th className="p-1.5 border border-stone-300 w-24 text-center">प्राप्तांक (Obtained)</th>
                      <th className="p-1.5 border border-stone-300 w-24 text-center">श्रेणी (Grade)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {reportCard.marks.map((m, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}>
                        <td className="p-1 text-center border border-stone-200 text-stone-500 font-mono">{idx + 1}</td>
                        <td className="p-1 font-medium text-stone-800 border border-stone-200">{m.subject}</td>
                        <td className="p-1 text-center text-stone-600 border border-stone-200">{m.maxMarks}</td>
                        <td className="p-1 text-center font-bold text-stone-900 border border-stone-200">{m.marksObtained}</td>
                        <td className="p-1 text-center font-bold text-orange-700 border border-stone-200">{m.grade}</td>
                      </tr>
                    ))}
                    
                    {/* Total Row */}
                    <tr className="bg-amber-100/90 font-bold text-stone-950 border-t-2 border-stone-400">
                      <td className="p-1.5 text-center border border-stone-300" colSpan={2}>योग (Grand Total)</td>
                      <td className="p-1.5 text-center border border-stone-300">{reportCard.totalMax}</td>
                      <td className="p-1.5 text-center text-orange-950 font-black border border-stone-300">{reportCard.totalObtained}</td>
                      <td className="p-1.5 text-center text-orange-900 border border-stone-300 font-black">{reportCard.percentage.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section B: Panchmukhi 360 Holistic Assessment Section (NEP 2020 HPC) */}
            <div className="mb-4 border border-orange-300 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 px-3 py-1.5 border-b border-orange-300 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-700" />
                  <span className="font-bold text-xs text-orange-950">
                    भाग-ख: पंचमुखी शिक्षा सर्वांगीण आयाम मूल्यांकन (NEP 2020 360° HPC)
                  </span>
                </div>
                <span className="text-[9.5px] font-semibold text-orange-800 bg-white/90 px-2 py-0.5 rounded-full border border-orange-200">
                  विद्या भारती पंचमुखी शिक्षा
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-amber-50/80 text-stone-800 border-b border-orange-200 font-semibold">
                    <tr>
                      <th className="p-1.5 border-r border-orange-200 w-8 text-center">क्र.</th>
                      <th className="p-1.5 border-r border-orange-200 w-44">आयाम (Dimension)</th>
                      <th className="p-1.5 border-r border-orange-200 w-24 text-center">मूल्यांकन (Grade)</th>
                      <th className="p-1.5 border-r border-orange-200">कौशल एवं सहभागिता (Skills & Activities)</th>
                      <th className="p-1.5">आचार्य सम्मति (Observations)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 text-[10.5px]">
                    {panchmukhiList.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                        <td className="p-1 text-center border-r border-orange-100 text-stone-500 font-mono">{idx + 1}</td>
                        <td className="p-1 border-r border-orange-100 font-bold text-stone-900 flex items-center gap-1">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </td>
                        <td className="p-1 border-r border-orange-100 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9.5px] font-black ${
                            item.grade === 'O' 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : item.grade === 'A+' 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {item.grade} ({item.gradeText})
                          </span>
                        </td>
                        <td className="p-1 border-r border-orange-100 text-stone-700">{item.skills}</td>
                        <td className="p-1 text-stone-600 italic">{item.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Summary & Panchmukhi Value Appraisal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              
              {/* Overall Grade & Percentage with Division Ribbon */}
              <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 font-medium">सत्र परीक्षा परिणाम (Result):</span>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px]">
                    {division}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">कुल प्राप्तांक एवं प्रतिशत:</span>
                  <span className="font-bold text-orange-950 text-sm">
                    {reportCard.totalObtained} / {reportCard.totalMax} ({reportCard.percentage.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">अंतिम श्रेणी (Final Grade):</span>
                  <span className="font-bold text-stone-900">{reportCard.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">संस्कार एवं आचरण (Moral Conduct):</span>
                  <span className="font-bold text-green-700">{reportCard.moralConduct}</span>
                </div>
              </div>

              {/* Acharya Remarks with Voice Input & Edit */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-stone-800">
                    कक्षाचार्य सम्मति (Acharya Remarks):
                  </span>
                  <button
                    type="button"
                    onClick={startVoiceDictation}
                    className={`no-print flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 hover:bg-orange-200 text-orange-900'
                    }`}
                    title="बोलकर टिप्पणी दर्ज करें (Hindi Voice-to-Text)"
                  >
                    <Mic className="w-3 h-3" />
                    <span>{isListening ? 'सुन रहे हैं...' : 'बोलकर लिखें'}</span>
                  </button>
                </div>
                <textarea
                  value={currentRemarks}
                  onChange={(e) => setCurrentRemarks(e.target.value)}
                  className="w-full text-stone-700 italic leading-relaxed border-0 focus:ring-1 focus:ring-orange-400 rounded p-1 text-xs resize-none bg-stone-50/50 print:bg-transparent print:border-none print:p-0 print:resize-none"
                  rows={2}
                />
              </div>

            </div>

            {/* Signatures with Circular School Seal */}
            <div className="grid grid-cols-4 gap-2 pt-6 text-center text-xs text-stone-700 border-t border-stone-300 items-end">
              <div className="space-y-4">
                <div className="h-4" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold text-[10.5px]">
                  हस्ताक्षर कक्षाचार्य
                  <span className="block text-[8.5px] text-stone-400 font-normal">Class Teacher</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-4" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold text-[10.5px]">
                  हस्ताक्षर अभिभावक
                  <span className="block text-[8.5px] text-stone-400 font-normal">Parent / Guardian</span>
                </div>
              </div>

              {/* Official Seal Stamp */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-orange-800/70 flex flex-col items-center justify-center text-center p-1 text-orange-950 select-none bg-orange-50/40">
                  <span className="text-[6px] font-bold uppercase tracking-wider">सरस्वती शिशु मंदिर</span>
                  <span className="text-xs my-0.5">🪷</span>
                  <span className="text-[6px] font-bold uppercase">विद्यालय मुहर • SEAL</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-4" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold text-[10.5px]">
                  <span className="block text-stone-900 font-bold">{currentSchool.principalName || 'प्रधानाचार्य'}</span>
                  हस्ताक्षर प्रधानाचार्य
                  <span className="block text-[8.5px] text-stone-400 font-normal">Principal Stamp & Sign</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PragatiPatraModal;
