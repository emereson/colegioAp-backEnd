const FormData = require('form-data');
const catchAsync = require('../../utils/catchAsync');
const { default: axios } = require('axios');
const StudentFiles = require('./studentFiles.model');
const logger = require('../../utils/logger');

exports.findAll = catchAsync(async (req, res, next) => {
  const studentFiles = await StudentFiles.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: studentFiles.length,
    studentFiles,
  });
});
exports.findAllClassroom = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const studentFiles = await StudentFiles.findAll({
    where: { classroom_student_id: id },
    order: [['id', 'ASC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: studentFiles.length,
    studentFiles,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { studentFile } = req;

  return res.status(200).json({
    status: 'Success',
    studentFile,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name_student_file } = req.body;

  let file_url = null;

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

    file_url = responseImg.data.imagePath;
  }
  const studentFile = await StudentFiles.create({
    classroom_student_id: id,
    name_student_file,
    file_url,
  });

  res.status(201).json({
    status: 'success',
    message: 'the studentFile has ben created successfully!',
    studentFile,
  });
});

exports.update = catchAsync(async (req, res) => {
  const { studentFile } = req;
  const { title } = req.body;

  if (req.file) {
    const imgRef = ref(
      storage,
      `studentFileImg/${Date.now()}-${req.file.originalname}`
    );

    await uploadBytes(imgRef, req.file.buffer);

    const imgUploaded = await getDownloadURL(imgRef);

    await studentFile.update({
      title,
      studentFileImg: imgUploaded,
    });
  } else {
    await studentFile.update({
      title,
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'the studentFile has ben update successfully!',
    studentFile,
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { studentFile } = req;
  const studentFile_url = studentFile.file_url;

  try {
    // Corregir la solicitud axios - usar axios.delete en lugar de axios.post
    await axios.delete(
      `${process.env.SERVER_IMAGE}/delete-image/${studentFile_url}`
    );

    await studentFile.destroy();

    return res.status(200).json({
      status: 'success',
      message: `The studentFile with id: ${studentFile.id} has been deleted`,
      studentFile,
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
