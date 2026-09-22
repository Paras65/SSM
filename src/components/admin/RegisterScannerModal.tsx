import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { SSM_CLASSES, type Gender, type Student } from '../../types';
import { generateSmartVision, extractJsonRows } from '../../services/aiService';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ArrowRight,
  Eye,
  Download,
  Calendar,
  MapPin,
  ListOrdered,
  Search,
  Wand2
} from 'lucide-react';

interface RegisterScannerModalProps {
  onClose: () => void;
  initialClass?: string;
  initialSection?: string;
}

interface ScannedRow {
  id: string;
  rollNo: string;
  name: string;
  gender: Gender;
  class: string;
  section: string;
  fatherName: string;
  motherName: string;
  contact: string;
  dob: string;
  address: string;
  pin: string;
}

export const normalizeStudentName = (name: string): string => {
  return name
    .replace(/^(भैया\s+|बहिन\s+|Bhaiya\s+|Bahin\s+)/i, '')
    .trim()
    .toLowerCase();
};

export const isStudentAlreadyEnrolled = (
  row: ScannedRow,
  existingStudents: Student[]
): { duplicate: boolean; reason?: string } => {
  const normRowName = normalizeStudentName(row.name);
  const normFather = row.fatherName.trim().toLowerCase();
  const normRoll = row.rollNo.trim();

  // 1. Same Class + Section + Roll collision
  if (normRoll) {
    const rollMatch = existingStudents.find(
      s => s.class === row.class && s.section === row.section && s.rollNo.trim() === normRoll
    );
    if (rollMatch) {
      return {
        duplicate: true,
        reason: `कक्षा ${row.class} (${row.section}) में अनुक्रमांक ${normRoll} पर छात्र '${rollMatch.name}' पहले से पंजीकृत हैं`
      };
    }
  }

  // 2. Same Class + Student Name + Father Name collision
  if (normRowName && normFather) {
    const nameMatch = existingStudents.find(
      s =>
        s.class === row.class &&
        normalizeStudentName(s.name) === normRowName &&
        s.fatherName.trim().toLowerCase() === normFather
    );
    if (nameMatch) {
      return {
        duplicate: true,
        reason: `छात्र '${nameMatch.name}' (पिता: ${nameMatch.fatherName}) कक्षा ${row.class} में पहले से पंजीकृत हैं`
      };
    }
  }

  return { duplicate: false };
};

// 1. IntelliSense Gender Inference from Indian Hindi & English Names
export const guessGenderFromName = (name: string): Gender | null => {
  const clean = name.replace(/^(भैया\s+|बहिन\s+|Bhaiya\s+|Bahin\s+)/i, '').trim().toLowerCase();
  if (!clean) return null;

  const femaleKeywords = [
    'कुमारी', 'देवी', 'कौर', 'दीदी', 'बेगम', 'सुल्ताना',
    'priya', 'devi', 'kumari', 'pooja', 'puja', 'neha', 'anjali', 'aaradhya',
    'ananya', 'sakshi', 'suman', 'sunita', 'kavita', 'muskan', 'shreya',
    'prachi', 'aditi', 'khushi', 'rani', 'radha', 'sita', 'gita', 'geeta',
    'aarti', 'arti', 'sonam', 'swati', 'divya', 'sneha', 'jyoti', 'kiran',
    'komal', 'manisha', 'megha', 'nisha', 'payal', 'poonam', 'preeti', 'priti',
    'rakhi', 'rekha', 'ritu', 'roshni', 'rupa', 'sapna', 'sarita', 'seema',
    'shikha', 'shital', 'sheetal', 'shobha', 'sonali', 'varsha', 'vidya'
  ];

  for (const kw of femaleKeywords) {
    if (clean.includes(kw)) return 'Bahin';
  }

  // Hindi feminine vowel ending 'ी' check (e.g. आरती, अंजलि, रोशनी, स्वाति)
  if (clean.endsWith('ी') || clean.endsWith('ीं')) {
    if (!clean.includes('शास्त्री') && !clean.includes('जोशी') && !clean.includes('गोस्वामी') && !clean.includes('त्यागी')) {
      return 'Bahin';
    }
  }

  const maleKeywords = [
    'कुमार', 'सिंह', 'प्रसाद', 'लाल', 'चन्द', 'चंद', 'राम', 'शर्मा', 'वर्मा',
    'केशव', 'माधव', 'आर्यन', 'आयुष', 'अमन', 'शिवम', 'राहुल', 'अमित', 'विकास',
    'दीपक', 'संदीप', 'रोहन', 'आदित्य', 'अंकित', 'अनुराग', 'अशोक', 'भारत',
    'चेतन', 'दर्शन', 'गौरव', 'गोपाल', 'हर्ष', 'करण', 'मनीष', 'मयंक', 'मोहित',
    'नमन', 'निखिल', 'पंकज', 'प्रवीण', 'प्रशांत', 'राजेश', 'राकेश', 'ऋषभ',
    'रोहित', 'सचिन', 'संजय', 'सौरभ', 'शुभम', 'सुमित', 'सुरेश', 'तरुण', 'उमेश',
    'विशाल', 'विवेक', 'यथार्थ', 'yash', 'aryan', 'ayush', 'aman', 'rohan'
  ];

  for (const kw of maleKeywords) {
    if (clean.includes(kw)) return 'Bhaiya';
  }

  return null;
};

