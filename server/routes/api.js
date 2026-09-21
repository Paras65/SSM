const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Domain-specific child routers
const authRoutes = require('./auth');
const schoolRoutes = require('./schools');
const studentRoutes = require('./students');
const attendanceRoutes = require('./attendance');
const feeRoutes = require('./fees');
const reportRoutes = require('./reports');
const noticeRoutes = require('./notices');
const admissionRoutes = require('./admissions');
const homeworkRoutes = require('./homework');
const staffRoutes = require('./staff');
const salarySlipRoutes = require('./salarySlips');
const examRoutes = require('./exams');
const operationRoutes = require('./operations');
const aiRoutes = require('./ai');
const sankulRoutes = require('./sankuls');

// Healthcheck & Database status
router.get('/status', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: 'ok',
    database: states[state] || 'unknown',
    databaseHost: state === 1 ? 'MongoDB Cloud' : 'none',
    timestamp: new Date().toISOString()
  });
});

// Mount domain routes with backward-compatible URLs
router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees', feeRoutes);
router.use('/reports', reportRoutes);
router.use('/notices', noticeRoutes);
router.use('/admissions', admissionRoutes);
router.use('/homework', homeworkRoutes);
router.use('/staff', staffRoutes);
router.use('/salary-slips', salarySlipRoutes);
router.use('/exams', examRoutes);
router.use('/ai', aiRoutes);
router.use('/sankuls', sankulRoutes);
router.use('/', operationRoutes); // Timetable, Leaves, Transport, Library, Inventory, Audit Logs

module.exports = router;
