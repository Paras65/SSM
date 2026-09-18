import type { Student, School } from '../types';

const HINDI_DAYS = [
  '', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
  'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस', 'बीस',
  'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाइस', 'उनतीस', 'तीस', 'इकतीस'
];

const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const HINDI_NUMS: { [key: number]: string } = {
  0: '', 1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पाँच',
  6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ', 10: 'दस',
  11: 'ग्यारह', 12: 'बारह', 13: 'तेरह', 14: 'चौदह', 15: 'पंद्रह',
  16: 'सोलह', 17: 'सत्रह', 18: 'अठारह', 19: 'उन्नीस', 20: 'बीस',
  21: 'इक्कीस', 22: 'बाईस', 23: 'तेईस', 24: 'चौबीस', 25: 'पच्चीस',
  26: 'छब्बीस', 27: 'सत्ताईस', 28: 'अट्ठाइस', 29: 'उनतीस', 30: 'तीस',
  31: 'इकतीस', 32: 'बत्तीस', 33: 'तैंतीस', 34: 'चौंतीस', 35: 'पैंतीस',
  36: 'छत्तीस', 37: 'सैंतीस', 38: 'अड़तीस', 39: 'उनतालीस', 40: 'चालीस',
  41: 'इकतालीस', 42: 'बयालीस', 43: 'तैंतालीस', 44: 'चवालीस', 45: 'पैंतालीस',
  46: 'छियालीस', 47: 'सैंतालीस', 48: 'अड़तालीस', 49: 'उनचास', 50: 'पचास',
  51: 'इक्यावन', 52: 'बावन', 53: 'तिरपन', 54: 'चौवन', 55: 'पचपन',
  56: 'छप्पन', 57: 'सत्तावन', 58: 'अट्ठावन', 59: 'उनसठ', 60: 'साठ',
  61: 'इकसठ', 62: 'बासठ', 63: 'तिरसठ', 64: 'चौंसठ', 65: 'पैंसठ',
  66: 'छियासठ', 67: 'सरसठ', 68: 'अड़सठ', 69: 'उनहत्तर', 70: 'सत्तर',
  71: 'इकहत्तर', 72: 'बहत्तर', 73: 'तिहत्तर', 74: 'चौहत्तर', 75: 'पचहत्तर',
  76: 'छिहत्तर', 77: 'सतहत्तर', 78: 'अठहत्तर', 79: 'उनासी', 80: 'अस्सी',
  81: 'इक्यासी', 82: 'बयासी', 83: 'तिरासी', 84: 'चौरासी', 85: 'पचासी',
  86: 'छियासी', 87: 'सत्तासी', 88: 'अट्ठासी', 89: 'नवासी', 90: 'नब्बे',
  91: 'इक्यानवे', 92: 'बानवे', 93: 'तिरानवे', 94: 'चौरानवे', 95: 'पंचानवे',
  96: 'छियानवे', 97: 'सत्तानवे', 98: 'अट्ठानवे', 99: 'निन्यानवे'
};

/**
 * Converts a numeric year (e.g. 2015) to standard Hindi words (e.g. "दो हजार पंद्रह")
 */
export function convertYearToHindiWords(year: number): string {
  if (year >= 2000 && year < 2100) {
    const remainder = year - 2000;
    if (remainder === 0) return 'दो हजार';
    const remStr = HINDI_NUMS[remainder] || String(remainder);
    return `दो हजार ${remStr}`.trim();
  }
  if (year >= 1900 && year < 2000) {
    const remainder = year - 1900;
    const remStr = HINDI_NUMS[remainder] || String(remainder);
    return `उन्नीस सौ ${remStr}`.trim();
  }
  return String(year);
}

/**
 * Converts ISO/YYYY-MM-DD or standard date to official Devanagari Hindi words
 * E.g. "2015-05-10" -> "दस मई दो हजार पंद्रह"
 */
