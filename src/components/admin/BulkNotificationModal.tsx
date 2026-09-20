import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { X, Send, MessageSquare, Sparkles, Mic, RefreshCw } from 'lucide-react';
import { formatWhatsAppPhone } from '../../utils/whatsappAlerts';
import { generateSmartJSON } from '../../services/aiService';
import { createSpeechRecognitionInstance, isSpeechRecognitionSupported } from '../../utils/speechRecognition';

interface BulkNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkNotificationModal: React.FC<BulkNotificationModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool, students, attendanceRecords, feeRecords } = useSchool();
  const [broadcastType, setBroadcastType] = useState<'absent' | 'fees' | 'general'>('absent');
  const [customTitle, setCustomTitle] = useState('विद्यालय आवश्यक सूचना');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Smart Message Drafter State
  const [smartBrief, setSmartBrief] = useState('');
  const [isDraftingMsg, setIsDraftingMsg] = useState(false);
  const [isListeningMsg, setIsListeningMsg] = useState(false);

  const startVoiceForMsg = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('ब्राउज़र में आवाज़ पहचान (Voice Input) समर्थित नहीं है।');
      return;
    }
    const recognition = createSpeechRecognitionInstance({
      lang: 'hi-IN',
      onStart: () => setIsListeningMsg(true),
      onResult: (transcript) => {
        setSmartBrief(transcript);
        setIsListeningMsg(false);
        handleDraftSmartMsg(transcript);
      },
      onError: () => setIsListeningMsg(false),
      onEnd: () => setIsListeningMsg(false)
    });
    if (recognition) {
      try {
        recognition.start();
      } catch {
        setIsListeningMsg(false);
      }
    }
  };

  const handleDraftSmartMsg = async (overrideBrief?: string) => {
    const brief = (overrideBrief || smartBrief).trim();
    if (!brief) return;
    setIsDraftingMsg(true);

    const fallbackDraft = (b: string) => {
      const schoolHindi = currentSchool.hindiName || currentSchool.name;
      return {
        title: `${b} सूचना`,
        message: `सादर प्रणाम,\n\n${schoolHindi} के समस्त आदरणीय अभिभावकों को सूचित किया जाता है कि ${b}।\n\nकृपया इस सूचना का संज्ञान लें एवं आवश्यक सहयोग प्रदान करें। किसी भी जिज्ञासा हेतु विद्यालय कार्यालय से संपर्क करें।\n\n— प्रधानाचार्य कार्यालय`
      };
    };

    try {
      const schoolHindi = currentSchool.hindiName || currentSchool.name;
      const prompt = `You are writing a polite, respectful WhatsApp message from ${schoolHindi} (Vidya Bharati school) to parents based on: "${brief}".
Output strictly valid JSON:
{
  "title": "Short Hindi title",
  "message": "Polite, formal Hindi WhatsApp message with salutation 'सादर प्रणाम', brief details, and closing '— प्रधानाचार्य कार्यालय'"
}`;

      const parsed = await generateSmartJSON<{ title?: string; message?: string }>(prompt, {
        temperature: 0.2
      });

      if (parsed.title && parsed.message) {
        setCustomTitle(parsed.title);
        setCustomMessage(parsed.message);
      } else {
        const d = fallbackDraft(brief);
        setCustomTitle(d.title);
        setCustomMessage(d.message);
      }
    } catch {
      const d = fallbackDraft(brief);
      setCustomTitle(d.title);
      setCustomMessage(d.message);
    } finally {
      setIsDraftingMsg(false);
    }
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  // Absent students for today
  const absentStudentIds = attendanceRecords
    .filter(a => a.date === today && a.status === 'Absent')
    .map(a => a.studentId);
  const absentStudents = students.filter(s => absentStudentIds.includes(s.id));

  // Fee pending students
  const pendingFeeStudentIds = feeRecords
    .filter(f => f.status === 'Pending')
    .map(f => f.studentId);
  const feePendingStudents = students.filter(s => pendingFeeStudentIds.includes(s.id));

  const targetStudents = (
    broadcastType === 'absent' ? absentStudents :
    broadcastType === 'fees' ? feePendingStudents :
    students
  ).filter(s => selectedClass === 'all' || s.class === selectedClass);

  const handleLaunchWhatsApp = (student: typeof students[0]) => {
    let msg = '';
    if (broadcastType === 'absent') {
      msg = `सादर प्रणाम जी,\n\nसूचित किया जाता है कि आपका पाल्य/पाल्या *${student.name}* (${student.class}, अनुक्रमांक ${student.rollNo}) आज दिनांक *${today}* को *${currentSchool.hindiName}* में अनुपस्थित है।\n\nकृपया अनुपस्थिति का कारण विद्यालय डायरी अथवा संपर्क द्वारा सूचित करें।\n\n- प्रधानाचार्य\n${currentSchool.hindiName}`;
    } else if (broadcastType === 'fees') {
      msg = `सादर प्रणाम जी,\n\n*${currentSchool.hindiName}* द्वारा स्मरण कराया जाता है कि विद्यार्थी *${student.name}* (${student.class}, अनुक्रमांक ${student.rollNo}) का सत्र शुल्क अभी लंबित है।\n\nकृपया असुविधा से बचने हेतु समय पर विद्यालय कार्यालय में शुल्क जमा कराएं।\n\n- कार्यालय, ${currentSchool.hindiName}`;
    } else {
      msg = `सादर प्रणाम जी,\n\n*${currentSchool.hindiName}*\n\n📢 *${customTitle}*\n\n${customMessage}\n\n- प्रधानाचार्य कार्यालय`;
    }

    const phone = formatWhatsAppPhone(student.contact);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                अभिभावक संदेश प्रसारण (WhatsApp / SMS Notification Broadcaster)
              </h3>
              <p className="text-xs text-stone-500">
                {currentSchool.hindiName} • अनुपस्थिति, शुल्क व आपातकालीन सूचना प्रसारण
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Broadcast Type Selector */}
        <div className="py-3 grid grid-cols-3 gap-2 border-b border-stone-100 shrink-0 text-xs font-bold">
          <button
            onClick={() => setBroadcastType('absent')}
            className={`p-2.5 rounded-xl border transition text-center ${
              broadcastType === 'absent'
                ? 'bg-red-50 border-red-300 text-red-800 shadow-xs'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="block text-sm">🚨</span>
            <span>आज अनुपस्थित ({absentStudents.length})</span>
          </button>
          <button
            onClick={() => setBroadcastType('fees')}
            className={`p-2.5 rounded-xl border transition text-center ${
              broadcastType === 'fees'
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="block text-sm">💳</span>
            <span>शुल्क स्मरण पत्र ({feePendingStudents.length})</span>
          </button>
          <button
            onClick={() => setBroadcastType('general')}
            className={`p-2.5 rounded-xl border transition text-center ${
              broadcastType === 'general'
                ? 'bg-orange-50 border-orange-300 text-orange-900 shadow-xs'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span className="block text-sm">📢</span>
            <span>सामान्य घोषणा / अवकाश</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {broadcastType === 'general' && (
            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              {/* Smart Message Drafter Bar */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>बौद्धिक संदेश लेखक (बोलें या २ शब्द लिखें)</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium">१-क्लिक विनम्र ड्राफ्ट</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={smartBrief}
                    onChange={e => setSmartBrief(e.target.value)}
                    placeholder="उदा. कल भारी वर्षा के कारण अवकाश, या रविवार मातृ सम्मेलन..."
                    className="flex-1 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={startVoiceForMsg}
                    className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                      isListeningMsg
                        ? 'bg-red-600 text-white animate-pulse border-red-700'
                        : 'bg-white text-stone-600 hover:text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title="बोलकर संदेश का विषय बताएं"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isDraftingMsg || !smartBrief.trim()}
                    onClick={() => handleDraftSmartMsg()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0 flex items-center gap-1"
                    title="विनम्र हिंदी संदेश तैयार करें"
                  >
                    {isDraftingMsg ? (
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
                <label className="block font-bold text-stone-700 mb-1">संदेश शीर्षक</label>
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">संदेश विवरण</label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="अभिभावकों हेतु घोषणा या अवकाश की सूचना यहाँ लिखें..."
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-700">
              लक्षित अभिभावक सूची ({targetStudents.length} विद्यार्थी):
            </span>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-stone-300 bg-stone-50 font-bold"
            >
              <option value="all">सभी कक्षाएं</option>
              {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {targetStudents.length === 0 ? (
              <p className="text-center text-stone-400 py-8">
                इस श्रेणी में कोई लक्षित विद्यार्थी नहीं मिले।
              </p>
            ) : (
              targetStudents.map(st => (
                <div key={st.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-stone-900 block">{st.name}</span>
                    <span className="text-[11px] text-stone-500">
                      {st.class} ({st.rollNo}) • संपर्क: {st.contact}
                    </span>
                  </div>

                  <button
                    onClick={() => handleLaunchWhatsApp(st)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-xs transition"
                  >
                    <span>व्हाट्सएप संदेश भेजें</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
