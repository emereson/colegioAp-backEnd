const catchAsync = require('../utils/catchAsync');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../utils/firebase');
const GaleryPhotosImg = require('../models/galeryPhotosImg');
const GaleryPhotos = require('../models/galeryPhotos.model');

exports.findAll = catchAsync(async (req, res, next) => {
  const galeryPhotos = await GaleryPhotos.findAll({
    include: [
      {
        model: GaleryPhotosImg,
      },
    ],
  });
  return res.status(200).json({
    status: 'success',
    results: galeryPhotos.length,
    galeryPhotos,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { galeryPhotos } = req;

  return res.status(200).json({
    status: 'success',
    galeryPhotos,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const galeryPhotos = await GaleryPhotos.create({
    name,
  });
  const galleryImgsPromises = req.files.map(async (file) => {
    const imgRef = ref(
      storage,
      `galleryImgUrl/${Date.now()}-${file.originalname}`
    );
    await uploadBytes(imgRef, file.buffer);

    const imgUploaded = await getDownloadURL(imgRef);

    return await GaleryPhotosImg.create({
      galeryPhotosId: galeryPhotos.id,
      galleryImgUrl: imgUploaded,
    });
  });

  await Promise.all(galleryImgsPromises);

  return res.status(201).json({
    estado: 'Éxito',
    mensaje: 'Fotos creadas exitosamente',
    galeryPhotos,
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  const { galeryPhotos } = req;

  await galeryPhotos.destroy();

  return res.status(200).json({
    status: 'success',
    message: 'galeryPhotos has been delete',
    galeryPhotos,
  });
});
