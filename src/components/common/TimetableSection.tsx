import React, { useState, useEffect, useCallback } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import { SSM_CLASSES, type Timetable, type TimetableSlot } from '../../types';
import {
  Calendar,
  Clock,
  Printer,
  Sparkles,
  BookOpen,
  Award,
  Coffee,
  CheckCircle2,
  Users,
  Settings,
  RefreshCw
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

interface TimetableSectionProps {
  onOpenTimetableModal?: () => void;
}

const WEEKDAYS: Array<{ id: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'; label: string; short: string }> = [
  { id: 'Monday', label: 'सोमवार (Monday)', short: 'सोमवार' },
  { id: 'Tuesday', label: 'मंगलवार (Tuesday)', short: 'मंगलवार' },
  { id: 'Wednesday', label: 'बुधवार (Wednesday)', short: 'बुधवार' },
  { id: 'Thursday', label: 'गुरुवार (Thursday)', short: 'गुरुवार' },
  { id: 'Friday', label: 'शुक्रवार (Friday)', short: 'शुक्रवार' },
  { id: 'Saturday', label: 'शनिवार (Saturday)', short: 'शनिवार' }
];

const SECTIONS = ['A', 'B', 'C', 'D'];

const getClassLabel = (cls: string): string => {
  if (cls === 'Arun (Nursery)') return 'अरुण (Nursery)';
  if (cls === 'Uday (LKG)') return 'उदय (LKG)';
  if (cls === 'Prabhat (UKG)') return 'प्रभात (UKG)';
  const num = cls.replace('Class ', '');
  return `कक्षा ${num} (${cls})`;
};

const getInitialDay = (): 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' => {
  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  const dayIdx = new Date().getDay(); // 0 is Sun, 1 is Mon...
  if (dayIdx >= 1 && dayIdx <= 6) {
    return days[dayIdx - 1];
  }
  return 'Monday';
};

