import catchAsync from '../utils/catchAsync.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import GaleryPhotosImg from '../models/galeryPhotosImg.js';
import GaleryPhotos from '../models/galeryPhotos.model.js';
import storage from '../utils/firebase.js';

export const findAll = catchAsync(async (req, res, next) => {
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

export const findOne = catchAsync(async (req, res, next) => {
  const { galeryPhotos } = req;

  return res.status(200).json({
    status: 'success',
    galeryPhotos,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const galeryPhotos = await GaleryPhotos.create({
    name,
  });
  const galleryImgsPromises = req.files.map(async (file) => {
    const imgRef = ref(
      storage,
      `galleryImgUrl/${Date.now()}-${file.originalname}`,
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

export const remove = catchAsync(async (req, res, next) => {
  const { galeryPhotos } = req;

  await galeryPhotos.destroy();

  return res.status(200).json({
    status: 'success',
    message: 'galeryPhotos has been delete',
    galeryPhotos,
  });
});
