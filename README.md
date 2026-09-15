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
