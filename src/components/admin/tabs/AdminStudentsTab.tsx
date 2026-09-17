import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { exportStudentsToCSV } from '../../../utils/csvExport';
import { downloadUdisePlusCSV } from '../../../utils/udiseExport';
import { SSM_CLASSES, type Student, type ReportCard } from '../../../types';
import {
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  IdCard,
  Plus,
  Camera,
  Edit3,
  Trash2
} from 'lucide-react';

interface AdminStudentsTabProps {
  totalBhaiya: number;
  totalBahin: number;
  requirePro: (featureName: string, featureDesc: string, onAllowed: () => void) => void;
  onOpenAddStudent: () => void;
  onOpenEditStudent?: (student: Student) => void;
  onOpenBulkImport: () => void;
  onOpenBulkIdCard: () => void;
  onOpenPhotoUpload: (student: Student) => void;
  onOpenIdCard: (student: Student) => void;
  onOpenTc: (student: Student) => void;
  onOpenReportModal: (modal: { report: ReportCard; student: Student }) => void;
  onOpenCharacterCertificate: (student: Student) => void;
  onOpenBonafideCertificate: (student: Student) => void;
}

const AdminStudentsTabComponent: React.FC<AdminStudentsTabProps> = ({
  totalBhaiya,
  totalBahin,
  requirePro,
  onOpenAddStudent,
  onOpenEditStudent,
  onOpenBulkImport,
  onOpenBulkIdCard,
  onOpenPhotoUpload,
  onOpenIdCard,
  onOpenTc,
  onOpenReportModal,
  onOpenCharacterCertificate,
  onOpenBonafideCertificate
}) => {
  const { students, currentSchool, deleteStudent, reportCards } = useSchool();
  const { showSuccess, showInfo } = useToast();
  const isPro = currentSchool.plan === 'pro';
  const totalStudents = students.length;

  // Student directory filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');

  // Filtered students (memoized search & filter)
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter(student => {
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.rollNo.toLowerCase().includes(q) ||
        student.fatherName.toLowerCase().includes(q);
      const matchesClass =
        selectedClass === 'ALL' ||
        student.class === selectedClass ||
        student.class.startsWith(selectedClass + ' ');
      const matchesGender = selectedGender === 'ALL' || student.gender === selectedGender;
      return matchesSearch && matchesClass && matchesGender;
    });
  }, [students, searchQuery, selectedClass, selectedGender]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900">
            छात्र पंजिका (Student Directory)
          </h3>
          <p className="text-xs text-stone-500">
            कुल नामांकित: {totalStudents} (भैया: {totalBhaiya}, बहिन: {totalBahin})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="खोजें (नाम, अनुक्रमांक)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
          >
            <option value="ALL">सभी कक्षाएं (All Classes)</option>
            {SSM_CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>

          <select
            value={selectedGender}
            onChange={e => setSelectedGender(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
          >
            <option value="ALL">सभी (भैया/बहिन)</option>
            <option value="Bhaiya">केवल भैया</option>
            <option value="Bahin">केवल बहिन</option>
          </select>

          <button
            onClick={() => {
              exportStudentsToCSV(filteredStudents.length > 0 ? filteredStudents : students);
              showSuccess('छात्र पंजिका CSV / Excel सफलतापूर्वक डाउनलोड हो गई है।');
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-stone-700 hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
            title="Export Student Directory to CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-green-400" />
            <span>CSV निर्यात</span>
          </button>

          <button
            onClick={() => {
              downloadUdisePlusCSV(filteredStudents.length > 0 ? filteredStudents : students, currentSchool);
              showSuccess('UDISE+ SDMS सरकारी प्रारूप CSV सफलतापूर्वक डाउनलोड हो गई है।');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
            title="भारत सरकार UDISE+ SDMS आधिकारिक बैच प्रारूप (21 कॉलम) में CSV निर्यात करें"
          >
            <FileText className="w-3.5 h-3.5 text-blue-200" />
            <span>UDISE+ निर्यात</span>
          </button>

          <button
            onClick={onOpenBulkImport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
            title="एक्सेल या CSV फ़ाइल से एक साथ कई छात्र जोड़ें (Bulk Import)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span>एक्सेल आयात</span>
          </button>

          <button
            onClick={onOpenBulkIdCard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
            title="कक्षावार A4 शीट पर 8 परिचय पत्र एक साथ प्रिंट करें"
          >
            <IdCard className="w-3.5 h-3.5 text-yellow-200" />
            <span>बल्क आईडी कार्ड</span>
          </button>

          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>छात्र जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
            <tr>
              <th className="p-3">अनुक्रमांक</th>
              <th className="p-3">छात्र का नाम</th>
              <th className="p-3">कक्षा एवं वर्ग</th>
              <th className="p-3">पिता का नाम</th>
              <th className="p-3">माता का नाम</th>
              <th className="p-3">संपर्क नंबर</th>
              <th className="p-3">रक्त समूह</th>
              <th className="p-3 text-right">कार्य (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-stone-500">
                  कोई छात्र नहीं मिला।
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-stone-50">
                  <td className="p-3 font-mono font-bold text-orange-950">{student.rollNo}</td>
                  <td className="p-3 font-semibold text-stone-900">
                    <div className="flex items-center gap-2">
                      {student.photoUrl ? (
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover border border-orange-300 shrink-0"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs shrink-0">
                          {student.gender === 'Bhaiya' ? '👦' : '👧'}
                        </span>
                      )}
                      <div>
                        <div className="flex items-center">
                          <span>{student.name}</span>
                          <span
                            className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              student.gender === 'Bhaiya'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-pink-100 text-pink-800'
                            }`}
                          >
                            {student.gender}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5 text-[10px]">
                          {student.pen ? (
                            <span
                              className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-bold"
                              title="UDISE+ Permanent Education Number (स्थायी शिक्षा संख्या)"
                            >
                              PEN: {student.pen}
                            </span>
                          ) : (
                            <span
                              className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 border border-stone-200 font-mono"
                              title="UDISE+ PEN अभी दर्ज नहीं है"
                            >
                              PEN: —
                            </span>
                          )}
                          {student.socialCategory && (
                            <span
                              className="px-1 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold"
                              title="सामाजिक श्रेणी"
                            >
                              {student.socialCategory}
                            </span>
                          )}
                          {student.cwsn && (
                            <span
                              className="px-1 py-0.2 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200"
                              title="Children with Special Needs (दिव्यांग)"
                            >
                              CWSN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-stone-700">{student.class} '{student.section}'</td>
                  <td className="p-3 text-stone-600">{student.fatherName}</td>
                  <td className="p-3 text-stone-600">{student.motherName}</td>
                  <td className="p-3 text-stone-600">{student.contact}</td>
                  <td className="p-3 text-stone-600 font-mono">{student.bloodGroup}</td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onOpenPhotoUpload(student)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      title="Upload Passport Photo (पासपोर्ट फोटो अपलोड)"
                    >
                      <Camera className="w-3 h-3 text-amber-700" />
                      <span>फोटो</span>
                    </button>
                    {onOpenEditStudent && (
                      <button
                        onClick={() => onOpenEditStudent(student)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition"
                        title="Edit Student Details (छात्र विवरण संपादित करें)"
                      >
                        <Edit3 className="w-3 h-3 text-stone-600" />
                        <span>संपादन</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenIdCard(student)}
                      className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 text-orange-950 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition"
                      title="Print Student ID Card"
                    >
                      <IdCard className="w-3 h-3 text-orange-700" />
                      <span>परिचय पत्र</span>
                    </button>
                    <button
                      onClick={() => onOpenTc(student)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition"
                      title="Print Transfer Certificate (स्थानांतरण प्रमाण पत्र)"
                    >
                      <FileText className="w-3 h-3 text-orange-700" />
                      <span>टी.सी. (TC)</span>
                    </button>
                    <button
                      onClick={() => {
                        const report = reportCards.find(r => r.studentId === student.id);
                        if (report) {
                          onOpenReportModal({ report, student });
                        } else {
                          showInfo(`'${student.name}' का प्रगति पत्र अभी जनरेट नहीं किया गया है।`);
                        }
                      }}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-orange-900 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition"
                      title="View Report Card"
                    >
                      <span>प्रगति पत्र</span>
                    </button>
                    <button
                      onClick={() => onOpenCharacterCertificate(student)}
                      className="px-2 py-1 bg-stone-100 hover:bg-orange-100 text-stone-800 hover:text-orange-950 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer border border-stone-200"
                      title="Print Character Certificate (चरित्र प्रमाण पत्र)"
                    >
                      <span>📜 चरित्र</span>
                    </button>
                    <button
                      onClick={() => onOpenBonafideCertificate(student)}
                      className="px-2 py-1 bg-stone-100 hover:bg-orange-100 text-stone-800 hover:text-orange-950 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer border border-stone-200"
                      title="Print Bonafide Certificate (अध्ययनरत प्रमाण पत्र)"
                    >
                      <span>📄 अध्ययनरत</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`क्या आप '${student.name}' का रिकॉर्ड हटाना चाहते हैं?`)) {
                          deleteStudent(student.id);
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete Student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminStudentsTab = React.memo(AdminStudentsTabComponent);
