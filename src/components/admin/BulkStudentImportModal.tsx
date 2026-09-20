import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import type { Student, Gender, SocialCategory } from '../../types';
import { parseCsvLine, downloadStudentCsvTemplate } from '../../utils/csvExport';
import {
  Upload,
  Download,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  ArrowRight,
  Loader2,
  Trash2,
  Sparkles
} from 'lucide-react';

interface BulkStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkStudentImportModal: React.FC<BulkStudentImportModalProps> = ({ isOpen, onClose }) => {
  const { bulkAddStudents, currentSchool, students } = useSchool();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvData, setCsvData] = useState<Partial<Student>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Download unified sample CSV template (Single Source of Truth)
  const downloadSampleCsv = () => {
    downloadStudentCsvTemplate(currentSchool?.id);
  };



  // Handle uploaded CSV file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccessCount(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('कृपया केवल .csv प्रारूप की फ़ाइल अपलोड करें।');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          setError('फ़ाइल रिक्त है।');
          return;
        }

        const lines = text
          .split(/\r\n|\n/)
          .map(l => l.trim())
          .filter(l => l.length > 0);

        if (lines.length < 2) {
          setError('CSV में कम से कम एक शीर्षक (header) और एक छात्र रिकॉर्ड होना चाहिए।');
          return;
        }

        // Header mapping
        const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const findCol = (keys: string[]): number => {
          return headers.findIndex(h => keys.some(k => h.includes(k)));
        };

        const colRoll = findCol(['roll', 'anukramank', 'rollno']);
        const colName = findCol(['name', 'naam', 'student', 'chhatra']);
        const colGender = findCol(['gender', 'ling', 'bhaiya', 'bahin', 'sex']);
        const colClass = findCol(['class', 'kaksha', 'grade']);
        const colSection = findCol(['section', 'varg', 'sec']);
        const colFather = findCol(['father', 'pita', 'guardian']);
        const colMother = findCol(['mother', 'mata']);
        const colContact = findCol(['contact', 'phone', 'mobile', 'sampark']);
        const colAddress = findCol(['address', 'pata', 'city']);
        const colDob = findCol(['dob', 'birth', 'janma']);
        const colAdmissionDate = findCol(['admissiondate', 'admitdate', 'praveshtithi', 'pravesh', 'admission']);
        const colBlood = findCol(['blood', 'rakta']);
        const colPen = findCol(['pen', 'permanenteducationnumber']);
        const colApaar = findCol(['apaar', 'apaarid']);
        const colCategory = findCol(['socialcategory', 'category', 'varg', 'jati', 'caste']);
        const colFamilyId = findCol(['familyid', 'family', 'parivar']);
        const colCwsn = findCol(['cwsn', 'divyang', 'specialneeds']);
        const colBpl = findCol(['bpl', 'ews']);

        const parsed: Partial<Student>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = parseCsvLine(lines[i]);
          if (row.length === 0 || row.every(c => c === '')) continue;

          const rawGender = colGender !== -1 ? row[colGender]?.toLowerCase() : '';
          const gender: Gender = rawGender.includes('bahin') || rawGender === 'f' || rawGender === 'female' ? 'Bahin' : 'Bhaiya';

          const rawCategory = colCategory !== -1 ? (row[colCategory] || '').trim() : '';
          let socialCategory: SocialCategory = 'General';
          if (/obc/i.test(rawCategory)) socialCategory = 'OBC';
          else if (/st/i.test(rawCategory) && !/sc/i.test(rawCategory)) socialCategory = 'ST';
          else if (/sc/i.test(rawCategory)) socialCategory = 'SC';

          const rawCwsn = colCwsn !== -1 ? (row[colCwsn] || '').toLowerCase() : '';
          const cwsn = rawCwsn === 'yes' || rawCwsn === 'true' || rawCwsn === 'हाँ' || rawCwsn === '1';

          const rawBpl = colBpl !== -1 ? (row[colBpl] || '').toLowerCase() : '';
          const bpl = rawBpl === 'yes' || rawBpl === 'true' || rawBpl === 'हाँ' || rawBpl === '1';

          const rawAdmission = colAdmissionDate !== -1 ? (row[colAdmissionDate] || '').trim() : '';
          const admissionDate = rawAdmission || new Date().toISOString().split('T')[0];

          const student: Partial<Student> = {
            rollNo: (colRoll !== -1 ? row[colRoll] : (100 + i).toString()) || (100 + i).toString(),
            name: (colName !== -1 ? row[colName] : `छात्र ${i}`) || `छात्र ${i}`,
            gender,
            class: (colClass !== -1 ? row[colClass] : 'Class 6') || 'Class 6',
            section: (colSection !== -1 ? row[colSection] : 'A') || 'A',
            fatherName: (colFather !== -1 ? row[colFather] : 'श्री अभिभावक') || 'श्री अभिभावक',
            motherName: (colMother !== -1 ? row[colMother] : 'श्रीमती माता जी') || 'श्रीमती माता जी',
            contact: (colContact !== -1 ? row[colContact] : '+91 98765 43210') || '+91 98765 43210',
            address: (colAddress !== -1 ? row[colAddress] : currentSchool.city || 'गोरखपुर') || 'गोरखपुर',
            dob: (colDob !== -1 ? row[colDob] : '2014-01-01') || '2014-01-01',
            admissionDate,
            bloodGroup: (colBlood !== -1 ? row[colBlood] : 'B+') || 'B+',
            pen: colPen !== -1 ? (row[colPen] || '').trim() : '',
            apaarId: colApaar !== -1 ? (row[colApaar] || '').trim() : '',
            socialCategory,
            familyId: colFamilyId !== -1 ? (row[colFamilyId] || '').trim() : '',
            cwsn,
            bpl
          };

          parsed.push(student);
        }


        if (parsed.length === 0) {
          setError('CSV फ़ाइल से कोई वैध छात्र रिकॉर्ड प्राप्त नहीं हुआ।');
          return;
        }

        setCsvData(parsed);
      } catch (err: any) {
        setError('CSV फ़ाइल को पढ़ने में त्रुटि हुई: ' + err.message);
      }
    };

    reader.readAsText(file, 'UTF-8');
  };

  // Perform bulk import
  const handleImport = async () => {
    if (csvData.length === 0) return;
    setIsImporting(true);
    setError('');

    const isPro = currentSchool?.plan === 'pro';
    if (!isPro && ((students?.length || 0) + csvData.length > 100)) {
      setError(`निःशुल्क सेवा योजना में अधिकतम 100 छात्रों का प्रबंधन अनुमत है। वर्तमान में ${students?.length || 0} छात्र नामांकित हैं और CSV फ़ाइल में ${csvData.length} छात्र हैं (कुल योग: ${(students?.length || 0) + csvData.length})। असीमित छात्रों हेतु प्रो योजना में अपग्रेड करें।`);
      setIsImporting(false);
      return;
    }

    try {
      const count = await bulkAddStudents(csvData);
      setSuccessCount(count);
      setCsvData([]);
      setFileName('');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'थोक छात्र नामांकन में त्रुटि आई।');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-orange-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-800 via-amber-700 to-orange-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-yellow-300" />
            <div>
              <h3 className="text-base font-bold">एक्सेल / CSV थोक छात्र नामांकन (Bulk Student Import)</h3>
              <p className="text-[11px] text-orange-200">
                सक्रिय शाखा: <strong>{currentSchool.hindiName} ({currentSchool.city})</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="बंद करें"
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Step 1 & 2 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Step 1: Download Template */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block mb-1">
                  चरण 1: प्रारूप डाउनलोड करें
                </span>
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  नमूना CSV टेम्पलेट (Sample Template)
                </h4>
                <p className="text-xs text-stone-600 mb-4">
                  अनुक्रमांक, नाम, कक्षा, वर्ग, माता-पिता, प्रवेश तिथि, PEN, APAAR ID, श्रेणी एवं संपर्क सहित 16-कॉलम शासकीय प्रारूप।
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="w-full py-2.5 px-4 bg-white hover:bg-amber-100 text-orange-950 font-bold text-xs rounded-xl border border-orange-300 shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-orange-700" />
                <span>नमूना CSV डाउनलोड करें</span>
              </button>
            </div>

            {/* Step 2: Upload CSV */}
            <div className="p-4 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-300 hover:border-orange-400 transition flex flex-col justify-between text-center">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  चरण 2: फ़ाइल अपलोड करें
                </span>
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  अपनी CSV फ़ाइल चुनें
                </h4>
                <p className="text-xs text-stone-500 mb-4">
                  {fileName ? `चयनित: ${fileName}` : 'कंप्यूटर से .csv फ़ाइल यहाँ खींचें या चुनें'}
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{fileName ? 'अन्य फ़ाइल बदलें' : 'फ़ाइल चुनें (.csv)'}</span>
              </button>
            </div>

          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <strong className="block text-sm font-bold">
                  सफलतापूर्वक {successCount} छात्रों का नामांकन पूर्ण हुआ!
                </strong>
                <span>सभी रिकॉर्ड्स मोंगोडीबी एवं छात्र पंजिका में सुरक्षित कर दिए गए हैं।</span>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {csvData.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-200">
              
              {/* Summary Stats */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-200 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orange-600" />
                    कुल प्राप्त रिकॉर्ड: <strong className="text-orange-950 text-sm">{csvData.length}</strong>
                  </span>
                  <span className="text-stone-500">|</span>
                  <span className="text-stone-700">
                    भैया: <strong>{csvData.filter(s => s.gender === 'Bhaiya').length}</strong>
                  </span>
                  <span className="text-stone-700">
                    बहिन: <strong>{csvData.filter(s => s.gender === 'Bahin').length}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCsvData([]);
                    setFileName('');
                  }}
                  className="text-stone-500 hover:text-red-600 text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>हटाएं</span>
                </button>
              </div>

              {/* Table Preview (first 10 rows) */}
              <div className="overflow-x-auto border border-stone-200 rounded-xl max-h-56 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 font-bold sticky top-0 border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">अनुक्रमांक</th>
                      <th className="p-2.5">नाम</th>
                      <th className="p-2.5">लिंग</th>
                      <th className="p-2.5">कक्षा</th>
                      <th className="p-2.5">वर्ग</th>
                      <th className="p-2.5">पिता का नाम</th>
                      <th className="p-2.5">संपर्क</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-[11px]">
                    {csvData.slice(0, 10).map((s, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40">
                        <td className="p-2 font-mono font-bold text-orange-900">{s.rollNo}</td>
                        <td className="p-2 font-semibold text-stone-900">{s.name}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            s.gender === 'Bahin' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {s.gender}
                          </span>
                        </td>
                        <td className="p-2 text-stone-700">{s.class}</td>
                        <td className="p-2 text-stone-700">{s.section}</td>
                        <td className="p-2 text-stone-700">{s.fatherName}</td>
                        <td className="p-2 text-stone-600 font-mono">{s.contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {csvData.length > 10 && (
                <p className="text-[11px] text-stone-500 text-center italic">
                  + {csvData.length - 10} अतिरिक्त छात्र रिकॉर्ड्स भी शामिल हैं
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 transition"
          >
            रद्द करें (Cancel)
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={csvData.length === 0 || isImporting}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              csvData.length > 0 && !isImporting
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>नामांकन हो रहा है...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{csvData.length > 0 ? `सभी ${csvData.length} छात्र सुरक्षित करें` : 'छात्र सुरक्षित करें'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
