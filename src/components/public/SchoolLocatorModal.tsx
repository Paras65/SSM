import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { Search, MapPin, Phone, Mail, Clock, Award, Check, X, Building2, Sparkles, ArrowRight } from 'lucide-react';
import type { School } from '../../types';

interface SchoolLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolLocatorModal: React.FC<SchoolLocatorModalProps> = ({ isOpen, onClose }) => {
  const { schools, currentSchool, setCurrentSchoolId } = useSchool();
  const { showSuccess } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('सभी');

  if (!isOpen) return null;

  const states = ['सभी', 'उत्तर प्रदेश', 'छत्तीसगढ़', 'दिल्ली', 'मध्य प्रदेश', 'बिहार', 'उत्तराखंड', 'राजस्थान'];

  const filteredSchools = schools.filter(s => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (s.hindiName || '').toLowerCase().includes(q) ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.city || '').toLowerCase().includes(q) ||
      (s.prant || '').toLowerCase().includes(q) ||
      (s.state || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q);

    const matchesState =
      selectedState === 'सभी' ||
      (s.state || '').includes(selectedState) ||
      (s.prant || '').includes(selectedState);

    return matchesSearch && matchesState;
  });

  const handleSelectSchool = (school: School) => {
    setCurrentSchoolId(school.id);
    showSuccess(`${school.hindiName || school.name} का पोर्टल लोड किया गया।`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-orange-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between shrink-0 border-b border-amber-500/30">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-700/80 border border-amber-300/50 flex items-center justify-center text-2xl shadow-sm shrink-0">
              🏫
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-black text-amber-100 tracking-tight">
                  नजदीकी सरस्वती शिशु मंदिर खोजें (School Locator)
                </h3>
                <span className="hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-orange-950/90 text-amber-200 border border-orange-700 font-semibold">
                  आधिकारिक निर्देशिका
                </span>
              </div>
              <p className="text-xs sm:text-sm text-orange-200 mt-0.5">
                विद्या भारती अखिल भारतीय शिक्षा संस्थान • सम्पूर्ण भारत में संचालित विद्यालय संजाल
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-orange-200 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search & State Filter Bar */}
        <div className="bg-amber-50/80 border-b border-orange-200 p-4 sm:p-6 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="शहर, जिला, राज्य, प्रांत अथवा विद्यालय का नाम खोजें (उदा. गोरखपुर, रायपुर, लखनऊ, दिल्ली)..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-orange-300 rounded-2xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs placeholder:text-stone-400"
            />
          </div>

          {/* State / Prant Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-stone-600 shrink-0">राज्य / प्रांत:</span>
            {states.map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedState === st
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white hover:bg-orange-100 text-stone-700 border border-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Schools Directory Grid */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 bg-stone-50/50">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-4">
            <span>उपलब्ध विद्यालय: <strong className="text-stone-900">{filteredSchools.length}</strong></span>
            {currentSchool.id !== 'ssm-national' && (
              <span>वर्तमान सक्रिय शाखा: <strong className="text-orange-700">{currentSchool.city}</strong></span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSchools.map(sch => {
              const isActive = sch.id === currentSchool.id;
              return (
                <div
                  key={sch.id}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-orange-500 bg-gradient-to-b from-orange-50/90 to-white shadow-md ring-3 ring-orange-500/15'
                      : 'border-stone-200 bg-white hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-orange-700 text-white flex items-center justify-center font-bold text-base shadow-2xs shrink-0">
                          🪷
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-900 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300">
                            {sch.prant}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold border border-green-300 shadow-2xs">
                          <Check className="w-3 h-3 text-green-700" />
                          <span>सक्रिय</span>
                        </span>
                      )}
                    </div>

                    {/* School Name */}
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-stone-900 leading-snug">
                        {sch.hindiName}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                        {sch.name}
                      </p>
                    </div>

                    {/* Details List */}
                    <div className="space-y-1.5 text-xs text-stone-600 pt-1 border-t border-stone-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{sch.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>प्रधानाचार्य: <strong className="text-stone-800">{sch.principalName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a href={`tel:${sch.phone}`} className="hover:text-orange-600 font-medium">{sch.phone}</a>
                      </div>
                      {sch.timings && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="text-[11px] text-stone-500">{sch.timings}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-400">
                      UDISE: {sch.udiseCode || 'प्रमाणित'}
                    </span>

                    {isActive ? (
                      <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>वर्तमान चयनित</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectSchool(sch)}
                        className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>पोर्टल देखें</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSchools.length === 0 && (
            <div className="text-center py-16 text-stone-500 space-y-2">
              <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
              <p className="text-sm font-bold text-stone-700">कोई विद्यालय नहीं मिला</p>
              <p className="text-xs text-stone-500">
                कृपया खोज शब्द या चुने गए राज्य/प्रांत को बदल कर पुनः प्रयास करें।
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>विद्या भारती अखिल भारतीय शिक्षा संस्थान • विद्यालय निर्देशिका</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
