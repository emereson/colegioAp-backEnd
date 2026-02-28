import { DataTypes } from 'sequelize';
import db from '../database/config.js';

const Payments = db.define('payments', {
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
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Payments;
