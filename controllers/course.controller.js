import catchAsync from '../utils/catchAsync.js';

import Course from '../models/course.model.js';
import AppError from '../utils/AppError.js';

export const findAll = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    status: 'success',
    message: 'All payments successfully retrieved',
  });
});

export const createStudens = catchAsync(async (req, res, next) => {
  const { exams_id, name } = req.body;

  await Promise.all(
    exams_id.map(async (id) =>
      Course.create({
        exam_id: id,
        name,
      }),
    ),
  );

  return res.status(201).json({
    status: 'Success',
    message: 'course created successfully',
  });
});

export const create = catchAsync(async (req, res, next) => {
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

export const findOne = catchAsync(async (req, res, next) => {
  const { course } = req;

  return res.status(200).json({
    status: 'success',
    course,
  });
});

export const updateNotas = catchAsync(async (req, res, next) => {
  const { notas } = req.body;

  if (!notas || !Array.isArray(notas)) {
    return next(new AppError('Invalid or missing notas data', 400));
  }

  await Promise.all(
    notas.map(async ({ id, note }) => {
      if (!id) return;

      await Course.update(
        { note },
        {
          where: { id },
          individualHooks: true,
        },
      );
    }),
  );

  return res.status(200).json({
    status: 'success',
    message: 'All courses have been updated successfully',
  });
});

export const update = catchAsync(async (req, res, next) => {
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

export const remove = catchAsync(async (req, res, next) => {
  const { course } = req;

  await course.destroy();

  return res.status(200).json({
    status: 'success',
    message: 'the course has been deleted',
    course,
  });
});
