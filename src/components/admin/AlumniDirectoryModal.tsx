import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Search, Download, Users, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import type { AlumniRecord } from '../public/AlumniRegistrationModal';

interface AlumniDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SAMPLE_ALUMNI: AlumniRecord[] = [
  {
    id: 'VB-ALUMNI-1001',
    name: 'डॉ. विवेक कुमार शर्मा',
    batch: '2004',
    schoolBranch: 'गोरखपुर',
    qualification: 'Ph.D (Aerospace), IIT Bombay',
    profession: 'वरिष्ठ वैज्ञानिक (Senior Scientist)',
    organisation: 'ISRO (भारतीय अंतरिक्ष अनुसंधान संगठन)',
    city: 'बेंगलुरु, कर्नाटक',
    phone: '+91 98765 43210',
    email: 'dr.vivek.sharma@isro.gov.in',
    contributionType: 'करियर मार्गदर्शन एवं विज्ञान कार्यशाला',
    message: 'शिशु मंदिर की वंदना और संस्कार ही मेरी प्रगति का आधार हैं।',
    registeredAt: '2026-01-15T10:30:00.000Z'
  },
  {
    id: 'VB-ALUMNI-1002',
    name: 'मेजर सुमित विक्रम सिंह',
    batch: '2008',
    schoolBranch: 'गोरखपुर',
    qualification: 'M.Sc (Defence Studies), NDA',
    profession: 'मेजर, भारतीय थलसेना (Sena Medal)',
    organisation: 'भारतीय थलसेना (Indian Army)',
    city: 'उधमपुर, जम्मू-कश्मीर',
    phone: '+91 98765 12345',
    email: 'sumit.singh@nic.in',
    contributionType: 'अतिथि व्याख्यान एवं राष्ट्रीय सुरक्षा चर्चा',
    message: 'शिशु मंदिर के देशभक्ति गीतों ने सदैव कर्तव्य पथ पर आगे बढ़ाया।',
    registeredAt: '2026-02-10T14:15:00.000Z'
  },
  {
    id: 'VB-ALUMNI-1003',
    name: 'सुश्री स्वाति मिश्रा',
    batch: '2014',
    schoolBranch: 'गोरखपुर',
    qualification: 'B.Tech, IAS (Rank 42)',
    profession: 'उपजिलाधिकारी (SDM / IAS)',
    organisation: 'उत्तर प्रदेश शासन',
    city: 'वाराणसी, उत्तर प्रदेश',
    phone: '+91 98765 67890',
    email: 'swati.mishra.ias@up.gov.in',
    contributionType: 'मेधावी बहिनों हेतु सिविल सेवा मार्गदर्शन',
    message: 'आचार्यों के आशीर्वाद और अनुशासन ने इस कठिन परीक्षा में सफलता दिलाई।',
    registeredAt: '2026-02-28T09:00:00.000Z'
  },
  {
    id: 'VB-ALUMNI-1004',
    name: 'श्री अतुल गर्ग',
    batch: '2011',
    schoolBranch: 'गोरखपुर',
    qualification: 'B.Tech (CS), MBA',
    profession: 'संस्थापक एवं मुख्य कार्यकारी अधिकारी',
    organisation: 'इंडस टेक सॉल्यूशन्स',
    city: 'नोएडा, उत्तर प्रदेश',
    phone: '+91 98765 99887',
    email: 'atul@industech.in',
    contributionType: 'कंप्यूटर लैब एवं मेधावी छात्रवृत्ति सहयोग',
    message: 'अपने शिशु मंदिर के भैया-बहिनों के लिए 5 कंप्यूटर भेंट करने की योजना है।',
    registeredAt: '2026-03-05T16:45:00.000Z'
  }
];

export const AlumniDirectoryModal: React.FC<AlumniDirectoryModalProps> = ({ isOpen, onClose }) => {
  const [alumniList, setAlumniList] = useState<AlumniRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem('ssm_alumni_list');
      if (stored) {
        const parsed: AlumniRecord[] = JSON.parse(stored);
        if (parsed.length > 0) {
          // Combine user-submitted with defaults without duplicating IDs
          const existingIds = new Set(parsed.map(a => a.id));
          const merged = [...parsed, ...DEFAULT_SAMPLE_ALUMNI.filter(a => !existingIds.has(a.id))];
          setAlumniList(merged);
          return;
        }
      }
    } catch {
      // fallback
    }
    setAlumniList(DEFAULT_SAMPLE_ALUMNI);
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = alumniList.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.batch.includes(q) ||
      (a.profession || '').toLowerCase().includes(q) ||
      (a.organisation || '').toLowerCase().includes(q) ||
      (a.city || '').toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Passing Batch', 'Degree', 'Profession', 'Organisation', 'City', 'Phone', 'Email', 'Contribution Interest', 'Message'];
    const rows = filtered.map(a => [
      a.id,
      `"${a.name}"`,
      a.batch,
      `"${a.qualification || ''}"`,
      `"${a.profession || ''}"`,
      `"${a.organisation || ''}"`,
      `"${a.city || ''}"`,
      a.phone,
      a.email,
      `"${a.contributionType || ''}"`,
      `"${(a.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VB_Alumni_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-orange-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-orange-950 to-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl">
              🎓
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-tight">
                पूर्व छात्र परिषद पंजिका (Alumni Directory)
              </h3>
              <p className="text-xs text-stone-300">
                कुल पंजीकृत पुरातन छात्र: {alumniList.length} • विद्या भारती संजाल
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV डाउनलोड</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-amber-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="नाम, बैच वर्ष (उदा. 2008), पद, या नगर से खोजें..."
              className="w-full pl-10 pr-3 py-2 bg-white border border-orange-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-stone-600 font-semibold">
            दिखाए जा रहे रिकॉर्ड: {filtered.length}
          </span>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto flex-1 p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(alumni => (
              <div
                key={alumni.id}
                className="bg-white rounded-2xl p-4 border border-orange-200 shadow-2xs hover:shadow-md transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-stone-900">{alumni.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 text-[10px] font-black">
                        सत्र {alumni.batch}
                      </span>
                      <span className="text-[11px] font-mono text-stone-500">{alumni.id}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-orange-950 border border-amber-300">
                    {alumni.schoolBranch}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-stone-700">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="font-semibold text-stone-900">{alumni.profession}</span>
                    {alumni.organisation && <span className="text-stone-500 font-medium">({alumni.organisation})</span>}
                  </div>
                  {alumni.city && (
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{alumni.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-stone-600 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {alumni.phone}
                    </span>
                    {alumni.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 text-stone-400" />
                        {alumni.email}
                      </span>
                    )}
                  </div>
                </div>

                {alumni.contributionType && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-[11px] text-emerald-950">
                    <strong className="text-emerald-800">सहयोग रुचि:</strong> {alumni.contributionType}
                  </div>
                )}

                {alumni.message && (
                  <p className="text-[11px] text-stone-600 italic bg-stone-50 p-2 rounded-xl border border-stone-100">
                    "{alumni.message}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-stone-500 text-sm">
              कोई पुरातन छात्र रिकॉर्ड नहीं मिला।
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>विद्या भारती पुरातन छात्र परिषद प्रबंधन</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>
  );
};

