import type { Student, FeeRecord, AttendanceRecord, Staff } from '../types';

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

export function exportAbsenteesToCSV(attendance: AttendanceRecord[], students: Student[], date: string) {
  const filtered = attendance.filter(a => a.date === date && a.status === 'Absent');
  const headers = ['Date', 'Roll No', 'Student Name', 'Class', 'Section', 'Parent Contact', 'Status'];
  const rows = filtered.map(a => {
    const student = students.find(s => s.id === a.studentId);
    return [
      sanitizeCsvCell(a.date),
      sanitizeCsvCell(student ? student.rollNo : 'N/A'),
      sanitizeCsvCell(student ? student.name : 'Unknown'),
      sanitizeCsvCell(student ? student.class : 'N/A'),
      sanitizeCsvCell(student ? student.section : 'A'),
      sanitizeCsvCell(student ? student.contact : 'N/A'),
      sanitizeCsvCell('Absent')
    ];
  });
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(csv, `SSM_Absentees_${date}.csv`);
}

export function generateStudentCsvTemplate(): string {
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
    'Admission Date (YYYY-MM-DD)',
    'Blood Group',
    'PEN (11 Digits)',
    'APAAR ID (12 Digits)',
    'Social Category (General/OBC/SC/ST)',
    'Family ID (Optional)'
  ];

  const sampleRows = [
    ['101', 'Bhaiya Keshav Sharma', 'Bhaiya', 'Class 6', 'A', 'Shri Ramesh Sharma', 'Smt. Geeta Sharma', '+91 98765 43210', 'Civil Lines', '2014-04-15', '2023-04-05', 'O+', '21098700101', '987654321001', 'General', 'FAM-1001'],
    ['102', 'Bahin Shreya Dixit', 'Bahin', 'Class 6', 'A', 'Shri Alok Dixit', 'Smt. Pratibha Dixit', '+91 94150 99887', 'Golghar', '2014-07-22', '2023-04-05', 'B+', '21098700102', '987654321002', 'General', 'FAM-1002'],
    ['103', 'Bhaiya Madhav Pandey', 'Bhaiya', 'Class 6', 'B', 'Shri Suresh Pandey', 'Smt. Saroj Pandey', '+91 98390 12345', 'Taramandal', '2014-02-10', '2023-04-06', 'A+', '21098700103', '987654321003', 'OBC', 'FAM-1003'],
    ['104', 'Bahin Ananya Tiwari', 'Bahin', 'Class 7', 'A', 'Shri Vinod Tiwari', 'Smt. Ritu Tiwari', '+91 99350 54321', 'Geeta Vatika', '2013-09-05', '2022-04-10', 'AB+', '21098700104', '987654321004', 'General', 'FAM-1004'],
    ['105', 'Bhaiya Devendra Nath', 'Bhaiya', 'Class 8', 'A', 'Shri Prem Nath', 'Smt. Shanti Devi', '+91 94500 67890', 'Shahpur', '2012-11-18', '2021-04-15', 'O+', '21098700105', '987654321005', 'SC', 'FAM-1005']
  ];

  return [headers.join(','), ...sampleRows.map(row => row.map(sanitizeCsvCell).join(','))].join('\n');
}

export function downloadStudentCsvTemplate(schoolId?: string | unknown): void {
  const csv = generateStudentCsvTemplate();
  const filename = typeof schoolId === 'string' && schoolId
    ? `ssm_students_import_template_${schoolId}.csv` 
    : 'SSM_Chhatra_Panjika_Sample_Template.csv';
  downloadCSV(csv, filename);
}



export function exportPayrollToCSV(staffList: Staff[], schoolName: string, month: string): void {
  const headers = [
    'Staff ID',
    'Name',
    'Designation',
    'Gender',
    'Phone',
    'Monthly Salary (Rs)',
    'Basic Pay (Rs)',
    'DA + HRA (Rs)',
    'PF Deduction (Rs)',
    'Samiti Kosh (Rs)',
    'Net Payable (Rs)',
    'Status'
  ];

  const rows = staffList.map(s => {
    const basic = s.basicPay || Math.round((s.monthlySalary || 0) * 0.65);
    const daHra = s.daHra || Math.round((s.monthlySalary || 0) * 0.35);
    const pf = s.pfDeduction || Math.round(basic * 0.1);
    const samiti = s.samitiDeduction || 500;
    const net = (s.monthlySalary || 0) - (pf + samiti);

    return [
      sanitizeCsvCell(s.id),
      sanitizeCsvCell(s.name),
      sanitizeCsvCell(s.designation),
      sanitizeCsvCell(s.gender === 'Acharya' ? 'आचार्य जी' : 'दीदी जी'),
      sanitizeCsvCell(s.phone),
      sanitizeCsvCell(s.monthlySalary || 0),
      sanitizeCsvCell(basic),
      sanitizeCsvCell(daHra),
      sanitizeCsvCell(pf),
      sanitizeCsvCell(samiti),
      sanitizeCsvCell(net),
      sanitizeCsvCell(s.status || 'Active')
    ];
  });

  const csv = [
    sanitizeCsvCell(`SSM Monthly Payroll Sheet - ${month}`),
    sanitizeCsvCell(`School: ${schoolName}`),
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadCSV(csv, `SSM_Payroll_${month.replace(/\s+/g, '_')}.csv`);
}

export function exportAdmissionsToCSV(admissions: any[], schoolName: string): void {
  const headers = [
    'Registration No',
    'Student Name',
    'Gender',
    'Applying Class',
    'Father Name',
    'Mother Name',
    'Phone',
    'Address',
    'Status',
    'Submission Date'
  ];

  const rows = admissions.map(adm => [
    sanitizeCsvCell(adm.regNo || adm.id),
    sanitizeCsvCell(adm.studentName),
    sanitizeCsvCell(adm.gender === 'Bhaiya' ? 'भैया' : 'बहिन'),
    sanitizeCsvCell(adm.applyingClass),
    sanitizeCsvCell(adm.fatherName || 'N/A'),
    sanitizeCsvCell(adm.motherName || 'N/A'),
    sanitizeCsvCell(adm.phone),
    sanitizeCsvCell(adm.address || 'N/A'),
    sanitizeCsvCell(adm.status),
    sanitizeCsvCell(adm.submissionDate || (adm.createdAt ? new Date(adm.createdAt).toISOString().split('T')[0] : 'N/A'))
  ]);

  const csv = [
    sanitizeCsvCell(`SSM Online Admissions List`),
    sanitizeCsvCell(`School: ${schoolName}`),
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  downloadCSV(csv, `SSM_Admissions_List_${new Date().toISOString().split('T')[0]}.csv`);
}
