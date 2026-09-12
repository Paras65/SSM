import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'dpdp-compliance-test-secret';
process.env.DEVELOPER_ADMIN_PASSCODE = 'dpdp-developer-secret';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Admission = require('../../server/models/Admission.js');
const AuditLog = require('../../server/models/AuditLog.js');

let mongoServer: MongoMemoryServer;
let schoolAToken: string;
let schoolBToken: string;

describe('DPDP Act 2023 Compliance & Data Protection Suite', () => {
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
      Admission.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

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
        adminPasscode: 'pass-a-123'
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
        adminPasscode: 'pass-b-456'
      }
    ]);

    await Student.create({
      id: 'stu-tc-101',
      schoolId: 'school-a',
      rollNo: '101',
      name: 'Bhaiya Aaditya Sharma',
      gender: 'Bhaiya',
      class: 'Class 10',
      section: 'A',
      fatherName: 'Rajesh Sharma',
      motherName: 'Sunita Sharma',
      contact: '+91 98765 43210',
      address: 'Mohalla Shivnagar, Gorakhpur, UP'
    });

    await Student.create({
      id: 'stu-b-201',
      schoolId: 'school-b',
      rollNo: '201',
      name: 'Bahin Kavya',
      gender: 'Bahin',
      class: 'Class 8',
      section: 'B',
      fatherName: 'Manoj Kumar',
      contact: '+91 98111 22233',
      address: 'Alambagh, Lucknow, UP'
    });

    schoolAToken = jwt.sign({ schoolId: 'school-a', role: 'admin', schoolName: 'SSM Branch A' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    schoolBToken = jwt.sign({ schoolId: 'school-b', role: 'admin', schoolName: 'SSM Branch B' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  });

  describe('1. Verifiable Parental Consent (Section 9 - Minors)', () => {
    it('persists verifiable parental consent with DPDP-2023-V1 policy version and timestamp', async () => {
      const res = await request(app)
        .post('/api/admissions')
        .send({
          schoolId: 'school-a',
          studentName: 'Rohan Verma',
          gender: 'Bhaiya',
          applyingClass: 'Class 1',
          fatherName: 'Suresh Verma',
          phone: '+91 98765 11223',
          address: 'Civil Lines, Gorakhpur',
          guardianConsent: true,
          consentPolicyVersion: 'DPDP-2023-V1'
        });

      expect(res.status).toBe(201);
      expect(res.body.guardianConsent).toBe(true);
      expect(res.body.consentPolicyVersion).toBe('DPDP-2023-V1');
      expect(res.body.consentTimestamp).toBeDefined();

      // Check in MongoDB
      const saved = await Admission.findOne({ id: res.body.id }).lean();
      expect(saved).not.toBeNull();
      expect(saved.guardianConsent).toBe(true);
      expect(saved.consentPolicyVersion).toBe('DPDP-2023-V1');
    });

    it('strictly rejects admission inquiry without guardian consent', async () => {
      const res = await request(app)
        .post('/api/admissions')
        .send({
          schoolId: 'school-a',
          studentName: 'Pooja Singh',
          gender: 'Bahin',
          applyingClass: 'Class 2',
          phone: '+91 98765 99887',
          guardianConsent: false
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('सहमति');
    });
  });

  describe('2. Right to Erasure & Data Anonymization (Section 12 - TC / Archiving)', () => {
    it('anonymizes sensitive contact and address while preserving academic records and audit trail', async () => {
      const res = await request(app)
        .post('/api/students/stu-tc-101/anonymize')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.student.contact).toBe('+91 99*** *****');
      expect(res.body.student.address).toContain('DPDP Act 2023');
      expect(res.body.student.fatherName).toBe('Raj***');

      // Verify academic identifiers remain intact for board audits
      expect(res.body.student.rollNo).toBe('101');
      expect(res.body.student.class).toBe('Class 10');
      expect(res.body.student.name).toBe('Bhaiya Aaditya Sharma');

      // Verify audit log creation
      const logs = await AuditLog.find({ action: 'DPDP_STUDENT_ANONYMIZED' }).lean();
      expect(logs.length).toBe(1);
      expect(logs[0].schoolId).toBe('school-a');
      expect(logs[0].description).toContain('DPDP Act 2023');
    });

    it('prevents cross-school unauthorized anonymization attempts', async () => {
      // School A admin tries to anonymize School B student
      const res = await request(app)
        .post('/api/students/stu-b-201/anonymize')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Student not found');

      // Confirm School B student data is untouched
      const studentB = await Student.findOne({ id: 'stu-b-201' }).lean();
      expect(studentB.contact).toBe('+91 98111 22233');
    });

    it('rejects unauthenticated anonymization requests', async () => {
      const res = await request(app)
        .post('/api/students/stu-tc-101/anonymize');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTH_REQUIRED');
    });
  });
});

