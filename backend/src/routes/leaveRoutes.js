const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/apply', authorize('student'), leaveController.applyLeave);
router.get('/', leaveController.getLeaveRequests);
router.put('/:id/status', authorize('admin', 'teacher'), leaveController.updateLeaveStatus);

module.exports = router;
