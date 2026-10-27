const {
  TeacherProfile,
  TeacherClassSubject,
  Class,
  Subject,
  StudentProfile,
  User,
  AttendanceSession,
  AttendanceRecord
} = require('../models');

// Get teacher assigned classes & subjects
exports.getAssignedClasses = async (req, res) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!teacherProfile) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const assignments = await TeacherClassSubject.findAll({
      where: { teacherId: teacherProfile.id },
      include: [
        { model: Class },
        { model: Subject }
      ]
    });

    res.json({ assignments, teacherProfile });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assigned classes', error: error.message });
  }
};

// Get list of students in a specific class for attendance taking
exports.getStudentsForClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const students = await StudentProfile.findAll({
      where: { classId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone', 'avatar']
        }
      ],
      order: [['rollNumber', 'ASC']]
    });

    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students for class', error: error.message });
  }
};

// Get teacher dashboard overview
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!teacherProfile) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const assignments = await TeacherClassSubject.findAll({
      where: { teacherId: teacherProfile.id },
      include: [Class, Subject]
    });

    const recentSessions = await AttendanceSession.findAll({
      where: { teacherId: teacherProfile.id },
      include: [Class, Subject],
      limit: 10,
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    const totalSessions = await AttendanceSession.count({
      where: { teacherId: teacherProfile.id }
    });

    res.json({
      assignmentsCount: assignments.length,
      totalSessions,
      recentSessions,
      assignments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher dashboard data', error: error.message });
  }
};
