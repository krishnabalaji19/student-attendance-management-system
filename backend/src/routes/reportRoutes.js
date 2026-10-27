const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'teacher'));

router.get('/attendance', reportController.generateAttendanceReport);

module.exports = router;
