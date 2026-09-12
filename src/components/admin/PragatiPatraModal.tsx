import React, { useState } from 'react';
import type { ReportCard, Student } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { Printer, X, Award, MessageSquare, Sparkles, Mic } from 'lucide-react';
import { generateReportCardWhatsAppLink } from '../../utils/whatsappAlerts';

interface PragatiPatraModalProps {
  reportCard: ReportCard;
  student: Student;
  onClose: () => void;
}

export const PragatiPatraModal: React.FC<PragatiPatraModalProps> = ({ reportCard, student, onClose }) => {
  const { currentSchool } = useSchool();
  const [currentRemarks, setCurrentRemarks] = useState(reportCard.acharyaRemarks);
  const [isListening, setIsListening] = useState(false);

  const handlePrint = () => {
    window.print();
  };

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
      alert('आपके ब्राउज़र में वॉइस टाइपिंग उपलब्ध नहीं है। कृपया Google Chrome का उपयोग करें।');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-orange-300 print:shadow-none print:border-none print:max-w-none print:rounded-none">
        
        {/* Action Header */}
        <div className="no-print bg-gradient-to-r from-orange-800 to-amber-700 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Award className="w-4 h-4 text-yellow-300" />
            <span>प्रगति पत्र • 360° समग्र मूल्यांकन (NEP 2020 HPC)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              title="अभिभावक के व्हाट्सएप पर प्रगति पत्र भेजें"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>व्हाट्सएप पर भेजें</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-orange-900 hover:bg-orange-50 rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-orange-900 text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Sheet */}
        <div className="p-6 sm:p-8 text-stone-900 bg-white print:p-2" id="report-card-print">
          
          {/* Ornate Frame Border */}
          <div className="border-4 border-double border-orange-800 p-6 rounded-2xl relative print:border-2">
            
            {/* Top Motto Bar */}
            <div className="text-center pb-2 border-b border-orange-300 mb-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-orange-900 font-serif">
                <span>ॐ श्री सरस्वत्यै नमः</span>
                <span>विद्या भारती अखिल भारतीय शिक्षा संस्थान</span>
                <span>{currentSchool.tagline || 'सा विद्या या विमुक्तये'}</span>
              </div>
            </div>

            {/* School Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-1 rounded-full bg-orange-700 text-white flex items-center justify-center text-2xl shadow-xs">
                🪷
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-orange-950 font-serif tracking-tight">
                {currentSchool.hindiName || currentSchool.name}
              </h2>
              <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                {currentSchool.name}
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {currentSchool.address} • {currentSchool.affiliate}
              </p>

              <div className="mt-3 inline-block px-4 py-1 bg-orange-100 border border-orange-400 rounded-full text-xs font-bold text-orange-950">
                समग्र प्रगति पत्र (HOLISTIC PROGRESS REPORT) • सत्र: {reportCard.academicYear} • {reportCard.examTerm}
              </div>
            </div>

            {/* Student Biodata */}
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-orange-200 grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs mb-6">
              <div>
                <span className="text-stone-500">नाम (Name): </span>
                <span className="font-bold text-stone-900">{student.name}</span>
              </div>
              <div>
                <span className="text-stone-500">अनुक्रमांक (Roll No): </span>
                <span className="font-bold text-stone-900">{student.rollNo}</span>
              </div>
              <div>
                <span className="text-stone-500">कक्षा एवं वर्ग: </span>
                <span className="font-bold text-stone-900">{student.class} '{student.section}'</span>
              </div>
              <div>
                <span className="text-stone-500">पिता का नाम: </span>
                <span className="font-bold text-stone-900">{student.fatherName}</span>
              </div>
              <div>
                <span className="text-stone-500">माता का नाम: </span>
                <span className="font-bold text-stone-900">{student.motherName}</span>
              </div>
              <div>
                <span className="text-stone-500">उपस्थिति (Attendance): </span>
                <span className="font-bold text-orange-800">{reportCard.attendancePercentage}%</span>
              </div>
            </div>

            {/* Section A: Marks Evaluation Table */}
            <div className="mb-6">
              <div className="text-xs font-bold text-orange-950 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-600" />
                <span>भाग-क: विषयवार शैक्षणिक मूल्यांकन (Scholastic Evaluation)</span>
              </div>
              <table className="w-full text-xs text-left border border-stone-300">
                <thead className="bg-orange-800 text-white font-bold">
                  <tr>
                    <th className="p-2 border border-stone-300">क्र.</th>
                    <th className="p-2 border border-stone-300">विषय (Subjects)</th>
                    <th className="p-2 border border-stone-300 text-center">पूर्णांक (Max)</th>
                    <th className="p-2 border border-stone-300 text-center">प्राप्तांक (Obtained)</th>
                    <th className="p-2 border border-stone-300 text-center">श्रेणी (Grade)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {reportCard.marks.map((m, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <td className="p-2 text-center border border-stone-200">{idx + 1}</td>
                      <td className="p-2 font-medium text-stone-800 border border-stone-200">{m.subject}</td>
                      <td className="p-2 text-center text-stone-600 border border-stone-200">{m.maxMarks}</td>
                      <td className="p-2 text-center font-bold text-stone-900 border border-stone-200">{m.marksObtained}</td>
                      <td className="p-2 text-center font-bold text-orange-700 border border-stone-200">{m.grade}</td>
                    </tr>
                  ))}
                  
                  {/* Total Row */}
                  <tr className="bg-amber-100/80 font-bold text-stone-950 border-t-2 border-stone-400">
                    <td className="p-2.5 text-center border border-stone-300" colSpan={2}>योग (Grand Total)</td>
                    <td className="p-2.5 text-center border border-stone-300">{reportCard.totalMax}</td>
                    <td className="p-2.5 text-center text-orange-900 text-sm border border-stone-300">{reportCard.totalObtained}</td>
                    <td className="p-2.5 text-center text-orange-900 border border-stone-300">{reportCard.percentage.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section B: Panchmukhi 360 Holistic Assessment Section (NEP 2020 HPC) */}
            <div className="mb-6 border border-orange-300 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 px-4 py-2 border-b border-orange-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-700" />
                  <span className="font-bold text-xs text-orange-950">
                    भाग-ख: पंचमुखी शिक्षा सर्वांगीण आयाम मूल्यांकन (NEP 2020 360° HPC)
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-orange-800 bg-white/90 px-2 py-0.5 rounded-full border border-orange-200">
                  विद्या भारती पंचमुखी शिक्षा
                </span>
              </div>

              <table className="w-full text-xs text-left">
                <thead className="bg-amber-50/80 text-stone-800 border-b border-orange-200 font-semibold">
                  <tr>
                    <th className="p-2 border-r border-orange-200 w-8 text-center">क्र.</th>
                    <th className="p-2 border-r border-orange-200 w-44">आयाम (Dimension)</th>
                    <th className="p-2 border-r border-orange-200 w-24 text-center">मूल्यांकन (Grade)</th>
                    <th className="p-2 border-r border-orange-200">कौशल एवं सहभागिता (Skills & Activities)</th>
                    <th className="p-2">आचार्य सम्मति (Observations)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100 text-[11px]">
                  {panchmukhiList.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                      <td className="p-2 text-center border-r border-orange-100 text-stone-500 font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-orange-100 font-bold text-stone-900 flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </td>
                      <td className="p-2 border-r border-orange-100 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                          item.grade === 'O' 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : item.grade === 'A+' 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                            : 'bg-blue-100 text-blue-900 border border-blue-300'
                        }`}>
                          {item.grade} ({item.gradeText})
                        </span>
                      </td>
                      <td className="p-2 border-r border-orange-100 text-stone-700">{item.skills}</td>
                      <td className="p-2 text-stone-600 italic">{item.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Performance Summary & Panchmukhi Value Appraisal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              {/* Overall Grade & Percentage */}
              <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">कुल प्रतिशत (Percentage):</span>
                  <span className="font-bold text-orange-800 text-sm">{reportCard.percentage.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">अंतिम श्रेणी (Final Grade):</span>
                  <span className="font-bold text-stone-900">{reportCard.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">नैतिक एवं संस्कार आचरण:</span>
                  <span className="font-bold text-green-700">{reportCard.moralConduct}</span>
                </div>
              </div>

              {/* Acharya Remarks with Voice Input & Edit */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-stone-800">
                    कक्षाचार्य सम्मति (Acharya Remarks):
                  </span>
                  <button
                    type="button"
                    onClick={startVoiceDictation}
                    className={`no-print flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition ${
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

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs text-stone-700 border-t border-stone-200">
              <div className="space-y-8">
                <div className="h-6" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold">
                  हस्ताक्षर कक्षाचार्य (Class Teacher)
                </div>
              </div>

              <div className="space-y-8">
                <div className="h-6" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold">
                  हस्ताक्षर अभिभावक (Guardian)
                </div>
              </div>

              <div className="space-y-8">
                <div className="h-6" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold">
                  हस्ताक्षर प्रधानाचार्य (Principal)
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
