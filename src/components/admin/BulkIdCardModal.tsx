import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Student, School } from '../../types';
import { Printer, X, ShieldCheck, Filter, Users, ArrowLeft, Camera, Download } from 'lucide-react';

interface BulkIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  school: School;
}

export const BulkIdCardModal: React.FC<BulkIdCardModalProps> = ({
  isOpen,
  onClose,
  students,
  school
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  if (!isOpen) return null;

  // Extract unique classes
  const classes = Array.from(new Set(students.map(s => s.class))).sort();

  const filteredStudents = selectedClass === 'ALL'
    ? students
    : students.filter(s => s.class === selectedClass);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPhotos = () => {
    const studentsWithPhotos = filteredStudents.filter(s => s.photoUrl);
    
    // 1. Generate an offline standalone HTML package with photos organized by Roll No and PEN
    const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>बोर्ड परीक्षा फ़ोटो संग्रह - ${school.hindiName || school.name} (${selectedClass})</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f4; margin: 0; padding: 24px; color: #1c1917; }
    .header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #ea580c; }
    .header h1 { margin: 0; color: #7c2d12; font-size: 24px; }
    .header p { margin: 4px 0 0; color: #78716c; font-size: 13px; }
    .actions { text-align: center; margin-bottom: 20px; }
    .btn { background: #ea580c; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-block; font-size: 13px; margin: 0 4px; }
    .btn:hover { background: #c2410c; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
    .card { background: white; border: 1px solid #e7e5e4; border-radius: 12px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .photo-box { width: 120px; height: 140px; margin: 0 auto 10px; border: 1px solid #d6d3d1; border-radius: 8px; overflow: hidden; background: #fafaf9; display: flex; align-items: center; justify-content: center; }
    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
    .no-photo { font-size: 40px; color: #a8a29e; }
    .info-name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
    .info-tag { font-family: monospace; font-size: 11px; background: #ffedd5; color: #9a3412; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 4px; }
    .info-pen { font-family: monospace; font-size: 11px; color: #15803d; font-weight: 600; }
    .dl-link { display: inline-block; margin-top: 8px; font-size: 11px; color: #ea580c; text-decoration: underline; font-weight: bold; }
    @media print {
      body { background: white; padding: 0; }
      .actions, .dl-link { display: none; }
      .grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
      .card { page-break-inside: avoid; border: 1px solid #999; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${school.hindiName || school.name}</h1>
    <p>बोर्ड परीक्षा / UDISE+ छात्र पासपोर्ट फ़ोटो संकलन • कक्षा: ${selectedClass === 'ALL' ? 'समस्त कक्षाएं' : selectedClass} • कुल छात्र: ${filteredStudents.length} • फ़ोटो उपलब्ध: ${studentsWithPhotos.length}</p>
  </div>
  <div class="actions">
    <button class="btn" onclick="window.print()">🖨️ फ़ोटो शीट प्रिंट करें (Print Photo Sheet)</button>
  </div>
  <div class="grid">
    ${filteredStudents.map(std => {
      const filename = `${std.rollNo}_${std.pen || 'NOPEN'}_${std.name.replace(/\\s+/g, '_')}.jpg`;
      return `
      <div class="card">
        <div class="photo-box">
          ${std.photoUrl ? `<img src="${std.photoUrl}" alt="${std.name}" />` : `<div class="no-photo">${std.gender === 'Bahin' ? '👧' : '👦'}</div>`}
        </div>
        <div class="info-name">${std.name}</div>
        <div><span class="info-tag">अनुक्रमांक: ${std.rollNo}</span></div>
        <div class="info-pen">PEN: ${std.pen || 'उपलब्ध नहीं'}</div>
        <div style="font-size: 11px; color: #78716c; margin-top: 2px;">कक्षा: ${std.class}</div>
        ${std.photoUrl ? `<a class="dl-link" href="${std.photoUrl}" download="${filename}">⬇️ फ़ोटो डाउनलोड (${filename})</a>` : ''}
      </div>`;
    }).join('')}
  </div>
</body>
</html>`;

    // Download the HTML photo package
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Board_Exam_Photos_${selectedClass}_${school.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also download a structured JSON photo catalog
    const jsonCatalog = {
      schoolId: school.id,
      schoolName: school.name,
      academicYear: school.currentAcademicYear || '2025-26',
      class: selectedClass,
      exportedAt: new Date().toISOString(),
      studentsCount: filteredStudents.length,
      photosCount: studentsWithPhotos.length,
      students: filteredStudents.map(std => ({
        rollNo: std.rollNo,
        pen: std.pen || null,
        name: std.name,
        gender: std.gender,
        class: std.class,
        section: std.section,
        fatherName: std.fatherName,
        dob: std.dob,
        photoFilename: `${std.rollNo}_${std.pen || 'NOPEN'}_${std.name.replace(/\\s+/g, '_')}.jpg`,
        hasPhoto: Boolean(std.photoUrl),
        photoDataUrl: std.photoUrl || null
      }))
    };
    const jsonBlob = new Blob([JSON.stringify(jsonCatalog, null, 2)], { type: 'application/json' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement('a');
    jsonLink.href = jsonUrl;
    jsonLink.download = `Board_Exam_Photos_Index_${selectedClass}_${school.id}.json`;
    document.body.appendChild(jsonLink);
    jsonLink.click();
    document.body.removeChild(jsonLink);
    URL.revokeObjectURL(jsonUrl);
  };

  return createPortal(
    <div className="printable-modal fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-sm flex flex-col p-2 sm:p-6 print:static print:p-0 print:bg-white print:overflow-visible">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-stone-900 text-white rounded-2xl p-4 mb-4 shadow-xl border border-stone-800 flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
            title="वापस जाएं (Back)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">वापस</span>
          </button>
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white text-lg shrink-0">
            🪷
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-amber-100 flex items-center gap-2 truncate">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">कक्षावार परिचय पत्र (Bulk Student ID Cards)</span>
            </h3>
            <p className="text-xs text-stone-400 truncate">
              A4 शीट पर मुद्रण हेतु अनुकूलित • 8 कार्ड प्रति पृष्ठ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-stone-900 text-white">समस्त कक्षाएं (All Classes)</option>
              {classes.map(cls => (
                <option key={cls} value={cls} className="bg-stone-900 text-white">{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/80 text-orange-300 border border-orange-800 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>कुल छात्र: {filteredStudents.length}</span>
          </div>

          <button
            onClick={handleExportPhotos}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl border border-stone-700 shadow-md transition cursor-pointer"
            title="बोर्ड परीक्षा / UDISE+ हेतु छात्रों के पासपोर्ट फ़ोटो का ज़िप/HTML व JSON संग्रह निर्यात करें"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>📸 बोर्ड फ़ोटो संग्रह निर्यात</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>प्रिंट करें (Print / Save PDF)</span>
          </button>

          <button
            onClick={onClose}
            title="बंद करें (Close)"
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Grid of ID Cards */}
      <div className="bg-stone-200/50 rounded-3xl p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full print:bg-white print:p-0 print:m-0 print:max-w-none">
        
        {filteredStudents.length === 0 ? (
          <div className="text-center py-20 text-stone-500 font-semibold bg-white rounded-2xl border border-stone-300">
            चयनित कक्षा में कोई छात्र नामांकित नहीं हैं।
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 print:grid-cols-2 print:gap-3">
            {filteredStudents.map((std, idx) => (
              <div
                key={std.id}
                className="bg-white rounded-2xl border-2 border-dashed border-stone-300 overflow-hidden shadow-xs print:shadow-none print:border-dashed print:border-stone-400 flex flex-col justify-between break-inside-avoid print:mb-2"
                style={{ minHeight: '235px' }}
              >
                {/* ID Card Header */}
                <div className="bg-gradient-to-r from-orange-700 via-amber-600 to-red-700 text-white p-2.5 flex items-center justify-between border-b-2 border-yellow-400">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white text-orange-700 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      🪷
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-tight leading-tight line-clamp-1">
                        {school.hindiName || school.name}
                      </h4>
                      <p className="text-[9px] text-yellow-200 uppercase tracking-wider font-semibold">
                        {school.prant} • विद्या भारती अखिल भारतीय शिक्षा संस्थान
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-black/30 font-bold font-mono">
                      सत्र {school.currentAcademicYear || '2025-26'}
                    </span>
                  </div>
                </div>

                {/* ID Card Body */}
                <div className="p-3 flex items-start gap-3 bg-gradient-to-b from-amber-50/20 to-white flex-1">
                  {/* Photo Display */}
                  <div className="w-20 h-24 rounded-xl border-2 border-orange-300 bg-stone-100 flex flex-col items-center justify-center text-center shrink-0 p-1 overflow-hidden">
                    {std.photoUrl ? (
                      <img
                        src={std.photoUrl}
                        alt={std.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <span className="text-2xl mb-1">
                          {std.gender === 'Bahin' ? '👧' : '👦'}
                        </span>
                        <span className="text-[8px] font-bold text-stone-500 uppercase tracking-tighter">
                          फोटो (PHOTO)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-[11px] leading-tight flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <strong className="text-xs sm:text-sm font-black text-stone-900 truncate">
                        {std.name}
                      </strong>
                      <span className="font-mono font-bold text-orange-800 bg-orange-100 px-1.5 py-0.2 rounded text-[10px] shrink-0">
                        अनु.: {std.rollNo}
                      </span>
                    </div>

                    <div className="text-stone-700 flex items-center gap-2">
                      <span>कक्षा: <strong className="text-stone-900">{std.class} - {std.section}</strong></span>
                      {std.bloodGroup && (
                        <span className="text-red-700 font-bold bg-red-50 px-1.5 py-0.2 rounded border border-red-200 text-[10px]">
                          रक्त: {std.bloodGroup}
                        </span>
                      )}
                    </div>

                    {std.pen && (
                      <div className="text-stone-600 font-mono text-[10px]">
                        PEN: <span className="font-bold text-emerald-800">{std.pen}</span>
                      </div>
                    )}

                    {std.fatherName && (
                      <div className="text-stone-600 truncate">
                        पिता: <span className="font-semibold text-stone-800">{std.fatherName}</span>
                      </div>
                    )}

                    {std.dob && (
                      <div className="text-stone-600">
                        जन्मतिथि: <span className="font-mono text-stone-800">{std.dob}</span>
                      </div>
                    )}

                    <div className="text-stone-600 truncate">
                      पता: <span className="text-stone-800">{std.address || school.city}</span>
                    </div>

                    <div className="text-stone-600">
                      आपातकालीन फोन: <strong className="text-stone-900 font-mono">{std.contact}</strong>
                    </div>
                  </div>
                </div>

                {/* ID Card Footer */}
                <div className="px-3 py-1.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[9px] text-stone-600">
                  <div className="italic text-orange-950 font-serif font-semibold truncate max-w-[200px]">
                    "{school.tagline || 'सा विद्या या विमुक्तये'}"
                  </div>
                  <div className="text-right shrink-0">
                    <span className="border-t border-stone-800 pt-0.5 px-2 font-bold text-[9px] block text-stone-800">
                      प्रधानाचार्य हस्ताक्षर
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print styling helper */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

