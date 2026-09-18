import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Student } from '../../types';
import type { AdminTab } from '../admin/tabs/types';
import {
  Search,
  X,
  User,
  CreditCard,
  Award,
  IdCard,
  Edit3,
  Calendar,
  Users,
  FileSpreadsheet,
  Bus,
  BookOpen,
  Package,
  Bell,
  Settings,
  PlusCircle,
  FileUp,
  Download,
  Scroll,
  Table,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft
} from 'lucide-react';

export interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onNavigateTab: (tab: AdminTab) => void;
  onSelectStudentAction: (action: 'fee' | 'report' | 'idcard' | 'edit', student: Student) => void;
  onTriggerQuickAction: (actionKey: string) => void;
}

interface PaletteAction {
  id: string;
  category: 'quick-action' | 'navigation';
  title: string;
  hindiTitle: string;
  subtitle: string;
  icon: React.ReactNode;
  keywords: string[];
  execute: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  students,
  onNavigateTab,
  onSelectStudentAction,
  onTriggerQuickAction
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // System navigation items
  const navigationItems: PaletteAction[] = useMemo(() => [
    {
      id: 'tab-overview',
      category: 'navigation',
      title: 'Dashboard Overview',
      hindiTitle: 'नियंत्रण पटल अवलोकन (Dashboard Overview)',
      subtitle: 'विद्यार्थी संख्या, दैनिक उपस्थिति, शुल्क वसूली व सांख्यिकी सारांश',
      icon: <Sparkles className="w-4 h-4 text-orange-600" />,
      keywords: ['dashboard', 'overview', 'summary', 'डैशबोर्ड', 'अवलोकन', 'सारांश'],
      execute: () => onNavigateTab('overview')
    },
    {
      id: 'tab-students',
      category: 'navigation',
      title: 'Student Directory',
      hindiTitle: 'छात्र पंजिका (Student Directory)',
      subtitle: 'समस्त विद्यार्थियों की सूची, प्रोफाइल, एवं विवरण',
      icon: <Users className="w-4 h-4 text-blue-600" />,
      keywords: ['students', 'directory', 'list', 'छात्र', 'पंजिका', 'विद्यार्थी', 'सूची'],
      execute: () => onNavigateTab('students')
    },
    {
      id: 'tab-attendance',
      category: 'navigation',
      title: 'Daily Attendance',
      hindiTitle: 'दैनिक उपस्थिति (Daily Attendance)',
      subtitle: 'कक्षावार दैनिक हाजिरी एवं अनुपस्थित एसएमएस/व्हाट्सएप अलर्ट',
      icon: <Calendar className="w-4 h-4 text-emerald-600" />,
      keywords: ['attendance', 'present', 'absent', 'उपस्थिति', 'हाजिरी', 'गैरहाजिर'],
      execute: () => onNavigateTab('attendance')
    },
    {
      id: 'tab-fees',
      category: 'navigation',
      title: 'Fee Counter & Receipts',
      hindiTitle: 'शुल्क काउंटर एवं रसीदें (Fee Counter)',
      subtitle: 'शुल्क जमा, बकाया सूची, ऑनलाइन UPI भुगतान एवं रसीद मुद्रण',
      icon: <CreditCard className="w-4 h-4 text-purple-600" />,
      keywords: ['fee', 'fees', 'receipt', 'payment', 'शुल्क', 'फीस', 'रसीद', 'भुगतान', 'बकाया'],
      execute: () => onNavigateTab('fees')
    },
    {
      id: 'tab-reports',
      category: 'navigation',
      title: 'NEP 2020 360 HPC Reports',
      hindiTitle: 'परीक्षा एवं 360° समग्र प्रगति पत्र (HPC Reports)',
      subtitle: 'NEP 2020 बहुआयामी प्रगति पत्र, पंचमुखी शिक्षा, व अंकतालिका',
      icon: <Award className="w-4 h-4 text-amber-600" />,
      keywords: ['report', 'card', 'marks', 'hpc', 'nep', 'प्रगति', 'पत्र', 'अंकतालिका', 'परीक्षा', 'रिजल्ट'],
      execute: () => onNavigateTab('reports')
    },
    {
      id: 'tab-homework',
      category: 'navigation',
      title: 'Daily Homework',
      hindiTitle: 'दैनिक गृहकार्य पंजिका (Homework)',
      subtitle: 'कक्षावार दैनिक गृहकार्य एवं स्वाध्याय कार्य',
      icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
      keywords: ['homework', 'dairy', 'गृहकार्य', 'काम', 'होमवर्क'],
      execute: () => onNavigateTab('homework')
    },
    {
      id: 'tab-staff',
      category: 'navigation',
      title: 'Staff & Acharya Directory',
      hindiTitle: 'आचार्य एवं कर्मचारी पंजिका (Staff & Payroll)',
      subtitle: 'आचार्य विवरण, विषय आवंटन एवं मासिक वेतन पर्ची',
      icon: <Users className="w-4 h-4 text-orange-600" />,
      keywords: ['staff', 'acharya', 'teacher', 'payroll', 'आचार्य', 'कर्मचारी', 'वेतन'],
      execute: () => onNavigateTab('staff')
    },
    {
      id: 'tab-notices',
      category: 'navigation',
      title: 'Notices & Circulars',
      hindiTitle: 'सूचना पट्ट एवं परिपत्र (Notices)',
      subtitle: 'विद्यालय परिपत्र, अवकाश घोषणा एवं आवश्यक सूचनाएं',
      icon: <Bell className="w-4 h-4 text-rose-600" />,
      keywords: ['notice', 'circular', 'announcement', 'सूचना', 'परिपत्र', 'अवकाश'],
      execute: () => onNavigateTab('notices')
    }
  ], [onNavigateTab]);

