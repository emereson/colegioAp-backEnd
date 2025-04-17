const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Course = db.define('course', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('name', value.toUpperCase());
    },
  },
  note: {
    type: DataTypes.STRING,
    defaultValue: '0',
    allowNull: false,
  },
});

module.exports = Course;
