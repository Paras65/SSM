import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { api } from '../../services/api';
import type { Student } from '../../types';
import { X, Send, Calendar, CheckCircle2 } from 'lucide-react';

interface LeaveApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const LeaveApplicationModal: React.FC<LeaveApplicationModalProps> = ({ isOpen, onClose, student }) => {
  const { currentSchool } = useSchool();
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createLeave({
        schoolId: currentSchool.id,
        applicantType: 'student',
        applicantId: student.id,
        applicantName: student.name,
        classOrDesignation: `${student.class} - '${student.section || 'A'}'`,
        startDate,
        endDate,
        reason
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'अवकाश आवेदन जमा करने में त्रुटि आई।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-orange-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              अवकाश आवेदन पत्र (Leave Application)
            </h3>
            <p className="text-xs text-stone-500">
              {student.name} • अनुक्रमांक {student.rollNo} ({student.class})
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>अवकाश आवेदन सफलतापूर्वक प्रेषित हुआ!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 mb-1">प्रारंभ तिथि (From)</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">समाप्ति तिथि (To)</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">अवकाश का कारण (Reason)</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="उदा. स्वास्थ्य अस्वस्थता, पारिवारिक वैवाहिक कार्यक्रम आदि..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'भेजा जा रहा है...' : 'आवेदन भेजें'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

