import { DataTypes } from 'sequelize';
import db from '../../database/config.js';

const Archivo = db.define('archivos', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },

  classroom_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  name_archivo: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  archivo_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default Archivo;
