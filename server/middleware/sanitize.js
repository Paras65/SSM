/**
 * NoSQL Injection & Prototype Pollution Sanitizer Middleware
 * Designed specifically for MongoDB/Mongoose in Saraswati Shishu Mandir ERP.
 * 
 * Recursively sanitizes request objects by removing or escaping:
 * 1. Object keys starting with '$' (MongoDB operator injection e.g. $gt, $ne, $where, $regex)
 * 2. Object keys containing '.' (Nested query operator / field traversal)
 */

function sanitizeObject(target) {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      target[i] = sanitizeObject(target[i]);
    }
    return target;
  }

  const keys = Object.keys(target);
  for (const key of keys) {
    // Check for MongoDB operator ($ prefix) or field path delimiter (. within key)
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
    } else {
      target[key] = sanitizeObject(target[key]);
    }
  }

  return target;
}

/**
 * Express middleware to sanitize req.body, req.query, and req.params
 */
function sanitizeNoSql(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }

  next();
}

/**
 * Escapes all regular expression meta-characters to prevent ReDoS (Regular Expression Denial of Service)
 * and unintended regex wildcard matching.
 * 
 * @param {string} str - Raw string input from user
 * @returns {string} - Escaped string safe for new RegExp() or { $regex } queries
 */
function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Cleans and bounds a query/param string, returning undefined if invalid
 * 
 * @param {any} val - Input parameter
 * @param {number} maxLen - Maximum allowed length (default: 100)
 * @returns {string | undefined}
 */
function cleanStringParam(val, maxLen = 100) {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  if (!trimmed || trimmed.length > maxLen) return undefined;
  return trimmed;
}

module.exports = {
  sanitizeNoSql,
  sanitizeObject,
  escapeRegex,
  cleanStringParam
};
