import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import type { Timetable, DaySchedule, TimetableSlot } from '../../types';
import { X, Clock, Plus, Save, CheckCircle2 } from 'lucide-react';

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
  const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const [selectedClass, setSelectedClass] = useState('Class 8');
  const [selectedDay, setSelectedDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  
  const [scheduleState, setScheduleState] = useState<DaySchedule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    api.getTimetable(currentSchool.id, selectedClass)
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
  }, [isOpen, currentSchool.id, selectedClass]);

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
    setSaveSuccess(false);
    try {
      await api.saveTimetable({
        schoolId: currentSchool.id,
        class: selectedClass,
        section: 'A',
        schedule: scheduleState
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'समय-सारिणी सुरक्षित करने में त्रुटि।');
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex items-center gap-2">
            <label className="text-stone-500 uppercase text-[10px]">कक्षा चुनें:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold"
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-wrap gap-1">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl transition ${
                  selectedDay === day
                    ? 'bg-orange-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {DAY_NAMES_HINDI[day]}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'सुरक्षित हो रहा है...' : 'समय-सारिणी सेव करें'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>समय-सारिणी सफलतापूर्वक सुरक्षित हो गई है!</span>
          </div>
        )}

        {/* Slots Table */}
        <div className="flex-1 overflow-y-auto py-4 text-xs">
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
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

