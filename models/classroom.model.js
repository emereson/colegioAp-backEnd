import { DataTypes } from 'sequelize';
import db from '../database/config.js';

const Classroom = db.define('classroom', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tutor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Classroom;
