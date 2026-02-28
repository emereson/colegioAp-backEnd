import AppError from '../../../utils/AppError.js';
import catchAsync from '../../../utils/catchAsync.js';
import SemanaEvaluacion from './semanaEvaluacion.model.js';

export const validExistSemanaEvaluacion = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const semanaEvaluacion = await SemanaEvaluacion.findOne({
    where: {
      id,
    },
  });
  if (!semanaEvaluacion) {
    return next(new AppError(`data of the semanaEvaluacion not found`, 404));
  }
  req.semanaEvaluacion = semanaEvaluacion;
  next();
});
