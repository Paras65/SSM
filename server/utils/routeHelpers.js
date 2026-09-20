const AuditLog = require('../models/AuditLog');
const School = require('../models/School');

// In-memory cache for school audit logging feature status to avoid repeated DB queries (1-minute TTL)
const schoolAuditLoggingCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

function invalidateSchoolAuditLoggingCache(schoolId) {
  if (!schoolId) return;
  schoolAuditLoggingCache.delete(schoolId);
}

async function isAuditLoggingEnabled(targetSchoolId) {
  if (!targetSchoolId) return false;
  const now = Date.now();
  const cached = schoolAuditLoggingCache.get(targetSchoolId);
  if (cached && cached.expiresAt > now) {
    return cached.enabled;
  }

  try {
    const school = await School.findOne({ id: targetSchoolId }).select('features.enableAuditLogging').lean();
    const enabled = Boolean(school?.features?.enableAuditLogging);
    schoolAuditLoggingCache.set(targetSchoolId, {
      enabled,
      expiresAt: now + CACHE_TTL_MS
    });
    return enabled;
  } catch {
    return false;
  }
}

function generateUniqueId(prefix = 'item') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

async function recordAuditLog({ schoolId, actorType, actorId, actorName, action, description, req }) {
  try {
    const targetSchoolId = schoolId || req?.user?.schoolId || 'ssm-gorakhpur';
    // Dynamic per-school audit logging toggle: skipped by default to optimize database storage
    const isEnabled = await isAuditLoggingEnabled(targetSchoolId);
    if (!isEnabled) {
      return; // Skip DB write when audit logging is disabled
    }

    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
    const log = new AuditLog({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      schoolId: targetSchoolId,
      actorType: actorType || req?.user?.role || 'admin',
      actorId: actorId || req?.user?.studentId || req?.user?.teacherId || '',
      actorName: actorName || req?.user?.schoolName || 'प्रशासक / आचार्य',
      action,
      description,
      ip
    });
    await log.save();
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Multi-tenant safe query executor:
 * 1. Backwards compatible: returns raw array by default, but bounded by safe limit (default 250, max 500)
 * 2. Opt-in pagination: returns { data, pagination: { page, limit, total, totalPages } } when ?paginated=true or ?page is passed
 * 3. Uses .lean() to eliminate Mongoose document hydration overhead
 * 4. Injects standard X-Total-Count, X-Page, X-Per-Page, X-Total-Pages headers
 */
async function executeSafeQuery(Model, filter, req, res, sort = { createdAt: -1 }, select = null) {
  const isPaginated = req.query.paginated === 'true' || req.query.page !== undefined;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || (isPaginated ? 50 : 250)), 500);
  const skip = (page - 1) * limit;

  let query = Model.find(filter).sort(sort).skip(skip).limit(limit);
  if (select) {
    query = query.select(select);
  }

  const [records, total] = await Promise.all([
    query.lean(),
    Model.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  res.setHeader('X-Total-Count', total.toString());
  res.setHeader('X-Page', page.toString());
  res.setHeader('X-Per-Page', limit.toString());
  res.setHeader('X-Total-Pages', totalPages.toString());

  if (isPaginated) {
    return res.json({
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  }

  return res.json(records);
}

module.exports = {
  generateUniqueId,
  recordAuditLog,
  executeSafeQuery,
  invalidateSchoolAuditLoggingCache,
  isAuditLoggingEnabled
};

