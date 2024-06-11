const catchAsync = require('../utils/catchAsync');
const Classroom = require('../models/classroom.model');
const Student = require('../models/student.model');
const Course = require('../models/courses.model');
const Payments = require('../models/payments.model');

exports.findAll = catchAsync(async (req, res, next) => {
  const classroom = await Classroom.findAll({});

  return res.status(200).json({
    status: 'success',
    message: 'All classroom successfully',
    classroom,
  });
});

exports.findAllStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const classroom = await Classroom.findAll({
    where: {
      studentId: id,
    },

    include: [
      { model: Course },
      {
        model: Payments,
      },
      { model: Student },
    ],
  });

  return res.status(200).json({
    status: 'success',
    message: 'All classroom successfully',
    classroom,
  });
});

exports.findAllStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const classroom = await Classroom.findAll({
    where: {
      studentId: id,
    },

    include: [
      { model: Course },
      {
        model: Payments,
      },
      { model: Student },
    ],
  });

  return res.status(200).json({
    status: 'success',
    message: 'All classroom successfully',
    classroom,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, tutor } = req.body;

  const classroom = await Classroom.create({
    studentId: id,
    name,
    tutor,
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
