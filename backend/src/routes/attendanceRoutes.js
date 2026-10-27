const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Mark / Submit attendance (Teacher & Admin)
router.post('/mark', authorize('teacher', 'admin'), attendanceController.markAttendance);

// Check attendance status for date/class/subject (Teacher & Admin)
router.get('/status', authorize('teacher', 'admin'), attendanceController.checkAttendanceStatus);

// History (Teacher & Admin)
router.get('/history', authorize('teacher', 'admin'), attendanceController.getClassAttendanceHistory);

// Session Details (Teacher, Admin, Student)
router.get('/session/:sessionId', attendanceController.getSessionAttendance);

module.exports = router;
