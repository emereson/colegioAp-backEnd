import Classroom from '../../../models/classroom.model.js';
import catchAsync from '../../../utils/catchAsync.js';
import Evaluaciones from '../evaluacion/evaluacion.model.js';
import SemanaEvaluacion from './semanaEvaluacion.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const semanasEvaluaciones = await SemanaEvaluacion.findAll({
    order: [['id', 'ASC']],
    include: [
      { model: Classroom, as: 'aula' },
      { model: Evaluaciones, as: 'evaluaciones' },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: semanasEvaluaciones.length,
    semanasEvaluaciones,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { semanaEvaluacion } = req;

  return res.status(200).json({
    status: 'Success',
    semanaEvaluacion,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { classroom } = req;
  const { nombre_semana } = req.body;

  const semanaEvaluacion = await SemanaEvaluacion.create({
    aula_id: classroom.id,
    year: classroom.year,
    nombre_semana,
  });

  res.status(201).json({
    status: 'success',
    message: 'the semanaEvaluacion has ben created successfully!',
    semanaEvaluacion,
  });
});

export const update = catchAsync(async (req, res) => {
  const { semanaEvaluacion } = req;
  const { aula_id, year, nombre_semana } = req.body;

  await semanaEvaluacion.update({ aula_id, year, nombre_semana });

  res.status(201).json({
    status: 'success',
    message: 'the studentFile has ben update successfully!',
    semanaEvaluacion,
  });
});

export const remove = catchAsync(async (req, res) => {
  const { semanaEvaluacion } = req;

  await semanaEvaluacion.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The semana Evaluacion with id: ${semanaEvaluacion.id} has been deleted`,
    semanaEvaluacion,
  });
});
