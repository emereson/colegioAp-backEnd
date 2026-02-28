import FormData from 'form-data';
import axios from 'axios';
import catchAsync from '../../utils/catchAsync.js';
import StudentFiles from './studentFiles.model.js';
import logger from '../../utils/logger.js';

export const findAll = catchAsync(async (req, res, next) => {
  const studentFiles = await StudentFiles.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: studentFiles.length,
    studentFiles,
  });
});

export const findAllClassroom = catchAsync(async (req, res, next) => {
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

export const findOne = catchAsync(async (req, res, next) => {
  const { studentFile } = req;

  return res.status(200).json({
    status: 'Success',
    studentFile,
  });
});

export const create = catchAsync(async (req, res, next) => {
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
      },
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
    message: 'the studentFile has been created successfully!',
    studentFile,
  });
});

export const update = catchAsync(async (req, res) => {
  const { studentFile } = req;
  const { title } = req.body;

  await studentFile.update({
    title,
  });

  res.status(200).json({
    status: 'success',
    message: 'the studentFile has been updated successfully!',
    studentFile,
  });
});

export const remove = catchAsync(async (req, res) => {
  const { studentFile } = req;
  const studentFile_url = studentFile.file_url;

  try {
    await axios.delete(
      `${process.env.SERVER_IMAGE}/delete-image/${studentFile_url}`,
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
