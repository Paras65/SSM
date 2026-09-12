# SSM School Management App

This project is a school management application with a public landing page, admin dashboard, and student portal. The frontend is built with Vite + React + TypeScript, and the backend is an Express API connected to MongoDB.

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
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ssm_school
JWT_SECRET=change_this_to_a_secure_secret
```

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
   ```
5. Deploy the service.

## Notes

- The frontend should point to the deployed Render API URL in production.
- Local development keeps the frontend proxied to the local backend.
- This project currently uses localStorage as a fallback for offline/demo behavior, but a production deployment should rely on the MongoDB-backed API as the source of truth.
