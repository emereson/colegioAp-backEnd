const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Course = db.define('course', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },

  classroomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  classroom_student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  // student_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  // },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teacher: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Course;
