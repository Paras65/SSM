import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Printer,
  Sparkles,
  BookOpen,
  Award,
  Coffee,
  CheckCircle2,
  Users
} from 'lucide-react';

interface PeriodItem {
  periodNo: string;
  timeRange: string;
  subject: string;
  hindiSubject: string;
  teacher: string;
  room: string;
  isBreak?: boolean;
}

const WEEKDAYS = [
  { id: 'mon', label: 'सोमवार (Monday)' },
  { id: 'tue', label: 'मंगलवार (Tuesday)' },
  { id: 'wed', label: 'बुधवार (Wednesday)' },
  { id: 'thu', label: 'गुरुवार (Thursday)' },
  { id: 'fri', label: 'शुक्रवार (Friday)' },
  { id: 'sat', label: 'शनिवार (Saturday)' }
];

const CLASSES = [
  'कक्षा 6 (Class 6)',
  'कक्षा 7 (Class 7)',
  'कक्षा 8 (Class 8)',
  'कक्षा 9 (Class 9)',
  'कक्षा 10 (Class 10)',
  'अरुण (Nursery)',
  'उदय (LKG)',
  'प्रभात (Prep)'
];

export const TimetableSection: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('कक्षा 8 (Class 8)');
  const [selectedDay, setSelectedDay] = useState<string>('mon');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate dynamic schedule for selected class & day
  const getSchedule = (cls: string, day: string): PeriodItem[] => {
    const isJunior = cls.includes('अरुण') || cls.includes('उदय') || cls.includes('प्रभात');

    if (isJunior) {
      return [
        {
          periodNo: 'वंदना',
          timeRange: '08:30 - 09:00',
          subject: 'Morning Assembly',
          hindiSubject: 'प्रात: स्मरण, गायत्री मंत्र व बाल वंदना',
          teacher: 'समस्त दीदी जी',
          room: 'प्रार्थना सभा'
        },
        {
          periodNo: '१',
          timeRange: '09:00 - 09:40',
          subject: 'Hindi Alphabets',
          hindiSubject: 'अक्षर ज्ञान व सुलेख (स्वर-व्यंजन)',
          teacher: 'श्रीमती सीमा दीदी जी',
          room: 'कक्ष 101'
        },
        {
          periodNo: '२',
          timeRange: '09:40 - 10:20',
          subject: 'Number Fun',
          hindiSubject: 'अंक ज्ञान व वैदिक गिनती',
          teacher: 'सुश्री रेखा दीदी जी',
          room: 'कक्ष 101'
        },
        {
          periodNo: 'मध्यांतर',
          timeRange: '10:20 - 10:50',
          subject: 'Lunch Break',
          hindiSubject: 'भोजन मंत्र एवं बालाहार',
          teacher: 'कक्षाध्यापिका',
          room: 'भोजन कक्ष',
          isBreak: true
        },
        {
          periodNo: '३',
          timeRange: '10:50 - 11:30',
          subject: 'Rhymes & Tales',
          hindiSubject: 'पंचतंत्र कथाएं व बाल कविता',
          teacher: 'श्रीमती सीमा दीदी जी',
          room: 'कक्ष 101'
        },
        {
          periodNo: '४',
          timeRange: '11:30 - 12:15',
          subject: 'Craft & Music',
          hindiSubject: 'चित्रकला, मिट्टी के खिलौने व खेल',
          teacher: 'श्री दिनेश जी',
          room: 'बाल वाटिका'
        },
        {
          periodNo: 'विसर्जन',
          timeRange: '12:15 - 12:30',
          subject: 'Closing',
          hindiSubject: 'शांति पाठ एवं दैनिक विसर्जन',
          teacher: 'कक्षाध्यापिका',
          room: 'प्रार्थना स्थल'
        }
      ];
    }

    // Senior / Middle Classes Schedule
    return [
      {
        periodNo: 'वंदना',
        timeRange: '08:00 - 08:30',
        subject: 'Morning Assembly',
        hindiSubject: 'प्रात: स्मरण, सूर्य नमस्कार, सरस्वती वंदना',
        teacher: 'समस्त आचार्य गण',
        room: 'प्रांगण'
      },
      {
        periodNo: '१',
        timeRange: '08:30 - 09:15',
        subject: 'Sanskrit',
        hindiSubject: 'संस्कृत व्याकरण एवं सुभाषितम्',
        teacher: 'आचार्य सुरेश जोशी जी',
        room: 'कक्ष 204'
      },
      {
        periodNo: '२',
        timeRange: '09:15 - 10:00',
        subject: 'Mathematics',
        hindiSubject: 'गणित एवं वैदिक गणित सूत्र',
        teacher: 'आचार्य हरीश चंद्र जी',
        room: 'कक्ष 204'
      },
      {
        periodNo: '३',
        timeRange: '10:00 - 10:45',
        subject: 'Science',
        hindiSubject: 'विज्ञान एवं प्रायोगिक प्रयोग',
        teacher: 'सुश्री अल्पना दीदी जी',
        room: 'विज्ञान प्रयोगशाला'
      },
      {
        periodNo: 'मध्यांतर',
        timeRange: '10:45 - 11:15',
        subject: 'Bhojan Mantra Break',
        hindiSubject: 'भोजन मंत्र एवं मध्याह्न स्वल्पाहार',
        teacher: 'कक्षाध्यापक',
        room: 'भोजनालय',
        isBreak: true
      },
      {
        periodNo: '४',
        timeRange: '11:15 - 12:00',
        subject: 'Hindi Literature',
        hindiSubject: 'हिंदी साहित्य एवं नैतिक मूल्य',
        teacher: 'आचार्य विष्णु दत्त जी',
        room: 'कक्ष 204'
      },
      {
        periodNo: '५',
        timeRange: '12:00 - 12:45',
        subject: 'English',
        hindiSubject: 'अंग्रेजी भाषा एवं संभाषण कौशल',
        teacher: 'श्रीमती वंदना दीदी जी',
        room: 'कक्ष 204'
      },
      {
        periodNo: '६',
        timeRange: '12:45 - 01:25',
        subject: 'Social Science',
        hindiSubject: 'सामाजिक विज्ञान व भारतीय गौरवशाली इतिहास',
        teacher: 'आचार्य हरीश चंद्र जी',
        room: 'कक्ष 204'
      },
      {
        periodNo: '७',
        timeRange: '01:25 - 02:00',
        subject: day === 'sat' ? 'Ghosh & Band' : 'Yoga & Sports',
        hindiSubject: day === 'sat' ? 'घोष वादन अभ्यास (आनक-पणव)' : 'शारीरिक शिक्षा, योग एवं खेलकूद',
        teacher: 'श्री मदन लाल जी (शारीरिक शिक्षक)',
        room: 'क्रीड़ांगन'
      },
      {
        periodNo: 'विसर्जन',
        timeRange: '02:00 - 02:15',
        subject: 'Shanti Path',
        hindiSubject: 'दैनिक शांति पाठ, राष्ट्रगान व विसर्जन',
        teacher: 'समस्त आचार्य',
        room: 'प्रांगण'
      }
    ];
  };

  const schedule = getSchedule(selectedClass, selectedDay);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="timetable" className="py-10 sm:py-16 bg-stone-100 border-t border-stone-200 print:bg-white print:py-0 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full max-w-full">
        
        {/* Header (Hidden on print) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold border border-orange-200 uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-orange-700" />
              <span>आदर्श दैनिक दिनचर्या एवं समय-सारणी</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              कक्षावार समय-सारणी (Class Timetable)
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              विद्या भारती की सुसंस्कृत पद्धति के अनुसार कालांशों, वैदिक गणित, शारीरिक व भोजन मंत्र का सुव्यवस्थित क्रम।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-700 flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span>वर्तमान समय: {currentTimeStr}</span>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>समय-सारणी प्रिंट करें</span>
            </button>
          </div>
        </div>

        {/* Filters: Class & Day (Hidden on print) */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-6 space-y-3 print:hidden w-full max-w-full overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Class Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">कक्षा चुनें:</span>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Day Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map(day => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === day.id
                      ? 'bg-orange-800 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {day.label.split(' ')[0]}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Timetable Card / Printable Sheet */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-orange-200 shadow-md p-3 sm:p-8 overflow-hidden print:border-none print:shadow-none print:p-0 w-full max-w-full">
          
          {/* Printable Header */}
          <div className="text-center pb-4 border-b-2 border-orange-200 mb-6">
            <h3 className="text-xl sm:text-2xl font-black text-orange-950">
              सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय
            </h3>
            <p className="text-xs font-semibold text-stone-600">
              दैनिक कक्षा समय-सारणी (Daily Class Routine) • {selectedClass} • सत्र 2025-26
            </p>
            <div className="mt-2 inline-block px-3 py-0.5 bg-amber-100 text-orange-900 rounded-full text-xs font-bold">
              दिवस: {WEEKDAYS.find(w => w.id === selectedDay)?.label}
            </div>
          </div>

          {/* Timetable Table */}
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[520px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-orange-900 text-white font-bold border-b border-orange-950">
                  <th className="p-3 w-16 text-center">कालांश</th>
                  <th className="p-3 w-36">समय अवधि</th>
                  <th className="p-3">विषय एवं पाठ्यक्रम</th>
                  <th className="p-3">विषय आचार्य (Teacher)</th>
                  <th className="p-3 w-32 text-center">स्थान / कक्ष</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {schedule.map((item, idx) => {
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-amber-50/50 transition-colors ${
                        item.isBreak
                          ? 'bg-amber-50 font-semibold'
                          : idx % 2 === 0
                          ? 'bg-white'
                          : 'bg-stone-50/70'
                      }`}
                    >
                      <td className="p-3 text-center font-bold">
                        {item.isBreak ? (
                          <Coffee className="w-4 h-4 text-amber-700 mx-auto" />
                        ) : (
                          <span className="inline-block w-6 h-6 rounded-full bg-orange-100 text-orange-900 font-bold leading-6 text-center">
                            {item.periodNo}
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-mono font-bold text-stone-700 whitespace-nowrap">
                        {item.timeRange}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-stone-900 text-sm">
                          {item.hindiSubject}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {item.subject}
                        </div>
                      </td>

                      <td className="p-3 font-semibold text-stone-800">
                        {item.teacher}
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                          {item.room}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Guidelines */}
          <div className="mt-6 pt-4 border-t border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600 print:text-[10px]">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <p>प्रत्येक कालांश से पूर्व और पश्चात आचार्य जी के प्रति <strong>'नमस्ते जी'</strong> एवं अभिवादन अनिवार्य है।</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <p>भोजन मध्यांतर में हाथ धोकर पूर्ण पंक्तिबद्ध बैठकर <strong>भोजन मंत्र</strong> का उच्चारण कर स्वल्पाहार ग्रहण करें।</p>
            </div>
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>शनिवार को विशेष <strong>घोष संचलन</strong>, वाद-विवाद, सुलेख एवं शारीरिक क्रीड़ा का आयोजन किया जाता है।</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

