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

