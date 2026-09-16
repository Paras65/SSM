const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { requireAdminAuth, requireSchoolScope } = require('../middleware/auth');
const { generateUniqueId, executeSafeQuery } = require('../utils/routeHelpers');

// GET /api/notices - List notices (public)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.schoolId ? { schoolId: req.query.schoolId } : {};
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    await executeSafeQuery(Notice, filter, req, res, { date: -1, createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notices - Create notice
router.post('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const noticeData = req.body;
    if (!noticeData.id) {
      noticeData.id = generateUniqueId('not');
    }
    if (!noticeData.schoolId) {
      noticeData.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const notice = new Notice(noticeData);
    await notice.save();
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/notices/:id - Delete notice
router.delete('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Notice.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Notice not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

