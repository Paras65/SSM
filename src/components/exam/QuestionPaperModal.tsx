import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  X,
  Printer,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  FileText,
  Sliders,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  QuestionPaper,
  QuestionItem,
  QuestionPaperSection,
  ExamPaperType
} from '../../types';
import {
  generateSmartQuestionPaper,
  generateQuestionPaperWithGemini,
  MONTH_OPTIONS,
  SUBJECT_OPTIONS,
  CLASS_OPTIONS
} from '../../services/questionBank';

interface QuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  initialClass?: string;
}

export const QuestionPaperModal: React.FC<QuestionPaperModalProps> = ({
  isOpen,
  onClose,
  initialSubject,
  initialClass
}) => {
  const { publicSchool } = useSchool();

  // Configuration State
  const [examType, setExamType] = useState<ExamPaperType>('unit-test');
  const [classLevel, setClassLevel] = useState<string>(initialClass || 'Class 5');
  const [subject, setSubject] = useState<string>(initialSubject || 'गणित (Mathematics)');
  const [month, setMonth] = useState<string>('अगस्त');
  const [chapters, setChapters] = useState<string>('अध्याय १ एवं २: संख्या पद्धति व संक्रियाएं');
  const [targetMarks, setTargetMarks] = useState<number>(20);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [includeSanskriti, setIncludeSanskriti] = useState<boolean>(true);

  // Gemini AI Generation State
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return (
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      localStorage.getItem('ssm_gemini_api_key') ||
      ''
    );
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>(geminiApiKey);

  const maskApiKey = (key: string) => {
    if (!key) return '';
    const clean = key.trim();
    if (clean.length <= 10) return '••••••••';
    return `${clean.slice(0, 6)}••••••••${clean.slice(-4)}`;
  };

  const handleSaveApiKey = () => {
    const trimmed = keyInput.trim().replace(/[^A-Za-z0-9_-]/g, '');
    setGeminiApiKey(trimmed);
    if (trimmed) {
      localStorage.setItem('ssm_gemini_api_key', trimmed);
    } else {
      localStorage.removeItem('ssm_gemini_api_key');
    }
    setShowApiKeyModal(false);
  };

  const handleGeminiGenerate = async () => {
    const effectiveKey =
      geminiApiKey ||
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      localStorage.getItem('ssm_gemini_api_key') ||
      '';

    if (!effectiveKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsAiGenerating(true);
    try {
      const newPaper = await generateQuestionPaperWithGemini({
        apiKey: effectiveKey,
        schoolId: publicSchool.id,
        schoolName: publicSchool.hindiName,
        classLevel,
        subject,
        examType,
        month,
        chapters,
        targetMarks,
        durationMinutes,
        includeSanskriti,
        customTopic
      });
      setPaper(newPaper);
    } catch (err) {
      console.error('Gemini AI generation failed:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Active Tab: 'editor' | 'preview'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Generated Paper State
  const [paper, setPaper] = useState<QuestionPaper>(() =>
    generateSmartQuestionPaper({
      schoolId: publicSchool.id,
      schoolName: publicSchool.hindiName,
      classLevel: initialClass || 'Class 5',
      subject: initialSubject || 'गणित (Mathematics)',
      examType: 'unit-test',
      month: 'अगस्त',
      chapters: 'अध्याय १ एवं २: संख्या पद्धति व संक्रियाएं',
      targetMarks: 20,
      durationMinutes: 45,
      includeSanskriti: true
    })
  );

  // Calculate live total marks from current questions
  const currentTotalMarks = useMemo(() => {
    return paper.sections.reduce((secAcc, sec) => {
      return secAcc + sec.questions.reduce((qAcc, q) => qAcc + (Number(q.marks) || 0), 0);
    }, 0);
  }, [paper]);

  const marksBalance = currentTotalMarks - targetMarks;

  // Handler to generate new balanced paper
  const handleAutoGenerate = () => {
    const newPaper = generateSmartQuestionPaper({
      schoolId: publicSchool.id,
      schoolName: publicSchool.hindiName,
      classLevel,
      subject,
      examType,
      month,
      chapters,
      targetMarks,
      durationMinutes,
      includeSanskriti
    });
    setPaper(newPaper);
  };

  // Handler when exam type changes
  const handleExamTypeChange = (newType: ExamPaperType) => {
    setExamType(newType);
    if (newType === 'unit-test') {
      setTargetMarks(20);
      setDurationMinutes(45);
    } else if (newType === 'traimasik') {
      setTargetMarks(50);
      setDurationMinutes(90);
    } else {
      setTargetMarks(80);
      setDurationMinutes(150);
    }
  };

  // Inline question text change
  const handleQuestionTextChange = (secIndex: number, qIndex: number, newText: string) => {
    const updatedSections = [...paper.sections];
    updatedSections[secIndex].questions[qIndex].text = newText;
    setPaper({ ...paper, sections: updatedSections });
  };

  // Inline question marks change
  const handleQuestionMarksChange = (secIndex: number, qIndex: number, newMarks: number) => {
    const updatedSections = [...paper.sections];
    updatedSections[secIndex].questions[qIndex].marks = Number(newMarks) || 0;
    setPaper({ ...paper, sections: updatedSections });
  };

  // Delete question
  const handleDeleteQuestion = (secIndex: number, qIndex: number) => {
    const updatedSections = [...paper.sections];
    updatedSections[secIndex].questions.splice(qIndex, 1);
    setPaper({ ...paper, sections: updatedSections });
  };

  // Add custom question to section
  const handleAddQuestion = (secIndex: number) => {
    const updatedSections = [...paper.sections];
    const newQ: QuestionItem = {
      id: `custom-q-${Date.now()}`,
      type: 'sa',
      text: 'नया प्रश्न यहाँ लिखें...',
      marks: 2,
      subject,
      classLevel,
      chapter: chapters,
      difficulty: 'medium'
    };
    updatedSections[secIndex].questions.push(newQ);
    setPaper({ ...paper, sections: updatedSections });
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-orange-200 bg-gradient-to-r from-orange-900 via-amber-900 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-inner shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  स्मार्ट प्रश्न पत्र निर्माता (Smart Question Paper Generator)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-yellow-300 border border-yellow-400/30">
                  पाठ्यक्रम प्रगति आधारित
                </span>
              </div>
              <p className="text-xs text-orange-200/90 truncate max-w-md sm:max-w-xl">
                मासिक इकाई मूल्यांकन (Unit Test) एवं त्रैमासिक परीक्षा हेतु १-क्लिक संतुलित प्रश्न पत्र
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blueprint & Configuration Bar */}
        <div className="p-4 bg-amber-50/60 border-b border-orange-200 space-y-3 shrink-0">
          {/* Top Row: Exam Type Tabs & Live Marks Balance Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-orange-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleExamTypeChange('unit-test')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  examType === 'unit-test'
                    ? 'bg-orange-700 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-orange-50'
                }`}
              >
                <span>📅 मासिक इकाई मूल्यांकन (Unit Test)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExamTypeChange('traimasik')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  examType === 'traimasik'
                    ? 'bg-orange-700 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-orange-50'
                }`}
              >
                <span>📋 त्रैमासिक परीक्षा (Traimasik PT)</span>
              </button>
              <button
                type="button"
                onClick={() => handleExamTypeChange('ardhavarshik')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  examType === 'ardhavarshik'
                    ? 'bg-orange-700 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-orange-50'
                }`}
              >
                <span>🏛️ सत्रीय / अभ्यास परीक्षा</span>
              </button>
            </div>

            {/* Live Marks Balance Indicator */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border shadow-2xs ${
                  marksBalance === 0
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : marksBalance < 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                    : 'bg-red-100 text-red-900 border-red-300 animate-pulse'
                }`}
              >
                {marksBalance === 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>पूर्ण संतुलित ({currentTotalMarks} / {targetMarks} अंक)</span>
                  </>
                ) : marksBalance < 0 ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>{Math.abs(marksBalance)} अंक कम हैं ({currentTotalMarks}/{targetMarks})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-700" />
                    <span>{marksBalance} अंक अधिक हैं ({currentTotalMarks}/{targetMarks})</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleAutoGenerate}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                title="वर्तमान सेटिंग्स के आधार पर नया संतुलित पेपर बनाएं"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>१-क्लिक स्मार्ट जनरेट</span>
              </button>

              <button
                type="button"
                onClick={handleGeminiGenerate}
                disabled={isAiGenerating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                title="Google Gemini AI द्वारा नए प्रश्न पत्र का निर्माण करें"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI तैयार कर रहा है...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>✨ Gemini AI से बनाएं</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowApiKeyModal(true)}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 cursor-pointer transition ${
                  geminiApiKey
                    ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                    : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                }`}
                title="Gemini API Key सेटिंग्स"
              >
                <span>🔑 {geminiApiKey ? maskApiKey(geminiApiKey) : 'API Key जोड़ें'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Grid: Class, Subject, Month, Course Progress, Target Marks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {/* Class */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-600 uppercase mb-0.5">
                कक्षा (Class)
              </label>
              <select
                value={classLevel}
                onChange={e => setClassLevel(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold text-stone-800 focus:outline-hidden focus:border-orange-500"
              >
                {CLASS_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-600 uppercase mb-0.5">
                विषय (Subject)
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold text-stone-800 focus:outline-hidden focus:border-orange-500"
              >
                {SUBJECT_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Month (for Monthly Unit Test) */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-600 uppercase mb-0.5">
                माह (Month)
              </label>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                disabled={examType !== 'unit-test'}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold text-stone-800 focus:outline-hidden focus:border-orange-500 disabled:bg-stone-100 disabled:text-stone-400"
              >
                {MONTH_OPTIONS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Target Marks */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-600 uppercase mb-0.5">
                पूर्णांक (Total Marks)
              </label>
              <div className="flex items-center gap-1">
                {[15, 20, 25, 40, 50].includes(targetMarks) ? (
                  <select
                    value={targetMarks}
                    onChange={e => setTargetMarks(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-bold text-stone-800 focus:outline-hidden focus:border-orange-500"
                  >
                    <option value={15}>15 अंक</option>
                    <option value={20}>20 अंक</option>
                    <option value={25}>25 अंक</option>
                    <option value={40}>40 अंक</option>
                    <option value={50}>50 अंक</option>
                    <option value={80}>80 अंक</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    value={targetMarks}
                    onChange={e => setTargetMarks(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-bold text-stone-800 focus:outline-hidden focus:border-orange-500"
                  />
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-600 uppercase mb-0.5">
                समय (मिनट)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold text-stone-800 focus:outline-hidden focus:border-orange-500"
              />
            </div>

            {/* Sanskriti Bodh Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-1.5 py-1.5 cursor-pointer text-[11px] font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={includeSanskriti}
                  onChange={e => setIncludeSanskriti(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded-sm border-stone-300"
                />
                <span>संस्कृति बोध प्रश्न</span>
              </label>
            </div>
          </div>

          {/* Chapters / Course Progress Input & AI Topic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-extrabold text-stone-600 uppercase mb-0.5">
                पाठ्यक्रम प्रगति / निर्धारित अध्याय (Syllabus Covered This Month)
              </label>
              <input
                type="text"
                value={chapters}
                onChange={e => setChapters(e.target.value)}
                placeholder="उदा. अध्याय १ एवं २: संख्या पद्धति, पूर्णांक एवं वैदिक गणित"
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-orange-500 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-purple-900 uppercase mb-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>AI विशिष्ट विषय / फोकस पाठ (Optional Gemini AI Prompt)</span>
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="उदा. प्रकाश का परावर्तन, कबीर के दोहे, या कोई विशेष टॉपिक..."
                className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/40 text-xs font-semibold text-purple-950 focus:outline-hidden focus:border-purple-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Action & View Switcher Bar */}
        <div className="px-5 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>संपादक (Edit Questions)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-orange-700 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 मुद्रण पूर्वावलोकन (Print Preview)</span>
            </button>
          </div>

          {activeTab === 'preview' && (
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>प्रिंट करें (Print Paper)</span>
            </button>
          )}
        </div>

        {/* Modal Body: Editor vs Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
          {activeTab === 'editor' ? (
            /* TAB 1: QUESTION EDITOR */
            <div className="space-y-6 max-w-4xl mx-auto">
              {paper.sections.map((section, secIndex) => (
                <div
                  key={section.id || secIndex}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-4"
                >
                  {/* Section Title & Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-stone-900">
                        {section.title}
                      </h3>
                      <p className="text-xs text-stone-500">{section.instructions}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-orange-950 border border-amber-200">
                        खण्ड योग: {section.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)} अंक
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddQuestion(secIndex)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 cursor-pointer transition"
                        title="इस खण्ड में प्रश्न जोड़ें"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>प्रश्न जोड़ें</span>
                      </button>
                    </div>
                  </div>

                  {/* Section Questions */}
                  <div className="space-y-3">
                    {section.questions.map((q, qIndex) => (
                      <div
                        key={q.id || qIndex}
                        className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 hover:border-orange-200 transition space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="w-6 h-6 rounded-full bg-stone-200 text-stone-800 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                            {qIndex + 1}
                          </span>
                          <div className="flex-1">
                            <textarea
                              rows={2}
                              value={q.text}
                              onChange={e => handleQuestionTextChange(secIndex, qIndex, e.target.value)}
                              className="w-full p-2 text-xs font-medium text-stone-900 bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:border-orange-400 shadow-2xs resize-y"
                            />

                            {/* Internal Choice if exists */}
                            {q.internalChoiceText && (
                              <div className="mt-1.5 pl-3 border-l-2 border-orange-300">
                                <span className="text-[10px] font-bold text-orange-800 uppercase block">
                                  आंतरिक विकल्प (अथवा):
                                </span>
                                <input
                                  type="text"
                                  value={q.internalChoiceText}
                                  onChange={e => {
                                    const updatedSections = [...paper.sections];
                                    updatedSections[secIndex].questions[qIndex].internalChoiceText = e.target.value;
                                    setPaper({ ...paper, sections: updatedSections });
                                  }}
                                  className="w-full p-1.5 text-xs text-stone-700 bg-white border border-stone-200 rounded-md focus:outline-hidden"
                                />
                              </div>
                            )}

                            {/* MCQ Options Display */}
                            {q.type === 'mcq' && q.options && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={opt.id || optIdx}
                                    className="flex items-center gap-1 px-2 py-1 bg-white border border-stone-200 rounded-md text-[11px]"
                                  >
                                    <span className="font-bold text-stone-500">
                                      ({String.fromCharCode(97 + optIdx)})
                                    </span>
                                    <span className="text-stone-800 truncate">{opt.text}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Marks & Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-stone-500">अंक:</span>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={q.marks}
                                onChange={e => handleQuestionMarksChange(secIndex, qIndex, Number(e.target.value))}
                                className="w-12 px-1.5 py-1 text-center font-bold text-xs bg-white border border-stone-300 rounded-md focus:outline-hidden focus:border-orange-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(secIndex, qIndex)}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="प्रश्न हटाएं"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TAB 2: A4 PRINT PREVIEW */
            <div className="bg-white max-w-[210mm] mx-auto p-8 sm:p-12 rounded-xl shadow-lg border border-stone-200 text-stone-900 font-sans print:p-0 print:shadow-none print:border-none print:max-w-none">
              
              {/* Exam Header */}
              <div className="text-center border-b-2 border-stone-900 pb-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                    {publicSchool.prant || 'उत्तर प्रदेश प्रान्त'}
                  </span>
                  <span className="text-xs font-black text-orange-900 tracking-wide">
                    ॥ सा विद्या या विमुक्तये ॥
                  </span>
                  <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                    सत्र: 2026-27
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-stone-950 tracking-tight leading-tight uppercase">
                  {publicSchool.hindiName}
                </h1>
                <p className="text-xs text-stone-700 font-medium">
                  {publicSchool.name} - {publicSchool.city}
                </p>

                <div className="mt-2.5 inline-block px-4 py-1 rounded-full bg-stone-100 border border-stone-400 text-xs font-black text-stone-900 uppercase tracking-wider">
                  {paper.title}
                </div>
              </div>

              {/* Student & Exam Details Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold border-b border-stone-300 pb-2.5 mb-3 bg-stone-50/50 p-2 rounded-lg">
                <div>
                  <span className="text-stone-500">कक्षा: </span>
                  <span className="text-stone-900">{paper.classLevel}</span>
                </div>
                <div>
                  <span className="text-stone-500">विषय: </span>
                  <span className="text-stone-900">{paper.subject}</span>
                </div>
                <div>
                  <span className="text-stone-500">समय: </span>
                  <span className="text-stone-900">{paper.durationMinutes} मिनट</span>
                </div>
                <div>
                  <span className="text-stone-500">पूर्णांक: </span>
                  <span className="text-stone-900">{paper.totalMarks} अंक</span>
                </div>
              </div>

              {/* Roll Number Box for Student */}
              <div className="flex items-center justify-between text-xs border border-dashed border-stone-400 p-2 rounded-lg mb-4 bg-amber-50/20">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-700">छात्र का नाम:</span>
                  <span className="w-48 border-b border-stone-400 inline-block"></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-700">अनुक्रमांक (Roll No):</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="w-5 h-6 border border-stone-800 rounded-xs flex items-center justify-center text-xs font-mono font-bold bg-white"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* General Instructions */}
              <div className="mb-4 text-[11px] text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                <p className="font-bold text-stone-900 mb-1 uppercase tracking-wider">सामान्य निर्देश (General Instructions):</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {paper.generalInstructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                  {paper.chapters && (
                    <li className="font-semibold text-stone-800">
                      निर्धारित पाठ्यक्रम: {paper.chapters}
                    </li>
                  )}
                </ul>
              </div>

              {/* Sections & Questions */}
              <div className="space-y-5">
                {paper.sections.map((section, secIdx) => (
                  <div key={section.id || secIdx} className="space-y-3">
                    <div className="border-b border-stone-800 pb-1 flex justify-between items-center">
                      <h2 className="text-xs font-black uppercase tracking-wider text-stone-950">
                        {section.title}
                      </h2>
                      <span className="text-[11px] font-bold text-stone-600">
                        [{section.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)} अंक]
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-stone-900 leading-relaxed">
                      {section.questions.map((q, qIdx) => (
                        <div key={q.id || qIdx} className="space-y-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <span className="font-bold mr-1.5">प्र.{qIdx + 1}.</span>
                              <span>{q.text}</span>
                            </div>
                            <span className="font-bold text-stone-800 shrink-0">
                              [{q.marks}]
                            </span>
                          </div>

                          {/* MCQ Options in Grid */}
                          {q.type === 'mcq' && q.options && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6 mt-1 text-[11px]">
                              {q.options.map((opt, optIdx) => (
                                <div key={opt.id || optIdx} className="flex items-center gap-1">
                                  <span className="font-bold">({String.fromCharCode(97 + optIdx)})</span>
                                  <span>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Internal Choice */}
                          {q.internalChoiceText && (
                            <div className="pl-6 pt-1 text-stone-700 italic">
                              <div className="text-center font-bold text-[10px] my-0.5 text-stone-500">
                                --- अथवा (OR) ---
                              </div>
                              <p>{q.internalChoiceText}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Exam Footer */}
              <div className="mt-8 pt-4 border-t border-stone-300 flex justify-between items-center text-[10px] text-stone-500">
                <span>सरस्वती शिशु मंदिर परीक्षा विभाग</span>
                <span className="italic">॥ राष्ट्राय स्वाहा, इदं न मम ॥</span>
                <span>पृष्ठ १ का १</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-600">
            कुल प्रश्न: <span className="font-bold text-stone-900">{paper.sections.reduce((acc, s) => acc + s.questions.length, 0)}</span> | 
            कुल अंक: <span className="font-black text-orange-900">{currentTotalMarks} / {targetMarks}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
            >
              बंद करें
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('preview');
                setTimeout(() => handlePrint(), 200);
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 प्रिंट करें</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gemini API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <span>🔑 Google Gemini API Key सेटिंग्स</span>
              </h3>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Google Gemini AI द्वारा नए प्रश्न पत्र स्वतः उत्पन्न करने हेतु अपनी मुफ़्त API Key दर्ज करें। यह कुंजी आपके ब्राउज़र में सुरक्षित रूप से सहेजी जाती है।
            </p>
            {geminiApiKey && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <span className="font-semibold">सक्रिय कुंजी (सुरक्षित):</span>
                <code className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {maskApiKey(geminiApiKey)}
                </code>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                नई Gemini API Key दर्ज करें:
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:border-purple-600 font-mono"
              />
            </div>
            <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              💡 मुफ़्त API Key प्राप्त करने हेतु:{' '}
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 underline font-bold"
              >
                aistudio.google.com
              </a>{' '}
              पर जाकर Google ID से 1 मिनट में फ़्री की जनरेट करें (प्रतिदिन 1,500 रिक्वेस्ट्स मुफ़्त)।
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl cursor-pointer shadow-xs"
              >
                सहेजें (Save Key)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

