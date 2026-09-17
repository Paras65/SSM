import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Timetable, DaySchedule, TimetableSlot } from '../../types';
import { X, Clock, Plus, Save, CheckCircle2, Printer } from 'lucide-react';

interface TimetableManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const DAY_NAMES_HINDI: Record<string, string> = {
  Monday: 'सोमवार',
  Tuesday: 'मंगलवार',
  Wednesday: 'बुधवार',
  Thursday: 'गुरुवार',
  Friday: 'शुक्रवार',
  Saturday: 'शनिवार'
};

const DEFAULT_SLOTS: TimetableSlot[] = [
  { period: 1, startTime: '08:30 AM', endTime: '09:15 AM', subject: 'संस्कृत / वंदना', teacherName: 'आचार्य जी' },
  { period: 2, startTime: '09:15 AM', endTime: '10:00 AM', subject: 'गणित', teacherName: 'आचार्य जी' },
  { period: 3, startTime: '10:00 AM', endTime: '10:45 AM', subject: 'विज्ञान', teacherName: 'दीदी जी' },
  { period: 4, startTime: '11:00 AM', endTime: '11:45 AM', subject: 'हिंदी', teacherName: 'आचार्य जी' },
  { period: 5, startTime: '11:45 AM', endTime: '12:30 PM', subject: 'अंग्रेजी', teacherName: 'दीदी जी' },
  { period: 6, startTime: '12:30 PM', endTime: '01:15 PM', subject: 'सामाजिक विज्ञान', teacherName: 'आचार्य जी' },
  { period: 7, startTime: '01:30 PM', endTime: '02:15 PM', subject: 'शारीरिक व योग', teacherName: 'आचार्य जी' }
];

