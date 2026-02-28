import { DataTypes } from 'sequelize';
import db from '../../../database/config.js';
import { toUpper } from '../../../utils/multer.js';

const Evaluaciones = db.define('evaluaciones', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  aula_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre_evaluacion: {
    type: DataTypes.STRING,
    allow: false,
    set(value) {
      this.setDataValue('nombre_evaluacion', toUpper(value));
    },
  },
  semana_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_disponible: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  limite_tiempo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  puntos: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  preguntas_disponibles: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ACTIVO', 'CULMINADO', 'CANCELADO'),
    allowNull: false,
    defaultValue: 'ACTIVO',
  },
});

export default Evaluaciones;
