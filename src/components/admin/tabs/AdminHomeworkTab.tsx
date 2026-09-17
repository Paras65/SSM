import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import { SSM_CLASSES, type Homework } from '../../../types';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Layers,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X
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
  const [editingHwId, setEditingHwId] = useState<string | null>(null);
  const [hwClass, setHwClass] = useState('Class 8');
  const [hwSubject, setHwSubject] = useState('');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDescription, setHwDescription] = useState('');
  const [hwAssignedBy, setHwAssignedBy] = useState('');
  const [hwDueDate, setHwDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters
  const [filterClass, setFilterClass] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Completed' | 'Overdue'>('ALL');

  // Delete confirmation modal
  const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null);

  const handleCancelForm = () => {
    setEditingHwId(null);
    setHwSubject('');
    setHwTitle('');
    setHwDescription('');
    setShowAddHomework(false);
  };

  const handleStartEdit = (hw: Homework) => {
    setEditingHwId(hw.id);
    setHwClass(hw.class);
    setHwSubject(hw.subject);
    setHwTitle(hw.title);
    setHwDescription(hw.description);
    setHwAssignedBy(hw.assignedBy || '');
    setHwDueDate(hw.dueDate || new Date().toISOString().split('T')[0]);
    setShowAddHomework(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwSubject || !hwTitle || !hwDescription) {
      showWarning('कृपया विषय, शीर्षक और विवरण भरें।');
      return;
    }
    try {
      if (editingHwId) {
        await api.updateHomework(editingHwId, {
          class: hwClass,
          subject: hwSubject,
          title: hwTitle,
          description: hwDescription,
          assignedBy: hwAssignedBy || 'आचार्य जी',
          dueDate: hwDueDate
        });
        showSuccess('गृहकार्य सफलतापूर्वक अद्यतन (Updated) किया गया!');
      } else {
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
      }
      handleCancelForm();
      onRefresh();
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleDeleteHomework = (hw: Homework) => {
    setHomeworkToDelete(hw);
  };

  const handleConfirmDeleteHomework = async () => {
    if (!homeworkToDelete) return;
    try {
      await api.deleteHomework(homeworkToDelete.id);
      showSuccess('गृहकार्य सफलतापूर्वक हटा दिया गया!');
      setHomeworkList(prev => prev.filter(h => h.id !== homeworkToDelete.id));
      setHomeworkToDelete(null);
    } catch (err: any) {
      showError('त्रुटि: ' + err.message);
    }
  };

  const handleToggleStatus = async (hw: Homework) => {
    const newStatus: Homework['status'] = hw.status === 'Active' ? 'Completed' : 'Active';
    try {
      await api.updateHomework(hw.id, { status: newStatus });
      setHomeworkList(prev => prev.map(h => h.id === hw.id ? { ...h, status: newStatus } : h));
      showSuccess(newStatus === 'Completed' ? 'गृहकार्य पूर्ण चिह्नित किया गया!' : 'गृहकार्य सक्रिय किया गया!');
    } catch (err: any) {
      showError('स्थिति अद्यतन में त्रुटि: ' + err.message);
    }
  };

  // Filtered homework list
  const filteredHomework = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return homeworkList.filter(hw => {
      // Class filter
      const matchesClass =
        filterClass === 'ALL' ||
        hw.class === filterClass ||
        hw.class.startsWith(filterClass + ' ');
      if (!matchesClass) return false;

      // Search filter
      if (q) {
        const matchesSubject = hw.subject && hw.subject.toLowerCase().includes(q);
        const matchesTitle = hw.title && hw.title.toLowerCase().includes(q);
        const matchesDesc = hw.description && hw.description.toLowerCase().includes(q);
        const matchesAuthor = hw.assignedBy && hw.assignedBy.toLowerCase().includes(q);
        if (!matchesSubject && !matchesTitle && !matchesDesc && !matchesAuthor) {
          return false;
        }
      }

      // Status / overdue filter
      const todayStr = new Date().toISOString().split('T')[0];
      const isOverdue = hw.dueDate && hw.dueDate < todayStr && hw.status !== 'Completed';
      if (statusFilter === 'Overdue' && !isOverdue) return false;
      if (statusFilter === 'Active' && (hw.status !== 'Active' || isOverdue)) return false;
      if (statusFilter === 'Completed' && hw.status !== 'Completed') return false;

      return true;
    });
  }, [homeworkList, filterClass, searchQuery, statusFilter]);

  // Live KPI statistics
  const stats = useMemo(() => {
    const total = filteredHomework.length;
    const classes = new Set(filteredHomework.map(h => h.class)).size;
    const todayStr = new Date().toISOString().split('T')[0];
    const dueSoon = filteredHomework.filter(h => h.dueDate && h.dueDate >= todayStr).length;
    return { total, classes, dueSoon };
  }, [filteredHomework]);

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
          onClick={() => {
            if (showAddHomework) {
              handleCancelForm();
            } else {
              setShowAddHomework(true);
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddHomework ? 'फॉर्म बंद करें' : 'नया गृहकार्य जोड़ें (Assign)'}</span>
        </button>
      </div>

      {/* Homework KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase">कुल गृहकार्य (Total Assignments)</span>
            <BookOpen className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <p className="text-xl font-black text-stone-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-stone-500 font-medium">फ़िल्टर अनुसार सक्रिय</span>
        </div>

        <div className="bg-orange-50/80 p-3.5 rounded-xl border border-orange-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-orange-700 uppercase">कवर कक्षाएं (Classes Covered)</span>
            <Layers className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <p className="text-xl font-black text-orange-900 mt-1">{stats.classes}</p>
          <span className="text-[11px] text-orange-700 font-medium">विभिन्न कक्षाओं में कार्य</span>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">आसन्न अंतिम तिथि (Active Due)</span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-800 mt-1">{stats.dueSoon}</p>
          <span className="text-[11px] text-emerald-700 font-medium">आज अथवा आगामी देय</span>
        </div>
      </div>

      {/* Create Homework Form */}
      {showAddHomework && (
        <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-300 animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>{editingHwId ? 'गृहकार्य विवरण संपादित करें (Edit Assignment)' : 'नया दैनिक गृहकार्य प्रेषित करें'}</span>
          </h4>
          <form onSubmit={handleCreateHomework} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-stone-700 font-bold mb-1">लक्षित कक्षा (Class)*</label>
              <select
                value={hwClass}
                onChange={e => setHwClass(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500 font-medium"
              >
                {SSM_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
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
              <label className="block text-stone-700 font-bold mb-1">गृहकार्य शीर्षक (Title)*</label>
              <input
                type="text"
                placeholder="उदा: पाठ 4 - ज्यामिति अभ्यास एवं सूत्र लेखन"
                value={hwTitle}
                onChange={e => setHwTitle(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">आचार्य / शिक्षिका का नाम</label>
              <input
                type="text"
                placeholder="उदा: आचार्य रमेश शर्मा जी"
                value={hwAssignedBy}
                onChange={e => setHwAssignedBy(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-stone-700 font-bold mb-1">गृहकार्य विस्तृत विवरण (Description)*</label>
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
                onClick={handleCancelForm}
                className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                {editingHwId ? 'अद्यतन सहेजें (Update)' : 'गृहकार्य जारी करें (Publish)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="विषय, शीर्षक, विवरण या आचार्य के नाम से खोजें..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <select
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी कक्षाएं (All Classes)</option>
          {SSM_CLASSES.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
        >
          <option value="ALL">सभी स्थिति (All)</option>
          <option value="Active">सक्रिय (Active)</option>
          <option value="Completed">पूर्ण (Completed)</option>
          <option value="Overdue">अवधि पार (Overdue)</option>
        </select>

        {(searchQuery || filterClass !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterClass('ALL');
              setStatusFilter('ALL');
            }}
            className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>फ़िल्टर हटाएं</span>
          </button>
        )}
      </div>

      {/* Homework List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHomework.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500">
            <BookOpen className="w-12 h-12 mx-auto text-stone-300 mb-2" />
            <p className="font-semibold text-sm">
              {searchQuery || filterClass !== 'ALL'
                ? 'खोज एवं फ़िल्टर के अनुरूप कोई गृहकार्य नहीं मिला।'
                : 'वर्तमान में कोई गृहकार्य प्रेषित नहीं है।'}
            </p>
            <p className="text-xs text-stone-400 mt-1">ऊपर दिए गए बटन से नया गृहकार्य जोड़ें।</p>
          </div>
        ) : (
          filteredHomework.map(hw => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isOverdue = hw.dueDate && hw.dueDate < todayStr && hw.status !== 'Completed';
            const statusLabel = hw.status === 'Completed' ? 'पूर्ण' : isOverdue ? 'अवधि पार' : 'सक्रिय';
            const statusClass = hw.status === 'Completed'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : isOverdue
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-blue-100 text-blue-800 border-blue-200';

            const handleWhatsApp = () => {
              const text = `📚 *${currentSchool.hindiName || currentSchool.name}* — गृहकार्य सूचना\n\n🏫 कक्षा: ${hw.class} | 📖 विषय: ${hw.subject}\n📌 ${hw.title}\n\n${hw.description}\n\n⏰ अंतिम तिथि: ${hw.dueDate || 'निर्धारित नहीं'}\n👩‍🏫 आचार्य: ${hw.assignedBy || ''}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
            };

            return (
              <div
                key={hw.id}
                className={`bg-white p-5 rounded-2xl border shadow-2xs transition flex flex-col justify-between ${hw.status === 'Completed' ? 'opacity-70 border-stone-200' : isOverdue ? 'border-red-300 hover:border-red-400' : 'border-stone-200 hover:border-orange-300'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 font-bold rounded-full text-[10px]">
                        {hw.class}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded text-[10px]">
                        {hw.subject}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-rose-500" />
                      <span>देय: {hw.dueDate}</span>
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm mb-1.5">{hw.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-200 whitespace-pre-wrap">
                    {hw.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>
                    आचार्य: <strong className="text-stone-800">{hw.assignedBy}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleWhatsApp}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded font-bold text-[10px] inline-flex items-center gap-1 transition cursor-pointer"
                      title="व्हाट्सएप पर साझा करें"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-700" />
                      <span>WA</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(hw)}
                      className={`p-1 rounded transition cursor-pointer ${hw.status === 'Completed' ? 'text-emerald-500 hover:text-blue-600' : 'text-stone-400 hover:text-emerald-600'}`}
                      title={hw.status === 'Completed' ? 'सक्रिय करें' : 'पूर्ण चिह्नित करें'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(hw)}
                      className="text-stone-400 hover:text-orange-600 p-1 rounded transition cursor-pointer"
                      title="संपादित करें (Edit Homework)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHomework(hw)}
                      className="text-stone-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                      title="गृहकार्य हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {homeworkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900">गृहकार्य हटाएं?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-5">
              क्या आप <span className="font-bold text-stone-800">"{homeworkToDelete.title}"</span> ({homeworkToDelete.class} — {homeworkToDelete.subject}) को स्थायी रूप से हटाना चाहते हैं?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setHomeworkToDelete(null)}
                className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmDeleteHomework}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm cursor-pointer"
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminHomeworkTab = React.memo(AdminHomeworkTabComponent);
