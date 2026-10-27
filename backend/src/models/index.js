const sequelize = require('../config/database');
const User = require('./User');
const Department = require('./Department');
const Subject = require('./Subject');
const Class = require('./Class');
const TeacherProfile = require('./TeacherProfile');
const StudentProfile = require('./StudentProfile');
const TeacherClassSubject = require('./TeacherClassSubject');
const AttendanceSession = require('./AttendanceSession');
const AttendanceRecord = require('./AttendanceRecord');
const LeaveRequest = require('./LeaveRequest');

// User <-> TeacherProfile
User.hasOne(TeacherProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
TeacherProfile.belongsTo(User, { foreignKey: 'userId' });

// User <-> StudentProfile
User.hasOne(StudentProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudentProfile.belongsTo(User, { foreignKey: 'userId' });

// Department Relationships
Department.hasMany(Subject, { foreignKey: 'departmentId', onDelete: 'SET NULL' });
Subject.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Class, { foreignKey: 'departmentId', onDelete: 'SET NULL' });
Class.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(TeacherProfile, { foreignKey: 'departmentId', onDelete: 'SET NULL' });
TeacherProfile.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(StudentProfile, { foreignKey: 'departmentId', onDelete: 'SET NULL' });
StudentProfile.belongsTo(Department, { foreignKey: 'departmentId' });

// Class <-> StudentProfile
Class.hasMany(StudentProfile, { foreignKey: 'classId', onDelete: 'SET NULL' });
StudentProfile.belongsTo(Class, { foreignKey: 'classId' });

// TeacherClassSubject Relationships
TeacherProfile.hasMany(TeacherClassSubject, { foreignKey: 'teacherId', onDelete: 'CASCADE' });
TeacherClassSubject.belongsTo(TeacherProfile, { foreignKey: 'teacherId' });

Class.hasMany(TeacherClassSubject, { foreignKey: 'classId', onDelete: 'CASCADE' });
TeacherClassSubject.belongsTo(Class, { foreignKey: 'classId' });

Subject.hasMany(TeacherClassSubject, { foreignKey: 'subjectId', onDelete: 'CASCADE' });
TeacherClassSubject.belongsTo(Subject, { foreignKey: 'subjectId' });

// AttendanceSession Relationships
Class.hasMany(AttendanceSession, { foreignKey: 'classId', onDelete: 'CASCADE' });
AttendanceSession.belongsTo(Class, { foreignKey: 'classId' });

Subject.hasMany(AttendanceSession, { foreignKey: 'subjectId', onDelete: 'CASCADE' });
AttendanceSession.belongsTo(Subject, { foreignKey: 'subjectId' });

TeacherProfile.hasMany(AttendanceSession, { foreignKey: 'teacherId', onDelete: 'CASCADE' });
AttendanceSession.belongsTo(TeacherProfile, { foreignKey: 'teacherId' });

// AttendanceRecord Relationships
AttendanceSession.hasMany(AttendanceRecord, { foreignKey: 'sessionId', onDelete: 'CASCADE' });
AttendanceRecord.belongsTo(AttendanceSession, { foreignKey: 'sessionId' });

StudentProfile.hasMany(AttendanceRecord, { foreignKey: 'studentId', onDelete: 'CASCADE' });
AttendanceRecord.belongsTo(StudentProfile, { foreignKey: 'studentId' });

// LeaveRequest Relationships
StudentProfile.hasMany(LeaveRequest, { foreignKey: 'studentId', onDelete: 'CASCADE' });
LeaveRequest.belongsTo(StudentProfile, { foreignKey: 'studentId' });

module.exports = {
  sequelize,
  User,
  Department,
  Subject,
  Class,
  TeacherProfile,
  StudentProfile,
  TeacherClassSubject,
  AttendanceSession,
  AttendanceRecord,
  LeaveRequest,
};
