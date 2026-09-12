import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'session-management-test-secret';
process.env.DEVELOPER_ADMIN_PASSCODE = 'session-dev-passcode';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Exam = require('../../server/models/Exam.js');
const Fee = require('../../server/models/Fee.js');
const Attendance = require('../../server/models/Attendance.js');
const AuditLog = require('../../server/models/AuditLog.js');
const { calculateCurrentAcademicYear, isValidAcademicYearFormat } = require('../../server/utils/sessionHelper.js');

let mongoServer: MongoMemoryServer;
let adminToken: string;

describe('Comprehensive Academic Session & Auth Session Management Suite', () => {
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
      Student.deleteMany({}),
      Exam.deleteMany({}),
      Fee.deleteMany({}),
      Attendance.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    await School.create({
      id: 'school-a',
      name: 'SSM Gorakhpur',
      hindiName: 'सरस्वती शिशु मंदिर गोरखपुर',
      address: 'Civil Lines, Gorakhpur',
      city: 'Gorakhpur',
      state: 'Uttar Pradesh',
      prant: 'गोरक्ष प्रांत',
      phone: '0551-2334455',
      email: 'gorakhpur@ssm.org.in',
      principalName: 'श्री अशोक कुमार',
      adminPasscode: '1952',
      currentAcademicYear: '2025-26',
      tokenVersion: 1
    });

    adminToken = jwt.sign(
      { schoolId: 'school-a', role: 'admin', schoolName: 'SSM Gorakhpur', tokenVersion: 1 },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
  });

  describe('1. Dynamic Academic Year Helper (Indian Calendar April-March)', () => {
    it('correctly determines academic year across calendar year boundaries', () => {
      // April 1, 2026 -> 2026-27
      expect(calculateCurrentAcademicYear(new Date('2026-04-01'))).toBe('2026-27');
      // September 15, 2026 -> 2026-27
      expect(calculateCurrentAcademicYear(new Date('2026-09-15'))).toBe('2026-27');
      // December 31, 2026 -> 2026-27
      expect(calculateCurrentAcademicYear(new Date('2026-12-31'))).toBe('2026-27');
      // January 5, 2027 -> 2026-27
      expect(calculateCurrentAcademicYear(new Date('2027-01-05'))).toBe('2026-27');
      // March 31, 2027 -> 2026-27
      expect(calculateCurrentAcademicYear(new Date('2027-03-31'))).toBe('2026-27');
      // April 1, 2027 -> 2027-28
      expect(calculateCurrentAcademicYear(new Date('2027-04-01'))).toBe('2027-28');
    });

    it('validates academic year format strings', () => {
      expect(isValidAcademicYearFormat('2025-26')).toBe(true);
      expect(isValidAcademicYearFormat('2026-27')).toBe(true);
      expect(isValidAcademicYearFormat('2025-2026')).toBe(false);
      expect(isValidAcademicYearFormat('invalid')).toBe(false);
    });
  });

  describe('2. Student Login & Sibling Collision Protection', () => {
    beforeEach(async () => {
      // Seed two siblings with the same father contact and same roll number in different classes
      await Student.create([
        {
          id: 'stu-brother-1',
          schoolId: 'school-a',
          rollNo: '101',
          name: 'अमित शर्मा',
          gender: 'Bhaiya',
          class: 'Class 4',
          section: 'A',
          fatherName: 'श्री राजेश शर्मा',
          contact: '+91 9876543210',
          academicYear: '2025-26',
          status: 'active'
        },
        {
          id: 'stu-sister-2',
          schoolId: 'school-a',
          rollNo: '101',
          name: 'प्रिया शर्मा',
          gender: 'Bahin',
          class: 'Class 8',
          section: 'B',
          fatherName: 'श्री राजेश शर्मा',
          contact: '+91 9876543210',
          academicYear: '2025-26',
          status: 'active'
        }
      ]);
    });

    it('returns 422 AMBIGUOUS_STUDENT_MATCH if roll and phone match multiple siblings without class', async () => {
      const res = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId: 'school-a',
          rollNo: '101',
          contact: '9876543210'
        });

      expect(res.status).toBe(422);
      expect(res.body.code).toBe('AMBIGUOUS_STUDENT_MATCH');
      expect(res.body.availableClasses).toContain('Class 4');
      expect(res.body.availableClasses).toContain('Class 8');
    });

    it('successfully logs in brother when Class 4 is specified', async () => {
      const res = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId: 'school-a',
          rollNo: '101',
          contact: '9876543210',
          studentClass: 'Class 4'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student.name).toBe('अमित शर्मा');
      expect(res.body.student.class).toBe('Class 4');
    });

    it('successfully logs in sister when Class 8 is specified', async () => {
      const res = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId: 'school-a',
          rollNo: '101',
          contact: '9876543210',
          studentClass: 'Class 8'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student.name).toBe('प्रिया शर्मा');
      expect(res.body.student.class).toBe('Class 8');
    });
  });

  describe('3. Student Batch Promotion & Session Rollover', () => {
    beforeEach(async () => {
      await Student.create([
        {
          id: 'stu-promo-01',
          schoolId: 'school-a',
          rollNo: '10',
          name: 'रोहित सिंह',
          gender: 'Bhaiya',
          class: 'Class 5',
          section: 'A',
          fatherName: 'श्री वीरेन्द्र सिंह',
          contact: '+91 9911223344',
          academicYear: '2024-25',
          status: 'active'
        },
        {
          id: 'stu-promo-02',
          schoolId: 'school-a',
          rollNo: '25',
          name: 'कविता मौर्या',
          gender: 'Bahin',
          class: 'Class 10',
          section: 'A',
          fatherName: 'श्री दिनेश मौर्या',
          contact: '+91 9911223355',
          academicYear: '2024-25',
          status: 'active'
        }
      ]);
    });

    it('promotes student to Class 6, archiving Class 5 into academicHistory', async () => {
      const res = await request(app)
        .post('/api/students/promote')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schoolId: 'school-a',
          fromAcademicYear: '2024-25',
          toAcademicYear: '2025-26',
          promotions: [
            {
              studentId: 'stu-promo-01',
              nextClass: 'Class 6',
              nextSection: 'A',
              nextRollNo: '12',
              action: 'promote'
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);

      const updated = await Student.findOne({ id: 'stu-promo-01' });
      expect(updated.class).toBe('Class 6');
      expect(updated.rollNo).toBe('12');
      expect(updated.academicYear).toBe('2025-26');
      expect(updated.status).toBe('active');
      expect(updated.academicHistory.length).toBe(1);
      expect(updated.academicHistory[0].academicYear).toBe('2024-25');
      expect(updated.academicHistory[0].class).toBe('Class 5');
      expect(updated.academicHistory[0].status).toBe('promote');
    });

    it('marks Class 10 pass-out as alumni upon graduation', async () => {
      const res = await request(app)
        .post('/api/students/promote')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schoolId: 'school-a',
          fromAcademicYear: '2024-25',
          toAcademicYear: '2025-26',
          promotions: [
            {
              studentId: 'stu-promo-02',
              action: 'alumni',
              remarks: 'हाईस्कूल बोर्ड परीक्षा उत्तीर्ण'
            }
          ]
        });

      expect(res.status).toBe(200);
      const student = await Student.findOne({ id: 'stu-promo-02' });
      expect(student.status).toBe('alumni');
      expect(student.academicHistory.length).toBe(1);
      expect(student.academicHistory[0].status).toBe('alumni');
    });
  });

  describe('4. Fee Arrears Rollover Across Academic Sessions', () => {
    beforeEach(async () => {
      await Fee.create([
        {
          id: 'fee-old-01',
          schoolId: 'school-a',
          studentId: 'stu-fee-01',
          term: 'वार्षिक शुल्क',
          academicYear: '2024-25',
          totalAmount: 5000,
          paidAmount: 3000,
          status: 'Partial'
        },
        {
          id: 'fee-old-02',
          schoolId: 'school-a',
          studentId: 'stu-fee-02',
          term: 'चतुर्थ किस्त',
          academicYear: '2024-25',
          totalAmount: 1500,
          paidAmount: 0,
          status: 'Pending'
        },
        {
          id: 'fee-old-03',
          schoolId: 'school-a',
          studentId: 'stu-fee-03',
          term: 'वार्षिक शुल्क',
          academicYear: '2024-25',
          totalAmount: 4000,
          paidAmount: 4000,
          status: 'Paid'
        }
      ]);
    });

    it('rolls forward unpaid dues into new session and prevents double rollover', async () => {
      const res = await request(app)
        .post('/api/fees/rollover-arrears')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schoolId: 'school-a',
          fromAcademicYear: '2024-25',
          toAcademicYear: '2025-26'
        });

      expect(res.status).toBe(200);
      expect(res.body.rolledOverCount).toBe(2);
      expect(res.body.totalArrearsAmount).toBe(3500); // 2000 (from fee-old-01) + 1500 (from fee-old-02)

      const rolled01 = await Fee.findOne({ studentId: 'stu-fee-01', academicYear: '2025-26' });
      expect(rolled01).not.toBeNull();
      expect(rolled01.term).toBe('Past Session Arrears');
      expect(rolled01.totalAmount).toBe(2000);
      expect(rolled01.status).toBe('Pending');

      // Second rollover run: should NOT duplicate
      const secondRun = await request(app)
        .post('/api/fees/rollover-arrears')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schoolId: 'school-a',
          fromAcademicYear: '2024-25',
          toAcademicYear: '2025-26'
        });

      expect(secondRun.status).toBe(200);
      expect(secondRun.body.rolledOverCount).toBe(0);
    });
  });

  describe('5. Exam Freezing & Historical Marks Immutability', () => {
    beforeEach(async () => {
      await Exam.create({
        id: 'exam-annual-2024',
        schoolId: 'school-a',
        title: 'वार्षिक परीक्षा 2024',
        academicYear: '2024-25',
        term: 'वार्षिक परीक्षा',
        classes: ['Class 5'],
        startDate: '2025-03-01',
        endDate: '2025-03-15',
        isLocked: false
      });
    });

    it('locks exam and blocks subsequent marks modifications with 403 EXAM_LOCKED', async () => {
      // 1. Lock the exam
      const lockRes = await request(app)
        .patch('/api/exams/exam-annual-2024/lock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isLocked: true });

      expect(lockRes.status).toBe(200);
      expect(lockRes.body.isLocked).toBe(true);

      // 2. Attempt to update marks for locked exam
      const marksRes = await request(app)
        .post('/api/exams/marks-bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schoolId: 'school-a',
          examTerm: 'वार्षिक परीक्षा',
          academicYear: '2024-25',
          subject: 'गणित',
          marksList: [{ studentId: 'stu-01', marksObtained: 85 }]
        });

      expect(marksRes.status).toBe(403);
      expect(marksRes.body.code).toBe('EXAM_LOCKED');

      // 3. Attempt to edit locked exam details
      const editRes = await request(app)
        .put('/api/exams/exam-annual-2024')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Tampered Title' });

      expect(editRes.status).toBe(403);
      expect(editRes.body.code).toBe('EXAM_LOCKED');
    });
  });

  describe('6. Admin Session Revocation on Passcode Change', () => {
    it('invalidates existing admin JWT when school passcode is changed', async () => {
      // Initial active token with tokenVersion: 1
      const checkRes = await request(app)
        .get('/api/schools/school-a')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(checkRes.status).toBe(200);

      // Principal changes admin passcode -> triggers tokenVersion increment
      const updateRes = await request(app)
        .put('/api/schools/school-a')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ adminPasscode: '2026-new-passcode' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.tokenVersion).toBe(2);

      // Old token with tokenVersion: 1 must now be rejected with 401 SESSION_REVOKED
      const staleRes = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(staleRes.status).toBe(401);
      expect(staleRes.body.code).toBe('SESSION_REVOKED');
    });
  });

  describe('7. Attendance Session and Class Tracking', () => {
    it('records attendance with academicYear and class automatically', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'stu-att-01',
          date: '2026-05-10',
          status: 'Present',
          class: 'Class 7'
        });

      expect(res.status).toBe(200);
      expect(res.body.academicYear).toBe('2026-27');
      expect(res.body.class).toBe('Class 7');

      // Query by session and class
      const queryRes = await request(app)
        .get('/api/attendance?academicYear=2026-27&class=Class 7')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(queryRes.status).toBe(200);
      expect(queryRes.body.length).toBe(1);
    });
  });
});

