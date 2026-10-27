const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here require Admin role
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', adminController.getAdminStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Department Management
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);

// Class Management
router.get('/classes', adminController.getClasses);
router.post('/classes', adminController.createClass);

// Subject Management
router.get('/subjects', adminController.getSubjects);
router.post('/subjects', adminController.createSubject);

// Teacher Assignments
router.get('/assignments', adminController.getTeacherClassSubjects);
router.post('/assignments', adminController.assignTeacherClassSubject);

module.exports = router;
