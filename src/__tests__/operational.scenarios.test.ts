import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import {
  cleanIndianPhone,
  generateAdmissionWhatsAppUrl,
  generateFeeReminderWhatsAppUrl,
  generateAttendanceAlertWhatsAppUrl
} from '../utils/whatsapp';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-1234';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Student = require('../../server/models/Student.js');
const Fee = require('../../server/models/Fee.js');
const Admission = require('../../server/models/Admission.js');
const Notice = require('../../server/models/Notice.js');
const SalarySlip = require('../../server/models/SalarySlip.js');
const Homework = require('../../server/models/Homework.js');

let mongoServer: MongoMemoryServer;
let schoolAToken: string;
let schoolBToken: string;

describe('Advanced Operational Scenarios & Real-World Edge Cases Suite', () => {
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
      Admission.deleteMany({}),
      Notice.deleteMany({}),
      SalarySlip.deleteMany({}),
      Homework.deleteMany({})
    ]);

    // Seed School A
    await School.create({
      id: 'ssm-school-a',
      name: 'SSM Gorakhpur Branch',
      hindiName: 'सरस्वती शिशु मंदिर गोरखपुर',
      address: 'Civil Lines, Gorakhpur',
      city: 'गोरखपुर',
      state: 'उत्तर प्रदेश',
      prant: 'गोरक्ष',
      phone: '+91 99999 11111',
      email: 'a@ssm.test',
      principalName: 'आचार्य राम',
      adminPasscode: '1952'
    });

    // Seed School B
    await School.create({
      id: 'ssm-school-b',
      name: 'SSM Lucknow Branch',
      hindiName: 'सरस्वती शिशु मंदिर लखनऊ',
      address: 'Alambagh, Lucknow',
      city: 'लखनऊ',
      state: 'उत्तर प्रदेश',
      prant: 'अवध',
      phone: '+91 99999 22222',
      email: 'b@ssm.test',
      principalName: 'आचार्य श्याम',
      adminPasscode: '1953'
    });

    // Obtain tokens
    const loginA = await request(app).post('/api/auth/login').send({
      schoolId: 'ssm-school-a',
      passcode: '1952'
    });
    schoolAToken = loginA.body.token;

    const loginB = await request(app).post('/api/auth/login').send({
      schoolId: 'ssm-school-b',
      passcode: '1953'
    });
    schoolBToken = loginB.body.token;
  });

  /* -------------------------------------------------------------------------- */
  /* Scenario 1: Interactive Fee Counter & Custom/Partial Payment Flow         */
  /* -------------------------------------------------------------------------- */
  describe('Scenario 1: Interactive Fee Collection & Payment Modes', () => {
    it('1.1 should create a fee demand and collect partial payment (50%)', async () => {
      // Create initial fee record of Rs. 3000
      const feeDemand = await Fee.create({
        id: 'fee-rec-101',
        schoolId: 'ssm-school-a',
        studentId: 'std-a-01',
        term: 'Q1 (Apr-Jun)',
        academicYear: '2025-26',
        totalAmount: 3000,
        paidAmount: 0,
        status: 'Pending'
      });

      // Pay partial Rs. 1500 via UPI/QR
      const payRes = await request(app)
        .put(`/api/fees/${feeDemand.id}/pay`)
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          paymentMode: 'UPI/QR (PhonePe/GPay)',
          paidAmount: 1500
        });

      expect(payRes.status).toBe(200);
      expect(payRes.body.paidAmount).toBe(1500);
      expect(payRes.body.status).toBe('Partial');
      expect(payRes.body.paymentMode).toBe('UPI/QR (PhonePe/GPay)');
      expect(payRes.body.receiptNo).toContain('SSM-REC');
      expect(payRes.body.paidDate).toBeDefined();
    });

    it('1.2 should transition fee from Partial to Paid when remaining amount is cleared', async () => {
      const fee = await Fee.create({
        id: 'fee-rec-102',
        schoolId: 'ssm-school-a',
        studentId: 'std-a-02',
        term: 'Q1 (Apr-Jun)',
        academicYear: '2025-26',
        totalAmount: 4000,
        paidAmount: 2000,
        status: 'Partial'
      });

      // Pay full balance (Rs. 4000) via Cash
      const payRes = await request(app)
        .put(`/api/fees/${fee.id}/pay`)
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          paymentMode: 'नकद (Cash)',
          paidAmount: 4000
        });

      expect(payRes.status).toBe(200);
      expect(payRes.body.paidAmount).toBe(4000);
      expect(payRes.body.status).toBe('Paid');
      expect(payRes.body.paymentMode).toBe('नकद (Cash)');
    });

    it('1.3 should cap paidAmount at totalAmount when overpayment is sent', async () => {
      const fee = await Fee.create({
        id: 'fee-rec-103',
        schoolId: 'ssm-school-a',
        studentId: 'std-a-03',
        term: 'Q2 (Jul-Sep)',
        academicYear: '2025-26',
        totalAmount: 2500,
        paidAmount: 0,
        status: 'Pending'
      });

      // Attempt to pay 3500 on a 2500 fee
      const payRes = await request(app)
        .put(`/api/fees/${fee.id}/pay`)
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          paymentMode: 'Bank Cheque (चेक)',
          paidAmount: 3500
        });

      expect(payRes.status).toBe(200);
      expect(payRes.body.paidAmount).toBe(2500); // capped at totalAmount
      expect(payRes.body.status).toBe('Paid');
    });

    it('1.4 should prevent School B admin from modifying School A fee', async () => {
      const fee = await Fee.create({
        id: 'fee-rec-a-99',
        schoolId: 'ssm-school-a',
        studentId: 'std-a-09',
        term: 'Q1',
        academicYear: '2025-26',
        totalAmount: 1000,
        paidAmount: 0,
        status: 'Pending'
      });

      const res = await request(app)
        .put(`/api/fees/${fee.id}/pay`)
        .set('Authorization', `Bearer ${schoolBToken}`)
        .send({ paidAmount: 1000 });

      expect(res.status).toBe(404); // Scoped query does not find fee in School B
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Scenario 2: Admission Approval & Automatic Student Provisioning           */
  /* -------------------------------------------------------------------------- */
  describe('Scenario 2: Admission Inquiry to Student Conversion Workflow', () => {
    it('2.1 should submit inquiry, approve it, and automatically create a Student document', async () => {
      // 1. Parent submits admission inquiry
      const applyRes = await request(app)
        .post('/api/admissions')
        .send({
          schoolId: 'ssm-school-a',
          studentName: 'ध्रुव पाण्डेय',
          gender: 'Bhaiya',
          applyingClass: 'Class 6',
          fatherName: 'श्री आलोक पाण्डेय',
          motherName: 'श्रीमती सीमा पाण्डेय',
          phone: '+91 98765 43210',
          address: 'गोरखपुर नगर',
          guardianConsent: true,
          consentPolicyVersion: '2026-09-12'
        });

      expect(applyRes.status).toBe(201);
      expect(applyRes.body.regNo).toContain('SSM-ADM');
      expect(applyRes.body.status).toBe('Pending');
      const admissionId = applyRes.body.id;

      // 2. School A Principal reviews and approves admission
      const approveRes = await request(app)
        .put(`/api/admissions/${admissionId}/approve`)
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.admission.status).toBe('Admitted');
      expect(approveRes.body.student).toBeDefined();
      expect(approveRes.body.student.schoolId).toBe('ssm-school-a');
      expect(approveRes.body.student.class).toBe('Class 6');

      // 3. Verify student exists in MongoDB with proper honorific prefix
      const createdStudent = await Student.findOne({ id: approveRes.body.student.id });
      expect(createdStudent).toBeDefined();
      expect(createdStudent.name).toBe('Bhaiya ध्रुव पाण्डेय');
      expect(createdStudent.rollNo).toBeDefined();
    });

    it('2.2 should reject unauthenticated admission approval attempts', async () => {
      const admission = await Admission.create({
        id: 'adm-unauth-test',
        schoolId: 'ssm-school-a',
        regNo: 'SSM-ADM-2026-999999-123',
        studentName: 'परीक्षार्थी',
        gender: 'Bahin',
        applyingClass: 'Class 1',
        phone: '+91 91234 56789',
        guardianConsent: true,
        consentTimestamp: new Date(),
        consentPolicyVersion: '2026-09-12',
        status: 'Pending'
      });

      const res = await request(app).put(`/api/admissions/${admission.id}/approve`);
      expect(res.status).toBe(401);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Scenario 3: Bulk Student Import ID Scoping & Zero-Collision Guarantee      */
  /* -------------------------------------------------------------------------- */
  describe('Scenario 3: Multi-School Bulk Import ID Isolation', () => {
    it('3.1 should import students in School A and School B with identical roll numbers without collision', async () => {
      const studentBatchA = [
        { name: 'भैया अमित', rollNo: '101', class: 'Class 8', gender: 'Bhaiya', contact: '+91 91111 11111' },
        { name: 'भैया सुमित', rollNo: '102', class: 'Class 8', gender: 'Bhaiya', contact: '+91 91111 22222' }
      ];

      const studentBatchB = [
        { name: 'बहिन प्रिया', rollNo: '101', class: 'Class 8', gender: 'Bahin', contact: '+91 92222 11111' },
        { name: 'बहिन रिया', rollNo: '102', class: 'Class 8', gender: 'Bahin', contact: '+91 92222 22222' }
      ];

      // School A Bulk Import
      const resA = await request(app)
        .post('/api/students/bulk')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ students: studentBatchA, schoolId: 'ssm-school-a' });

      expect(resA.status).toBe(201);
      expect(resA.body.count).toBe(2);

      // School B Bulk Import with SAME roll numbers
      const resB = await request(app)
        .post('/api/students/bulk')
        .set('Authorization', `Bearer ${schoolBToken}`)
        .send({ students: studentBatchB, schoolId: 'ssm-school-b' });

      expect(resB.status).toBe(201);
      expect(resB.body.count).toBe(2);

      // Verify each generated ID starts with target school ID
      const studentsInA = await Student.find({ schoolId: 'ssm-school-a' });
      const studentsInB = await Student.find({ schoolId: 'ssm-school-b' });

      expect(studentsInA.length).toBe(2);
      expect(studentsInB.length).toBe(2);

      expect(studentsInA.every((s: any) => s.id.includes('ssm-school-a'))).toBe(true);
      expect(studentsInB.every((s: any) => s.id.includes('ssm-school-b'))).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Scenario 4: WhatsApp Utilities & Phone Sanitization                       */
  /* -------------------------------------------------------------------------- */
  describe('Scenario 4: 1-Click WhatsApp Direct Communication Utilities', () => {
    it('4.1 cleanIndianPhone: handles various Indian mobile formats correctly', () => {
      expect(cleanIndianPhone('+91 98765 43210')).toBe('919876543210');
      expect(cleanIndianPhone('09876543210')).toBe('919876543210');
      expect(cleanIndianPhone('98765-43210')).toBe('919876543210');
      expect(cleanIndianPhone('9876543210')).toBe('919876543210');
      expect(cleanIndianPhone('12345')).toBeNull(); // invalid length
      expect(cleanIndianPhone('')).toBeNull();
    });

    it('4.2 generateAdmissionWhatsAppUrl: encodes Hindi greeting and child details', () => {
      const url = generateAdmissionWhatsAppUrl(
        '9876543210',
        'आरव वर्मा',
        'कक्षा 6',
        'सरस्वती शिशु मंदिर',
        'गोरखपुर'
      );
      expect(url).not.toBeNull();
      expect(url).toContain('https://wa.me/919876543210?text=');
      const decodedText = decodeURIComponent(url!.split('text=')[1]);
      expect(decodedText).toContain('आरव वर्मा');
      expect(decodedText).toContain('कक्षा 6');
      expect(decodedText).toContain('गोरखपुर');
      expect(decodedText).toContain('सादर प्रणाम');
    });

    it('4.3 generateFeeReminderWhatsAppUrl: encodes fee month and amount', () => {
      const url = generateFeeReminderWhatsAppUrl(
        '+91 91234 56789',
        'भैया मयंक',
        'Class 8',
        'सितंबर 2026',
        1850,
        'गोरखपुर'
      );
      expect(url).not.toBeNull();
      expect(url).toContain('https://wa.me/919123456789?text=');
      const decoded = decodeURIComponent(url!.split('text=')[1]);
      expect(decoded).toContain('भैया मयंक');
      expect(decoded).toContain('1850');
      expect(decoded).toContain('सितंबर 2026');
    });

    it('4.4 generateAttendanceAlertWhatsAppUrl: correctly reflects Absent/Leave status in Hindi', () => {
      const absentUrl = generateAttendanceAlertWhatsAppUrl(
        '9876500000',
        'ऋषभ',
        'Class 7',
        '2026-09-17',
        'Absent',
        'गोरखपुर'
      );
      expect(absentUrl).not.toBeNull();
      const decodedAbsent = decodeURIComponent(absentUrl!.split('text=')[1]);
      expect(decodedAbsent).toContain('अनुपस्थित (Absent)');

      const leaveUrl = generateAttendanceAlertWhatsAppUrl(
        '9876500000',
        'ऋषभ',
        'Class 7',
        '2026-09-17',
        'Leave',
        'गोरखपुर'
      );
      expect(leaveUrl).not.toBeNull();
      const decodedLeave = decodeURIComponent(leaveUrl!.split('text=')[1]);
      expect(decodedLeave).toContain('अवकाश (Leave)');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Scenario 5: Notice Broadcasting & Category Filtering                       */
  /* -------------------------------------------------------------------------- */
  describe('Scenario 5: Notice Broadcasting & Category Isolation', () => {
    it('5.1 should create and filter notices by category', async () => {
      // Create Holiday notice
      await Notice.create({
        id: 'not-01',
        schoolId: 'ssm-school-a',
        title: 'श्री कृष्ण जन्माष्टमी अवकाश',
        content: 'आगामी सोमवार को श्री कृष्ण जन्माष्टमी का पावन अवकाश रहेगा।',
        category: 'Holidays',
        date: '2026-09-15'
      });

      // Create Examination notice
      await Notice.create({
        id: 'not-02',
        schoolId: 'ssm-school-a',
        title: 'अर्धवार्षिक परीक्षा समय-सारिणी',
        content: 'समस्त भैया/बहिनों हेतु अर्धवार्षिक परीक्षा 15 अक्टूबर से प्रारंभ होगी।',
        category: 'Examinations',
        date: '2026-09-16'
      });

      // Fetch all School A notices
      const allRes = await request(app).get('/api/notices?schoolId=ssm-school-a');
      expect(allRes.status).toBe(200);
      expect(allRes.body.length).toBe(2);

      // Verify categories exist in payload
      const categories = allRes.body.map((n: any) => n.category);
      expect(categories).toContain('Holidays');
      expect(categories).toContain('Examinations');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Scenario 6: Salary Slip Cloud Persistence & Multi-Tenant Upsert           */
  /* -------------------------------------------------------------------------- */
  describe('Scenario 6: Salary Slip Cloud Persistence & Upsert', () => {
    it('6.1 should persist, upsert, and isolate staff salary slips', async () => {
      const slipPayload = {
        staffId: 'stf-101',
        staffName: 'आचार्य रमेश चंद्र शास्त्री',
        designation: 'वरिष्ठ आचार्य (Senior Teacher)',
        month: '2026-09',
        academicYear: '2025-26',
        basicPay: 20000,
        daHra: 5000,
        grossPay: 25000,
        pfDeduction: 1800,
        samitiDeduction: 500,
        totalDeductions: 2300,
        netSalary: 22700,
        paymentStatus: 'Disbursed',
        paymentMode: 'Bank Transfer (NEFT/RTGS)'
      };

      // 1. Create slip
      const createRes = await request(app)
        .post('/api/salary-slips')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send(slipPayload);

      expect(createRes.status).toBe(201);
      expect(createRes.body.netSalary).toBe(22700);

      // 2. Query slip for staff
      const getRes = await request(app)
        .get('/api/salary-slips?staffId=stf-101')
        .set('Authorization', `Bearer ${schoolAToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.length).toBe(1);
      expect(getRes.body[0].month).toBe('2026-09');

      // 3. Upsert with updated daHra and netSalary
      const updateRes = await request(app)
        .post('/api/salary-slips')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({ ...slipPayload, daHra: 6000, grossPay: 26000, netSalary: 23700 });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.daHra).toBe(6000);
      expect(updateRes.body.netSalary).toBe(23700);

      // Verify total slips count is still 1 (upserted, not duplicated)
      const afterUpsertRes = await request(app)
        .get('/api/salary-slips?staffId=stf-101')
        .set('Authorization', `Bearer ${schoolAToken}`);
      expect(afterUpsertRes.body.length).toBe(1);

      // 4. Cross-school isolation (School B cannot see School A salary slip)
      const schoolBRes = await request(app)
        .get('/api/salary-slips?staffId=stf-101')
        .set('Authorization', `Bearer ${schoolBToken}`);
      expect(schoolBRes.body.length).toBe(0);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Scenario 7: General Admission Updates                                      */
  /* -------------------------------------------------------------------------- */
  describe('Scenario 7: General Admission Details Update', () => {
    it('7.1 should update applicant details and status via PUT /api/admissions/:id', async () => {
      // 1. Submit admission
      const admRes = await request(app)
        .post('/api/admissions')
        .send({
          schoolId: 'ssm-school-a',
          studentName: 'सुमित कुमार',
          gender: 'Bhaiya',
          applyingClass: 'Class 6',
          fatherName: 'राजेश कुमार',
          motherName: 'सुनीता देवी',
          phone: '+91 98765 43210',
          address: 'सिविल लाइन्स, गोरखपुर',
          guardianConsent: true,
          consentPolicyVersion: '2026-09-12'
        });

      expect(admRes.status).toBe(201);
      const admId = admRes.body.id;

      // 2. Update admission details
      const updateRes = await request(app)
        .put(`/api/admissions/${admId}`)
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          applyingClass: 'Class 7',
          status: 'Admitted',
          address: 'गोरखनाथ मंदिर मार्ग, गोरखपुर'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.applyingClass).toBe('Class 7');
      expect(updateRes.body.status).toBe('Admitted');
      expect(updateRes.body.address).toBe('गोरखनाथ मंदिर मार्ग, गोरखपुर');
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Scenario 8: Homework Editing & In-line Updates                            */
  /* -------------------------------------------------------------------------- */
  describe('Scenario 8: Homework Editing & In-line Updates', () => {
    it('8.1 should update homework assignment details via PUT /api/homework/:id', async () => {
      // 1. Create homework
      const hwRes = await request(app)
        .post('/api/homework')
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          class: 'Class 8',
          subject: 'गणित',
          title: 'प्रश्नावली 3.1 हल करें',
          description: 'सभी 10 प्रश्न हल करें',
          assignedBy: 'आचार्य रमेश जी',
          dueDate: '2026-09-20'
        });

      expect(hwRes.status).toBe(201);
      const hwId = hwRes.body.id;

      // 2. Update homework
      const updateRes = await request(app)
        .put(`/api/homework/${hwId}`)
        .set('Authorization', `Bearer ${schoolAToken}`)
        .send({
          title: 'प्रश्नावली 3.1 एवं 3.2 हल करें',
          dueDate: '2026-09-22'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.title).toBe('प्रश्नावली 3.1 एवं 3.2 हल करें');
      expect(updateRes.body.dueDate).toBe('2026-09-22');
      expect(updateRes.body.subject).toBe('गणित');
    });
  });
});

