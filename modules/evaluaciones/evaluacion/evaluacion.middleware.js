import AppError from '../../../utils/AppError.js';
import catchAsync from '../../../utils/catchAsync.js';
import PreguntaEvaluacion from '../preguntasEvaluacion/preguntaEvaluacion.model.js';
import Evaluaciones from './evaluacion.model.js';

export const validExistEvaluaciones = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const evaluacion = await Evaluaciones.findOne({
    where: {
      id,
    },
    include: [{ model: PreguntaEvaluacion, as: 'preguntas_evaluacion' }],
  });
  if (!evaluacion) {
    return next(new AppError(`data of the evaluacion not found`, 404));
  }
  req.evaluacion = evaluacion;
  next();
});
