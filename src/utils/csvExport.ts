import type { Student, FeeRecord, AttendanceRecord } from '../types';

// Helper to trigger browser CSV file download
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 1. Export Student Directory
export function exportStudentsToCSV(students: Student[]) {
  const headers = ['Roll No', 'Name', 'Gender', 'Class', 'Section', 'Father Name', 'Mother Name', 'Contact Phone', 'Blood Group', 'Address', 'Admission Date'];
  
  const rows = students.map(s => [
    s.rollNo,
    `"${s.name}"`,
    s.gender,
    `"${s.class}"`,
    s.section,
    `"${s.fatherName}"`,
    `"${s.motherName || ''}"`,
    `"${s.contact}"`,
    s.bloodGroup,
    `"${s.address || ''}"`,
    s.admissionDate
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `SSM_Students_List_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

// 2. Export Fee Register
export function exportFeesToCSV(fees: FeeRecord[], students: Student[]) {
  const headers = ['Receipt No', 'Roll No', 'Student Name', 'Class', 'Term', 'Academic Year', 'Total Amount', 'Paid Amount', 'Status', 'Payment Mode', 'Paid Date'];
  
  const rows = fees.map(f => {
    const student = students.find(s => s.id === f.studentId);
    return [
      f.receiptNo || 'N/A',
      student ? student.rollNo : 'N/A',
      student ? `"${student.name}"` : 'Unknown',
      student ? `"${student.class}"` : 'N/A',
      `"${f.term}"`,
      f.academicYear,
      f.totalAmount,
      f.paidAmount,
      f.status,
      `"${f.paymentMode || ''}"`,
      f.paidDate || ''
    ];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `SSM_Fee_Register_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

// 3. Export Attendance Sheet
export function exportAttendanceToCSV(attendance: AttendanceRecord[], students: Student[], date: string) {
  const headers = ['Date', 'Roll No', 'Student Name', 'Class', 'Section', 'Status'];
  
  const filtered = attendance.filter(a => a.date === date);
  const rows = (filtered.length > 0 ? filtered : students.map(s => ({ studentId: s.id, date, status: 'Present' }))).map(a => {
    const student = students.find(s => s.id === a.studentId);
    return [
      a.date,
      student ? student.rollNo : 'N/A',
      student ? `"${student.name}"` : 'Unknown',
      student ? `"${student.class}"` : 'N/A',
      student ? student.section : 'A',
      a.status
    ];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `SSM_Attendance_${date}.csv`;
  downloadCSV(csv, filename);
}

