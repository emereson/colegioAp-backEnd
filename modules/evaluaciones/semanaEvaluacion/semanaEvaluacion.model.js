import { DataTypes } from 'sequelize';
import db from '../../../database/config.js';
import { toUpper } from '../../../utils/multer.js';

const SemanaEvaluacion = db.define('semanaEvaluaciones', {
  id: {
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  aula_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  year: {
    type: DataTypes.STRING,
    allow: false,
  },
  nombre_semana: {
    type: DataTypes.STRING,
    allow: false,
    set(value) {
      this.setDataValue('nombre_semana', toUpper(value));
    },
  },
});

export default SemanaEvaluacion;