  // Quick Action triggers
  const quickActions: PaletteAction[] = useMemo(() => [
    {
      id: 'action-add-student',
      category: 'quick-action',
      title: 'Add New Student Admission',
      hindiTitle: '➕ नया छात्र प्रवेश (New Admission)',
      subtitle: 'नए विद्यार्थी का प्रवेश फॉर्म खोलें (Admission Form)',
      icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
      keywords: ['add', 'student', 'new', 'admission', 'प्रवेश', 'नया', 'दाखिला'],
      execute: () => onTriggerQuickAction('add-student')
    },
    {
      id: 'action-bulk-import',
      category: 'quick-action',
      title: 'Bulk Excel Student Import',
      hindiTitle: '📥 एक्सेल से छात्र आयात (Bulk Import)',
      subtitle: 'Excel/CSV फ़ाइल से पूरी कक्षा के छात्रों का एक साथ आयात',
      icon: <FileUp className="w-4 h-4 text-blue-600" />,
      keywords: ['import', 'excel', 'csv', 'bulk', 'आयात', 'एक्सेल'],
      execute: () => onTriggerQuickAction('bulk-import')
    },
    {
      id: 'action-dakhil-kharij',
      category: 'quick-action',
      title: 'Dakhil Kharij S.R. Register',
      hindiTitle: '📜 दाखिल-खारिज पंजिका (S.R. Register)',
      subtitle: 'आधिकारिक छात्र प्रवेश-निकासी पंजिका मुद्रण एवं खोज',
      icon: <Scroll className="w-4 h-4 text-amber-700" />,
      keywords: ['dakhil', 'kharij', 'sr', 'register', 'दाखिल', 'खारिज', 'पंजिका'],
      execute: () => onTriggerQuickAction('dakhil-kharij')
    },
    {
      id: 'action-tabulation',
      category: 'quick-action',
      title: 'Tabulation Register TR Sheet',
      hindiTitle: '📋 टेबुलेशन रजिस्टर (TR Sheet)',
      subtitle: 'कक्षावार वार्षिक एवं अर्धवार्षिक परीक्षा टेबुलेशन गजट',
      icon: <Table className="w-4 h-4 text-indigo-600" />,
      keywords: ['tabulation', 'tr', 'sheet', 'gazette', 'टेबुलेशन', 'रजिस्टर'],
      execute: () => onTriggerQuickAction('tabulation')
    },
    {
      id: 'action-bulk-id',
      category: 'quick-action',
      title: 'Bulk Student ID Cards',
      hindiTitle: '🖨️ परिचय पत्र बल्क प्रिंट (ID Cards)',
      subtitle: 'संपूर्ण कक्षा के पहचान पत्र एक क्लिक में A4 ग्रिड पर प्रिंट करें',
      icon: <IdCard className="w-4 h-4 text-purple-600" />,
      keywords: ['id', 'card', 'identity', 'परिचय', 'पहचान', 'आईडी'],
      execute: () => onTriggerQuickAction('bulk-id-card')
    },
    {
      id: 'action-settings',
      category: 'quick-action',
      title: 'School Branch Settings',
      hindiTitle: '⚙️ शाखा सुविधा सेटिंग्स (Settings)',
      subtitle: 'डायनामिक UPI QR, LOP वेतन कटौती एवं विद्यालय जानकारी',
      icon: <Settings className="w-4 h-4 text-stone-600" />,
      keywords: ['settings', 'config', 'upi', 'lop', 'सेटिंग्स', 'सुविधा'],
      execute: () => onTriggerQuickAction('school-settings')
    },
    {
      id: 'action-transport',
      category: 'quick-action',
      title: 'Transport Management',
      hindiTitle: '🚌 वाहन एवं बस रूट प्रबंधन (Transport)',
      subtitle: 'स्कूल बस रूट, स्टॉप, वाहन चालक एवं किराया प्रबंधन',
      icon: <Bus className="w-4 h-4 text-yellow-600" />,
      keywords: ['transport', 'bus', 'route', 'वाहन', 'बस', 'रूट', 'गाड़ी'],
      execute: () => onTriggerQuickAction('transport')
    },
    {
      id: 'action-library',
      category: 'quick-action',
      title: 'Library Management',
      hindiTitle: '📚 पुस्तकालय प्रबंधन (Library System)',
      subtitle: 'पुस्तक सूची, पुस्तक निर्गमन व वापसी पंजिका',
      icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
      keywords: ['library', 'books', 'issue', 'पुस्तकालय', 'किताबें', 'पुस्तक'],
      execute: () => onTriggerQuickAction('library')
    },
    {
      id: 'action-inventory',
      category: 'quick-action',
      title: 'Inventory & Uniform Store',
      hindiTitle: '📦 भंडार एवं गणवेश स्टॉक (Inventory)',
      subtitle: 'विद्यालय सामग्री, गणवेश (यूनिफॉर्म) एवं स्टॉक लेखा',
      icon: <Package className="w-4 h-4 text-teal-600" />,
      keywords: ['inventory', 'store', 'uniform', 'stock', 'भंडार', 'स्टॉक', 'गणवेश', 'यूनिफॉर्म'],
      execute: () => onTriggerQuickAction('inventory')
    },
    {
      id: 'action-backup',
      category: 'quick-action',
      title: 'Download School Backup',
      hindiTitle: '💾 संपूर्ण विद्यालय डेटा बैकअप (JSON)',
      subtitle: 'सभी छात्रों, शुल्कों एवं उपस्थिति का सुरक्षित स्थानीय बैकअप',
      icon: <Download className="w-4 h-4 text-green-600" />,
      keywords: ['backup', 'export', 'download', 'बैकअप', 'डाउनलोड'],
      execute: () => onTriggerQuickAction('backup-download')
    }
  ], [onTriggerQuickAction]);

