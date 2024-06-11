const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courses.model');

exports.findAll = catchAsync(async (req, res, next) => {
  const courses = await Course.findAll({});

  return res.status(200).json({
    status: 'success',
    message: 'All courses  successfully',
    courses,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, teacher } = req.body;

  const course = await Course.create({
    classroomId: id,
    name,
    teacher,
  });

  return res.status(201).json({
    status: 'Success',
    message: 'course created successfully',
    course,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { course } = req;

  return res.status(200).json({
    status: 'success',
    course,
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const { course } = req;
  const { name, teacher } = req.body;

  await course.update({
    name,
    teacher,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the course has been updated',
    course,
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  const { course } = req;

  await course.destroy();

  return res.status(200).json({
    status: 'success',
    message: 'the course has been delete',
    course,
  });
});
