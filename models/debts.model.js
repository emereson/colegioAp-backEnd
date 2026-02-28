import { DataTypes } from 'sequelize';
import db from '../database/config.js';

const Debts = db.define('debts', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM('Pendiente', 'Cancelada'),
    allowNull: false,
    defaultValue: 'Pendiente',
  },
});

export default Debts;
