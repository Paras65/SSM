const express = require('express');
const router = express.Router();
const School = require('../models/School');
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const ReportCard = require('../models/ReportCard');
const Staff = require('../models/Staff');
const Notice = require('../models/Notice');
const Exam = require('../models/Exam');
const TransportRoute = require('../models/Transport');
const Book = require('../models/Book');
const InventoryItem = require('../models/InventoryItem');
const { requireAdminAuth, requireSchoolScope } = require('../middleware/auth');
const { generateUniqueId, recordAuditLog } = require('../utils/routeHelpers');

// GET /api/schools - List all schools (public directory)
router.get('/', async (req, res) => {
  try {
    const dummySchoolIds = ['ssm-demo', 'ssm-gorakhpur', 'ssm-delhi', 'ssm-varanasi'];
    const rawSchools = await School.find({
      status: { $nin: ['discontinued', 'demo'] },
      isDemo: { $ne: true },
      id: { $nin: dummySchoolIds }
    })
      .select('-adminPasscode')
      .sort({ established: 1, createdAt: 1 })
      .lean();

    // Deduplicate schools by unique ID or matching (name + city)
    const schools = rawSchools.filter((s, idx, arr) =>
      idx === arr.findIndex(x => x.id === s.id || ((x.hindiName === s.hindiName || x.name === s.name) && x.city === s.city))
    );

    res.json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/schools/:id - School profile details
router.get('/:id', async (req, res) => {
  try {
    const school = await School.findOne({ id: req.params.id }).select('-adminPasscode').lean();
    if (!school) return res.status(404).json({ error: 'School not found' });
    res.json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/schools - Register a new school branch
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.hindiName || !data.city) {
      return res.status(400).json({ error: 'विद्यालय का नाम और नगर अनिवार्य है।' });
    }

    // Prevent duplicate school registration in same city
    const existing = await School.findOne({
      $or: [
        { hindiName: data.hindiName.trim(), city: data.city.trim() },
        { name: data.name.trim(), city: data.city.trim() }
      ],
      status: { $ne: 'discontinued' }
    }).lean();

    if (existing) {
      return res.status(409).json({
        error: `यह विद्यालय शाखा (${data.hindiName || data.name}, ${data.city}) पहले से पंजीकृत है।`,
        code: 'DUPLICATE_SCHOOL'
      });
    }

    if (!data.id) {
      const rawSlug = (data.name || data.city || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const citySlug = rawSlug.length > 0 ? rawSlug.slice(0, 15) : 'branch';
      data.id = generateUniqueId(`ssm-${citySlug}`);
    }
    const school = new School(data);
    await school.save();
    await recordAuditLog({
      schoolId: school.id,
      actorType: req.user?.role || 'public',
      action: 'SCHOOL_REGISTERED',
      description: `नवीन विद्यालय शाखा पंजीकृत: ${school.hindiName} (${school.city}, ${school.prant})`,
      req
    });
    res.status(201).json(school);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/schools/:id - Update school details
router.put('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const updatePayload = { ...req.body };
    const targetFilter = { id: req.params.id, ...(req.user.role === 'developer' ? {} : { id: req.userSchoolId }) };

    // Privilege Escalation Defense: Only developer role can change school plan subscription
    if (!req.user || req.user.role !== 'developer') {
      delete updatePayload.plan;
    }

    // Strip immutable primary keys and timestamps
    delete updatePayload.id;
    delete updatePayload._id;
    delete updatePayload.createdAt;

    // If adminPasscode is updated, increment tokenVersion to invalidate existing stale sessions
    if (updatePayload.adminPasscode) {
      const existing = await School.findOne(targetFilter).lean();
      if (existing) {
        updatePayload.tokenVersion = (existing.tokenVersion || 1) + 1;
      }
    }

    const school = await School.findOneAndUpdate(
      targetFilter,
      updatePayload,
      { returnDocument: 'after', runValidators: true }
    );
    if (!school) return res.status(404).json({ error: 'School not found' });

    if (updatePayload.adminPasscode) {
      await recordAuditLog({
        schoolId: school.id,
        actorType: req.user?.role || 'admin',
        actorId: req.user?.schoolId || req.user?.role || 'admin',
        actorName: req.user?.schoolName || school.name,
        action: 'PASSCODE_CHANGED',
        description: `प्रशासक सुरक्षा पासकोड बदला गया एवं सक्रिय सत्र अमान्य (invalidated) किए गए (संस्करण: ${school.tokenVersion})`,
        req
      });
    }

    res.json(school);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/schools/:id/archive - Institutional Data Archive Export (DPDP Act 2023)
router.get('/:id/archive', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const schoolId = req.params.id;
    const targetFilter = { schoolId };

    const [
      school,
      students,
      fees,
      attendance,
      reportCards,
      staff,
      notices,
      exams,
      transport,
      books,
      inventory
    ] = await Promise.all([
      School.findOne({ id: schoolId, ...(req.user.role === 'developer' ? {} : { id: req.userSchoolId }) }).lean(),
      Student.find(targetFilter).lean(),
      Fee.find(targetFilter).lean(),
      Attendance.find(targetFilter).lean(),
      ReportCard.find(targetFilter).lean(),
      Staff.find(targetFilter).select('-pin').lean(),
      Notice.find(targetFilter).lean(),
      Exam.find(targetFilter).lean(),
      TransportRoute.find(targetFilter).lean(),
      Book.find(targetFilter).lean(),
      InventoryItem.find(targetFilter).lean()
    ]);

    if (!school) return res.status(404).json({ error: 'विद्यालय शाखा नहीं मिली।' });

    await recordAuditLog({
      schoolId,
      actorType: req.user?.role || 'admin',
      actorName: req.user?.schoolName || school.name,
      action: 'FULL_ARCHIVE_EXPORTED',
      description: `संस्थागत पूर्ण डेटा अभिलेखागार निर्यात (Institutional Data Archive Exported for offboarding/backup)`,
      req
    });

    res.json({
      exportedAt: new Date().toISOString(),
      school,
      counts: {
        students: students.length,
        fees: fees.length,
        attendance: attendance.length,
        reportCards: reportCards.length,
        staff: staff.length,
        notices: notices.length,
        exams: exams.length,
        transport: transport.length,
        books: books.length,
        inventory: inventory.length
      },
      data: {
        students,
        fees,
        attendance,
        reportCards,
        staff,
        notices,
        exams,
        transport,
        books,
        inventory
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'डेटा निर्यात में त्रुटि: ' + err.message });
  }
});

// POST /api/schools/:id/discontinue - Discontinue a school branch
router.post('/:id/discontinue', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const schoolId = req.params.id;
    const { reason, confirmText } = req.body;

    if (confirmText !== 'DISCONTINUE') {
      return res.status(400).json({
        error: 'पुष्टिकरण हेतु "DISCONTINUE" प्रविष्ट करें। (Type "DISCONTINUE" to confirm offboarding)',
        code: 'CONFIRMATION_REQUIRED'
      });
    }

    const school = await School.findOne({ id: schoolId, ...(req.user.role === 'developer' ? {} : { id: req.userSchoolId }) });
    if (!school) return res.status(404).json({ error: 'विद्यालय शाखा नहीं मिली।' });

    school.status = 'discontinued';
    school.discontinuedAt = new Date();
    school.discontinuationReason = reason || 'प्रबंधन के निर्देशानुसार सेवा विसर्जन (Discontinued as requested by school management)';
    school.tokenVersion = (school.tokenVersion || 1) + 1;
    await school.save();

    await recordAuditLog({
      schoolId,
      actorType: req.user?.role || 'admin',
      actorName: req.user?.schoolName || school.name,
      action: 'SCHOOL_DISCONTINUED',
      description: `विद्यालय शाखा सेवा विसर्जन (Branch Discontinued): ${school.hindiName}. कारण: ${school.discontinuationReason}`,
      req
    });

    res.json({
      success: true,
      message: 'विद्यालय शाखा सफलतापूर्वक विसर्जित (Discontinued) की गई। सत्र अमान्य कर दिए गए हैं।',
      school
    });
  } catch (err) {
    res.status(500).json({ error: 'शाखा विसर्जन में त्रुटि: ' + err.message });
  }
});

// POST /api/schools/:id/reactivate - Reactivate a discontinued school branch
router.post('/:id/reactivate', requireAdminAuth, async (req, res) => {
  try {
    if (req.user?.role !== 'developer') {
      return res.status(403).json({ error: 'केवल डेवलपर प्रशासन शाखा पुनः सक्रिय कर सकता है।', code: 'DEVELOPER_ROLE_REQUIRED' });
    }

    const school = await School.findOne({ id: req.params.id });
    if (!school) return res.status(404).json({ error: 'विद्यालय शाखा नहीं मिली।' });

    school.status = 'active';
    school.discontinuedAt = null;
    school.discontinuationReason = '';
    await school.save();

    await recordAuditLog({
      schoolId: school.id,
      actorType: 'developer',
      actorName: 'Developer Console',
      action: 'SCHOOL_REACTIVATED',
      description: `विद्यालय शाखा पुनः सक्रिय की गई: ${school.hindiName}`,
      req
    });

    res.json({ success: true, message: 'शाखा पुनः सक्रिय कर दी गई है।', school });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