  // Filtered Students (up to 6)
  const matchedStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter(s => {
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.class.toLowerCase().includes(q) ||
          s.fatherName.toLowerCase().includes(q) ||
          (s.contact && s.contact.includes(q)) ||
          (s.pen && s.pen.includes(q)) ||
          (s.apaarId && s.apaarId.includes(q))
        );
      })
      .slice(0, 6);
  }, [students, query]);

  // Filtered Quick Actions
  const matchedActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickActions.slice(0, 4);
    return quickActions.filter(a => {
      return (
        a.title.toLowerCase().includes(q) ||
        a.hindiTitle.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.keywords.some(k => k.includes(q))
      );
    });
  }, [quickActions, query]);

  // Filtered Navigation
  const matchedNavigation = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navigationItems.slice(0, 5);
    return navigationItems.filter(n => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.hindiTitle.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.keywords.some(k => k.includes(q))
      );
    });
  }, [navigationItems, query]);

  // Unified list of selectable items for arrow key navigation
  const selectableItemsCount = matchedStudents.length + matchedActions.length + matchedNavigation.length;

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, selectableItemsCount));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + selectableItemsCount) % Math.max(1, selectableItemsCount));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSelectedItem();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeSelectedItem = () => {
    let cursor = 0;
    // Check if within matched students
    if (selectedIndex < matchedStudents.length) {
      const student = matchedStudents[selectedIndex];
      onSelectStudentAction('fee', student);
      onClose();
      return;
    }
    cursor += matchedStudents.length;

    // Check if within matched actions
    if (selectedIndex < cursor + matchedActions.length) {
      const action = matchedActions[selectedIndex - cursor];
      action.execute();
      onClose();
      return;
    }
    cursor += matchedActions.length;

    // Check if within matched navigation
    if (selectedIndex < cursor + matchedNavigation.length) {
      const nav = matchedNavigation[selectedIndex - cursor];
      nav.execute();
      onClose();
      return;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-start justify-center pt-10 sm:pt-20 p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-orange-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-orange-100 flex items-center px-4 py-3 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/50">
          <Search className="w-5 h-5 text-orange-600 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="छात्र का नाम, रोल नंबर, शुल्क, उपस्थिति, या कार्य खोजें... (Ctrl + K)"
            className="w-full text-sm sm:text-base font-medium text-stone-900 placeholder-stone-400 bg-transparent border-none focus:outline-none focus:ring-0"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-stone-100 text-stone-600 rounded border border-stone-200">
                Esc
              </kbd>
            </div>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto flex-1 p-2 sm:p-3 divide-y divide-stone-100 space-y-3">
          
          {/* Section 1: Matched Students */}
          {matchedStudents.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-orange-900 tracking-wide uppercase">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  <span>छात्र परिणाम ({matchedStudents.length})</span>
                </span>
                <span className="text-[10px] text-stone-400 font-normal">त्वरित एक्शन चुनें</span>
              </div>

              <div className="space-y-1 mt-1">
                {matchedStudents.map((student, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={student.id}
                      className={`p-2 rounded-xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 border cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 border-orange-300 shadow-xs ring-1 ring-orange-400/40'
                          : 'bg-white hover:bg-stone-50 border-stone-200/80'
                      }`}
                      onClick={() => {
                        onSelectStudentAction('fee', student);
                        onClose();
                      }}
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-sm shrink-0 font-bold text-orange-900">
                          {student.gender === 'Bahin' ? '👧' : '👦'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                              {student.name}
                            </span>
                            <span className="px-1.5 py-0.2 text-[10px] font-black font-mono rounded bg-orange-100 text-orange-950 border border-orange-200">
                              रोल: {student.rollNo}
                            </span>
                            <span className="px-1.5 py-0.2 text-[10px] font-semibold rounded bg-stone-100 text-stone-700">
                              {student.class} '{student.section}'
                            </span>
                          </div>
                          <div className="text-[10.5px] text-stone-500 truncate">
                            पिता: {student.fatherName} • 📞 {student.contact}
                          </div>
                        </div>
                      </div>

                      {/* 1-Click Quick Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStudentAction('fee', student);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-bold border border-purple-200 flex items-center gap-1 transition shadow-2xs cursor-pointer"
                          title="शुल्क रसीद काटें"
                        >
                          <CreditCard className="w-3 h-3 text-purple-600" />
                          <span>शुल्क</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectStudentAction('report', student);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 flex items-center gap-1 transition shadow-2xs cursor-pointer"
                          title="360° समग्र प्रगति पत्र खोलें"
                        >
                          <Award className="w-3 h-3 text-amber-700" />
                          <span>HPC</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectStudentAction('idcard', student);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 flex items-center gap-1 transition shadow-2xs cursor-pointer"
                          title="परिचय पत्र देखें"
                        >
                          <IdCard className="w-3 h-3 text-blue-600" />
                          <span>कार्ड</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectStudentAction('edit', student);
                            onClose();
                          }}
                          className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition cursor-pointer"
                          title="छात्र विवरण संपादित करें"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Quick Actions */}
          {matchedActions.length > 0 && (
            <div className="pt-2">
              <div className="px-2 py-1 text-[11px] font-bold text-stone-700 tracking-wide uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>त्वरित कार्य (Quick Actions)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {matchedActions.map((action, idx) => {
                  const itemIndex = matchedStudents.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={action.id}
                      onClick={() => {
                        action.execute();
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl border transition flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-400/40'
                          : 'bg-white hover:bg-stone-50 border-stone-200/80'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-stone-100 shrink-0">
                        {action.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-stone-900 truncate">
                          {action.hindiTitle}
                        </div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">
                          {action.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Navigation Tabs */}
          {matchedNavigation.length > 0 && (
            <div className="pt-2">
              <div className="px-2 py-1 text-[11px] font-bold text-stone-700 tracking-wide uppercase flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                <span>मॉड्यूल एवं नेविगेशन (Modules & Navigation)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                {matchedNavigation.map((nav, idx) => {
                  const itemIndex = matchedStudents.length + matchedActions.length + idx;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={nav.id}
                      onClick={() => {
                        nav.execute();
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl border transition flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-400/40'
                          : 'bg-white hover:bg-stone-50 border-stone-200/80'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-stone-100 shrink-0">
                        {nav.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-stone-900 truncate">
                          {nav.hindiTitle}
                        </div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">
                          {nav.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state when search yields nothing */}
          {query && selectableItemsCount === 0 && (
            <div className="text-center py-8 px-4">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-xs sm:text-sm font-bold text-stone-800">
                "{query}" के लिए कोई परिणाम नहीं मिला
              </p>
              <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto">
                कृपया छात्र का नाम, रोल नंबर, पिता का नाम, अथवा किसी मॉड्यूल का नाम टाइप करके देखें।
              </p>
            </div>
          )}

        </div>

        {/* Footer Bar with Keyboard Shortcuts */}
        <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[10.5px] text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-white text-stone-700 rounded border border-stone-300">↑</kbd>
              <kbd className="px-1.5 py-0.5 font-mono bg-white text-stone-700 rounded border border-stone-300">↓</kbd>
              <span>चयन</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-white text-stone-700 rounded border border-stone-300">↵</kbd>
              <span>खोलें</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 font-mono bg-white text-stone-700 rounded border border-stone-300">Esc</kbd>
              <span>बंद</span>
            </span>
          </div>
          <div className="font-bold text-orange-950 flex items-center gap-1">
            <Command className="w-3 h-3 text-orange-600" />
            <span>SSM Spotlight</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CommandPaletteModal;
