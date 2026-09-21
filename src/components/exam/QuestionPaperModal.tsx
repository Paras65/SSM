import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
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
  ChevronDown,
  ChevronUp,
  Sliders,
  Eye,
  Layers,
  ArrowRight,
  Mic,
  Save,
  Download,
  FolderOpen
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
  getDefaultChaptersForMonth,
  MONTH_OPTIONS,
  SUBJECT_OPTIONS,
  CLASS_OPTIONS
} from '../../services/questionBank';
import { createSpeechRecognitionInstance, isSpeechRecognitionSupported } from '../../utils/speechRecognition';

interface QuestionPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  initialClass?: string;
}

// Helper: Recommended Marks & Duration based on Class Level and Exam Type for Vidya Bharati
const getRecommendedMarksAndDuration = (classLvl: string, type: ExamPaperType): { marks: number; duration: number } => {
  const isJunior = ['Class 1', 'Class 2', 'Class 3'].includes(classLvl);
  const isSenior = ['Class 9', 'Class 10'].includes(classLvl);

  if (type === 'unit-test') {
    if (isJunior) return { marks: 15, duration: 40 };
    if (isSenior) return { marks: 25, duration: 50 };
    return { marks: 20, duration: 45 };
  }
  if (type === 'traimasik') {
    if (isJunior) return { marks: 30, duration: 60 };
    return { marks: 50, duration: 90 };
  }
  if (type === 'ardhavarshik' || type === 'varshik') {
    if (isJunior) return { marks: 50, duration: 90 };
    if (isSenior) return { marks: 80, duration: 180 };
    return { marks: 80, duration: 150 };
  }
  return { marks: 25, duration: 45 };
};

// Helper: Auto-generate rich, curriculum-aligned AI prompt for non-tech teachers
const getRecommendedPrompt = (
  classLvl: string,
  subj: string,
  mon: string,
  type: ExamPaperType,
  chaps: string
): string => {
  const cleanSubject = subj.split(' ')[0] || subj;
  const examName =
    type === 'unit-test'
      ? `${mon} मासिक इकाई मूल्यांकन`
      : type === 'traimasik'
      ? 'त्रैमासिक परीक्षा'
      : 'अर्द्धवार्षिक परीक्षा';

  const baseChapters = chaps.replace(/^अध्याय\s*[^:]*:\s*/i, '').trim() || chaps;
  return `${classLvl} ${cleanSubject} के ${examName} हेतु (${baseChapters}) पर आधारित संतुलित विद्या भारती ब्लूप्रिंट अनुसार प्रश्न पत्र।`;
};

