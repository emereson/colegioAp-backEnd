import catchAsync from '../utils/catchAsync.js';
import FormData from 'form-data';
import axios from 'axios';

import Attendance from '../models/attendance.model.js';
import Classroom from '../models/classroom.model.js';
import ClassroomsStudent from '../models/classroomsStudents.model.js';
import Course from '../models/course.model.js';
import Debts from '../models/debts.model.js';
import Exam from '../models/exams.model.js';
import Payments from '../models/payments.model.js';
import Archivo from '../modules/archivos/archivos.model.js';
import StudentFiles from '../modules/studentFiles/studentFiles.model.js';

export const findAllAttendances = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const attendances = await Attendance.findAll({
    where: { classroom_student_id: id },
    include: [{ model: ClassroomsStudent, include: [{ model: Classroom }] }],
  });

  return res.status(200).json({
    status: 'success',
    message: 'All attendances successfully',
    attendances,
  });
});

export const findAllExams = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const exams = await Exam.findAll({
    where: { classroom_student_id: id },
    include: [{ model: Course }],
  });

  return res.status(200).json({
    status: 'success',
    message: 'All exams successfully',
    exams,
  });
});

export const findAllPays = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const pays = await Payments.findAll({
    where: { classroom_student_id: id },
  });

  return res.status(200).json({
    status: 'success',
    message: 'All pays successfully',
    pays,
  });
});

export const findAllDebts = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const debts = await Debts.findAll({
    where: { studentId: id },
  });

  return res.status(200).json({
    status: 'success',
    message: 'All debts successfully',
    debts,
  });
});

export const findAllFiles = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const files = await Archivo.findAll({
    where: { classroom_id: id },
  });

  return res.status(200).json({
    status: 'success',
    message: 'All files successfully',
    files,
  });
});

export const findAllStudentFiles = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const files = await StudentFiles.findAll({
    where: { classroom_student_id: id },
  });

  return res.status(200).json({
    status: 'success',
    message: 'All files successfully',
    files,
  });
});

export const createdStudentFile = catchAsync(async (req, res, next) => {
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
    message: 'the studentFile has ben created successfully!',
    studentFile,
  });
});
