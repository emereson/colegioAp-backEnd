import AppError from '../../../utils/AppError.js';
import catchAsync from '../../../utils/catchAsync.js';
import ResultadosEvaluacion from './resultadosEvaluacion.model.js';

export const validExistResultadosEvaluacion = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const resultadoPrevio = await ResultadosEvaluacion.findOne({
      where: {
        id,
      },
    });
    if (!resultadoPrevio) {
      return next(new AppError(`data of the evaluacion not found`, 404));
    }
    req.resultadoPrevio = resultadoPrevio;
    next();
  },
);
