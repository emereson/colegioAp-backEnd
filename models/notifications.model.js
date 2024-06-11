const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Notifications = db.define('notifications', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  notificationImg: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Notifications;
