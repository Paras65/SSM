import React, { useState } from 'react';
import type {
  ReportCard,
  Student,
  SelfAssessment,
  PeerAssessment,
  ParentObservation,
  TwentyFirstCenturySkills,
  TwentyFirstCenturySkill
} from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import {
  Printer,
  X,
  ArrowLeft,
  Award,
  MessageSquare,
  Sparkles,
  Mic,
  ShieldCheck,
  Save,
  Edit3,
  User,
  Users,
  Home,
  Brain,
  Lightbulb,
  Compass,
  MessageCircle,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { generateReportCardWhatsAppLink } from '../../utils/whatsappAlerts';

interface PragatiPatraModalProps {
  reportCard: ReportCard;
  student: Student;
  onClose: () => void;
}

export const PragatiPatraModal: React.FC<PragatiPatraModalProps> = ({ reportCard, student, onClose }) => {
  const { currentSchool, addOrUpdateReportCard } = useSchool();
  const { showSuccess, showError, showWarning } = useToast();

  // Layout mode: 'hpc' (360° Holistic) or 'classic' (Traditional Marksheet)
  const [activeLayout, setActiveLayout] = useState<'hpc' | 'classic'>('hpc');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Remarks & Speech Recognition
  const [currentRemarks, setCurrentRemarks] = useState(reportCard.acharyaRemarks || '');
  const [isListening, setIsListening] = useState(false);

  // 360° HPC Subdocuments with Fallbacks
  const he = reportCard.holisticEvaluation;

  const [selfAssessment, setSelfAssessment] = useState<SelfAssessment>({
    strengths: he?.selfAssessment?.strengths || 'गणित में रुचि, समूह कार्य में सक्रियता, विज्ञान प्रयोग',
    interests: he?.selfAssessment?.interests || 'चित्रकला, योग, विज्ञान मॉडल निर्माण',
    myGoals: he?.selfAssessment?.myGoals || 'संस्कृत संभाषण में धाराप्रवाह बोलना एवं वैदिक गणित सीखना',
    learningEnjoyment: he?.selfAssessment?.learningEnjoyment || 'सर्वोच्च (Very High)'
  });

  const [peerAssessment, setPeerAssessment] = useState<PeerAssessment>({
    peerName: he?.peerAssessment?.peerName || 'आदित्य शर्मा (सहपाठी)',
    collaborationGrade: he?.peerAssessment?.collaborationGrade || 'A+',
    empathyAndRespect: he?.peerAssessment?.empathyAndRespect || 'उत्कृष्ट',
    teamworkRemarks: he?.peerAssessment?.teamworkRemarks || 'कक्षा में सभी की सहायता करते हैं और समूह कार्य में मिलजुलकर कार्य करते हैं।'
  });

  const [parentObservation, setParentObservation] = useState<ParentObservation>({
    homeDiscipline: he?.parentObservation?.homeDiscipline || 'समय पर उठना, प्रातः माता-पिता को प्रणाम, नियमित 2 घंटे स्वाध्याय',
    curiosityAndReading: he?.parentObservation?.curiosityAndReading || 'बाल पत्रिकाएं, महापुरुषों की जीवनियां, समाचार पत्र',
    parentRemarks: he?.parentObservation?.parentRemarks || 'विद्यालय के संस्कारों से बच्चे के व्यवहार में अत्यंत सकारात्मक परिवर्तन आया है।'
  });

  const [twentyFirstCenturySkills, setTwentyFirstCenturySkills] = useState<TwentyFirstCenturySkills>({
    criticalThinking: {
      grade: he?.twentyFirstCenturySkills?.criticalThinking?.grade || 'A+',
      descriptor: he?.twentyFirstCenturySkills?.criticalThinking?.descriptor || 'तार्किक दृष्टिकोण एवं विश्लेषणात्मक चिंतन'
    },
    problemSolving: {
      grade: he?.twentyFirstCenturySkills?.problemSolving?.grade || 'O',
      descriptor: he?.twentyFirstCenturySkills?.problemSolving?.descriptor || 'कठिन समस्याओं का सहज एवं व्यावहारिक समाधान'
    },
    creativity: {
      grade: he?.twentyFirstCenturySkills?.creativity?.grade || 'O',
      descriptor: he?.twentyFirstCenturySkills?.creativity?.descriptor || 'नवाचारी विचार एवं कलात्मक अभिव्यक्ति'
    },
    communication: {
      grade: he?.twentyFirstCenturySkills?.communication?.grade || 'A+',
      descriptor: he?.twentyFirstCenturySkills?.communication?.descriptor || 'स्पष्ट वाकपटुता एवं प्रभावी प्रस्तुतीकरण'
    },
    digitalAwareness: {
      grade: he?.twentyFirstCenturySkills?.digitalAwareness?.grade || 'A',
      descriptor: he?.twentyFirstCenturySkills?.digitalAwareness?.descriptor || 'कंप्यूटर का उत्तरदायित्वपूर्ण एवं सुरक्षित उपयोग'
    }
  });

  const handlePrint = () => {
    window.print();
  };

  // Division calculation
  const division = reportCard.percentage >= 75
    ? 'विशिष्ट योग्यता (Distinction)'
    : reportCard.percentage >= 60
    ? 'प्रथम श्रेणी (I Division)'
    : reportCard.percentage >= 45
    ? 'द्वितीय श्रेणी (II Division)'
    : reportCard.percentage >= 33
    ? 'तृतीय श्रेणी (III Division)'
    : 'अनुत्तीर्ण (Failed)';

  // Verification QR data URL
  const qrVerificationData = encodeURIComponent(
    `SSM-HPC-REPORT|${currentSchool.id}|Roll:${student.rollNo}|Name:${student.name}|Class:${student.class}-${student.section}|Marks:${reportCard.totalObtained}/${reportCard.totalMax}|Pct:${reportCard.percentage.toFixed(1)}%|Grade:${reportCard.grade}|Division:${division}|Term:${reportCard.examTerm}`
  );
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&margin=2&data=${qrVerificationData}`;

  const handleSaveHpc = async () => {
    setIsSaving(true);
    try {
      const updatedReport: ReportCard = {
        ...reportCard,
        acharyaRemarks: currentRemarks,
        holisticEvaluation: {
          selfAssessment,
          peerAssessment,
          parentObservation,
          twentyFirstCenturySkills
        }
      };
      await addOrUpdateReportCard(updatedReport);
      setIsEditing(false);
      showSuccess('समग्र प्रगति पत्र (HPC 360°) सफलतापूर्वक सहेजा गया!');
    } catch (err: any) {
      console.error('Error saving HPC report:', err);
      showError('प्रगति पत्र सहेजने में त्रुटि आई।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareWhatsApp = () => {
    const pe = reportCard.panchmukhiEvaluation;
    const url = generateReportCardWhatsAppLink({
      studentName: student.name,
      className: `${student.class} '${student.section}'`,
      rollNo: student.rollNo,
      term: reportCard.examTerm,
      academicYear: reportCard.academicYear,
      percentage: reportCard.percentage,
      grade: reportCard.grade,
      moralConduct: reportCard.moralConduct,
      acharyaRemarks: currentRemarks,
      panchmukhi: {
        sharirikGrade: pe?.sharirik?.grade || 'O',
        yogGrade: pe?.yog?.grade || 'A+',
        sangeetGrade: pe?.sangeet?.grade || 'A',
        sanskritGrade: pe?.sanskrit?.grade || 'O',
        naitikGrade: pe?.naitik?.grade || 'O',
      },
      holistic: {
        selfStrength: selfAssessment.strengths,
        peerCollab: peerAssessment.collaborationGrade,
        twentyFirstCentury: `तर्क: ${twentyFirstCenturySkills.criticalThinking.grade} • नवाचार: ${twentyFirstCenturySkills.creativity.grade}`,
      },
      schoolName: currentSchool.hindiName || currentSchool.name,
      phone: student.contact
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showWarning('आपके ब्राउज़र में वॉइस टाइपिंग उपलब्ध नहीं है। कृपया Google Chrome का उपयोग करें।');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentRemarks(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const [isGeneratingRemarks, setIsGeneratingRemarks] = useState(false);

  // 1-Click Smart Culturally-Grounded Hindi Remarks Generator
  const handleGenerateSmartRemarks = async () => {
    setIsGeneratingRemarks(true);
    const effectiveKey =
      (import.meta.env.VITE_SMART_API_KEY as string) ||
      (import.meta.env.VITE_GEMINI_API_KEY as string) ||
      localStorage.getItem('ssm_smart_api_key') ||
      localStorage.getItem('ssm_gemini_api_key') ||
      '';

    const fallbackRemark = () => {
      const isSister = student.gender === 'Bahin' || student.name.includes('Bahin') || student.name.includes('बहन');
      const prefix = isSister ? 'बहिन' : 'भैया';
      const cleanName = student.name.replace(/^(Bhaiya|Bahin|भैया|बहिन)\s*/i, '');
      const pct = reportCard.percentage;

      if (pct >= 85) {
        return `${prefix} ${cleanName} का अध्ययन, आचरण एवं अनुशासन अत्यंत अनुकरणीय है। विद्या भारती के सांस्कृतिक मूल्यों के अनुरूप निरंतर शीर्ष प्रदर्शन हेतु साधुवाद।`;
      } else if (pct >= 70) {
        return `${prefix} ${cleanName} का शैक्षिक स्तर उत्तम है। कक्षा सहभागिता एवं नियमित स्वाध्याय से और अधिक श्रेष्ठता संभव है। स्वभाव विनीत व आज्ञाकारी है।`;
      } else if (pct >= 50) {
        return `${prefix} ${cleanName} में अपार संभावनाएं हैं। विषयगत अभ्यास एवं दैनिक गृहकार्य पर थोड़ा और ध्यान अपेक्षित है। सदैव प्रगति के पथ पर अग्रसर रहें।`;
      } else {
        return `${prefix} ${cleanName} को मूलभूत अवधारणाओं में विशेष मार्गदर्शन दिया जा रहा है। नियमित उपस्थिति एवं आचार्यों के परामर्श से सुधार निश्चित है।`;
      }
    };

    if (!effectiveKey) {
      setTimeout(() => {
        setCurrentRemarks(fallbackRemark());
        setIsGeneratingRemarks(false);
        showSuccess('✨ बौद्धिक शिक्षक सम्मति स्वतः जोड़ी गई!');
      }, 300);
      return;
    }

    try {
      const prompt = `You are an experienced, affectionate Vidya Bharati (सरस्वती शिशु मंदिर) class teacher writing an annual report card remark (कक्षाचार्य सम्मति) for a student.
Student Details:
- Name: ${student.name} (${student.gender === 'Bahin' ? 'बहन/बालिका' : 'भैया/बालक'})
- Class: ${student.class} '${student.section}'
- Academic Score: ${reportCard.percentage.toFixed(1)}% (Grade: ${reportCard.grade})
- Moral Conduct: ${reportCard.moralConduct}

Instructions:
- Write exactly 2 polite, positive, inspiring, and culturally grounded sentences in pure formal Hindi.
- Mention their academic effort and positive character/discipline.
- Return ONLY the 2 sentences. No quotes, no markdown, no preamble.`;

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
            generationConfig: { temperature: 0.3, maxOutputTokens: 120 }
          })
        }
      );

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) {
        setCurrentRemarks(text);
        showSuccess('✨ बौद्धिक शिक्षक सम्मति स्वतः जोड़ी गई!');
      } else {
        setCurrentRemarks(fallbackRemark());
      }
    } catch {
      setCurrentRemarks(fallbackRemark());
      showSuccess('✨ बौद्धिक शिक्षक सम्मति स्वतः जोड़ी गई!');
    } finally {
      setIsGeneratingRemarks(false);
    }
  };

  const pe = reportCard.panchmukhiEvaluation;
  const panchmukhiList = [
    {
      icon: '🏃',
      name: 'शारीरिक शिक्षा (Physical)',
      grade: pe?.sharirik?.grade || 'O',
      gradeText: pe?.sharirik?.grade === 'O' ? 'सर्वोच्च' : 'उत्कृष्ट',
      skills: pe?.sharirik?.skills || 'दंड, नियुद्ध, 100 मी दौड़, संचलन, पारंपरिक खेल',
      remarks: pe?.sharirik?.remarks || 'शारीरिक सौष्ठव एवं संचलन में उत्कृष्ट नेतृत्व'
    },
    {
      icon: '🧘',
      name: 'योग एवं प्राणायाम (Yoga)',
      grade: pe?.yog?.grade || 'A+',
      gradeText: pe?.yog?.grade === 'O' ? 'सर्वोच्च' : 'अति उत्तम',
      skills: pe?.yog?.skills || 'सूर्य नमस्कार (12 मंत्र सहित), पद्मासन, भ्रामरी प्राणायाम',
      remarks: pe?.yog?.remarks || 'दैनिक आसनों में लचीलापन एवं नियमितता'
    },
    {
      icon: '🎵',
      name: 'संगीत एवं घोष (Music)',
      grade: pe?.sangeet?.grade || 'A',
      gradeText: pe?.sangeet?.grade === 'O' ? 'सर्वोच्च' : 'उत्तम',
      skills: pe?.sangeet?.skills || 'सरस्वती वंदना, एकात्मता स्तोत्र, घोष वादन (वंशी/आनक)',
      remarks: pe?.sangeet?.remarks || 'प्रार्थना सभा में लयबद्ध वादन एवं गायन'
    },
    {
      icon: '📜',
      name: 'संस्कृत शिक्षा (Sanskrit)',
      grade: pe?.sanskrit?.grade || 'O',
      gradeText: 'सर्वोच्च',
      skills: pe?.sanskrit?.skills || 'गीता श्लोक कंठस्थीकरण, सुभाषित, सरल संस्कृत संभाषण',
      remarks: pe?.sanskrit?.remarks || 'स्पष्ट एवं शुद्ध उच्चारण, उत्कृष्ट स्मरण शक्ति'
    },
    {
      icon: '🪷',
      name: 'नैतिक व आध्यात्मिक (Moral)',
      grade: pe?.naitik?.grade || 'O',
      gradeText: 'सर्वोच्च',
      skills: pe?.naitik?.skills || 'मातृ-पितृ चरण स्पर्श, गुरु भक्ति, समयबद्धता, सेवाभाव',
      remarks: pe?.naitik?.remarks || 'आदर्श संस्कारयुक्त आचरण एवं अनुकरणीय अनुशासन'
    }
  ];

  const skillConfig = [
    {
      key: 'criticalThinking' as const,
      name: 'गहन व विश्लेषणात्मक चिंतन (Critical Thinking)',
      icon: <Brain className="w-3.5 h-3.5 text-blue-600" />,
      desc: 'तर्क, कारण-प्रभाव संबंध एवं स्वतंत्र निर्णय लेने की क्षमता'
    },
    {
      key: 'problemSolving' as const,
      name: 'समस्या निवारण क्षमता (Problem Solving)',
      icon: <Compass className="w-3.5 h-3.5 text-emerald-600" />,
      desc: 'व्यावहारिक चुनौतियों को समझकर योजनाबद्ध समाधान खोजना'
    },
    {
      key: 'creativity' as const,
      name: 'सृजनात्मकता एवं नवाचार (Creativity & Innovation)',
      icon: <Lightbulb className="w-3.5 h-3.5 text-amber-600" />,
      desc: 'मौलिक विचार, कलात्मक रुचि एवं नए दृष्टिकोण प्रस्तुत करना'
    },
    {
      key: 'communication' as const,
      name: 'प्रभावी संप्रेषण (Communication)',
      icon: <MessageCircle className="w-3.5 h-3.5 text-purple-600" />,
      desc: 'स्पष्ट वाक्‌पटुता, सक्रिय श्रवण एवं सहपाठियों से संवाद'
    },
    {
      key: 'digitalAwareness' as const,
      name: 'डिजिटल जागरूकता व तकनीक (Digital Awareness)',
      icon: <Laptop className="w-3.5 h-3.5 text-cyan-600" />,
      desc: 'सूचना प्रौद्योगिकी का उत्तरदायित्वपूर्ण, नैतिक एवं सुरक्षित उपयोग'
    }
  ];

  const skillGradeBadges: Record<string, { label: string; bg: string; text: string; border: string }> = {
    'O': { label: 'O (सर्वोच्च - Outstanding)', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
    'A+': { label: 'A+ (उत्कृष्ट - Excellent)', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
    'A': { label: 'A (अति उत्तम - Very Good)', bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300' },
    'B': { label: 'B (संतोषजनक - Good)', bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-hidden print:static print:p-0 print:m-0 print:bg-transparent print:overflow-visible">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-orange-300 flex flex-col max-h-[92vh] sm:max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:max-w-none print:rounded-none print:p-0 print:m-0">
        
        {/* Action Header (Hidden in Print) - Pinned at top */}
        <div className="no-print shrink-0 bg-gradient-to-r from-orange-800 via-amber-800 to-orange-900 text-white px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-2 border-b border-orange-950/40">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
              title="वापस जाएं (Back)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">वापस</span>
            </button>
            <div className="flex items-center gap-1.5 min-w-0">
              <Award className="w-4 h-4 text-yellow-300 shrink-0 hidden sm:block" />
              <span className="text-xs sm:text-sm font-bold tracking-tight truncate">प्रगति पत्र</span>
            </div>

            {/* Layout Switcher Tabs */}
            <div className="inline-flex rounded-lg bg-black/25 p-0.5 text-[11px] sm:text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setActiveLayout('hpc')}
                className={`px-2 sm:px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                  activeLayout === 'hpc'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-200 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden xs:inline">360°</span> HPC
              </button>
              <button
                type="button"
                onClick={() => setActiveLayout('classic')}
                className={`px-2 sm:px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                  activeLayout === 'classic'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-200 hover:text-white'
                }`}
              >
                <span>मानक</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {activeLayout === 'hpc' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isEditing
                      ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                  title="360° मूल्यांकन संपादन टॉगल करें"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isEditing ? 'पूर्वावलोकन' : 'संपादित करें'}</span>
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleSaveHpc}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    title="परिवर्तनों को स्थायी रूप से सुरक्षित करें"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? '...' : 'सहेजें'}</span>
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="अभिभावक के व्हाट्सएप पर प्रगति पत्र भेजें"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">व्हाट्सएप</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-white text-orange-900 hover:bg-orange-50 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="प्रगति पत्र प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-orange-950/80 text-white transition-all cursor-pointer ml-0.5"
              title="बंद करें (Close)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Sheet - Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-6 print:p-0 print:overflow-visible">
          <div className="p-4 sm:p-6 text-stone-900 bg-white print:p-2 print-avoid-break" id="report-card-print">
          
          {/* Ornate Frame Border */}
          <div className="border-4 border-double border-orange-800 p-4 sm:p-5 rounded-2xl relative print:border-2 print:p-3 bg-white">
            
            {/* Top Motto Bar */}
            <div className="text-center pb-1.5 border-b border-orange-300 mb-2.5">
              <div className="flex items-center justify-between text-[9.5px] sm:text-[10px] font-bold text-orange-900 font-serif">
                <span>ॐ श्री सरस्वत्यै नमः</span>
                <span>विद्या भारती अखिल भारतीय शिक्षा संस्थान</span>
                <span>{currentSchool.tagline || 'सा विद्या या विमुक्तये'}</span>
              </div>
            </div>

            {/* School Header */}
            <div className="text-center mb-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 mx-auto mb-1 rounded-full bg-orange-700 text-white flex items-center justify-center text-base sm:text-lg shadow-xs">
                🪷
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-orange-950 font-serif tracking-tight">
                {currentSchool.hindiName || currentSchool.name}
              </h2>
              <p className="text-[10px] sm:text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                {currentSchool.name}
              </p>
              <p className="text-[9.5px] sm:text-[10px] text-stone-500 mt-0.5">
                {currentSchool.address} • {currentSchool.affiliate} • UDISE: {currentSchool.udiseCode || '09510100101'}
              </p>

              <div className="mt-2 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-0.5 sm:py-1 bg-orange-100 border border-orange-400 rounded-full text-[10.5px] sm:text-xs font-bold text-orange-950">
                <span>{activeLayout === 'hpc' ? '🎯 NEP 2020 समग्र प्रगति पत्र (360° HOLISTIC PROGRESS CARD)' : '📜 समग्र प्रगति पत्र (HOLISTIC PROGRESS REPORT)'}</span>
                <span>•</span>
                <span>सत्र: {reportCard.academicYear}</span>
                <span>•</span>
                <span>{reportCard.examTerm}</span>
              </div>
            </div>

            {/* Student Biodata with QR Code & Photo */}
            <div className="bg-amber-50/70 p-2.5 sm:p-3 rounded-xl border border-orange-200 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs mb-3 items-center">
              {/* Info Columns */}
              <div className="sm:col-span-3 grid grid-cols-2 gap-y-1 gap-x-2 text-[11px] sm:text-xs">
                <div>
                  <span className="text-stone-500 text-[10.5px]">नाम (Name): </span>
                  <span className="font-bold text-stone-900">{student.name}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10.5px]">अनुक्रमांक (Roll No): </span>
                  <span className="font-black font-mono text-orange-900">{student.rollNo}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10.5px]">कक्षा एवं वर्ग: </span>
                  <span className="font-bold text-stone-900">{student.class} '{student.section}'</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10.5px]">उपस्थिति (Attendance): </span>
                  <span className="font-bold text-orange-800">{reportCard.attendancePercentage}%</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10.5px]">पिता का नाम: </span>
                  <span className="font-bold text-stone-900">{student.fatherName}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10.5px]">माता का नाम: </span>
                  <span className="font-bold text-stone-900">{student.motherName || 'श्रीमती अभिभावक'}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10.5px]">PEN (शिक्षा संख्या): </span>
                  <span className="font-bold font-mono text-emerald-800">{student.pen || 'अप्राप्त'}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10.5px]">APAAR ID: </span>
                  <span className="font-bold font-mono text-purple-800">{student.apaarId || '9876-5432-1098'}</span>
                </div>
              </div>

              {/* Digital Verification QR */}
              <div className="flex flex-col items-center justify-center p-1 bg-white border border-stone-200 rounded-lg">
                <img
                  src={qrCodeUrl}
                  alt="Verification QR"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
                />
                <span className="text-[7px] sm:text-[7.5px] font-bold text-stone-500 mt-0.5 uppercase flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                  प्रमाणित पत्रक
                </span>
              </div>

              {/* Photo Box */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-lg border border-stone-300 flex items-center justify-center bg-stone-100 overflow-hidden shadow-2xs">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-1 text-[8px] text-stone-400 font-semibold">
                      <span className="text-base block">📸</span>
                      छात्र चित्र
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section A: Scholastic Evaluation */}
            <div className="mb-3">
              <div className="text-xs font-bold text-orange-950 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-600" />
                <span>भाग-क: विषयवार शैक्षणिक मूल्यांकन (Scholastic Evaluation)</span>
              </div>
              <div className="border border-stone-300 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-orange-800 text-white font-bold">
                    <tr>
                      <th className="p-1 sm:p-1.5 border border-stone-300 w-10 text-center">क्र.</th>
                      <th className="p-1 sm:p-1.5 border border-stone-300">विषय (Subjects)</th>
                      <th className="p-1 sm:p-1.5 border border-stone-300 w-20 sm:w-24 text-center">पूर्णांक (Max)</th>
                      <th className="p-1 sm:p-1.5 border border-stone-300 w-20 sm:w-24 text-center">प्राप्तांक (Obtained)</th>
                      <th className="p-1 sm:p-1.5 border border-stone-300 w-20 sm:w-24 text-center">श्रेणी (Grade)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-[11px] sm:text-xs">
                    {reportCard.marks.map((m, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}>
                        <td className="p-1 text-center border border-stone-200 text-stone-500 font-mono">{idx + 1}</td>
                        <td className="p-1 font-medium text-stone-800 border border-stone-200">{m.subject}</td>
                        <td className="p-1 text-center text-stone-600 border border-stone-200">{m.maxMarks}</td>
                        <td className="p-1 text-center font-bold text-stone-900 border border-stone-200">{m.marksObtained}</td>
                        <td className="p-1 text-center font-bold text-orange-700 border border-stone-200">{m.grade}</td>
                      </tr>
                    ))}
                    
                    {/* Total Row */}
                    <tr className="bg-amber-100/90 font-bold text-stone-950 border-t-2 border-stone-400 text-xs">
                      <td className="p-1 sm:p-1.5 text-center border border-stone-300" colSpan={2}>योग (Grand Total)</td>
                      <td className="p-1 sm:p-1.5 text-center border border-stone-300">{reportCard.totalMax}</td>
                      <td className="p-1 sm:p-1.5 text-center text-orange-950 font-black border border-stone-300">{reportCard.totalObtained}</td>
                      <td className="p-1 sm:p-1.5 text-center text-orange-900 border border-stone-300 font-black">{reportCard.percentage.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section B: Panchmukhi 360 Holistic Assessment Section */}
            <div className="mb-3 border border-orange-300 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 px-3 py-1 border-b border-orange-300 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-700" />
                  <span className="font-bold text-xs text-orange-950">
                    भाग-ख: पंचमुखी शिक्षा सर्वांगीण आयाम मूल्यांकन (Vidya Bharati Panchmukhi Dimensions)
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-orange-800 bg-white/90 px-2 py-0.5 rounded-full border border-orange-200">
                  पंचकोशात्मक विकास
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-amber-50/80 text-stone-800 border-b border-orange-200 font-semibold text-[10.5px]">
                    <tr>
                      <th className="p-1 border-r border-orange-200 w-8 text-center">क्र.</th>
                      <th className="p-1 border-r border-orange-200 w-40 sm:w-44">आयाम (Dimension)</th>
                      <th className="p-1 border-r border-orange-200 w-24 text-center">मूल्यांकन (Grade)</th>
                      <th className="p-1 border-r border-orange-200">कौशल एवं सहभागिता (Skills & Activities)</th>
                      <th className="p-1">आचार्य सम्मति (Observations)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100 text-[10px] sm:text-[10.5px]">
                    {panchmukhiList.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                        <td className="p-1 text-center border-r border-orange-100 text-stone-500 font-mono">{idx + 1}</td>
                        <td className="p-1 border-r border-orange-100 font-bold text-stone-900 flex items-center gap-1">
                          <span>{item.icon}</span>
                          <span>{item.name}</span>
                        </td>
                        <td className="p-1 border-r border-orange-100 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            item.grade === 'O' 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : item.grade === 'A+' 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}>
                            {item.grade} ({item.gradeText})
                          </span>
                        </td>
                        <td className="p-1 border-r border-orange-100 text-stone-700">{item.skills}</td>
                        <td className="p-1 text-stone-600 italic">{item.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* HPC Exclusive Sections: Part C & Part D */}
            {activeLayout === 'hpc' && (
              <>
                {/* Section C: 360° Multidimensional Stakeholder Evaluation */}
                <div className="mb-3 border border-orange-300 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 px-3 py-1 border-b border-orange-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-orange-800" />
                      <span className="font-bold text-xs text-orange-950">
                        भाग-ग: 360° बहु-आयामी सहभागिता एवं मूल्यांकन (Stakeholder Perspectives)
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-orange-800 bg-white/90 px-2 py-0.5 rounded-full border border-orange-200">
                      NEP 2020 §4.35
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-gradient-to-b from-stone-50/60 to-white">
                    {/* Perspective 1: Self Assessment */}
                    <div className="bg-white rounded-xl border border-blue-200 p-2.5 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 pb-1.5 border-b border-blue-100 text-blue-900 font-bold text-xs mb-2">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>🙋 स्व-मूल्यांकन (Self-Assessment)</span>
                        </div>
                        
                        <div className="space-y-1.5 text-[10.5px]">
                          <div>
                            <span className="text-stone-500 font-medium block">मेरी प्रमुख शक्तियां (Strengths):</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={selfAssessment.strengths}
                                onChange={e => setSelfAssessment({ ...selfAssessment, strengths: e.target.value })}
                                className="w-full text-xs font-semibold text-stone-800 border border-blue-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="font-semibold text-stone-800">{selfAssessment.strengths}</span>
                            )}
                          </div>

                          <div>
                            <span className="text-stone-500 font-medium block">मेरी अभिरुचियां (Interests):</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={selfAssessment.interests}
                                onChange={e => setSelfAssessment({ ...selfAssessment, interests: e.target.value })}
                                className="w-full text-xs font-semibold text-stone-800 border border-blue-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <span className="font-semibold text-stone-800">{selfAssessment.interests}</span>
                            )}
                          </div>

                          <div>
                            <span className="text-stone-500 font-medium block">सीखने का व्यक्तिगत लक्ष्य (Goals):</span>
                            {isEditing ? (
                              <textarea
                                value={selfAssessment.myGoals}
                                onChange={e => setSelfAssessment({ ...selfAssessment, myGoals: e.target.value })}
                                className="w-full text-xs font-medium text-stone-800 border border-blue-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500 resize-none"
                                rows={2}
                              />
                            ) : (
                              <span className="font-medium text-stone-800 italic">{selfAssessment.myGoals}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-blue-50 flex items-center justify-between text-[10px]">
                        <span className="text-stone-500">सीखने में आनंद:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={selfAssessment.learningEnjoyment}
                            onChange={e => setSelfAssessment({ ...selfAssessment, learningEnjoyment: e.target.value })}
                            className="text-[10px] font-bold text-blue-900 border border-blue-300 rounded px-1 py-0.5 w-32"
                          />
                        ) : (
                          <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            ⭐ {selfAssessment.learningEnjoyment}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Perspective 2: Peer Assessment */}
                    <div className="bg-white rounded-xl border border-emerald-200 p-2.5 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 pb-1.5 border-b border-emerald-100 text-emerald-900 font-bold text-xs mb-2">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>🤝 सहपाठी मूल्यांकन (Peer Assessment)</span>
                        </div>

                        <div className="space-y-1.5 text-[10.5px]">
                          <div>
                            <span className="text-stone-500 font-medium block">सहपाठी का नाम (Peer Name):</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={peerAssessment.peerName}
                                onChange={e => setPeerAssessment({ ...peerAssessment, peerName: e.target.value })}
                                className="w-full text-xs font-semibold text-stone-800 border border-emerald-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-emerald-500"
                              />
                            ) : (
                              <span className="font-semibold text-stone-800">{peerAssessment.peerName}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-stone-500 font-medium block">सहयोग (Teamwork):</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={peerAssessment.collaborationGrade}
                                  onChange={e => setPeerAssessment({ ...peerAssessment, collaborationGrade: e.target.value })}
                                  className="w-full text-xs font-bold text-emerald-800 border border-emerald-300 rounded px-1.5 py-0.5"
                                />
                              ) : (
                                <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                                  {peerAssessment.collaborationGrade}
                                </span>
                              )}
                            </div>

                            <div>
                              <span className="text-stone-500 font-medium block">समानुभूति (Empathy):</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={peerAssessment.empathyAndRespect}
                                  onChange={e => setPeerAssessment({ ...peerAssessment, empathyAndRespect: e.target.value })}
                                  className="w-full text-xs font-bold text-emerald-800 border border-emerald-300 rounded px-1.5 py-0.5"
                                />
                              ) : (
                                <span className="font-bold text-emerald-800">{peerAssessment.empathyAndRespect}</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <span className="text-stone-500 font-medium block">सहपाठी की सम्मति (Remarks):</span>
                            {isEditing ? (
                              <textarea
                                value={peerAssessment.teamworkRemarks}
                                onChange={e => setPeerAssessment({ ...peerAssessment, teamworkRemarks: e.target.value })}
                                className="w-full text-xs font-medium text-stone-800 border border-emerald-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-emerald-500 resize-none"
                                rows={2}
                              />
                            ) : (
                              <span className="font-medium text-stone-800 italic">{peerAssessment.teamworkRemarks}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-emerald-50 text-[9.5px] text-stone-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>सकारात्मक एवं मैत्रीपूर्ण सहकारिता</span>
                      </div>
                    </div>

                    {/* Perspective 3: Parent Observation */}
                    <div className="bg-white rounded-xl border border-purple-200 p-2.5 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 pb-1.5 border-b border-purple-100 text-purple-900 font-bold text-xs mb-2">
                          <Home className="w-3.5 h-3.5 text-purple-600" />
                          <span>👨‍👩‍👧 अभिभावक अवलोकन (Parent Feedback)</span>
                        </div>

                        <div className="space-y-1.5 text-[10.5px]">
                          <div>
                            <span className="text-stone-500 font-medium block">गृह दिनचर्या व अनुशासन (Discipline):</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={parentObservation.homeDiscipline}
                                onChange={e => setParentObservation({ ...parentObservation, homeDiscipline: e.target.value })}
                                className="w-full text-xs font-semibold text-stone-800 border border-purple-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-purple-500"
                              />
                            ) : (
                              <span className="font-semibold text-stone-800">{parentObservation.homeDiscipline}</span>
                            )}
                          </div>

                          <div>
                            <span className="text-stone-500 font-medium block">पठन-पाठन व जिज्ञासा (Reading):</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={parentObservation.curiosityAndReading}
                                onChange={e => setParentObservation({ ...parentObservation, curiosityAndReading: e.target.value })}
                                className="w-full text-xs font-semibold text-stone-800 border border-purple-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-purple-500"
                              />
                            ) : (
                              <span className="font-semibold text-stone-800">{parentObservation.curiosityAndReading}</span>
                            )}
                          </div>

                          <div>
                            <span className="text-stone-500 font-medium block">अभिभावक सम्मति (Parent Remarks):</span>
                            {isEditing ? (
                              <textarea
                                value={parentObservation.parentRemarks}
                                onChange={e => setParentObservation({ ...parentObservation, parentRemarks: e.target.value })}
                                className="w-full text-xs font-medium text-stone-800 border border-purple-300 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-purple-500 resize-none"
                                rows={2}
                              />
                            ) : (
                              <span className="font-medium text-stone-800 italic">{parentObservation.parentRemarks}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-purple-50 text-[9.5px] text-stone-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>घर एवं विद्यालय का समन्वय</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section D: 21st Century Skills Matrix */}
                <div className="mb-3 border border-orange-300 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 px-3 py-1 border-b border-orange-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-orange-800" />
                      <span className="font-bold text-xs text-orange-950">
                        भाग-घ: 21वीं सदी के जीवन कौशल मैट्रिक्स (21st Century Skills Matrix - PARAKH Framework)
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold text-orange-800 bg-white/90 px-2 py-0.5 rounded-full border border-orange-200">
                      5 प्रमुख क्षमताएं
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {skillConfig.map(skill => {
                        const skillData = twentyFirstCenturySkills[skill.key];
                        const badge = skillGradeBadges[skillData.grade] || skillGradeBadges['A+'];

                        return (
                          <div
                            key={skill.key}
                            className="bg-stone-50/70 border border-stone-200 rounded-xl p-2 flex flex-col justify-between hover:bg-amber-50/30 transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                {skill.icon}
                                <span className="font-bold text-[10.5px] text-stone-900 leading-tight">
                                  {skill.name.split(' (')[0]}
                                </span>
                              </div>
                              <p className="text-[8.5px] text-stone-500 mb-2 leading-snug">
                                {skill.desc}
                              </p>
                            </div>

                            <div>
                              {isEditing ? (
                                <div className="space-y-1">
                                  <select
                                    value={skillData.grade}
                                    onChange={e => {
                                      setTwentyFirstCenturySkills({
                                        ...twentyFirstCenturySkills,
                                        [skill.key]: {
                                          ...skillData,
                                          grade: e.target.value
                                        }
                                      });
                                    }}
                                    className="w-full text-[9.5px] font-bold border border-stone-300 rounded p-1"
                                  >
                                    <option value="O">O (सर्वोच्च - Outstanding)</option>
                                    <option value="A+">A+ (उत्कृष्ट - Excellent)</option>
                                    <option value="A">A (अति उत्तम - Very Good)</option>
                                    <option value="B">B (संतोषजनक - Good)</option>
                                  </select>
                                  <input
                                    type="text"
                                    placeholder="टिप्पणी"
                                    value={skillData.descriptor || ''}
                                    onChange={e => {
                                      setTwentyFirstCenturySkills({
                                        ...twentyFirstCenturySkills,
                                        [skill.key]: {
                                          ...skillData,
                                          descriptor: e.target.value
                                        }
                                      });
                                    }}
                                    className="w-full text-[9px] border border-stone-300 rounded px-1 py-0.5"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <span className={`inline-block w-full text-center px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                    {badge.label}
                                  </span>
                                  {skillData.descriptor && (
                                    <p className="text-[8.5px] text-stone-600 italic mt-1 text-center line-clamp-2">
                                      "{skillData.descriptor}"
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Performance Summary & Panchmukhi Value Appraisal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
              
              {/* Overall Grade & Percentage with Division Ribbon */}
              <div className="bg-orange-50/60 p-2.5 sm:p-3 rounded-xl border border-orange-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 font-medium">सत्र परीक्षा परिणाम (Result):</span>
                  <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px]">
                    {division}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">कुल प्राप्तांक एवं प्रतिशत:</span>
                  <span className="font-bold text-orange-950 text-sm">
                    {reportCard.totalObtained} / {reportCard.totalMax} ({reportCard.percentage.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">अंतिम श्रेणी (Final Grade):</span>
                  <span className="font-bold text-stone-900">{reportCard.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">संस्कार एवं आचरण (Moral Conduct):</span>
                  <span className="font-bold text-green-700">{reportCard.moralConduct}</span>
                </div>
              </div>

              {/* Acharya Remarks with Voice Input & Edit */}
              <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-stone-200 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-800">
                      कक्षाचार्य सम्मति (Acharya Remarks):
                    </span>
                    <div className="flex items-center gap-1.5 no-print">
                      <button
                        type="button"
                        disabled={isGeneratingRemarks}
                        onClick={handleGenerateSmartRemarks}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition cursor-pointer disabled:opacity-50"
                        title="१-क्लिक में छात्र के अनुसार व्यक्तिगत बौद्धिक सम्मति तैयार करें"
                      >
                        <Sparkles className={`w-3 h-3 text-amber-800 ${isGeneratingRemarks ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingRemarks ? 'तैयार हो रहा है...' : '✨ बौद्धिक टिप्पणी'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={startVoiceDictation}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 hover:bg-orange-200 text-orange-900'
                        }`}
                        title="बोलकर टिप्पणी दर्ज करें (Hindi Voice-to-Text)"
                      >
                        <Mic className="w-3 h-3" />
                        <span>{isListening ? 'सुन रहे हैं...' : 'बोलकर लिखें'}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={currentRemarks}
                    onChange={(e) => setCurrentRemarks(e.target.value)}
                    className="w-full text-stone-700 italic leading-relaxed border focus:ring-1 focus:ring-orange-400 rounded p-1 text-xs resize-none bg-stone-50/50 print:bg-transparent print:border-none print:p-0 print:resize-none"
                    rows={2}
                    placeholder="कक्षाचार्य जी की विशिष्ट सम्मति एवं मार्गदर्शन..."
                  />
                </div>
                <div className="no-print text-right pt-1">
                  <span className="text-[9.5px] text-stone-400">माइक दबाकर हिंदी में बोलें अथवा टाइप करें</span>
                </div>
              </div>

            </div>

            {/* Signatures with Circular School Seal */}
            <div className={`pt-4 text-center text-xs text-stone-700 border-t border-stone-300 items-end grid ${
              activeLayout === 'hpc' ? 'grid-cols-5 gap-1.5' : 'grid-cols-4 gap-2'
            }`}>
              {/* Class Teacher */}
              <div className="space-y-3">
                <div className="h-3" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold text-[10px] sm:text-[10.5px]">
                  हस्ताक्षर कक्षाचार्य
                  <span className="block text-[8px] sm:text-[8.5px] text-stone-400 font-normal">Class Teacher</span>
                </div>
              </div>

              {/* Peer Reviewer (Only in HPC layout) */}
              {activeLayout === 'hpc' && (
                <div className="space-y-3">
                  <div className="h-3" />
                  <div className="border-t border-dashed border-stone-400 pt-1 font-semibold text-[10px] sm:text-[10.5px]">
                    हस्ताक्षर सहपाठी
                    <span className="block text-[8px] sm:text-[8.5px] text-stone-400 font-normal">Peer Reviewer</span>
                  </div>
                </div>
              )}

              {/* Parent */}
              <div className="space-y-3">
                <div className="h-3" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold text-[10px] sm:text-[10.5px]">
                  हस्ताक्षर अभिभावक
                  <span className="block text-[8px] sm:text-[8.5px] text-stone-400 font-normal">Parent / Guardian</span>
                </div>
              </div>

              {/* Official Seal Stamp */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-orange-800/70 flex flex-col items-center justify-center text-center p-1 text-orange-950 select-none bg-orange-50/40">
                  <span className="text-[5.5px] sm:text-[6px] font-bold uppercase tracking-wider">सरस्वती शिशु मंदिर</span>
                  <span className="text-xs my-0.5">🪷</span>
                  <span className="text-[5.5px] sm:text-[6px] font-bold uppercase">विद्यालय मुहर • SEAL</span>
                </div>
              </div>

              {/* Principal */}
              <div className="space-y-3">
                <div className="h-3" />
                <div className="border-t border-dashed border-stone-400 pt-1 font-semibold text-[10px] sm:text-[10.5px]">
                  <span className="block text-stone-900 font-bold">{currentSchool.principalName || 'प्रधानाचार्य'}</span>
                  हस्ताक्षर प्रधानाचार्य
                  <span className="block text-[8px] sm:text-[8.5px] text-stone-400 font-normal">Principal Stamp & Sign</span>
                </div>
              </div>
            </div>

          </div>

        </div>
        </div>

      </div>
    </div>
  );
};

export default PragatiPatraModal;
