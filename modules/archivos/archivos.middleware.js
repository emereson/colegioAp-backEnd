import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import Archivo from './archivos.model.js';

export const validExistArchivo = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const archivo = await Archivo.findOne({
    where: {
      id,
    },
  });
  if (!archivo) {
    return next(new AppError(`data of the archivo not found`, 404));
  }
  req.archivo = archivo;
  next();
});
