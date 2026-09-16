import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import type { Homework } from '../../../types';
import {
  BookOpen,
  Plus,
  Sparkles,
  Trash2
} from 'lucide-react';

interface AdminHomeworkTabProps {
  homeworkList: Homework[];
  onRefresh: () => void;
  setHomeworkList: React.Dispatch<React.SetStateAction<Homework[]>>;
}

const AdminHomeworkTabComponent: React.FC<AdminHomeworkTabProps> = ({
  homeworkList,
  onRefresh,
  setHomeworkList
}) => {
  const { currentSchool } = useSchool();
  const { showSuccess, showError, showWarning } = useToast();

  const [showAddHomework, setShowAddHomework] = useState(false);
  const [hwClass, setHwClass] = useState('Class 8');
  const [hwSubject, setHwSubject] = useState('');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDescription, setHwDescription] = useState('');
  const [hwAssignedBy, setHwAssignedBy] = useState('');
  const [hwDueDate, setHwDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwSubject || !hwTitle || !hwDescription) {
      showWarning('कृपया विषय, शीर्षक और विवरण भरें।');
      return;
    }
    try {
      await api.createHomework({
        schoolId: currentSchool.id,
        class: hwClass,
        subject: hwSubject,
        title: hwTitle,
        description: hwDescription,
        assignedBy: hwAssignedBy || 'आचार्य जी',
        dueDate: hwDueDate,
        date: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      showSuccess('गृहकार्य सफलतापूर्वक प्रेषित किया गया!');
      setHwSubject('');
      setHwTitle('');
      setHwDescription('');
      setShowAddHomework(false);
      onRefresh();
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleDeleteHomework = async (id: string) => {
    if (!confirm('क्या आप इस गृहकार्य को हटाना चाहते हैं?')) return;
    try {
      await api.deleteHomework(id);
      showSuccess('गृहकार्य सफलतापूर्वक हटा दिया गया!');
      setHomeworkList(prev => prev.filter(h => h.id !== id));
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-700" />
            <span>दैनिक गृहकार्य एवं डायरी (Daily Homework & Assignments)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            कक्षावार एवं विषयवार दैनिक गृहकार्य प्रेषित करें। छात्र एवं अभिभावक इसे छात्र पोर्टल पर तत्काल देख सकते हैं।
          </p>
        </div>

        <button
          onClick={() => setShowAddHomework(!showAddHomework)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddHomework ? 'फॉर्म बंद करें' : 'नया गृहकार्य जोड़ें (Assign)'}</span>
        </button>
      </div>

      {/* Create Homework Form */}
      {showAddHomework && (
        <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-300 animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>नया दैनिक गृहकार्य प्रेषित करें</span>
          </h4>
          <form onSubmit={handleCreateHomework} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 font-bold mb-1">लक्षित कक्षा (Class)*</label>
              <select
                value={hwClass}
                onChange={e => setHwClass(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
              >
                <option value="Class 8">Class 8</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Arun">अरुण (Nursery)</option>
                <option value="Uday">उदय (LKG)</option>
                <option value="Prabhat">प्रभात (Prep)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">विषय (Subject)*</label>
              <input
                type="text"
                placeholder="उदा: गणित / विज्ञान / संस्कृत"
                value={hwSubject}
                onChange={e => setHwSubject(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">जमा करने की अंतिम तिथि (Due Date)*</label>
              <input
                type="date"
                value={hwDueDate}
                onChange={e => setHwDueDate(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-700 font-bold mb-1">गृहकार्य शीर्षक / अध्याय (Title)*</label>
              <input
                type="text"
                placeholder="उदा: अध्याय 4: परिमेय संख्याएँ एवं समीकरण"
                value={hwTitle}
                onChange={e => setHwTitle(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">प्रदत्तकर्ता आचार्य (Assigned By)</label>
              <input
                type="text"
                placeholder="उदा: श्री रामेश्वर त्रिपाठी"
                value={hwAssignedBy}
                onChange={e => setHwAssignedBy(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-stone-700 font-bold mb-1">गृहकार्य विवरण व निर्देश (Instructions)*</label>
              <textarea
                rows={3}
                placeholder="उदा: प्रश्नावली 4.2 के प्रश्न संख्या 1 से 8 तक अभ्यास पुस्तिका में हल करें। प्रत्येक चरण को स्पष्ट लिखें।"
                value={hwDescription}
                onChange={e => setHwDescription(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 resize-none"
                required
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddHomework(false)}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                गृहकार्य जारी करें (Publish)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Homework List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeworkList.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500">
            <BookOpen className="w-12 h-12 mx-auto text-stone-300 mb-2" />
            <p className="font-semibold text-sm">वर्तमान में कोई गृहकार्य प्रेषित नहीं है।</p>
            <p className="text-xs text-stone-400 mt-1">ऊपर दिए गए बटन से नया गृहकार्य जोड़ें।</p>
          </div>
        ) : (
          homeworkList.map(hw => (
            <div
              key={hw.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-orange-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 font-bold rounded-full text-[10px]">
                      {hw.class}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded text-[10px]">
                      {hw.subject}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    अंतिम तिथि: {hw.dueDate}
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm mb-1.5">{hw.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  {hw.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>
                  आचार्य: <strong className="text-stone-800">{hw.assignedBy}</strong>
                </span>
                <button
                  onClick={() => handleDeleteHomework(hw.id)}
                  className="text-stone-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                  title="Delete Homework"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const AdminHomeworkTab = React.memo(AdminHomeworkTabComponent);
