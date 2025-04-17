const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Attendance = db.define('attendance', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  classroomId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  classroom_student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Puntual', 'Tarde', 'Falta', 'Permiso'),
    allowNull: false,
    defaultValue: 'Puntual',
  },
});

module.exports = Attendance;
