const {
  StudentProfile,
  User,
  Class,
  Subject,
  AttendanceRecord,
  AttendanceSession,
  TeacherProfile,
  Department
} = require('../models');
const { Op } = require('sequelize');

exports.generateAttendanceReport = async (req, res) => {
  try {
    const { classId, subjectId, startDate, endDate, threshold } = req.query;

    const sessionWhere = {};
    if (classId) sessionWhere.classId = classId;
    if (subjectId) sessionWhere.subjectId = subjectId;
    if (startDate && endDate) {
      sessionWhere.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      sessionWhere.date = { [Op.gte]: startDate };
    } else if (endDate) {
      sessionWhere.date = { [Op.lte]: endDate };
    }

    const sessions = await AttendanceSession.findAll({
      where: sessionWhere,
      include: [Class, Subject]
    });

    const sessionIds = sessions.map((s) => s.id);

    // Get students in the target class
    const studentWhere = {};
    if (classId) studentWhere.classId = classId;

    const students = await StudentProfile.findAll({
      where: studentWhere,
      include: [
        { model: User, attributes: ['id', 'name', 'email', 'phone'] },
        { model: Class },
        { model: Department }
      ],
      order: [['rollNumber', 'ASC']]
    });

    // Get all records for these sessions
    const records = await AttendanceRecord.findAll({
      where: {
        sessionId: { [Op.in]: sessionIds.length ? sessionIds : [0] }
      },
      include: [
        { model: AttendanceSession, include: [Subject] }
      ]
    });

    // Map records per student
    const reportData = students.map((student) => {
      const studentRecords = records.filter((r) => r.studentId === student.id);
      const totalSessions = studentRecords.length;
      let present = 0;
      let absent = 0;
      let late = 0;
      let excused = 0;

      studentRecords.forEach((r) => {
        if (r.status === 'present') present++;
        else if (r.status === 'absent') absent++;
        else if (r.status === 'late') late++;
        else if (r.status === 'excused') excused++;
      });

      const attended = present + late;
      const percentage = totalSessions > 0 ? parseFloat(((attended / totalSessions) * 100).toFixed(1)) : 0;

      return {
        studentId: student.id,
        rollNumber: student.rollNumber,
        studentName: student.User?.name || 'N/A',
        email: student.User?.email || 'N/A',
        className: student.Class ? `${student.Class.name} (${student.Class.section})` : 'N/A',
        totalSessions,
        present,
        absent,
        late,
        excused,
        attended,
        percentage,
        isBelowThreshold: threshold ? percentage < parseFloat(threshold) : percentage < 75,
      };
    });

    // Filter by threshold if requested
    let filteredReport = reportData;
    if (threshold && threshold !== 'all') {
      const threshNum = parseFloat(threshold);
      filteredReport = reportData.filter((r) => r.percentage < threshNum);
    }

    res.json({
      summary: {
        totalStudents: students.length,
        totalSessionsCount: sessionIds.length,
        lowAttendanceCount: reportData.filter((r) => r.percentage < 75).length,
      },
      report: filteredReport,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};
