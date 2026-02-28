import { DataTypes } from 'sequelize';
import db from '../database/config.js';

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

export default ClassroomsStudent;
