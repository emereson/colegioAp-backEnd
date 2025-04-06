const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ClassroomsStudent = require('../models/classroomsStudents.model');
const Classroom = require('../models/classroom.model');

exports.findAll = catchAsync(async (req, res, next) => {
  const { student } = req;

  const classroomsStudent = await ClassroomsStudent.findAll({
    where: { student_id: student.id },
    include: [{ model: Classroom }],
  });

  return res.status(200).json({
    status: 'success',
    message: 'All classroomsStudent successfully',
    classroomsStudent,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { student_id, classroom_id } = req.body;

  const classroom = await ClassroomsStudent.create({
    student_id,
    classroom_id,
  });

  return res.status(201).json({
    status: 'Success',
    message: 'classroom created successfully',
    classroom,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { classroom } = req;

  return res.status(200).json({
    status: 'success',
    classroom,
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const { classroom } = req;

  const { name, tutor } = req.body;

  await classroom.create({
    name,
    tutor,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the classroom has been updated',
    classroom,
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  const { classroom } = req;

  await classroom.destroy();

  return res.status(200).json({
    status: 'success',
    message: 'the classroom has been delete',
    classroom,
  });
});
