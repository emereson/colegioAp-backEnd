import { DataTypes } from 'sequelize';
import db from '../database/config.js';

const GaleryPhotos = db.define('galeryPhotos', {
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
});

export default GaleryPhotos;
