const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const ClassroomsStudent = db.define('classrooms_students', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  classroom_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = ClassroomsStudent;
