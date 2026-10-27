const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/assigned-classes', teacherController.getAssignedClasses);
router.get('/class-students/:classId', teacherController.getStudentsForClass);
router.get('/dashboard', teacherController.getTeacherDashboard);

module.exports = router;
