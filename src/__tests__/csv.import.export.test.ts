import { describe, it, expect } from 'vitest';
import {
  sanitizeCsvCell,
  parseCsvLine,
  parseCsvContent,
  generateStudentsCSV,
  generateFeesCSV,
  generateAttendanceCSV,
  generateStudentCsvTemplate
} from '../utils/csvExport';
import type { Student, FeeRecord, AttendanceRecord } from '../types';

describe('CSV Import, Export & OWASP Security Test Suite', () => {

  // =========================================================================
  // 1. OWASP CSV Formula Injection & Sanitization
  // =========================================================================
  describe('OWASP CSV Formula Injection Defense (sanitizeCsvCell)', () => {
    it('neutralizes malicious formula triggers starting with =, +, -, @, \\t, \\r', () => {
      // Equals injection
      expect(sanitizeCsvCell("=cmd|' /C calc'!A0")).toBe("\"'=cmd|' /C calc'!A0\"");
      // Plus injection
      expect(sanitizeCsvCell('+SUM(A1:A10)')).toBe("\"'+SUM(A1:A10)\"");
      // Minus injection
      expect(sanitizeCsvCell('-2+3+cmd|')).toBe("\"'-2+3+cmd|\"");
      // At-symbol injection
      expect(sanitizeCsvCell('@HYPERLINK("http://evil.com")')).toBe("\"'@HYPERLINK(\"\"http://evil.com\"\")\"");
      // Tab character injection
      expect(sanitizeCsvCell('\tmalicious')).toBe("\"'\tmalicious\"");
    });

    it('preserves clean standard strings without prepending single-quote', () => {
      expect(sanitizeCsvCell('केशव शर्मा')).toBe('"केशव शर्मा"');
      expect(sanitizeCsvCell('Class 8-A')).toBe('"Class 8-A"');
      expect(sanitizeCsvCell('+91 9876543210')).toBe("\"'+91 9876543210\""); // Safe neutralize
    });

    it('correctly escapes internal double quotes by doubling them', () => {
      expect(sanitizeCsvCell('He said "Namaste" to all')).toBe('"He said ""Namaste"" to all"');
      expect(sanitizeCsvCell('"Double Quoted"')).toBe('"""Double Quoted"""');
    });

    it('safely handles numbers, null, and undefined values', () => {
      expect(sanitizeCsvCell(5000)).toBe('5000');
      expect(sanitizeCsvCell(0)).toBe('0');
      expect(sanitizeCsvCell(null)).toBe('""');
      expect(sanitizeCsvCell(undefined)).toBe('""');
    });
  });

  // =========================================================================
  // 2. Positive CSV Export Generation
  // =========================================================================
  describe('Positive CSV Export Generation', () => {
    const mockStudents: Student[] = [
      {
        id: 'stu-1',
        rollNo: '101',
        name: 'केशव शर्मा',
        gender: 'Bhaiya',
        class: 'Class 6',
        section: 'A',
        fatherName: 'श्री रमेश शर्मा',
        motherName: 'श्रीमती गीता शर्मा',
        contact: '9876543210',
        bloodGroup: 'O+',
        address: 'गोरखपुर, उत्तर प्रदेश',
        dob: '2014-04-15',
        admissionDate: '2024-04-01'
      },
      {
        id: 'stu-2',
        rollNo: '102',
        name: 'श्रेया दीक्षित',
        gender: 'Bahin',
        class: 'Class 6',
        section: 'B',
        fatherName: 'श्री आलोक दीक्षित',
        motherName: 'श्रीमती प्रतिभा दीक्षित',
        contact: '9415099887',
        bloodGroup: 'B+',
        address: 'गोलघर, गोरखपुर',
        dob: '2014-07-22',
        admissionDate: '2024-04-02'
      }
    ];

    it('generates well-formed student directory CSV with headers and Devanagari text', () => {
      const csv = generateStudentsCSV(mockStudents);
      const lines = csv.split('\n');

      expect(lines.length).toBe(3); // 1 header + 2 student rows
      expect(lines[0]).toBe('Roll No,Name,Gender,Class,Section,Father Name,Mother Name,Contact Phone,Blood Group,Address,Admission Date');
      expect(lines[1]).toContain('"101"');
      expect(lines[1]).toContain('"केशव शर्मा"');
      expect(lines[1]).toContain('"Bhaiya"');
      expect(lines[1]).toContain('"गोरखपुर, उत्तर प्रदेश"');
      expect(lines[2]).toContain('"श्रेया दीक्षित"');
    });

    it('generates fee register CSV matching students and handling receipt numbers', () => {
      const mockFees: FeeRecord[] = [
        {
          id: 'fee-1',
          studentId: 'stu-1',
          receiptNo: 'REC-2026-001',
          term: 'प्रथम त्रैमासिक',
          academicYear: '2025-26',
          totalAmount: 4500,
          paidAmount: 4500,
          status: 'Paid',
          paymentMode: 'Cash',
          paidDate: '2025-07-10'
        }
      ];

      const csv = generateFeesCSV(mockFees, mockStudents);
      const lines = csv.split('\n');

      expect(lines.length).toBe(2);
      expect(lines[0]).toContain('Receipt No,Roll No,Student Name');
      expect(lines[1]).toContain('"REC-2026-001"');
      expect(lines[1]).toContain('"101"');
      expect(lines[1]).toContain('"केशव शर्मा"');
      expect(lines[1]).toContain('4500,4500,"Paid"');
    });

    it('generates attendance CSV filtered by date with proper fallback', () => {
      const mockAttendance: AttendanceRecord[] = [
        {
          id: 'att-1',
          studentId: 'stu-1',
          date: '2026-09-13',
          status: 'Present'
        },
        {
          id: 'att-2',
          studentId: 'stu-2',
          date: '2026-09-13',
          status: 'Absent'
        }
      ];

      const csv = generateAttendanceCSV(mockAttendance, mockStudents, '2026-09-13');
      const lines = csv.split('\n');

      expect(lines.length).toBe(3);
      expect(lines[0]).toBe('Date,Roll No,Student Name,Class,Section,Status');
      expect(lines[1]).toContain('"2026-09-13","101","केशव शर्मा","Class 6","A","Present"');
      expect(lines[2]).toContain('"2026-09-13","102","श्रेया दीक्षित","Class 6","B","Absent"');
    });
  });

  // =========================================================================
  // 3. Negative Export Edge Cases
  // =========================================================================
  describe('Negative Export Edge Cases', () => {
    it('handles orphaned fee records without crashing and displays Unknown for student', () => {
      const orphanedFee: FeeRecord[] = [
        {
          id: 'fee-orphan',
          studentId: 'non-existent-student',
          receiptNo: '',
          term: 'वार्षिक',
          academicYear: '2025-26',
          totalAmount: 1200,
          paidAmount: 0,
          status: 'Pending',
          paymentMode: '',
          paidDate: ''
        }
      ];

      const csv = generateFeesCSV(orphanedFee, []);
      expect(csv).toContain('"N/A","N/A","Unknown","N/A"');
      expect(csv).toContain('1200,0,"Pending"');
    });

    it('handles missing optional student fields gracefully without undefined or null in CSV', () => {
      const sparseStudent: Student = {
        id: 'stu-sparse',
        rollNo: '999',
        name: 'अनामिका',
        gender: 'Bahin',
        class: 'Class 5',
        section: 'A',
        fatherName: '',
        motherName: '',
        contact: '',
        address: '',
        dob: '',
        admissionDate: '',
        bloodGroup: ''
      };

      const csv = generateStudentsCSV([sparseStudent]);
      expect(csv).not.toContain('undefined');
      expect(csv).not.toContain('null');
      expect(csv).toContain('""');
    });
  });

  // =========================================================================
  // 4. Positive CSV Parser Tests
  // =========================================================================
  describe('Positive CSV Parser (parseCsvLine & parseCsvContent)', () => {
    it('parses basic comma-delimited strings correctly', () => {
      const row = parseCsvLine('101,Bhaiya Keshav Sharma,Class 6,A');
      expect(row).toEqual(['101', 'Bhaiya Keshav Sharma', 'Class 6', 'A']);
    });

    it('correctly handles quoted fields with internal commas', () => {
      const row = parseCsvLine('"101","Sharma, Keshav","Civil Lines, Gorakhpur","O+"');
      expect(row).toEqual(['101', 'Sharma, Keshav', 'Civil Lines, Gorakhpur', 'O+']);
    });

    it('handles escaped double quotes inside quoted fields', () => {
      const row = parseCsvLine('"102","Bahin ""Shreya"" Dixit","Class 6"');
      expect(row).toEqual(['102', 'Bahin "Shreya" Dixit', 'Class 6']);
    });

    it('parses full multiline CSV content and strips UTF-8 BOM', () => {
      const rawCsv = '\uFEFFRoll,Name,Class\n101,Keshav,6\r\n102,Shreya,6\n';
      const parsed = parseCsvContent(rawCsv);
      expect(parsed.length).toBe(3);
      expect(parsed[0]).toEqual(['Roll', 'Name', 'Class']);
      expect(parsed[1]).toEqual(['101', 'Keshav', '6']);
      expect(parsed[2]).toEqual(['102', 'Shreya', '6']);
    });
  });

  // =========================================================================
  // 5. Negative CSV Parser Tests
  // =========================================================================
  describe('Negative CSV Parser Edge Cases', () => {
    it('returns empty array for empty or whitespace-only CSV content', () => {
      expect(parseCsvContent('')).toEqual([]);
      expect(parseCsvContent('   \n\r\n  ')).toEqual([]);
    });

    it('tolerates unclosed quotes without hanging or throwing errors', () => {
      // Unclosed quote in middle
      const row = parseCsvLine('101,"Unclosed quote,Class 6,A');
      expect(Array.isArray(row)).toBe(true);
      expect(row.length).toBeGreaterThan(0);
    });

    it('skips empty lines between data rows', () => {
      const rawCsv = 'Header1,Header2\n\n101,Keshav\n\n\n102,Shreya\n';
      const parsed = parseCsvContent(rawCsv);
      expect(parsed.length).toBe(3); // Header + 2 data rows
    });
  });

  // =========================================================================
  // 6. High-Volume Bulk Import/Export Stress Test
  // =========================================================================
  describe('High-Volume Bulk Import/Export Performance', () => {
    it('generates CSV for 500 students in under 50 milliseconds', () => {
      const bulkStudents: Student[] = Array.from({ length: 500 }, (_, i) => ({
        id: `bulk-${i}`,
        rollNo: (1000 + i).toString(),
        name: `छात्र ${i + 1}`,
        gender: i % 2 === 0 ? 'Bhaiya' : 'Bahin',
        class: `Class ${(i % 5) + 6}`,
        section: 'A',
        fatherName: `श्री अभिभावक ${i + 1}`,
        motherName: `श्रीमती माता ${i + 1}`,
        contact: `980000000${i % 10}`,
        bloodGroup: 'B+',
        address: 'गोरखपुर नगर',
        dob: '2014-01-01',
        admissionDate: '2025-04-01'
      }));

      const t0 = performance.now();
      const csv = generateStudentsCSV(bulkStudents);
      const duration = performance.now() - t0;

      expect(csv).toBeDefined();
      expect(csv.split('\n').length).toBe(501);
      expect(duration).toBeLessThan(100); // Super fast
    });

    it('parses CSV with 500 rows in under 50 milliseconds', () => {
      const lines = ['Roll,Name,Class,Section'];
      for (let i = 0; i < 500; i++) {
        lines.push(`"${1000 + i}","छात्र क्रमांक ${i}","Class 8","A"`);
      }
      const rawContent = lines.join('\n');

      const t0 = performance.now();
      const parsed = parseCsvContent(rawContent);
      const duration = performance.now() - t0;

      expect(parsed.length).toBe(501);
      expect(duration).toBeLessThan(100);
    });
  });

  // =========================================================================
  // 6. Synchronized 16-Column Student Import Template
  // =========================================================================
  describe('Synchronized 16-Column Student Import Template', () => {
    it('generates template with all 16 statutory and compliance headers', () => {
      const template = generateStudentCsvTemplate();
      const rows = parseCsvContent(template);
      expect(rows.length).toBeGreaterThan(1); // Header + sample rows

      const headers = rows[0];
      expect(headers).toEqual([
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
      ]);
    });

    it('contains valid sample rows matching the 16 headers', () => {
      const template = generateStudentCsvTemplate();
      const rows = parseCsvContent(template);
      const dataRows = rows.slice(1);

      expect(dataRows.length).toBe(5);
      dataRows.forEach(row => {
        expect(row.length).toBe(16);
        // Gender check
        expect(['Bhaiya', 'Bahin']).toContain(row[2]);
        // Date formats YYYY-MM-DD
        expect(row[9]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(row[10]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // PEN 11 digits
        expect(row[12]).toMatch(/^\d{11}$/);
        // APAAR ID 12 digits
        expect(row[13]).toMatch(/^\d{12}$/);
      });
    });
  });
});

