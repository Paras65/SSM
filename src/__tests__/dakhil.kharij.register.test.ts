import { describe, it, expect } from 'vitest';
import {
  convertDateToHindiWords,
  convertYearToHindiWords,
  formatDateDDMMYYYY,
  generateDakhilKharijCSV,
  getScholarNumber
} from '../utils/dakhilKharijExport';
import type { School, Student } from '../types';

describe('Dakhil-Kharij (General Admission & Withdrawal Register) Suite', () => {
  const mockSchool: School = {
    id: 'sch-dakhil-01',
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

  const mockStudents: Student[] = [
    {
      id: 'std-dakhil-01',
      rollNo: '101',
      name: 'भैया आर्यन शर्मा',
      gender: 'Bhaiya',
      class: 'Class 5',
      section: 'A',
      fatherName: 'श्री सुनील शर्मा',
      motherName: 'श्रीमती सुनीता शर्मा',
      contact: '9876543210',
      address: 'केशव नगर, गोरखपुर',
      dob: '2015-05-10',
      admissionDate: '2020-04-01',
      bloodGroup: 'B+',
      status: 'active',
      pen: '21098765401',
      socialCategory: 'General'
    },
    {
      id: 'std-kharij-02',
      rollNo: '102',
      name: 'बहिन अनन्या वर्मा',
      gender: 'Bahin',
      class: 'Class 8',
      section: 'B',
      fatherName: 'श्री राजेश वर्मा',
      motherName: 'श्रीमती नीलम वर्मा',
      contact: '9876543211',
      address: 'राप्ती नगर, गोरखपुर',
      dob: '2012-08-15',
      admissionDate: '2018-07-01',
      bloodGroup: 'O+',
      status: 'transferred', // Withdrawn / Kharij
      pen: '21098765402',
      socialCategory: 'OBC'
    }
  ];

  describe('1. Hindi Devanagari Date-to-Words Conversion', () => {
    it('correctly converts years to Hindi words', () => {
      expect(convertYearToHindiWords(2000)).toBe('दो हजार');
      expect(convertYearToHindiWords(2015)).toBe('दो हजार पंद्रह');
      expect(convertYearToHindiWords(2024)).toBe('दो हजार चौबीस');
      expect(convertYearToHindiWords(1995)).toBe('उन्नीस सौ पंचानवे');
    });

    it('converts date of birth into official legal Hindi words format', () => {
      // 10 May 2015 -> "दस मई दो हजार पंद्रह"
      const words1 = convertDateToHindiWords('2015-05-10');
      expect(words1).toBe('दस मई दो हजार पंद्रह');

      // 15 August 2012 -> "पंद्रह अगस्त दो हजार बारह"
      const words2 = convertDateToHindiWords('2012-08-15');
      expect(words2).toBe('पंद्रह अगस्त दो हजार बारह');

      // 1 January 2020 -> "एक जनवरी दो हजार बीस"
      const words3 = convertDateToHindiWords('2020-01-01');
      expect(words3).toBe('एक जनवरी दो हजार बीस');
    });

    it('formats dates consistently to DD-MM-YYYY', () => {
      expect(formatDateDDMMYYYY('2015-05-10')).toBe('10-05-2015');
      expect(formatDateDDMMYYYY('2024-12-25')).toBe('25-12-2024');
      expect(formatDateDDMMYYYY('')).toBe('');
    });
  });

  describe('2. Scholar / S.R. Number Derivation', () => {
    it('extracts rollNo or derives sequential scholar number', () => {
      expect(getScholarNumber(mockStudents[0], 0)).toBe('101');
      expect(getScholarNumber(mockStudents[1], 1)).toBe('102');

      const autoStudent: Student = {
        ...mockStudents[0],
        rollNo: 'SSM-2025-050',
        id: 'std-2050'
      };
      expect(getScholarNumber(autoStudent, 49)).toBe('2050');
    });
  });

  describe('3. Dakhil-Kharij CSV Export Generation', () => {
    it('generates CSV with UTF-8 BOM and metadata header', () => {
      const csv = generateDakhilKharijCSV(mockStudents, mockSchool);

      // Starts with \uFEFF Byte Order Mark for Excel Hindi rendering
      expect(csv.charCodeAt(0)).toBe(0xfeff);

      // Contains School name and UDISE metadata
      expect(csv).toContain('सरस्वती शिशु मंदिर उच्चतर माध्यमिक विद्यालय');
      expect(csv).toContain('09510100101');
      expect(csv).toContain('दाखिल-खारिज पंजिका');
    });

    it('correctly maps दाखिल (active) and खारिज (withdrawn) status columns', () => {
      const csv = generateDakhilKharijCSV(mockStudents, mockSchool);
      const lines = csv.replace(/^\uFEFF/, '').split('\r\n');

      // Find Aryan row (active -> दाखिल)
      const aryanLine = lines.find(l => l.includes('भैया आर्यन शर्मा'));
      expect(aryanLine).toBeDefined();
      expect(aryanLine).toContain('दाखिल (अध्ययनरत)');
      expect(aryanLine).toContain('दस मई दो हजार पंद्रह');
      expect(aryanLine).toContain('General');

      // Find Ananya row (transferred -> खारिज)
      const ananyaLine = lines.find(l => l.includes('बहिन अनन्या वर्मा'));
      expect(ananyaLine).toBeDefined();
      expect(ananyaLine).toContain('खारिज (Withdrawn/TC)');
      expect(ananyaLine).toContain('पंद्रह अगस्त दो हजार बारह');
      expect(ananyaLine).toContain('OBC');
      expect(ananyaLine).toContain('TC/SSM/102');
    });
  });
});
