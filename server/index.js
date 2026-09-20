require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRoutes = require('./routes/api');
const { sanitizeNoSql } = require('./middleware/sanitize');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ssm_school';
// Default trusted origins for production (init65.co.in domains) and development
const DEFAULT_TRUSTED_ORIGINS = [
  'https://ssm.init65.co.in',
  'https://www.init65.co.in',
  'https://init65.co.in',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

const customOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOriginsList = Array.from(new Set([...DEFAULT_TRUSTED_ORIGINS, ...customOrigins]));

function isOriginAllowed(origin) {
  if (!origin) return true; // allow non-browser requests (curl, server-to-server, mobile app webviews)

  if (process.env.CORS_ORIGIN === '*' || customOrigins.includes('*')) {
    return true;
  }

  if (allowedOriginsList.includes(origin)) {
    return true;
  }

  // Allow all init65.co.in subdomains (e.g., https://ssm.init65.co.in, https://*.init65.co.in)
  if (/^https?:\/\/([a-z0-9-]+\.)*init65\.co\.in(:\d+)?$/i.test(origin)) {
    return true;
  }

  // Allow Render internal and preview URLs (*.onrender.com)
  if (/^https?:\/\/([a-z0-9-]+\.)*onrender\.com(:\d+)?$/i.test(origin)) {
    return true;
  }

  // Allow localhost on any port for local development
  if (/^https?:\/\/localhost(:\d+)?$/i.test(origin)) {
    return true;
  }

  return false;
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

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Return callback(null, false) instead of throwing an unhandled Error
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeNoSql);

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

// Rate limiting using express-rate-limit (survives restarts, production-safe)
const rateLimit = require('express-rate-limit');

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function rateLimitEndpoint(maxAttempts = 10, useCompositeKey = false) {
  return rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: maxAttempts,
    standardHeaders: true,
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
    keyGenerator: (req) => {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      if (!useCompositeKey) return ip;
      const target = req.body?.rollNo || req.body?.phone || req.body?.schoolId || '';
      return `${ip}_${target}`;
    },
    message: {
      error: 'सुरक्षा चेतावनी: बहुत अधिक प्रयास! कृपया 15 मिनट पश्चात पुनः प्रयास करें। (Too many attempts, rate limit exceeded)',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    skip: (req) => process.env.NODE_ENV === 'test'
  });
}

app.use('/api/auth/login', rateLimitEndpoint(30, false));
app.use('/api/auth/sankul-login', rateLimitEndpoint(30, false));
app.use('/api/auth/student-login', rateLimitEndpoint(120, true));
app.use('/api/auth/teacher-login', rateLimitEndpoint(120, true));
app.use('/api/auth/parent-login', rateLimitEndpoint(120, true));
app.use('/api/admissions', rateLimitEndpoint(60, false));
app.post('/api/schools', rateLimitEndpoint(20, false));

// API Routes
app.use('/api', apiRoutes);

// JSON 404 Handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: `अमान्य API पाथ: ${req.method} ${req.originalUrl} नहीं मिला। (API endpoint not found)`,
    code: 'NOT_FOUND'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'सरस्वती शिशु मंदिर (SSM) API Server',
    database: mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Connecting...',
    docs: '/api/status'
  });
});

// Centralized Global Error Handler
app.use((err, req, res, next) => {
  // Check for body-parser / express.json SyntaxError
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'अमान्य JSON डेटा प्रारूप! (Malformed JSON payload)',
      code: 'INVALID_JSON_SYNTAX'
    });
  }

  console.error('💥 Unhandled Server Error:', err);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProduction 
      ? 'सर्वर पर अप्रत्याशित समस्या उत्पन्न हुई। कृपया पुनः प्रयास करें।' 
      : (err.message || 'Internal Server Error'),
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(isProduction ? {} : { stack: err.stack })
  });
});

// Database connection lifecycle logging
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Attempting reconnect...');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Connect to MongoDB
async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: process.env.MONGO_MAX_POOL_SIZE ? parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) : 30, // Supports multi-branch concurrent traffic
      minPoolSize: 2
    });
    console.log('✅ Connected successfully to MongoDB!');

    // Verify initial schools & migrate seed data strictly to Demo Sandbox
    try {
      const seedDatabase = require('./seed');
      await seedDatabase();
    } catch (seedErr) {
      console.warn('⚠️ Seeding / migration warning:', seedErr.message);
    }

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

