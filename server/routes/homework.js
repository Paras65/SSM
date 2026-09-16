const express = require('express');
const router = express.Router();
const Homework = require('../models/Homework');
const { requireTeacherAuth, requirePortalAuth, requireSchoolScope } = require('../middleware/auth');
const { generateUniqueId, executeSafeQuery } = require('../utils/routeHelpers');

// GET /api/homework - List homework assignments
router.get('/', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = {};
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;
    if (req.query.class) filter.class = req.query.class;
    if (req.query.date) filter.date = req.query.date;
    await executeSafeQuery(Homework, filter, req, res, { date: -1, createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/homework - Create homework
router.post('/', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = generateUniqueId('hw');
    }
    if (!data.schoolId) {
      data.schoolId = req.userSchoolId || 'ssm-gorakhpur';
    }
    const homework = new Homework(data);
    await homework.save();
    res.status(201).json(homework);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/homework/:id - Update homework
router.put('/:id', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const updatePayload = { ...req.body };
    delete updatePayload.id;
    delete updatePayload._id;
    delete updatePayload.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updatePayload.schoolId;
    }

    const homework = await Homework.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updatePayload,
      { returnDocument: 'after', runValidators: true }
    );
    if (!homework) return res.status(404).json({ error: 'Homework not found' });
    res.json(homework);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/homework/:id - Delete homework
router.delete('/:id', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Homework.findOneAndDelete({ id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) });
    if (!deleted) return res.status(404).json({ error: 'Homework not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

