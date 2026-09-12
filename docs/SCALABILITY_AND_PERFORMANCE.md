# Scalability, Performance & High-Load Architecture Report

**Platform**: Saraswati Shishu Mandir (SSM) School ERP  
**Engineered by**: [init65.co.in](https://www.init65.co.in)  
**Support**: `support@init65.co.in`  
**Live Application**: [https://ssm.init65.co.in](https://ssm.init65.co.in)  
**Backend API**: [https://ssm-3g20.onrender.com](https://ssm-3g20.onrender.com)  

---

## 📊 Executive Summary

This document details the architectural benchmarks, optimization strategies, and high-load stress testing performed on the SSM School ERP system. The platform is engineered to support multi-tenant Vidyalaya institutions with high concurrency, fast cold-starts on mobile devices, and strict data isolation across branches.

```
+-------------------------------------------------------------------------+
|                        OPTIMIZATION BENCHMARKS                          |
+--------------------------+-----------------------+----------------------+
| Metric                   | Before Optimization   | After Optimization   |
+--------------------------+-----------------------+----------------------+
| Initial JS Bundle        | 584.42 kB (108.4 kB)  | 206.91 kB (44.66 kB) |
| Bundle Size Reduction    | Baseline              | -64.6% reduction     |
| Vite Build Speed         | ~450 ms               | 246 ms               |
| Automated Test Suite     | 20 tests in 1.95s     | 28 tests in 2.02s    |
| Frontend Cold TTFB       | ~1,200 ms             | 713 ms               |
| Backend Status API       | ~1,100 ms             | 890 ms (Render+Atlas)|
+--------------------------+-----------------------+----------------------+
```

---

## ⚡ 1. Frontend Performance & Code-Splitting

### Route-Level Code Splitting (`src/App.tsx`)
Previously, administrative workspaces (`AdminDashboard`, `TeacherPortal`, `StudentPortal`) and their associated modal sheets were imported statically at the root level. Consequently, every public visitor had to download the entire ERP payload on first visit.

**Implementation**:
```tsx
const AdminDashboard = React.lazy(() => 
  import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const TeacherPortal = React.lazy(() => 
  import('./components/teacher/TeacherPortal').then(m => ({ default: m.TeacherPortal }))
);
const StudentPortal = React.lazy(() => 
  import('./components/student/StudentPortal').then(m => ({ default: m.StudentPortal }))
);
```

**Results**:
- **Public Homepage Transfer**: Down to **206.91 kB** (44.66 kB gzipped).
- **On-Demand Loading**: `AdminDashboard` (238 kB), `TeacherPortal` (31 kB), and `StudentPortal` (26 kB) load asynchronously with graceful spinner fallbacks only when authorized users navigate to them.

### Zero Re-computation Rendering (`AdminDashboard.tsx`)
To ensure smooth responsiveness on budget mobile phones and tablets:
- **Memoized Aggregations**: Gender breakdown tallies (`totalBhaiya`, `totalBahin`), attendance rates, and fee collections are computed in single-pass `useMemo` loops.
- **Search Filtering**: Full-text searching across students runs through a memoized filter, preventing unnecessary re-executions when users interact with unrelated dashboard widgets.

### Strict Mobile Layout Protection (`src/index.css`)
To prevent horizontal page scrolling and empty margin voids:
```css
html, body {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  position: relative;
  box-sizing: border-box;
}

#root {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  min-height: 100vh;
}
```

---

## 🚀 2. Backend Scalability & Query Architecture

### Compound Database Indexing (`server/models/`)
All frequently filtered collections feature compound indexes to ensure $O(\log n)$ B-tree index seeks (`IXSCAN`) instead of collection scans (`COLLSCAN`):
- **Student Collection**:
  - `{ schoolId: 1, class: 1, section: 1 }`
  - `{ schoolId: 1, rollNo: 1 }`
- **Attendance Collection**:
  - `{ studentId: 1, date: 1 }` (unique constraint)
  - `{ schoolId: 1, date: 1 }`
  - `{ schoolId: 1, studentId: 1, date: 1 }`
- **Fee Collection**:
  - `{ schoolId: 1, createdAt: -1 }`
  - `{ schoolId: 1, studentId: 1 }`
  - `{ schoolId: 1, status: 1 }`

### Elimination of Hydration Overhead (`.lean()`)
All read operations employ `.lean()`, returning plain JavaScript objects rather than heavy Mongoose document wrappers. This reduces heap allocations by ~4x during high query volumes.

### Safe Bounded Execution (`executeSafeQuery`)
- Every collection query enforces a maximum limit ceiling (default: 250 records, hard cap: 500 records) to avoid Node.js buffer exhaustion.
- Opt-in pagination (`?paginated=true&page=1&limit=50`) automatically injects standard pagination response headers: `X-Total-Count`, `X-Page`, `X-Per-Page`, `X-Total-Pages`.

### Rate Limiting & DoS Protection
Sliding-window IP rate limiters protect authentication endpoints against brute force attacks and request floods:
- `/api/auth/login`: 10 attempts / 15 minutes
- `/api/auth/teacher-login`: 8 attempts / 15 minutes
- `/api/auth/student-login`: 8 attempts / 15 minutes
- `/api/admissions`: 20 submissions / 15 minutes

---

## 🧪 3. Automated Scalability Test Results

The dedicated scalability suite in [`src/__tests__/scalability.test.ts`](file:///c:/Users/LENOVO/Desktop/init/ssm/src/__tests__/scalability.test.ts) validates real-world high-load scenarios:

| # | Stress Test Scenario | Workload | Latency | Result |
|---|----------------------|----------|---------|--------|
| 1 | **Bulk Student Ingestion** | Batch insert of 200 student records in a single payload | **31 ms** | `HTTP 201 Created` |
| 2 | **High Concurrency Reads** | 50 simultaneous parallel HTTP requests across branches | **277 ms** | 100% Success (50/50 `HTTP 200`) |
| 3 | **Multi-Tenant Isolation** | Concurrent queries to Branch 1 (200 records) vs Branch 2 (0 records) | **22 ms** | Zero data leak (Branch 2 strictly returned 0 records) |
| 4 | **Bulk Attendance Processing** | Batch updating 100 student attendance records concurrently | **22 ms** | 100 records committed & indexed |
| 5 | **Memory-Bounded Pagination** | Chunked pagination on 200 records (`limit=25`, page 1 & 8) | **9 ms** | Accurate chunking & headers verified |
| 6 | **Cross-Branch Aggregation** | Developer query spanning 5 branches concurrently | **48 ms** | All 5 branch datasets aggregated |

---

## 🛠️ How to Execute Performance Benchmarks

### 1. Run Automated Scalability & Integration Tests
```bash
npm test
```
*Executes all 28 unit, integration, and scalability tests with coverage.*

### 2. Run Production Build Benchmark
```bash
npm run build
```
*Compiles and computes gzip chunks across all split assets.*

### 3. Run Static Code Quality & Linter Audit
```bash
npx oxlint
```
*Analyzes 85+ source files in < 100ms.*
