require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('./routes/api');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssm_school';

// Performance & Network Compression
app.use(compression({
  threshold: 512 // Compress any response > 512 bytes
}));

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// In-memory rate limiter for auth
const loginAttempts = new Map();
app.use('/api/auth/login', (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 10;

  const userAttempts = loginAttempts.get(ip) || [];
  const recentAttempts = userAttempts.filter(t => now - t < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      error: 'सुरक्षा चेतावनी: बहुत अधिक प्रयास! कृपया 15 मिनट पश्चात पुनः प्रयास करें। (Too many attempts, rate limit exceeded)',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  recentAttempts.push(now);
  loginAttempts.set(ip, recentAttempts);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'सरस्वती शिशु मंदिर (SSM) API Server',
    database: mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Connecting...',
    docs: '/api/status'
  });
});

// Connect to MongoDB
async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('✅ Connected successfully to MongoDB!');
    console.log(`📡 Database Host: ${mongoose.connection.host}`);

    // Seed database if needed
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Saraswati Shishu Mandir Backend running at: http://localhost:${PORT}`);
      console.log(`📋 API Status endpoint: http://localhost:${PORT}/api/status`);
    });
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Starting API server with offline fallback...');
    app.listen(PORT, () => {
      console.log(`🚀 Backend running at: http://localhost:${PORT} (Database offline, retrying...)`);
    });
  }
}

startServer();

