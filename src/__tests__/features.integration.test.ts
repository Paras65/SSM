import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-1234';
process.env.DEVELOPER_ADMIN_PASSCODE = 'test-dev-secret';

const require = createRequire(import.meta.url);
const mongoose = require('mongoose');
const { app } = require('../../server/index.js');
const School = require('../../server/models/School.js');
const Staff = require('../../server/models/Staff.js');
const Student = require('../../server/models/Student.js');
const Exam = require('../../server/models/Exam.js');
const Timetable = require('../../server/models/Timetable.js');
const Leave = require('../../server/models/Leave.js');
const Transport = require('../../server/models/Transport.js');
const Book = require('../../server/models/Book.js');
const BookIssue = require('../../server/models/BookIssue.js');
const InventoryItem = require('../../server/models/InventoryItem.js');
const ReportCard = require('../../server/models/ReportCard.js');

let mongoServer: MongoMemoryServer;
let adminToken: string;
let teacherToken: string;

describe('All New Modules Integration Verification', () => {
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
      Staff.deleteMany({}),
      Student.deleteMany({}),
      Exam.deleteMany({}),
      Timetable.deleteMany({}),
      Leave.deleteMany({}),
      Transport.deleteMany({}),
      Book.deleteMany({}),
      BookIssue.deleteMany({}),
      InventoryItem.deleteMany({}),
      ReportCard.deleteMany({})
    ]);

    // Create school
    await School.create({
      id: 'ssm-test',
      name: 'SSM Test School',
      hindiName: 'सरस्वती शिशु मंदिर परीक्षण',
      address: 'Gorakhpur',
      city: 'Gorakhpur',
      state: 'UP',
      prant: 'Goraksh',
      phone: '+91 99999 00000',
      email: 'test@ssm.test',
      principalName: 'Principal Ji',
      adminPasscode: '1234'
    });

    // Create teacher staff with PIN
    await Staff.create({
      id: 'staff-101',
      schoolId: 'ssm-test',
      name: 'Acharya Ram Sharma',
      designation: 'आचार्य (वरिष्ठ शिक्षक)',
      phone: '+91 98765 43210',
      email: 'ram@ssm.test',
      qualification: 'M.Sc., B.Ed.',
      subjects: 'गणित',
      monthlySalary: 28000,
      joiningDate: '2020-07-01',
      pin: '5678'
    });

    // Create student
    await Student.create({
      id: 'std-201',
      schoolId: 'ssm-test',
      rollNo: '101',
      name: 'Aarav Gupta',
      gender: 'Bhaiya',
      class: 'Class 8',
      section: 'A',
      fatherName: 'Rajesh Gupta',
      contact: '+91 91234 56789',
      address: 'Civil Lines',
      dob: '2012-05-15',
      admissionDate: '2022-04-01'
    });

    // Admin login to obtain admin token
    const adminLogin = await request(app).post('/api/auth/login').send({
      schoolId: 'ssm-test',
      passcode: '1234'
    });
    adminToken = adminLogin.body.token;

    // Teacher login to obtain teacher token
    const teacherLogin = await request(app).post('/api/auth/teacher-login').send({
      schoolId: 'ssm-test',
      phone: '+91 98765 43210',
      pin: '5678'
    });
    teacherToken = teacherLogin.body.token;
  });

  it('1. Teacher Authentication: authenticates teacher with phone + pin and rejects invalid pin', async () => {
    // Valid login
    const valid = await request(app).post('/api/auth/teacher-login').send({
      schoolId: 'ssm-test',
      phone: '+91 98765 43210',
      pin: '5678'
    });
    expect(valid.status).toBe(200);
    expect(valid.body.teacher.name).toBe('Acharya Ram Sharma');
    expect(valid.body.token).toBeDefined();

    // Invalid PIN
    const invalid = await request(app).post('/api/auth/teacher-login').send({
      schoolId: 'ssm-test',
      phone: '+91 98765 43210',
      pin: '0000'
    });
    expect(invalid.status).toBe(401);
  });

  it('2. Exam Management & Marks Bulk Entry: saves exam schedule and enters marks into report card', async () => {
    // Create Exam
    const examRes = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schoolId: 'ssm-test',
        title: 'अर्धवार्षिक परीक्षा 2025-26',
        term: 'अर्धवार्षिक परीक्षा',
        academicYear: '2025-26',
        classes: ['Class 8'],
        startDate: '2026-10-15',
        endDate: '2026-10-25',
        dateSheet: [
          { class: 'Class 8', subject: 'गणित', date: '2026-10-15', timing: '09:00 AM - 12:00 PM', maxMarks: 100, roomNo: '101' }
        ]
      });
    expect(examRes.status).toBe(201);
    expect(examRes.body.title).toContain('अर्धवार्षिक परीक्षा');

    // Bulk Marks Entry by Teacher
    const marksRes = await request(app)
      .post('/api/exams/marks-bulk')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        schoolId: 'ssm-test',
        examTerm: 'अर्धवार्षिक परीक्षा',
        academicYear: '2025-26',
        subject: 'गणित',
        marksList: [
          { studentId: 'std-201', marksObtained: 92, maxMarks: 100 }
        ]
      });
    expect(marksRes.status).toBe(200);
    expect(marksRes.body.count).toBe(1);

    // Verify ReportCard created with calculated A+ grade
    const report = await ReportCard.findOne({ studentId: 'std-201' });
    expect(report).toBeDefined();
    expect(report.marks[0].subject).toBe('गणित');
    expect(report.marks[0].marksObtained).toBe(92);
    expect(report.percentage).toBe(92);
    expect(report.grade).toBe('A+');
  });

  it('3. Timetable Management: saves and retrieves weekly schedule for class', async () => {
    const timetableData = {
      schoolId: 'ssm-test',
      class: 'Class 8',
      section: 'A',
      schedule: [
        {
          day: 'Monday',
          slots: [
            { period: 1, subject: 'प्रार्थना / वंदना', teacherName: 'समस्त आचार्य', room: 'प्रांगण' },
            { period: 2, subject: 'गणित', teacherName: 'Acharya Ram Sharma', room: '101' }
          ]
        }
      ]
    };

    const saveRes = await request(app)
      .post('/api/timetable')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(timetableData);
    expect(saveRes.status).toBe(200);

    const getRes = await request(app).get('/api/timetable?schoolId=ssm-test&class=Class%208');
    expect(getRes.status).toBe(200);
    expect(getRes.body.length).toBeGreaterThan(0);
    expect(getRes.body[0].schedule[0].slots[1].subject).toBe('गणित');
  });

  it('4. Leave Workflow: submits leave and allows admin approval', async () => {
    // Submit student leave
    const leaveRes = await request(app)
      .post('/api/leaves')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schoolId: 'ssm-test',
        applicantType: 'student',
        applicantId: 'std-201',
        applicantName: 'Aarav Gupta',
        classOrDesignation: 'Class 8',
        startDate: '2026-09-15',
        endDate: '2026-09-17',
        reason: 'पारिवारिक कार्यक्रम'
      });
    expect(leaveRes.status).toBe(201);
    const leaveId = leaveRes.body.id;

    // Approve leave
    const patchRes = await request(app)
      .patch(`/api/leaves/${leaveId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'Approved',
        reviewerRemarks: 'स्वीकृत किया गया।'
      });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.status).toBe('Approved');
  });

  it('5. Transport Fleet: creates and fetches bus route with stops', async () => {
    const routeRes = await request(app)
      .post('/api/transport/routes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schoolId: 'ssm-test',
        routeName: 'रूट 1 - शास्त्री चौक',
        vehicleNumber: 'UP 53 AB 1234',
        driverName: 'राजू भैया',
        driverPhone: '+91 98888 77777',
        monthlyFee: 600,
        stops: [
          { stopName: 'शास्त्री चौक', pickupTime: '07:30 AM', dropTime: '02:00 PM', fee: 600 }
        ]
      });
    expect(routeRes.status).toBe(201);

    const listRes = await request(app).get('/api/transport/routes?schoolId=ssm-test');
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBe(1);
    expect(listRes.body[0].vehicleNumber).toBe('UP 53 AB 1234');
  });

  it('6. Library Management: catalogs book, issues book (decrements stock), returns book (restores stock)', async () => {
    // Add book
    const bookRes = await request(app)
      .post('/api/library/books')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schoolId: 'ssm-test',
        accessionNo: 'BK-001',
        title: 'वैदिक गणित भाग 1',
        author: 'स्वामी भारती कृष्ण तीर्थ',
        category: 'विज्ञान व गणित',
        shelfLocation: 'रैक A-1',
        totalCopies: 5,
        availableCopies: 5
      });
    expect(bookRes.status).toBe(201);
    const bookId = bookRes.body.id;

    // Issue book
    const issueRes = await request(app)
      .post('/api/library/issue')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schoolId: 'ssm-test',
        bookId,
        bookTitle: 'वैदिक गणित भाग 1',
        accessionNo: 'BK-001',
        borrowerType: 'student',
        borrowerId: 'std-201',
        borrowerName: 'Aarav Gupta',
        dueDate: '2026-09-26'
      });
    expect(issueRes.status).toBe(201);
    const issueId = issueRes.body.id;

    // Check available copies decremented to 4
    let book = await Book.findOne({ id: bookId });
    expect(book.availableCopies).toBe(4);

    // Return book
    const returnRes = await request(app)
      .post('/api/library/return')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        issueId,
        fineAmount: 0
      });
    expect(returnRes.status).toBe(200);

    // Check available copies restored to 5
    book = await Book.findOne({ id: bookId });
    expect(book.availableCopies).toBe(5);
  });

  it('7. Store Inventory: creates inventory item and updates stock delta', async () => {
    const itemRes = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schoolId: 'ssm-test',
        itemName: 'विद्यालय गणवेश (कक्षा 6-8)',
        category: 'गणवेश (Uniform)',
        stockQuantity: 40,
        minimumAlertStock: 10,
        unitPrice: 750
      });
    expect(itemRes.status).toBe(201);
    const itemId = itemRes.body.id;

    // Adjust stock by +15
    const adjustRes = await request(app)
      .post(`/api/inventory/${itemId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ delta: 15 });
    expect(adjustRes.status).toBe(200);
    expect(adjustRes.body.stockQuantity).toBe(55);
  });

  it('8. Audit & Activity Logging: records operational events and allows admin to fetch audit log', async () => {
    const logsRes = await request(app)
      .get('/api/audit-logs?schoolId=ssm-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(logsRes.status).toBe(200);
    expect(Array.isArray(logsRes.body)).toBe(true);
    expect(logsRes.body.length).toBeGreaterThan(0);
    expect(logsRes.body.some((l: any) => l.action === 'TEACHER_LOGIN')).toBe(true);
  });
});
