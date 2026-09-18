# SSM School Management System — Architecture Audit & Future Roadmap

**Document Version:** 1.0.0  
**Date:** September 2026  
**Project:** Saraswati Shishu Mandir (SSM) School ERP  
**Reference Repository:** `Paras65/SSM`

---

## Executive Summary

This document captures the comprehensive technical evaluation of the SSM School ERP across five foundational architectural pillars:
1. **Compliance & Data Integration (UDISE+ & NEP 2020)**
2. **Scalability & High-Load Architecture (8:00 AM Concurrency)**
3. **Security, Cryptography & Data Privacy (DPDP Act 2023)**
4. **Role-Based Access Control (RBAC)**
5. **Real-World Indian School Operational Edge Cases**

---

## 1. Compliance & Data Integration (UDISE+ & NEP 2020)

### Current Status
- `src/utils/udiseExport.ts` generates a 21-column CSV with UTF-8 BOM.
- Basic UDISE identifiers (`pen`, `apaarId`, `socialCategory`, `cwsn`, `bpl`, `udiseStatus`) exist on `server/models/Student.js`.

### Identified Deficiencies
- **Missing Aadhaar / Virtual ID (VID) & Aadhaar Name Verification:** UDISE+ SDMS requires 12-digit Aadhaar/EID and exact Aadhaar-matched name for Direct Benefit Transfer (DBT).
- **Missing Mother Tongue & Medium of Instruction:** Mandated under NEP 2020 §4.11–4.13 (Foundational Literacy in Mother Tongue & Three-Language Formula).
- **Missing Holistic Progress Card (HPC) Dimensions:** NEP 2020 §4.35 requires 360-degree assessment across Cognitive, Socio-Emotional, and Psychomotor domains (self, peer, teacher). Current `ReportCard.js` only records traditional numerical marks.
- **Missing Banking Details:** Student/Parent Bank Account No, IFSC, and Beneficiary Name are needed for textbook, uniform, and scholarship disbursals.
- **Missing Enrollment Profile (EP) Historical Metrics:** Previous school type, previous class result, and attendance percentage in previous year.

### Future Implementation Specification

```javascript
// Additions to server/models/Student.js
const studentComplianceFields = {
  // Identity & DBT
  aadhaarHash: { type: String, select: false }, // SHA-256 hash or token, never raw Aadhaar
  aadhaarMatchedName: { type: String, trim: true },
  
  // NEP 2020 Language & Academics
  motherTongue: { type: String, default: 'Hindi' },
  instructionMedium: { type: String, default: 'Hindi' },
  stream: { type: String, enum: ['Science', 'Commerce', 'Humanities', 'Vocational', ''] },
  vocationalSkills: [{ type: String }], // NEP 10 bagless days / vocational exposure
  
  // Socio-Economic
  religion: { type: String, enum: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'] },
  minorityStatus: { type: Boolean, default: false },
  
  // Banking for DBT
  bankDetails: {
    accountNoMasked: { type: String }, // e.g., 'XXXXXX4812'
    ifsc: { type: String, uppercase: true },
    bankName: { type: String },
    beneficiaryName: { type: String }
  },

  // UDISE+ Enrollment Profile
  previousAcademicMetric: {
    previousSchoolType: { type: String, enum: ['Same School', 'Other Recognized', 'Unrecognized', 'Anganwadi'] },
    previousClass: { type: String },
    previousExamResult: { type: String, enum: ['Passed', 'Failed', 'Appeared', 'Not Appeared'] },
    previousYearDaysAttended: { type: Number, min: 0, max: 365 }
  }
};
```

---

## 2. Scalability & Architecture (8:00 AM Peak Load)

### Current Status
- Express 5.x on Node.js + Mongoose 9.x.
- Batch writes implemented via `Attendance.bulkWrite()` with upserts.

### Critical Bottlenecks
1. **Post-Write Query Amplification (`server/routes/attendance.js`):**
   - Lines 100–104 execute `await Attendance.find(filter)` immediately after `bulkWrite`.
   - When 30–50 teachers submit attendance concurrently at 8:00 AM, the server performs 50 simultaneous unpaginated queries returning thousands of attendance records, causing memory spikes and network saturation.
2. **Direct Database Saturation:**
   - No queue buffer (BullMQ / Redis) or rate-limiting for write operations.
   - MongoDB default connection pool (10 sockets) risks exhaustion under concurrent bursts.
3. **Cross-Tenant Mutation Gap (`server/routes/schools.js`):**
   - `POST /:id/reactivate` lacks `requireSchoolScope` and developer-only validation.

