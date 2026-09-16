const jwt = require('jsonwebtoken');
const { isValidAdminPasscode, isValidDeveloperPasscode } = require('../utils/authValidation');
const School = require('../models/School');

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-ssm-jwt-secret';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production');
}

async function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'अनधिकृत प्रवेश! कृपया व्यवस्थापक पासकोड से पुनः लॉगिन करें। (Unauthorized: Bearer token required)',
      code: 'AUTH_REQUIRED'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!['admin', 'developer'].includes(decoded.role)) {
      return res.status(403).json({ error: 'केवल व्यवस्थापक प्रवेश की अनुमति है। (Admin role required)', code: 'ADMIN_ROLE_REQUIRED' });
    }

    // Check token version to invalidate revoked sessions when admin passcode changes
    if (decoded.role === 'admin' && decoded.schoolId && decoded.tokenVersion) {
      try {
        const school = await School.findOne({ id: decoded.schoolId }).select('tokenVersion').lean();
        if (school && school.tokenVersion && decoded.tokenVersion < school.tokenVersion) {
          return res.status(401).json({
            error: 'पासकोड परिवर्तित हो चुका है! कृपया नए पासकोड से पुनः लॉगिन करें। (Passcode changed, session revoked)',
            code: 'SESSION_REVOKED'
          });
        }
      } catch (dbErr) {
        // Non-blocking if DB query fails during disconnection
      }
    }

    req.user = decoded;
    req.userSchoolId = decoded.schoolId;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      error: isExpired
        ? 'सत्र समाप्त हो गया है! कृपया पुनः लॉगिन करें। (Session expired, please re-authenticate)'
        : 'अमान्य सुरक्षा टोकन! (Invalid authentication token)',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    });
  }
}

function requireStudentAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'छात्र लॉगिन आवश्यक है। (Student login required)', code: 'AUTH_REQUIRED' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'student') {
      return res.status(403).json({ error: 'केवल छात्र पोर्टल प्रवेश की अनुमति है।', code: 'STUDENT_ROLE_REQUIRED' });
    }
    req.user = decoded;
    req.userSchoolId = decoded.schoolId;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      error: isExpired
        ? 'छात्र सत्र समाप्त हो गया है! कृपया पुनः लॉगिन करें। (Session expired)'
        : 'अमान्य छात्र सत्र। (Invalid student session)',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    });
  }
}

async function requireTeacherAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'आचार्य लॉगिन आवश्यक है। (Teacher login required)', code: 'AUTH_REQUIRED' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (!['teacher', 'admin', 'developer'].includes(decoded.role)) {
      return res.status(403).json({ error: 'केवल आचार्य / शिक्षक प्रवेश की अनुमति है।', code: 'TEACHER_ROLE_REQUIRED' });
    }

    // Check token version to invalidate revoked sessions when admin passcode changes
    if (decoded.role === 'admin' && decoded.schoolId && decoded.tokenVersion) {
      try {
        const school = await School.findOne({ id: decoded.schoolId }).select('tokenVersion').lean();
        if (school && school.tokenVersion && decoded.tokenVersion < school.tokenVersion) {
          return res.status(401).json({
            error: 'पासकोड परिवर्तित हो चुका है! कृपया नए पासकोड से पुनः लॉगिन करें। (Passcode changed, session revoked)',
            code: 'SESSION_REVOKED'
          });
        }
      } catch (dbErr) {
        // Non-blocking if DB query fails during disconnection
      }
    }

    req.user = decoded;
    req.userSchoolId = decoded.schoolId;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      error: isExpired
        ? 'सत्र समाप्त हो गया है! कृपया पुनः लॉगिन करें। (Session expired, please re-authenticate)'
        : 'अमान्य शिक्षक सत्र। (Invalid teacher session)',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    });
  }
}

