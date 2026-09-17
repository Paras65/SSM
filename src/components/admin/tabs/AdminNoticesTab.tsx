import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import type { Notice } from '../../../types';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Layers,
  MessageSquare,
  Search,
  Trash2,
  X
} from 'lucide-react';

const AdminNoticesTabComponent: React.FC = () => {
  const { currentSchool, notices, addNotice, deleteNotice } = useSchool();

  // New Notice form state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<
    'Academics' | 'Events' | 'Examinations' | 'Holidays' | 'Vidya Bharati'
  >('Academics');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    addNotice({
      title: newNoticeTitle,
      category: newNoticeCategory,
      content: newNoticeContent,
      date: new Date().toISOString().split('T')[0],
      isUrgent: newNoticeUrgent
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeUrgent(false);
  };

  // Filtered notices
  const filteredNotices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notices.filter(notice => {
      if (selectedCategory !== 'ALL' && notice.category !== selectedCategory) {
        return false;
      }
      if (q) {
        const matchesTitle = notice.title.toLowerCase().includes(q);
        const matchesContent = notice.content.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }
      return true;
    });
  }, [notices, selectedCategory, searchQuery]);

  // Notice KPI stats
  const stats = useMemo(() => {
    const total = notices.length;
    const urgent = notices.filter(n => n.isUrgent).length;
    const categories = new Set(notices.map(n => n.category)).size;
    return { total, urgent, categories };
  }, [notices]);

  // WhatsApp Broadcast URL
  const handleShareNoticeWhatsApp = (notice: Notice) => {
    const text = `🚩 *${currentSchool.hindiName || currentSchool.name}* 🚩\n📢 *सूचना / परिपत्र (${notice.category})*\n--------------------------------\n📌 *${notice.title}*\nदिनांक: ${notice.date}\n\n${notice.content}\n\n— कार्यालय, ${currentSchool.name}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Notice KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase">कुल सूचनाएं (Total Notices)</span>
            <Bell className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <p className="text-xl font-black text-stone-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-stone-500 font-medium">सूचना पट्ट पर सक्रिय</span>
        </div>

        <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase">अति महत्वपूर्ण (Urgent Notices)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-800 mt-1">{stats.urgent}</p>
          <span className="text-[11px] text-rose-700 font-medium">प्राथमिकता सूचनाएं</span>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase">सक्रिय श्रेणियां (Categories)</span>
            <Layers className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-900 mt-1">{stats.categories}</p>
          <span className="text-[11px] text-amber-700 font-medium">विभिन्न विभागों से जारी</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Create Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-200">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-stone-900">
              नवीन परिपत्र / सूचना जारी करें
            </h3>
          </div>

          <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                सूचना का शीर्षक (Notice Title) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. सत्र 2026-27 प्रवेश परीक्षा तिथि..."
                value={newNoticeTitle}
                onChange={e => setNewNoticeTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                श्रेणी (Category)
              </label>
              <select
                value={newNoticeCategory}
                onChange={e => setNewNoticeCategory(e.target.value as Notice['category'])}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-orange-500 font-medium"
              >
                <option value="Academics">Academics (शैक्षणिक)</option>
                <option value="Events">Events (उत्सव व कार्यक्रम)</option>
                <option value="Examinations">Examinations (परीक्षा)</option>
                <option value="Holidays">Holidays (अवकाश)</option>
                <option value="Vidya Bharati">Vidya Bharati (विद्या भारती)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                विस्तृत विवरण (Content) *
              </label>
              <textarea
                rows={4}
                required
                placeholder="सूचना का पूर्ण विवरण यहाँ लिखें..."
                value={newNoticeContent}
                onChange={e => setNewNoticeContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgent-check"
                checked={newNoticeUrgent}
                onChange={e => setNewNoticeUrgent(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="urgent-check" className="font-semibold text-stone-700 cursor-pointer">
                अति महत्वपूर्ण (Urgent Notice) चिह्नित करें
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              सूचना प्रकाशित करें (Publish Notice)
            </button>
          </form>
        </div>

        {/* Right: Active Notices List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <h3 className="text-base font-bold text-stone-900">
              सक्रिय सूचना पट्ट सूची ({filteredNotices.length} सूचनाएं)
            </h3>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="शीर्षक या विवरण से खोजें..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
            >
              <option value="ALL">समस्त श्रेणियां (All)</option>
              <option value="Academics">शैक्षणिक (Academics)</option>
              <option value="Events">उत्सव (Events)</option>
              <option value="Examinations">परीक्षा (Examinations)</option>
              <option value="Holidays">अवकाश (Holidays)</option>
              <option value="Vidya Bharati">विद्या भारती</option>
            </select>

            {(searchQuery || selectedCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="text-xs font-bold text-stone-500 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>हटाएं</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredNotices.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs bg-stone-50 rounded-xl border border-stone-200">
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'खोज एवं श्रेणी के अनुरूप कोई सूचना नहीं मिली।'
                  : 'वर्तमान में कोई सक्रिय सूचना उपलब्ध नहीं है।'}
              </div>
            ) : (
              filteredNotices.map(notice => (
                <div
                  key={notice.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex justify-between items-start gap-4 hover:border-orange-200 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                        {notice.category}
                      </span>
                      <span className="text-[11px] text-stone-500">{notice.date}</span>
                      {notice.isUrgent && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                          महत्वपूर्ण
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">{notice.title}</h4>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-3 whitespace-pre-wrap">{notice.content}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleShareNoticeWhatsApp(notice)}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                      title="अभिभावकों / आचार्यों के व्हाट्सएप ग्रुप में साझा करें"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-700" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => deleteNotice(notice.id)}
                      className="text-stone-400 hover:text-red-600 p-1.5 rounded cursor-pointer"
                      title="सूचना हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminNoticesTab = React.memo(AdminNoticesTabComponent);
