const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeacherClassSubject = sequelize.define('TeacherClassSubject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = TeacherClassSubject;
