import AppError from '../../../utils/AppError.js';
import catchAsync from '../../../utils/catchAsync.js';
import Evaluaciones from './preguntaEvaluacion.model.js';

export const validExistEvaluaciones = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const evaluacion = await Evaluaciones.findOne({
    where: {
      id,
    },
  });
  if (!evaluacion) {
    return next(new AppError(`data of the evaluacion not found`, 404));
  }
  req.evaluacion = evaluacion;
  next();
});