// 2. IntelliSense Father Name Honorific Standardization
export const formatFatherName = (fatherName: string): string => {
  let clean = fatherName
    .replace(/^श्रीमान\s+/i, 'श्री ')
    .replace(/^shri\s+/i, 'श्री ')
    .replace(/^mr\.?\s+/i, 'श्री ')
    .replace(/^भैया\s+/i, '')
    .replace(/^बहिन\s+/i, '')
    .replace(/^Bhaiya\s+/i, '')
    .replace(/^Bahin\s+/i, '')
    .replace(/["'“”‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return '';
  if (!clean.startsWith('श्री ') && !clean.startsWith('स्व. ') && !clean.startsWith('स्वर्गीय ')) {
    clean = `श्री ${clean}`;
  }
  return clean;
};

// 3. IntelliSense Age Calculation from DOB
export const calculateAgeFromDob = (dobString: string): number | null => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 && age < 100 ? age : null;
};

// 4. IntelliSense Age Appropriateness Checker for Class
export const isAgeAppropriateForClass = (age: number, cls: string): { appropriate: boolean; expected: number } => {
  const match = cls.match(/\d+/);
  const classNum = match ? parseInt(match[0], 10) : 6;
  const expected = 5 + classNum;
  const diff = Math.abs(age - expected);
  return {
    appropriate: diff <= 2,
    expected
  };
};

// 5. IntelliSense Sibling / Family Matcher against School Records
export const findSiblingForScannedRow = (
  row: ScannedRow,
  existingStudents: Student[]
): Student | null => {
  const cleanPhone = row.contact.replace(/\D/g, '').slice(-10);
  const normFather = row.fatherName.replace(/^श्री\s+/i, '').trim().toLowerCase();
  const normName = row.name.trim().toLowerCase();

  return (
    existingStudents.find(s => {
      // Must not match the same student
      if (s.class === row.class && s.rollNo.trim() === row.rollNo.trim()) return false;
      if (normName && s.name.trim().toLowerCase() === normName) return false;

      const sPhone = s.contact ? s.contact.replace(/\D/g, '').slice(-10) : '';
      const sFather = s.fatherName ? s.fatherName.replace(/^श्री\s+/i, '').trim().toLowerCase() : '';

      if (cleanPhone.length === 10 && sPhone === cleanPhone && sPhone !== '9876543210') {
        return true;
      }
      if (normFather && sFather && normFather === sFather && row.address && s.address && s.address.toLowerCase() === row.address.toLowerCase()) {
        return true;
      }
      return false;
    }) || null
  );
};

export const RegisterScannerModal: React.FC<RegisterScannerModalProps> = ({
  onClose,
  initialClass,
  initialSection
}) => {
  const { addStudent, bulkAddStudents, students, currentSchool } = useSchool();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'grid'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Multi-page batch tracking
  const [scannedPageCount, setScannedPageCount] = useState(1);
  const [justEnrolledCount, setJustEnrolledCount] = useState<number | null>(null);

  // Scanned Rows
  const [rows, setRows] = useState<ScannedRow[]>([]);
  const [defaultClass, setDefaultClass] = useState<string>(initialClass || 'Class 6');
  const [defaultSection, setDefaultSection] = useState<string>(initialSection || 'A');
  // Tracks row IDs that failed DB save — to re-highlight after attempted submit
  const [failedRowIds, setFailedRowIds] = useState<Set<string>>(new Set());

  // Helper to generate starter blank rows for seamless fast-typing without AI dependency
  const createDefaultRows = (count: number = 5): ScannedRow[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `fast-entry-${Date.now()}-${i}`,
      rollNo: String(i + 1),
      name: '',
      gender: 'Bhaiya' as Gender,
      class: defaultClass,
      section: defaultSection,
      fatherName: '',
      motherName: '',
      contact: '',
      dob: '2014-01-01',
      address: '',
      pin: ''
    }));
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      const errMsg = err instanceof Error ? err.message : 'कैमरा उपलब्ध नहीं है';
      setCameraError(`कैमरा खोलने में असमर्थ (${errMsg})। कृपया फोटो अपलोड का उपयोग करें।`);
      setIsCameraActive(false);
      setActiveTab('upload');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  // Capture snapshot from video
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopCamera();
    processImageWithAI(dataUrl);
  };

  // Helper to optimize large camera/upload images for fast OCR transmission (<1MB)
  const optimizeImageForOCR = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.filter = 'contrast(1.18) brightness(1.02)';
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      const optimized = await optimizeImageForOCR(result);
      setCapturedImage(optimized);
      processImageWithAI(optimized);
    };
    reader.readAsDataURL(file);
  };

  // AI Extraction logic using Gemini Vision with seamless fast-entry fallback
  const processImageWithAI = async (rawImageDataUrl: string) => {
    setIsScanning(true);
    setActiveTab('grid');

    const imageDataUrl = await optimizeImageForOCR(rawImageDataUrl);
    const mimeType = imageDataUrl.match(/^data:(image\/[a-z]+);base64,/)?.[1] || 'image/jpeg';

    try {
      const promptText = `You are an expert OCR table parser specialized in Indian School Student Registers (दाखिल-खारिज पंजिका / S.R. Register / Attendance Register / Handwritten Admission Form).
Extract all student records visible in this register image.
For each student, produce a JSON object with:
- "rollNo": string (e.g. "1", "102")
- "name": string (Student name. If boy add "Bhaiya " prefix if missing. If girl add "Bahin " prefix if missing)
- "gender": "Bhaiya" or "Bahin"
- "class": string (e.g. "${defaultClass}")
- "section": string (e.g. "${defaultSection}")
- "fatherName": string (Father's name, e.g. "श्री ...")
- "motherName": string (Mother's name if present, or "")
- "contact": string (10 digit phone if present, or "")
- "dob": string (YYYY-MM-DD format if present, or "2014-01-01")
- "address": string (Town/Village/Address if present, or "")
- "pin": string (Postal code if present, or "")

Return strictly a JSON array of objects. No markdown backticks, no explanations. Example:
[{"rollNo":"1","name":"Bhaiya केशव शर्मा","gender":"Bhaiya","class":"${defaultClass}","section":"${defaultSection}","fatherName":"श्री राजेश शर्मा","motherName":"","contact":"","dob":"2014-05-10","address":"रामपुर","pin":""}]`;

      const response = await generateSmartVision<any>(imageDataUrl, mimeType, promptText);
      const rawRows = extractJsonRows(response);

      if (Array.isArray(rawRows) && rawRows.length > 0) {
        const formattedRows: ScannedRow[] = rawRows.map((item: any, idx: number) => {
          const rawName = String(item.name || '').trim();
          const isBahin = item.gender === 'Bahin' || rawName.startsWith('बहिन ') || rawName.startsWith('Bahin ');
          const gender: Gender = isBahin ? 'Bahin' : 'Bhaiya';

          let name = rawName;
          if (
            name &&
            !name.startsWith('भैया ') &&
            !name.startsWith('बहिन ') &&
            !name.startsWith('Bhaiya ') &&
            !name.startsWith('Bahin ')
          ) {
            name = `${gender} ${name}`;
          }

          const rawSchoolPhone = currentSchool?.phone || '9876543210';
          const fallbackPhone = rawSchoolPhone.replace(/\D/g, '').slice(-10) || '9876543210';
          const rawContact = String(item.contact || '').trim();
          const contact = rawContact || fallbackPhone;

          return {
            id: `scan-${Date.now()}-${idx}`,
            rollNo: String(item.rollNo || idx + 1),
            name,
            gender,
            class: defaultClass,
            section: defaultSection,
            fatherName: String(item.fatherName || ''),
            motherName: String(item.motherName || ''),
            contact,
            dob: String(item.dob || '2014-01-01'),
            address: String(item.address || ''),
            pin: String(item.pin || '')
          };
        });

        setRows(formattedRows);
        showSuccess(`✨ AI ने सफलतापूर्वक ${formattedRows.length} छात्रों का विवरण रजिस्टर से पढ़ लिया है!`);
      } else {
        setRows(prev => (prev.length > 0 ? prev : createDefaultRows(5)));
        showError('⚠️ फोटो से छात्रों का विवरण स्वतः नहीं पढ़ा जा सका। कृपया स्पष्ट व सीधी फोटो अपलोड करें, अथवा बाईं ओर रजिस्टर देखकर सीधे भरें।');
      }
    } catch (err: unknown) {
      console.error('Scan AI error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setRows(prev => (prev.length > 0 ? prev : createDefaultRows(5)));
      showError(`⚠️ AI स्कैनिंग में विफलता: ${errorMsg}। आप बाईं ओर रजिस्टर देखकर तालिका में प्रविष्टि कर सकते हैं।`);
    } finally {
      setIsScanning(false);
    }
  };

  // Load Demo Register Data for instant testing
  const loadDemoData = () => {
    const demo: ScannedRow[] = [
      {
        id: `demo-1`,
        rollNo: '1',
        name: 'Bhaiya केशव शास्त्री',
        gender: 'Bhaiya',
        class: defaultClass,
        section: defaultSection,
        fatherName: 'श्री दिनेश शास्त्री',
        motherName: 'श्रीमती कमला शास्त्री',
        contact: '9876501234',
        dob: '2014-04-12',
        address: 'रामपुर नगर',
        pin: '273001'
      },
      {
        id: `demo-2`,
        rollNo: '2',
        name: 'Bahin आद्या तिवारी',
        gender: 'Bahin',
        class: defaultClass,
        section: defaultSection,
        fatherName: 'श्री राधेश्याम तिवारी',
        motherName: 'श्रीमती नीलम तिवारी',
        contact: '9876505678',
        dob: '2014-08-25',
        address: 'विद्या नगर',
        pin: '273001'
      },
      {
        id: `demo-3`,
        rollNo: '3',
        name: 'Bhaiya माधव सिंह',
        gender: 'Bhaiya',
        class: defaultClass,
        section: defaultSection,
        fatherName: 'श्री जयपाल सिंह',
        motherName: 'श्रीमती सरोज सिंह',
        contact: '9876509911',
        dob: '2013-11-05',
        address: 'सरस्वती पुरम',
        pin: '273001'
      }
    ];
    setRows(demo);
    setActiveTab('grid');
    showSuccess('डेमो रजिस्टर डेटा सफलतापूर्वक लोड किया गया!');
  };

  const handleRowChange = (id: string, field: keyof ScannedRow, value: string) => {
    if (failedRowIds.has(id)) {
      setFailedRowIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    setRows(prev =>
      prev.map(row => {
        if (row.id !== id) return row;
        if (field === 'name') {
          // Real-time IntelliSense Gender Guesser when typing name
          const guessed = guessGenderFromName(value);
          if (guessed && guessed !== row.gender) {
            return { ...row, name: value, gender: guessed };
          }
          return { ...row, name: value };
        }
        if (field === 'gender') {
          const newGender = value as Gender;
          let updatedName = row.name;
          if (newGender === 'Bahin') {
            if (updatedName.startsWith('भैया ')) {
              updatedName = 'बहिन ' + updatedName.slice(5).trim();
            } else if (updatedName.startsWith('Bhaiya ')) {
              updatedName = 'Bahin ' + updatedName.slice(7).trim();
            } else if (!updatedName.startsWith('बहिन ') && !updatedName.startsWith('Bahin ') && updatedName.trim()) {
              updatedName = 'Bahin ' + updatedName.trim();
            }
          } else if (newGender === 'Bhaiya') {
            if (updatedName.startsWith('बहिन ')) {
              updatedName = 'भैया ' + updatedName.slice(5).trim();
            } else if (updatedName.startsWith('Bahin ')) {
              updatedName = 'Bhaiya ' + updatedName.slice(6).trim();
            } else if (!updatedName.startsWith('भैया ') && !updatedName.startsWith('Bhaiya ') && updatedName.trim()) {
              updatedName = 'Bhaiya ' + updatedName.trim();
            }
          }
          return { ...row, gender: newGender, name: updatedName };
        }
        return { ...row, [field]: value };
      })
    );
  };

  const handleAddRow = () => {
    const nextRoll = (rows.length + 1).toString();
    const newRow: ScannedRow = {
      id: `manual-${Date.now()}`,
      rollNo: nextRoll,
      name: '',
      gender: 'Bhaiya',
      class: defaultClass,
      section: defaultSection,
      fatherName: '',
      motherName: '',
      contact: '',
      dob: '2014-01-01',
      address: '',
      pin: ''
    };
    setRows(prev => [...prev, newRow]);
  };

  const handleDeleteRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Automatically apply Class change to defaultClass and all rows synchronously
  const handleDefaultClassChange = (newClass: string) => {
    setDefaultClass(newClass);
    setRows(prev =>
      prev.map(r => ({
        ...r,
        class: newClass
      }))
    );
    showInfo(`कक्षा बदलकर '${newClass}' कर दी गई है (सभी पंक्तियों में लागू)।`);
  };

  // Automatically apply Section change to defaultSection and all rows synchronously
  const handleDefaultSectionChange = (newSection: string) => {
    setDefaultSection(newSection);
    setRows(prev =>
      prev.map(r => ({
        ...r,
        section: newSection
      }))
    );
    showInfo(`वर्ग बदलकर '${newSection}' कर दिया गया है।`);
  };

  // Apply default Class / Section to all rows
  const applyClassToAll = () => {
    setRows(prev =>
      prev.map(r => ({
        ...r,
        class: defaultClass,
        section: defaultSection
      }))
    );
    showSuccess(`सभी पंक्तियों में कक्षा: ${defaultClass}, वर्ग: ${defaultSection} लागू किया गया।`);
  };

  // Fill school contact in any rows where contact is empty
  const fillDefaultContactToEmpty = () => {
    const rawSchoolPhone = currentSchool?.phone || '9876543210';
    const cleanPhone = rawSchoolPhone.replace(/\D/g, '').slice(-10) || '9876543210';
    let filled = 0;
    setRows(prev =>
      prev.map(r => {
        if (!r.contact.trim()) {
          filled++;
          return { ...r, contact: cleanPhone };
        }
        return r;
      })
    );
    if (filled > 0) {
      showSuccess(`📞 ${filled} रिक्त पंक्तियों में विद्यालय फ़ोन (${cleanPhone}) भर दिया गया!`);
    } else {
      showInfo('सभी पंक्तियों में पहले से फ़ोन नंबर दर्ज है।');
    }
  };

  // 1-Click Sequence Roll Numbers: 1, 2, 3...
  const autoSequenceRollNumbers = () => {
    if (rows.length === 0) return;
    setRows(prev =>
      prev.map((r, i) => ({
        ...r,
        rollNo: String(i + 1)
      }))
    );
    showSuccess(`🔢 सभी ${rows.length} छात्रों के अनुक्रमांक 1 से ${rows.length} तक स्वतः क्रमबद्ध किए गए।`);
  };

  // 1-Click Clean and Sanitize Names & Prefixes
  const sanitizeAllNamesAndPrefixes = () => {
    if (rows.length === 0) return;
    setRows(prev =>
      prev.map(r => {
        const cleanName = r.name.replace(/["'“”‘’]/g, '').replace(/\s+/g, ' ').trim();
        const isBahin = r.gender === 'Bahin' || cleanName.startsWith('बहिन ') || cleanName.startsWith('Bahin ');
        const targetGender: Gender = isBahin ? 'Bahin' : 'Bhaiya';
        const strippedName = cleanName.replace(/^(भैया\s+|बहिन\s+|Bhaiya\s+|Bahin\s+)/i, '').trim();
        const prefix = targetGender === 'Bahin' ? 'Bahin' : 'Bhaiya';
        const finalName = strippedName ? `${prefix} ${strippedName}` : cleanName;
        return {
          ...r,
          gender: targetGender,
          name: finalName
        };
      })
    );
    showSuccess(`✨ सभी ${rows.length} छात्रों के नाम व लिंग प्रिफ़िक्स (भैया/बहिन) संवार दिए गए हैं।`);
  };

  // Compute approximate birth year based on class
  const getExpectedBirthYearForClass = (cls: string): number => {
    const currentYear = new Date().getFullYear();
    const match = cls.match(/\d+/);
    if (match) {
      const classNum = parseInt(match[0], 10);
      const expectedAge = 5 + classNum; // e.g. Class 2 -> age 7 -> year 2019
      return currentYear - expectedAge;
    }
    const lower = cls.toLowerCase();
    if (lower.includes('nur') || lower.includes('शिशु')) return currentYear - 3;
    if (lower.includes('lkg') || lower.includes('अरुण')) return currentYear - 4;
    if (lower.includes('ukg') || lower.includes('उदय') || lower.includes('प्रभात')) return currentYear - 5;
    return currentYear - 11;
  };

  // 1-Click Fill Default DOB for empty cells based on class
  const fillDefaultDobForEmpty = () => {
    if (rows.length === 0) return;
    const year = getExpectedBirthYearForClass(defaultClass);
    const defaultDob = `${year}-07-01`;
    let filled = 0;
    setRows(prev =>
      prev.map(r => {
        if (!r.dob || r.dob === '2014-01-01' || r.dob.trim() === '') {
          filled++;
          return { ...r, dob: defaultDob };
        }
        return r;
      })
    );
    showSuccess(`📅 ${filled > 0 ? filled : 'सभी'} छात्रों की डिफ़ॉल्ट जन्मतिथि '${defaultDob}' (${defaultClass} के अनुसार) भरी गई।`);
  };

  // 1-Click Fill Common Village / Town Address
  const fillDefaultAddressForEmpty = () => {
    if (rows.length === 0) return;
    const defaultLocality = currentSchool?.city || 'स्थानीय नगर';
    const chosen = window.prompt(
      'सभी रिक्त पतों के लिए स्थानीय गांव / मोहल्ला / शहर का नाम दर्ज करें:',
      defaultLocality
    );
    if (chosen === null) return;
    const finalAddress = chosen.trim() || defaultLocality;
    let filled = 0;
    setRows(prev =>
      prev.map(r => {
        if (!r.address.trim()) {
          filled++;
          return { ...r, address: finalAddress };
        }
        return r;
      })
    );
    showSuccess(`🏡 ${filled > 0 ? filled : 0} छात्रों में स्थानीय पता '${finalAddress}' भरा गया।`);
  };

  // 1-Click Jump & Focus to Next Incomplete Field
  const jumpToNextMissingField = () => {
    if (rows.length === 0) return;
    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      let targetId: string | null = null;
      let fieldName = '';

      if (!row.rollNo.trim()) {
        targetId = `scan-roll-${idx}`;
        fieldName = 'अनुक्रमांक';
      } else if (!row.name.trim()) {
        targetId = `scan-name-${idx}`;
        fieldName = 'छात्र का नाम';
      } else if (!row.fatherName.trim()) {
        targetId = `scan-father-${idx}`;
        fieldName = 'पिता का नाम';
      } else if (!row.contact.trim()) {
        targetId = `scan-contact-${idx}`;
        fieldName = 'मोबाइल नंबर';
      }

      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          showInfo(`🔍 पंक्ति ${idx + 1} (रोल: ${row.rollNo || idx + 1}) में '${fieldName}' अधूरा है।`);
          return;
        }
      }
    }
    showSuccess('🎉 बहुत बढ़िया! तालिका में कोई भी अनिवार्य फ़ील्ड अधूरा नहीं है। आप सीधे पंजीकृत कर सकते हैं।');
  };

  // Missing fields count for badge counter
  const missingFieldsCount = useMemo(() => {
    let count = 0;
    rows.forEach(r => {
      if (!r.name.trim()) count++;
      if (!r.fatherName.trim()) count++;
      if (!r.contact.trim()) count++;
      if (!r.rollNo.trim()) count++;
    });
    return count;
  }, [rows]);

  // 1-Click Auto-Fill Sibling Family Data (Father, Mother, Address, PIN, Contact)
  const handleAutoFillSiblingForRow = (rowId: string, sibling: Student) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id !== rowId) return r;
        const formattedFather = sibling.fatherName ? formatFatherName(sibling.fatherName) : r.fatherName;
        return {
          ...r,
          fatherName: r.fatherName.trim() ? r.fatherName : formattedFather,
          motherName: r.motherName.trim() ? r.motherName : (sibling.motherName || ''),
          address: r.address.trim() ? r.address : (sibling.address || ''),
          pin: r.pin.trim() ? r.pin : (sibling.pin || ''),
          contact: r.contact.trim() ? r.contact : (sibling.contact || '')
        };
      })
    );
    showSuccess(`💡 सहोदर छात्र '${sibling.name}' (${sibling.class}) का पारिवारिक रिकॉर्ड स्वतः भर दिया गया!`);
  };

  // 1-Click AI Smart Auto-Repair & IntelliSense Fixer across the entire table
  const handleSmartIntelliSenseAutoFix = () => {
    if (rows.length === 0) return;
    let nameFixes = 0;
    let genderFixes = 0;
    let fatherFixes = 0;
    let phoneFixes = 0;
    let dobFixes = 0;
    let siblingLinks = 0;

    const classYear = getExpectedBirthYearForClass(defaultClass);
    const defaultDob = `${classYear}-07-01`;

    setRows(prev =>
      prev.map((r, i) => {
        // 1. Clean name and intelligent gender guessing
        const cleanName = r.name.replace(/["'“”‘’]/g, '').replace(/\s+/g, ' ').trim();
        const guessedGender = guessGenderFromName(cleanName);
        let finalGender: Gender = r.gender;

        if (guessedGender && guessedGender !== r.gender) {
          finalGender = guessedGender;
          genderFixes++;
        }

        const strippedName = cleanName.replace(/^(भैया\s+|बहिन\s+|Bhaiya\s+|Bahin\s+)/i, '').trim();
        const prefix = finalGender === 'Bahin' ? 'Bahin' : 'Bhaiya';
        const formattedName = strippedName ? `${prefix} ${strippedName}` : cleanName;
        if (formattedName !== r.name) nameFixes++;

        // 2. Format Father Name
        let formattedFather = formatFatherName(r.fatherName);
        if (formattedFather !== r.fatherName && formattedFather.trim()) fatherFixes++;

        // 3. Clean & Format Phone
        let cleanContact = r.contact.replace(/\D/g, '').slice(-10);
        if (!cleanContact) {
          const rawSchoolPhone = currentSchool?.phone || '9876543210';
          cleanContact = rawSchoolPhone.replace(/\D/g, '').slice(-10) || '9876543210';
        }
        if (cleanContact !== r.contact) phoneFixes++;

        // 4. DOB check
        let finalDob = r.dob;
        if (!finalDob || finalDob === '2014-01-01' || finalDob.trim() === '') {
          finalDob = defaultDob;
          dobFixes++;
        }

        // 5. Sibling Link
        const sibling = findSiblingForScannedRow(
          { ...r, contact: cleanContact, fatherName: formattedFather },
          students
        );
        let finalMother = r.motherName;
        let finalAddress = r.address;
        let finalPin = r.pin;

        if (sibling) {
          if (!formattedFather.trim() && sibling.fatherName) {
            formattedFather = formatFatherName(sibling.fatherName);
            fatherFixes++;
          }
          if (!finalMother.trim() && sibling.motherName) {
            finalMother = sibling.motherName;
            siblingLinks++;
          }
          if (!finalAddress.trim() && sibling.address) {
            finalAddress = sibling.address;
            siblingLinks++;
          }
          if (!finalPin.trim() && sibling.pin) {
            finalPin = sibling.pin;
          }
        }

        // 6. Roll Number
        const finalRoll = r.rollNo.trim() || String(i + 1);

        return {
          ...r,
          rollNo: finalRoll,
          name: formattedName,
          gender: finalGender,
          class: defaultClass,
          section: defaultSection,
          fatherName: formattedFather,
          motherName: finalMother,
          contact: cleanContact,
          dob: finalDob,
          address: finalAddress,
          pin: finalPin
        };
      })
    );

    const totalFixes = nameFixes + genderFixes + fatherFixes + phoneFixes + dobFixes + siblingLinks;
    showSuccess(
      `🧠 AI स्मार्ट ऑटो-करेक्ट संपन्न! ${totalFixes} सुधार लागू किए गए (नाम व लिंग: ${nameFixes + genderFixes}, पिता: ${fatherFixes}, फ़ोन: ${phoneFixes}, जन्मतिथि: ${dobFixes}, सहोदर लिंक: ${siblingLinks})।`
    );
  };

  // Export Scanned Rows to CSV for local offline record
  const exportScannedToCsv = () => {
    if (rows.length === 0) {
      showWarning('डाउनलोड करने हेतु कोई पंक्ति उपलब्ध नहीं है।');
      return;
    }
    const headers = ['अनुक्रमांक', 'छात्र नाम', 'लिंग', 'कक्षा', 'वर्ग', 'पिता का नाम', 'माता का नाम', 'मोबाइल', 'जन्मतिथि', 'पता', 'पिन'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r =>
        [
          `"${r.rollNo}"`,
          `"${r.name}"`,
          `"${r.gender}"`,
          `"${r.class}"`,
          `"${r.section}"`,
          `"${r.fatherName}"`,
          `"${r.motherName}"`,
          `"${r.contact}"`,
          `"${r.dob}"`,
          `"${r.address}"`,
          `"${r.pin}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSM_Register_Scan_${defaultClass.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess(`📥 ${rows.length} छात्रों का डेटा CSV फ़ाइल में डाउनलोड हो गया!`);
  };

  // Ready next page scanning in continuous multi-page session
  const handleScanNextPage = () => {
    setCapturedImage(null);
    setRows([]);
    setFailedRowIds(new Set());
    setScannedPageCount(prev => prev + 1);
    setJustEnrolledCount(null);
    setActiveTab('camera');
    showInfo(`📄 पृष्ठ ${scannedPageCount + 1} स्कैन करने हेतु तैयार।`);
  };

  // Bulk Register All Students — with pre-submit required-field validation
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnrollAll = async () => {
    if (rows.length === 0) {
      showWarning('कोई छात्र रिकॉर्ड नहीं है। पहले स्कैन करें अथवा मैन्युअल पंक्ति जोड़ें।');
      return;
    }

    // Pre-submit UI validation — check required fields (name, fatherName, contact, rollNo)
    const missingRows: { rowNo: number; rollNo: string; issues: string[] }[] = [];
    rows.forEach((row, idx) => {
      const issues: string[] = [];
      if (!row.name.trim()) issues.push('छात्र नाम');
      if (!row.fatherName.trim()) issues.push('पिता का नाम');
      if (!row.contact.trim()) issues.push('मोबाइल नंबर');
      if (!row.rollNo.trim()) issues.push('रोल नंबर');
      if (issues.length > 0) {
        missingRows.push({ rowNo: idx + 1, rollNo: row.rollNo || String(idx + 1), issues });
      }
    });

    if (missingRows.length > 0) {
      const details = missingRows
        .slice(0, 3)
        .map(m => `पंक्ति ${m.rowNo} (रोल ${m.rollNo}): ${m.issues.join(', ')}`)
        .join(' | ');
      const moreText = missingRows.length > 3 ? ` एवं ${missingRows.length - 3} अन्य पंक्तियाँ` : '';
      showWarning(
        `⚠️ ${missingRows.length} पंक्तियों में आवश्यक जानकारी अधूरी है — ${details}${moreText}। लाल रंग में हाइलाइट रिक्त फ़ील्ड भरें (या ऊपर '📞 रिक्त फ़ोन भरें' दबाएं)।`
      );
      return;
    }

    // 2. Duplicate Detection: Separate already enrolled students from new students
    const duplicateRows: { row: ScannedRow; reason: string }[] = [];
    const rowsToEnroll: ScannedRow[] = [];

    rows.forEach(row => {
      const check = isStudentAlreadyEnrolled(row, students);
      if (check.duplicate) {
        duplicateRows.push({ row, reason: check.reason || 'पहले से पंजीकृत' });
      } else {
        rowsToEnroll.push(row);
      }
    });

    if (rowsToEnroll.length === 0 && duplicateRows.length > 0) {
      showInfo(
        `ℹ️ तालिका के सभी ${duplicateRows.length} छात्र पहले से विद्यालय में पंजीकृत हैं। डुप्लीकेट प्रविष्टि रोकने हेतु कोई नया रिकॉर्ड नहीं बनाया गया।`
      );
      onClose();
      return;
    }

    // Bulk async submission for only NEW students (1 single fast network request)
    setIsEnrolling(true);
    const admissionDate = new Date().toISOString().split('T')[0];
    const rawSchoolPhone = currentSchool?.phone || '9876543210';
    const fallbackPhone = rawSchoolPhone.replace(/\D/g, '').slice(-10) || '9876543210';

    const preparedStudents: Partial<Student>[] = rowsToEnroll.map((row, idx) => {
      const trimmedName = row.name.trim();
      const prefix = row.gender === 'Bhaiya' ? 'Bhaiya' : 'Bahin';
      const fullName =
        trimmedName.startsWith('भैया ') ||
        trimmedName.startsWith('बहिन ') ||
        trimmedName.startsWith('Bhaiya ') ||
        trimmedName.startsWith('Bahin ')
          ? trimmedName
          : `${prefix} ${trimmedName}`;

      return {
        id: `ssm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}-${idx + 1}`,
        schoolId: currentSchool.id,
        name: fullName,
        rollNo: row.rollNo || String(students.length + idx + 1),
        class: row.class,
        section: row.section,
        gender: row.gender,
        fatherName: row.fatherName.trim(),
        motherName: row.motherName.trim(),
        contact: row.contact.trim() || fallbackPhone,
        address: row.address.trim(),
        dob: row.dob || '2014-01-01',
        pin: row.pin.trim(),
        admissionDate: admissionDate,
        bloodGroup: 'B+',
        status: 'active',
        socialCategory: 'General'
      };
    });

    try {
      const count = await bulkAddStudents(preparedStudents);
      setIsEnrolling(false);
      const skippedNote = duplicateRows.length > 0
        ? ` (${duplicateRows.length} पूर्व-पंजीकृत छात्र डुप्लीकेट होने से सुरक्षित छोड़ दिए गए)`
        : '';
      showSuccess(`🎉 बधाई! कुल ${count} नए छात्र सफलतापूर्वक पंजीकृत किए गए!${skippedNote}`);
      setJustEnrolledCount(count);
    } catch (err: any) {
      setIsEnrolling(false);
      const errorMsg = err?.message || String(err);
      if (
        errorMsg.includes('401') ||
        errorMsg.includes('अनधिकृत') ||
        errorMsg.includes('Unauthorized') ||
        errorMsg.includes('सत्र समाप्त') ||
        errorMsg.includes('टोकन')
      ) {
        showError(
          `🔒 प्रमाणीकरण त्रुटि (401 Unauthorized): व्यवस्थापक सत्र समाप्त हो गया है। आपका डेटा तालिका में सुरक्षित है। कृपया व्यवस्थापक पासकोड से पुनः लॉगिन करें और 'पंजीकृत करें' दबाएं।`
        );
      } else {
        showError(
          `❌ डेटाबेस में छात्रों को सहेजने में विफलता: ${errorMsg}। आपका डेटा तालिका में सुरक्षित है, कृपया पुनः प्रयास करें।`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-amber-200">
                  हार्ड कॉपी रजिस्टर डायरेक्ट स्कैनर (AI Register Scanner)
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full">
                  Gemini Vision OCR
                </span>
              </div>
              <p className="text-xs text-stone-300">
                रजिस्टर की फोटो खींचें और AI द्वारा देवनागरी हस्तलिखित डेटा स्वतः तालिका में भरें
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-700/60 rounded-lg cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>1. डायरेक्ट कैमरा (Live Camera)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>2. फोटो अपलोड (Upload Image)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. डेटा सत्यापन ग्रिड ({rows.length} छात्र)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-600 font-semibold">डिफ़ॉल्ट कक्षा:</span>
            <select
              value={defaultClass}
              onChange={e => handleDefaultClassChange(e.target.value)}
              className="px-2 py-1 border border-stone-300 rounded bg-white font-medium text-xs focus:ring-1 focus:ring-orange-500"
            >
              {SSM_CLASSES.map(cls => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <select
              value={defaultSection}
              onChange={e => handleDefaultSectionChange(e.target.value)}
              className="px-2 py-1 border border-stone-300 rounded bg-white font-medium text-xs focus:ring-1 focus:ring-orange-500"
            >
              <option value="A">Sec A</option>
              <option value="B">Sec B</option>
            </select>
            {rows.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={applyClassToAll}
                  className="px-2.5 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded font-bold text-[11px] cursor-pointer shadow-2xs transition active:scale-95"
                  title={`सभी पंक्तियों में कक्षा '${defaultClass}' एवं वर्ग '${defaultSection}' लागू करें`}
                >
                  🎯 सभी छात्र: {defaultClass} ({defaultSection}) करें
                </button>
                <button
                  type="button"
                  onClick={fillDefaultContactToEmpty}
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded font-semibold text-[11px] cursor-pointer"
                  title="यदि रजिस्टर में फ़ोन नंबर नहीं था, तो रिक्त पंक्तियों में विद्यालय का फ़ोन नंबर भरें"
                >
                  📞 रिक्त फ़ोन भरें
                </button>
                <button
                  type="button"
                  onClick={exportScannedToCsv}
                  className="px-2 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded font-semibold text-[11px] cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                  title="स्कैन किए गए डेटा को CSV फ़ाइल के रूप में डाउनलोड करें"
                >
                  <Download className="w-3 h-3 text-stone-600" />
                  <span>CSV बैकअप</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Body Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-[360px]">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center justify-center space-y-3 max-w-xl mx-auto py-2">
              <div className="relative w-full aspect-4/3 bg-black rounded-2xl overflow-hidden border-2 border-orange-500 shadow-lg flex items-center justify-center">
                {cameraError ? (
                  <div className="p-6 text-center text-white space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold"
                    >
                      फ़ाइल अपलोड करें
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Viewfinder Overlay */}
                    <div className="absolute inset-4 border-2 border-dashed border-amber-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <span className="text-[10px] bg-black/60 text-amber-300 px-2 py-0.5 rounded w-fit">
                        रजिस्टर पेज या फॉर्म को बॉक्स में रखें
                      </span>
                      <span className="text-[10px] bg-black/60 text-amber-300 px-2 py-0.5 rounded w-fit self-end">
                        पर्याप्त रोशनी रखें
                      </span>
                    </div>
                  </>
                )}
              </div>

              {!cameraError && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={!isCameraActive}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-full text-sm font-bold shadow-md cursor-pointer transition active:scale-95 disabled:opacity-50"
                  >
                    <Camera className="w-5 h-5" />
                    <span>फोटो खींचें एवं स्कैन करें (Snap & Scan)</span>
                  </button>
                  <button
                    type="button"
                    onClick={loadDemoData}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold border border-stone-300"
                  >
                    डेमो डेटा
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="max-w-lg mx-auto py-6 space-y-4 text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/40 rounded-2xl p-8 cursor-pointer transition flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-800">
                    रजिस्टर पेज की फोटो चुनें या यहाँ खींचें (Drag & Drop)
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    JPG, PNG अथवा मोबाइल कैमरे से ली गई स्पष्ट फोटो
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  फ़ाइल चुनें (Select Photo)
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="pt-2">
                <span className="text-xs text-stone-400">अथवा तुरंत परीक्षण हेतु:</span>
                <button
                  type="button"
                  onClick={loadDemoData}
                  className="ml-2 text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  डेमो रजिस्टर डेटा लोड करें ↗
                </button>
              </div>
            </div>
          )}

          {/* GRID TAB & SCAN RESULTS */}
          {activeTab === 'grid' && (
            <div className="space-y-3">
              {/* Progress indicator during scan */}
              {isScanning && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center gap-3 text-orange-900 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
                  <span className="text-xs font-bold">
                    🤖 Google Gemini विज़न मॉडल हस्तलिखित रजिस्टर पढ़ रहा है... कृपया प्रतीक्षा करें...
                  </span>
                </div>
              )}

              {/* Side by Side Preview Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Scanned Image Preview */}
                {capturedImage && (
                  <div className="lg:col-span-4 bg-stone-900 rounded-xl p-2 flex flex-col h-[480px] overflow-hidden border border-stone-800">
                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-800 text-stone-300 text-xs px-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>रजिस्टर मूल प्रति</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setZoomLevel(z => Math.max(0.7, z - 0.2))}
                          className="p-1 hover:bg-stone-800 rounded text-stone-400"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.2))}
                          className="p-1 hover:bg-stone-800 rounded text-stone-400"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotation(r => (r + 90) % 360)}
                          className="p-1 hover:bg-stone-800 rounded text-stone-400"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto flex items-center justify-center p-2">
                      <img
                        src={capturedImage}
                        alt="Captured Register"
                        style={{
                          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                          transition: 'transform 0.2s ease'
                        }}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Right: Extracted Table Grid */}
                <div
                  className={`${
                    capturedImage ? 'lg:col-span-8' : 'lg:col-span-12'
                  } space-y-2 flex flex-col h-[480px]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-800">
                        पहचाने गए छात्र रिकॉर्ड्स ({rows.length})
                      </span>
                      <span className="text-[11px] text-stone-500">
                        (किसी भी खाने पर क्लिक करके संपादन करें)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (capturedImage) {
                            processImageWithAI(capturedImage);
                          } else {
                            showWarning('कृपया पहले कैमरा या अपलोड टैब से रजिस्टर की फोटो लें।');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:from-orange-800 active:to-amber-800 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition active:scale-95"
                        title="फोटो से सभी छात्र विवरण तालिका में स्वतः भरें"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                        <span>✨ फोटो से स्वतः भरें</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ नई पंक्ति</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Autofill & Data Correction Toolbar */}
                  {rows.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-amber-50/60 border border-amber-200 rounded-xl text-xs shadow-2xs">
                      <span className="text-[11px] font-bold text-stone-600 mr-1 flex items-center gap-1">
                        <Wand2 className="w-3.5 h-3.5 text-orange-600" />
                        <span>त्वरित भराव:</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleSmartIntelliSenseAutoFix}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-xs transition active:scale-95"
                        title="AI बौद्धिक ऑटो-करेक्ट: नाम, भैया/बहिन प्रिफ़िक्स, पिता का नाम (श्री), फोन व सहोदर स्वतः जोड़ें"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>🧠 AI स्मार्ट ऑटो-करेक्ट</span>
                      </button>

                      <button
                        type="button"
                        onClick={applyClassToAll}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-[11px] cursor-pointer shadow-xs transition active:scale-95"
                        title={`सभी पंक्तियों में कक्षा '${defaultClass}' एवं वर्ग '${defaultSection}' लागू करें`}
                      >
                        <span>🎯 कक्षा {defaultClass} ({defaultSection}) सब पर लागू</span>
                      </button>

                      <button
                        type="button"
                        onClick={autoSequenceRollNumbers}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg font-semibold text-[11px] cursor-pointer shadow-2xs transition active:scale-95"
                        title="सभी छात्रों के अनुक्रमांक 1, 2, 3... क्रमबद्ध करें"
                      >
                        <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                        <span>🔢 रोल 1, 2, 3...</span>
                      </button>

                      <button
                        type="button"
                        onClick={sanitizeAllNamesAndPrefixes}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg font-semibold text-[11px] cursor-pointer shadow-2xs transition active:scale-95"
                        title="अनावश्यक चिन्ह/स्पेस हटाएं व लिंग अनुसार भैया/बहिन प्रिफ़िक्स संवारें"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>✨ नाम व प्रिफ़िक्स</span>
                      </button>

                      <button
                        type="button"
                        onClick={fillDefaultContactToEmpty}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg font-semibold text-[11px] cursor-pointer shadow-2xs transition active:scale-95"
                        title="रिक्त फोन नंबरों में विद्यालय संपर्क नंबर भरें"
                      >
                        <span>📞 रिक्त फ़ोन</span>
                      </button>

                      <button
                        type="button"
                        onClick={fillDefaultDobForEmpty}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg font-semibold text-[11px] cursor-pointer shadow-2xs transition active:scale-95"
                        title={`कक्षा '${defaultClass}' के आयु मानक अनुसार रिक्त जन्मतिथि भरें`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-green-600" />
                        <span>📅 डिफ़ॉल्ट जन्मतिथि</span>
                      </button>

                      <button
                        type="button"
                        onClick={fillDefaultAddressForEmpty}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg font-semibold text-[11px] cursor-pointer shadow-2xs transition active:scale-95"
                        title="रिक्त पतों में स्थानीय गांव/मोहल्ला भरें"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>🏡 रिक्त पता</span>
                      </button>

                      {missingFieldsCount > 0 ? (
                        <button
                          type="button"
                          onClick={jumpToNextMissingField}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-lg font-bold text-[11px] cursor-pointer shadow-2xs transition active:scale-95 animate-pulse ml-auto"
                          title="अगली अधूरी/लाल फ़ील्ड पर जाएं और भरें"
                        >
                          <Search className="w-3.5 h-3.5 text-red-600" />
                          <span>🔍 अगला अधूरा फ़ील्ड ({missingFieldsCount})</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-green-700 bg-green-100 border border-green-300 rounded-lg ml-auto">
                          ✓ सभी आवश्यक फ़ील्ड पूर्ण
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex-1 overflow-auto border border-stone-200 rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-stone-100 text-stone-700 font-bold sticky top-0 z-10 border-b border-stone-200">
                        <tr>
                          <th className="p-2 w-14">रोल</th>
                          <th className="p-2 min-w-[140px]">छात्र नाम *</th>
                          <th className="p-2 w-20">लिंग</th>
                          <th className="p-2 w-24">कक्षा</th>
                          <th className="p-2 w-16">वर्ग</th>
                          <th className="p-2 min-w-[140px]">पिता का नाम *</th>
                          <th className="p-2 min-w-[100px]">मोबाइल *</th>
                          <th className="p-2 w-28">जन्मतिथि</th>
                          <th className="p-2 min-w-[120px]">पता</th>
                          <th className="p-2 w-10 text-center">हटाएं</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 font-sans">
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="p-8 text-center text-stone-400">
                              कोई पंक्ति नहीं है। ऊपर "कैमरा" या "फोटो अपलोड" से रजिस्टर स्कैन करें अथवा
                              "+ नई पंक्ति जोड़ें"।
                            </td>
                          </tr>
                        ) : (
                          rows.map((row, idx) => {
                            const missingName = !row.name.trim();
                            const missingFather = !row.fatherName.trim();
                            const missingContact = !row.contact.trim();
                            const missingRoll = !row.rollNo.trim();
                            const hasUiError = missingName || missingFather || missingContact || missingRoll;
                            const hasDbError = failedRowIds.has(row.id);
                            const dupCheck = isStudentAlreadyEnrolled(row, students);
                            const isDuplicate = dupCheck.duplicate;
                            const sibling = findSiblingForScannedRow(row, students);
                            const age = calculateAgeFromDob(row.dob);
                            const ageCheck = age !== null ? isAgeAppropriateForClass(age, row.class) : null;
                            const cleanContact = row.contact.trim();
                            const isValidMobile = cleanContact.length === 10 && /^[6-9]/.test(cleanContact);
                            const isPartialMobile = cleanContact.length > 0 && cleanContact.length < 10;
                            const rowClass = hasDbError
                              ? 'bg-orange-50 hover:bg-orange-100 ring-1 ring-inset ring-orange-400'
                              : hasUiError
                              ? 'bg-red-50 hover:bg-red-100'
                              : isDuplicate
                              ? 'bg-amber-50/70 hover:bg-amber-100/70 ring-1 ring-inset ring-amber-300'
                              : 'hover:bg-amber-50/50';
                            return (
                            <tr key={row.id} className={`transition ${rowClass}`}>
                              <td className="p-1">
                                <input
                                  id={`scan-roll-${idx}`}
                                  type="text"
                                  placeholder="रोल *"
                                  value={row.rollNo}
                                  onChange={e => handleRowChange(row.id, 'rollNo', e.target.value)}
                                  className={`w-full px-1.5 py-1 text-xs border rounded bg-white font-mono font-medium ${
                                    missingRoll ? 'border-red-400 bg-red-50 placeholder-red-400' : 'border-stone-200'
                                  }`}
                                />
                              </td>
                              <td className="p-1">
                                <div className="flex items-center gap-1">
                                  <input
                                    id={`scan-name-${idx}`}
                                    type="text"
                                    placeholder="छात्र नाम *"
                                    value={row.name}
                                    onChange={e => handleRowChange(row.id, 'name', e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (idx === rows.length - 1) {
                                          handleAddRow();
                                          setTimeout(() => {
                                            document.getElementById(`scan-name-${idx + 1}`)?.focus();
                                          }, 40);
                                        } else {
                                          document.getElementById(`scan-name-${idx + 1}`)?.focus();
                                        }
                                      }
                                    }}
                                    className={`w-full px-1.5 py-1 text-xs border rounded bg-white font-medium text-stone-900 focus:ring-1 focus:ring-orange-500 ${
                                      missingName
                                        ? 'border-red-400 bg-red-50 placeholder-red-400'
                                        : isDuplicate
                                        ? 'border-amber-400 bg-amber-50/40'
                                        : 'border-stone-200'
                                    }`}
                                  />
                                  {isDuplicate && (
                                    <span
                                      title={dupCheck.reason}
                                      className="shrink-0 px-1 py-0.5 text-[9px] font-bold bg-amber-200 text-amber-900 border border-amber-400 rounded cursor-help"
                                    >
                                      पंजीकृत
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-1">
                                <select
                                  value={row.gender}
                                  onChange={e => handleRowChange(row.id, 'gender', e.target.value)}
                                  className="w-full px-1 py-1 text-xs border border-stone-200 rounded bg-white"
                                >
                                  <option value="Bhaiya">भैया</option>
                                  <option value="Bahin">बहिन</option>
                                </select>
                              </td>
                              <td className="p-1">
                                <select
                                  value={row.class}
                                  onChange={e => handleRowChange(row.id, 'class', e.target.value)}
                                  className="w-full px-1 py-1 text-xs border border-stone-200 rounded bg-white"
                                >
                                  {SSM_CLASSES.map(c => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-1">
                                <select
                                  value={row.section}
                                  onChange={e => handleRowChange(row.id, 'section', e.target.value)}
                                  className="w-full px-1 py-1 text-xs border border-stone-200 rounded bg-white"
                                >
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                </select>
                              </td>
                              <td className="p-1">
                                <input
                                  id={`scan-father-${idx}`}
                                  type="text"
                                  placeholder="पिता का नाम *"
                                  value={row.fatherName}
                                  onChange={e => handleRowChange(row.id, 'fatherName', e.target.value)}
                                  onBlur={e => {
                                    const formatted = formatFatherName(e.target.value);
                                    if (formatted && formatted !== e.target.value) {
                                      handleRowChange(row.id, 'fatherName', formatted);
                                    }
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (idx === rows.length - 1) {
                                        handleAddRow();
                                        setTimeout(() => {
                                          document.getElementById(`scan-father-${idx + 1}`)?.focus();
                                        }, 40);
                                      } else {
                                        document.getElementById(`scan-father-${idx + 1}`)?.focus();
                                      }
                                    }
                                  }}
                                  className={`w-full px-1.5 py-1 text-xs border rounded bg-white text-stone-800 focus:ring-1 focus:ring-orange-500 ${missingFather ? 'border-red-400 bg-red-50 placeholder-red-400' : 'border-stone-200'}`}
                                />
                                {sibling && (
                                  <button
                                    type="button"
                                    onClick={() => handleAutoFillSiblingForRow(row.id, sibling)}
                                    className="mt-0.5 flex items-center gap-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded px-1.5 py-0.5 font-medium transition cursor-pointer text-left w-full truncate shadow-2xs"
                                    title={`सहोदर छात्र: ${sibling.name} (${sibling.class})। 1-क्लिक में परिवार विवरण स्वतः भरें।`}
                                  >
                                    <span className="shrink-0">💡 सहोदर:</span>
                                    <span className="truncate font-bold">{sibling.name} ({sibling.class})</span>
                                    <span className="shrink-0 text-indigo-500 underline ml-auto">[भरें]</span>
                                  </button>
                                )}
                              </td>
                              <td className="p-1">
                                <div className="relative flex items-center">
                                  <input
                                    id={`scan-contact-${idx}`}
                                    type="text"
                                    placeholder="मोबाइल *"
                                    maxLength={10}
                                    value={row.contact}
                                    onChange={e =>
                                      handleRowChange(row.id, 'contact', e.target.value.replace(/\D/g, ''))
                                    }
                                    className={`w-full px-1.5 py-1 text-xs border rounded bg-white ${
                                      missingContact
                                        ? 'border-red-400 bg-red-50 placeholder-red-400'
                                        : isPartialMobile
                                        ? 'border-amber-400 bg-amber-50/50 pr-5'
                                        : isValidMobile
                                        ? 'border-green-400/80 pr-5'
                                        : 'border-stone-200'
                                    }`}
                                  />
                                  {isValidMobile && (
                                    <span className="absolute right-1.5 text-[10px] text-green-600 font-bold pointer-events-none" title="वैध 10-अंकीय मोबाइल">
                                      ✓
                                    </span>
                                  )}
                                  {isPartialMobile && (
                                    <span className="absolute right-1.5 text-[9px] text-amber-600 font-semibold pointer-events-none" title={`${10 - cleanContact.length} अंक बाकी`}>
                                      {10 - cleanContact.length}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-1">
                                <input
                                  type="date"
                                  value={row.dob}
                                  onChange={e => handleRowChange(row.id, 'dob', e.target.value)}
                                  className={`w-full px-1.5 py-1 text-xs border rounded bg-white ${
                                    age !== null && ageCheck && !ageCheck.appropriate
                                      ? 'border-amber-400 bg-amber-50/40'
                                      : 'border-stone-200'
                                  }`}
                                />
                                {age !== null && (
                                  <div className="flex items-center justify-between text-[10px] mt-0.5 px-0.5">
                                    <span className="text-stone-500 font-medium">{age} वर्ष</span>
                                    {ageCheck && !ageCheck.appropriate && (
                                      <span
                                        className="text-amber-700 font-semibold cursor-help"
                                        title={`अपेक्षित आयु: ~${ageCheck.expected} वर्ष (${row.class})`}
                                      >
                                        ⚠️ {age < ageCheck.expected ? 'कम' : 'अधिक'}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  placeholder="पता"
                                  value={row.address}
                                  onChange={e => handleRowChange(row.id, 'address', e.target.value)}
                                  className="w-full px-1.5 py-1 text-xs border border-stone-200 rounded bg-white"
                                />
                              </td>
                              <td className="p-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(row.id)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                  title="हटाएं"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          ); })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 border-t border-stone-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 text-xs text-stone-600 flex-wrap">
            {rows.length > 0 && (() => {
                const incompleteCount = rows.filter(r => !r.name.trim() || !r.fatherName.trim() || !r.contact.trim() || !r.rollNo.trim()).length;
                const dbErrorCount = failedRowIds.size;
                const duplicateCount = rows.filter(r => isStudentAlreadyEnrolled(r, students).duplicate).length;
                const newCount = rows.length - duplicateCount;
                return (
                  <span className="font-semibold text-stone-700 flex items-center gap-2 flex-wrap">
                    कुल छात्र: <strong className="text-stone-900">{rows.length}</strong>
                    {duplicateCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[11px] font-bold" title="ये छात्र पहले से नामांकित हैं और डुप्लीकेट प्रविष्टि रोकने हेतु स्वतः छोड़ दिए जाएंगे">
                        ⚠️ {duplicateCount} पूर्व-पंजीकृत (डुप्लीकेट स्किप)
                      </span>
                    )}
                    {incompleteCount > 0 && (
                      <button
                        type="button"
                        onClick={jumpToNextMissingField}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded-full text-[11px] font-bold cursor-pointer shadow-2xs transition active:scale-95 animate-pulse"
                        title="अगली अधूरी पंक्ति पर जाएं और रिक्त फ़ील्ड भरें"
                      >
                        <Search className="w-3 h-3 text-red-600" />
                        <span>🔴 {incompleteCount} पंक्तियाँ अधूरी (🔍 भरें)</span>
                      </button>
                    )}
                    {dbErrorCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-300 rounded-full text-[11px] font-bold">
                        🟠 {dbErrorCount} DB त्रुटि
                      </span>
                    )}
                    {incompleteCount === 0 && dbErrorCount === 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 border border-green-300 rounded-full text-[11px] font-bold">
                        ✓ {newCount > 0 ? `${newCount} नए छात्र तैयार` : 'सभी पूर्व-पंजीकृत'}
                      </span>
                    )}
                  </span>
                );
              })()
            }
          </div>

          <div className="flex items-center gap-2">
            {justEnrolledCount !== null ? (
              <>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>पृष्ठ {scannedPageCount} के {justEnrolledCount} छात्र नामांकित!</span>
                </span>
                <button
                  type="button"
                  onClick={handleScanNextPage}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition active:scale-98"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📄 अगला पृष्ठ स्कैन करें (Page {scannedPageCount + 1})</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition"
                >
                  <span>✓ कार्य संपन्न (Done & Close)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isEnrolling}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-lg cursor-pointer transition disabled:opacity-50"
                >
                  रद्द करें (Cancel)
                </button>

                {rows.length > 0 && (() => {
                  const duplicateCount = rows.filter(r => isStudentAlreadyEnrolled(r, students).duplicate).length;
                  const newCount = rows.length - duplicateCount;
                  return (
                    <button
                      type="button"
                      onClick={handleEnrollAll}
                      disabled={isEnrolling || (newCount === 0 && duplicateCount > 0)}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition active:scale-98"
                    >
                      {isEnrolling ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>पंजीकृत हो रहे हैं...</span>
                        </>
                      ) : newCount === 0 && duplicateCount > 0 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>सभी {rows.length} छात्र पहले से पंजीकृत हैं (स्किप)</span>
                        </>
                      ) : duplicateCount > 0 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{newCount} नए छात्र पंजीकृत करें ({duplicateCount} डुप्लीकेट छोड़ें)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>सभी {rows.length} छात्र पंजीकृत करें</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

