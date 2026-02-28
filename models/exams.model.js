import { DataTypes } from 'sequelize';
import db from '../database/config.js';

const Exam = db.define('exam', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },

  classroom_student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teacher: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Exam;
