import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'multitenant-isolation-test-secret';
process.env.DEVELOPER_ADMIN_PASSCODE = 'multitenant-dev-secret';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Exam = require('../../server/models/Exam.js');
const Timetable = require('../../server/models/Timetable.js');
const Leave = require('../../server/models/Leave.js');
const Transport = require('../../server/models/Transport.js');
const Book = require('../../server/models/Book.js');
const BookIssue = require('../../server/models/BookIssue.js');
const InventoryItem = require('../../server/models/InventoryItem.js');
const Staff = require('../../server/models/Staff.js');
const AuditLog = require('../../server/models/AuditLog.js');

let mongoServer: MongoMemoryServer;
let schoolAToken: string;
let schoolBToken: string;
let developerToken: string;

describe('Multi-Tenant Isolation & Cross-Branch Protection Suite', () => {
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
      Exam.deleteMany({}),
      Timetable.deleteMany({}),
      Leave.deleteMany({}),
      Transport.deleteMany({}),
      Book.deleteMany({}),
      BookIssue.deleteMany({}),
      InventoryItem.deleteMany({}),
      Staff.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    await School.create([
      {
        id: 'school-a',
        name: 'SSM Branch A (Gorakhpur)',
        hindiName: 'सरस्वती शिशु मंदिर गोरखपुर',
        address: 'Gorakhpur',
        city: 'Gorakhpur',
        state: 'UP',
        prant: 'Goraksh',
        phone: '+91 91111 00000',
        email: 'branch-a@ssm.test',
        principalName: 'Principal A',
        adminPasscode: 'passcode-a'
      },
      {
        id: 'school-b',
        name: 'SSM Branch B (Lucknow)',
        hindiName: 'सरस्वती शिशु मंदिर लखनऊ',
        address: 'Lucknow',
        city: 'Lucknow',
        state: 'UP',
        prant: 'Avadh',
        phone: '+91 92222 00000',
        email: 'branch-b@ssm.test',
        principalName: 'Principal B',
        adminPasscode: 'passcode-b'
      }
    ]);

    // Seed resources belonging to School B
    await Exam.create({
      id: 'exam-b-01',
      schoolId: 'school-b',
      title: 'School B Midterm',
      term: 'Midterm',
      academicYear: '2025-26',
      classes: ['Class 8'],
      startDate: '2026-10-01',
      endDate: '2026-10-10'
    });

    await Leave.create({
      id: 'leave-b-01',
      schoolId: 'school-b',
      applicantType: 'staff',
      applicantId: 'stf-b-1',
      applicantName: 'Acharya Verma',
      startDate: '2026-10-05',
      endDate: '2026-10-06',
      reason: 'Personal',
      status: 'Pending'
    });

    await Transport.create({
      id: 'route-b-01',
      schoolId: 'school-b',
      routeName: 'Lucknow Bus Route 1',
      driverName: 'Ramesh',
      driverPhone: '+91 98888 77777',
      vehicleNumber: 'UP 32 AB 1234',
      stops: [{ stopName: 'Hazratganj', pickupTime: '07:30 AM', dropTime: '02:30 PM', monthlyFare: 800 }]
    });

    await Book.create({
      id: 'book-b-01',
      schoolId: 'school-b',
      title: 'Vedic Mathematics Vol 1',
      author: 'Swami Bharati Krishna Tirtha',
      category: 'विज्ञान व गणित',
      accessionNo: 'VM-101',
      totalCopies: 5,
      availableCopies: 5,
      shelfLocation: 'Rack 2'
    });

    await BookIssue.create({
      id: 'issue-b-01',
      schoolId: 'school-b',
      bookId: 'book-b-01',
      bookTitle: 'Vedic Mathematics Vol 1',
      accessionNo: 'VM-101',
      borrowerType: 'student',
      borrowerId: 'stu-b-101',
      borrowerName: 'Student B',
      dueDate: '2026-10-20',
      status: 'Issued'
    });

    await InventoryItem.create({
      id: 'inv-b-01',
      schoolId: 'school-b',
      itemName: 'Official Desk Chair',
      category: 'अन्य',
      unitPrice: 1500,
      unit: 'पीस (Pcs)',
      stockQuantity: 20
    });

    await Staff.create({
      id: 'stf-a-01',
      schoolId: 'school-a',
      name: 'Acharya Sharma',
      gender: 'Acharya',
      designation: 'गणित आचार्य',
      phone: '+91 99999 11111',
      pin: '5678',
      monthlySalary: 28000
    });

    await AuditLog.create([
      {
        id: 'log-a-01',
        schoolId: 'school-a',
        actorType: 'admin',
        action: 'BRANCH_A_ACTION',
        description: 'Branch A Audit Action'
      },
      {
        id: 'log-b-01',
        schoolId: 'school-b',
        actorType: 'admin',
        action: 'BRANCH_B_ACTION',
        description: 'Branch B Confidential Action'
      }
    ]);

    schoolAToken = jwt.sign({ schoolId: 'school-a', role: 'admin', schoolName: 'SSM Branch A' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    schoolBToken = jwt.sign({ schoolId: 'school-b', role: 'admin', schoolName: 'SSM Branch B' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    developerToken = jwt.sign({ schoolId: '*', role: 'developer', schoolName: 'Developer' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  describe('1. Exam Management Multi-Tenant Isolation', () => {
    it('prevents School A admin from creating exam scoped to School B', async () => {
      const res = await request(app)
        .post('/api/exams')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          schoolId: 'school-b',
          title: 'Illicit Exam',
          term: 'Annual',
          academicYear: '2025-26',
          startDate: '2026-11-01',
          endDate: '2026-11-10'
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('prevents School A from updating or deleting School B exam', async () => {
      const updateRes = await request(app)
        .put('/api/exams/exam-b-01')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ title: 'Tampered Title' });

      expect(updateRes.status).toBe(404);
      expect(updateRes.body.error).toBe('Exam not found');

      const deleteRes = await request(app)
        .delete('/api/exams/exam-b-01')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(deleteRes.status).toBe(404);
      expect(deleteRes.body.error).toBe('Exam not found');
    });
  });

  describe('2. Leave Management Multi-Tenant Isolation', () => {
    it('prevents School A from querying School B leaves', async () => {
      const res = await request(app)
        .get('/api/leaves?schoolId=school-b')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('prevents School A from approving or modifying School B leave request', async () => {
      const res = await request(app)
        .patch('/api/leaves/leave-b-01/status')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ status: 'Approved' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Leave request not found');

      // Verify School B leave is still Pending
      const leave = await Leave.findOne({ id: 'leave-b-01' }).lean();
      expect(leave.status).toBe('Pending');
    });
  });

  describe('3. Transport Module Multi-Tenant Isolation', () => {
    it('prevents School A from modifying or deleting School B transport routes', async () => {
      const updateRes = await request(app)
        .put('/api/transport/routes/route-b-01')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ routeName: 'Tampered Route' });

      expect(updateRes.status).toBe(404);
      expect(updateRes.body.error).toBe('Route not found');

      const deleteRes = await request(app)
        .delete('/api/transport/routes/route-b-01')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(deleteRes.status).toBe(404);
      expect(deleteRes.body.error).toBe('Route not found');
    });
  });

  describe('4. Library Module Multi-Tenant Isolation', () => {
    it('prevents School A from modifying or deleting School B books', async () => {
      const updateRes = await request(app)
        .put('/api/library/books/book-b-01')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ title: 'Tampered Book' });

      expect(updateRes.status).toBe(404);
      expect(updateRes.body.error).toBe('Book not found');

      const deleteRes = await request(app)
        .delete('/api/library/books/book-b-01')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(deleteRes.status).toBe(404);
      expect(deleteRes.body.error).toBe('Book not found');
    });

    it('prevents School A from processing book returns for School B issue records', async () => {
      const res = await request(app)
        .post('/api/library/return')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ issueId: 'issue-b-01' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Issue record not found');
    });
  });

  describe('5. Inventory Module Multi-Tenant Isolation', () => {
    it('prevents School A from modifying, deleting or adjusting School B inventory stock', async () => {
      const updateRes = await request(app)
        .put('/api/inventory/inv-b-01')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ itemName: 'Tampered Chair' });

      expect(updateRes.status).toBe(404);
      expect(updateRes.body.error).toBe('Item not found');

      const stockRes = await request(app)
        .post('/api/inventory/inv-b-01/stock')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ delta: -10 });

      expect(stockRes.status).toBe(404);
      expect(stockRes.body.error).toBe('Item not found');

      // Verify stock was not decremented
      const item = await InventoryItem.findOne({ id: 'inv-b-01' }).lean();
      expect(item.stockQuantity).toBe(20);
    });
  });

  describe('6. Audit Logs Multi-Tenant Isolation', () => {
    it('prevents School A from accessing School B audit logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs?schoolId=school-b')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('strictly isolates audit logs to requesting school scope', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].schoolId).toBe('school-a');
      expect(res.body[0].action).toBe('BRANCH_A_ACTION');
    });

    it('allows developer role super-access across all school audit logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${developerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe('7. School Lifecycle & Administrative Branch Isolation', () => {
    it('prevents School A admin from exporting School B institutional archive', async () => {
      const res = await request(app)
        .get('/api/schools/school-b/archive')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('allows School A admin to export their own branch archive', async () => {
      const res = await request(app)
        .get('/api/schools/school-a/archive')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.school.id).toBe('school-a');
      expect(res.body.counts).toBeDefined();
    });

    it('prevents School A admin from discontinuing School B', async () => {
      const res = await request(app)
        .post('/api/schools/school-b/discontinue')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ confirmText: 'DISCONTINUE', reason: 'Malicious attempt' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');

      // Verify School B is still active
      const schoolB = await School.findOne({ id: 'school-b' }).lean();
      expect(schoolB.status).not.toBe('discontinued');
    });

    it('prevents non-developer admin from reactivating a discontinued school', async () => {
      // Discontinue school A first
      await School.updateOne({ id: 'school-a' }, { status: 'discontinued' });

      const res = await request(app)
        .post('/api/schools/school-a/reactivate')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('DEVELOPER_ROLE_REQUIRED');
    });

    it('allows developer to reactivate a discontinued school branch', async () => {
      await School.updateOne({ id: 'school-a' }, { status: 'discontinued' });

      const res = await request(app)
        .post('/api/schools/school-a/reactivate')
        .set('Authorization', `Bearer ${developerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const reactivated = await School.findOne({ id: 'school-a' }).lean();
      expect(reactivated.status).toBe('active');
    });

    it('excludes teacher PIN from GET /api/staff administrative responses', async () => {
      const res = await request(app)
        .get('/api/staff')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].pin).toBeUndefined();
      expect(res.body[0].name).toBe('Acharya Sharma');
    });
  });
});
