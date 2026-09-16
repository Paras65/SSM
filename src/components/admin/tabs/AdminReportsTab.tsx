import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { generateReportCardWhatsAppLink } from '../../../utils/whatsappAlerts';
import type { Student, ReportCard } from '../../../types';
import {
  Crown,
  FileSpreadsheet,
  MessageSquare,
  Printer,
  Trash2
} from 'lucide-react';

interface AdminReportsTabProps {
  requirePro: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
  onOpenReportModal: (modal: { report: ReportCard; student: Student }) => void;
  onOpenTabulationModal: () => void;
  onOpenUpgradeModal: (feature: { name: string; desc?: string }) => void;
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({
  requirePro,
  onOpenReportModal,
  onOpenTabulationModal,
  onOpenUpgradeModal
}) => {
  const { students, currentSchool, reportCards, deleteReportCard } = useSchool();
  const isPro = currentSchool.plan === 'pro';
  const [reportTermFilter, setReportTermFilter] = useState<string>('All');

  if (!isPro) {
    return (
      <div className="bg-white rounded-3xl border border-amber-200/90 p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 shadow-sm my-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Crown className="w-8 h-8 text-amber-600 fill-amber-500" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            विद्या भारती प्रो फीचर (Pro ERP Suite)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
            360° समग्र प्रगति पत्र (Holistic Report Cards)
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-lg mx-auto leading-relaxed">
            NEP 2020 एवं विद्या भारती 5 आधार विषयों (योग, शारीरिक, संगीत, संस्कृत, नैतिक शिक्षा) सहित डिजिटल अंकसूची मुद्रण केवल प्रो योजना में उपलब्ध है।
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() =>
              onOpenUpgradeModal({
                name: '360° समग्र प्रगति पत्र (Report Cards)',
                desc: 'CBSE एवं NEP 2020 अनुरूप 360° समग्र प्रगति पत्र अंकसूची तैयार करने हेतु प्रो योजना सक्रिय करें।'
              })
            }
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 inline-flex items-center gap-2 transition transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Crown className="w-4 h-4 text-yellow-200 fill-yellow-300" />
            <span>प्रो में अपग्रेड करें (Unlock Pro Plan)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-200">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            प्रगति पत्र मूल्यांकन (Pragati Patra Report Cards)
          </h3>
          <p className="text-xs text-stone-500">
            सत्र 2025-26 • त्रैमासिक, अर्धवार्षिक एवं वार्षिक परीक्षा परिणाम तथा पंचमुखी संस्कार मूल्यांकन
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <label className="font-bold text-stone-700">परीक्षा सत्र:</label>
            <select
              value={reportTermFilter}
              onChange={e => setReportTermFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 text-xs focus:ring-2 focus:ring-orange-500 shadow-2xs cursor-pointer"
            >
              <option value="All">समस्त परीक्षाएं (All)</option>
              <option value="त्रैमासिक">त्रैमासिक परीक्षा (Traimasik)</option>
              <option value="अर्धवार्षिक">अर्धवार्षिक परीक्षा (Ardhvarshik)</option>
              <option value="वार्षिक">वार्षिक परीक्षा (Varshik)</option>
            </select>
          </div>
          <button
            onClick={onOpenTabulationModal}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            title="कक्षावार समग्र परीक्षा परिणाम सारणी देखें व प्रिंट करें"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>समग्र परीक्षा परिणाम सारणी (TR Sheet)</span>
          </button>
        </div>
      </div>

      {/* Report cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.filter(
          report => reportTermFilter === 'All' || (report.examTerm && report.examTerm.includes(reportTermFilter))
        ).length === 0 ? (
          <div className="col-span-full p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 text-xs">
            चयनित परीक्षा ({reportTermFilter === 'All' ? 'समस्त' : reportTermFilter}) के लिए अभी कोई प्रगति पत्र उपलब्ध नहीं है।
          </div>
        ) : (
          reportCards
            .filter(
              report => reportTermFilter === 'All' || (report.examTerm && report.examTerm.includes(reportTermFilter))
            )
            .map(report => {
              const student = students.find(s => s.id === report.studentId);
              if (!student) return null;

              return (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-amber-50/50 to-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                          {report.examTerm}
                        </span>
                        <h4 className="text-base font-bold text-stone-900 mt-1">
                          {student.name}
                        </h4>
                        <p className="text-xs text-stone-600">
                          अनुक्रमांक: <strong>{student.rollNo}</strong> • {student.class} '{student.section}'
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-orange-800">
                          {report.percentage.toFixed(1)}%
                        </span>
                        <span className="block text-[10px] font-bold text-stone-500 uppercase">
                          श्रेणी: {report.grade.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Marks preview snapshot */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-stone-200/80 my-2">
                      {report.marks.slice(0, 4).map((m, idx) => (
                        <div key={idx} className="flex justify-between text-stone-700">
                          <span className="truncate pr-1">{m.subject.split(' ')[0]}:</span>
                          <span className="font-bold">{m.marksObtained}/{m.maxMarks}</span>
                        </div>
                      ))}
                    </div>

                    {/* Panchmukhi 360 snapshot */}
                    {report.panchmukhiEvaluation && (
                      <div className="flex flex-wrap gap-1 my-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-950">
                          🏃 शारीरिक: {report.panchmukhiEvaluation.sharirik.grade}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-950">
                          🧘 योग: {report.panchmukhiEvaluation.yog.grade}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-950">
                          🎵 संगीत: {report.panchmukhiEvaluation.sangeet.grade}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-950">
                          📜 संस्कृत: {report.panchmukhiEvaluation.sanskrit.grade}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-950">
                          🪷 नैतिक: {report.panchmukhiEvaluation.naitik.grade}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-stone-600 italic line-clamp-2 mt-2">
                      "{report.acharyaRemarks}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-green-700">
                        संस्कार: {report.moralConduct}
                      </span>
                      <span className="text-[10px] bg-amber-100 text-orange-900 font-bold px-1.5 py-0.5 rounded-full border border-amber-300">
                        NEP 2020 HPC
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          requirePro(
                            'व्हाट्सएप प्रगति पत्र (WhatsApp Report Cards)',
                            'परीक्षा फल एवं पंचमुखी प्रगति पत्र 1-क्लिक में अभिभावक के व्हाट्सएप पर भेजें।',
                            () => {
                              const pe = report.panchmukhiEvaluation;
                              const url = generateReportCardWhatsAppLink({
                                studentName: student.name,
                                className: `${student.class} '${student.section}'`,
                                rollNo: student.rollNo,
                                term: report.examTerm,
                                academicYear: report.academicYear,
                                percentage: report.percentage,
                                grade: report.grade,
                                moralConduct: report.moralConduct,
                                acharyaRemarks: report.acharyaRemarks,
                                panchmukhi: pe
                                  ? {
                                      sharirikGrade: pe.sharirik?.grade || 'O',
                                      yogGrade: pe.yog?.grade || 'A+',
                                      sangeetGrade: pe.sangeet?.grade || 'A',
                                      sanskritGrade: pe.sanskrit?.grade || 'O',
                                      naitikGrade: pe.naitik?.grade || 'O'
                                    }
                                  : undefined,
                                schoolName: currentSchool.hindiName || currentSchool.name,
                                phone: student.contact
                              });
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }
                          );
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        title="अभिभावक को व्हाट्सएप पर भेजें"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>व्हाट्सएप</span>
                      </button>
                      <button
                        onClick={() => onOpenReportModal({ report, student })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-700 hover:bg-orange-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>प्रगति पत्र देखें / प्रिंट</span>
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `क्या आप ${student.name} का ${report.examTerm} का प्रगति पत्र स्थायी रूप से हटाना चाहते हैं?`
                            )
                          ) {
                            deleteReportCard(report.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded transition inline-flex items-center cursor-pointer"
                        title="प्रगति पत्र हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

