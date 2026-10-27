const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('student', 'admin'));

router.get('/dashboard', studentController.getStudentDashboard);

module.exports = router;
