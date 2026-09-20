import React, { useState, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { generateSmartJSON } from '../../../services/aiService';
import type { Notice } from '../../../types';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Edit2,
  MessageSquare,
  Search,
  Trash2,
  X,
  Sparkles,
  Mic,
  RefreshCw
} from 'lucide-react';

const AdminNoticesTabComponent: React.FC = () => {
  const { currentSchool, notices, addNotice, updateNotice, deleteNotice } = useSchool();

  // New Notice form state
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<
    'Academics' | 'Events' | 'Examinations' | 'Holidays' | 'Vidya Bharati'
  >('Academics');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);
  const [newNoticeExpiresAt, setNewNoticeExpiresAt] = useState('');

  // Smart Notice Drafter State
  const [smartTopic, setSmartTopic] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startVoiceForNotice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('ब्राउज़र में आवाज़ पहचान (Voice Input) समर्थित नहीं है।');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSmartTopic(transcript);
        setIsListening(false);
        handleDraftSmartNotice(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleDraftSmartNotice = async (overrideTopic?: string) => {
    const topic = (overrideTopic || smartTopic).trim();
    if (!topic) return;
    setIsDrafting(true);

    const fallbackDraft = (t: string) => {
      const schoolHindi = currentSchool.hindiName || currentSchool.name;
      if (t.includes('अवकाश') || t.includes('छुट्टी') || t.includes('होली') || t.includes('दीपावली') || t.includes('शीतकालीन') || t.includes('गर्मी')) {
        return {
          title: `${t} सम्बन्धी आवश्यक सूचना`,
          category: 'Holidays' as const,
          content: `सादर प्रणाम,\n\nविद्या भारती अखिल भारतीय शिक्षा संस्थान के पंचांग अनुसार, समस्त अभिभावकों एवं भैया-बहिनों को सूचित किया जाता है कि विद्यालय में ${t} के उपलक्ष्य में अवकाश रहेगा।\n\nअवकाश उपरांत विद्यालय पूर्व निर्धारित समयानुसार खुलेगा। समस्त भैया-बहिन दैनिक स्वाध्याय निरंतर रखें।\n\n— प्रधानाचार्य कार्यालय,\n${schoolHindi}`
        };
      }
      if (t.includes('परीक्षा') || t.includes('मूल्यांकन') || t.includes('प्रवेश पत्र') || t.includes('डेट शीट')) {
        return {
          title: `${t} समय-सारिणी एवं दिशा-निर्देश`,
          category: 'Examinations' as const,
          content: `सादर वन्दे,\n\nसमस्त अभिभावकों एवं विद्यार्थियों को सूचित किया जाता है कि आगामी ${t} की घोषणा कर दी गई है।\n\nसमस्त भैया-बहिन नियत समय पर पूर्ण गणवेश एवं प्रवेश पत्र के साथ उपस्थित हों। अधिक जानकारी हेतु कक्षाचार्य से संपर्क करें।\n\n— परीक्षा विभाग,\n${schoolHindi}`
        };
      }
      if (t.includes('गोष्ठी') || t.includes('बैठक') || t.includes('PTM') || t.includes('सम्मेलन')) {
        return {
          title: `अभिभावक-आचार्य गोष्ठी (PTM) आमंत्रण`,
          category: 'Events' as const,
          content: `सादर प्रणाम,\n\nविद्यार्थियों के सर्वांगीण विकास एवं पंचमुखी मूल्यांकन की समीक्षा हेतु ${t} का आयोजन विद्यालय परिसर में किया जा रहा है।\n\nसमस्त आदरणीय अभिभावकों से सानुरोध प्रार्थना है कि निर्धारित समय पर पधारकर अपने पाल्य की प्रगति पर आचार्यों से विचार-विमर्श करें।\n\n— प्रधानाचार्य,\n${schoolHindi}`
        };
      }
      return {
        title: `${t} सम्बन्धी आधिकारिक परिपत्र`,
        category: 'Academics' as const,
        content: `सादर प्रणाम,\n\nसमस्त भैया-बहिनों एवं अभिभावकों को सूचित किया जाता है कि ${t} के संदर्भ में आवश्यक दिशा-निर्देश जारी किए गए हैं।\n\nकृपया नियमों का पालन सुनिश्चित करें एवं अधिक जानकारी हेतु विद्यालय कार्यालय में संपर्क करें।\n\n— प्रधानाचार्य कार्यालय,\n${schoolHindi}`
      };
    };

    try {
      const schoolHindi = currentSchool.hindiName || currentSchool.name;
      const prompt = `You are the Principal of ${schoolHindi} (Vidya Bharati school).
Draft a formal, respectful official school notice in Hindi based on this brief topic: "${topic}".
Output MUST be strictly valid JSON without markdown formatting:
{
  "title": "Short Hindi notice title",
  "category": "Academics",
  "content": "Full formal Hindi notice content with salutation 'सादर प्रणाम/सादर वन्दे', clear instructions, and sign-off '— प्रधानाचार्य कार्यालय, ${schoolHindi}'"
}`;

      const parsed = await generateSmartJSON<{
        title?: string;
        category?: Notice['category'];
        content?: string;
      }>(prompt, { temperature: 0.2 });

      if (parsed && parsed.title && parsed.content) {
        setNewNoticeTitle(parsed.title);
        setNewNoticeCategory(parsed.category || 'Academics');
        setNewNoticeContent(parsed.content);
      } else {
        const d = fallbackDraft(topic);
        setNewNoticeTitle(d.title);
        setNewNoticeCategory(d.category);
        setNewNoticeContent(d.content);
      }
    } catch {
      const d = fallbackDraft(topic);
      setNewNoticeTitle(d.title);
      setNewNoticeCategory(d.category);
      setNewNoticeContent(d.content);
    } finally {
      setIsDrafting(false);
    }
  };

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expiryFilter, setExpiryFilter] = useState<'ALL' | 'Active' | 'Expired'>('ALL');

  // Delete confirmation modal
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  // Edit modal
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<Notice['category']>('Academics');
  const [editContent, setEditContent] = useState('');
  const [editUrgent, setEditUrgent] = useState(false);
  const [editExpiresAt, setEditExpiresAt] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    addNotice({
      title: newNoticeTitle,
      category: newNoticeCategory,
      content: newNoticeContent,
      date: today,
      isUrgent: newNoticeUrgent,
      ...(newNoticeExpiresAt ? { expiresAt: newNoticeExpiresAt } : {})
    });
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeUrgent(false);
    setNewNoticeExpiresAt('');
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setEditTitle(notice.title);
    setEditCategory(notice.category);
    setEditContent(notice.content);
    setEditUrgent(!!notice.isUrgent);
    setEditExpiresAt(notice.expiresAt || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;
    await updateNotice(editingNotice.id, {
      title: editTitle,
      category: editCategory,
      content: editContent,
      isUrgent: editUrgent,
      expiresAt: editExpiresAt || undefined
    });
    setEditingNotice(null);
  };

  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return;
    await deleteNotice(noticeToDelete.id);
    setNoticeToDelete(null);
  };

  // Filtered notices
  const filteredNotices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notices.filter(notice => {
      if (selectedCategory !== 'ALL' && notice.category !== selectedCategory) return false;
      if (expiryFilter === 'Active') {
        if (notice.expiresAt && notice.expiresAt < today) return false;
      } else if (expiryFilter === 'Expired') {
        if (!notice.expiresAt || notice.expiresAt >= today) return false;
      }
      if (q) {
        const matchesTitle = notice.title.toLowerCase().includes(q);
        const matchesContent = notice.content.toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }
      return true;
    });
  }, [notices, selectedCategory, searchQuery, expiryFilter, today]);

  // Notice KPI stats
  const stats = useMemo(() => {
    const total = notices.length;
    const urgent = notices.filter(n => n.isUrgent).length;
    const expired = notices.filter(n => n.expiresAt && n.expiresAt < today).length;
    return { total, urgent, expired };
  }, [notices, today]);

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
          <span className="text-[11px] text-stone-500 font-medium">सूचना पट्ट पर</span>
        </div>

        <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase">अति महत्वपूर्ण (Urgent)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <p className="text-xl font-black text-rose-800 mt-1">{stats.urgent}</p>
          <span className="text-[11px] text-rose-700 font-medium">प्राथमिकता सूचनाएं</span>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase">समाप्त सूचनाएं (Expired)</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-900 mt-1">{stats.expired}</p>
          <span className="text-[11px] text-amber-700 font-medium">समाप्ति तिथि बीत चुकी</span>
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
            {/* Smart 1-Click Notice Drafter Box */}
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>बौद्धिक नोटिस लेखक (बोलें या २ शब्द लिखें)</span>
                </span>
                <span className="text-[10px] text-amber-800 font-medium">१-क्लिक स्वतः ड्राफ्ट</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={smartTopic}
                  onChange={e => setSmartTopic(e.target.value)}
                  placeholder="उदा. होली अवकाश 3 दिन, या रविवार गोष्ठी..."
                  className="flex-1 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:border-orange-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={startVoiceForNotice}
                  className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse border-red-700'
                      : 'bg-white text-stone-600 hover:text-orange-700 border-amber-300 hover:bg-amber-100'
                  }`}
                  title="बोलकर विषय बताएं"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isDrafting || !smartTopic.trim()}
                  onClick={() => handleDraftSmartNotice()}
                  className="px-3 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0 flex items-center gap-1"
                  title="औपचारिक परिपत्र तैयार करें"
                >
                  {isDrafting ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>तैयार...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>ड्राफ्ट करें</span>
                    </>
                  )}
                </button>
              </div>
            </div>

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

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                समाप्ति तिथि (Expiry Date) — वैकल्पिक
              </label>
              <input
                type="date"
                value={newNoticeExpiresAt}
                min={today}
                onChange={e => setNewNoticeExpiresAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
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
              सूचना पट्ट सूची ({filteredNotices.length} सूचनाएं)
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

            <select
              value={expiryFilter}
              onChange={e => setExpiryFilter(e.target.value as 'ALL' | 'Active' | 'Expired')}
              className="px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-medium"
            >
              <option value="ALL">सभी (All)</option>
              <option value="Active">सक्रिय (Active)</option>
              <option value="Expired">समाप्त (Expired)</option>
            </select>

            {(searchQuery || selectedCategory !== 'ALL' || expiryFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setExpiryFilter('ALL');
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
                {searchQuery || selectedCategory !== 'ALL' || expiryFilter !== 'ALL'
                  ? 'खोज एवं फ़िल्टर के अनुरूप कोई सूचना नहीं मिली।'
                  : 'वर्तमान में कोई सूचना उपलब्ध नहीं है।'}
              </div>
            ) : (
              filteredNotices.map(notice => {
                const isExpired = !!notice.expiresAt && notice.expiresAt < today;
                return (
                  <div
                    key={notice.id}
                    className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition ${isExpired ? 'bg-stone-100 border-stone-300 opacity-70' : 'bg-stone-50 border-stone-200 hover:border-orange-200'}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                          {notice.category}
                        </span>
                        <span className="text-[11px] text-stone-500">{notice.date}</span>
                        {notice.isUrgent && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded border border-red-200">
                            महत्वपूर्ण
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-[10px] font-bold text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded border border-stone-300">
                            समाप्त
                          </span>
                        )}
                        {notice.expiresAt && !isExpired && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            समाप्ति: {notice.expiresAt}
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
                        title="व्हाट्सएप पर साझा करें"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-700" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => openEditModal(notice)}
                        className="text-stone-400 hover:text-orange-600 p-1.5 rounded cursor-pointer"
                        title="सूचना संपादित करें"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setNoticeToDelete(notice)}
                        className="text-stone-400 hover:text-red-600 p-1.5 rounded cursor-pointer"
                        title="सूचना हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {noticeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-stone-900">सूचना हटाएं?</h3>
            </div>
            <p className="text-sm text-stone-600 mb-5">
              क्या आप सूचना <span className="font-bold text-stone-800">"{noticeToDelete.title}"</span> को स्थायी रूप से हटाना चाहते हैं?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setNoticeToDelete(null)}
                className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-sm cursor-pointer"
              >
                हाँ, हटाएं
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-stone-900">सूचना संपादित करें</h3>
              </div>
              <button onClick={() => setEditingNotice(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">शीर्षक (Title) *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">श्रेणी (Category)</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as Notice['category'])}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Academics">Academics (शैक्षणिक)</option>
                  <option value="Events">Events (उत्सव)</option>
                  <option value="Examinations">Examinations (परीक्षा)</option>
                  <option value="Holidays">Holidays (अवकाश)</option>
                  <option value="Vidya Bharati">Vidya Bharati (विद्या भारती)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">विवरण (Content) *</label>
                <textarea
                  rows={4}
                  required
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">समाप्ति तिथि (Expiry Date)</label>
                <input
                  type="date"
                  value={editExpiresAt}
                  onChange={e => setEditExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-urgent-check"
                  checked={editUrgent}
                  onChange={e => setEditUrgent(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="edit-urgent-check" className="font-semibold text-stone-700 cursor-pointer">
                  अति महत्वपूर्ण (Urgent Notice)
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNotice(null)}
                  className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-orange-700 hover:bg-orange-800 text-white font-bold cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  सहेजें (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminNoticesTab = React.memo(AdminNoticesTabComponent);
