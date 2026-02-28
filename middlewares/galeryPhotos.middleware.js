import GaleryPhotos from '../models/galeryPhotos.model.js';
import GaleryPhotosImg from '../models/galeryPhotosImg.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistGaleryPhotos = catchAsync(async (req, res, next) => {
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
