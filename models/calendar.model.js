const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

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

module.exports = Calendar;