export const TimetableSection: React.FC<TimetableSectionProps> = ({ onOpenTimetableModal }) => {
  const { currentSchool } = useSchool();
  const [selectedClass, setSelectedClass] = useState<string>('Class 8');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>(getInitialDay());
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  
  const [dbTimetable, setDbTimetable] = useState<Timetable | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTimetable = useCallback(async () => {
    if (!currentSchool?.id) return;
    setIsLoading(true);
    try {
      const data = await api.getTimetable(currentSchool.id, selectedClass, selectedSection);
      if (data && data.length > 0) {
        setDbTimetable(data[0]);
      } else {
        setDbTimetable(null);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setDbTimetable(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentSchool?.id, selectedClass, selectedSection]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  // Listen for timetable updates from TimetableManagerModal
  useEffect(() => {
    const handleTimetableUpdate = (e: any) => {
      if (e.detail?.schoolId === currentSchool?.id) {
        loadTimetable();
      }
    };
    window.addEventListener('ssm_timetable_updated', handleTimetableUpdate);
    return () => window.removeEventListener('ssm_timetable_updated', handleTimetableUpdate);
  }, [currentSchool?.id, loadTimetable]);

  // Generate dynamic schedule for selected class & day
  const getSchedule = (): { items: PeriodItem[]; isCustom: boolean } => {
    const daySchedule = dbTimetable?.schedule?.find(s => s.day === selectedDay);

    if (daySchedule && daySchedule.slots && daySchedule.slots.length > 0) {
      return {
        isCustom: true,
        items: daySchedule.slots.map((slot: TimetableSlot) => {
          const isBreak =
            slot.subject.toLowerCase().includes('break') ||
            slot.subject.toLowerCase().includes('lunch') ||
            slot.subject.toLowerCase().includes('मध्यांतर') ||
            slot.subject.toLowerCase().includes('भोजन');

          return {
            periodNo: slot.period.toString(),
            timeRange: `${slot.startTime} - ${slot.endTime}`,
            subject: slot.subject,
            hindiSubject: slot.subject,
            teacher: slot.teacherName || '— (असाइन नहीं)',
            room: slot.room || `कक्ष ${selectedClass}`,
            isBreak
          };
        })
      };
    }

    // Default neutral templates if not yet configured in DB
    const isJunior = selectedClass.includes('Arun') || selectedClass.includes('Uday') || selectedClass.includes('Prabhat');

    if (isJunior) {
      return {
        isCustom: false,
        items: [
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
            teacher: 'कक्षाध्यापिका',
            room: 'कक्ष 101'
          },
          {
            periodNo: '२',
            timeRange: '09:40 - 10:20',
            subject: 'Number Fun',
            hindiSubject: 'अंक ज्ञान व वैदिक गिनती',
            teacher: 'दीदी जी',
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
            teacher: 'दीदी जी',
            room: 'कक्ष 101'
          },
          {
            periodNo: '४',
            timeRange: '11:30 - 12:15',
            subject: 'Craft & Music',
            hindiSubject: 'चित्रकला, मिट्टी के खिलौने व खेल',
            teacher: 'आचार्य / दीदी जी',
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
        ]
      };
    }

    // Senior / Middle Classes Default Schedule
    return {
      isCustom: false,
      items: [
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
          teacher: 'आचार्य / दीदी जी',
          room: `कक्ष ${selectedClass}`
        },
        {
          periodNo: '२',
          timeRange: '09:15 - 10:00',
          subject: 'Mathematics',
          hindiSubject: 'गणित एवं वैदिक गणित सूत्र',
          teacher: 'आचार्य / दीदी जी',
          room: `कक्ष ${selectedClass}`
        },
        {
          periodNo: '३',
          timeRange: '10:00 - 10:45',
          subject: 'Science',
          hindiSubject: 'विज्ञान एवं प्रायोगिक प्रयोग',
          teacher: 'आचार्य / दीदी जी',
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
          teacher: 'आचार्य / दीदी जी',
          room: `कक्ष ${selectedClass}`
        },
        {
          periodNo: '५',
          timeRange: '12:00 - 12:45',
          subject: 'English',
          hindiSubject: 'अंग्रेजी भाषा एवं संभाषण कौशल',
          teacher: 'आचार्य / दीदी जी',
          room: `कक्ष ${selectedClass}`
        },
        {
          periodNo: '६',
          timeRange: '12:45 - 01:25',
          subject: 'Social Science',
          hindiSubject: 'सामाजिक विज्ञान व भारतीय गौरवशाली इतिहास',
          teacher: 'आचार्य / दीदी जी',
          room: `कक्ष ${selectedClass}`
        },
        {
          periodNo: '७',
          timeRange: '01:25 - 02:00',
          subject: selectedDay === 'Saturday' ? 'Ghosh & Band' : 'Yoga & Sports',
          hindiSubject: selectedDay === 'Saturday' ? 'घोष वादन अभ्यास (आनक-पणव)' : 'शारीरिक शिक्षा, योग एवं खेलकूद',
          teacher: 'शारीरिक शिक्षक',
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
      ]
    };
  };

  const { items: schedule, isCustom } = getSchedule();

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="timetable" className="py-6 sm:py-8 bg-stone-100 border-t border-stone-200 print:bg-white print:py-0 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 w-full max-w-full">
        
        {/* Header (Hidden on print) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold border border-orange-200 uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-orange-700" />
              <span>आदर्श दैनिक दिनचर्या एवं समय-सारणी</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              कक्षावार समय-सारणी (Class Timetable)
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              विद्या भारती की सुसंस्कृत पद्धति के अनुसार कालांशों, वैदिक गणित, शारीरिक व भोजन मंत्र का सुव्यवस्थित क्रम।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-bold text-stone-700 flex items-center gap-1.5 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span>वर्तमान समय: {currentTimeStr}</span>
            </div>

            <button
              onClick={loadTimetable}
              disabled={isLoading}
              className="p-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              title="समय-सारणी रिफ्रेश करें"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-600' : ''}`} />
            </button>

            {onOpenTimetableModal && (
              <button
                onClick={onOpenTimetableModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-orange-400" />
                <span>समय-सारणी प्रबंधित करें</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें</span>
            </button>
          </div>
        </div>

        {/* Status notice if default template */}
        {!isCustom && (
          <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 px-4 mb-4 flex flex-wrap items-center justify-between gap-2.5 text-xs text-amber-950 shadow-xs print:hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>मानक प्रारूप (Default Template):</strong> इस कक्षा ({selectedClass} - वर्ग {selectedSection}) के लिए डेटाबेस में अभी कस्टम समय-सारणी सेव नहीं है।
              </span>
            </div>
            {onOpenTimetableModal && (
              <button
                onClick={onOpenTimetableModal}
                className="px-3 py-1 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
              >
                + अपने आचार्यों के साथ समय-सारणी बनाएं
              </button>
            )}
          </div>
        )}

        {isCustom && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-2.5 px-4 mb-4 flex items-center justify-between text-xs text-emerald-900 shadow-xs print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>सक्रिय डेटाबेस समय-सारणी:</strong> {selectedClass} - वर्ग {selectedSection} ({currentSchool.hindiName || currentSchool.name})
              </span>
            </div>
            {onOpenTimetableModal && (
              <button
                onClick={onOpenTimetableModal}
                className="text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
              >
                संपादित करें (Edit)
              </button>
            )}
          </div>
        )}

        {/* Filters: Class, Section & Day (Hidden on print) */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs mb-6 space-y-3 print:hidden w-full max-w-full overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Class Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-700">कक्षा:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {SSM_CLASSES.map(c => (
                    <option key={c} value={c}>{getClassLabel(c)}</option>
                  ))}
                </select>
              </div>

              {/* Section Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-700">वर्ग:</span>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value)}
                  className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {SECTIONS.map(s => (
                    <option key={s} value={s}>वर्ग {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map(day => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedDay === day.id
                      ? 'bg-orange-800 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {day.short}
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
              {currentSchool.hindiName || currentSchool.name}
            </h3>
            <p className="text-xs font-semibold text-stone-600">
              {currentSchool.city} {currentSchool.state ? `(${currentSchool.state})` : ''} • दैनिक कक्षा समय-सारणी • {getClassLabel(selectedClass)} - वर्ग {selectedSection} • सत्र 2025-26
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
                        {item.subject !== item.hindiSubject && (
                          <div className="text-[11px] text-stone-500 font-mono">
                            {item.subject}
                          </div>
                        )}
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
