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
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN must be configured in production');
}

if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be configured in production');
}

// Performance & Network Compression
app.use(compression({
  threshold: 512 // Compress any response > 512 bytes
}));

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '1mb' }));

// HTTP Request & Performance Logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();
  const start = Date.now();
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
    const reset = '\x1b[0m';
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`[${timestamp}] ${color}${req.method.padEnd(6)} ${req.originalUrl} ${status}${reset} (${duration}ms - ${ip})`);
  });
  next();
});

// In-memory rate limiter for public/authentication endpoints
const endpointAttempts = new Map();
function rateLimitEndpoint(keyPrefix, maxAttempts = 10) {
  return (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes

  const userAttempts = endpointAttempts.get(key) || [];
  const recentAttempts = userAttempts.filter(t => now - t < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      error: 'सुरक्षा चेतावनी: बहुत अधिक प्रयास! कृपया 15 मिनट पश्चात पुनः प्रयास करें। (Too many attempts, rate limit exceeded)',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }

  recentAttempts.push(now);
  endpointAttempts.set(key, recentAttempts);
  next();
  };
}

app.use('/api/auth/login', rateLimitEndpoint('admin-login'));
app.use('/api/auth/student-login', rateLimitEndpoint('student-login', 8));
app.use('/api/auth/teacher-login', rateLimitEndpoint('teacher-login', 8));
app.use('/api/admissions', rateLimitEndpoint('admission-submit', 20));

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

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