### Remediation Plan

```javascript
// 1. Refactor server/routes/attendance.js bulk endpoint:
router.post('/bulk', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  // ... validation and operations mapping ...
  const bulkResult = await Attendance.bulkWrite(operations, { ordered: false });
  
  // Return lightweight acknowledgement instead of full school array
  res.status(200).json({
    success: true,
    matchedCount: bulkResult.matchedCount,
    upsertedCount: bulkResult.upsertedCount,
    modifiedCount: bulkResult.modifiedCount
  });
});

// 2. Tune Mongoose connection pool in server/index.js:
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

---

## 3. Security & Data Privacy (DPDP Act 2023)

### Critical Vulnerabilities Matrix

| Vulnerability | Location | Severity | Impact |
|---|---|:---:|---|
| **Plaintext Passwords & PINs** | `School.js`, `Staff.js`, `Student.js`, `authValidation.js` | **CRITICAL** | Database dump exposes all admin, teacher, and student credentials. Direct string comparison (`===`). |
| **Minor PII Scraping via Wildcard** | `GET /api/students/verify-tc` in `server/routes/students.js` | **HIGH** | Public unauthenticated endpoint accepts 2-character query regex `$or: [{rollNo}, {pen}, {name}]` returning full minor PII (parents, address, DOB). |
| **Destructive Financial Overwrite** | `server/routes/fees.js` (`fee.paidAmount = collectedAmount`) | **HIGH** | Overwrites previous installment payments instead of calculating cumulative paid amounts; no transaction ledger. |
| **Missing Auth Rate-Limiting** | `server/routes/auth.js` | **HIGH** | No rate limits on 4-digit PIN logins, allowing rapid brute-force attacks. |

### Remediation Blueprint

1. **Bcrypt Hashing for Passcodes & PINs:**
   ```javascript
   const bcrypt = require('bcryptjs');

   // Hash before saving
   schoolSchema.pre('save', async function() {
     if (this.isModified('adminPasscode') && !this.adminPasscode.startsWith('$2a$')) {
       this.adminPasscode = await bcrypt.hash(this.adminPasscode, 10);
     }
   });

   staffSchema.pre('save', async function() {
     if (this.isModified('pin') && !this.pin.startsWith('$2a$')) {
       this.pin = await bcrypt.hash(this.pin, 10);
     }
   });
   ```

2. **Secure `GET /api/students/verify-tc`:**
   - Remove regex search on names/rolls.
   - Restrict lookup strictly to an exact cryptographic Certificate Verification Code (`tcVerifyCode`) or unique TC Number.
   - Redact minor contact information and parent mobile numbers from public output.

3. **Rate Limiting on Authentication Endpoints:**
   ```javascript
   const rateLimit = require('express-rate-limit');

   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 10, // Max 10 failed attempts
     standardHeaders: true,
     legacyHeaders: false,
     message: { error: 'अत्यधिक लॉगिन प्रयास! कृपया 15 मिनट बाद पुनः प्रयास करें।' }
   });

   router.use('/login', authLimiter);
   router.use('/student-login', authLimiter);
   router.use('/teacher-login', authLimiter);
   ```

4. **Fee Payment Ledger (`server/models/FeePaymentTransaction.js`):**
   ```javascript
   const feePaymentTransactionSchema = new mongoose.Schema({
     id: { type: String, required: true, unique: true },
     schoolId: { type: String, required: true, index: true },
     feeId: { type: String, required: true, index: true },
     studentId: { type: String, required: true, index: true },
     amountPaid: { type: Number, required: true, min: 1 },
     receiptNo: { type: String, required: true, unique: true },
     paymentMode: { type: String, enum: ['Cash', 'UPI', 'NetBanking', 'Cheque', 'DD'], required: true },
     transactionRef: { type: String, default: '' },
     collectedBy: { type: String, required: true },
     paymentDate: { type: Date, default: Date.now }
   }, { timestamps: true });
   ```

---

## 4. Role-Based Access Control (RBAC)

### Current Role Hierarchy
- `developer`: Super Admin (`schoolId: '*'`)
- `admin`: School Administrator (`schoolId: req.userSchoolId`)
- `teacher`: School Teacher (`schoolId: req.userSchoolId`)
- `student`: Student Portal (`schoolId`, `studentClass`)

### Identified RBAC Deficiencies
1. **Missing Parent Role:** Parents are forced to use `student-login`.
   - Sibling aggregation is impossible (separate logins per child).
   - Students have uninhibited access to financial arrears, notices, and parent phone settings.
2. **Permissive Teacher Access:** Any authenticated teacher in the school can query and modify attendance/marks for **all classes** in the school (e.g., Nursery teacher modifying Class 12 board marks).

### Target RBAC Architecture

```
[Developer]
    └── [School Admin]
            ├── [Class Teacher] ── (Authorized for allocated Class/Section only)
            ├── [Subject Teacher] ─ (Authorized for allocated Subject/Class only)
            ├── [Parent Account] ─ (Authorized for linked children across classes)
            └── [Student Portal] ── (Read-only access to own homework, attendance, timetable)
