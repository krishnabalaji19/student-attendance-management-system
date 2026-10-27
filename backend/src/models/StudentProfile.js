const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentProfile = sequelize.define('StudentProfile', {
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
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parentName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  parentPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = StudentProfile;
