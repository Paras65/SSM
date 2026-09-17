const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const ReportCard = require('../models/ReportCard');
const { requireAdminAuth, requireTeacherAuth, requirePortalAuth, requireSchoolScope } = require('../middleware/auth');
const { calculateCurrentAcademicYear } = require('../utils/sessionHelper');
const { recordAuditLog, executeSafeQuery } = require('../utils/routeHelpers');

// GET /api/exams - List exams
router.get('/', requirePortalAuth, requireSchoolScope, async (req, res) => {
  try {
    const filter = req.user?.role === 'developer' && req.query.schoolId
      ? { schoolId: req.query.schoolId }
      : { schoolId: req.userSchoolId };
    if (req.query.term) filter.term = req.query.term;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    await executeSafeQuery(Exam, filter, req, res, { startDate: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exams - Create exam schedule
router.post('/', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) data.id = `exam-${Date.now()}`;
    data.schoolId = req.user?.role === 'developer' && data.schoolId ? data.schoolId : req.userSchoolId;
    if (!data.academicYear) {
      data.academicYear = calculateCurrentAcademicYear();
    }
    const exam = new Exam(data);
    await exam.save();
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/exams/:id - Update exam schedule
router.put('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const existing = await Exam.findOne({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!existing) return res.status(404).json({ error: 'Exam not found' });
    if (existing.isLocked && req.body.isLocked === undefined) {
      return res.status(403).json({
        error: 'यह परीक्षा लॉक (स्थिर) है। इसके विवरण में परिवर्तन वर्जित है। (Exam is locked)',
        code: 'EXAM_LOCKED'
      });
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData._id;
    delete updateData.createdAt;
    if (!req.user || req.user.role !== 'developer') {
      delete updateData.schoolId;
    }

    const updated = await Exam.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/exams/:id/lock - Lock/unlock exam
router.patch('/:id/lock', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const { isLocked } = req.body;
    const lockStatus = isLocked !== undefined ? Boolean(isLocked) : true;
    const exam = await Exam.findOneAndUpdate(
      { id: req.params.id, ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId }) },
      { isLocked: lockStatus },
      { returnDocument: 'after', runValidators: true }
    );
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    await recordAuditLog({
      schoolId: exam.schoolId,
      actorType: req.user?.role || 'admin',
      action: exam.isLocked ? 'EXAM_LOCKED' : 'EXAM_UNLOCKED',
      description: `परीक्षा #${exam.id} (${exam.name || exam.term}) को ${exam.isLocked ? 'स्थिर/लॉक (Locked)' : 'अनलॉक (Unlocked)'} किया गया।`,
      req
    });
    res.json({ success: true, isLocked: exam.isLocked, exam });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/exams/:id - Delete exam schedule
router.delete('/:id', requireAdminAuth, requireSchoolScope, async (req, res) => {
  try {
    const deleted = await Exam.findOneAndDelete({
      id: req.params.id,
      ...(req.user.role === 'developer' ? {} : { schoolId: req.userSchoolId })
    });
    if (!deleted) return res.status(404).json({ error: 'Exam not found' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/exams/marks-bulk - Bulk marks submission
router.post('/marks-bulk', requireTeacherAuth, requireSchoolScope, async (req, res) => {
  try {
    const { schoolId, examTerm, academicYear, subject, marksList } = req.body;
    if (!marksList || !Array.isArray(marksList) || !subject) {
      return res.status(400).json({ error: 'विषय और छात्रों के प्राप्तांक सूची आवश्यक है।' });
    }

    const targetSchoolId = schoolId || req.user?.schoolId || 'ssm-gorakhpur';
    const year = academicYear || calculateCurrentAcademicYear();
    const term = examTerm || 'अर्धवार्षिक परीक्षा';

    const lockedExam = await Exam.findOne({
      schoolId: targetSchoolId,
      term,
      academicYear: year,
      isLocked: true
    });
    if (lockedExam) {
      return res.status(403).json({
        error: `परीक्षा '${term}' (${year}) लॉक (स्थिर) कर दी गई है। इसके अंकों में परिवर्तन वर्जित है। (Exam is locked, marks entry forbidden)`,
        code: 'EXAM_LOCKED'
      });
    }

    const results = [];
    for (const item of marksList) {
      const { studentId, marksObtained, maxMarks = 100 } = item;
      if (!studentId) continue;

      let report = await ReportCard.findOne({ schoolId: targetSchoolId, studentId, examTerm: term });
      const grade = marksObtained >= 90 ? 'A+' : marksObtained >= 75 ? 'A' : marksObtained >= 60 ? 'B' : marksObtained >= 45 ? 'C' : 'D';

      if (report) {
        const subIndex = report.marks.findIndex(m => m.subject === subject);
        if (subIndex > -1) {
          report.marks[subIndex].marksObtained = Number(marksObtained);
          report.marks[subIndex].maxMarks = Number(maxMarks);
          report.marks[subIndex].grade = grade;
        } else {
          report.marks.push({
            subject,
            code: subject.slice(0, 3).toUpperCase(),
            maxMarks: Number(maxMarks),
            marksObtained: Number(marksObtained),
            grade
          });
        }
        report.totalMax = report.marks.reduce((sum, m) => sum + (m.maxMarks || 100), 0);
        report.totalObtained = report.marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
        report.percentage = report.totalMax > 0 ? (report.totalObtained / report.totalMax) * 100 : 0;
        report.grade = report.percentage >= 90 ? 'A+' : report.percentage >= 75 ? 'A' : report.percentage >= 60 ? 'B' : report.percentage >= 45 ? 'C' : 'D';
        await report.save();
        results.push(report);
      } else {
        const newReport = new ReportCard({
          id: `rc-${Date.now()}-${studentId}`,
          schoolId: targetSchoolId,
          studentId,
          examTerm: term,
          academicYear: year,
          marks: [{
            subject,
            code: subject.slice(0, 3).toUpperCase(),
            maxMarks: Number(maxMarks),
            marksObtained: Number(marksObtained),
            grade
          }],
          totalMax: Number(maxMarks),
          totalObtained: Number(marksObtained),
          percentage: Number(maxMarks) > 0 ? (Number(marksObtained) / Number(maxMarks)) * 100 : 0,
          grade,
          acharyaRemarks: 'संतोषजनक प्रदर्शन। निरंतर अभ्यास करें।'
        });
        await newReport.save();
        results.push(newReport);
      }
    }

    await recordAuditLog({
      schoolId: targetSchoolId,
      actorType: req.user?.role || 'admin',
      actorId: req.user?.staffId || req.user?.teacherId || '',
      actorName: req.user?.name || req.user?.schoolName || 'आचार्य / व्यवस्थापक',
      action: 'EXAM_MARKS_RECORDED',
      description: `परीक्षा '${term}' (${year}) - विषय: ${subject} हेतु ${results.length} छात्रों के प्राप्तांक दर्ज/अद्यतन किए गए।`,
      req
    });

    res.json({ success: true, count: results.length, updated: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

