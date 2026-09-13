import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'security-hardening-test-secret';
process.env.DEVELOPER_ADMIN_PASSCODE = 'security-dev-passcode';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const { escapeRegex, sanitizeObject } = require('../../server/middleware/sanitize.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Fee = require('../../server/models/Fee.js');
const InventoryItem = require('../../server/models/InventoryItem.js');
const Book = require('../../server/models/Book.js');

let mongoServer: MongoMemoryServer;
let adminToken: string;
let devToken: string;
let schoolIdA: string = 'ssm-sec-school-a';
let schoolIdB: string = 'ssm-sec-school-b';

describe('Security Hardening, NoSQL Injection & Validation Suite', () => {
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
      Fee.deleteMany({}),
      InventoryItem.deleteMany({}),
      Book.deleteMany({})
    ]);

    await School.create({
      id: schoolIdA,
      name: 'SSM Security Branch Alpha',
      hindiName: 'सरस्वती शिशु मंदिर सुरक्षा शाखा अ',
      address: 'Gorakhpur',
      city: 'Gorakhpur',
      state: 'UP',
      prant: 'Goraksh',
      phone: '9988776655',
      email: 'sec-alpha@ssm.test',
      principalName: 'डॉ. सत्येंद्र मिश्र',
      adminPasscode: 'secpass123',
      currentAcademicYear: '2025-26',
      plan: 'free'
    });

    await School.create({
      id: schoolIdB,
      name: 'SSM Security Branch Beta',
      hindiName: 'सरस्वती शिशु मंदिर सुरक्षा शाखा ब',
      address: 'Lucknow',
      city: 'Lucknow',
      state: 'UP',
      prant: 'Avadh',
      phone: '9988776644',
      email: 'sec-beta@ssm.test',
      principalName: 'श्री आलोक वर्मा',
      adminPasscode: 'secpass456',
      currentAcademicYear: '2025-26',
      plan: 'free'
    });

    adminToken = jwt.sign(
      {
        schoolId: schoolIdA,
        role: 'admin',
        schoolName: 'SSM Security Branch Alpha'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    devToken = jwt.sign(
      {
        schoolId: '*',
        role: 'developer',
        schoolName: 'Developer Console'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
  });

  // =========================================================================
  // 1. NoSQL Injection & Operator Stripping Tests
  // =========================================================================
  describe('1. NoSQL Injection Defense & Sanitizer', () => {
    it('sanitizes object keys starting with $ and keys containing .', () => {
      const maliciousPayload = {
        username: 'admin',
        $gt: '',
        nested: {
          $ne: null,
          'user.role': 'admin',
          safeField: 'active'
        },
        items: [{ $where: '1==1', name: 'valid' }]
      };

      const sanitized = sanitizeObject(maliciousPayload);

      expect(sanitized.username).toBe('admin');
      expect(sanitized.$gt).toBeUndefined();
      expect(sanitized.nested.$ne).toBeUndefined();
      expect(sanitized.nested['user.role']).toBeUndefined();
      expect(sanitized.nested.safeField).toBe('active');
      expect(sanitized.items[0].$where).toBeUndefined();
      expect(sanitized.items[0].name).toBe('valid');
    });

    it('rejects NoSQL injection operator in admin login request body', async () => {
      // Attempt login with NoSQL operator in passcode
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          schoolId: schoolIdA,
          passcode: { $ne: null }
        });

      // Passcode is sanitized or rejected as invalid non-string
      expect([400, 401]).toContain(res.status);
      expect(res.body.token).toBeUndefined();
    });

    it('rejects non-string schoolId object injection in student login', async () => {
      const res = await request(app)
        .post('/api/auth/student-login')
        .send({
          schoolId: { $ne: null },
          rollNo: '101',
          contact: '9876543210'
        });

      expect(res.status).toBe(400);
      expect(res.body.token).toBeUndefined();
    });
  });

  // =========================================================================
  // 2. ReDoS (Regular Expression Denial of Service) Immunity
  // =========================================================================
  describe('2. ReDoS Immunity & Regex Escaping', () => {
    it('escapes special regex characters correctly', () => {
      const input = 'hello.*+?^${}()|[]\\world';
      const escaped = escapeRegex(input);
      expect(escaped).toBe('hello\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\world');
    });

    it('handles catastrophic backtracking regex pattern in library book search without hanging', async () => {
      await Book.create({
        id: 'bk-redos-1',
        schoolId: schoolIdA,
        title: 'वैदिक गणित भाग १',
        author: 'स्वामी भारती कृष्ण तीर्थ',
        category: 'विज्ञान व गणित',
        accessionNo: 'ACC-001',
        totalCopies: 5,
        availableCopies: 5
      });

      const start = Date.now();
      // Potentially catastrophic regex pattern
      const evilPattern = '((a+)+)+$';
      const res = await request(app)
        .get(`/api/library/books?schoolId=${schoolIdA}&search=${encodeURIComponent(evilPattern)}`);

      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      // Query should complete safely and fast (< 1000ms)
      expect(duration).toBeLessThan(1000);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // =========================================================================
  // 3. Privilege Escalation Defense (School Plan Subscription)
  // =========================================================================
  describe('3. Privilege Escalation Defense (School Plan Protection)', () => {
    it('prevents regular school admin from escalating plan from free to pro', async () => {
      // Regular admin tries to update their school plan
      const res = await request(app)
        .put(`/api/schools/${schoolIdA}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          plan: 'pro',
          tagline: 'अपडेटेड टैगलाइन'
        });

      expect(res.status).toBe(200);
      // Plan must remain 'free'
      expect(res.body.plan).toBe('free');
      expect(res.body.tagline).toBe('अपडेटेड टैगलाइन');

      // Verify in database
      const dbSchool = await School.findOne({ id: schoolIdA }).lean();
      expect(dbSchool.plan).toBe('free');
    });

    it('allows super-admin developer to update school plan to pro', async () => {
      const res = await request(app)
        .put(`/api/schools/${schoolIdA}`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({
          plan: 'pro'
        });

      expect(res.status).toBe(200);
      expect(res.body.plan).toBe('pro');

      const dbSchool = await School.findOne({ id: schoolIdA }).lean();
      expect(dbSchool.plan).toBe('pro');
    });
  });

  // =========================================================================
  // 4. Immutable ID & Cross-Tenant Reassignment Prevention
  // =========================================================================
  describe('4. Mass Assignment & Immutable Identifier Protection', () => {
    it('blocks cross-school reassignment attempt on student update with 403 Forbidden', async () => {
      const student = await Student.create({
        id: 'std-tamper-1',
        schoolId: schoolIdA,
        rollNo: '501',
        name: 'अतुल मिश्रा',
        gender: 'Bhaiya',
        class: 'Class 8',
        section: 'A',
        fatherName: 'श्री राम मिश्रा',
        contact: '9900000000'
      });

      // Admin from School A tries to reassign student to School B
      const res = await request(app)
        .put(`/api/students/${student.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schoolId: schoolIdB,
          name: 'अतुल मिश्रा (अपडेटेड)'
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SCHOOL_SCOPE_FORBIDDEN');
    });

    it('ignores attempts to tamper primary identifier id on student update', async () => {
      const student = await Student.create({
        id: 'std-tamper-2',
        schoolId: schoolIdA,
        rollNo: '502',
        name: 'प्रिया शर्मा',
        gender: 'Bahin',
        class: 'Class 8',
        section: 'A',
        fatherName: 'श्री श्याम शर्मा',
        contact: '9900000001'
      });

      // Admin tries to change id to 'std-hacked'
      const res = await request(app)
        .put(`/api/students/${student.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          id: 'std-hacked',
          name: 'प्रिया शर्मा (अपडेटेड)'
        });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('std-tamper-2');
      expect(res.body.name).toBe('प्रिया शर्मा (अपडेटेड)');

      const dbStudent = await Student.findOne({ id: 'std-tamper-2' }).lean();
      expect(dbStudent).toBeDefined();
      expect(dbStudent.name).toBe('प्रिया शर्मा (अपडेटेड)');
    });
  });

  // =========================================================================
  // 5. Schema Numeric Constraints (Defense in Depth)
  // =========================================================================
  describe('5. Schema Constraints & Negative Number Rejection', () => {
    it('rejects creation of fee records with negative totalAmount', async () => {
      const res = await request(app)
        .post('/api/fees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schoolId: schoolIdA,
          studentId: 'std-fee-test',
          term: 'वार्षिक शुल्क',
          academicYear: '2025-26',
          totalAmount: -1500
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('rejects creation of inventory item with negative unitPrice or stock', async () => {
      const res = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schoolId: schoolIdA,
          itemName: 'स्कूल डायरी',
          category: 'स्टेशनरी (Stationery)',
          unitPrice: -50,
          stockQuantity: -10
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });
});
