const {
  StudentProfile,
  User,
  Class,
  Subject,
  AttendanceRecord,
  AttendanceSession,
  TeacherProfile,
  LeaveRequest
} = require('../models');

// Get Student Dashboard & Attendance Summary
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({
      where: { userId: req.user.id },
      include: [Class]
    });

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Fetch all attendance records for this student
    const records = await AttendanceRecord.findAll({
      where: { studentId: studentProfile.id },
      include: [
        {
          model: AttendanceSession,
          include: [
            { model: Subject },
            { model: TeacherProfile, include: [{ model: User, attributes: ['name'] }] }
          ]
        }
      ],
      order: [[AttendanceSession, 'date', 'DESC']]
    });

    const totalClasses = records.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    // Group stats by subject
    const subjectStats = {};

    records.forEach((rec) => {
      const status = rec.status;
      if (status === 'present') presentCount++;
      else if (status === 'absent') absentCount++;
      else if (status === 'late') lateCount++;
      else if (status === 'excused') excusedCount++;

      const subjectName = rec.AttendanceSession?.Subject?.name || 'Unknown Subject';
      const subjectCode = rec.AttendanceSession?.Subject?.code || 'SUB';

      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = {
          name: subjectName,
          code: subjectCode,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }

      subjectStats[subjectName].total++;
      if (status === 'present') subjectStats[subjectName].present++;
      if (status === 'absent') subjectStats[subjectName].absent++;
      if (status === 'late') subjectStats[subjectName].late++;
      if (status === 'excused') subjectStats[subjectName].excused++;
    });

    // Calculate percentage per subject
    const subjectBreakdown = Object.values(subjectStats).map((subj) => {
      const attended = subj.present + subj.late; // count late as attended or separate
      const percentage = subj.total > 0 ? ((attended / subj.total) * 100).toFixed(1) : 0;
      return {
        ...subj,
        percentage: Number(percentage),
        isLow: percentage < 75,
      };
    });

    const overallAttended = presentCount + lateCount;
    const overallPercentage = totalClasses > 0 ? ((overallAttended / totalClasses) * 100).toFixed(1) : 0;

    // Fetch leave requests count
    const leaveRequests = await LeaveRequest.findAll({
      where: { studentId: studentProfile.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      student: {
        id: studentProfile.id,
        rollNumber: studentProfile.rollNumber,
        class: studentProfile.Class,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      },
      summary: {
        totalClasses,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        overallPercentage: Number(overallPercentage),
        isWarning: overallPercentage < 75,
      },
      subjectBreakdown,
      recentRecords: records.slice(0, 15),
      leaveRequests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student dashboard', error: error.message });
  }
};