async function requirePortalAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'पोर्टल लॉगिन आवश्यक है। (Portal login required)', code: 'AUTH_REQUIRED' });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (!['admin', 'developer', 'student', 'teacher'].includes(decoded.role)) {
      return res.status(403).json({ error: 'अमान्य पोर्टल भूमिका। (Invalid portal role)', code: 'ROLE_FORBIDDEN' });
    }

    // Check token version to invalidate revoked sessions when admin passcode changes
    if (decoded.role === 'admin' && decoded.schoolId && decoded.tokenVersion) {
      try {
        const school = await School.findOne({ id: decoded.schoolId }).select('tokenVersion').lean();
        if (school && school.tokenVersion && decoded.tokenVersion < school.tokenVersion) {
          return res.status(401).json({
            error: 'पासकोड परिवर्तित हो चुका है! कृपया नए पासकोड से पुनः लॉगिन करें। (Passcode changed, session revoked)',
            code: 'SESSION_REVOKED'
          });
        }
      } catch (dbErr) {
        // Non-blocking if DB query fails during disconnection
      }
    }

    if (decoded.role === 'student') {
      if (!decoded.studentClass) {
        return res.status(401).json({ error: 'छात्र सत्र पुराना है, कृपया पुनः लॉगिन करें।', code: 'STUDENT_SESSION_REFRESH_REQUIRED' });
      }
      if (req.query.schoolId && req.query.schoolId !== decoded.schoolId) {
        return res.status(403).json({ error: 'छात्र केवल अपनी शाखा का डेटा देख सकता है।', code: 'SCHOOL_SCOPE_FORBIDDEN' });
      }
      if (req.query.class && req.query.class !== decoded.studentClass) {
        return res.status(403).json({ error: 'छात्र केवल अपनी कक्षा का गृहकार्य देख सकता है।', code: 'CLASS_SCOPE_FORBIDDEN' });
      }
      req.query.schoolId = decoded.schoolId;
      req.query.class = decoded.studentClass;
    }
    req.user = decoded;
    req.userSchoolId = decoded.schoolId;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      error: isExpired
        ? 'सत्र समाप्त हो गया है! कृपया पुनः लॉगिन करें। (Session expired, please re-authenticate)'
        : 'अमान्य पोर्टल सत्र। (Invalid portal session)',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    });
  }
}

function requireSchoolScope(req, res, next) {
  if (req.user?.role === 'developer') return next();

  if (!req.userSchoolId) {
    return res.status(403).json({
      error: 'व्यवस्थापक शाखा निर्धारित नहीं है। (Admin school scope missing)',
      code: 'SCHOOL_SCOPE_MISSING'
    });
  }

  const pathSchoolId = (req.originalUrl?.includes('/schools/') || req.path?.includes('/schools/'))
    ? req.params?.id
    : null;

  const requestedSchoolIds = [
    req.body?.schoolId,
    req.query?.schoolId,
    req.params?.schoolId,
    pathSchoolId,
    ...(Array.isArray(req.body?.updates) ? req.body.updates.map(update => update.schoolId) : [])
  ].filter(Boolean);

  if (requestedSchoolIds.some(schoolId => schoolId !== req.userSchoolId)) {
    return res.status(403).json({
      error: 'इस शाखा के डेटा तक पहुंच की अनुमति नहीं है। (School scope violation)',
      code: 'SCHOOL_SCOPE_FORBIDDEN'
    });
  }

  if (req.method === 'GET' && !req.query.schoolId) {
    req.query.schoolId = req.userSchoolId;
  }

  next();
}

/**
 * Generate signed JWT token
 */
function generateAdminToken(payload) {
  const tokenPayload = {
    ...(payload.tokenVersion !== undefined ? { tokenVersion: payload.tokenVersion } : {}),
    ...payload
  };
  return jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: '24h'
  });
}

module.exports = {
  requireAdminAuth,
  requireStudentAuth,
  requireTeacherAuth,
  requirePortalAuth,
  requireSchoolScope,
  generateAdminToken,
  JWT_SECRET,
  isValidAdminPasscode,
  isValidDeveloperPasscode
};

