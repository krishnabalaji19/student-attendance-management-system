const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "B.Tech CS 3rd Year"
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "Section A"
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. "2025-2026"
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Class;
