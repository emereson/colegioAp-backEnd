import { DataTypes } from 'sequelize';
import db from '../database/config.js';

const Calendar = db.define('calendar', {
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
  calendarImg: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default Calendar;
