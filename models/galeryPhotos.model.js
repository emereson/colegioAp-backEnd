const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

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

module.exports = GaleryPhotos;
