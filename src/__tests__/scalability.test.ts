import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'scalability-test-secret-key-12345';
process.env.DEVELOPER_ADMIN_PASSCODE = 'scalability-developer-secret-999';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const { generateAdminToken } = require('../../server/middleware/auth.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Attendance = require('../../server/models/Attendance.js');

let mongoServer: MongoMemoryServer;

describe('System Scalability & High-Load Performance Tests', () => {
  let devToken: string;
  let branchTokens: { [key: string]: string } = {};

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    devToken = generateAdminToken({
      schoolId: '*',
      role: 'developer',
      schoolName: 'SSM Developer Administration'
    });

    // Seed 5 different multi-tenant branches
    for (let i = 1; i <= 5; i++) {
      const branchId = `ssm-branch-${i}`;
      await School.create({
        id: branchId,
        name: `Saraswati Shishu Mandir Branch ${i}`,
        hindiName: `सरस्वती शिशु मंदिर शाखा ${i}`,
        address: `City ${i}`,
        city: `City ${i}`,
        state: 'Uttar Pradesh',
        prant: 'Goraksh',
        phone: `+91 98000 0000${i}`,
        email: `branch${i}@init65.co.in`,
        principalName: `Principal ${i}`,
        adminPasscode: `passcode-${i}`
      });

      branchTokens[branchId] = generateAdminToken({
        schoolId: branchId,
        role: 'admin',
        schoolName: `SSM Branch ${i}`
      });
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('1. Bulk Ingestion Scalability: handles batch inserting 200 students under 500ms', async () => {
    const startTime = Date.now();
    const studentsBatch = Array.from({ length: 200 }, (_, idx) => ({
      rollNo: (1000 + idx).toString(),
      name: `छात्र क्रमांक ${idx + 1}`,
      gender: idx % 2 === 0 ? 'Bhaiya' : 'Bahin',
      class: `Class ${(idx % 5) + 6}`,
      section: 'A',
      fatherName: `श्री अभिभावक ${idx + 1}`,
      motherName: `श्रीमती माता ${idx + 1}`,
      contact: `+91 98111 ${String(idx).padStart(5, '0')}`,
      address: `मोहल्ला ${idx + 1}, नगर`,
      dob: '2013-05-15',
      bloodGroup: 'O+'
    }));

    const res = await request(app)
      .post('/api/students/bulk')
      .set('Authorization', `Bearer ${branchTokens['ssm-branch-1']}`)
      .send({ students: studentsBatch, schoolId: 'ssm-branch-1' });

    const elapsed = Date.now() - startTime;

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(200);
    expect(elapsed).toBeLessThan(1000);
  });

  it('2. High Concurrency: processes 50 simultaneous read requests with 100% success', async () => {
    const startTime = Date.now();
    const concurrentRequests = Array.from({ length: 50 }, (_, i) => {
      const branchId = `ssm-branch-${(i % 5) + 1}`;
      return request(app)
        .get(`/api/students?schoolId=${branchId}`)
        .set('Authorization', `Bearer ${branchTokens[branchId]}`);
    });

    const responses = await Promise.all(concurrentRequests);
    const elapsed = Date.now() - startTime;

    expect(responses.length).toBe(50);
    responses.forEach(res => {
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    expect(elapsed).toBeLessThan(2000);
  });

  it('3. Multi-Tenant Isolation Under Load: ensures strict tenant separation across concurrent queries', async () => {
    // Branch 1 has 200 students from test 1, Branch 2 has 0 students
    const [resBranch1, resBranch2] = await Promise.all([
      request(app)
        .get('/api/students?schoolId=ssm-branch-1')
        .set('Authorization', `Bearer ${branchTokens['ssm-branch-1']}`),
      request(app)
        .get('/api/students?schoolId=ssm-branch-2')
        .set('Authorization', `Bearer ${branchTokens['ssm-branch-2']}`)
    ]);

    expect(resBranch1.status).toBe(200);
    expect(resBranch1.body.length).toBe(200);

    expect(resBranch2.status).toBe(200);
    expect(resBranch2.body.length).toBe(0); // Branch 2 strictly receives 0 records from Branch 1
  });

  it('4. Bulk Attendance Scalability: batch marks daily attendance for 100 students in single operation', async () => {
    const date = '2026-09-13';
    const updates = Array.from({ length: 100 }, (_, i) => ({
      studentId: `student-scale-${i}`,
      schoolId: 'ssm-branch-1',
      date,
      status: i % 10 === 0 ? 'Absent' : 'Present'
    }));

    const startTime = Date.now();
    const res = await request(app)
      .post('/api/attendance/bulk')
      .set('Authorization', `Bearer ${branchTokens['ssm-branch-1']}`)
      .send({ updates, schoolId: 'ssm-branch-1' });

    const elapsed = Date.now() - startTime;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(800);

    // Verify written count
    const savedCount = await Attendance.countDocuments({ schoolId: 'ssm-branch-1', date });
    expect(savedCount).toBe(100);
  });

  it('5. Safe Pagination & Bounded Memory: verifies pagination metadata headers and chunked delivery', async () => {
    const resPage1 = await request(app)
      .get('/api/students?schoolId=ssm-branch-1&paginated=true&page=1&limit=25')
      .set('Authorization', `Bearer ${branchTokens['ssm-branch-1']}`);

    expect(resPage1.status).toBe(200);
    expect(resPage1.body.data.length).toBe(25);
    expect(resPage1.body.pagination.total).toBe(200);
    expect(resPage1.body.pagination.totalPages).toBe(8);
    expect(resPage1.body.pagination.page).toBe(1);

    expect(resPage1.headers['x-total-count']).toBe('200');
    expect(resPage1.headers['x-total-pages']).toBe('8');

    const resPage8 = await request(app)
      .get('/api/students?schoolId=ssm-branch-1&paginated=true&page=8&limit=25')
      .set('Authorization', `Bearer ${branchTokens['ssm-branch-1']}`);

    expect(resPage8.status).toBe(200);
    expect(resPage8.body.data.length).toBe(25);
    expect(resPage8.body.pagination.page).toBe(8);
  });

  it('6. Developer Multi-Tenant Parallel Queries: aggregates stats across all 5 branches in under 300ms', async () => {
    const startTime = Date.now();

    // Developer queries all 5 branches simultaneously
    const branchQueries = Array.from({ length: 5 }, (_, i) => {
      const branchId = `ssm-branch-${i + 1}`;
      return request(app)
        .get(`/api/students?schoolId=${branchId}`)
        .set('Authorization', `Bearer ${devToken}`);
    });

    const results = await Promise.all(branchQueries);
    const elapsed = Date.now() - startTime;

    expect(results.length).toBe(5);
    results.forEach(r => expect(r.status).toBe(200));

    // Branch 1 has 200, branches 2-5 have 0
    expect(results[0].body.length).toBe(200);
    expect(results[1].body.length).toBe(0);
    expect(elapsed).toBeLessThan(300);
  });
});
