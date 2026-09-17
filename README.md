# SSM School ERP

> **Saraswati Shishu Mandir (SSM) School Management & ERP System**
> Built by [init65.co.in](https://www.init65.co.in) for Vidya Bharati affiliated schools.

A full-stack, paperless school management platform built to replace manual paperwork with intuitive digital tools — honoring the values of Vidya Bharati and Panchmukhi Shiksha.

---

## 🌟 Developer Vision

> *"As a full-stack developer at init65.co.in, I built this school management ERP to solve the real, everyday challenges faced by Saraswati Shishu Mandir (SSM) schools, Acharyas (teachers), and students. By replacing tedious manual paperwork with intuitive digital tools, eliminating expensive SMS charges with zero-cost WhatsApp alerts, and honoring the timeless values of Vidya Bharati and Panchmukhi Shiksha, this platform empowers schools to become truly paperless, transparent, and digitally empowered."*

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS 4 |
| Backend | Express 5, Node.js |
| Database | MongoDB + Mongoose 9 |
| Auth | JWT (jsonwebtoken) |
| Security | Helmet, CORS, NoSQL sanitization, express-rate-limit |
| PWA | Service worker + offline app shell |
| Testing | Vitest (unit/integration), Playwright (E2E) |
| Linting | oxlint |

---

## 🏫 Features

### Admin Portal
| Module | Description |
|---|---|
| 📋 Student Management | Add, edit, delete, search students; bulk CSV import |
| 💰 Fee Management | Fee records, payment collection, receipts, arrear tracking |
| 📅 Attendance | Daily attendance marking and reports |
| 📝 Exam Management | Create exams, record marks, lock results |
| 📊 Tabulation Register | Class-wise result sheets |
| 📄 Pragati Patra | Progress report cards |
| 🏫 Session Management | Academic session handling, student promotion/detention |
| 🕒 Timetable Manager | Class-wise timetable creation |
| 📚 Library Management | Book inventory, issue/return tracking |
| 🚌 Transport Management | Route and vehicle management |
| 🏪 Inventory Management | School inventory and stock tracking |
| 🏖️ Leave Management | Staff/student leave applications |
| 🎓 Certificates | Transfer Certificate (TC), Bonafide, Character Certificate |
| 🪪 ID Cards | Student ID cards, Bulk ID card generation |
| 🧾 Admit Cards | Exam admit card generation |
| 💼 Staff Salary Slips | Staff payroll and salary slip generation |
| 📢 Bulk Notifications | WhatsApp-based bulk parent notifications |
| 🏛️ School Management | Multi-branch school settings and configuration |
| 🔍 Audit Logs | Full security and activity audit trail |
| 🔒 Pro Upgrade | Branch-level plan management |
| 💡 Help Guide | In-app 1-minute guide for non-technical staff |

### Teacher Portal
- Attendance marking
- Exam marks entry
- Homework management
- Timetable view

### Student / Parent Portal
- Result viewing
- Attendance history
- Fee status
- Notice board

### Public Landing Page
- School information
- Online admission enquiry form
- Contact section

---

## 🗄️ Database Models

17 Mongoose models: `Student`, `Staff`, `School`, `Exam`, `Fee`, `Attendance`, `ReportCard`, `Timetable`, `Book`, `BookIssue`, `InventoryItem`, `Transport`, `Leave`, `Notice`, `Homework`, `Admission`, `AuditLog`

---

## 🚀 Performance & Scalability

- **Bundle size:** 206 KB initial JS (64.6% reduction via `React.lazy` route-level code splitting)
- **Concurrency:** 50 simultaneous parallel reads → 100% success rate in < 280ms
- **Bulk ingestion:** 200 student records batch insert in ~31ms
- **Rate limiting:** `express-rate-limit` on all auth and public endpoints (15-min window)
- **Security:** NoSQL injection sanitization, JWT auth, Helmet headers, multi-tenant data isolation

Full details: [docs/SCALABILITY_AND_PERFORMANCE.md](docs/SCALABILITY_AND_PERFORMANCE.md)

---

## 🧪 Testing

```bash
# Unit & integration tests (168 tests, ~6s)
npm test

# E2E browser tests (Playwright — Desktop, Pixel 7, iPhone 14)
npm run test:e2e
```

**Test coverage:**
- 168 unit/integration tests across 16 test files
- 24 E2E Playwright tests (Desktop Chrome, Pixel 7, iPhone 14)
- Includes: security hardening, NoSQL injection, DPDP compliance, multi-tenant isolation, scalability, negative testing, audit logging

---

## ⚙️ Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your values
```

### 3. Start backend
```bash
npm run server
```

### 4. Start frontend
```bash
npm run dev
```

### 5. Open in browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

Or run both together:
```bash
npm run dev:all
```

---

## 🔐 Environment Variables

```env
# Frontend
VITE_API_BASE=http://localhost:5000/api
VITE_UPGRADE_CONTACT=support@init65.co.in

# Backend
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ssm_school
JWT_SECRET=change_this_to_a_secure_secret
DEVELOPER_ADMIN_PASSCODE=change_this_to_a_private_developer_passcode
CORS_ORIGIN=https://ssm.init65.co.in,http://localhost:5173
```

**`DEVELOPER_ADMIN_PASSCODE`** enables the `डेवलपर: सभी शाखाएं प्रबंधित करें` option in admin login — grants a cross-branch developer session. Keep this private and set it only in backend environment.

**`VITE_UPGRADE_CONTACT`** is the support email shown when a branch requests a Pro plan upgrade.

---

## ☁️ Deployment

### Frontend → Vercel

1. Import project into Vercel
2. Set framework: **Vite**
3. Add environment variable:
   ```env
   VITE_API_BASE=https://your-render-app.onrender.com/api
   ```
4. Deploy

### Backend → Render

1. Create a new **Web Service** on Render
2. Set runtime command:
   ```bash
   node server/index.js
   ```
3. Add environment variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ssm_school
   JWT_SECRET=your_secure_secret
   DEVELOPER_ADMIN_PASSCODE=your_private_passcode
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
4. Deploy

---

## 📁 Project Structure

```
ssm/
├── src/
│   ├── components/
│   │   ├── admin/       # 29 admin feature modals + dashboard
│   │   ├── teacher/     # Teacher portal components
│   │   ├── student/     # Student/parent portal components
│   │   ├── public/      # Landing page sections
│   │   └── common/      # Shared UI components
│   ├── context/         # React context (SchoolContext, AuthContext, etc.)
│   ├── services/        # API client (api.ts)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # CSV export, WhatsApp alerts, UDISE export, etc.
│   └── __tests__/       # Vitest unit & integration tests
├── server/
│   ├── index.js         # Express app entry point
│   ├── routes/api.js    # API routes (TODO: split by domain)
│   ├── models/          # 17 Mongoose models
│   ├── middleware/      # Auth, sanitization middleware
│   ├── utils/           # Server-side utilities
│   └── seed.js          # Database seeding script
├── e2e/                 # Playwright E2E tests
├── public/              # Static assets, PWA manifest
├── docs/                # Technical documentation
└── .github/workflows/   # CI (GitHub Actions)
```

---

## 📝 Notes

- `localStorage` is used **only** for lightweight UI preferences (language selection, current branch ID). All application data is persisted via the MongoDB-backed API.
- Local development proxies the frontend to the local Express backend.
- The CI pipeline (`npm test`) runs on every push and pull request via GitHub Actions.

---

## 📜 License

MIT — [init65.co.in](https://www.init65.co.in)

---

## 🔍 Feature Gap Review Tracker

> Systematic review of each feature module — what works, what is missing, and what needs to be fixed.
> Status: **In Progress** (updated: 2026-09-17)

---

### ✅ Feature 1: Student Management & Onboarding — RESOLVED

**Gaps Addressed:**
1. ✅ **In-line Student Edit UI:** Added "संपादन" button to student roster rows in `AdminStudentsTab.tsx`; upgraded `AddStudentModal.tsx` to support both Add & Edit modes with full pre-population and `updateStudent()` integration.
2. ✅ **Removed Residual Paywalls:** Removed `requirePro()` restrictions and lock icons from CSV Export, ID Card, TC, and Report Card in `AdminStudentsTab.tsx`.
3. ✅ **Toast Refactor:** Replaced browser `alert()` in `AddStudentModal.tsx` with `showWarning()` and `showSuccess()` from `useToast`.

---

### ✅ Feature 2: Attendance Management — RESOLVED

**Gaps Addressed:**
1. ✅ **Monthly & Date-Range Summary View:** Added a view mode switcher ("दैनिक अंकन" vs "मासिक / अवधि सारांश") in `AdminAttendanceTab.tsx` with start/end date filters, aggregated present/absent/leave counts, attendance %, low attendance (<75%) flags, and range CSV export.
2. ✅ **`DELETE /api/attendance/:id` Implemented:** Added backend delete endpoint with school-scoping and client `api.deleteAttendance(id)`.
3. ✅ **Absentee-Only CSV Export:** Added `exportAbsenteesToCSV()` in `src/utils/csvExport.ts` and a direct "अनुपस्थित सूची CSV" action button in `AdminAttendanceTab.tsx` with parent contact numbers.
4. ✅ **Removed Residual Paywalls:** Removed `requirePro()` restrictions and lock icons from Mark All Present, Mark All Absent, Attendance CSV export, and Absentee WhatsApp alert.
5. ✅ **Backend Date Range Query:** Added `startDate` and `endDate` query handling to `GET /api/attendance` in `server/routes/attendance.js`.
6. ✅ **Teacher Portal Persistence Verified:** Verified `bulkSetAttendance()` in `TeacherPortal.tsx` correctly saves to MongoDB via `POST /api/attendance/bulk`.

---

### ✅ Feature 3: Fee Counter & Arrears — RESOLVED

**Gaps Addressed:**
1. ✅ **Custom Delete Confirmation Modal:** Replaced raw `window.confirm()` with a styled modal confirmation in `AdminFeesTab.tsx`.
2. ✅ **"Add Fee Demand" Modal:** Added "नवीन शुल्क मांग" button and modal allowing teachers/admins to create new fee demands per student with term presets.
3. ✅ **Academic Year Filter:** Added session dropdown filter ("सभी सत्र", "2026-27", "2025-26", "2024-25", etc.) in `AdminFeesTab.tsx`.
4. ✅ **`PUT /api/fees/:id` Implemented:** Added backend fee update route with school-scoping, audit logging, and `updateFeeRecord()` in `SchoolContext`.
5. ✅ **Arrears Rollover UI:** Added "बकाया रोलओवर (Rollover)" button and modal in `AdminFeesTab.tsx` wired to `POST /api/fees/rollover-arrears`.
6. ✅ **Student Fee History Ledger:** Added a "शुल्क इतिहास (Fee History)" view showing multi-term records, lifetime billed vs paid, and quick receipt prints.
7. ✅ **Removed Residual Paywalls:** Removed `requirePro()` gates and lock icons from Fee CSV export and WhatsApp fee reminder alerts.

---

### ✅ Feature 4: Examinations & Evaluation — RESOLVED

**Gaps Addressed:**
1. ✅ **Toast & Custom Confirmations:** Replaced all 4 raw `alert()` calls and browser `confirm()` in `ExamManagementModal.tsx` with `showError()`, `showSuccess()` from `useToast`, and a styled delete confirmation dialog.
2. ✅ **Removed Hard Paywall on Report Cards:** Removed the blocking paywall in `AdminReportsTab.tsx`, allowing free plan schools full access to view, filter, and print report cards, with an optional non-intrusive Pro badge for 360° NEP evaluation.
3. ✅ **In-line Exam Edit UI:** Added "संपादन" action on exam schedule cards pre-filling the form and updating via `PUT /api/exams/:id` (`api.updateExam`).
4. ✅ **Exam Lock/Unlock Toggle:** Added lock/unlock toggle button calling `PATCH /api/exams/:id/lock` (`api.toggleExamLock`) with status badges (`🔒 स्थिर/लॉक` vs `🔓 खुला`) and read-only enforcement preventing marks tampering when locked.
5. ✅ **Dynamic Academic Year:** Replaced hardcoded `'2025-26'` on exam creation with dynamic session defaults from `currentSchool.currentAcademicYear` and an academic year selector.
6. ✅ **Backend Auth Scoping on `GET /api/exams`:** Secured `GET /api/exams` with `requirePortalAuth` and `requireSchoolScope` to enforce tenant isolation across admin, teacher, and student portals.
7. ✅ **Marks Pre-population on Re-entry:** Pre-populates students' existing marks from `reportCards` in the marks entry matrix when an exam, class, and subject are chosen.
8. ✅ **Custom Delete Confirmation in Report Cards:** Replaced two instances of `window.confirm()` in `AdminReportsTab.tsx` with a styled confirmation modal (`reportToDelete`).
9. ✅ **Direct WhatsApp Sharing:** Unwrapped report card WhatsApp link generation from `requirePro()` paywalls so all schools can send marks summaries to parents.

---

### ✅ Feature 5: Staff & Payroll — RESOLVED

**Gaps Addressed:**
1. ✅ **Custom Delete Confirmation Modal:** Replaced raw `window.confirm()` in `AdminStaffTab.tsx` with a styled confirmation modal dialog (`staffToDelete`).
2. ✅ **Staff Status Filter in UI:** Added status filter dropdown ("सभी स्थितियां", "सक्रिय", "अवकाश पर", "कार्यमुक्त") allowing filtering of staff roster by `Active`, `OnLeave`, and `Resigned`.
3. ✅ **Staff Status Management UI:** Added `stfStatus` selector in add/edit staff form and wired through `api.createStaff` / `api.updateStaff` with active status badge pills in the roster table.
4. ✅ **Dynamic Salary Slip Months:** Replaced static `'सितम्बर 2026'` with dynamic calculation of current calendar month and past 11 months in Hindi.
5. ✅ **Salary History Ledger:** Added a dedicated "वेतन इतिहास (History)" tab view in `StaffSalarySlipModal.tsx` connected to `api.getSalarySlips()`, displaying past disbursements, net pay, and one-click slip preview/re-print.
6. ✅ **Payment Mode Selector:** Added payment mode dropdown ("Bank Transfer (NEFT/RTGS)", "Cash (नकद)", "UPI", "Cheque (चेक)") in both UI controls and printable slip template, persisted on slip generation.
7. ✅ **Leave Management Integration:** Synchronized staff status in `server/routes/operations.js` on leave approvals/rejections (`PATCH /leaves/:id/status` automatically sets `OnLeave` when approved and restores `Active` when rejected).
8. ✅ **Bulk Payroll CSV Export:** Added `exportPayrollToCSV()` in `src/utils/csvExport.ts` and added a "मासिक पेरोल CSV" export button in `AdminStaffTab.tsx` exporting complete salary breakdowns.
9. ✅ **Backend Multi-Tenancy Scoping:** Enforced `schoolId` requirement on `GET /api/staff/public` with validation returning HTTP 400 when missing, closing cross-school data leaks.

### ✅ Feature 6: Online Admissions — RESOLVED

**Gaps Addressed:**
1. ✅ **Dynamic Academic Year Header:** Header now dynamically renders `{currentSchool.currentAcademicYear || '2026-27'}` instead of a static string.
2. ✅ **Rejection Status & Audit Trail:** Added `'Rejected'` to `status` enum in `server/models/Admission.js`, implemented `PUT /api/admissions/:id/reject` with optional reason and audit logging, and added rejection modal and actions in UI.
3. ✅ **Approval Configuration Modal:** Added an approval dialog in `AdminAdmissionsTab.tsx` allowing admin to configure class, section (A/B/C/D), blood group, and custom roll number before enrollment.
4. ✅ **Class-Aware Roll Number Generation:** Refactored `PUT /api/admissions/:id/approve` in `server/routes/admissions.js` to calculate the next sequential roll number strictly within the applicant's target class (`maxRoll + 1`, starting at 101), eliminating duplicate roll numbers across classes.
5. ✅ **Printable Admission Acknowledgement Slip:** Added a dedicated "पावती (Slip)" modal in `AdminAdmissionsTab.tsx` rendering a complete printable receipt with school header, watermark, applicant info, DPDP consent verification, document submission checklist, and signatures.
6. ✅ **Admissions CSV Export:** Added `exportAdmissionsToCSV()` in `src/utils/csvExport.ts` and added an "आवेदन सूची CSV" export button in the tab toolbar.
7. ✅ **Custom Delete Confirmation Modal:** Replaced direct deletion and removed native `window.confirm()` with a custom styled confirmation modal (`admissionToDelete`).
8. ✅ **Public Rate Limiting:** Protected `POST /api/admissions` with dedicated IP rate limiting (15 requests per 15 minutes) to block automated spam floods.
9. ✅ **School Whitelist Validation:** Enforced `School.exists({ id: data.schoolId })` on public admission submissions, returning HTTP 400 on invalid or non-existent school IDs.

### ✅ Feature 7: Daily Homework & Notice Board — REVIEWED
### ✅ Feature 7: Daily Homework & Notice Board — RESOLVED

**Gaps:**
1. **`window.confirm()` on homework delete (line 105 in `AdminHomeworkTab.tsx`)** — raw browser confirm; needs toast replacement.
2. **No notice edit UI** — Notices can only be created/deleted; no Edit button and no `PUT /api/notices/:id` route exists.
3. **No notice delete confirmation** — `deleteNotice(notice.id)` fires immediately on click (line 273 in `AdminNoticesTab.tsx`).
4. **Homework has no status/completion tracking** — `status: 'Active'` set on creation but no UI to archive/complete; no filter for past-due items.
5. **No homework WhatsApp share** — Notice board has per-notice WhatsApp button; Homework tab has no equivalent broadcast button.
6. **`GET /api/notices` no school-scope enforcement** — If `schoolId` query param is omitted, ALL schools' notices are returned (line 10 in `notices.js`).
7. **No notice expiry date** — Old notices stay permanently; no validity/expiry field or auto-archiving mechanism.
**Gaps Fixed:**
1. **`window.confirm()` on homework delete** → replaced with custom delete confirmation modal (`homeworkToDelete` state) in `AdminHomeworkTab.tsx`.
2. **No notice edit UI** → added Edit button per notice card + full edit modal (`editingNotice` state) calling `updateNotice()` in `AdminNoticesTab.tsx`; added `PUT /:id` route in `server/routes/notices.js`; added `updateNotice()` in `api.ts` + `SchoolContext.tsx`.
3. **No notice delete confirmation** → replaced direct `deleteNotice()` call with `setNoticeToDelete(notice)` → custom confirmation modal in `AdminNoticesTab.tsx`.
4. **Homework status/completion tracking** → added status pill (सक्रिय/पूर्ण/अवधि पार), toggle button calling `api.updateHomework()`, and `statusFilter` dropdown (All/Active/Completed/Overdue) with overdue logic in `AdminHomeworkTab.tsx`.
5. **No homework WhatsApp share** → added WhatsApp broadcast button per homework card in `AdminHomeworkTab.tsx`.
6. **`GET /api/notices` no school-scope enforcement** → enforced school scoping with `req.query.schoolId || req.userSchoolId` + `activeOnly` query filter in `server/routes/notices.js`.
7. **No notice expiry date** → added `expiresAt: { type: String }` to `Notice` model; added `expiresAt` field in create/edit form; added Active/Expired filter in `AdminNoticesTab.tsx`; added expiry badge on notice cards; added `expiresAt?: string` to `Notice` type in `src/types/index.ts`.

### ✅ Feature 8: School Operations (Timetable, Library, Transport, Inventory) — REVIEWED

**Gaps:**
1. **`alert()` on timetable save error (line 102 in `TimetableManagerModal.tsx`)** — needs toast.
2. **Timetable section hardcoded to `'A'` (line 96)** — multi-section schools cannot save per-section timetables.
3. **No timetable print/export** — No print button or PDF/CSV export for the weekly schedule.
4. **`alert()` on book add (line 87), issue (line 123), and return (line 135) errors in `LibraryManagementModal.tsx`** — 3 raw `alert()` calls.
5. **`window.prompt()` on book return (line 128)** — fine amount entered via browser prompt; should be an inline input.
6. **No book edit UI** — Books can be added/deleted/issued but title, author, copies cannot be edited.
7. **No overdue books view** — No filter/highlight for issues where `dueDate < today` and status is still `Issued`.
8. **`alert()` on route create (line 85) and delete (line 95) errors in `TransportManagementModal.tsx`** — 2 raw `alert()` calls.
9. **`window.confirm()` on transport route delete (line 90)** — raw browser confirm.
10. **No route edit UI** — Routes can be created/deleted but not edited in-place.
11. **No student-route assignment** — No way to assign a student to a specific bus route/stop.
12. **`alert()` on inventory create (line 71), adjust (line 80), delete (line 90) errors in `InventoryManagementModal.tsx`** — 3 raw `alert()` calls.
13. **`window.confirm()` on inventory delete (line 85)** — raw browser confirm.
14. **No inventory item edit UI** — Unit price and details cannot be edited after creation.
15. **No inventory transaction history** — No log of stock-in/stock-out movements over time.

### ✅ Feature 9: Portals & Multi-Branch / Multi-Tenancy — RESOLVED

**Resolved Gaps:**
1. **`alert()` in `SchoolManagementModal.tsx` replaced** — All 6 raw `alert()` calls across archive export, discontinue confirmation, validation, and registration errors replaced with `useToast()` notifications (`showError`, `showSuccess`, `showWarning`).
2. **Non-developer admin visibility clarity** — Added prominent informational notice banner in `SchoolManagementModal.tsx` clarifying that school-level administrators are scoped to their designated branch (`currentSchool.hindiName`), and multi-branch management is reserved for organization developer mode.
3. **Teacher portal marks class-change desync** — Added `useEffect` hook in `TeacherPortal.tsx` syncing `marksState` and `absentStudents` directly with `reportCards` when `selectedClass`, `selectedExamId`, or `examSubject` changes, and calling `refreshFromDb()` after bulk marks submission.
4. **Teacher portal marks concurrency & locking** — Added lock status verification before `submitBulkMarks`; displays prominent lock notification banner, disables all score inputs and AB toggles, and blocks submission with error toast if `selectedExam?.isLocked`.
5. **Student portal login & session isolation** — Auth verified via `/auth/student-login` with robust sibling ambiguity resolution (`AMBIGUOUS_STUDENT_MATCH`), live self-data loading spinner (`isStudentDataLoading`), and clean session recovery.
6. **Teacher portal attendance CSV export** — Integrated `exportAttendanceToCSV` in `TeacherPortal.tsx` Attendance tab header with 1-click download for selected class and date.
7. **Plan gating in teacher portal** — Added "PRO" badge to Salary Slip tab button; displays interactive Pro AMC upgrade card when non-pro schools attempt to access staff salary slip features.
8. **Default admin passcode '1952' eliminated** — Removed hardcoded fallback `'1952'`; new branch registrations now generate a cryptographically safe random 6-digit PIN with a "पुनः जनरेट" button and clear security guidance.
9. **School discontinue hard reload removed** — Removed `window.location.reload()`; branch discontinuation now calls `await refreshFromDb()` to reactively refresh state and toast the user cleanly.
10. **Plan upgrade/downgrade UI in modal** — Added developer-only interactive tier toggle button on school cards allowing organization developers to switch branches between Free and Pro tiers with instant MongoDB persistence and UI feedback.


