const Attendance = require('../models/attendance.model');
const Classroom = require('../models/classroom.model');
const ClassroomsStudent = require('../models/classroomsStudents.model');
const Course = require('../models/course.model');
const Debts = require('../models/debts.model');
const Exam = require('../models/exams.model');
const Payments = require('../models/payments.model');
const Archivo = require('../modules/archivos/archivos.model');
const StudentFiles = require('../modules/studentFiles/studentFiles.model');
const catchAsync = require('../utils/catchAsync');
const FormData = require('form-data');
const { default: axios } = require('axios');

exports.findAllAttendances = catchAsync(async (req, res, next) => {
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

exports.findAllExams = catchAsync(async (req, res, next) => {
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

exports.findAllPays = catchAsync(async (req, res, next) => {
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

exports.findAllDebts = catchAsync(async (req, res, next) => {
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

exports.findAllFiles = catchAsync(async (req, res, next) => {
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

exports.findAllStudentFiles = catchAsync(async (req, res, next) => {
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

exports.createdStudentFile = catchAsync(async (req, res, next) => {
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
