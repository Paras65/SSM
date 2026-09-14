import type { School, Student, FeeRecord, AttendanceRecord, ReportCard, Notice } from '../types';

export interface FullSchoolBackupData {
  backupVersion: string;
  exportedAt: string;
  school: School;
  counts: {
    students: number;
    fees: number;
    attendance: number;
    reportCards: number;
    notices: number;
  };
  data: {
    students: Student[];
    fees: FeeRecord[];
    attendance: AttendanceRecord[];
    reportCards: ReportCard[];
    notices: Notice[];
  };
}

export function generateFullBackupJSON(
  school: School,
  students: Student[],
  feeRecords: FeeRecord[],
  attendanceRecords: AttendanceRecord[],
  reportCards: ReportCard[],
  notices: Notice[]
): string {
  const backup: FullSchoolBackupData = {
    backupVersion: 'SSM-ERP-V1.0',
    exportedAt: new Date().toISOString(),
    school,
    counts: {
      students: students.length,
      fees: feeRecords.length,
      attendance: attendanceRecords.length,
      reportCards: reportCards.length,
      notices: notices.length
    },
    data: {
      students,
      fees: feeRecords,
      attendance: attendanceRecords,
      reportCards,
      notices
    }
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadFullSchoolBackup(
  school: School,
  students: Student[],
  feeRecords: FeeRecord[],
  attendanceRecords: AttendanceRecord[],
  reportCards: ReportCard[],
  notices: Notice[]
): void {
  const jsonContent = generateFullBackupJSON(
    school,
    students,
    feeRecords,
    attendanceRecords,
    reportCards,
    notices
  );

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  const safeSchoolId = (school.id || 'branch').replace(/[^a-zA-Z0-9_-]/g, '_');

  link.setAttribute('href', url);
  link.setAttribute('download', `SSM_Backup_${safeSchoolId}_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseAndValidateBackupJSON(jsonString: string): FullSchoolBackupData {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error('अमान्य बैकअप फ़ाइल: फ़ाइल रिक्त अथवा दूषित है। (Backup file is empty or invalid)');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('अमान्य JSON प्रारूप: फ़ाइल सही बैकअप प्रारूप में नहीं है। (Malformed JSON format)');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('अमान्य बैकअप डेटा संरचना। (Invalid backup object structure)');
  }

  if (parsed.backupVersion !== 'SSM-ERP-V1.0') {
    throw new Error('अमान्य बैकअप संस्करण: यह फ़ाइल समर्थित SSM बैकअप संस्करण (SSM-ERP-V1.0) की नहीं है।');
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    throw new Error('बैकअप फ़ाइल में डेटा संग्रह (data collection) अनुपस्थित है।');
  }

  const { students, fees, attendance, reportCards, notices } = parsed.data;

  if (!Array.isArray(students) || !Array.isArray(fees) || !Array.isArray(attendance) || !Array.isArray(reportCards)) {
    throw new Error('बैकअप फ़ाइल में अनिवार्य संग्रह (छात्र, शुल्क, उपस्थिति, रिपोर्ट कार्ड) उपलब्ध नहीं हैं।');
  }

  return {
    backupVersion: parsed.backupVersion,
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    school: parsed.school || {},
    counts: {
      students: students.length,
      fees: fees.length,
      attendance: attendance.length,
      reportCards: reportCards.length,
      notices: Array.isArray(notices) ? notices.length : 0
    },
    data: {
      students,
      fees,
      attendance,
      reportCards,
      notices: Array.isArray(notices) ? notices : []
    }
  };
}