export function convertDateToHindiWords(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();

    const dayWord = HINDI_DAYS[day] || String(day);
    const monthWord = HINDI_MONTHS[month] || '';
    const yearWord = convertYearToHindiWords(year);

    return `${dayWord} ${monthWord} ${yearWord}`.trim();
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date to DD-MM-YYYY
 */
export function formatDateDDMMYYYY(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Derives a clean Scholar/SR Number from student record
 */
export function getScholarNumber(student: Student, index: number): string {
  if (student.rollNo && !student.rollNo.startsWith('SSM-')) {
    return student.rollNo;
  }
  if (student.id) {
    const parts = student.id.split('-');
    const last = parts[parts.length - 1];
    if (last && !isNaN(Number(last))) return last;
  }
  return String(index + 1001);
}

/**
 * Generates official Government Dakhil-Kharij (Admission & Withdrawal / General Register) CSV
 */
export function generateDakhilKharijCSV(students: Student[], school: School): string {
  const headers = [
    'क्र.सं. (S.No.)',
    'प्रवेश/एस.आर. संख्या (Scholar No)',
    'प्रवेश तिथि (Admission Date)',
    'प्रवेशित कक्षा (Admission Class)',
    'विद्यार्थी का नाम (Student Name)',
    'लिंग (Gender)',
    'पिता का नाम (Father Name)',
    'माता का नाम (Mother Name)',
    'स्थायी पता (Address)',
    'सम्पर्क मोबाइल (Mobile)',
    'जन्म तिथि अंकों में (DOB Figures)',
    'जन्म तिथि शब्दों में (DOB Hindi Words)',
    'सामाजिक वर्ग (Social Category)',
    'स्थिति (Status)',
    'खारिज दिनांक (Leaving Date)',
    'टी.सी. क्रमांक व कारण (TC No & Reason)',
    'स्थायी शिक्षा संख्या (PEN)',
    'APAAR ID'
  ];

  const escapeCSV = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '';
    let str = String(val).trim();
    if (['=', '+', '-', '@', '\t', '\r'].includes(str.charAt(0))) {
      str = `'${str}`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = students.map((student, idx) => {
    const scholarNo = getScholarNumber(student, idx);
    const dobFigures = formatDateDDMMYYYY(student.dob);
    const dobWords = convertDateToHindiWords(student.dob);
    const admDate = formatDateDDMMYYYY(student.admissionDate);
    const genderMapped = student.gender === 'Bhaiya' ? 'भैया (छात्र)' : 'बहिन (छात्रा)';
    const isKharij = student.status === 'transferred' || student.status === 'alumni';
    const statusText = isKharij ? 'खारिज (Withdrawn/TC)' : 'दाखिल (अध्ययनरत)';
    const leavingDate = isKharij ? formatDateDDMMYYYY(new Date().toISOString()) : '-';
    const tcDetails = isKharij ? `TC/SSM/${scholarNo} (अभिभावक स्थानांतरण)` : '-';

    return [
      idx + 1,
      escapeCSV(scholarNo),
      escapeCSV(admDate),
      escapeCSV(student.class),
      escapeCSV(student.name),
      escapeCSV(genderMapped),
      escapeCSV(student.fatherName),
      escapeCSV(student.motherName),
      escapeCSV(student.address),
      escapeCSV(student.contact),
      escapeCSV(dobFigures),
      escapeCSV(dobWords),
      escapeCSV(student.socialCategory || 'General'),
      escapeCSV(statusText),
      escapeCSV(leavingDate),
      escapeCSV(tcDetails),
      escapeCSV(student.pen || '-'),
      escapeCSV(student.apaarId || '-')
    ].join(',');
  });

  const metadata = [
    `"${school.hindiName || school.name} - दाखिल-खारिज पंजिका (General Admission & Withdrawal Register)"`,
    `"UDISE कोड: ${school.udiseCode || '09510100101'} | सम्बद्धता संख्या: ${school.affiliationNo || 'VB-UP-8822'} | शाखा: ${school.city || 'गोरखपुर'}"`,
    `"दिनांक: ${formatDateDDMMYYYY(new Date().toISOString())} | कुल छात्र: ${students.length}"`
  ];

  return '\uFEFF' + metadata.join('\r\n') + '\r\n\r\n' + headers.join(',') + '\r\n' + rows.join('\r\n');
}

/**
 * Triggers 1-click download of Dakhil-Kharij CSV
 */
export function downloadDakhilKharijCSV(students: Student[], school: School): void {
  const csvContent = generateDakhilKharijCSV(students, school);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const safeSchoolCode = (school.udiseCode || 'UDISE').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  link.setAttribute('href', url);
  link.setAttribute('download', `DAKHIL_KHARIJ_REGISTER_${safeSchoolCode}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
