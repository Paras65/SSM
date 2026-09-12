# SSM School Management App

This project is a school management application with a public landing page, admin dashboard, and student portal. The frontend is built with Vite + React + TypeScript, and the backend is an Express API connected to MongoDB.

## 🌟 Developer Vision & Creator: init65.co.in

> *"As a full-stack developer at init65.co.in, I built this school management ERP to solve the real, everyday challenges faced by Saraswati Shishu Mandir (SSM) schools, Acharyas (teachers), and students. By replacing tedious manual paperwork with intuitive digital tools, eliminating expensive SMS charges with zero-cost WhatsApp alerts, and honoring the timeless values of Vidya Bharati and Panchmukhi Shiksha, this platform empowers schools to become truly paperless, transparent, and digitally empowered."*

- **Website / Portfolio**: [init65.co.in](https://www.init65.co.in)

## Stack

- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS
- Backend: Express + MongoDB + Mongoose
- PWA support: service worker and offline app shell

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the backend:
   ```bash
   npm run server
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. Open the app in the browser at:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Environment variables

Create a local .env file based on .env.example:

```env
VITE_API_BASE=http://localhost:5000/api
VITE_UPGRADE_CONTACT=support@init65.co.in
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ssm_school
JWT_SECRET=change_this_to_a_secure_secret
DEVELOPER_ADMIN_PASSCODE=change_this_to_a_private_developer_passcode
CORS_ORIGIN=https://ssm.init65.co.in,http://localhost:5173
```

The developer-admin passcode is used by the `डेवलपर: सभी शाखाएं प्रबंधित करें` option in the admin login. It creates a developer session that can switch between and manage all school branches from the dashboard. Keep this value private and configure it in the backend environment only.

`VITE_UPGRADE_CONTACT` is the support email address (`support@init65.co.in`) shown when a branch requests a Pro upgrade.

## 🚀 Performance & Scalability Architecture

Comprehensive scalability testing, benchmarks, and architectural safeguards are documented in [docs/SCALABILITY_AND_PERFORMANCE.md](docs/SCALABILITY_AND_PERFORMANCE.md).

- **Bundle Optimization**: Initial JavaScript bundle reduced by **64.6%** (from 584 kB to 206 kB) via route-level code splitting (`React.lazy`).
- **High Concurrency**: Tested to support 50 simultaneous parallel read requests with 100% success rate in under 280ms.
- **Bulk Ingestion**: Supports batch inserting 200 student records in ~31ms.
- **Automated Test Suite**: 28 automated unit, integration, security, and scalability tests running in ~2s (`npm test`).
- **Multi-Device E2E Testing**: 24 automated Playwright browser tests across Desktop Chrome, Pixel 7, and iPhone 14 viewports (`npm run test:e2e`).

## Deploy to Vercel + Render

### Frontend on Vercel

1. Import the project into Vercel.
2. Set the framework to Vite.
3. Add the environment variable:
   ```env
   VITE_API_BASE=https://your-render-app.onrender.com/api
   ```
4. Deploy the project.

### Backend on Render

1. Create a new Web Service on Render.
2. Connect the repository or deploy the backend folder as the service root.
3. Set the runtime command:
   ```bash
   node server/index.js
   ```
4. Add environment variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ssm_school
   JWT_SECRET=your_secure_secret
   DEVELOPER_ADMIN_PASSCODE=your_private_developer_passcode
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```
5. Deploy the service.

## Notes

- The frontend should point to the deployed Render API URL in production.
- Local development keeps the frontend proxied to the local backend.
- This project currently uses localStorage as a fallback for offline/demo behavior, but a production deployment should rely on the MongoDB-backed API as the source of truth.
