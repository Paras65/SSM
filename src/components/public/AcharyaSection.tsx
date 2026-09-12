import React, { useEffect, useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import type { Staff } from '../../types';
import { GraduationCap, Award, BookOpen, Quote } from 'lucide-react';

export const AcharyaSection: React.FC = () => {
  const { currentSchool } = useSchool();
  const [faculty, setFaculty] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (currentSchool?.id) {
      setLoading(true);
      api.getStaff(currentSchool.id)
        .then(staff => {
          if (isMounted) setFaculty(staff || []);
        })
        .catch(() => {
          if (isMounted) setFaculty([]);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [currentSchool?.id]);

  const principalName = currentSchool?.principalName || 'आचार्य जी';

  return (
    <section id="acharyas" className="py-16 bg-white border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 text-orange-600" />
            <span>गुरु परम्परा एवं समर्पित शिक्षक</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            हमारे आचार्य एवं दीदी जी (Faculty Directory)
          </h2>
          <p className="mt-2 text-base text-stone-600">
            सरस्वती शिशु मंदिर में शिक्षक केवल एक अध्यापक नहीं, अपितु एक आदर्श प्रेरक और संरक्षक (मार्गदर्शक) के रूप में भैया-बहिनों का संवर्धन करते हैं।
          </p>
        </div>

        {/* Principal / Pradhanacharya Message Card */}
        <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 mb-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4 text-center lg:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-700 mx-auto lg:mx-0 p-1 shadow-md mb-3">
                <div className="w-full h-full rounded-xl bg-orange-900 flex items-center justify-center text-4xl text-amber-200">
                  👨‍🏫
                </div>
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                {principalName}
              </h3>
              <p className="text-xs font-semibold text-orange-700">
                प्रधानाचार्य (Pradhanacharya Ji)
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {currentSchool?.hindiName || currentSchool?.name || 'सरस्वती शिशु मंदिर'}
              </p>
            </div>

            <div className="lg:col-span-8 space-y-3 relative">
              <Quote className="w-10 h-10 text-orange-200 absolute -top-4 -left-3 -z-0 opacity-60" />
              <div className="relative z-10">
                <h4 className="text-base sm:text-lg font-bold text-orange-950 mb-2">
                  "शिक्षा का वास्तविक उद्देश्य चरित्र निर्माण एवं देश के प्रति समर्पण है"
                </h4>
                <p className="text-sm text-stone-700 leading-relaxed">
                  हमारा संकल्प प्रत्येक भैया-बहिन में आत्मविश्वास, विवेकशीलता, अनुशासन और राष्ट्रप्रेम के बीज बोना है।
                  विद्या भारती की यह तपोभूमि केवल परीक्षा उत्तीर्ण करने का माध्यम नहीं, बल्कि जीवन की प्रत्येक चुनौती में
                  धर्म, सत्य और निष्ठा के साथ विजयी होने का संस्कार प्रदान करती है।
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Acharya & Didi Cards Grid */}
        {loading ? (
          <div className="text-center py-12 text-stone-500">आचार्य विवरण लोड हो रहा है...</div>
        ) : faculty.length === 0 ? (
          <div className="text-center py-10 px-4 bg-orange-50/50 rounded-2xl border border-orange-200">
            <GraduationCap className="w-10 h-10 text-orange-400 mx-auto mb-2" />
            <p className="text-stone-700 font-semibold">आचार्य एवं दीदी जी की सूची</p>
            <p className="text-stone-500 text-xs mt-1">सत्र 2026-27 के लिए संकाय सूची शीघ्र ही अद्यतन की जाएगी।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {faculty.map(member => (
              <div
                key={member.id}
                className="bg-stone-50/70 hover:bg-orange-50/50 p-5 rounded-2xl border border-stone-200 hover:border-orange-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-2xl mb-3 shadow-xs">
                    {member.gender === 'Didi' ? '👩‍🏫' : '👨‍🏫'}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                    <Award className="w-3 h-3" />
                    <span>{member.gender === 'Didi' ? 'दीदी जी' : 'आचार्य जी'}</span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 mb-0.5">
                    {member.name}
                  </h4>

                  <p className="text-xs font-medium text-stone-600 mb-2">
                    {member.designation}
                  </p>

                  {member.qualification && (
                    <p className="text-xs text-stone-500 mb-3">
                      <strong>योग्यता:</strong> {member.qualification}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-200/80">
                  {member.subjects && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                      <span>विषय: {member.subjects}</span>
                    </div>
                  )}
                  <span className="text-[11px] text-stone-500">
                    स्थिति: {member.status || 'सक्रिय'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