export const QuestionPaperModal: React.FC<QuestionPaperModalProps> = ({
  isOpen,
  onClose,
  initialClass,
  initialSubject
}) => {
  const { publicSchool } = useSchool();
  const { showSuccess, showInfo, showError, showWarning } = useToast();

  const initialMarksDuration = getRecommendedMarksAndDuration(initialClass || 'Class 5', 'unit-test');
  const initialChapters = 'अध्याय १ एवं २: संख्या पद्धति व संक्रियाएं';
  const initialPrompt = getRecommendedPrompt(
    initialClass || 'Class 5',
    initialSubject || 'गणित (Mathematics)',
    'अगस्त',
    'unit-test',
    initialChapters
  );

  // Configuration State
  const [examType, setExamType] = useState<ExamPaperType>('unit-test');
  const [classLevel, setClassLevel] = useState<string>(initialClass || 'Class 5');
  const [subject, setSubject] = useState<string>(initialSubject || 'गणित (Mathematics)');
  const [month, setMonth] = useState<string>('अगस्त');
  const [chapters, setChapters] = useState<string>(initialChapters);
  const [targetMarks, setTargetMarks] = useState<number>(initialMarksDuration.marks);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialMarksDuration.duration);
  const [includeSanskriti, setIncludeSanskriti] = useState<boolean>(true);

  // Voice Target Type
  type VoiceTarget =
    | { type: 'chapters' }
    | { type: 'topic' }
    | { type: 'voice-command' }
    | { type: 'question'; secIndex: number; qIndex: number }
    | { type: 'choice'; secIndex: number; qIndex: number }
    | { type: 'mcq-opt'; secIndex: number; qIndex: number; optIndex: number };

  // Special Focus & Generation State
  const [customTopic, setCustomTopic] = useState<string>(initialPrompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Enhancement States
  const [printDensity, setPrintDensity] = useState<'compact' | 'normal'>('compact');
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);
  const [showSymbols, setShowSymbols] = useState<boolean>(false);
  const [showMobileConfig, setShowMobileConfig] = useState<boolean>(false);
  const [focusedQuestionTarget, setFocusedQuestionTarget] = useState<{ secIndex: number; qIndex: number } | null>(null);

  const MATH_SYMBOLS = ['√', 'π', '°', '×', '÷', '±', '²', '³', '½', '¼', '≠', '≤', '≥', '∠', 'Δ', '≈', '∞', '%'];
  const SANSKRIT_SYMBOLS = ['्', 'ं', 'ः', 'ँ', 'ऽ', 'ऋ', 'ॐ', '॥'];

  // Insert Math / Sanskrit symbol into question
  const handleInsertSymbol = (sym: string) => {
    if (focusedQuestionTarget) {
      const { secIndex, qIndex } = focusedQuestionTarget;
      setPaper(prev => {
        const updated = { ...prev };
        const sections = [...updated.sections];
        if (sections[secIndex]?.questions[qIndex]) {
          sections[secIndex].questions[qIndex].text += ` ${sym} `;
        }
        return { ...updated, sections };
      });
      showInfo(`चिन्ह "${sym}" प्रविष्‍ट हुआ!`);
    } else {
      try {
        navigator.clipboard.writeText(sym);
        showSuccess(`चिन्ह "${sym}" कॉपी हुआ!`);
      } catch {
        showInfo(`चिन्ह: ${sym}`);
      }
    }
  };

  // Move question up or down within section
  const handleMoveQuestion = (secIndex: number, qIndex: number, direction: 'up' | 'down') => {
    const updatedSections = [...paper.sections];
    const questions = [...updatedSections[secIndex].questions];
    const targetIndex = direction === 'up' ? qIndex - 1 : qIndex + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const temp = questions[qIndex];
    questions[qIndex] = questions[targetIndex];
    questions[targetIndex] = temp;
    updatedSections[secIndex].questions = questions;
    setPaper({ ...paper, sections: updatedSections });
  };

  // Smart / Baudhik Key (Auto-detected from .env or Super Admin configuration)
  const smartKey = useMemo(() => {
    return (
      (import.meta.env.VITE_SMART_API_KEY as string) ||
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      localStorage.getItem('ssm_smart_api_key') ||
      localStorage.getItem('ssm_gemini_api_key') ||
      ''
    );
  }, []);

  // Voice Input State & Ref
  const [isListening, setIsListening] = useState<boolean>(false);
  const [activeVoiceTarget, setActiveVoiceTarget] = useState<VoiceTarget | null>(null);
  const recognitionRef = useRef<any>(null);

  // Stop any active speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  // Saved Papers State (Save to device / localStorage)
  const [savedPapers, setSavedPapers] = useState<QuestionPaper[]>(() => {
    try {
      const stored = localStorage.getItem('ssm_saved_question_papers');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);

  // Voice Input Handler (Hindi & English Web Speech API + Question Dictation + Voice Commands)
  const handleVoiceInput = (target: VoiceTarget) => {
    if (!isSpeechRecognitionSupported()) {
      alert('आपके ब्राउज़र में आवाज़ पहचान (Voice Input) समर्थित नहीं है। कृपया Google Chrome, Microsoft Edge या समर्थित ब्राउज़र का उपयोग करें।');
      return;
    }

    // If currently listening to this exact target, stop cleanly
    const isSameTarget =
      isListening &&
      activeVoiceTarget &&
      activeVoiceTarget.type === target.type &&
      (target.type !== 'question' ||
        (activeVoiceTarget.type === 'question' &&
          activeVoiceTarget.secIndex === target.secIndex &&
          activeVoiceTarget.qIndex === target.qIndex)) &&
      (target.type !== 'choice' ||
        (activeVoiceTarget.type === 'choice' &&
          activeVoiceTarget.secIndex === target.secIndex &&
          activeVoiceTarget.qIndex === target.qIndex)) &&
      (target.type !== 'mcq-opt' ||
        (activeVoiceTarget.type === 'mcq-opt' &&
          activeVoiceTarget.secIndex === target.secIndex &&
          activeVoiceTarget.qIndex === target.qIndex &&
          activeVoiceTarget.optIndex === target.optIndex));

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
      setIsListening(false);
      setActiveVoiceTarget(null);
      if (isSameTarget) return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }

      const recognition = createSpeechRecognitionInstance({
        lang: 'hi-IN',
        continuous: false,
        interimResults: true,
        onStart: () => {
          setIsListening(true);
          setActiveVoiceTarget(target);
          if (target.type === 'voice-command') {
            showInfo('🎙️ बोलें: "सहेजें", "सेव करें", या "प्रिंट करें"...');
          } else if (target.type === 'question') {
            showInfo(`🎙️ प्र.${target.qIndex + 1} बोलकर लिखें...`);
          } else if (target.type === 'choice') {
            showInfo('🎙️ अथवा विकल्प बोलकर लिखें...');
          } else if (target.type === 'mcq-opt') {
            showInfo(`🎙️ विकल्प (${String.fromCharCode(97 + target.optIndex)}) बोलकर लिखें...`);
          } else if (target.type === 'chapters') {
            showInfo('🎙️ पाठ्यक्रम / अध्याय का नाम बोलें...');
          }
        },
        onResult: (clean) => {
          if (!clean) return;

          // Detect voice command when listening for voice-command
          if (target.type === 'voice-command') {
            const lower = clean.toLowerCase();
            if (
              lower.includes('सहेज') ||
              lower.includes('सेव') ||
              lower.includes('save') ||
              lower.includes('सुरक्षित')
            ) {
              handleSaveToDevice();
              showSuccess('🎙️ आवाज़ आदेश: प्रश्न पत्र डिवाइस में सहेजा गया!');
              try { recognition?.stop(); } catch {}
              return;
            }

            if (lower.includes('प्रिंट') || lower.includes('print')) {
              setActiveTab('preview');
              showSuccess('🎙️ आवाज़ आदेश: प्रिंट पूर्वावलोकन खोला गया!');
              setTimeout(() => {
                handlePrint();
              }, 600);
              try { recognition?.stop(); } catch {}
              return;
            }
          } else if (target.type === 'topic') {
            setCustomTopic(clean);
          } else if (target.type === 'chapters') {
            setChapters(clean);
          } else if (target.type === 'question') {
            setPaper(prev => {
              const updated = { ...prev };
              const sections = [...updated.sections];
              if (sections[target.secIndex]?.questions[target.qIndex]) {
                sections[target.secIndex].questions[target.qIndex].text = clean;
              }
              return { ...updated, sections };
            });
          } else if (target.type === 'choice') {
            setPaper(prev => {
              const updated = { ...prev };
              const sections = [...updated.sections];
              if (sections[target.secIndex]?.questions[target.qIndex]) {
                sections[target.secIndex].questions[target.qIndex].internalChoiceText = clean;
              }
              return { ...updated, sections };
            });
          } else if (target.type === 'mcq-opt') {
            setPaper(prev => {
              const updated = { ...prev };
              const sections = [...updated.sections];
              const q = sections[target.secIndex]?.questions[target.qIndex];
              if (q && q.options && q.options[target.optIndex]) {
                q.options[target.optIndex].text = clean;
              }
              return { ...updated, sections };
            });
          }
        },
        onError: (event: any) => {
          console.warn('Speech recognition error:', event?.error);
          setIsListening(false);
          setActiveVoiceTarget(null);
          recognitionRef.current = null;
          if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
            alert('माइक्रोफ़ोन की अनुमति नहीं मिली है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति (Allow Microphone) प्रदान करें।');
          } else if (event?.error === 'network') {
            alert('वॉइस इनपुट हेतु सक्रिय इंटरनेट कनेक्शन आवश्यक है।');
          } else if (event?.error !== 'no-speech' && event?.error !== 'aborted') {
            showWarning(`वॉइस पहचान: ${event?.error || 'त्रुटि'}`);
          }
        },
        onEnd: () => {
          setIsListening(false);
          setActiveVoiceTarget(null);
          recognitionRef.current = null;
        }
      });

      if (!recognition) {
        throw new Error('Could not create recognition instance');
      }

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      setActiveVoiceTarget(null);
      recognitionRef.current = null;
      alert('माइक्रोफ़ोन आरंभ करने में समस्या आई। कृपया पुनः प्रयास करें।');
    }
  };

  // Save Paper to Device (Local Storage)
  const handleSaveToDevice = () => {
    try {
      const paperToSave: QuestionPaper = {
        ...paper,
        id: paper.id || `qp-${Date.now()}`,
        createdAt: paper.createdAt || new Date().toISOString()
      };

      const existing = [...savedPapers];
      const index = existing.findIndex(p => p.id === paperToSave.id);
      let updated: QuestionPaper[];
      if (index >= 0) {
        existing[index] = paperToSave;
        updated = existing;
      } else {
        updated = [paperToSave, ...existing].slice(0, 50); // Keep last 50 papers
      }

      setSavedPapers(updated);
      localStorage.setItem('ssm_saved_question_papers', JSON.stringify(updated));
      showSuccess('प्रश्न पत्र डिवाइस में सुरक्षित सहेजा गया!');
    } catch {
      showError('सहेजने में त्रुटि आई।');
    }
  };

  // Load Saved Paper
  const handleLoadSavedPaper = (saved: QuestionPaper) => {
    setPaper(saved);
    setClassLevel(saved.classLevel || classLevel);
    setSubject(saved.subject || subject);
    setExamType(saved.examType || examType);
    if (saved.month) setMonth(saved.month);
    if (saved.chapters) setChapters(saved.chapters);
    if (saved.totalMarks) setTargetMarks(saved.totalMarks);
    if (saved.durationMinutes) setDurationMinutes(saved.durationMinutes);
    setShowSavedModal(false);
    showSuccess(`"${saved.title}" लोड किया गया!`);
  };

  // Delete Saved Paper
  const handleDeleteSavedPaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPapers.filter(p => p.id !== id);
    setSavedPapers(updated);
    localStorage.setItem('ssm_saved_question_papers', JSON.stringify(updated));
  };

  // Download Paper as JSON / File backup
  const handleDownloadJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(paper, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `question_paper_${subject.replace(/[^a-zA-Z0-9]/g, '_')}_${classLevel.replace(/\s+/g, '_')}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showSuccess('प्रश्न पत्र फ़ाइल डाउनलोड हो गई!');
    } catch {
      showError('डाउनलोड करने में समस्या आई।');
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
      chapters: initialChapters,
      targetMarks: initialMarksDuration.marks,
      durationMinutes: initialMarksDuration.duration,
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

  // Handler to generate new balanced paper (Async with Smart Key support & fallback)
  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const effectiveKey = (
        smartKey ||
        (import.meta.env.VITE_GEMINI_API_KEY as string) ||
        localStorage.getItem('ssm_smart_api_key') ||
        localStorage.getItem('ssm_gemini_api_key') ||
        ''
      ).trim();

      if (effectiveKey) {
        showInfo('⏳ बौद्धिक ब्लूप्रिंट अनुसार पेपर तैयार हो रहा है...');
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
          includeSanskriti
        });
        setPaper(newPaper);
        showSuccess(`✨ बौद्धिक ब्लूप्रिंट अनुसार ${classLevel} ${subject.split(' ')[0]} का नया प्रश्न पत्र तैयार है!`);
      } else {
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
        showSuccess(`✨ ${classLevel} ${subject.split(' ')[0]} का संतुलित प्रश्न पत्र तैयार है!`);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      const fallbackPaper = generateSmartQuestionPaper({
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
      setPaper(fallbackPaper);
      showSuccess('✨ अंतर्निहित प्रश्न बैंक से संतुलित प्रश्न पत्र तैयार किया गया।');
    } finally {
      setIsGenerating(false);
      setShowMobileConfig(false);
    }
  };

  // Auto-sync paper when Class changes (marks, duration, chapters, prompt, paper)
  const handleClassChange = (newClass: string) => {
    setClassLevel(newClass);
    const rec = getRecommendedMarksAndDuration(newClass, examType);
    setTargetMarks(rec.marks);
    setDurationMinutes(rec.duration);
    const newChaps = getDefaultChaptersForMonth(month, subject, examType);
    setChapters(newChaps);
    const newPrompt = getRecommendedPrompt(newClass, subject, month, examType, newChaps);
    setCustomTopic(newPrompt);

    const newPaper = generateSmartQuestionPaper({
      schoolId: publicSchool.id,
      schoolName: publicSchool.hindiName,
      classLevel: newClass,
      subject,
      examType,
      month,
      chapters: newChaps,
      targetMarks: rec.marks,
      durationMinutes: rec.duration,
      includeSanskriti
    });
    setPaper(newPaper);
  };

  // Auto-sync paper when Exam Type changes (marks, duration, chapters, prompt, paper)
  const handleExamTypeChange = (newType: ExamPaperType) => {
    setExamType(newType);
    const rec = getRecommendedMarksAndDuration(classLevel, newType);
    setTargetMarks(rec.marks);
    setDurationMinutes(rec.duration);
    const newChaps = getDefaultChaptersForMonth(month, subject, newType);
    setChapters(newChaps);
    const newPrompt = getRecommendedPrompt(classLevel, subject, month, newType, newChaps);
    setCustomTopic(newPrompt);

    const newPaper = generateSmartQuestionPaper({
      schoolId: publicSchool.id,
      schoolName: publicSchool.hindiName,
      classLevel,
      subject,
      examType: newType,
      month,
      chapters: newChaps,
      targetMarks: rec.marks,
      durationMinutes: rec.duration,
      includeSanskriti
    });
    setPaper(newPaper);
  };

  // Auto-fill chapters, prompt & regenerate when Month changes
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    const newChaps = getDefaultChaptersForMonth(newMonth, subject, examType);
    setChapters(newChaps);
    const newPrompt = getRecommendedPrompt(classLevel, subject, newMonth, examType, newChaps);
    setCustomTopic(newPrompt);

    const newPaper = generateSmartQuestionPaper({
      schoolId: publicSchool.id,
      schoolName: publicSchool.hindiName,
      classLevel,
      subject,
      examType,
      month: newMonth,
      chapters: newChaps,
      targetMarks,
      durationMinutes,
      includeSanskriti
    });
    setPaper(newPaper);
  };

  // Auto-fill chapters, prompt & regenerate when Subject changes
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    const newChaps = getDefaultChaptersForMonth(month, newSubject, examType);
    setChapters(newChaps);
    const newPrompt = getRecommendedPrompt(classLevel, newSubject, month, examType, newChaps);
    setCustomTopic(newPrompt);

    const newPaper = generateSmartQuestionPaper({
      schoolId: publicSchool.id,
      schoolName: publicSchool.hindiName,
      classLevel,
      subject: newSubject,
      examType,
      month,
      chapters: newChaps,
      targetMarks,
      durationMinutes,
      includeSanskriti
    });
    setPaper(newPaper);
  };

  // 1-Click Auto-Fix Marks Balance
  const handleAutoFixBalance = () => {
    if (marksBalance === 0) return;
    const updatedSections = [...paper.sections];

    if (marksBalance > 0) {
      let remainingToRemove = marksBalance;
      for (let s = updatedSections.length - 1; s >= 0 && remainingToRemove > 0; s--) {
        const sec = updatedSections[s];
        for (let q = sec.questions.length - 1; q >= 0 && remainingToRemove > 0; q--) {
          const currentQ = sec.questions[q];
          if (currentQ.marks > 1) {
            const reduction = Math.min(currentQ.marks - 1, remainingToRemove);
            currentQ.marks -= reduction;
            remainingToRemove -= reduction;
          } else if (sec.questions.length > 1 && remainingToRemove >= 1) {
            sec.questions.splice(q, 1);
            remainingToRemove -= 1;
          }
        }
      }
    } else {
      let remainingToAdd = Math.abs(marksBalance);
      for (let s = updatedSections.length - 1; s >= 0 && remainingToAdd > 0; s--) {
        const sec = updatedSections[s];
        if (sec.questions.length > 0) {
          const lastQ = sec.questions[sec.questions.length - 1];
          lastQ.marks += remainingToAdd;
          remainingToAdd = 0;
        }
      }
    }

    setPaper({ ...paper, sections: updatedSections });
  };

  // Keyboard Shortcuts: Ctrl+Enter (Generate), Ctrl+P (Print)
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleAutoGenerate();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setActiveTab('preview');
        setTimeout(() => window.print(), 200);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleAutoGenerate]);

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
    setActiveTab('preview');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="printable-modal fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200 print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-stone-200 w-full max-w-5xl my-0 sm:my-auto h-full sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:h-auto print:shadow-none print:border-none print:max-w-none print:rounded-none print:p-0 print:m-0 print:overflow-visible">
        
        {/* Modal Header */}
        <div className="no-print px-4 sm:px-5 py-3.5 sm:py-4 border-b border-orange-200 bg-gradient-to-r from-orange-900 via-amber-900 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-inner shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg font-black text-white tracking-wide truncate">
                  स्मार्ट प्रश्न पत्र निर्माता
                </h2>
                <span className="hidden xs:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-yellow-300 border border-yellow-400/30 shrink-0">
                  पाठ्यक्रम आधारित
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-orange-200/90 truncate">
                मासिक इकाई मूल्यांकन एवं परीक्षा हेतु १-क्लिक संतुलित प्रश्न पत्र
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSavedModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white text-xs font-bold transition cursor-pointer border border-white/10"
              title="सहेजे गए प्रश्न पत्र देखें"
            >
              <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
              <span className="hidden sm:inline">सहेजे गए</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-[10px] font-mono">
                {savedPapers.length}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition cursor-pointer"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Quick Status Bar & Settings Toggle (sm:hidden) */}
        <div className="no-print sm:hidden px-3.5 py-2 bg-amber-100/90 border-b border-orange-200 flex items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-black text-orange-950 truncate text-[11px]">
              {classLevel} • {subject.split(' ')[0]} • {targetMarks} अंक
            </span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black shrink-0 ${
              marksBalance === 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-950'
            }`}>
              {marksBalance === 0 ? '✓ संतुलित' : `${marksBalance > 0 ? `+${marksBalance}` : marksBalance} अंक`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowMobileConfig(!showMobileConfig)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition ${
                showMobileConfig
                  ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
                  : 'bg-white border-amber-300 text-amber-950'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{showMobileConfig ? 'छुपाएं' : 'सेटिंग्स'}</span>
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleAutoGenerate}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-[11px] flex items-center gap-1 shadow-xs disabled:opacity-60"
              title="नया प्रश्न पत्र बनाएं"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isGenerating ? '...' : 'बनाएं'}</span>
            </button>
          </div>
        </div>

        {/* Simple & Clean Configuration Panel (Collapsible on Mobile, always open on sm+) */}
        <div className={`no-print ${showMobileConfig ? 'block' : 'hidden'} sm:block p-3 sm:p-4 bg-amber-50/70 border-b border-orange-200 space-y-3 shrink-0 animate-in fade-in duration-150`}>
          {/* Row 1: Key Selectors (Class, Subject, Exam Type, Target Marks) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            {/* Class */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                कक्षा (Class)
              </label>
              <select
                value={classLevel}
                onChange={e => handleClassChange(e.target.value)}
                className="w-full h-10 px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs sm:text-sm"
              >
                {CLASS_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                विषय (Subject)
              </label>
              <select
                value={subject}
                onChange={e => handleSubjectChange(e.target.value)}
                className="w-full h-10 px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs sm:text-sm"
              >
                {SUBJECT_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                परीक्षा प्रकार
              </label>
              <select
                value={examType}
                onChange={e => handleExamTypeChange(e.target.value as ExamPaperType)}
                className="w-full h-10 px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs sm:text-sm"
              >
                <option value="unit-test">📅 मासिक इकाई मूल्यांकन</option>
                <option value="traimasik">📋 त्रैमासिक परीक्षा</option>
                <option value="ardhavarshik">🏛️ सत्रीय / अभ्यास परीक्षा</option>
              </select>
            </div>

            {/* Target Marks */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                पूर्णांक (Marks)
              </label>
              <select
                value={targetMarks}
                onChange={e => setTargetMarks(Number(e.target.value))}
                className="w-full h-10 px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-xs sm:text-sm"
              >
                <option value={15}>15 अंक (कक्षा 1-3)</option>
                <option value={20}>20 अंक (मासिक)</option>
                <option value={25}>25 अंक (मासिक)</option>
                <option value={30}>30 अंक (त्रैमासिक)</option>
                <option value={40}>40 अंक</option>
                <option value={50}>50 अंक (त्रैमासिक)</option>
                <option value={80}>80 अंक (सत्रीय)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Syllabus / Chapters with Big Clear Voice Button */}
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">
              पाठ्यक्रम प्रगति / अध्याय (Syllabus)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={chapters}
                onChange={e => setChapters(e.target.value)}
                placeholder="उदा. अध्याय १ एवं २: संख्या पद्धति व संक्रियाएं..."
                className={`flex-1 h-10 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl border ${
                  isListening && activeVoiceTarget?.type === 'chapters'
                    ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20'
                    : 'border-stone-300 bg-white'
                } focus:outline-hidden focus:border-orange-500 shadow-2xs`}
              />
              <button
                type="button"
                onClick={() => handleVoiceInput({ type: 'chapters' })}
                className={`h-10 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs ${
                  isListening && activeVoiceTarget?.type === 'chapters'
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                }`}
                title="बोलकर अध्याय का नाम लिखें"
              >
                <Mic className="w-4 h-4" />
                <span>
                  {isListening && activeVoiceTarget?.type === 'chapters' ? 'सुन रहे हैं...' : 'बोलकर लिखें'}
                </span>
              </button>
            </div>
          </div>

          {/* Row 3: Generation & Balance Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-orange-200/60">
            {/* Live Marks Balance Status */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border shadow-2xs ${
                  marksBalance === 0
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : marksBalance < 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-red-100 text-red-900 border-red-300'
                }`}
              >
                {marksBalance === 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>पूर्ण संतुलित ({currentTotalMarks} / {targetMarks} अंक)</span>
                  </>
                ) : marksBalance < 0 ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{Math.abs(marksBalance)} अंक कम ({currentTotalMarks}/{targetMarks})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                    <span>{marksBalance} अंक अधिक ({currentTotalMarks}/{targetMarks})</span>
                  </>
                )}
              </div>

              {marksBalance !== 0 && (
                <button
                  type="button"
                  onClick={handleAutoFixBalance}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  title="अंकों को स्वतः लक्ष्य के अनुसार संतुलित करें"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ संतुलित करें</span>
                </button>
              )}
            </div>

            {/* Main 1-Click Generate Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleAutoGenerate}
              className="h-10 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs sm:text-sm font-black shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
              title="चयनित सेटिंग्स के आधार पर नया संतुलित प्रश्न पत्र तैयार करें"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>तैयार हो रहा है...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>✨ नया प्रश्न पत्र बनाएं</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Switcher & Toolbar: Editor vs A4 Preview */}
        <div className="no-print px-2.5 sm:px-5 py-2 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>संपादक (Edit)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-orange-700 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-orange-50'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>A4 पूर्वावलोकन</span>
              </button>
            </div>

            {/* Quick Tools depending on active tab */}
            {activeTab === 'editor' ? (
              <button
                type="button"
                onClick={() => setShowSymbols(!showSymbols)}
                className={`h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer flex items-center gap-1 sm:gap-1.5 border shadow-2xs ${
                  showSymbols
                    ? 'bg-amber-100 text-amber-950 border-amber-400 ring-1 ring-amber-300'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
                title="गणित व संस्कृत विशेष चिन्ह पैलेट खोलें"
              >
                <span>📐 चिन्ह पैलेट</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                {/* Print Density Toggle */}
                <div className="flex items-center p-0.5 bg-white rounded-lg border border-stone-200 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPrintDensity('compact')}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                      printDensity === 'compact'
                        ? 'bg-orange-100 text-orange-950 font-black'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                    title="1 पृष्ठ में व्यवस्थित करें (Compact Fit)"
                  >
                    ⚡ 1-पृष्ठ फिट
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintDensity('normal')}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                      printDensity === 'normal'
                        ? 'bg-stone-800 text-white'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                    title="सामान्य अंतर (Normal Spacing)"
                  >
                    सामान्य
                  </button>
                </div>

                {/* Answer Key / Student Paper Toggle */}
                <div className="flex items-center p-0.5 bg-white rounded-lg border border-stone-200 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setShowAnswerKey(false)}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                      !showAnswerKey
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                    title="छात्रों के लिए प्रश्न पत्र (बिना उत्तर)"
                  >
                    छात्र पत्र
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAnswerKey(true)}
                    className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition cursor-pointer ${
                      showAnswerKey
                        ? 'bg-emerald-700 text-white font-black'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                    title="शिक्षकों हेतु उत्तर कुंजी व अंक विभाजन सहित"
                  >
                    🔑 उत्तर कुंजी
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handleSaveToDevice}
              className="h-7 sm:h-9 px-2 sm:px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] sm:text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
              title="वर्तमान प्रश्न पत्र को सहेजें"
            >
              <Save className="w-3.5 h-3.5" />
              <span>सहेजें</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="h-7 sm:h-9 px-2.5 sm:px-3.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-[11px] sm:text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1 sm:gap-1.5"
              title="A4 प्रिंट करें अथवा PDF के रूप में सहेजें"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 प्रिंट</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Editor vs Preview */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-6 bg-stone-50 print:p-0 print:bg-white print:overflow-visible">
          {(paper.generationSource === 'gemini' || paper.generationSource === 'baudhik') && !paper.generationWarning && (
            <div className="no-print max-w-4xl mx-auto mb-4 p-2.5 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-950 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="font-bold">बौद्धिक ब्लूप्रिंट अनुसार नवीन संतुलित प्रश्न पत्र तैयार है</span>
              </div>
              <span className="text-[10px] bg-orange-200/60 text-orange-900 px-2 py-0.5 rounded-full font-bold">
                बौद्धिक ब्लूप्रिंट
              </span>
            </div>
          )}

          {activeTab === 'editor' ? (
            /* TAB 1: QUESTION EDITOR */
            <div className="no-print space-y-4 max-w-4xl mx-auto">
              {/* Quick Symbol Palette for Math & Sanskrit */}
              {showSymbols && (
                <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>📐 गणित व संस्कृत विशेष चिन्ह (क्लिक कर प्रविष्ट करें)</span>
                    </span>
                    <span className="text-[10px] text-amber-800 font-medium">
                      {focusedQuestionTarget
                        ? `सक्रिय: प्र.${focusedQuestionTarget.qIndex + 1} (खण्ड ${focusedQuestionTarget.secIndex + 1})`
                        : 'क्लिक करने पर क्लिपबोर्ड में कॉपी होगा'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-stone-600 mr-1">गणित:</span>
                      {MATH_SYMBOLS.map(sym => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => handleInsertSymbol(sym)}
                          className="w-7 h-7 rounded bg-white hover:bg-orange-100 border border-amber-300 font-mono font-bold text-stone-900 text-xs flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                          title={`चिन्ह प्रविष्ट करें: ${sym}`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-bold text-stone-600 mr-1">संस्कृत / हिंदी:</span>
                      {SANSKRIT_SYMBOLS.map(sym => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => handleInsertSymbol(sym)}
                          className="w-7 h-7 rounded bg-white hover:bg-orange-100 border border-amber-300 font-bold text-stone-900 text-xs flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                          title={`चिन्ह प्रविष्ट करें: ${sym}`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

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
                        onClick={() => {
                          const newQIndex = section.questions.length;
                          handleAddQuestion(secIndex);
                          setTimeout(() => {
                            handleVoiceInput({ type: 'question', secIndex, qIndex: newQIndex });
                          }, 150);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold border border-amber-300 cursor-pointer transition shadow-2xs"
                        title="नया प्रश्न जोड़ें और बोलकर डिक्टेट करें"
                      >
                        <Mic className="w-3.5 h-3.5 text-amber-800" />
                        <span>बोलकर जोड़ें</span>
                      </button>
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
                          {/* Reordering & Index */}
                          <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={qIndex === 0}
                              onClick={() => handleMoveQuestion(secIndex, qIndex, 'up')}
                              className="w-5 h-4 flex items-center justify-center rounded text-stone-400 hover:text-stone-800 hover:bg-stone-200 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition"
                              title="प्रश्न ऊपर ले जाएं"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 h-5 rounded bg-stone-200 text-stone-800 text-xs font-black flex items-center justify-center">
                              {qIndex + 1}
                            </span>
                            <button
                              type="button"
                              disabled={qIndex === section.questions.length - 1}
                              onClick={() => handleMoveQuestion(secIndex, qIndex, 'down')}
                              className="w-5 h-4 flex items-center justify-center rounded text-stone-400 hover:text-stone-800 hover:bg-stone-200 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition"
                              title="प्रश्न नीचे ले जाएं"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex-1">
                            <div className="relative">
                              <textarea
                                rows={2}
                                value={q.text}
                                onFocus={() => setFocusedQuestionTarget({ secIndex, qIndex })}
                                onChange={e => handleQuestionTextChange(secIndex, qIndex, e.target.value)}
                                placeholder="प्रश्न यहाँ लिखें अथवा माइक दबाकर बोलें..."
                                className={`w-full p-2 pr-9 text-xs font-medium text-stone-900 bg-white border rounded-lg focus:outline-hidden focus:border-orange-400 shadow-2xs resize-y ${
                                  isListening &&
                                  activeVoiceTarget?.type === 'question' &&
                                  activeVoiceTarget.secIndex === secIndex &&
                                  activeVoiceTarget.qIndex === qIndex
                                    ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20'
                                    : 'border-stone-200'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => handleVoiceInput({ type: 'question', secIndex, qIndex })}
                                className={`absolute top-2 right-2 p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                                  isListening &&
                                  activeVoiceTarget?.type === 'question' &&
                                  activeVoiceTarget.secIndex === secIndex &&
                                  activeVoiceTarget.qIndex === qIndex
                                    ? 'bg-red-600 text-white animate-pulse shadow-xs'
                                    : 'text-stone-400 hover:text-orange-700 hover:bg-orange-50'
                                }`}
                                title="बोलकर प्रश्न लिखें"
                              >
                                <Mic className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Internal Choice if exists */}
                            {q.internalChoiceText !== undefined && (
                              <div className="mt-1.5 pl-3 border-l-2 border-orange-300">
                                <span className="text-[10px] font-bold text-orange-800 uppercase block mb-1">
                                  आंतरिक विकल्प (अथवा):
                                </span>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={q.internalChoiceText}
                                    onChange={e => {
                                      const updatedSections = [...paper.sections];
                                      updatedSections[secIndex].questions[qIndex].internalChoiceText = e.target.value;
                                      setPaper({ ...paper, sections: updatedSections });
                                    }}
                                    placeholder="अथवा वैकल्पिक प्रश्न पाठ..."
                                    className={`w-full p-1.5 pr-8 text-xs text-stone-700 bg-white border rounded-md focus:outline-hidden ${
                                      isListening &&
                                      activeVoiceTarget?.type === 'choice' &&
                                      activeVoiceTarget.secIndex === secIndex &&
                                      activeVoiceTarget.qIndex === qIndex
                                        ? 'border-red-500 ring-2 ring-red-200 bg-red-50/20'
                                        : 'border-stone-200'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleVoiceInput({ type: 'choice', secIndex, qIndex })}
                                    className={`absolute top-1 right-1 p-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                                      isListening &&
                                      activeVoiceTarget?.type === 'choice' &&
                                      activeVoiceTarget.secIndex === secIndex &&
                                      activeVoiceTarget.qIndex === qIndex
                                        ? 'bg-red-600 text-white animate-pulse'
                                        : 'text-stone-400 hover:text-orange-700 hover:bg-orange-50'
                                    }`}
                                    title="बोलकर अथवा विकल्प लिखें"
                                  >
                                    <Mic className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* MCQ Options Display & Dictation */}
                            {q.type === 'mcq' && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mt-2">
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={opt.id || optIdx}
                                    className="flex items-center gap-1 p-1 bg-white border border-stone-200 rounded-lg text-xs shadow-2xs"
                                  >
                                    <span className="font-bold text-stone-500 shrink-0 px-1">
                                      ({String.fromCharCode(97 + optIdx)})
                                    </span>
                                    <input
                                      type="text"
                                      value={opt.text}
                                      onChange={e => {
                                        const updatedSections = [...paper.sections];
                                        if (updatedSections[secIndex]?.questions[qIndex]?.options?.[optIdx]) {
                                          updatedSections[secIndex].questions[qIndex].options![optIdx].text = e.target.value;
                                          setPaper({ ...paper, sections: updatedSections });
                                        }
                                      }}
                                      placeholder={`विकल्प (${String.fromCharCode(97 + optIdx)})`}
                                      className="flex-1 min-w-0 bg-transparent text-xs text-stone-800 border-none focus:outline-hidden"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleVoiceInput({ type: 'mcq-opt', secIndex, qIndex, optIndex: optIdx })}
                                      className={`p-1 rounded-md transition cursor-pointer shrink-0 ${
                                        isListening &&
                                        activeVoiceTarget?.type === 'mcq-opt' &&
                                        activeVoiceTarget.secIndex === secIndex &&
                                        activeVoiceTarget.qIndex === qIndex &&
                                        activeVoiceTarget.optIndex === optIdx
                                          ? 'bg-red-600 text-white animate-pulse'
                                          : 'text-stone-400 hover:text-orange-700 hover:bg-orange-50'
                                      }`}
                                      title={`बोलकर विकल्प (${String.fromCharCode(97 + optIdx)}) लिखें`}
                                    >
                                      <Mic className="w-3 h-3" />
                                    </button>
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
            <div className="overflow-x-auto pb-4 print:p-0 print:overflow-visible">
              <div
                className={`bg-white w-full max-w-full sm:max-w-[210mm] mx-auto rounded-xl shadow-lg border border-stone-200 text-stone-900 font-sans print:p-0 print:shadow-none print:border-none print:max-w-none ${
                  printDensity === 'compact' ? 'p-2.5 sm:p-5 text-[11px]' : 'p-3 sm:p-8 md:p-12 text-xs'
                }`}
              >
                {/* Exam Header */}
                <div className={`text-center border-b-2 border-stone-900 ${printDensity === 'compact' ? 'pb-1.5 mb-1.5' : 'pb-3 mb-3'}`}>
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

                  <div className="mt-2 inline-flex flex-col items-center gap-1">
                    <div className="inline-block px-4 py-0.5 rounded-full bg-stone-100 border border-stone-400 text-xs font-black text-stone-900 uppercase tracking-wider">
                      {paper.title}
                    </div>
                    {showAnswerKey && (
                      <div className="inline-block px-3 py-0.5 bg-emerald-700 text-white rounded-md text-[10px] font-black tracking-wider uppercase shadow-2xs">
                        🔑 शिक्षक उत्तर कुंजी व अंक विभाजन दर्शिका (TEACHER ANSWER KEY & MARKING GUIDE)
                      </div>
                    )}
                  </div>
                </div>

                {/* Student & Exam Details Bar */}
                <div
                  className={`grid grid-cols-2 sm:grid-cols-4 gap-2 font-bold border-b border-stone-300 bg-stone-50/50 rounded-lg ${
                    printDensity === 'compact' ? 'pb-1.5 mb-1.5 p-1 text-[10px]' : 'pb-2.5 mb-3 p-2 text-xs'
                  }`}
                >
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
                <div
                  className={`flex items-center justify-between border border-dashed border-stone-400 rounded-lg bg-amber-50/20 ${
                    printDensity === 'compact' ? 'p-1.5 mb-2 text-[10px]' : 'p-2 mb-4 text-xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-700">छात्र का नाम:</span>
                    <span className="w-36 sm:w-48 border-b border-stone-400 inline-block"></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-700">अनुक्रमांक (Roll No):</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                          key={i}
                          className="w-4 sm:w-5 h-5 sm:h-6 border border-stone-800 rounded-xs flex items-center justify-center text-xs font-mono font-bold bg-white"
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* General Instructions */}
                <div
                  className={`text-stone-700 bg-stone-50 rounded-lg border border-stone-200 ${
                    printDensity === 'compact' ? 'mb-2 p-1.5 text-[9.5px]' : 'mb-4 p-2.5 text-[11px]'
                  }`}
                >
                  <p className="font-bold text-stone-900 mb-0.5 uppercase tracking-wider">सामान्य निर्देश (General Instructions):</p>
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
                <div className={printDensity === 'compact' ? 'space-y-2.5' : 'space-y-5'}>
                  {paper.sections.map((section, secIdx) => (
                    <div key={section.id || secIdx} className={printDensity === 'compact' ? 'space-y-1.5' : 'space-y-3'}>
                      <div className="border-b border-stone-800 pb-0.5 flex justify-between items-center">
                        <h2 className="text-xs font-black uppercase tracking-wider text-stone-950">
                          {section.title}
                        </h2>
                        <span className="text-[11px] font-bold text-stone-600">
                          [{section.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0)} अंक]
                        </span>
                      </div>

                      <div className={`text-stone-900 leading-relaxed ${printDensity === 'compact' ? 'space-y-1.5 text-[11px]' : 'space-y-2.5 text-xs'}`}>
                        {section.questions.map((q, qIdx) => (
                          <div key={q.id || qIdx} className="space-y-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <span className="font-bold mr-1.5">प्र.{qIdx + 1}.</span>
                                <span>{q.text}</span>

                                {/* Teacher Answer Key Guide */}
                                {showAnswerKey && (
                                  <div className="mt-1 pl-3 py-0.5 bg-emerald-50/70 border-l-2 border-emerald-600 text-[10px] text-emerald-950 rounded-r">
                                    <span className="font-bold text-emerald-900">उत्तर संकेत / अंक विभाजन: </span>
                                    <span className="italic">
                                      {q.type === 'mcq' && q.options && q.options.length > 0
                                        ? `सही उत्तर विकल्प: (${String.fromCharCode(97)}) ${q.options[0].text} (पूर्ण: ${q.marks} अंक)`
                                        : `मुख्य बिंदु / सूत्र / परिभाषा। (पूर्ण उत्तर: ${q.marks} अंक, आंशिक: ${Math.max(1, Math.floor(q.marks / 2))} अंक)`}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="font-bold text-stone-800 shrink-0">
                                [{q.marks}]
                              </span>
                            </div>

                            {/* MCQ Options in Grid */}
                            {q.type === 'mcq' && q.options && (
                              <div
                                className={`grid grid-cols-2 sm:grid-cols-4 ${
                                  printDensity === 'compact' ? 'gap-1 pl-4 mt-0.5 text-[10px]' : 'gap-2 pl-6 mt-1 text-[11px]'
                                }`}
                              >
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
                              <div className="pl-6 pt-0.5 text-stone-700 italic">
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
                <div className={`border-t border-stone-300 flex justify-between items-center text-[10px] text-stone-500 ${
                  printDensity === 'compact' ? 'mt-4 pt-2' : 'mt-8 pt-4'
                }`}>
                  <span>सरस्वती शिशु मंदिर परीक्षा विभाग</span>
                  <span className="italic">॥ राष्ट्राय स्वाहा, इदं न मम ॥</span>
                  <span>पृष्ठ १ का १</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-stone-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-stone-600 flex items-center gap-2">
            <span>कुल प्रश्न: <strong className="text-stone-900">{paper.sections.reduce((acc, s) => acc + s.questions.length, 0)}</strong></span>
            <span>|</span>
            <span>कुल अंक: <strong className="text-orange-900">{currentTotalMarks} / {targetMarks}</strong></span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1.5 rounded-xl border border-stone-200">
              ⚡ <kbd className="font-mono bg-white px-1 rounded text-stone-700 font-bold border border-stone-300">Ctrl+Enter</kbd> जनरेट | <kbd className="font-mono bg-white px-1 rounded text-stone-700 font-bold border border-stone-300">Ctrl+P</kbd> प्रिंट
            </span>

            <button
              type="button"
              onClick={() => handleVoiceInput({ type: 'voice-command' })}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                isListening && activeVoiceTarget?.type === 'voice-command'
                  ? 'bg-red-600 text-white animate-pulse border-red-700'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
              }`}
              title="बोलकर 'सहेजें' या 'प्रिंट' कहें (Voice Command Save)"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isListening && activeVoiceTarget?.type === 'voice-command' ? 'बोलें "सहेजें"...' : 'बोलकर सहेजें'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToDevice}
              className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              title="वर्तमान प्रश्न पत्र को डिवाइस मेमोरी में सहेजें"
            >
              <Save className="w-3.5 h-3.5" />
              <span>सहेजें</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
            >
              बंद करें
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              title="A4 प्रिंट करें अथवा PDF के रूप में सहेजें"
            >
              <Printer className="w-4 h-4" />
              <span>A4 प्रिंट / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Saved Papers Modal / Drawer */}
      {showSavedModal && (
        <div className="no-print fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  सहेजे गए प्रश्न पत्र (Saved Question Papers)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-amber-400/20 text-amber-300">
                  {savedPapers.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-stone-50">
              {savedPapers.length === 0 ? (
                <div className="text-center py-10 text-stone-500">
                  <FolderOpen className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                  <p className="text-sm font-bold text-stone-600">कोई सहेजा गया प्रश्न पत्र नहीं मिला</p>
                  <p className="text-xs text-stone-400 mt-1">
                    प्रश्न पत्र तैयार करने के बाद "सहेजें" अथवा "बोलकर सहेजें" बटन द्वारा यहाँ सुरक्षित रख सकते हैं।
                  </p>
                </div>
              ) : (
                savedPapers.map(saved => (
                  <div
                    key={saved.id}
                    onClick={() => handleLoadSavedPaper(saved)}
                    className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-orange-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-100 text-orange-900">
                          {saved.classLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700">
                          {saved.subject}
                        </span>
                        <span className="text-[11px] font-bold text-stone-500">
                          {saved.totalMarks} अंक
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-orange-900 truncate">
                        {saved.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {saved.chapters || 'पाठ्यक्रम आधारित'} • {saved.sections.reduce((acc, s) => acc + s.questions.length, 0)} प्रश्न
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSavedPaper(saved);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition cursor-pointer"
                        title="पेपर खोलें"
                      >
                        खोलें
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSavedPaper(saved);
                          setTimeout(() => {
                            setActiveTab('preview');
                            handlePrint();
                          }, 200);
                        }}
                        className="p-1.5 text-stone-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                        title="A4 प्रिंट / PDF"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedPaper(saved.id, e)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-3 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="px-4 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200 text-xs font-bold transition cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};