export const TimetableManagerModal: React.FC<TimetableManagerModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool } = useSchool();
  const { showSuccess, showError } = useToast();
  const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const SECTIONS = ['A', 'B', 'C', 'D'];
  const [selectedClass, setSelectedClass] = useState('Class 8');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  
  const [scheduleState, setScheduleState] = useState<DaySchedule[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    api.getTimetable(currentSchool.id, selectedClass, selectedSection)
      .then(data => {
        if (data && data.length > 0 && data[0].schedule?.length > 0) {
          setScheduleState(data[0].schedule);
        } else {
          // Initialize default schedule for all days
          const initial = DAYS.map(day => ({
            day,
            slots: DEFAULT_SLOTS.map(s => ({ ...s }))
          }));
          setScheduleState(initial);
        }
      })
      .catch(() => {
        const initial = DAYS.map(day => ({
          day,
          slots: DEFAULT_SLOTS.map(s => ({ ...s }))
        }));
        setScheduleState(initial);
      });
  }, [isOpen, currentSchool.id, selectedClass, selectedSection]);

  if (!isOpen) return null;

  const currentDaySchedule = scheduleState.find(s => s.day === selectedDay) || {
    day: selectedDay,
    slots: []
  };

  const handleUpdateSlot = (periodIndex: number, field: keyof TimetableSlot, value: string | number) => {
    setScheduleState(prev => prev.map(daySch => {
      if (daySch.day !== selectedDay) return daySch;
      const newSlots = [...daySch.slots];
      newSlots[periodIndex] = {
        ...newSlots[periodIndex],
        [field]: value
      };
      return { ...daySch, slots: newSlots };
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.saveTimetable({
        schoolId: currentSchool.id,
        class: selectedClass,
        section: selectedSection,
        schedule: scheduleState
      });
      showSuccess(`समय-सारिणी (${selectedClass} - वर्ग ${selectedSection}) सफलतापूर्वक सुरक्षित हो गई!`);
    } catch (err: any) {
      showError(err.message || 'समय-सारिणी सुरक्षित करने में त्रुटि।');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const dayRows = DAYS.map(day => {
      const daySchedule = scheduleState.find(s => s.day === day);
      const slots = daySchedule?.slots || [];
      const slotCells = slots.map(s => `
        <td style="border: 1px solid #d6d3d1; padding: 6px; text-align: center;">
          <div style="font-weight: bold; color: #1c1917; font-size: 11px;">${s.subject || '-'}</div>
          <div style="color: #78716c; font-size: 10px;">${s.teacherName || ''}</div>
          <div style="color: #ea580c; font-size: 9px; margin-top: 2px;">${s.startTime}-${s.endTime}</div>
        </td>
      `).join('');
      return `
        <tr>
          <th style="border: 1px solid #d6d3d1; padding: 8px; background: #fafaf9; font-weight: bold; font-size: 11px; white-space: nowrap;">
            ${DAY_NAMES_HINDI[day]}<br/><span style="font-size: 9px; color: #78716c;">${day}</span>
          </th>
          ${slotCells}
        </tr>
      `;
    }).join('');

    const maxPeriods = Math.max(...scheduleState.map(s => s.slots.length), 7);
    const periodHeaders = Array.from({ length: maxPeriods }, (_, i) => `
      <th style="border: 1px solid #d6d3d1; padding: 8px; background: #fff7ed; color: #9a3412; font-size: 11px;">
        कालांश ${i + 1}
      </th>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${currentSchool.hindiName || currentSchool.name} - समय-सारिणी (${selectedClass}-${selectedSection})</title>
          <style>
            @page { size: landscape; margin: 12mm; }
            body { font-family: system-ui, -apple-system, sans-serif; margin: 0; color: #1c1917; padding: 16px; }
            .header { text-align: center; border-bottom: 2px solid #ea580c; padding-bottom: 12px; margin-bottom: 16px; }
            .school-name { font-size: 20px; font-weight: 800; color: #c2410c; }
            .sub-title { font-size: 14px; font-weight: 600; color: #44403c; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            .footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 11px; color: #78716c; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">🚩 ${currentSchool.hindiName || currentSchool.name} 🚩</div>
            <div class="sub-title">साप्ताहिक आदर्श समय-सारिणी (Weekly Timetable)</div>
            <div style="font-size: 12px; color: #57534e; margin-top: 4px;">
              कक्षा: <strong>${selectedClass}</strong> | वर्ग (Section): <strong>${selectedSection}</strong> | जारी दिनांक: ${new Date().toLocaleDateString('hi-IN')}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="border: 1px solid #d6d3d1; padding: 8px; background: #f5f5f4; font-size: 11px;">दिन (Day)</th>
                ${periodHeaders}
              </tr>
            </thead>
            <tbody>
              ${dayRows}
            </tbody>
          </table>
          <div class="footer">
            <span>मुद्रण दिनांक: ${new Date().toLocaleString('hi-IN')}</span>
            <span>हस्ताक्षर: प्रधानाचार्य / समय-सारिणी प्रभारी</span>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl">
              <Clock className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                साप्ताहिक समय-सारिणी प्रबंधन (Weekly Class Timetable)
              </h3>
              <p className="text-xs text-stone-500">
                {currentSchool.hindiName} • कक्षावार घंटी व आचार्य आवंटन
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls & Days */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 shrink-0 text-xs font-bold">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-stone-500 uppercase text-[10px]">कक्षा:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-stone-500 uppercase text-[10px]">वर्ग (Section):</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
              >
                {SECTIONS.map(sec => <option key={sec} value={sec}>वर्ग {sec}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  selectedDay === day
                    ? 'bg-orange-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {DAY_NAMES_HINDI[day]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="साप्ताहिक समय-सारिणी प्रिंट करें"
            >
              <Printer className="w-4 h-4 text-stone-600" />
              <span>प्रिंट (Print)</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सुरक्षित हो रहा है...' : 'समय-सारिणी सेव करें'}</span>
            </button>
          </div>
        </div>

        {/* Slots Table */}
        <div className="flex-1 overflow-y-auto py-4 text-xs">
          <div className="border border-stone-200 rounded-2xl overflow-x-auto bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px] uppercase">
                  <th className="p-3">घंटी (Period)</th>
                  <th className="p-3">समय (Timing)</th>
                  <th className="p-3">विषय (Subject)</th>
                  <th className="p-3">आचार्य / शिक्षिका (Teacher)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentDaySchedule.slots.map((slot, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/20">
                    <td className="p-3 font-bold font-mono text-orange-900">
                      कालांश {slot.period}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          value={slot.startTime}
                          onChange={(e) => handleUpdateSlot(idx, 'startTime', e.target.value)}
                          className="w-24 px-2 py-1 border border-stone-300 rounded-lg text-xs"
                          placeholder="08:30 AM"
                        />
                        <span>-</span>
                        <input
                          value={slot.endTime}
                          onChange={(e) => handleUpdateSlot(idx, 'endTime', e.target.value)}
                          className="w-24 px-2 py-1 border border-stone-300 rounded-lg text-xs"
                          placeholder="09:15 AM"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        value={slot.subject}
                        onChange={(e) => handleUpdateSlot(idx, 'subject', e.target.value)}
                        className="w-full px-2.5 py-1 border border-stone-300 rounded-lg font-bold text-stone-900"
                        placeholder="विषय नाम"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={slot.teacherName}
                        onChange={(e) => handleUpdateSlot(idx, 'teacherName', e.target.value)}
                        className="w-full px-2.5 py-1 border border-stone-300 rounded-lg text-stone-700"
                        placeholder="आचार्य नाम"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

