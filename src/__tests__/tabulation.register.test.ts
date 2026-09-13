import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import {
  computeGrade,
  computeStudentResultRow,
  computeClassStatistics,
  generateTabulationCSV,
  DEFAULT_SUBJECT_LIST,
  StudentResultRow
} from '../utils/tabulationRegister';
import type { Student, ReportCard } from '../types';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'tr-sheet-test-secret';
process.env.DEVELOPER_ADMIN_PASSCODE = 'tr-dev-passcode';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const StudentModel = require('../../server/models/Student.js');
const ReportCardModel = require('../../server/models/ReportCard.js');

let mongoServer: MongoMemoryServer;
let adminToken: string;
let testSchoolId: string;

describe('Tabulation Register (TR Sheet) Test Suite', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      School.deleteMany({}),
      StudentModel.deleteMany({}),
      ReportCardModel.deleteMany({})
    ]);

    const school = await School.create({
      id: 'ssm-test-school',
      name: 'Saraswati Shishu Mandir Senior Secondary School',
      hindiName: 'सरस्वती शिशु मंदिर वरिष्ठ माध्यमिक विद्यालय',
      tagline: 'सा विद्या या विमुक्तये',
      affiliate: 'Vidya Bharati & CBSE',
      affiliationNo: 'CBSE-SSM-8899',
      established: '1984',
      address: 'Keshav Kunj, Shivaji Nagar',
      city: 'Gorakhpur',
      state: 'Uttar Pradesh',
      prant: 'Goraksh Prant',
      phone: '9450000000',
      email: 'ssm.gorakhpur@vidyabharati.org',
      timings: '07:30 AM - 01:30 PM',
      principalName: 'डॉ. हरिश्चंद्र विद्यालंकार',
      adminPasscode: 'admin123',
      currentAcademicYear: '2025-26',
      plan: 'pro'
    });
    testSchoolId = school.id;

    adminToken = jwt.sign(
      {
        schoolId: testSchoolId,
        role: 'admin',
        schoolName: school.name,
        principalName: school.principalName
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
  });

  // =========================================================================
  // 1. Grade and Division Logic Tests
  // =========================================================================
  describe('Grading and Division Calculation Rules', () => {
    it('correctly maps percentage to Vidya Bharati academic grade scale', () => {
      expect(computeGrade(95)).toBe('A+');
      expect(computeGrade(90)).toBe('A+');
      expect(computeGrade(85)).toBe('A');
      expect(computeGrade(75)).toBe('A');
      expect(computeGrade(68)).toBe('B');
      expect(computeGrade(60)).toBe('B');
      expect(computeGrade(52)).toBe('C');
      expect(computeGrade(45)).toBe('C');
      expect(computeGrade(38)).toBe('D');
      expect(computeGrade(33)).toBe('D');
      expect(computeGrade(32.9)).toBe('E');
      expect(computeGrade(0)).toBe('E');
    });

    const mockStudent: Student = {
      id: 'student-1',
      rollNo: '101',
      name: 'अभिनव शर्मा',
      gender: 'Bhaiya',
      class: 'Class 8',
      section: 'A',
      fatherName: 'श्री रमेश शर्मा',
      motherName: 'श्रीमती सुनीता शर्मा',
      contact: '9876543210',
      address: 'गोरखपुर',
      dob: '2012-05-15',
      admissionDate: '2020-04-01',
      bloodGroup: 'B+'
    };

    it('identifies First Division (प्रथम) for score >= 60% with all subjects passed', () => {
      const report: ReportCard = {
        id: 'rep-1',
        studentId: 'student-1',
        examTerm: 'वार्षिक परीक्षा',
        academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 75, maxMarks: 100, grade: 'A' },
          { subject: 'अंग्रेज़ी', marksObtained: 68, maxMarks: 100, grade: 'B' },
          { subject: 'गणित', marksObtained: 82, maxMarks: 100, grade: 'A' },
          { subject: 'विज्ञान', marksObtained: 70, maxMarks: 100, grade: 'B' }
        ],
        totalMax: 400,
        totalObtained: 295,
        percentage: 73.75,
        grade: 'A',
        acharyaRemarks: 'अति उत्तम',
        attendancePercentage: 92,
        moralConduct: 'श्रेष्ठ'
      };

      const row = computeStudentResultRow(mockStudent, report, ['हिन्दी', 'अंग्रेज़ी', 'गणित', 'विज्ञान']);
      expect(row.percentage).toBeCloseTo(73.75);
      expect(row.division).toBe('प्रथम (I)');
      expect(row.resultStatus).toBe('उत्तीर्ण (PASS)');
      expect(row.failedSubjectsCount).toBe(0);
    });

    it('identifies Second Division (द्वितीय) for score between 45% and 59.9%', () => {
      const report: ReportCard = {
        id: 'rep-2',
        studentId: 'student-1',
        examTerm: 'वार्षिक परीक्षा',
        academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 50, maxMarks: 100, grade: 'C' },
          { subject: 'अंग्रेज़ी', marksObtained: 48, maxMarks: 100, grade: 'C' },
          { subject: 'गणित', marksObtained: 55, maxMarks: 100, grade: 'C' },
          { subject: 'विज्ञान', marksObtained: 52, maxMarks: 100, grade: 'C' }
        ],
        totalMax: 400,
        totalObtained: 205,
        percentage: 51.25,
        grade: 'C',
        acharyaRemarks: 'संतोषजनक',
        attendancePercentage: 85,
        moralConduct: 'उत्तम'
      };

      const row = computeStudentResultRow(mockStudent, report, ['हिन्दी', 'अंग्रेज़ी', 'गणित', 'विज्ञान']);
      expect(row.percentage).toBeCloseTo(51.25);
      expect(row.division).toBe('द्वितीय (II)');
      expect(row.resultStatus).toBe('उत्तीर्ण (PASS)');
      expect(row.failedSubjectsCount).toBe(0);
    });

    it('identifies Third Division (तृतीय) for score between 33% and 44.9%', () => {
      const report: ReportCard = {
        id: 'rep-3',
        studentId: 'student-1',
        examTerm: 'वार्षिक परीक्षा',
        academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 38, maxMarks: 100, grade: 'D' },
          { subject: 'अंग्रेज़ी', marksObtained: 35, maxMarks: 100, grade: 'D' },
          { subject: 'गणित', marksObtained: 40, maxMarks: 100, grade: 'D' },
          { subject: 'विज्ञान', marksObtained: 37, maxMarks: 100, grade: 'D' }
        ],
        totalMax: 400,
        totalObtained: 150,
        percentage: 37.5,
        grade: 'D',
        acharyaRemarks: 'परिश्रम की आवश्यकता',
        attendancePercentage: 78,
        moralConduct: 'उत्तम'
      };

      const row = computeStudentResultRow(mockStudent, report, ['हिन्दी', 'अंग्रेज़ी', 'गणित', 'विज्ञान']);
      expect(row.percentage).toBeCloseTo(37.5);
      expect(row.division).toBe('तृतीय (III)');
      expect(row.resultStatus).toBe('उत्तीर्ण (PASS)');
      expect(row.failedSubjectsCount).toBe(0);
    });

    it('identifies Compartment / Supplementary (पूरक) when exactly 1 subject is below 33%', () => {
      const report: ReportCard = {
        id: 'rep-4',
        studentId: 'student-1',
        examTerm: 'वार्षिक परीक्षा',
        academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 60, maxMarks: 100, grade: 'B' },
          { subject: 'अंग्रेज़ी', marksObtained: 55, maxMarks: 100, grade: 'C' },
          { subject: 'गणित', marksObtained: 22, maxMarks: 100, grade: 'E' }, // < 33% Fail
          { subject: 'विज्ञान', marksObtained: 50, maxMarks: 100, grade: 'C' }
        ],
        totalMax: 400,
        totalObtained: 187,
        percentage: 46.75,
        grade: 'C',
        acharyaRemarks: 'गणित में पूरक परीक्षा अपेक्षित',
        attendancePercentage: 80,
        moralConduct: 'उत्तम'
      };

      const row = computeStudentResultRow(mockStudent, report, ['हिन्दी', 'अंग्रेज़ी', 'गणित', 'विज्ञान']);
      expect(row.failedSubjectsCount).toBe(1);
      expect(row.resultStatus).toBe('पूरक (COMP)');
      expect(row.division).toBe('अनुत्तीर्ण (Fail)');
    });

    it('identifies Fail (अनुत्तीर्ण) when 2 or more subjects are below 33%', () => {
      const report: ReportCard = {
        id: 'rep-5',
        studentId: 'student-1',
        examTerm: 'वार्षिक परीक्षा',
        academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 60, maxMarks: 100, grade: 'B' },
          { subject: 'अंग्रेज़ी', marksObtained: 28, maxMarks: 100, grade: 'E' }, // Fail
          { subject: 'गणित', marksObtained: 20, maxMarks: 100, grade: 'E' }, // Fail
          { subject: 'विज्ञान', marksObtained: 50, maxMarks: 100, grade: 'C' }
        ],
        totalMax: 400,
        totalObtained: 158,
        percentage: 39.5,
        grade: 'D',
        acharyaRemarks: 'पुनरावृत्ति आवश्यक',
        attendancePercentage: 70,
        moralConduct: 'उत्तम'
      };

      const row = computeStudentResultRow(mockStudent, report, ['हिन्दी', 'अंग्रेज़ी', 'गणित', 'विज्ञान']);
      expect(row.failedSubjectsCount).toBe(2);
      expect(row.resultStatus).toBe('अनुत्तीर्ण (FAIL)');
      expect(row.division).toBe('अनुत्तीर्ण (Fail)');
    });

    it('gracefully handles missing report card as PENDING / Awaited', () => {
      const row = computeStudentResultRow(mockStudent, undefined, DEFAULT_SUBJECT_LIST);
      expect(row.division).toBe('अपेक्षित (Awaited)');
      expect(row.resultStatus).toBe('लंबित (PENDING)');
      expect(row.grandTotalObtained).toBe(0);
      expect(row.percentage).toBe(0);
    });
  });

  // =========================================================================
  // 2. Class Aggregate Statistics & Topper Calculation
  // =========================================================================
  describe('Class Aggregate Statistics Computation', () => {
    it('accurately computes class pass %, division breakdown, and identifies class topper', () => {
      const student1: Student = { id: 's1', rollNo: '101', name: 'हर्षित गुप्ता', gender: 'Bhaiya', class: 'Class 8', section: 'A', fatherName: 'श्री राम', motherName: 'श्रीमती सीता', contact: '1', address: '', dob: '', admissionDate: '', bloodGroup: '' };
      const student2: Student = { id: 's2', rollNo: '102', name: 'दीक्षा शर्मा', gender: 'Bahin', class: 'Class 8', section: 'A', fatherName: 'श्री श्याम', motherName: 'श्रीमती राधा', contact: '2', address: '', dob: '', admissionDate: '', bloodGroup: '' };
      const student3: Student = { id: 's3', rollNo: '103', name: 'प्रणव कुमार', gender: 'Bhaiya', class: 'Class 8', section: 'A', fatherName: 'श्री मोहन', motherName: 'श्रीमती गीता', contact: '3', address: '', dob: '', admissionDate: '', bloodGroup: '' };
      const student4: Student = { id: 's4', rollNo: '104', name: 'अंजलि वर्मा', gender: 'Bahin', class: 'Class 8', section: 'A', fatherName: 'श्री कृष्ण', motherName: 'श्रीमती रुक्मिणी', contact: '4', address: '', dob: '', admissionDate: '', bloodGroup: '' };

      const subs = ['हिन्दी', 'अंग्रेज़ी', 'गणित'];

      const row1 = computeStudentResultRow(student1, {
        id: 'r1', studentId: 's1', examTerm: 'वार्षिक परीक्षा', academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 90, maxMarks: 100, grade: 'A+' },
          { subject: 'अंग्रेज़ी', marksObtained: 85, maxMarks: 100, grade: 'A' },
          { subject: 'गणित', marksObtained: 95, maxMarks: 100, grade: 'A+' }
        ],
        totalMax: 300, totalObtained: 270, percentage: 90, grade: 'A+', acharyaRemarks: '', attendancePercentage: 95, moralConduct: ''
      }, subs); // 90% -> 1st Div, PASS, Topper candidate

      const row2 = computeStudentResultRow(student2, {
        id: 'r2', studentId: 's2', examTerm: 'वार्षिक परीक्षा', academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 55, maxMarks: 100, grade: 'C' },
          { subject: 'अंग्रेज़ी', marksObtained: 50, maxMarks: 100, grade: 'C' },
          { subject: 'गणित', marksObtained: 52, maxMarks: 100, grade: 'C' }
        ],
        totalMax: 300, totalObtained: 157, percentage: 52.33, grade: 'C', acharyaRemarks: '', attendancePercentage: 90, moralConduct: ''
      }, subs); // 52.33% -> 2nd Div, PASS

      const row3 = computeStudentResultRow(student3, {
        id: 'r3', studentId: 's3', examTerm: 'वार्षिक परीक्षा', academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 60, maxMarks: 100, grade: 'B' },
          { subject: 'अंग्रेज़ी', marksObtained: 50, maxMarks: 100, grade: 'C' },
          { subject: 'गणित', marksObtained: 25, maxMarks: 100, grade: 'E' } // 1 fail
        ],
        totalMax: 300, totalObtained: 135, percentage: 45, grade: 'C', acharyaRemarks: '', attendancePercentage: 85, moralConduct: ''
      }, subs); // COMP

      const row4 = computeStudentResultRow(student4, undefined, subs); // PENDING

      const stats = computeClassStatistics([row1, row2, row3, row4]);

      expect(stats.totalStudents).toBe(4);
      expect(stats.evaluatedCount).toBe(3);
      expect(stats.passCount).toBe(2);
      expect(stats.firstDivCount).toBe(1);
      expect(stats.secondDivCount).toBe(1);
      expect(stats.thirdDivCount).toBe(0);
      expect(stats.compCount).toBe(1);
      expect(stats.failCount).toBe(0);
      expect(stats.passPercentage).toBeCloseTo(66.67, 1);
      expect(stats.topper).not.toBeNull();
      expect(stats.topper?.name).toBe('हर्षित गुप्ता');
      expect(stats.topper?.rollNo).toBe('101');
      expect(stats.topper?.pct).toBe(90);
    });
  });

  // =========================================================================
  // 3. Tabulation CSV Formatting with UTF-8 BOM
  // =========================================================================
  describe('Tabulation CSV Export Formatting', () => {
    it('prepends UTF-8 BOM and formats columns with Devanagari characters cleanly', () => {
      const student: Student = {
        id: 's1',
        rollNo: '205',
        name: 'शौर्य सिंह',
        gender: 'Bhaiya',
        class: 'Class 9',
        section: 'B',
        fatherName: 'श्री जयपाल सिंह',
        motherName: 'श्रीमती माया देवी',
        contact: '9988776655',
        address: 'गोरखपुर',
        dob: '',
        admissionDate: '',
        bloodGroup: 'O+'
      };

      const subs = ['हिन्दी', 'अंग्रेज़ी', 'गणित'];
      const row = computeStudentResultRow(student, {
        id: 'rep-csv',
        studentId: 's1',
        examTerm: 'वार्षिक परीक्षा',
        academicYear: '2025-26',
        marks: [
          { subject: 'हिन्दी', marksObtained: 85, maxMarks: 100, grade: 'A' },
          { subject: 'अंग्रेज़ी', marksObtained: 78, maxMarks: 100, grade: 'A' },
          { subject: 'गणित', marksObtained: 90, maxMarks: 100, grade: 'A+' }
        ],
        totalMax: 300,
        totalObtained: 253,
        percentage: 84.33,
        grade: 'A',
        acharyaRemarks: '',
        attendancePercentage: 92,
        moralConduct: ''
      }, subs);

      const csv = generateTabulationCSV([row], subs);

      // Must start with UTF-8 Byte Order Mark
      expect(csv.startsWith('\uFEFF')).toBe(true);

      // Check header row contains Devanagari subject column names
      expect(csv).toContain('हिन्दी_प्राप्तांक');
      expect(csv).toContain('गणित_प्राप्तांक');
      expect(csv).toContain('कुल_पूर्णांक');
      expect(csv).toContain('कुल_प्राप्तांक');
      expect(csv).toContain('श्रेणी');

      // Check student data row
      expect(csv).toContain('"शौर्य सिंह"');
      expect(csv).toContain('"श्री जयपाल सिंह"');
      expect(csv).toContain('Class 9');
      expect(csv).toContain('प्रथम (I)');
      expect(csv).toContain('उत्तीर्ण (PASS)');
    });
  });

  // =========================================================================
  // 4. API Reports Filter Integration Test
  // =========================================================================
  describe('Backend /reports Filter API Integration', () => {
    it('filters report cards by examTerm and academicYear correctly', async () => {
      // Create student
      const studentDoc = await StudentModel.create({
        id: 'std-301',
        schoolId: testSchoolId,
        rollNo: '301',
        name: 'अमन त्रिपाठी',
        gender: 'Bhaiya',
        class: 'Class 7',
        section: 'A',
        fatherName: 'श्री रामनरेश त्रिपाठी',
        contact: '9871112233',
        admissionDate: '2021-04-01',
        bloodGroup: 'A+'
      });

      // Report 1: Annual Exam 2025-26
      await ReportCardModel.create({
        id: 'rc-1',
        schoolId: testSchoolId,
        studentId: 'std-301',
        examTerm: 'वार्षिक परीक्षा',
        academicYear: '2025-26',
        marks: [{ subject: 'हिन्दी', marksObtained: 80, maxMarks: 100, grade: 'A' }],
        totalMax: 100,
        totalObtained: 80,
        percentage: 80,
        grade: 'A',
        acharyaRemarks: 'उत्कृष्ट',
        attendancePercentage: 94,
        moralConduct: 'श्रेष्ठ'
      });

      // Report 2: Half-Yearly Exam 2025-26
      await ReportCardModel.create({
        id: 'rc-2',
        schoolId: testSchoolId,
        studentId: 'std-301',
        examTerm: 'अर्धवार्षिक परीक्षा',
        academicYear: '2025-26',
        marks: [{ subject: 'हिन्दी', marksObtained: 72, maxMarks: 100, grade: 'B' }],
        totalMax: 100,
        totalObtained: 72,
        percentage: 72,
        grade: 'B',
        acharyaRemarks: 'अच्छा',
        attendancePercentage: 90,
        moralConduct: 'उत्तम'
      });

      // Test 1: Query annual exam only
      const annualRes = await request(app)
        .get(`/api/reports?schoolId=${testSchoolId}&examTerm=${encodeURIComponent('वार्षिक परीक्षा')}&academicYear=2025-26`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(annualRes.status).toBe(200);
      expect(Array.isArray(annualRes.body)).toBe(true);
      expect(annualRes.body.length).toBe(1);
      expect(annualRes.body[0].examTerm).toBe('वार्षिक परीक्षा');
      expect(annualRes.body[0].percentage).toBe(80);

      // Test 2: Query half-yearly exam only
      const halfYearlyRes = await request(app)
        .get(`/api/reports?schoolId=${testSchoolId}&examTerm=${encodeURIComponent('अर्धवार्षिक परीक्षा')}&academicYear=2025-26`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(halfYearlyRes.status).toBe(200);
      expect(halfYearlyRes.body.length).toBe(1);
      expect(halfYearlyRes.body[0].examTerm).toBe('अर्धवार्षिक परीक्षा');
      expect(halfYearlyRes.body[0].percentage).toBe(72);

      // Test 3: Query nonexistent term
      const nonexistentRes = await request(app)
        .get(`/api/reports?schoolId=${testSchoolId}&examTerm=${encodeURIComponent('प्रथम इकाई परीक्षा')}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(nonexistentRes.status).toBe(200);
      expect(nonexistentRes.body.length).toBe(0);
    });
  });
});
