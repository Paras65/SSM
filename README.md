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
- Secure login with branch selector
- Daily attendance marking (30s bulk mark) with CSV export
- Exam marks entry with lock concurrency protection
- Homework assignment and diary management
- Timetable view and staff salary slip access (Pro)

### Student / Parent Portal
- Passwordless login (Roll No + Contact) with sibling disambiguation
- Multi-branch selection dropdown for multi-school environments
- Optional 4-digit PIN and DOB security verification
- Official UDISE+ PEN and APAAR ID badges
- Real-time attendance ledger, homework diary, fee ledger & receipts
- 360° NEP 2020 progress report, admit card, TC, Bonafide & Character certificates

### Public Landing Page
- School information, Vedic heritage, daily panchang, and photo gallery
- Online admission enquiry form (2026-27) with transfer PEN support
- Central Registry & branch-filtered online TC verification with dynamic official seal
- Multi-branch school locator and 1-click live demo

---

## 🗄️ Database Models

18 Mongoose models: `Student`, `Staff`, `School`, `Exam`, `Fee`, `Attendance`, `ReportCard`, `Timetable`, `Book`, `BookIssue`, `InventoryItem`, `Transport`, `Leave`, `Notice`, `Homework`, `Admission`, `SalarySlip`, `AuditLog`

---

## 🚀 Performance & Scalability

- **Bundle size:** 206 KB initial JS (64.6% reduction via `React.lazy` route-level code splitting)
- **Concurrency:** 50 simultaneous parallel reads → 100% success rate in < 280ms
- **Bulk ingestion:** 200 student records batch insert in ~31ms
- **Rate limiting:** Automated rate limiting across all portal authentication and public inquiry channels
- **Security:** Strict input sanitization, secure token authentication, secure HTTP headers, and tenant data isolation

Full details: [docs/SCALABILITY_AND_PERFORMANCE.md](docs/SCALABILITY_AND_PERFORMANCE.md)

---

## 🧪 Testing

```bash
# Unit & integration tests (213+ tests across 17 test suites)
npm test

# E2E browser tests (Playwright — Desktop, Pixel 7, iPhone 14)
npm run test:e2e
```

**Test coverage:**
- 213+ unit/integration tests across 17 test suites (100% pass rate)
- 24 E2E Playwright tests (Desktop Chrome, Pixel 7, iPhone 14)
- Includes: UDISE+ SDMS compliance, active record cascades & orphan cleanup, security hardening, NoSQL injection, DPDP Act 2023 compliance, multi-tenant isolation, scalability, negative testing, audit logging

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

## 🔐 Configuration

Copy `.env.example` to `.env` and set your local environment values (database connection string, port, and security tokens).

> **Security Note**: Never commit actual database credentials, tokens, or security keys to version control. Always configure production secrets via secure hosting environment dashboards.

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

## 🚀 Production Hardened Feature Modules

> A comprehensive overview of core enterprise modules powering the Saraswati Shishu Mandir ERP.

### 📋 1. Student Management & Onboarding
- **In-line Student Management**: Complete student lifecycle management with profile editing, contact records, and class assignments.
- **Unrestricted Reporting**: Full access to student directory data, ID cards, Transfer Certificates, and progress reports.
- **Responsive Feedback**: Non-intrusive notification banners and confirmations replacing intrusive browser popups.

### 📅 2. Attendance Management
- **Flexible Views**: Toggle between daily roll-call marking and aggregated monthly or custom date-range attendance summaries.
- **Absentee Tracking & Communication**: Filter absentees with low attendance (<75%) flags, export absent student lists, and trigger instant parent alerts.
- **Seamless Portals**: Quick-mark attendance for teachers with multi-class scoping and offline resilience.

### 💰 3. Fee Counter & Financial Records
- **Demand Generation**: Create and issue student fee demands with customizable terms and academic session presets.
- **Session Filtering & Ledger**: Comprehensive lifetime student ledger with historical billing vs payment tracking and instant receipt printing.
- **Automated Arrears Rollover**: Seamless year-end rollover of outstanding balances with idempotent duplication safeguards.
- **Safe Confirmations**: Styled in-app confirmation modals for financial record modifications.

### 📝 4. Examinations & Evaluation
- **Exam Lifecycle**: Dynamic scheduling with session defaults, flexible subject configuration, and marks entry matrices.
- **Lock & Freezing**: Result freezing to prevent tampering after official declaration.
- **NEP 2020 Holistic Progress Reports**: 360-degree student evaluation including scholastic and co-scholastic domains.
- **Direct Sharing**: Automated progress report summaries shareable directly with parents.

### 💼 5. Staff & Payroll
- **Roster & Status Tracking**: Complete staff directory supporting active, on-leave, and resigned personnel tracking.
- **Automated Salary Slips**: Dynamic monthly salary slip calculation with historical disbursement ledgers and payment mode recording.
- **Leave Synchronization**: Integrated staff leave approvals with automatic duty status synchronization.
- **Bulk Payroll Export**: Comprehensive salary report downloads for institutional accounting.

### 🏫 6. Online Admissions
- **Public Inquiry Portal**: Streamlined application intake with dynamic academic session selection and guardian consent.
- **Application Processing**: Review, approve, or reject admission applications with class-aware sequential roll number assignment.
- **Formal Acknowledgement**: Printable admission acknowledgement slips with institutional branding and checklist verification.
- **Abuse Prevention**: Automated submission rate limiting and branch verification to block automated spam.

### 📢 7. Daily Homework & Notice Board
- **Homework Diary**: Class-specific assignment broadcasting, status tracking, and parent communication.
- **Institutional Notices**: Expiry-aware announcement board with active status filters and multi-branch isolation.
- **Protected Actions**: Dedicated confirmation dialogs to prevent accidental deletion of critical announcements.

### 🕒 8. School Operations (Timetable, Library, Transport, Inventory)
- **Multi-Section Timetables**: Weekly class schedule creator supporting multiple sections per grade with clean print layouts.
- **Library Circulation**: Catalog management, book issue/return tracking, and overdue fine calculations.
- **Fleet & Transport**: Route configuration, vehicle tracking, stop definitions, and student route assignments.
- **Inventory Ledger**: Asset inventory tracking with minimum stock alerts and transparent movement transaction history.

### 🏛️ 9. Multi-Branch Architecture & Portals
- **Isolated Multi-Tenancy**: Complete data partitioning across independent branches and campuses.
- **Dedicated Portals**: Tailored interfaces for administrators, acharyas (teachers), and students/parents.
- **Robust Authentication**: Dynamic branch selection, multi-factor credential verification, and random security keys for newly registered branches.
- **Real-Time Synchronization**: Instant state synchronization across teacher marks submission and student portals.

### 🔒 10. Data Integrity & Consistency
- **Cascading Updates**: Automatic propagation of student profile updates across active attendance and leave records.
- **Relational Integrity**: Complete cleanup of dependent historical records upon verified student removal.
- **Multi-Credential Verification**: Enhanced security with optional parent PINs and date-of-birth verification.

### 🇮🇳 11. Government UDISE+ & NEP 2020 Compliance
- **UDISE+ SDMS 21-Column Export**: Standardized UTF-8 CSV exports fully formatted for the national `udiseplus.gov.in` portal.
- **Permanent Education Number (PEN) & APAAR ID**: Integration with the Ministry of Education's 12-digit One Nation One Student ID registry across admissions, profiles, and reports.
- **Institutional Verification**: 11-digit school UDISE code validation and centralized Transfer Certificate (TC) verification with authentic digital seals.



