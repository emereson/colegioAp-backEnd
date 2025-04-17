const catchAsync = require('../utils/catchAsync');
const Course = require('../models/course.model');
const Classroom = require('../models/classroom.model');

exports.findAll = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    status: 'success',
    message: 'All payments successfully retrieved',
  });
});

exports.createStudens = catchAsync(async (req, res, next) => {
  const { exams_id, name } = req.body;

  await Promise.all(
    exams_id.map(
      async (id) =>
        await Course.create({
          exam_id: id,
          name,
        })
    )
  );
  return res.status(201).json({
    status: 'Success',
    message: 'course created successfully',
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { exam_id, name } = req.body;

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

exports.updateNotas = catchAsync(async (req, res, next) => {
  const { notas } = req.body;

  if (!notas || !Array.isArray(notas)) {
    return next(new AppError('Invalid or missing notas data', 400));
  }

  // Use Promise.all to process updates concurrently
  await Promise.all(
    notas.map(async ({ id, note }) => {
      if (!id) return;
      await Course.update(
        { note }, // Values to update
        {
          where: { id }, // Where condition
          individualHooks: true, // Run validators if you have any
        }
      );
    })
  );

  return res.status(200).json({
    status: 'success',
    message: 'All courses have been updated successfully',
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
