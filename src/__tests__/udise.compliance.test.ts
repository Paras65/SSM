import { describe, it, expect } from 'vitest';
import { generateUdisePlusCSV } from '../utils/udiseExport';
import { generateRichDemoData } from '../utils/demoDataSeeder';
import type { School, Student } from '../types';

describe('UDISE+ SDMS Compliance & Government Export Suite', () => {
  const mockSchool: School = {
    id: 'sch-udise-01',
    name: 'Saraswati Shishu Mandir Senior Secondary',
    hindiName: 'सरस्वती शिशु मंदिर उच्चतर माध्यमिक विद्यालय',
    tagline: 'सा विद्या या विमुक्तये',
    affiliate: 'Vidya Bharati',
    affiliationNo: 'VB-UP-8822',
    udiseCode: '09510100101',
    established: '1988',
    address: 'केशव नगर',
    city: 'गोरखपुर',
    state: 'उत्तर प्रदेश',
    prant: 'गोरक्ष प्रान्त',
    phone: '0551-220033',
    email: 'ssm.gorakhpur@vidyabharti.org',
    timings: '08:00 AM - 02:00 PM',
    principalName: 'श्री राम शरण जी',
    adminPasscode: '1234',
    plan: 'pro'
  };

  it('generates CSV with UTF-8 BOM for Microsoft Excel character integrity', () => {
    const demo = generateRichDemoData(mockSchool.id, mockSchool.city);
    const csv = generateUdisePlusCSV(demo.students, mockSchool);

    // Starts with \uFEFF (UTF-8 Byte Order Mark)
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it('contains all 21 official Government UDISE+ SDMS batch columns in header', () => {
    const demo = generateRichDemoData(mockSchool.id, mockSchool.city);
    const csv = generateUdisePlusCSV(demo.students, mockSchool);
    const lines = csv.replace(/^\uFEFF/, '').split('\r\n');
    const headerRow = lines[0].split(',');

    expect(headerRow.length).toBe(21);
    expect(headerRow).toContain('School_UDISE_Code');
    expect(headerRow).toContain('Student_PEN');
    expect(headerRow).toContain('APAAR_ID');
    expect(headerRow).toContain('Scholar_Admission_No');
    expect(headerRow).toContain('Student_Name');
    expect(headerRow).toContain('Gender');
    expect(headerRow).toContain('Date_Of_Birth');
    expect(headerRow).toContain('Social_Category');
    expect(headerRow).toContain('CWSN_Status');
    expect(headerRow).toContain('General_Profile_GP');
    expect(headerRow).toContain('Enrollment_Profile_EP');
    expect(headerRow).toContain('Facility_Profile_FP');
  });

  it('correctly maps student records to UDISE+ specifications', () => {
    const demo = generateRichDemoData(mockSchool.id, mockSchool.city);
    const csv = generateUdisePlusCSV(demo.students, mockSchool);
    const lines = csv.replace(/^\uFEFF/, '').split('\r\n');

    // 1 header + 12 student rows
    expect(lines.length).toBe(13);

    // Row 1: std-01 (भैया आर्यन शर्मा)
    const row1 = lines[1];
    expect(row1).toContain('09510100101'); // School UDISE
    expect(row1).toContain('21098765401'); // 11-digit PEN
    expect(row1).toContain('General'); // Social Category
    expect(row1).toContain('Male (भैया)'); // Gender mapping
    expect(row1).toContain('COMPLETED'); // GP status

    // Row 2: std-02 (बहिन अनन्या वर्मा)
    const row2 = lines[2];
    expect(row2).toContain('21098765402');
    expect(row2).toContain('OBC');
    expect(row2).toContain('Female (बहिन)');
  });

  it('falls back safely when student has no explicit PEN or School has no UDISE code', () => {
    const fallbackSchool: School = {
      ...mockSchool,
      udiseCode: undefined
    };

    const studentWithoutPen: Student = {
      id: 'std-custom',
      rollNo: '999',
      name: 'भैया रोहन गुप्ता',
      gender: 'Bhaiya',
      class: 'Class 5',
      section: 'A',
      fatherName: 'श्री आलोक गुप्ता',
      motherName: 'श्रीमती गीता गुप्ता',
      contact: '9876543210',
      address: 'नई दिल्ली',
      dob: '2015-05-10',
      admissionDate: '2021-04-01',
      bloodGroup: 'O+'
    };

    const csv = generateUdisePlusCSV([studentWithoutPen], fallbackSchool);
    const lines = csv.replace(/^\uFEFF/, '').split('\r\n');
    const studentRow = lines[1];

    // Defaults to fallback school code and generated 11-digit PEN
    expect(studentRow).toContain('09510100101');
    expect(studentRow).toMatch(/210987\d{5}/);
    expect(studentRow).toContain('General');
    expect(studentRow).toContain('NO'); // CWSN
  });
});
