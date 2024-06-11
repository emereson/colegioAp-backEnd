const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

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

module.exports = GaleryPhotosImg;
