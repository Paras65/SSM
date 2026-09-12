import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'negative-test-jwt-secret';
process.env.DEVELOPER_ADMIN_PASSCODE = 'negative-test-developer-secret';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Staff = require('../../server/models/Staff.js');
const Fee = require('../../server/models/Fee.js');
const Admission = require('../../server/models/Admission.js');
const Leave = require('../../server/models/Leave.js');
const Book = require('../../server/models/Book.js');
const BookIssue = require('../../server/models/BookIssue.js');
const Homework = require('../../server/models/Homework.js');

let mongoServer: MongoMemoryServer;
let schoolAToken: string;
let schoolBToken: string;
let developerToken: string;
let studentAToken: string;
let teacherAToken: string;
let expiredToken: string;

describe('Comprehensive Negative Testing & Fault Tolerance Suite', () => {
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
      Staff.deleteMany({}),
      Fee.deleteMany({}),
      Admission.deleteMany({}),
      Leave.deleteMany({}),
      Book.deleteMany({}),
      BookIssue.deleteMany({}),
      Homework.deleteMany({})
    ]);

    // Seed test schools
    await School.create([
      {
        id: 'school-a',
        name: 'SSM Branch A',
        hindiName: 'सरस्वती शिशु मंदिर शाखा अ',
        address: 'Gorakhpur',
        city: 'Gorakhpur',
        state: 'UP',
        prant: 'Goraksh',
        phone: '+91 91111 00000',
        email: 'branch-a@ssm.test',
        principalName: 'Principal A',
        adminPasscode: 'passcode-a-1234'
      },
      {
        id: 'school-b',
        name: 'SSM Branch B',
        hindiName: 'सरस्वती शिशु मंदिर शाखा ब',
        address: 'Lucknow',
        city: 'Lucknow',
        state: 'UP',
        prant: 'Avadh',
        phone: '+91 92222 00000',
        email: 'branch-b@ssm.test',
        principalName: 'Principal B',
        adminPasscode: 'passcode-b-5678'
      }
    ]);

    // Seed student in school-a
    await Student.create({
      id: 'stu-a-101',
      schoolId: 'school-a',
      rollNo: '101',
      name: 'Bhaiya Raman',
      gender: 'Bhaiya',
      class: 'Class 8',
      section: 'A',
      fatherName: 'Parent Raman',
      contact: '+91 98765 43210'
    });

    // Seed student in school-b
    await Student.create({
      id: 'stu-b-201',
      schoolId: 'school-b',
      rollNo: '201',
      name: 'Bahin Priya',
      gender: 'Bahin',
      class: 'Class 9',
      section: 'B',
      fatherName: 'Parent Priya',
      contact: '+91 98765 00000'
    });

    // Seed teacher in school-a
    await Staff.create({
      id: 'stf-a-01',
      schoolId: 'school-a',
      name: 'Acharya Sharma',
      gender: 'Acharya',
      designation: 'Varishtha Acharya',
      phone: '+91 98111 22233',
      pin: '4321',
      status: 'Active'
    });

    // Generate test JWTs
    schoolAToken = jwt.sign({ schoolId: 'school-a', role: 'admin', schoolName: 'SSM Branch A' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    schoolBToken = jwt.sign({ schoolId: 'school-b', role: 'admin', schoolName: 'SSM Branch B' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    developerToken = jwt.sign({ schoolId: '*', role: 'developer', schoolName: 'SSM Developer' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    studentAToken = jwt.sign({ schoolId: 'school-a', role: 'student', studentId: 'stu-a-101', studentClass: 'Class 8' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    teacherAToken = jwt.sign({ schoolId: 'school-a', role: 'teacher', staffId: 'stf-a-01', name: 'Acharya Sharma' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    expiredToken = jwt.sign({ schoolId: 'school-a', role: 'admin' }, process.env.JWT_SECRET as string, { expiresIn: '-1s' });
  });

  // 1. AUTHENTICATION & TOKEN NEGATIVE TESTS
  describe('1. Authentication & Token Vulnerability Handling', () => {
    it('rejects admin login without passcode or with empty payload', async () => {
      const res1 = await request(app).post('/api/auth/login').send({});
      expect(res1.status).toBe(400);

      const res2 = await request(app).post('/api/auth/login').send({ schoolId: 'school-a', passcode: '' });
      expect(res2.status).toBe(400);
    });

    it('rejects incorrect admin passcode with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app).post('/api/auth/login').send({
        schoolId: 'school-a',
        passcode: 'wrong-passcode'
      });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejects developer login with incorrect passcode', async () => {
      const res = await request(app).post('/api/auth/login').send({
        schoolId: '__developer__',
        passcode: 'invalid-developer-key'
      });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('INVALID_DEVELOPER_CREDENTIALS');
    });

    it('rejects student login with missing parameters or mismatched credentials', async () => {
      const missing = await request(app).post('/api/auth/student-login').send({ schoolId: 'school-a' });
      expect(missing.status).toBe(400);

      const wrong = await request(app).post('/api/auth/student-login').send({
        schoolId: 'school-a',
        rollNo: '999',
        contact: '9876543210'
      });
      expect(wrong.status).toBe(401);
      expect(wrong.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejects teacher login with missing fields, wrong phone or wrong PIN', async () => {
      const missing = await request(app).post('/api/auth/teacher-login').send({ phone: '' });
      expect(missing.status).toBe(400);

      const notFound = await request(app).post('/api/auth/teacher-login').send({
        phone: '9000000000',
        pin: '4321'
      });
      expect(notFound.status).toBe(401);
      expect(notFound.body.code).toBe('INVALID_CREDENTIALS');

      const wrongPin = await request(app).post('/api/auth/teacher-login').send({
        phone: '9811122233',
        pin: '0000'
      });
      expect(wrongPin.status).toBe(401);
      expect(wrongPin.body.code).toBe('INVALID_PIN');
    });

    it('rejects requests without Authorization header on protected endpoints', async () => {
      const res = await request(app).get('/api/students');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_REQUIRED');
    });

    it('rejects requests with non-Bearer header format', async () => {
      const res = await request(app).get('/api/students').set('Authorization', 'Basic 12345');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_REQUIRED');
    });

    it('rejects corrupted or tampered JWT tokens', async () => {
      const res = await request(app).get('/api/students').set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.corrupted.payload');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('TOKEN_INVALID');
    });

    it('rejects expired JWT tokens with 401 TOKEN_EXPIRED', async () => {
      const res = await request(app).get('/api/students').set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('TOKEN_EXPIRED');
    });

    it('blocks student role token from accessing admin-only endpoints', async () => {
      const staffRes = await request(app).get('/api/staff').set('Authorization', `Bearer ${studentAToken}`);
      expect(staffRes.status).toBe(403);
      expect(staffRes.body.code).toBe('ADMIN_ROLE_REQUIRED');

      const feeRes = await request(app).get('/api/fees').set('Authorization', `Bearer ${studentAToken}`);
      expect(feeRes.status).toBe(403);
      expect(feeRes.body.code).toBe('ADMIN_ROLE_REQUIRED');
    });
  });

  // 2. MULTI-TENANT & CROSS-BRANCH SCOPE VIOLATIONS
  describe('2. Multi-Tenant Cross-Branch Scope Violation Enforcement', () => {
    it('prevents branch admin from querying students of another branch', async () => {
      const res = await request(app)
        .get('/api/students?schoolId=school-b')
        .set('Authorization', `Bearer ${schoolAToken}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('prevents branch admin from creating a student under another branch', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          schoolId: 'school-b',
          rollNo: '999',
          name: 'Sneaky Student',
          gender: 'Bhaiya',
          class: 'Class 8',
          fatherName: 'Parent',
          contact: '9876543210'
        });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('prevents branch admin from posting attendance for another branch', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          schoolId: 'school-b',
          studentId: 'stu-b-201',
          date: '2026-09-13',
          status: 'Present'
        });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('prevents branch admin from including another branch in bulk attendance updates', async () => {
      const res = await request(app)
        .post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          updates: [
            { studentId: 'stu-a-101', date: '2026-09-13', status: 'Present', schoolId: 'school-a' },
            { studentId: 'stu-b-201', date: '2026-09-13', status: 'Present', schoolId: 'school-b' }
          ]
        });
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('prevents branch admin from modifying a student of another branch (returns 404)', async () => {
      const res = await request(app)
        .put('/api/students/stu-b-201')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ name: 'Tampered Name' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Student not found');
    });

    it('prevents branch admin from deleting a student of another branch (returns 404)', async () => {
      const res = await request(app)
        .delete('/api/students/stu-b-201')
        .set('Authorization', `Bearer ${schoolAToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Student not found');
    });

    it('prevents student from accessing another branch homework', async () => {
      const res = await request(app)
        .get('/api/homework?schoolId=school-b')
        .set('Authorization', `Bearer ${studentAToken}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('prevents student from accessing homework of a different class', async () => {
      const res = await request(app)
        .get('/api/homework?class=Class 10')
        .set('Authorization', `Bearer ${studentAToken}`);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CLASS_SCOPE_FORBIDDEN');
    });
  });

  // 3. SCHEMA VALIDATION & MALFORMED INPUT HANDLING
  describe('3. Schema Validation & Malformed Input Rejection', () => {
    it('rejects admission inquiry missing required fields', async () => {
      const res = await request(app).post('/api/admissions').send({
        studentName: 'Test'
        // Missing phone, applyingClass, gender, etc.
      });
      expect(res.status).toBe(400);
    });

    it('rejects admission inquiry without guardian consent', async () => {
      const res = await request(app).post('/api/admissions').send({
        schoolId: 'school-a',
        studentName: 'Test Child',
        gender: 'Bhaiya',
        applyingClass: 'Class 6',
        phone: '+91 98765 43210',
        guardianConsent: false
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('सहमति');
    });

    it('rejects admission inquiry with invalid phone format', async () => {
      const res = await request(app).post('/api/admissions').send({
        schoolId: 'school-a',
        studentName: 'Test Child',
        gender: 'Bhaiya',
        applyingClass: 'Class 6',
        phone: 'invalid-alpha-phone',
        guardianConsent: true
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('मोबाइल');
    });

    it('rejects admission inquiry with oversized string payload (>120 chars in name)', async () => {
      const res = await request(app).post('/api/admissions').send({
        schoolId: 'school-a',
        studentName: 'A'.repeat(200),
        gender: 'Bhaiya',
        applyingClass: 'Class 6',
        phone: '+91 98765 43210',
        guardianConsent: true
      });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('लंबा');
    });

    it('rejects student creation with invalid gender enum', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          rollNo: '102',
          name: 'Invalid Gender Student',
          gender: 'Alien',
          class: 'Class 8',
          fatherName: 'Parent',
          contact: '9876543210'
        });
      expect(res.status).toBe(400);
    });

    it('rejects bulk student creation with empty or invalid payload', async () => {
      const res = await request(app)
        .post('/api/students/bulk')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ students: [] });
      expect(res.status).toBe(400);
    });

    it('rejects single attendance with missing studentId or date', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ status: 'Present' });
      expect(res.status).toBe(400);
    });

    it('rejects single attendance with invalid status enum', async () => {
      const res = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          studentId: 'stu-a-101',
          date: '2026-09-13',
          status: 'Vacation'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('अमान्य उपस्थिति स्थिति');
    });

    it('rejects bulk attendance with empty updates or invalid status in row', async () => {
      const emptyRes = await request(app)
        .post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ updates: [] });
      expect(emptyRes.status).toBe(400);

      const invalidEnumRes = await request(app)
        .post('/api/attendance/bulk')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          updates: [
            { studentId: 'stu-a-101', date: '2026-09-13', status: 'InvalidStatus' }
          ]
        });
      expect(invalidEnumRes.status).toBe(400);
    });

    it('rejects marks bulk upload without subject or marksList array', async () => {
      const res = await request(app)
        .post('/api/exams/marks-bulk')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ subject: 'Ganit' });
      expect(res.status).toBe(400);
    });

    it('returns 404 when attempting to pay a non-existent fee record', async () => {
      const res = await request(app)
        .put('/api/fees/non-existent-fee-id/pay')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ paymentMode: 'UPI' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Fee record not found');
    });

    it('returns 404 when approving a non-existent admission inquiry', async () => {
      const res = await request(app)
        .put('/api/admissions/non-existent-adm-id/approve')
        .set('Authorization', `Bearer ${schoolAToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Admission not found');
    });

    it('returns 400 when returning a book with missing issueId', async () => {
      const res = await request(app)
        .post('/api/library/return')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('issueId');
    });

    it('returns 404 when returning a book with non-existent issueId', async () => {
      const res = await request(app)
        .post('/api/library/return')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ issueId: 'non-existent-issue' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Issue record not found');
    });

    it('returns 400 when updating leave with invalid status value', async () => {
      const res = await request(app)
        .patch('/api/leaves/lv-123/status')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ status: 'SuperApproved' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('अमान्य अवकाश स्थिति');
    });

    it('returns 404 when adjusting inventory stock for non-existent item', async () => {
      const res = await request(app)
        .post('/api/inventory/non-existent-inv-item/stock')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ delta: 5 });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Item not found');
    });
  });

  // 4. ROUTING & PARSER RESILIENCE
  describe('4. Routing & Malformed Request Resilience', () => {
    it('returns JSON 404 for non-existent API routes', async () => {
      const res = await request(app).get('/api/completely-non-existent-route-12345');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
      expect(res.body.error).toBeDefined();
    });

    it('gracefully handles malformed JSON payload with 400 INVALID_JSON_SYNTAX', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json: malformed');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_JSON_SYNTAX');
    });
  });
});
