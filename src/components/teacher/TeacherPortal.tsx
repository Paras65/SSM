import React, { useState, useEffect, useCallback } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { Homework, Staff, Exam, Timetable, LeaveRequest } from '../../types';
import { SSM_CLASSES } from '../../types';
import { StaffSalarySlipModal } from '../admin/StaffSalarySlipModal';
import { exportAttendanceToCSV } from '../../utils/csvExport';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  BookOpen,
  ClipboardList,
  Clock,
  LogOut,
  Plus,
  Send,
  UserCheck,
  CheckSquare,
  FileSpreadsheet,
  Award,
  Search,
  Share2,
  AlertTriangle,
  CheckCheck,
  XCircle,
  Sun,
  Lightbulb,
  Edit2,
  Crown,
  Lock,
  KeyRound,
  FileText,
  X,
  Sparkles,
  Mic,
  Loader2
} from 'lucide-react';
import { QuestionPaperModal } from '../exam/QuestionPaperModal';

type TeacherTab = 'attendance' | 'homework' | 'marks' | 'timetable' | 'leaves' | 'salary';

export const TeacherPortal: React.FC = () => {
  const { currentSchool, setViewMode, students, setStudentAttendance, bulkSetAttendance, getAttendanceForDate, attendanceRecords, reportCards, refreshFromDb } = useSchool();
  const { showSuccess, showError, showWarning } = useToast();
  const [currentTab, setCurrentTab] = useState<TeacherTab>(() => {
    try {
      const saved = sessionStorage.getItem('ssm_teacher_tab');
      const validTabs: TeacherTab[] = ['attendance', 'homework', 'marks', 'timetable', 'leaves', 'salary'];
      if (saved && validTabs.includes(saved as TeacherTab)) return saved as TeacherTab;
    } catch {}
    return 'attendance';
  });
  const teacherId = sessionStorage.getItem('ssm_teacher_id') || '';
  const teacherName = sessionStorage.getItem('ssm_teacher_name') || 'आचार्य जी';

  const [teacherProfile, setTeacherProfile] = useState<Staff | null>(null);
  const [showSalarySlip, setShowSalarySlip] = useState(false);
  const [showQuestionPaperModal, setShowQuestionPaperModal] = useState(false);

  // Class Selection for Attendance & Homework
  const CLASSES = SSM_CLASSES;
  const [selectedClass, setSelectedClass] = useState('Class 8');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [showTips, setShowTips] = useState(true);

  // Quick subject chips
  const QUICK_SUBJECTS = ['गणित', 'हिन्दी', 'विज्ञान', 'अंग्रेज़ी', 'संस्कृत', 'सामाजिक विज्ञान', 'कम्प्यूटर'];

  // Homework state
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [showAddHw, setShowAddHw] = useState(false);
  const [editingHw, setEditingHw] = useState<Homework | null>(null);
  const [hwSubject, setHwSubject] = useState('गणित');
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDueDate, setHwDueDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [smartHwTopic, setSmartHwTopic] = useState('');
  const [isDraftingHw, setIsDraftingHw] = useState(false);
  const [isListeningHw, setIsListeningHw] = useState(false);

  // Exam Marks Entry state
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examSubject, setExamSubject] = useState('गणित');
  const [marksState, setMarksState] = useState<Record<string, number>>({});
  const [absentStudents, setAbsentStudents] = useState<Record<string, boolean>>({});
  const [marksSearch, setMarksSearch] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksSaveSuccess, setMarksSaveSuccess] = useState(false);
  const [isSavingMarks, setIsSavingMarks] = useState(false);
  const selectedExam = exams.find(e => e.id === selectedExamId);

  // Timetable & Leaves state
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // PIN Change State
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError('');

    if (!currentPinInput.trim() || !newPinInput.trim()) {
      setPinChangeError('वर्तमान और नया पिन दर्ज करना अनिवार्य है।');
      return;
    }
    if (newPinInput.trim().length < 4 || newPinInput.trim().length > 6) {
      setPinChangeError('नया पिन 4 से 6 अंकों का होना चाहिए।');
      return;
    }
    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinChangeError('नया पिन और पुष्टि पिन मेल नहीं खाते हैं।');
      return;
    }

    setIsChangingPin(true);
    try {
      await api.updateTeacherPin(currentPinInput.trim(), newPinInput.trim());
      showSuccess('सुरक्षा पिन सफलतापूर्वक बदल दिया गया है!');
      setShowChangePinModal(false);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } catch (err: any) {
      setPinChangeError(err.message || 'पिन बदलने में विफलता!');
    } finally {
      setIsChangingPin(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showQuestionPaperModal) {
          e.preventDefault();
          setShowQuestionPaperModal(false);
        } else if (showSalarySlip) {
          e.preventDefault();
          setShowSalarySlip(false);
        } else if (showAddHw) {
          e.preventDefault();
          setShowAddHw(false);
          setEditingHw(null);
        } else if (currentTab !== 'attendance') {
          e.preventDefault();
          setCurrentTab('attendance');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQuestionPaperModal, showSalarySlip, showAddHw, currentTab]);

  useEffect(() => {
    const handlePopState = () => {
      if (showQuestionPaperModal) {
        setShowQuestionPaperModal(false);
      } else if (showSalarySlip) {
        setShowSalarySlip(false);
      } else if (showAddHw) {
        setShowAddHw(false);
      } else if (currentTab !== 'attendance') {
        setCurrentTab('attendance');
      } else {
        setViewMode('public');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showQuestionPaperModal, showSalarySlip, showAddHw, currentTab, setViewMode]);

  const fetchTeacherCommonData = useCallback(async () => {
    try {
      const [teacherMe, examData, leaveData] = await Promise.all([
        api.getTeacherMe().catch(() => null),
        api.getExams(currentSchool.id).catch(() => []),
        api.getLeaves(currentSchool.id, 'staff', teacherId).catch(() => [])
      ]);

      if (teacherMe) setTeacherProfile(teacherMe);
      setExams(examData);
      if (examData.length > 0) {
        setSelectedExamId(prev => prev || examData[0].id);
      }
      setLeaves(leaveData);
    } catch (err) {
      console.error('Error loading teacher common data:', err);
    }
  }, [currentSchool.id, teacherId]);

  const fetchClassData = useCallback(async () => {
    try {
      const [hwData, ttData] = await Promise.all([
        api.getHomework(currentSchool.id, selectedClass).catch(() => []),
        api.getTimetable(currentSchool.id, selectedClass).catch(() => [])
      ]);
      setHomeworkList(hwData);
      setTimetables(ttData);
    } catch (err) {
      console.error('Error loading class data:', err);
    }
  }, [currentSchool.id, selectedClass]);

  useEffect(() => {
    fetchTeacherCommonData();
  }, [fetchTeacherCommonData]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  // Persist active tab so it survives page reload
  useEffect(() => {
    try { sessionStorage.setItem('ssm_teacher_tab', currentTab); } catch {}
  }, [currentTab]);

  const handleLogout = () => {
    api.logoutTeacher();
    setViewMode('public');
  };

  const handleShareHwWhatsApp = (hw: Homework) => {
    const text = `📚 *${currentSchool.hindiName || currentSchool.name}*\n` +
      `📝 *दैनिक गृहकार्य (Daily Homework)*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *कक्षा:* ${hw.class}\n` +
      `📖 *विषय:* ${hw.subject}\n` +
      `🎯 *शीर्षक:* ${hw.title}\n` +
      `📅 *अंतिम तिथि:* ${hw.dueDate}\n` +
      `✍️ *निर्देश:*\n${hw.description}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `_शिक्षक: ${hw.assignedBy}_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMarkAllAttendance = async (status: 'Present' | 'Absent') => {
    try {
      await bulkSetAttendance(selectedClass, attendanceDate, status);
      showSuccess(status === 'Present' ? `सभी ${filteredStudents.length} छात्र उपस्थित अंकित किए गए!` : `सभी छात्र अनुपस्थित अंकित किए गए!`);
    } catch (err: any) {
      showError(err.message || 'उपस्थिति दर्ज करने में त्रुटि आई।');
    }
  };

  const getStudentOverallAttendancePct = (studentId: string): number | null => {
    const recs = attendanceRecords.filter(r => r.studentId === studentId);
    if (recs.length < 3) return null;
    const present = recs.filter(r => r.status === 'Present').length;
    return Math.round((present / recs.length) * 100);
  };

  const handleStartEditHw = (hw: Homework) => {
    setEditingHw(hw);
    setHwSubject(hw.subject);
    setHwTitle(hw.title);
    setHwDesc(hw.description);
    setHwDueDate(hw.dueDate);
    setShowAddHw(true);
  };

  const startVoiceForHw = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('ब्राउज़र में आवाज़ पहचान (Voice Input) समर्थित नहीं है।');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      setIsListeningHw(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSmartHwTopic(transcript);
        setIsListeningHw(false);
        handleDraftSmartHomework(transcript);
      };
      recognition.onerror = () => setIsListeningHw(false);
      recognition.onend = () => setIsListeningHw(false);
      recognition.start();
    } catch {
      setIsListeningHw(false);
    }
  };

  const handleDraftSmartHomework = async (overrideTopic?: string) => {
    const topic = (overrideTopic || smartHwTopic || hwTitle || hwSubject).trim();
    setIsDraftingHw(true);

    const effectiveKey =
      (import.meta.env.VITE_SMART_API_KEY as string) ||
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      localStorage.getItem('ssm_smart_api_key') ||
      localStorage.getItem('ssm_gemini_api_key') ||
      '';

    const fallbackHomework = (t: string, subj: string) => {
      if (subj.includes('गणित')) {
        return {
          title: `${t || 'अध्याय अभ्यास'} - सूत्र एवं प्रश्न हल`,
          description: `1. स्वाध्याय निर्देश: पाठ्यपुस्तक के संबंधित अध्याय के सूत्र एवं उदाहरण पृष्ठ सं. 35-38 ध्यानपूर्वक समझें।\n2. अभ्यास प्रश्न:\n   क) सूत्र कंठस्थ करके 5 मूलभूत प्रश्न हल करें।\n   ख) अभ्यास प्रश्नावली के प्रश्न संख्या 1 से 4 फेयर कॉपी में हल करें।\n   ग) एक व्यावहारिक समस्या का उदाहरण लिखकर हल दर्शाएं।\n3. प्रस्तुतिकरण: कार्य स्वच्छ एवं क्रमबद्ध लिखकर कल प्रथम कालांश में प्रस्तुत करें।`
        };
      }
      if (subj.includes('विज्ञान')) {
        return {
          title: `${t || 'अध्याय स्वाध्याय'} - परिभाषा एवं चित्र निरूपण`,
          description: `1. स्वाध्याय निर्देश: आज पढ़ाए गए पाठ के मुख्य बिंदु व परिभाषाएं ध्यानपूर्वक स्मरण करें।\n2. अभ्यास प्रश्न:\n   क) मुख्य वैज्ञानिक शब्दावली के अर्थ व परिभाषा लिखिए।\n   ख) संबंधित नामांकित चित्र पेंसिल से स्पष्ट बनाइए।\n   ग) दैनिक जीवन में इसके 2 व्यावहारिक उपयोग या प्रभाव लिखिए।\n3. प्रस्तुतिकरण: गृहकार्य पुस्तिका में दिनांक सहित पूर्ण करें।`
        };
      }
      if (subj.includes('संस्कृत')) {
        return {
          title: `${t || 'पाठ स्वाध्याय'} - श्लोक एवं व्याकरण अभ्यास`,
          description: `1. स्वाध्याय निर्देश: पाठ के श्लोक/गद्यांश का सस्वर वाचन करें।\n2. अभ्यास प्रश्न:\n   क) दिए गए श्लोक का सप्रसंग हिन्दी अनुवाद लिखिए।\n   ख) पाठ में आए 5 कठिन शब्दों के अर्थ एवं संधि विच्छेद करें।\n   ग) व्याकरण अभ्यास के रिक्त स्थानों की पूर्ति करें।\n3. प्रस्तुतिकरण: कल प्रातः कक्षा में वाचन हेतु प्रस्तुत करें।`
        };
      }
      if (subj.includes('अंग्रेज़ी') || subj.includes('English')) {
        return {
          title: `${t || 'Chapter Practice'} - Vocabulary & Comprehension`,
          description: `1. Reading: Read the chapter carefully and underline new words.\n2. Practice Questions:\n   a) Write word meanings and make sentences for 5 new words.\n   b) Answer questions 1 to 3 from textbook exercise.\n   c) Write a short 5-sentence summary of today's lesson.\n3. Submission: Complete in homework notebook neatly.`
        };
      }
      return {
        title: `${t || 'दैनिक स्वाध्याय'} - मुख्य बिंदु एवं अभ्यास प्रश्न`,
        description: `1. स्वाध्याय निर्देश: आज पढ़ाए गए विषय के पृष्ठ ध्यानपूर्वक पढ़ें एवं स्मरण करें।\n2. अभ्यास प्रश्न:\n   क) पाठ के 3 महत्वपूर्ण प्रश्नोत्तर फेयर कॉपी में लिखें।\n   ख) मुख्य अवधारणा को अपने शब्दों में संक्षेप में लिखें।\n   ग) कठिन शब्दों का अर्थ शब्दकोश से देखकर लिखें।\n3. प्रस्तुतिकरण: कल प्रथम कालांश में आचार्य जी के समक्ष प्रस्तुत करें।`
      };
    };

    if (!effectiveKey) {
      setTimeout(() => {
        const d = fallbackHomework(topic, hwSubject);
        setHwTitle(d.title);
        setHwDesc(d.description);
        setIsDraftingHw(false);
      }, 300);
      return;
    }

    try {
      const schoolHindi = currentSchool.hindiName || currentSchool.name;
      const prompt = `You are an expert teacher at ${schoolHindi} (Vidya Bharati school).
Subject: ${hwSubject}, Class: ${selectedClass}, Topic/Chapter: "${topic || hwSubject}".
Generate structured daily homework and practice questions in Hindi.
Output MUST be strictly valid JSON without markdown formatting:
{
  "title": "Concise Hindi homework title with chapter name",
  "description": "Clear step-by-step instructions in Hindi including:\\n1. स्वाध्याय निर्देश (Reading page numbers/concepts)\\n2. अभ्यास प्रश्न (3 graded practice questions)\\n3. प्रस्तुतिकरण निर्देश (Submission instructions)"
}`;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': effectiveKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 600,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Smart drafting API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Empty response');

      const parsed = JSON.parse(rawText);
      if (parsed.title) setHwTitle(parsed.title);
      if (parsed.description) setHwDesc(parsed.description);
    } catch {
      const d = fallbackHomework(topic, hwSubject);
      setHwTitle(d.title);
      setHwDesc(d.description);
    } finally {
      setIsDraftingHw(false);
    }
  };

  const handleSaveHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwDesc) return;
    try {
      if (editingHw) {
        const updated = await api.updateHomework(editingHw.id, {
          subject: hwSubject,
          title: hwTitle,
          description: hwDesc,
          dueDate: hwDueDate
        });
        setHomeworkList(prev => prev.map(h => h.id === editingHw.id ? updated : h));
        setEditingHw(null);
        setShowAddHw(false);
        setHwTitle('');
        setHwDesc('');
        showSuccess('गृहकार्य सफलतापूर्वक संशोधित किया गया!');
      } else {
        const newHw = await api.createHomework({
          schoolId: currentSchool.id,
          class: selectedClass,
          subject: hwSubject,
          title: hwTitle,
          description: hwDesc,
          assignedBy: teacherProfile ? `${teacherProfile.name} (${teacherProfile.gender === 'Acharya' ? 'आचार्य' : 'दीदी'})` : teacherName,
          dueDate: hwDueDate,
          date: new Date().toISOString().split('T')[0],
          status: 'Active'
        });
        setHomeworkList(prev => [newHw, ...prev]);
        setShowAddHw(false);
        setHwTitle('');
        setHwDesc('');
        showSuccess('नया गृहकार्य सफलतापूर्वक जोड़ा गया!');
      }
    } catch (err: any) {
      showError(err.message || 'गृहकार्य सहेजने में त्रुटि आई।');
    }
  };

  const handleBulkMarksSave = async () => {
    const selectedExam = exams.find(e => e.id === selectedExamId);
    if (!selectedExam) {
      showWarning('कृपया परीक्षा चुनें।');
      return;
    }
    if (selectedExam.isLocked) {
      showError('यह परीक्षा संकलित एवं लॉक (Freeze) है। अंक प्रविष्टि व संशोधन बंद है।');
      return;
    }
    setIsSavingMarks(true);
    setMarksSaveSuccess(false);

    try {
      const marksList = Object.entries(marksState).map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained: absentStudents[studentId] ? 0 : Number(marksObtained) || 0,
        maxMarks
      }));

      await api.submitBulkMarks({
        schoolId: currentSchool.id,
        examTerm: selectedExam.term,
        academicYear: selectedExam.academicYear,
        subject: examSubject,
        marksList
      });

      setMarksSaveSuccess(true);
      showSuccess('कक्षा के अंक सफलतापूर्वक सुरक्षित कर दिए गए!');
      await refreshFromDb();
      setTimeout(() => setMarksSaveSuccess(false), 3000);
    } catch (err: any) {
      showError(err.message || 'अंक सुरक्षित करने में त्रुटि।');
    } finally {
      setIsSavingMarks(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) return;
    try {
      const newLeave = await api.createLeave({
        schoolId: currentSchool.id,
        applicantType: 'staff',
        applicantId: teacherId || 'stf-unknown',
        applicantName: teacherProfile?.name || teacherName,
        classOrDesignation: teacherProfile?.designation || 'आचार्य',
        startDate: leaveStart,
        endDate: leaveEnd,
        reason: leaveReason
      });
      setLeaves(prev => [newLeave, ...prev]);
      setLeaveReason('');
      setLeaveSuccess(true);
      showSuccess('अवकाश आवेदन सफलतापूर्वक प्रेषित किया गया!');
      setTimeout(() => setLeaveSuccess(false), 3000);
    } catch (err: any) {
      showError(err.message || 'अवकाश आवेदन भेजने में त्रुटि आई।');
    }
  };

  const filteredStudents = students.filter(s => s.class === selectedClass);

  // Sync marksState and absentStudents from reportCards when class, exam, or subject changes
  useEffect(() => {
    const selectedExam = exams.find(e => e.id === selectedExamId);
    if (!selectedExam) return;

    const newMarks: Record<string, number> = {};
    const newAbsent: Record<string, boolean> = {};

    filteredStudents.forEach(stu => {
      const rc = reportCards.find(r =>
        r.studentId === stu.id &&
        (r.examTerm === selectedExam.term || !selectedExam.term) &&
        (r.academicYear === selectedExam.academicYear || !selectedExam.academicYear)
      );
      if (rc && Array.isArray(rc.marks)) {
        const subMark = rc.marks.find(m => m.subject.toLowerCase() === examSubject.toLowerCase());
        if (subMark) {
          newMarks[stu.id] = subMark.marksObtained;
          if (subMark.maxMarks) setMaxMarks(subMark.maxMarks);
        }
      }
    });

    setMarksState(newMarks);
    setAbsentStudents(newAbsent);
  }, [selectedClass, selectedExamId, examSubject, reportCards, exams, filteredStudents]);
  const activeAttendanceMap = getAttendanceForDate(attendanceDate);

  // Derived Attendance Stats & Filter
  const displayedAttendanceStudents = filteredStudents.filter(s => {
    if (!attendanceSearch.trim()) return true;
    const q = attendanceSearch.toLowerCase().trim();
    return (s.name && s.name.toLowerCase().includes(q)) ||
           (s.rollNo && s.rollNo.toString().toLowerCase().includes(q)) ||
           (s.fatherName && s.fatherName.toLowerCase().includes(q));
  });

  const totalAttendanceStudents = filteredStudents.length;
  const presentCount = filteredStudents.filter(s => (activeAttendanceMap[s.id] || 'Present') === 'Present').length;
  const absentCount = filteredStudents.filter(s => activeAttendanceMap[s.id] === 'Absent').length;
  const leaveCount = filteredStudents.filter(s => activeAttendanceMap[s.id] === 'Leave').length;
  const attendanceRate = totalAttendanceStudents > 0 ? Math.round((presentCount / totalAttendanceStudents) * 100) : 0;

  // Derived Marks Stats & Filter
  const displayedMarksStudents = filteredStudents.filter(s => {
    if (!marksSearch.trim()) return true;
    const q = marksSearch.toLowerCase().trim();
    return (s.name && s.name.toLowerCase().includes(q)) ||
           (s.rollNo && s.rollNo.toString().toLowerCase().includes(q));
  });

  const enteredMarksCount = filteredStudents.filter(s => marksState[s.id] !== undefined && !absentStudents[s.id]).length;
  const examAbsentCount = filteredStudents.filter(s => absentStudents[s.id]).length;
  const validMarks = filteredStudents
    .filter(s => marksState[s.id] !== undefined && !absentStudents[s.id])
    .map(s => marksState[s.id] || 0);
  const classAvgPct = validMarks.length > 0 && maxMarks > 0
    ? Math.round((validMarks.reduce((a, b) => a + b, 0) / (validMarks.length * maxMarks)) * 100)
    : 0;
  const highestClassMarks = validMarks.length > 0 ? Math.max(...validMarks) : 0;
  const passedStudentsCount = filteredStudents.filter(s => {
    if (absentStudents[s.id]) return false;
    const m = marksState[s.id];
    return m !== undefined && maxMarks > 0 && (m / maxMarks) >= 0.33;
  }).length;
  const failedStudentsCount = Math.max(0, enteredMarksCount - passedStudentsCount);

  // Timetable helper
  const DAYS_MAP: Record<string, string> = {
    Monday: 'सोमवार',
    Tuesday: 'मंगलवार',
    Wednesday: 'बुधवार',
    Thursday: 'गुरुवार',
    Friday: 'शुक्रवार',
    Saturday: 'शनिवार'
  };
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = DAY_NAMES[new Date().getDay()];
  const isSunday = currentDayName === 'Sunday';
  const classTimetable = timetables.find(t => t.class === selectedClass);
  const todaySchedule = classTimetable?.schedule?.find(s => s.day === currentDayName);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Bar for Teacher */}
      <header className="bg-orange-900 text-white sticky top-0 z-30 shadow-md w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2 sm:min-h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
          
          {/* Brand & Left Actions */}
          <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 w-full sm:w-auto">
            <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
              <button
                onClick={() => {
                  if (currentTab !== 'attendance') {
                    setCurrentTab('attendance');
                  } else {
                    setViewMode('public');
                  }
                }}
                className="p-1 rounded-lg bg-orange-800/80 hover:bg-orange-700 text-amber-200 hover:text-white transition flex items-center justify-center shrink-0 cursor-pointer"
                title={currentTab !== 'attendance' ? "उपस्थिति पटल पर वापस जाएं" : "सार्वजनिक पोर्टल पर जाएं"}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">🚩</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-sm sm:text-base font-black tracking-tight text-amber-100 truncate">
                      {currentSchool.hindiName || currentSchool.name}
                    </h1>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[9px] text-yellow-300 font-bold border border-yellow-400/40 shrink-0">
                      आचार्य पोर्टल
                    </span>
                  </div>
                  <span className="text-[10px] text-orange-300 font-medium hidden sm:block truncate">
                    {teacherProfile ? `${teacherProfile.gender === 'Acharya' ? 'आचार्य' : 'दीदी'} ${teacherProfile.name}` : teacherName} • {teacherProfile?.designation || 'शिक्षक'} • सत्र 2025-26
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-only Quick Buttons */}
            <div className="flex items-center gap-1.5 sm:hidden shrink-0">
              <button
                onClick={() => {
                  setShowChangePinModal(true);
                  setPinChangeError('');
                  setCurrentPinInput('');
                  setNewPinInput('');
                  setConfirmPinInput('');
                }}
                className="p-1.5 rounded-lg bg-orange-800/80 hover:bg-orange-700 text-amber-200 text-xs font-bold shrink-0 cursor-pointer"
                title="पिन बदलें"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                title="लॉगआउट"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center justify-end gap-2 text-xs">
            <button
              onClick={() => setShowTips(!showTips)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs shrink-0 cursor-pointer ${
                showTips
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/30'
                  : 'bg-orange-950/80 text-orange-200 hover:bg-orange-900 border border-orange-800/60'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span>{showTips ? 'सुझाव सक्रिय' : 'सुझाव देखें'}</span>
            </button>

            <button
              onClick={() => {
                setShowChangePinModal(true);
                setPinChangeError('');
                setCurrentPinInput('');
                setNewPinInput('');
                setConfirmPinInput('');
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-orange-950/80 hover:bg-orange-900 border border-orange-800/60 text-amber-200 font-bold transition shadow-xs text-xs shrink-0 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>पिन बदलें</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-red-800/80 hover:bg-red-700 text-white font-bold transition shadow-xs text-xs shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="sm:hidden px-3 py-2 bg-orange-900/95 border-t border-orange-800/60">
          <div className="flex items-center gap-2">
            <label htmlFor="mobile-teacher-section" className="sr-only">वर्तमान अनुभाग चुनें</label>
            <select
              id="mobile-teacher-section"
              value={currentTab}
              onChange={(e) => setCurrentTab(e.target.value as TeacherTab)}
              className="min-w-0 flex-1 rounded-lg border border-orange-700 bg-orange-950 px-3 py-2 text-xs font-bold text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="attendance">दैनिक उपस्थिति (Classroom Attendance)</option>
              <option value="homework">दैनिक गृहकार्य (Homework)</option>
              <option value="marks">परीक्षा अंक प्रविष्टि (Marks Entry)</option>
              <option value="timetable">समय-सारिणी (Timetable)</option>
              <option value="leaves">अवकाश आवेदन (Leaves)</option>
              <option value="salary">वेतन पर्ची (Salary Slip) {currentSchool.plan !== 'pro' ? '(PRO)' : ''}</option>
            </select>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-wrap gap-x-1 sm:gap-x-2 gap-y-0.5 overflow-x-visible text-xs font-medium border-t border-orange-800/60 w-full max-w-full">
          <button
            onClick={() => setCurrentTab('attendance')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'attendance'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>दैनिक उपस्थिति (Attendance)</span>
          </button>
          <button
            onClick={() => setCurrentTab('homework')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'homework'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>गृहकार्य (Homework)</span>
          </button>
          <button
            onClick={() => setCurrentTab('marks')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'marks'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>परीक्षा अंक प्रविष्टि (Marks)</span>
          </button>
          <button
            onClick={() => setCurrentTab('timetable')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'timetable'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>समय-सारिणी (Timetable)</span>
          </button>
          <button
            onClick={() => setCurrentTab('leaves')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'leaves'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>अवकाश आवेदन (Leaves)</span>
          </button>
          <button
            onClick={() => setCurrentTab('salary')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'salary'
                ? 'border-amber-400 text-amber-300 font-bold bg-orange-800/40'
                : 'border-transparent text-orange-200 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>वेतन पर्ची (Salary)</span>
            {currentSchool.plan !== 'pro' && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                PRO
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-5 sm:space-y-6 overflow-x-hidden">

        {/* Sub-tab In-line Back Navigation Bar */}
        {currentTab !== 'attendance' && (
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-orange-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setCurrentTab('attendance')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 font-bold text-xs border border-orange-200 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-orange-700 shrink-0" />
              <span>← दैनिक उपस्थिति पर वापस (Back to Attendance)</span>
            </button>
            <span className="text-xs font-semibold text-stone-500 capitalize hidden sm:inline">
              वर्तमान अनुभाग: {currentTab}
            </span>
          </div>
        )}

        {/* ================= TAB 1: ATTENDANCE ================= */}
        {currentTab === 'attendance' && (
          <div className="space-y-4">
            {/* Top Control Header */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                  <span>कक्षा उपस्थिति पंजिका (Daily Classroom Attendance)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  कक्षा और दिनांक चुनकर भैया/बहिनों की उपस्थिति दर्ज करें
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">कक्षा</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50"
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">दिनांक</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50"
                  />
                </div>

                <div className="flex items-center gap-2 self-end flex-wrap">
                  <button
                    onClick={() => handleMarkAllAttendance('Present')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    title="इस कक्षा के सभी विद्यार्थियों को उपस्थित अंकित करें"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>सभी उपस्थित</span>
                  </button>
                  <button
                    onClick={() => handleMarkAllAttendance('Absent')}
                    className="px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    title="इस कक्षा के सभी विद्यार्थियों को अनुपस्थित अंकित करें"
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>सभी अनुपस्थित</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportAttendanceToCSV(attendanceRecords, filteredStudents, attendanceDate);
                      showSuccess(`कक्षा ${selectedClass} की ${attendanceDate} की उपस्थिति CSV डाउनलोड हो गई!`);
                    }}
                    className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                    title="वर्तमान कक्षा एवं दिनांक की उपस्थिति CSV डाउनलोड करें"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>CSV निर्यात</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tip for Teachers */}
            {showTips && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-800" />
                  </span>
                  <div>
                    <span className="font-bold text-amber-900">💡 आचार्य सुझाव (30 सेकंड में हाजिरी): </span>
                    <span>पहले <strong>"सभी उपस्थित"</strong> बटन दबाएं, फिर केवल गैर-हाजिर (अनुपस्थित) 2-3 बच्चों के आगे <strong>'A'</strong> चुनें। एक-एक बच्चे पर अलग-अलग क्लिक करने का समय बचेगा!</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTips(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs shrink-0 p-1 rounded-lg hover:bg-amber-100"
                  title="सुझाव छुपाएं"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Live Attendance Stats Counter Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase">कुल छात्र (Total)</span>
                <p className="text-xl font-black text-stone-900">{totalAttendanceStudents}</p>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">उपस्थित (Present)</span>
                <p className="text-xl font-black text-emerald-800">
                  {presentCount} <span className="text-xs font-bold text-emerald-600">({attendanceRate}%)</span>
                </p>
              </div>
              <div className="bg-red-50 p-3.5 rounded-2xl border border-red-200 shadow-xs">
                <span className="text-[10px] font-bold text-red-700 uppercase">अनुपस्थित (Absent)</span>
                <p className="text-xl font-black text-red-800">{absentCount}</p>
              </div>
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase">अवकाश (On Leave)</span>
                <p className="text-xl font-black text-amber-800">{leaveCount}</p>
              </div>
              <div className="bg-orange-50 p-3.5 rounded-2xl border border-orange-200 shadow-xs col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-orange-700 uppercase">उपस्थिति दर (Rate)</span>
                <p className="text-xl font-black text-orange-900">{attendanceRate}%</p>
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={attendanceSearch}
                  onChange={(e) => setAttendanceSearch(e.target.value)}
                  placeholder="विद्यार्थी का नाम, अनुक्रमांक (Roll No), या पिता के नाम से खोजें..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              {attendanceSearch && (
                <button
                  onClick={() => setAttendanceSearch('')}
                  className="text-xs font-bold text-stone-500 hover:text-stone-700 px-2 py-1"
                >
                  फ़िल्टर हटाएं
                </button>
              )}
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">अनुक्रमांक</th>
                    <th className="p-3.5">छात्र / छात्रा का नाम</th>
                    <th className="p-3.5">पिता का नाम</th>
                    <th className="p-3.5 text-center">उपस्थिति स्थिति (Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedAttendanceStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-stone-400">
                        {attendanceSearch ? 'खोज के अनुरूप कोई विद्यार्थी नहीं मिला।' : 'इस कक्षा में अभी कोई छात्र पंजीकृत नहीं हैं।'}
                      </td>
                    </tr>
                  ) : (
                    displayedAttendanceStudents.map(student => {
                      const status = activeAttendanceMap[student.id] || 'Present';
                      const overallPct = getStudentOverallAttendancePct(student.id);
                      const isLowAttendance = overallPct !== null && overallPct < 75;

                      return (
                        <tr key={student.id} className="hover:bg-amber-50/40 transition">
                          <td className="p-3.5 font-bold font-mono text-stone-800">{student.rollNo}</td>
                          <td className="p-3.5 font-bold text-stone-900">
                            <div className="flex items-center gap-2">
                              <span>{student.gender === 'Bhaiya' ? '👦' : '👧'}</span>
                              <span>{student.name}</span>
                              {isLowAttendance && (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold border border-red-200"
                                  title={`कुल उपस्थिति ${overallPct}% (75% से कम)`}
                                >
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  <span>{overallPct}%</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-stone-600">{student.fatherName}</td>
                          <td className="p-3.5 text-center">
                            <div className="inline-flex rounded-xl p-1 bg-stone-100 border border-stone-200 gap-1">
                              <button
                                onClick={() => setStudentAttendance(student.id, attendanceDate, 'Present')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                  status === 'Present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600 hover:text-emerald-700'
                                }`}
                              >
                                उपस्थित (P)
                              </button>
                              <button
                                onClick={() => setStudentAttendance(student.id, attendanceDate, 'Absent')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                  status === 'Absent' ? 'bg-red-600 text-white shadow-xs' : 'text-stone-600 hover:text-red-700'
                                }`}
                              >
                                अनुपस्थित (A)
                              </button>
                              <button
                                onClick={() => setStudentAttendance(student.id, attendanceDate, 'Leave')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                  status === 'Leave' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-amber-700'
                                }`}
                              >
                                अवकाश (L)
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: HOMEWORK ================= */}
        {currentTab === 'homework' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  दैनिक गृहकार्य प्रबंधन ({selectedClass})
                </h3>
                <p className="text-xs text-stone-500">
                  विद्यार्थियों हेतु गृहकार्य एवं स्वाध्याय निर्देश जारी करें
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50"
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <button
                  onClick={() => setShowAddHw(!showAddHw)}
                  className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>नया गृहकार्य</span>
                </button>
              </div>
            </div>

            {/* Quick Tip for Teachers */}
            {showTips && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-800" />
                  </span>
                  <div>
                    <span className="font-bold text-amber-900">💡 आचार्य सुझाव (अभिभावक व्हाट्सएप ब्रॉडकास्ट): </span>
                    <span>विषय चिप्स (उदा. <strong>गणित, हिन्दी</strong>) पर 1-क्लिक करके विषय चुनें। गृहकार्य प्रकाशित होते ही नीचे <strong>"व्हाट्सएप साझा"</strong> बटन दबाएं — अभिभावकों के क्लास ग्रुप में संरचित संदेश तुरंत चला जाएगा!</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTips(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs shrink-0 p-1 rounded-lg hover:bg-amber-100"
                  title="सुझाव छुपाएं"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {showAddHw && (
              <form onSubmit={handleSaveHomework} className="bg-white p-5 rounded-2xl border-2 border-orange-300 shadow-md space-y-4 text-xs">
                <h4 className="font-bold text-stone-900 text-sm">
                  {editingHw ? 'गृहकार्य विवरण संशोधित करें (Edit Homework)' : 'नवीन गृहकार्य प्रविष्टि'}
                </h4>

                {/* 1-Click Smart Homework Drafter */}
                <div className="p-3 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-xl border border-orange-200/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                    <input
                      type="text"
                      value={smartHwTopic}
                      onChange={(e) => setSmartHwTopic(e.target.value)}
                      placeholder="अध्याय या विषय बोलें या लिखें (उदा. प्रकाश का परावर्तन, वर्ग व वर्गमूल)..."
                      className="w-full bg-white px-3 py-1.5 rounded-lg border border-orange-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={startVoiceForHw}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 transition cursor-pointer ${
                        isListeningHw
                          ? 'bg-red-600 text-white border-red-700 animate-pulse'
                          : 'bg-white text-stone-700 border-orange-200 hover:bg-orange-100/50'
                      }`}
                      title="बोलकर पाठ का नाम बताएं"
                    >
                      <Mic className={`w-3.5 h-3.5 ${isListeningHw ? 'text-white' : 'text-orange-600'}`} />
                      <span>{isListeningHw ? 'सुन रहे हैं...' : 'बोलें'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isDraftingHw}
                      onClick={() => handleDraftSmartHomework()}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-700 hover:bg-orange-800 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      {isDraftingHw ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>रचना हो रही है...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>✨ बौद्धिक गृहकार्य तैयार करें</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">विषय (Subject)</label>
                    <input
                      required
                      value={hwSubject}
                      onChange={(e) => setHwSubject(e.target.value)}
                      placeholder="उदा. गणित, संस्कृत, विज्ञान"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {QUICK_SUBJECTS.map(subj => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setHwSubject(subj)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                            hwSubject === subj
                              ? 'bg-orange-700 text-white border-orange-700 shadow-xs'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">शीर्षक (Title)</label>
                    <input
                      required
                      value={hwTitle}
                      onChange={(e) => setHwTitle(e.target.value)}
                      placeholder="उदा. अध्याय 4 अभ्यास प्रश्न"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">अंतिम तिथि (Due Date)</label>
                    <input
                      type="date"
                      required
                      value={hwDueDate}
                      onChange={(e) => setHwDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">विस्तृत विवरण व निर्देश</label>
                  <textarea
                    required
                    rows={3}
                    value={hwDesc}
                    onChange={(e) => setHwDesc(e.target.value)}
                    placeholder="छात्रों के लिए स्पष्ट कार्य विवरण एवं पृष्ठ संख्या आदि..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddHw(false);
                      setEditingHw(null);
                      setHwTitle('');
                      setHwDesc('');
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    {editingHw ? 'संशोधन सहेजें' : 'गृहकार्य प्रकाशित करें'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworkList.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
                  इस कक्षा के लिए अभी कोई गृहकार्य जारी नहीं किया गया है। ऊपर दिए गए बटन से नया गृहकार्य जोड़ें।
                </div>
              ) : (
                homeworkList.map(hw => (
                  <div key={hw.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-2 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-800 font-bold text-[11px]">
                          {hw.subject} • {hw.class}
                        </span>
                        <span className="text-stone-500 text-[11px] font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-orange-600" />
                          अंतिम तिथि: {hw.dueDate}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm">{hw.title}</h4>
                      <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 whitespace-pre-wrap">
                        {hw.description}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-stone-400 truncate">
                        प्रदत्त: {hw.assignedBy} ({hw.date})
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditHw(hw)}
                          className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-[11px] flex items-center gap-1 transition"
                          title="गृहकार्य संपादित करें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>संपादित करें</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareHwWhatsApp(hw)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                          title="अभिभावक व्हाट्सएप ग्रुप पर साझा करें"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>व्हाट्सएप साझा</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: EXAM MARKS ENTRY ================= */}
        {currentTab === 'marks' && (
          <div className="space-y-4">
            {/* Top Control Bar */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                  <span>परीक्षा अंक प्रविष्टि मैट्रिक्स (Tabular Marks Entry)</span>
                </h3>
                <p className="text-xs text-stone-500">
                  परीक्षा, कक्षा एवं विषय चुनकर तेजी से अंक दर्ज करें (Enter या Arrow keys दबाकर अगले छात्र पर जाएं)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">परीक्षा</label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50"
                  >
                    {exams.length === 0 ? (
                      <option value="">कोई परीक्षा निर्धारित नहीं</option>
                    ) : (
                      exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title} ({ex.term})</option>)
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">कक्षा</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50"
                  >
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">विषय</label>
                  <input
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50 w-28"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">पूर्णांक (Max)</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value) || 100)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50 w-20"
                  />
                </div>

                <div className="self-end flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuestionPaperModal(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    title="मासिक इकाई मूल्यांकन व त्रैमासिक परीक्षा हेतु प्रश्न पत्र तैयार करें"
                  >
                    <FileText className="w-4 h-4" />
                    <span>📝 प्रश्न पत्र निर्माता</span>
                  </button>

                  <button
                    onClick={handleBulkMarksSave}
                    disabled={isSavingMarks || Boolean(selectedExam?.isLocked)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {selectedExam?.isLocked ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>{selectedExam?.isLocked ? 'परीक्षा परिणाम लॉक है' : isSavingMarks ? 'सुरक्षित हो रहा है...' : 'अंक सुरक्षित करें'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lock Banner if Exam is Frozen */}
            {selectedExam?.isLocked && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-amber-950 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 border border-amber-300">
                  <Lock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-950">
                    🔒 यह परीक्षा संकलित एवं लॉक (Locked) है
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    प्रशासन द्वारा इस परीक्षा के अंक संकलित व सील कर दिए गए हैं। नवीन प्रविष्टि अथवा संशोधन अक्षम कर दिया गया है।
                  </p>
                </div>
              </div>
            )}

            {/* Quick Tip for Teachers */}
            {showTips && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-800" />
                  </span>
                  <div>
                    <span className="font-bold text-amber-900">💡 आचार्य सुझाव (तीव्र कीबोर्ड एंट्री): </span>
                    <span>अंक टाइप करके कीबोर्ड का <strong>Enter</strong> या <strong>↓ (Down Arrow)</strong> दबाएं — कर्सर खुद अगले छात्र पर जाएगा (माउस छूने की आवश्यकता नहीं)। जो छात्र परीक्षा में नहीं आया, उसके आगे <strong>'AB'</strong> दबाएं!</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTips(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs shrink-0 p-1 rounded-lg hover:bg-amber-100"
                  title="सुझाव छुपाएं"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Live Class Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase">प्रविष्ट / कुल</span>
                <p className="text-lg font-black text-stone-900">{enteredMarksCount} / {filteredStudents.length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 shadow-xs">
                <span className="text-[10px] font-bold text-blue-700 uppercase">कक्षा औसत (Avg)</span>
                <p className="text-lg font-black text-blue-900">{classAvgPct}%</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 shadow-xs">
                <span className="text-[10px] font-bold text-purple-700 uppercase">उच्चतम (Highest)</span>
                <p className="text-lg font-black text-purple-900">{highestClassMarks} <span className="text-xs text-purple-600 font-semibold">/{maxMarks}</span></p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">उत्तीर्ण (Passed)</span>
                <p className="text-lg font-black text-emerald-900">{passedStudentsCount}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase">अनुत्तीर्ण (&lt;33%)</span>
                <p className="text-lg font-black text-amber-900">{failedStudentsCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-2xl border border-red-200 shadow-xs">
                <span className="text-[10px] font-bold text-red-700 uppercase">अनुपस्थित (AB)</span>
                <p className="text-lg font-black text-red-900">{examAbsentCount}</p>
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={marksSearch}
                  onChange={(e) => setMarksSearch(e.target.value)}
                  placeholder="विद्यार्थी का नाम या अनुक्रमांक से खोजें..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              {marksSearch && (
                <button
                  onClick={() => setMarksSearch('')}
                  className="text-xs font-bold text-stone-500 hover:text-stone-700 px-2 py-1"
                >
                  फ़िल्टर हटाएं
                </button>
              )}
            </div>

            {marksSaveSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>अंक सफलतापूर्वक सुरक्षित हो गए हैं और प्रगति पत्र में अपडेट कर दिए गए हैं!</span>
              </div>
            )}

            {/* Marks Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">अनुक्रमांक</th>
                    <th className="p-3.5">विद्यार्थी का नाम</th>
                    <th className="p-3.5">पूर्णांक</th>
                    <th className="p-3.5">प्राप्तांक / अनुपस्थित</th>
                    <th className="p-3.5">प्रतिशत</th>
                    <th className="p-3.5">ग्रेड (Grade)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedMarksStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        {marksSearch ? 'खोज के अनुरूप कोई विद्यार्थी नहीं मिला।' : 'इस कक्षा में छात्र पंजीकृत नहीं हैं।'}
                      </td>
                    </tr>
                  ) : (
                    displayedMarksStudents.map((st, idx) => {
                      const isAbsent = !!absentStudents[st.id];
                      const obtained = marksState[st.id] ?? '';
                      const numObtained = Number(obtained) || 0;
                      const pct = maxMarks > 0 && !isAbsent ? (numObtained / maxMarks) * 100 : 0;
                      const grade = isAbsent
                        ? 'AB'
                        : pct >= 90
                        ? 'A+'
                        : pct >= 75
                        ? 'A'
                        : pct >= 60
                        ? 'B'
                        : pct >= 45
                        ? 'C'
                        : pct >= 33
                        ? 'D'
                        : 'E';

                      return (
                        <tr key={st.id} className={`hover:bg-amber-50/30 transition ${isAbsent ? 'bg-red-50/30' : ''}`}>
                          <td className="p-3.5 font-bold font-mono text-stone-800">{st.rollNo}</td>
                          <td className="p-3.5 font-bold text-stone-900">{st.name}</td>
                          <td className="p-3.5 font-semibold text-stone-600">{maxMarks}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <input
                                id={`marks-input-${idx}`}
                                type="number"
                                min={0}
                                max={maxMarks}
                                disabled={isAbsent || Boolean(selectedExam?.isLocked)}
                                value={isAbsent ? '' : (marksState[st.id] ?? '')}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === '') {
                                    const next = { ...marksState };
                                    delete next[st.id];
                                    setMarksState(next);
                                  } else {
                                    const val = Math.min(maxMarks, Math.max(0, Number(raw) || 0));
                                    setMarksState(prev => ({ ...prev, [st.id]: val }));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    const next = document.getElementById(`marks-input-${idx + 1}`);
                                    if (next) (next as HTMLInputElement).focus();
                                  } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    const prev = document.getElementById(`marks-input-${idx - 1}`);
                                    if (prev) (prev as HTMLInputElement).focus();
                                  }
                                }}
                                placeholder={selectedExam?.isLocked ? '🔒' : isAbsent ? 'AB' : '0'}
                                className={`w-20 px-3 py-1.5 rounded-xl border font-bold focus:ring-2 focus:ring-orange-500 ${
                                  selectedExam?.isLocked || isAbsent
                                    ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed text-center'
                                    : 'border-stone-300 bg-white'
                                }`}
                              />
                              <button
                                type="button"
                                disabled={Boolean(selectedExam?.isLocked)}
                                onClick={() => {
                                  setAbsentStudents(prev => {
                                    const nextState = !prev[st.id];
                                    if (nextState) {
                                      setMarksState(m => ({ ...m, [st.id]: 0 }));
                                    }
                                    return { ...prev, [st.id]: nextState };
                                  });
                                }}
                                className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition ${
                                  selectedExam?.isLocked
                                    ? 'opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
                                    : isAbsent
                                    ? 'bg-red-600 text-white border-red-700 shadow-xs'
                                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                                }`}
                                title={selectedExam?.isLocked ? 'परीक्षा लॉक है' : isAbsent ? 'अनुपस्थित हटाया जाएगा' : 'विद्यार्थी को अनुपस्थित (AB) अंकित करें'}
                              >
                                {isAbsent ? 'AB ✓' : 'AB'}
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-orange-900">
                            {isAbsent ? <span className="text-stone-400">—</span> : `${pct.toFixed(1)}%`}
                          </td>
                          <td className="p-3.5">
                            {isAbsent ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                                अनुपस्थित (AB)
                              </span>
                            ) : (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                grade === 'A+' || grade === 'A' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                grade === 'B' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                grade === 'C' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                grade === 'D' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {grade}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: TIMETABLE ================= */}
        {currentTab === 'timetable' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>समय-सारिणी (Weekly Timetable — {selectedClass})</span>
                </h3>
                <p className="text-xs text-stone-500">
                  कक्षावार एवं दिनवार घंटी (Periods 1-8) का विवरण
                </p>
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-stone-300 bg-stone-50"
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Quick Tip for Teachers */}
            {showTips && (
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-amber-200 text-amber-900 shrink-0">
                    <Lightbulb className="w-4 h-4 text-amber-800" />
                  </span>
                  <div>
                    <span className="font-bold text-amber-900">💡 आचार्य सुझाव (दैनिक कक्षा कार्यक्रम): </span>
                    <span>आज की घंटियां (Periods 1-8) सबसे ऊपर दी गई हैं, जिससे आपको विद्यालय पहुंचते ही स्पष्ट पता रहेगा कि किस घंटी में किस कक्षा में जाना है।</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowTips(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs shrink-0 p-1 rounded-lg hover:bg-amber-100"
                  title="सुझाव छुपाएं"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Today's Priority Schedule Banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-400/50 p-5 rounded-2xl shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-xs">
                    <Sun className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
                      <span>आज की कक्षाएं व घंटी (Today's Schedule)</span>
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
                        {DAYS_MAP[currentDayName] || currentDayName}
                      </span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-800 bg-amber-100 px-3 py-1 rounded-xl">
                  {selectedClass}
                </span>
              </div>

              {isSunday ? (
                <div className="p-4 bg-white rounded-2xl border border-amber-200 text-stone-600 text-xs font-medium text-center">
                  🌸 आज रविवार (साप्ताहिक अवकाश) है। कल सोमवार के लिए नीचे दी गई समय-सारिणी देखें।
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(todaySchedule?.slots || [
                    { period: 1, subject: 'वंदना एवं संस्कृत', teacherName: 'आचार्य जी', startTime: '08:30', endTime: '09:15' },
                    { period: 2, subject: 'गणित', teacherName: 'आचार्य जी', startTime: '09:15', endTime: '10:00' },
                    { period: 3, subject: 'विज्ञान', teacherName: 'दीदी जी', startTime: '10:00', endTime: '10:45' },
                    { period: 4, subject: 'शारीरिक व योग', teacherName: 'आचार्य जी', startTime: '11:00', endTime: '11:45' }
                  ]).map((slot, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-col justify-between space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                          घंटी {slot.period || idx + 1}
                        </span>
                        <span className="text-[10px] font-bold text-stone-500">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block text-xs">{slot.subject}</span>
                        <span className="text-[10px] text-stone-500">{slot.teacherName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                const isCurrentDay = day === currentDayName;
                const classTt = timetables.find(t => t.class === selectedClass);
                const daySchedule = classTt?.schedule?.find(s => s.day === day);

                return (
                  <div
                    key={day}
                    className={`bg-white p-4 rounded-2xl border transition shadow-xs ${
                      isCurrentDay
                        ? 'border-orange-500 ring-2 ring-orange-400/40 bg-orange-50/10'
                        : 'border-stone-200'
                    }`}
                  >
                    <h4 className="font-bold text-stone-900 text-sm border-b pb-2 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-orange-900">{DAYS_MAP[day]}</span>
                        {isCurrentDay && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white">
                            आज
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase font-mono">{day}</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      {(daySchedule?.slots || [
                        { period: 1, subject: 'वंदना एवं संस्कृत', teacherName: 'आचार्य जी', startTime: '08:30', endTime: '09:15' },
                        { period: 2, subject: 'गणित', teacherName: 'आचार्य जी', startTime: '09:15', endTime: '10:00' },
                        { period: 3, subject: 'विज्ञान', teacherName: 'दीदी जी', startTime: '10:00', endTime: '10:45' },
                        { period: 4, subject: 'शारीरिक व योग', teacherName: 'आचार्य जी', startTime: '11:00', endTime: '11:45' }
                      ]).map((slot, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-stone-800 block text-xs">{slot.subject}</span>
                            <span className="text-[10px] text-stone-500">{slot.teacherName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 5: LEAVES ================= */}
        {currentTab === 'leaves' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-1">
                आचार्य अवकाश आवेदन (Leave Application)
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                प्रधानाचार्य जी को आकस्मिक या चिकित्सा अवकाश हेतु ऑनलाइन आवेदन प्रेषित करें
              </p>

              {leaveSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>अवकाश आवेदन सफलतापूर्वक प्रधानाचार्य के पास भेज दिया गया है।</span>
                </div>
              )}

              <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">अवकाश आरंभ तिथि</label>
                    <input
                      type="date"
                      required
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">अवकाश समाप्ति तिथि</label>
                    <input
                      type="date"
                      required
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">अवकाश का कारण</label>
                  <textarea
                    required
                    rows={2}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="उदा. आवश्यक पारिवारिक कार्य अथवा स्वास्थ्य अस्वस्थता..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>आवेदन जमा करें</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Leave History */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <h4 className="text-sm font-bold text-stone-900 mb-3">पूर्व अवकाश इतिहास (My Leave Requests)</h4>
              <div className="space-y-3">
                {leaves.length === 0 ? (
                  <p className="text-xs text-stone-400 py-4 text-center">कोई पूर्व अवकाश रिकॉर्ड उपलब्ध नहीं है।</p>
                ) : (
                  leaves.map(l => (
                    <div key={l.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-stone-900">
                          <span>{l.startDate} से {l.endDate}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            l.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            l.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {l.status === 'Approved' ? 'स्वीकृत' : l.status === 'Rejected' ? 'अस्वीकृत' : 'प्रतीक्षारत'}
                          </span>
                        </div>
                        <p className="text-stone-600 mt-1 italic">"{l.reason}"</p>
                        {l.reviewerRemarks && (
                          <p className="text-[11px] text-orange-800 mt-1">
                            टिप्पणी: {l.reviewerRemarks} ({l.reviewedBy})
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">आवेदन: {l.appliedDate}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SALARY SLIP ================= */}
        {currentTab === 'salary' && (
          currentSchool.plan !== 'pro' ? (
            <div className="bg-white rounded-2xl border-2 border-amber-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-3xl border border-amber-300">
                <Crown className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                आचार्य वेतन पर्ची (Staff Salary Slip) - प्रो सुविधा
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-lg mx-auto">
                डिजिटल वेतन पर्ची, भत्ते एवं ई-हस्ताक्षरित पेरोल प्रबंधन विद्या भारती प्रो सदस्यता (Pro Feature AMC) के अंतर्गत उपलब्ध है।
                अपनी विद्यालय शाखा को प्रो में अपग्रेड करने हेतु संस्था प्रधान अथवा विद्या भारती संगठन से संपर्क करें।
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
                  <span>वर्तमान विद्यालय योजना: निःशुल्क (Free Tier)</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    मासिक वेतन विवरण एवं पर्ची (Salary Slip)
                  </h3>
                  <p className="text-xs text-stone-500">
                    अपने मासिक परिलब्धियों एवं कटौतियों की अधिकृत पर्ची देखें
                  </p>
                </div>

                {teacherProfile && (
                  <button
                    onClick={() => setShowSalarySlip(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    प्रिंट / डाउनलोड वेतन पर्ची 📄
                  </button>
                )}
              </div>

              {teacherProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="block text-stone-500 font-bold uppercase text-[10px]">मूल वेतन (Basic Pay)</span>
                    <span className="text-xl font-black text-emerald-800">₹ {teacherProfile.basicPay || 18000}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="block text-stone-500 font-bold uppercase text-[10px]">भत्ते (DA / HRA)</span>
                    <span className="text-xl font-black text-blue-800">₹ {teacherProfile.daHra || 7000}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                    <span className="block text-stone-500 font-bold uppercase text-[10px]">शुद्ध देय वेतन (Net Salary)</span>
                    <span className="text-xl font-black text-orange-800">₹ {teacherProfile.monthlySalary || 25000}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 py-4">प्रोफ़ाइल विवरण लोड हो रहा है...</p>
              )}
            </div>
          )
        )}

      </main>

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-orange-200 relative animate-in zoom-in-95">
            <button
              onClick={() => setShowChangePinModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center text-xl mb-2 shadow-xs border border-orange-200">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">सुरक्षा पिन बदलें</h3>
              <p className="text-xs text-stone-500 mt-0.5">आचार्य पोर्टल लॉगिन हेतु नया 4-अंकीय पिन निर्धारित करें</p>
            </div>

            {pinChangeError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {pinChangeError}
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">वर्तमान पिन (Current PIN)*</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="पुराना पिन (उदा: 1234)"
                  value={currentPinInput}
                  onChange={e => setCurrentPinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-widest text-center text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">नया सुरक्षा पिन (New PIN)*</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="नया 4 से 6 अंकों का पिन"
                  value={newPinInput}
                  onChange={e => setNewPinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-widest text-center text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">नया पिन पुनः दर्ज करें (Confirm)*</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="नया पिन दोबारा दर्ज करें"
                  value={confirmPinInput}
                  onChange={e => setConfirmPinInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-widest text-center text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangePinModal(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isChangingPin}
                  className="flex-1 py-2.5 bg-orange-700 hover:bg-orange-800 disabled:opacity-60 text-white font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  {isChangingPin ? 'बदला जा रहा है...' : 'पिन सहेजें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Salary Slip Modal */}
      {showSalarySlip && teacherProfile && (
        <StaffSalarySlipModal
          staff={teacherProfile}
          onClose={() => setShowSalarySlip(false)}
        />
      )}

      {/* Smart Question Paper Generator Modal */}
      <QuestionPaperModal
        isOpen={showQuestionPaperModal}
        onClose={() => setShowQuestionPaperModal(false)}
        initialClass={selectedClass}
        initialSubject={examSubject}
      />
    </div>
  );
};
