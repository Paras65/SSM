import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { exportStudentsToCSV } from '../../../utils/csvExport';
import { downloadUdisePlus42ColumnCSV } from '../../../utils/udiseExport';
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
  Trash2,
  BookOpen,
  Printer
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
  onOpenDakhilKharij?: () => void;
  onOpenRegisterScanner?: (selectedClass?: string) => void;
  onOpenPrintableAdmissionForm?: () => void;
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
  onOpenBonafideCertificate,
  onOpenDakhilKharij,
  onOpenRegisterScanner,
  onOpenPrintableAdmissionForm
}) => {
  const { students, currentSchool, deleteStudent, reportCards } = useSchool();
  const { showSuccess, showInfo } = useToast();
  const isPro = currentSchool.plan === 'pro';
  const totalStudents = students.length;

  // Student directory filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');

  // Delete student confirmation state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    const studentName = studentToDelete.name;
    setIsDeleting(true);
    try {
      await deleteStudent(studentToDelete.id);
      showSuccess(`'${studentName}' का रिकॉर्ड सफलतापूर्वक हटाया गया!`);
    } catch {
      // deleteStudent in SchoolContext handles rollback and error toast
    } finally {
      setIsDeleting(false);
      setStudentToDelete(null);
    }
  };

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
    <div className="bg-white rounded-2xl border border-stone-200 p-3.5 sm:p-6 space-y-4 sm:space-y-5">
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
              downloadUdisePlus42ColumnCSV(filteredStudents.length > 0 ? filteredStudents : students, currentSchool);
              showSuccess('UDISE+ SDMS 42-कॉलम मास्टर प्रारूप CSV सफलतापूर्वक डाउनलोड हो गई है।');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
            title="भारत सरकार UDISE+ SDMS आधिकारिक बैच प्रारूप (42 कॉलम) में CSV निर्यात करें"
          >
            <FileText className="w-3.5 h-3.5 text-blue-200" />
            <span>UDISE+ निर्यात (42-Col)</span>
          </button>

          {onOpenDakhilKharij && (
            <button
              onClick={onOpenDakhilKharij}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
              title="दाखिल-खारिज पंजिका (General Admission & Withdrawal Register / S.R. Register)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-200" />
              <span>दाखिल-खारिज पंजिका</span>
            </button>
          )}

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

          {onOpenRegisterScanner && (
            <button
              onClick={() => onOpenRegisterScanner(selectedClass !== 'ALL' ? selectedClass : undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
              title="हार्ड कॉपी रजिस्टर या फॉर्म की फोटो खींचकर सीधे AI से छात्र जोड़ें (Direct Scan)"
            >
              <Camera className="w-3.5 h-3.5 text-yellow-200" />
              <span>रजिस्टर डायरेक्ट स्कैन</span>
            </button>
          )}

          {onOpenPrintableAdmissionForm && (
            <button
              onClick={onOpenPrintableAdmissionForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
              title="ऑफलाइन प्रवेश हेतु रिक्त A4 छात्र प्रवेश प्रपत्र प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5 text-orange-600" />
              <span>रिक्त प्रवेश प्रपत्र</span>
            </button>
          )}

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
                          {student.apaarId && (
                            <span
                              className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-800 border border-purple-200 font-mono font-bold"
                              title="APAAR ID (12-अंक, भारत सरकार)"
                            >
                              APAAR: {student.apaarId}
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
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition active:scale-95"
                      title="Print Character Certificate (चरित्र प्रमाण पत्र)"
                    >
                      <span>📜 चरित्र</span>
                    </button>
                    <button
                      onClick={() => onOpenBonafideCertificate(student)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition active:scale-95"
                      title="Print Bonafide Certificate (अध्ययनरत प्रमाण पत्र)"
                    >
                      <span>📄 अध्ययनरत</span>
                    </button>
                    <button
                      onClick={() => setStudentToDelete(student)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition"
                      title="Delete Student (छात्र रिकॉर्ड हटाएं)"
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

      {/* Styled Delete Confirmation Dialog */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-base">छात्र रिकॉर्ड हटाएं</h4>
                <p className="text-xs text-stone-500">स्थायी विलोपन पुष्टि (Permanent Deletion)</p>
              </div>
            </div>
            
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1 text-xs text-stone-700">
              <p className="leading-relaxed">
                क्या आप निश्चित रूप से छात्र <strong>"{studentToDelete.name}"</strong> का रिकॉर्ड हटाना चाहते हैं?
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-semibold text-rose-950">
                <span>कक्षा: {studentToDelete.class} ({studentToDelete.section || 'A'})</span>
                <span>•</span>
                <span>अनुक्रमांक: {studentToDelete.rollNo}</span>
                {studentToDelete.pen && (
                  <>
                    <span>•</span>
                    <span className="font-mono">PEN: {studentToDelete.pen}</span>
                  </>
                )}
              </div>
            </div>

            <p className="text-[11px] text-stone-500">
              ⚠️ ध्यान दें: छात्र का रिकॉर्ड हटाने पर उनकी संबंधित उपस्थिति व परीक्षा प्रविष्टियां भी स्वतः हटा दी जाएंगी।
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <span>हटाया जा रहा है...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>हां, हटाएं</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminStudentsTab = React.memo(AdminStudentsTabComponent);
