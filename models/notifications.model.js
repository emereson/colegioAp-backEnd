import { DataTypes } from 'sequelize';
import db from '../database/config.js';

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

export default Notifications;
