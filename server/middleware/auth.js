const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ssm_vidyabharati_secure_jwt_secret_key_2026';

/**
 * Middleware to require valid JWT token for administrative actions
 */
function requireAdminAuth(req, res, next) {
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
    req.user = decoded;
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

/**
 * Generate signed JWT token
 */
function generateAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h'
  });
}

module.exports = {
  requireAdminAuth,
  generateAdminToken,
  JWT_SECRET
};

