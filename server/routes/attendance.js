const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { requireTeacherAuth, requireSchoolScope } = require('../middleware/auth');
const { calculateCurrentAcademicYear } = require('../utils/sessionHelper');
const { executeSafeQuery } = require('../utils/routeHelpers');

// GET /api/attendance - List attendance records
router.get('/', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = {};
    if (req.query.startDate && req.query.endDate) {
      filter.date = { $gte: req.query.startDate, $lte: req.query.endDate };
    } else if (req.query.date) {
      filter.date = req.query.date;
    }
    if (req.query.schoolId) filter.schoolId = req.query.schoolId;
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.class) filter.class = req.query.class;
    await executeSafeQuery(Attendance, filter, req, res, { date: -1, createdAt: -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance - Mark single attendance
router.post('/', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const { studentId, date, status = 'Present', schoolId, academicYear, class: studentClass } = req.body;
    if (!studentId || !date) {
      return res.status(400).json({ error: 'studentId और date अनिवार्य हैं।' });
    }
    const validStatuses = ['Present', 'Absent', 'Leave'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `अमान्य उपस्थिति स्थिति: ${status}` });
    }
    const targetSchoolId = schoolId || req.userSchoolId || 'ssm-gorakhpur';
    const id = `att-${targetSchoolId}-${date}-${studentId}`;
    const year = academicYear || calculateCurrentAcademicYear(new Date(date));
    const record = await Attendance.findOneAndUpdate(
      { schoolId: targetSchoolId, studentId, date },
      { 
        id, 
        studentId, 
        date, 
        status, 
        schoolId: targetSchoolId,
        academicYear: year,
        ...(studentClass ? { class: studentClass } : {})
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/attendance/bulk - Mark bulk attendance
router.post('/bulk', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const { updates, schoolId } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'updates array is required and must not be empty' });
    }

    const validStatuses = ['Present', 'Absent', 'Leave'];
    for (const u of updates) {
      if (!u.studentId || !u.date) {
        return res.status(400).json({ error: 'प्रत्येक प्रविष्टि में studentId और date अनिवार्य है।' });
      }
      if (u.status && !validStatuses.includes(u.status)) {
        return res.status(400).json({ error: `अमान्य उपस्थिति स्थिति: ${u.status}` });
      }
    }

    const operations = updates.map(u => {
      const targetSchoolId = u.schoolId || schoolId || req.userSchoolId || 'ssm-gorakhpur';
      const year = u.academicYear || calculateCurrentAcademicYear(new Date(u.date));
      return {
        updateOne: {
          filter: { schoolId: targetSchoolId, studentId: u.studentId, date: u.date },
          update: {
            $set: {
              id: `att-${targetSchoolId}-${u.date}-${u.studentId}`,
              studentId: u.studentId,
              date: u.date,
              status: u.status || 'Present',
              schoolId: targetSchoolId,
              academicYear: year,
              ...(u.class ? { class: u.class } : {})
            }
          },
          upsert: true
        }
      };
    });

    await Attendance.bulkWrite(operations);
    const filter = { date: updates[0]?.date };
    if (schoolId) filter.schoolId = schoolId;
    if (req.user.role !== 'developer' && !filter.schoolId) filter.schoolId = req.userSchoolId;
    const records = await Attendance.find(filter);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/attendance/:id - Delete an attendance record
router.delete('/:id', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Attendance.findOneAndDelete({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!deleted) return res.status(404).json({ error: 'Attendance record not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


