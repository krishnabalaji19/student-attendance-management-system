const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Subject;
