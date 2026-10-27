const {
  AttendanceSession,
  AttendanceRecord,
  StudentProfile,
  User,
  Class,
  Subject,
  TeacherProfile,
  sequelize
} = require('../models');

// Mark / Submit Attendance for a Class Session
exports.markAttendance = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { classId, subjectId, date, timeSlot, remarks, attendanceData } = req.body;
    // attendanceData is an array: [ { studentId: 1, status: 'present'|'absent'|'late'|'excused', remarks: '' } ]

    if (!classId || !subjectId || !date || !attendanceData || !Array.isArray(attendanceData)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Missing required parameters or invalid attendance format' });
    }

    // Get teacher profile id
    const teacherProfile = await TeacherProfile.findOne({
      where: { userId: req.user.id }
    });

    if (!teacherProfile && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Teacher profile not found' });
    }

    const teacherId = teacherProfile ? teacherProfile.id : 1;

    // Check if attendance already exists for this class, subject, date, timeSlot
    let session = await AttendanceSession.findOne({
      where: { classId, subjectId, date, timeSlot: timeSlot || null }
    });

    if (session) {
      // Overwrite/Update existing session and records
      session.remarks = remarks;
      await session.save({ transaction });

      // Delete existing records for this session to recreate/update
      await AttendanceRecord.destroy({
        where: { sessionId: session.id },
        transaction
      });
    } else {
      // Create new session
      session = await AttendanceSession.create({
        classId,
        subjectId,
        teacherId,
        date,
        timeSlot,
        remarks,
      }, { transaction });
    }

    // Bulk create attendance records
    const recordsToCreate = attendanceData.map((item) => ({
      sessionId: session.id,
      studentId: item.studentId, // StudentProfile.id
      status: item.status,
      remarks: item.remarks || null,
    }));

    await AttendanceRecord.bulkCreate(recordsToCreate, { transaction });

    await transaction.commit();

    res.status(200).json({
      message: 'Attendance recorded successfully',
      sessionId: session.id,
      totalStudents: attendanceData.length,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

// Get Session Attendance Details (for editing or viewing)
exports.getSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await AttendanceSession.findByPk(sessionId, {
      include: [
        { model: Class },
        { model: Subject },
        { model: TeacherProfile, include: [{ model: User, attributes: ['name', 'email'] }] },
        {
          model: AttendanceRecord,
          include: [
            {
              model: StudentProfile,
              include: [{ model: User, attributes: ['id', 'name', 'email'] }]
            }
          ]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session details', error: error.message });
  }
};

// Check if attendance exists for a class + subject + date
exports.checkAttendanceStatus = async (req, res) => {
  try {
    const { classId, subjectId, date } = req.query;

    if (!classId || !subjectId || !date) {
      return res.status(400).json({ message: 'Please provide classId, subjectId, and date' });
    }

    const session = await AttendanceSession.findOne({
      where: { classId, subjectId, date },
      include: [
        {
          model: AttendanceRecord,
          include: [
            {
              model: StudentProfile,
              include: [{ model: User, attributes: ['id', 'name', 'email'] }]
            }
          ]
        }
      ]
    });

    if (!session) {
      return res.json({ marked: false, session: null });
    }

    res.json({ marked: true, session });
  } catch (error) {
    res.status(500).json({ message: 'Error checking attendance status', error: error.message });
  }
};

// Get Class Attendance History
exports.getClassAttendanceHistory = async (req, res) => {
  try {
    const { classId, subjectId } = req.query;
    const where = {};
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;

    const sessions = await AttendanceSession.findAll({
      where,
      include: [
        { model: Class },
        { model: Subject },
        { model: TeacherProfile, include: [{ model: User, attributes: ['name'] }] },
        { model: AttendanceRecord }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance history', error: error.message });
  }
};
