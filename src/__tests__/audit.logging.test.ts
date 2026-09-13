import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'audit-logging-test-secret';
process.env.DEVELOPER_ADMIN_PASSCODE = 'dev-secret-pass-2026';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Staff = require('../../server/models/Staff.js');
const Fee = require('../../server/models/Fee.js');
const Exam = require('../../server/models/Exam.js');
const ReportCard = require('../../server/models/ReportCard.js');
const AuditLog = require('../../server/models/AuditLog.js');
const { generateAdminToken } = require('../../server/middleware/auth.js');

let mongoServer: MongoMemoryServer;
let adminToken: string;

describe('Security Audit Logging & Governance Verification Suite', () => {
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
      Exam.deleteMany({}),
      ReportCard.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    await School.create({
      id: 'ssm-audit-school',
      name: 'SSM Audit Branch',
      hindiName: 'सरस्वती शिशु मंदिर ऑडिट शाखा',
      address: 'Gorakhpur',
      city: 'Gorakhpur',
      state: 'UP',
      prant: 'Goraksh',
      phone: '+91 91111 00000',
      email: 'audit@ssm.test',
      principalName: 'Principal Audit',
      adminPasscode: 'correct-passcode'
    });

    adminToken = generateAdminToken({
      schoolId: 'ssm-audit-school',
      role: 'admin',
      schoolName: 'SSM Audit Branch'
    });
  });

  it('1. logs ADMIN_LOGIN_FAILED and ADMIN_LOGIN_SUCCESS attempts', async () => {
    // Failed admin login
    const failRes = await request(app)
      .post('/api/auth/login')
      .send({ schoolId: 'ssm-audit-school', passcode: 'wrong-passcode' });
    expect(failRes.status).toBe(401);

    const failLog = await AuditLog.findOne({ action: 'ADMIN_LOGIN_FAILED' });
    expect(failLog).toBeTruthy();
    expect(failLog.schoolId).toBe('ssm-audit-school');

    // Successful admin login
    const successRes = await request(app)
      .post('/api/auth/login')
      .send({ schoolId: 'ssm-audit-school', passcode: 'correct-passcode' });
    expect(successRes.status).toBe(200);

    const successLog = await AuditLog.findOne({ action: 'ADMIN_LOGIN_SUCCESS' });
    expect(successLog).toBeTruthy();
    expect(successLog.schoolId).toBe('ssm-audit-school');
  });

  it('2. logs DEVELOPER_LOGIN_FAILED and DEVELOPER_LOGIN_SUCCESS', async () => {
    // Developer failed login
    const failRes = await request(app)
      .post('/api/auth/login')
      .send({ schoolId: '__developer__', passcode: 'wrong-dev-pass' });
    expect(failRes.status).toBe(401);

    const failLog = await AuditLog.findOne({ action: 'DEVELOPER_LOGIN_FAILED' });
    expect(failLog).toBeTruthy();
    expect(failLog.actorType).toBe('developer');

    // Developer success login
    const successRes = await request(app)
      .post('/api/auth/login')
      .send({ schoolId: '__developer__', passcode: 'dev-secret-pass-2026' });
    expect(successRes.status).toBe(200);

    const successLog = await AuditLog.findOne({ action: 'DEVELOPER_LOGIN_SUCCESS' });
    expect(successLog).toBeTruthy();
    expect(successLog.actorType).toBe('developer');
  });

  it('3. logs STUDENT_LOGIN_FAILED and STUDENT_LOGIN_SUCCESS', async () => {
    await Student.create({
      id: 'std-audit-1',
      schoolId: 'ssm-audit-school',
      name: 'Rohan Sharma',
      gender: 'Bhaiya',
      rollNo: '101',
      class: 'Class 6',
      fatherName: 'श्री राजेश शर्मा',
      contact: '+91 98765 43210'
    });

    // Failed student login
    const failRes = await request(app)
      .post('/api/auth/student-login')
      .send({ schoolId: 'ssm-audit-school', rollNo: '999', contact: '+91 98765 43210' });
    expect(failRes.status).toBe(401);

    const failLog = await AuditLog.findOne({ action: 'STUDENT_LOGIN_FAILED' });
    expect(failLog).toBeTruthy();

    // Successful student login
    const succRes = await request(app)
      .post('/api/auth/student-login')
      .send({ schoolId: 'ssm-audit-school', rollNo: '101', contact: '9876543210' });
    expect(succRes.status).toBe(200);

    const succLog = await AuditLog.findOne({ action: 'STUDENT_LOGIN_SUCCESS' });
    expect(succLog).toBeTruthy();
    expect(succLog.actorType).toBe('student');
    expect(succLog.actorId).toBe('std-audit-1');
  });

  it('4. logs TEACHER_LOGIN_FAILED and TEACHER_LOGIN', async () => {
    await Staff.create({
      id: 'stf-audit-1',
      schoolId: 'ssm-audit-school',
      name: 'Acharya Dev',
      phone: '9876500001',
      pin: '5678',
      designation: 'वरिष्ठ आचार्य'
    });

    // Failed teacher login - wrong pin
    const failRes = await request(app)
      .post('/api/auth/teacher-login')
      .send({ schoolId: 'ssm-audit-school', phone: '9876500001', pin: '0000' });
    expect(failRes.status).toBe(401);

    const failLog = await AuditLog.findOne({ action: 'TEACHER_LOGIN_FAILED' });
    expect(failLog).toBeTruthy();

    // Successful teacher login
    const succRes = await request(app)
      .post('/api/auth/teacher-login')
      .send({ schoolId: 'ssm-audit-school', phone: '9876500001', pin: '5678' });
    expect(succRes.status).toBe(200);

    const succLog = await AuditLog.findOne({ action: 'TEACHER_LOGIN' });
    expect(succLog).toBeTruthy();
    expect(succLog.actorType).toBe('teacher');
  });

  it('5. logs PASSCODE_CHANGED upon admin passcode modification', async () => {
    const res = await request(app)
      .put('/api/schools/ssm-audit-school')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminPasscode: 'new-secure-passcode-2026' });
    expect(res.status).toBe(200);

    const passLog = await AuditLog.findOne({ action: 'PASSCODE_CHANGED' });
    expect(passLog).toBeTruthy();
    expect(passLog.schoolId).toBe('ssm-audit-school');
    expect(passLog.description).toContain('पासकोड बदला गया');
  });

  it('6. logs STUDENTS_BULK_IMPORTED and STUDENT_DELETED', async () => {
    // Bulk import
    const bulkRes = await request(app)
      .post('/api/students/bulk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schoolId: 'ssm-audit-school',
        students: [
          { name: 'Bulk Student 1', rollNo: '201', class: 'Class 7' },
          { name: 'Bulk Student 2', rollNo: '202', class: 'Class 7' }
        ]
      });
    expect(bulkRes.status).toBe(201);

    const importLog = await AuditLog.findOne({ action: 'STUDENTS_BULK_IMPORTED' });
    expect(importLog).toBeTruthy();
    expect(importLog.description).toContain('2 नए छात्रों');

    const createdStudent = bulkRes.body.students[0];

    // Delete student
    const delRes = await request(app)
      .delete(`/api/students/${createdStudent.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delRes.status).toBe(200);

    const delLog = await AuditLog.findOne({ action: 'STUDENT_DELETED' });
    expect(delLog).toBeTruthy();
    expect(delLog.description).toContain(createdStudent.id);
  });

  it('7. logs FEE_DEMAND_CREATED and FEE_PAYMENT_COLLECTED', async () => {
    // Create fee demand
    const feeRes = await request(app)
      .post('/api/fees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId: 'std-audit-1',
        term: 'माह अप्रैल',
        feeType: 'मासिक शिक्षण शुल्क',
        academicYear: '2025-26',
        totalAmount: 1500
      });
    expect(feeRes.status).toBe(201);

    const feeCreatedLog = await AuditLog.findOne({ action: 'FEE_DEMAND_CREATED' });
    expect(feeCreatedLog).toBeTruthy();
    expect(feeCreatedLog.description).toContain('1500');

    // Collect payment
    const payRes = await request(app)
      .put(`/api/fees/${feeRes.body.id}/pay`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ paymentMode: 'UPI QR' });
    expect(payRes.status).toBe(200);

    const payLog = await AuditLog.findOne({ action: 'FEE_PAYMENT_COLLECTED' });
    expect(payLog).toBeTruthy();
    expect(payLog.description).toContain('UPI QR');
  });

  it('8. logs EXAM_LOCKED/EXAM_UNLOCKED and EXAM_MARKS_RECORDED', async () => {
    const exam = await Exam.create({
      id: 'exam-audit-1',
      schoolId: 'ssm-audit-school',
      title: 'वार्षिक परीक्षा 2025',
      name: 'वार्षिक परीक्षा 2025',
      term: 'वार्षिक परीक्षा',
      academicYear: '2025-26',
      startDate: '2026-03-01',
      endDate: '2026-03-15'
    });

    // Lock exam
    const lockRes = await request(app)
      .patch(`/api/exams/${exam.id}/lock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isLocked: true });
    expect(lockRes.status).toBe(200);

    const lockLog = await AuditLog.findOne({ action: 'EXAM_LOCKED' });
    expect(lockLog).toBeTruthy();

    // Unlock exam
    const unlockRes = await request(app)
      .patch(`/api/exams/${exam.id}/lock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isLocked: false });
    expect(unlockRes.status).toBe(200);

    const unlockLog = await AuditLog.findOne({ action: 'EXAM_UNLOCKED' });
    expect(unlockLog).toBeTruthy();

    // Submit bulk marks
    const marksRes = await request(app)
      .post('/api/exams/marks-bulk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schoolId: 'ssm-audit-school',
        examTerm: 'वार्षिक परीक्षा',
        academicYear: '2025-26',
        subject: 'गणित',
        marksList: [
          { studentId: 'std-audit-1', marksObtained: 95, maxMarks: 100 }
        ]
      });
    expect(marksRes.status).toBe(200);

    const marksLog = await AuditLog.findOne({ action: 'EXAM_MARKS_RECORDED' });
    expect(marksLog).toBeTruthy();
    expect(marksLog.description).toContain('गणित');
  });

  it('9. logs STAFF_REMOVED when staff member is deleted', async () => {
    const staff = await Staff.create({
      id: 'stf-audit-del',
      schoolId: 'ssm-audit-school',
      name: 'श्री श्याम सुंदर',
      designation: 'संगीत आचार्य',
      phone: '9876543299'
    });

    const delRes = await request(app)
      .delete(`/api/staff/${staff.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(delRes.status).toBe(200);

    const staffLog = await AuditLog.findOne({ action: 'STAFF_REMOVED' });
    expect(staffLog).toBeTruthy();
    expect(staffLog.description).toContain('श्री श्याम सुंदर');
  });

  it('10. filters and searches audit logs via GET /api/audit-logs', async () => {
    await AuditLog.create([
      {
        id: 'log-test-1',
        schoolId: 'ssm-audit-school',
        actorType: 'admin',
        actorName: 'प्रधानाचार्य',
        action: 'PASSCODE_CHANGED',
        description: 'सुरक्षा पासकोड संशोधित',
        ip: '192.168.1.5'
      },
      {
        id: 'log-test-2',
        schoolId: 'ssm-audit-school',
        actorType: 'teacher',
        actorName: 'आचार्य सुरेश',
        action: 'EXAM_MARKS_RECORDED',
        description: 'विज्ञान विषय के अंक दर्ज',
        ip: '192.168.1.6'
      }
    ]);

    // Search by keyword
    const searchRes = await request(app)
      .get('/api/audit-logs?search=सुरेश')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.length).toBe(1);
    expect(searchRes.body[0].action).toBe('EXAM_MARKS_RECORDED');

    // Filter by actorType
    const actorRes = await request(app)
      .get('/api/audit-logs?actorType=admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(actorRes.status).toBe(200);
    expect(actorRes.body.every((l: any) => l.actorType === 'admin')).toBe(true);
  });
});
