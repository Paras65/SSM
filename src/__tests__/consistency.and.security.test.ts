import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'consistency-test-jwt-secret';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Fee = require('../../server/models/Fee.js');
const Attendance = require('../../server/models/Attendance.js');
const ReportCard = require('../../server/models/ReportCard.js');
const Leave = require('../../server/models/Leave.js');

let mongoServer: MongoMemoryServer;
let adminToken: string;
const schoolId = 'ssm-ayodhya-test';

describe('Cross-Module Consistency & Security Hardening Suite', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    adminToken = jwt.sign(
      { schoolId, role: 'admin', schoolName: 'एसएसएम अयोध्या' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await School.deleteMany({});
    await Student.deleteMany({});
    await Fee.deleteMany({});
    await Attendance.deleteMany({});
    await ReportCard.deleteMany({});
    await Leave.deleteMany({});

    await School.create({
      id: schoolId,
      name: 'Saraswati Shishu Mandir Ayodhya',
      hindiName: 'सरस्वती शिशु मंदिर अयोध्या',
      city: 'Ayodhya',
      state: 'Uttar Pradesh',
      prant: 'अवध प्रांत',
      address: 'राम पथ, अयोध्या धाम',
      phone: '+91 98765 00000',
      email: 'ayodhya@ssm.edu.in',
      principalName: 'श्री राम शरण जी',
      adminPasscode: '2026'
    });
  });

  describe('1. Active Record Cascade on Student Update', () => {
    it('synchronizes active attendance and leave records when student class or name is updated', async () => {
      const student = await Student.create({
        id: 'stu-cascade-101',
        schoolId,
        rollNo: '101',
        name: 'भैया केशव शर्मा',
        gender: 'Bhaiya',
        class: 'Class 6',
        section: 'A',
        fatherName: 'श्री दिनेश शर्मा',
        contact: '+91 98765 11111',
        dob: '2013-05-10',
        academicYear: '2025-26'
      });

      await Attendance.create({
        id: 'att-101',
        schoolId,
        studentId: student.id,
        date: '2026-03-01',
        status: 'Present',
        class: 'Class 6',
        academicYear: '2025-26'
      });

      await Leave.create({
        id: 'leave-101',
        schoolId,
        applicantType: 'student',
        applicantId: student.id,
        applicantName: 'भैया केशव शर्मा',
        classOrDesignation: 'Class 6',
        startDate: '2026-03-05',
        endDate: '2026-03-06',
        reason: 'पारिवारिक कार्यक्रम',
        status: 'Pending'
      });

      // Update student to Class 7 and modify name
      const res = await request(app)
        .put(`/api/students/${student.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          class: 'Class 7',
          name: 'भैया केशव कुमार शर्मा',
          schoolId
        });

      expect(res.status).toBe(200);
      expect(res.body.class).toBe('Class 7');
      expect(res.body.name).toBe('भैया केशव कुमार शर्मा');

      // Verify Attendance was synchronized
      const updatedAttendance = await Attendance.findOne({ studentId: student.id });
      expect(updatedAttendance).not.toBeNull();
      expect(updatedAttendance.class).toBe('Class 7');

      // Verify Leave was synchronized
      const updatedLeave = await Leave.findOne({ applicantId: student.id });
      expect(updatedLeave).not.toBeNull();
      expect(updatedLeave.applicantName).toBe('भैया केशव कुमार शर्मा');
      expect(updatedLeave.classOrDesignation).toBe('Class 7');
    });
  });

  describe('2. Transactional Cascade on Student Deletion (Orphan Cleanup)', () => {
    it('purges all associated fees, attendance, report cards, and leaves when student is deleted', async () => {
      const student = await Student.create({
        id: 'stu-orphan-test-202',
        schoolId,
        rollNo: '202',
        name: 'बहिन राधा वर्मा',
        gender: 'Bahin',
        class: 'Class 8',
        section: 'A',
        fatherName: 'श्री रमेश वर्मा',
        contact: '+91 98765 22222',
        dob: '2012-08-15'
      });

      await Fee.create({
        id: 'fee-202',
        schoolId,
        studentId: student.id,
        term: 'Quarterly',
        academicYear: '2025-26',
        totalAmount: 1800,
        paidAmount: 1800,
        status: 'Paid'
      });

      await Attendance.create({
        id: 'att-202',
        schoolId,
        studentId: student.id,
        date: '2026-03-02',
        status: 'Present',
        class: 'Class 8'
      });

      await ReportCard.create({
        id: 'rc-202',
        schoolId,
        studentId: student.id,
        examTerm: 'Half-Yearly',
        academicYear: '2025-26',
        totalMax: 500,
        totalObtained: 440,
        percentage: 88,
        grade: 'A+'
      });

      await Leave.create({
        id: 'leave-202',
        schoolId,
        applicantType: 'student',
        applicantId: student.id,
        applicantName: 'बहिन राधा वर्मा',
        startDate: '2026-03-10',
        endDate: '2026-03-11',
        reason: 'अस्वस्थता',
        status: 'Approved'
      });

      // Delete student via API
      const res = await request(app)
        .delete(`/api/students/${student.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify Student is deleted
      const checkStudent = await Student.findOne({ id: student.id });
      expect(checkStudent).toBeNull();

      // Verify all child orphan records are purged
      const feeCount = await Fee.countDocuments({ studentId: student.id });
      const attCount = await Attendance.countDocuments({ studentId: student.id });
      const rcCount = await ReportCard.countDocuments({ studentId: student.id });
      const leaveCount = await Leave.countDocuments({ applicantId: student.id });

      expect(feeCount).toBe(0);
      expect(attCount).toBe(0);
      expect(rcCount).toBe(0);
      expect(leaveCount).toBe(0);
    });
  });

  describe('3. Student Login Backward Compatibility & PIN/DOB Security', () => {
    it('allows passwordless login with Roll No + Contact when student has no PIN', async () => {
      await Student.create({
        id: 'stu-login-1',
        schoolId,
        rollNo: '301',
        name: 'भैया राघव',
        gender: 'Bhaiya',
        class: 'Class 5',
        fatherName: 'श्री मोहन',
        contact: '+91 98765 33333',
        pin: ''
      });

      const res = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId,
          rollNo: '301',
          contact: '+91 98765 33333'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.student.id).toBe('stu-login-1');
    });

    it('enforces PIN verification when student profile has a security PIN set', async () => {
      await Student.create({
        id: 'stu-pin-protected',
        schoolId,
        rollNo: '302',
        name: 'बहिन मीरा',
        gender: 'Bahin',
        class: 'Class 6',
        fatherName: 'श्री कृष्ण',
        contact: '+91 98765 44444',
        pin: '2026'
      });

      // 1. Missing PIN -> 422 with PIN_REQUIRED
      const missingPin = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId,
          rollNo: '302',
          contact: '+91 98765 44444'
        });

      expect(missingPin.status).toBe(422);
      expect(missingPin.body.code).toBe('PIN_REQUIRED');

      // 2. Incorrect PIN -> 401 with INVALID_CREDENTIALS
      const wrongPin = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId,
          rollNo: '302',
          contact: '+91 98765 44444',
          pin: '9999'
        });

      expect(wrongPin.status).toBe(401);
      expect(wrongPin.body.code).toBe('INVALID_CREDENTIALS');

      // 3. Correct PIN -> 200 Success
      const successLogin = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId,
          rollNo: '302',
          contact: '+91 98765 44444',
          pin: '2026'
        });

      expect(successLogin.status).toBe(200);
      expect(successLogin.body.success).toBe(true);
      expect(successLogin.body.student.id).toBe('stu-pin-protected');
    });

    it('validates optional Date of Birth (DOB) when provided in student login', async () => {
      await Student.create({
        id: 'stu-dob-test',
        schoolId,
        rollNo: '303',
        name: 'भैया सुमित',
        gender: 'Bhaiya',
        class: 'Class 7',
        fatherName: 'श्री आलोक',
        contact: '+91 98765 55555',
        dob: '2014-04-20'
      });

      // 1. Wrong DOB -> 401
      const wrongDob = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId,
          rollNo: '303',
          contact: '+91 98765 55555',
          dob: '2015-01-01'
        });

      expect(wrongDob.status).toBe(401);

      // 2. Matching DOB -> 200
      const correctDob = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId,
          rollNo: '303',
          contact: '+91 98765 55555',
          dob: '2014-04-20'
        });

      expect(correctDob.status).toBe(200);
      expect(correctDob.body.success).toBe(true);
    });
  });
});

