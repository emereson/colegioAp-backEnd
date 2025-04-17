const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const Archivo = require('./archivos.model');

exports.validExistArchivo = catchAsync(async (req, res, next) => {
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
