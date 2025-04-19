const Attendance = require('../models/attendance.model');
const Classroom = require('../models/classroom.model');
const ClassroomsStudent = require('../models/classroomsStudents.model');
const Course = require('../models/course.model');
const Debts = require('../models/debts.model');
const Exam = require('../models/exams.model');
const Payments = require('../models/payments.model');
const Archivo = require('../modules/archivos/archivos.model');
const catchAsync = require('../utils/catchAsync');

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
