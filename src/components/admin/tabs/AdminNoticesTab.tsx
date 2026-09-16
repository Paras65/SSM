import React, { useState } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import type { Notice } from '../../../types';
import {
  Bell,
  Trash2
} from 'lucide-react';

export const AdminNoticesTab: React.FC = () => {
  const { notices, addNotice, deleteNotice } = useSchool();

  // New Notice form state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<
    'Academics' | 'Events' | 'Examinations' | 'Holidays' | 'Vidya Bharati'
  >('Academics');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Create Form */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200">
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
              className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-orange-500"
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
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="urgent-check" className="font-semibold text-stone-700">
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
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200">
        <h3 className="text-base font-bold text-stone-900 mb-4 pb-2 border-b border-stone-200">
          सक्रिय सूचना पट्ट सूची ({notices.length} सूचनाएं)
        </h3>

        <div className="space-y-3">
          {notices.map(notice => (
            <div
              key={notice.id}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex justify-between items-start gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-stone-500">{notice.date}</span>
                  {notice.isUrgent && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                      महत्वपूर्ण
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-stone-900">{notice.title}</h4>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2">{notice.content}</p>
              </div>

              <button
                onClick={() => deleteNotice(notice.id)}
                className="text-stone-400 hover:text-red-600 p-1 rounded cursor-pointer"
                title="Delete Notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

