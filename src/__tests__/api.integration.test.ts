import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'integration-test-secret';
process.env.DEVELOPER_ADMIN_PASSCODE = 'integration-developer-secret';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Homework = require('../../server/models/Homework.js');

let mongoServer: MongoMemoryServer;

const schoolData = (id: string, passcode: string) => ({
  id,
  name: `Test School ${id}`,
  hindiName: `परीक्षण विद्यालय ${id}`,
  address: 'Test address',
  city: id,
  state: 'Test State',
  prant: 'Test Prant',
  phone: '+91 90000 00000',
  email: `${id}@example.test`,
  principalName: 'Test Principal',
  adminPasscode: passcode
});

describe('API security integration', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  beforeEach(async () => {
    await Promise.all([
      School.deleteMany({}),
      Student.deleteMany({}),
      Homework.deleteMany({})
    ]);

    await School.create([
      schoolData('school-a', 'school-a-secret'),
      schoolData('school-b', 'school-b-secret')
    ]);

    await Student.create({
      id: 'student-a',
      schoolId: 'school-a',
      rollNo: '101',
      name: 'Student A',
      gender: 'Bhaiya',
      class: 'Class 8',
      section: 'A',
      fatherName: 'Parent A',
      contact: '+91 91111 11111',
      address: 'Test address',
      dob: '2012-01-01',
      admissionDate: '2026-01-01',
      bloodGroup: 'B+'
    });

    await Homework.create({
      id: 'homework-a',
      schoolId: 'school-a',
      class: 'Class 8',
      subject: 'Maths',
      title: 'Fractions',
      description: 'Complete the exercises.',
      assignedBy: 'Teacher A',
      dueDate: '2026-09-20'
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('rejects operational reads without authentication', async () => {
    const response = await request(app).get('/api/students?schoolId=school-a');
    expect(response.status).toBe(401);
  });

  it('rejects admission submission without guardian consent', async () => {
    const response = await request(app).post('/api/admissions').send({
      schoolId: 'school-a',
      studentName: 'New Student',
      gender: 'Bhaiya',
      applyingClass: 'Class 8',
      phone: '+91 92222 22222'
    });
    expect(response.status).toBe(400);
  });

  it('records a consented admission', async () => {
    const response = await request(app).post('/api/admissions').send({
      schoolId: 'school-a',
      studentName: 'New Student',
      gender: 'Bhaiya',
      applyingClass: 'Class 8',
      phone: '+91 92222 22222',
      guardianConsent: true
    });
    expect(response.status).toBe(201);
    expect(response.body.guardianConsent).toBe(true);
    expect(response.body.consentTimestamp).toBeTruthy();
    expect(response.body.consentPolicyVersion).toBe('2026-09-12');
  });

  it('keeps branch admins inside their own school', async () => {
    const login = await request(app).post('/api/auth/login').send({
      schoolId: 'school-a',
      passcode: 'school-a-secret'
    });
    expect(login.status).toBe(200);

    const response = await request(app)
      .get('/api/students?schoolId=school-b')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(response.status).toBe(403);
  });

  it('keeps students inside their own class homework', async () => {
    const login = await request(app).post('/api/auth/student-login').send({
      schoolId: 'school-a',
      rollNo: '101',
      contact: '+91 91111 11111'
    });
    expect(login.status).toBe(200);

    const response = await request(app)
      .get('/api/homework?schoolId=school-a&class=Class%2099')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(response.status).toBe(403);
  });
});
