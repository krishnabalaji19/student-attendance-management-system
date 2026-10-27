const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeacherProfile = sequelize.define('TeacherProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  designation: {
    type: DataTypes.STRING,
    defaultValue: 'Assistant Professor',
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = TeacherProfile;
