const FormData = require('form-data');
const Archivo = require('./archivos.model');
const catchAsync = require('../../utils/catchAsync');
const { default: axios } = require('axios');
const logger = require('../../utils/logger');

exports.findAll = catchAsync(async (req, res, next) => {
  const archivos = await Archivo.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: archivos.length,
    archivos,
  });
});
exports.findAllClassroom = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { classroom } = req;

  const archivos = await Archivo.findAll({ where: { classroom_id: id } });

  return res.status(200).json({
    status: 'Success',
    results: archivos.length,
    archivos,
    classroom,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { archivo } = req;

  return res.status(200).json({
    status: 'Success',
    archivo,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name_archivo } = req.body;

  let archivo_url = null;

  if (req.file) {
    const file = req.file;
    const formDataImg = new FormData();
    formDataImg.append('image', file.buffer, {
      filename: file.originalname,
    });

    const responseImg = await axios.post(
      `${process.env.SERVER_IMAGE}/image`,
      formDataImg,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    archivo_url = responseImg.data.imagePath;
  }
  const archivo = await Archivo.create({
    classroom_id: id,
    name_archivo,
    archivo_url,
  });

  res.status(201).json({
    status: 'success',
    message: 'the archivo has ben created successfully!',
    archivo,
  });
});

exports.update = catchAsync(async (req, res) => {
  const { archivo } = req;
  const { title } = req.body;

  if (req.file) {
    const imgRef = ref(
      storage,
      `archivoImg/${Date.now()}-${req.file.originalname}`
    );

    await uploadBytes(imgRef, req.file.buffer);

    const imgUploaded = await getDownloadURL(imgRef);

    await archivo.update({
      title,
      archivoImg: imgUploaded,
    });
  } else {
    await archivo.update({
      title,
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'the archivo has ben update successfully!',
    archivo,
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { archivo } = req;
  const archivo_url = archivo.archivo_url;

  try {
    // Corregir la solicitud axios - usar axios.delete en lugar de axios.post
    await axios.delete(
      `${process.env.SERVER_IMAGE}/delete-image/${archivo_url}`
    );

    await archivo.destroy();

    return res.status(200).json({
      status: 'success',
      message: `The archivo with id: ${archivo.id} has been deleted`,
      archivo,
    });
  } catch (error) {
    logger.error('Error deleting file:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Error deleting file',
      error: error.message,
    });
  }
});
