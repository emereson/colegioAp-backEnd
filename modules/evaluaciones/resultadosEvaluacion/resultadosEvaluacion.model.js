import { DataTypes } from 'sequelize';
import db from '../../../database/config.js';

const ResultadosEvaluacion = db.define('resultados_evaluaciones', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  evaluacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estudiante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  aula_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  puntaje_obtenido: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  respuestas_enviadas: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  completado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  inicio_evaluacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fin_evaluacion: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  nota_final: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('EN PROCESO', 'CULMINADO', 'EXEDIO LIMITE DE TIEMPO'),
    defaultValue: 'EN PROCESO',
  },
});

export default ResultadosEvaluacion;
