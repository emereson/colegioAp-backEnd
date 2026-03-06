import { DataTypes, Op } from 'sequelize'; // 👈 Importamos Op para comparaciones
import db from '../../../database/config.js';
import { toUpper } from '../../../utils/multer.js';

const Evaluaciones = db.define(
  'evaluaciones',
  {
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
      allowNull: false,
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
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO', 'CANCELADO'),
      allowNull: false,
      defaultValue: 'ACTIVO',
    },
  },
  {
    hooks: {
      beforeSave: (evaluacion) => {
        const inicio = new Date(evaluacion.fecha_disponible);
        const fin = new Date(evaluacion.fecha_entrega);

        if (inicio >= fin) {
          throw new Error(
            'Error: La fecha de apertura debe ser estrictamente anterior a la fecha de entrega.',
          );
        }
      },

      afterFind: async () => {
        const now = new Date();

        await Evaluaciones.update(
          { status: 'INACTIVO' },
          {
            where: {
              status: 'ACTIVO',
              fecha_entrega: { [Op.lt]: now }, // [Op.lt] significa "Less Than" (menor que ahora)
            },
          },
        ).catch((err) => {
          console.error(
            '⚠️ Error en la auto-culminación de exámenes:',
            err.message,
          );
        });
      },
    },
  },
);

export default Evaluaciones;
