import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Bell, Calendar, Tag, AlertCircle, ArrowUpRight } from 'lucide-react';

export const NoticeBoard: React.FC = () => {
  const { notices } = useSchool();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Academics', 'Events', 'Examinations', 'Vidya Bharati'];

  const filteredNotices = selectedCategory === 'All'
    ? notices
    : notices.filter(n => n.category === selectedCategory);

  return (
    <section id="notices" className="py-16 bg-white border-b border-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-orange-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Bell className="w-3.5 h-3.5 text-orange-600 animate-bounce" />
              <span>सूचना पट्ट • परिपत्र</span>
            </div>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              नवीनतम सूचनाएं एवं परिपत्र (School Notices)
            </h2>
            <p className="text-stone-600 text-sm mt-1">
              प्रवेश, परीक्षा, क्रीड़ा प्रतियोगिता एवं विद्यालयी गतिविधियों की अद्यतन जानकारी।
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-orange-50 hover:text-orange-900'
                }`}
              >
                {cat === 'All' ? 'सभी (All)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotices.map(notice => (
            <div
              key={notice.id}
              className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                notice.isUrgent
                  ? 'bg-gradient-to-br from-amber-50/80 to-white border-orange-400'
                  : 'bg-white border-stone-200 hover:border-orange-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">
                      <Tag className="w-3 h-3" />
                      {notice.category}
                    </span>
                    {notice.isUrgent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        अति महत्वपूर्ण
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{notice.date}</span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-2 leading-snug">
                  {notice.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-orange-700 font-semibold">
                <span>आज्ञा से: प्रधानाचार्य</span>
                <span className="flex items-center gap-0.5 hover:underline cursor-pointer">
                  विस्तृत विवरण <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

