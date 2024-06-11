const GaleryPhotos = require('../models/galeryPhotos.model');
const GaleryPhotosImg = require('../models/galeryPhotosImg');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.validExistGaleryPhotos = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const galeryPhotos = await GaleryPhotos.findOne({
    where: {
      id,
    },
    include: {
      model: GaleryPhotosImg,
    },
  });
  if (!galeryPhotos) {
    return next(new AppError(`data of the galeryPhotos not found`, 404));
  }
  req.galeryPhotos = galeryPhotos;
  req.GaleryPhotosImg = galeryPhotos.GaleryPhotosImg;
  next();
});