```

#### Dedicated Parent Account Model (`server/models/Parent.js`):
```javascript
const parentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  schoolId: { type: String, required: true, index: true },
  phone: { type: String, required: true, index: true },
  email: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  linkedStudentIds: [{ type: String, ref: 'Student' }], // Enables 1-click sibling switching
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });
```

---

## 5. Real-World Operational Edge Cases

### Edge Case 1: Divorced / Separated Parents & Legal Custody Restrictions
- **Scenario:** A court grants custody to the mother and issues a restraining order against the father regarding school pickup and academic tracking.
- **Risk:** Unseparated `student-login` allows the non-custodial parent to track daily attendance (real-time school presence) and attend school premises.
- **Fix:** Introduce a `guardianship` subdocument on `Student` specifying:
  - `primaryGuardian`: `'Mother' | 'Father' | 'Legal Guardian'`
  - `authorizedPickupPersons`: `[{ name, relation, photoUrl, phone }]`
  - `custodyAlert`: `{ hasRestriction: Boolean, remarks: String, alertStaffOnPickup: Boolean }`

### Edge Case 2: Offline Attendance with Distributed Conflict Resolution
- **Scenario:** Rural / ground assembly attendance is taken without connectivity on two separate devices (class teacher and substitute teacher).
- **Risk:** Last-write-wins blind `$set` upsert in `bulkWrite` causes valid medical leaves or late entries to be overwritten.
- **Fix:** Implement optimistic concurrency control with `revision` numbers and hierarchical status precedence:
  $$\text{Medical Leave} > \text{Approved Leave} > \text{Present} > \text{Absent}$$

### Edge Case 3: Sibling Fee Concessions (*सहोदर छात्र छूट*)
- **Scenario:** Vidya Bharati schools offer 25%–50% tuition discounts for 2nd and 3rd siblings.
- **Risk:** Without a family linkage key (`familyId`), admins must manually apply discounts each term, leading to frequent billing discrepancies.
- **Fix:** Add `familyId` compound index to `Student` and automate sibling concession calculations during fee demand generation.

### Edge Case 4: Mid-Term Admission & Roll Number Reshuffling
- **Scenario:** A student leaves on Transfer Certificate (TC), and the vacated roll number is assigned to an incoming student in October.
- **Risk:** Cross-student data contamination if queries link by `rollNo` rather than immutable `studentId`.
- **Fix:** Enforce relational integrity strictly on immutable UUIDs (`studentId` / `scholarNo`). Never use `rollNo` as an internal foreign key.

### Edge Case 5: Cheque / DD Fee Payments & Bounce Workflows
- **Scenario:** Fees paid via bank cheque take 3 business days to clear or may bounce due to insufficient funds.
- **Risk:** Current binary status (`'Paid' | 'Pending'`) cannot represent uncleared funds or bounce penalties.
- **Fix:** Expand fee lifecycle statuses to include `'Pending'`, `'Under Clearance'`, `'Cleared'`, `'Bounced'`, and `'Refunded'`, with automated bounce penalty addition.

---

## Implementation Priority Roadmap

| Phase | Target Area | Key Deliverables |
|:---:|---|---|
| **Phase 1 (Immediate)** | **Security & Integrity** | • Bcrypt password/PIN hashing<br>• Lock down `verify-tc` public route<br>• Eliminate post-bulk attendance full-table query<br>• Rate limiting on authentication routes |
| **Phase 2 (Short-Term)** | **Financial Ledger & RBAC** | • Independent `FeePaymentTransaction` model<br>• Cumulative partial fee payment handling<br>• Class-teacher scoped authorization middleware<br>• Dedicated Parent account model |
| **Phase 3 (Medium-Term)** | **Compliance & Edge Cases** | • Full 42-column official UDISE+ SDMS export<br>• Custody restriction and authorized pickup profiles<br>• Offline attendance sync with conflict resolution<br>• Sibling family grouping and concession automation |

