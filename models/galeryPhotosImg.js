import { DataTypes } from 'sequelize';
import db from '../database/config.js';

const GaleryPhotosImg = db.define('galeryPhotosImg', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  galeryPhotosId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  galleryImgUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default GaleryPhotosImg;
