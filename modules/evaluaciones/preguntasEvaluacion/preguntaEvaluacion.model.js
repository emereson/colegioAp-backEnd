import { DataTypes } from 'sequelize';
import db from '../../../database/config.js';

const PreguntaEvaluacion = db.define('preguntas_evaluaciones', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  evaluacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  titulo_pregunta: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  descripcion_pregunta: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  imagen_pregunta: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipo_pregunta: {
    type: DataTypes.ENUM('ALTERNATIVAS', 'POR RELACIONAR', 'COMPLETAR'),
    defaultValue: 'ALTERNATIVAS',
  },
  respuestas: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
});

export default PreguntaEvaluacion;
