const { LeaveRequest, StudentProfile, User, Class } = require('../models');

// Apply for leave (Student)
exports.applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    const studentProfile = await StudentProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Please provide start date, end date, and reason' });
    }

    const leave = await LeaveRequest.create({
      studentId: studentProfile.id,
      startDate,
      endDate,
      reason,
      status: 'pending',
    });

    res.status(201).json({ message: 'Leave application submitted successfully', leave });
  } catch (error) {
    res.status(500).json({ message: 'Error applying for leave', error: error.message });
  }
};

// Get all leave requests (Admin/Teacher view all, Student view own)
exports.getLeaveRequests = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({
        where: { userId: req.user.id }
      });
      if (studentProfile) {
        where.studentId = studentProfile.id;
      }
    }

    const leaves = await LeaveRequest.findAll({
      where,
      include: [
        {
          model: StudentProfile,
          include: [
            { model: User, attributes: ['id', 'name', 'email'] },
            { model: Class }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
};

// Update Leave Status (Approve/Reject by Admin or Teacher)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const leave = await LeaveRequest.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    if (adminComment !== undefined) leave.adminComment = adminComment;

    await leave.save();

    res.json({ message: `Leave request ${status}`, leave });
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave status', error: error.message });
  }
};
