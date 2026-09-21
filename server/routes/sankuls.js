const express = require('express');
const router = express.Router();
const Sankul = require('../models/Sankul');
const { requireAdminAuth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { recordAuditLog } = require('../utils/routeHelpers');

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-ssm-jwt-secret';

const DEFAULT_CLUSTERS = [
  { id: 'sankul-gorakhpur', name: 'गोरखपुर संकुल (Gorakhpur Cluster)', prant: 'गोरक्ष प्रांत', inchargeName: 'डॉ. हरिश्चंद्र विद्यालंकार' },
  { id: 'sankul-varanasi', name: 'वाराणसी / काशी संकुल (Varanasi Cluster)', prant: 'काशी प्रांत', inchargeName: 'श्री काशीनाथ पाण्डेय' },
  { id: 'sankul-delhi', name: 'दिल्ली प्रांत संकुल (Delhi Prant Cluster)', prant: 'दिल्ली प्रांत', inchargeName: 'श्री रामनारायण जी' },
  { id: 'sankul-awadh', name: 'अवध / लखनऊ संकुल (Awadh Cluster)', prant: 'अवध प्रांत', inchargeName: 'आचार्य सूर्यकांत शुक्ल' },
  { id: 'sankul-kanpur', name: 'कानपुर संकुल (Kanpur Cluster)', prant: 'कानपुर प्रांत', inchargeName: 'श्री दिनेश कुमार मिश्र' },
  { id: 'sankul-meerut', name: 'मेरठ संकुल (Meerut Cluster)', prant: 'मेरठ प्रांत', inchargeName: 'श्री ओंकार सिंह' },
  { id: 'sankul-all', name: 'समस्त संकुल (All Clusters - Prant Oversight)', prant: 'अखिल भारतीय', inchargeName: 'प्रांतीय संगठन मंत्री' }
];

function generateRandomPasscode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Ensures default Sankul clusters are seeded in the database.
 */
async function ensureDefaultClustersSeeded() {
  const count = await Sankul.countDocuments();
  if (count === 0) {
    const seedRecords = DEFAULT_CLUSTERS.map(cluster => ({
      ...cluster,
      passcode: generateRandomPasscode(),
      assignedSchools: [],
      status: 'active'
    }));
    await Sankul.insertMany(seedRecords);
  }
}

/**
 * Check if the requester has developer (Super Admin) credentials.
 */
function isDeveloperUser(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return decoded?.role === 'developer';
  } catch {
    return false;
  }
}

// GET /api/sankuls - List all clusters
router.get('/', async (req, res) => {
  try {
    await ensureDefaultClustersSeeded();

    const isDev = isDeveloperUser(req);
    const projection = isDev ? '' : '-passcode -__v';

    const clusters = await Sankul.find({ status: { $ne: 'inactive' } })
      .select(projection)
      .sort({ createdAt: 1 })
      .lean();

    res.json(clusters);
  } catch (err) {
    res.status(500).json({ error: 'संकुल सूची प्राप्त करने में त्रुटि: ' + err.message });
  }
});

// PUT /api/sankuls/:id/passcode - Update or regenerate a cluster passcode (Developer only)
router.put('/:id/passcode', requireAdminAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'developer') {
      return res.status(403).json({
        error: 'केवल सुपर एडमिन (डेवलपर) संकुल पासकोड बदल सकते हैं।',
        code: 'DEVELOPER_ROLE_REQUIRED'
      });
    }

    const { id } = req.params;
    const { passcode } = req.body;

    const sankul = await Sankul.findOne({ id });
    if (!sankul) {
      return res.status(404).json({ error: 'संकुल क्लस्टर नहीं मिला।' });
    }

    const nextPasscode = passcode && typeof passcode === 'string' && passcode.trim()
      ? passcode.trim()
      : generateRandomPasscode();

    sankul.passcode = nextPasscode;
    await sankul.save();

    await recordAuditLog({
      schoolId: 'ssm-sankul',
      actorType: 'developer',
      actorName: 'Developer Console',
      action: 'SANKUL_PASSCODE_UPDATED',
      description: `संकुल '${sankul.name}' का सुरक्षा पासकोड सुपर एडमिन द्वारा अपडेट किया गया।`,
      req
    });

    res.json({
      success: true,
      message: `संकुल '${sankul.name}' का पासकोड सफलतापूर्वक अपडेट किया गया।`,
      sankul: {
        id: sankul.id,
        name: sankul.name,
        prant: sankul.prant,
        passcode: sankul.passcode,
        inchargeName: sankul.inchargeName,
        status: sankul.status
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'संकुल पासकोड अपडेट में त्रुटि: ' + err.message });
  }
});

// POST /api/sankuls - Register a new cluster (Developer only)
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'developer') {
      return res.status(403).json({
        error: 'केवल सुपर एडमिन नया संकुल क्लस्टर बना सकते हैं।',
        code: 'DEVELOPER_ROLE_REQUIRED'
      });
    }

    const { name, prant, inchargeName, inchargeContact, passcode } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'संकुल का नाम अनिवार्य है।' });
    }

    const cleanName = name.trim();
    const existing = await Sankul.findOne({ name: cleanName });
    if (existing) {
      return res.status(409).json({ error: 'इस नाम से संकुल पहले से मौजूद है।' });
    }

    const id = 'sankul-' + Date.now();
    const finalPasscode = passcode && typeof passcode === 'string' && passcode.trim()
      ? passcode.trim()
      : generateRandomPasscode();

    const newCluster = new Sankul({
      id,
      name: cleanName,
      prant: prant && typeof prant === 'string' ? prant.trim() : 'गोरक्ष प्रांत',
      inchargeName: inchargeName && typeof inchargeName === 'string' ? inchargeName.trim() : '',
      inchargeContact: inchargeContact && typeof inchargeContact === 'string' ? inchargeContact.trim() : '',
      passcode: finalPasscode,
      status: 'active'
    });

    await newCluster.save();

    await recordAuditLog({
      schoolId: 'ssm-sankul',
      actorType: 'developer',
      actorName: 'Developer Console',
      action: 'SANKUL_CREATED',
      description: `नया संकुल क्लस्टर सृजित किया गया: ${newCluster.name}`,
      req
    });

    res.status(201).json({
      success: true,
      message: 'नया संकुल क्लस्टर सफलतापूर्वक पंजीकृत हुआ!',
      sankul: newCluster
    });
  } catch (err) {
    res.status(500).json({ error: 'संकुल निर्माण में त्रुटि: ' + err.message });
  }
});

module.exports = router;

