import type { Student, FeeRecord, AttendanceRecord } from '../types';

/**
 * Sanitizes a CSV cell to prevent formula injection (OWASP CSV Injection)
 * and properly escapes double-quotes.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  let str = String(value);
  // Neutralize formula injection characters (=, +, -, @, tab, cr)
  const formulaChars = ['=', '+', '-', '@', '\t', '\r'];
  if (str.length > 0 && formulaChars.includes(str.charAt(0))) {
    str = `'${str}`;
  }
  // Escape internal double quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Parses a single line of CSV text respecting quotes and escaped quotes ("").
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses a full CSV string into rows of string arrays, filtering out empty lines.
 */
export function parseCsvContent(content: string): string[][] {
  if (!content || !content.trim()) return [];
  const cleaned = content.replace(/^\uFEFF/, '');
  const lines = cleaned.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
  return lines.map(line => parseCsvLine(line));
}

// 1. Pure CSV Generator: Students
export function generateStudentsCSV(students: Student[]): string {
  const headers = ['Roll No', 'Name', 'Gender', 'Class', 'Section', 'Father Name', 'Mother Name', 'Contact Phone', 'Blood Group', 'Address', 'Admission Date'];
  const rows = students.map(s => [
    sanitizeCsvCell(s.rollNo),
    sanitizeCsvCell(s.name),
    sanitizeCsvCell(s.gender),
    sanitizeCsvCell(s.class),
    sanitizeCsvCell(s.section),
    sanitizeCsvCell(s.fatherName),
    sanitizeCsvCell(s.motherName || ''),
    sanitizeCsvCell(s.contact),
    sanitizeCsvCell(s.bloodGroup),
    sanitizeCsvCell(s.address || ''),
    sanitizeCsvCell(s.admissionDate)
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// 2. Pure CSV Generator: Fees
export function generateFeesCSV(fees: FeeRecord[], students: Student[]): string {
  const headers = ['Receipt No', 'Roll No', 'Student Name', 'Class', 'Term', 'Academic Year', 'Total Amount', 'Paid Amount', 'Status', 'Payment Mode', 'Paid Date'];
  const rows = fees.map(f => {
    const student = students.find(s => s.id === f.studentId);
    return [
      sanitizeCsvCell(f.receiptNo || 'N/A'),
      sanitizeCsvCell(student ? student.rollNo : 'N/A'),
      sanitizeCsvCell(student ? student.name : 'Unknown'),
      sanitizeCsvCell(student ? student.class : 'N/A'),
      sanitizeCsvCell(f.term),
      sanitizeCsvCell(f.academicYear),
      sanitizeCsvCell(f.totalAmount),
      sanitizeCsvCell(f.paidAmount),
      sanitizeCsvCell(f.status),
      sanitizeCsvCell(f.paymentMode || ''),
      sanitizeCsvCell(f.paidDate || '')
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// 3. Pure CSV Generator: Attendance
export function generateAttendanceCSV(attendance: AttendanceRecord[], students: Student[], date: string): string {
  const headers = ['Date', 'Roll No', 'Student Name', 'Class', 'Section', 'Status'];
  const filtered = attendance.filter(a => a.date === date);
  const rows = (filtered.length > 0 ? filtered : students.map(s => ({ studentId: s.id, date, status: 'Present' as const }))).map(a => {
    const student = students.find(s => s.id === a.studentId);
    return [
      sanitizeCsvCell(a.date),
      sanitizeCsvCell(student ? student.rollNo : 'N/A'),
      sanitizeCsvCell(student ? student.name : 'Unknown'),
      sanitizeCsvCell(student ? student.class : 'N/A'),
      sanitizeCsvCell(student ? student.section : 'A'),
      sanitizeCsvCell(a.status)
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Helper to trigger browser CSV file download
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Browser download wrappers
export function exportStudentsToCSV(students: Student[]) {
  const csv = generateStudentsCSV(students);
  const filename = `SSM_Students_List_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

export function exportFeesToCSV(fees: FeeRecord[], students: Student[]) {
  const csv = generateFeesCSV(fees, students);
  const filename = `SSM_Fee_Register_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

export function exportAttendanceToCSV(attendance: AttendanceRecord[], students: Student[], date: string) {
  const csv = generateAttendanceCSV(attendance, students, date);
  const filename = `SSM_Attendance_${date}.csv`;
  downloadCSV(csv, filename);
}

export function downloadStudentCsvTemplate(): void {
  const headers = [
    'Roll No',
    'Name',
    'Gender (Bhaiya/Bahin)',
    'Class',
    'Section',
    'Father Name',
    'Mother Name',
    'Contact',
    'Address',
    'DOB (YYYY-MM-DD)',
    'Blood Group'
  ];

  const sampleRows = [
    ['101', 'Bhaiya Keshav Sharma', 'Bhaiya', 'Class 6', 'A', 'Shri Ramesh Sharma', 'Smt. Geeta Sharma', '+91 98765 43210', 'Civil Lines', '2014-04-15', 'O+'],
    ['102', 'Bahin Shreya Dixit', 'Bahin', 'Class 6', 'A', 'Shri Alok Dixit', 'Smt. Pratibha Dixit', '+91 94150 99887', 'Golghar', '2014-07-22', 'B+'],
    ['103', 'Bhaiya Madhav Pandey', 'Bhaiya', 'Class 6', 'B', 'Shri Suresh Pandey', 'Smt. Saroj Pandey', '+91 98390 12345', 'Taramandal', '2014-02-10', 'A+'],
    ['104', 'Bahin Ananya Tiwari', 'Bahin', 'Class 7', 'A', 'Shri Vinod Tiwari', 'Smt. Ritu Tiwari', '+91 99350 54321', 'Geeta Vatika', '2013-09-05', 'AB+'],
    ['105', 'Bhaiya Devendra Nath', 'Bhaiya', 'Class 8', 'A', 'Shri Prem Nath', 'Smt. Shanti Devi', '+91 94500 67890', 'Shahpur', '2012-11-18', 'O+']
  ];

  const csv = [headers.join(','), ...sampleRows.map(row => row.map(sanitizeCsvCell).join(','))].join('\n');
  downloadCSV(csv, 'SSM_Chhatra_Panjika_Sample_Template.csv');
}
