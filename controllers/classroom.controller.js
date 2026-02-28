import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

import Classroom from '../models/classroom.model.js';
import Student from '../models/student.model.js';
import Course from '../models/exams.model.js';
import Payments from '../models/payments.model.js';
import ClassroomsStudent from '../models/classroomsStudents.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { year, aula } = req.query;

  let whereFilter = {};

  if (year && year !== 'undefined' && year.length > 3) {
    whereFilter.year = year;
  }

  if (aula && aula !== 'undefined' && aula.length > 3) {
    whereFilter.name = aula;
  }

  const classroom = await Classroom.findAll({
    where: whereFilter,
    order: [['name', 'ASC']],
    include: [{ model: ClassroomsStudent }],
  });

  return res.status(200).json({
    status: 'success',
    message: 'All classroom successfully',
    classroom,
  });
});

export const findAllStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const classroom = await Classroom.findAll({
    where: {
      studentId: id,
    },
    include: [{ model: Course }, { model: Payments }, { model: Student }],
  });

  return res.status(200).json({
    status: 'success',
    message: 'All classroom successfully',
    classroom,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { name, tutor, year } = req.body;

  const validExistClassroom = await Classroom.findOne({
    where: {
      name,
      year,
    },
  });

  if (validExistClassroom) {
    return next(
      new AppError(`El aula de ${name} ${year} ya está registrada.`, 409),
    );
  }

  const classroom = await Classroom.create({
    name,
    tutor,
    year,
  });

  return res.status(201).json({
    status: 'Success',
    message: 'classroom created successfully',
    classroom,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { classroom } = req;

  return res.status(200).json({
    status: 'success',
    classroom,
  });
});

export const update = catchAsync(async (req, res, next) => {
  const { classroom } = req;
  const { name, tutor, year } = req.body;

  await classroom.update({
    name,
    tutor,
    year,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the classroom has been updated',
    classroom,
  });
});

export const remove = catchAsync(async (req, res, next) => {
  const { classroom } = req;

  await classroom.destroy();

  return res.status(200).json({
    status: 'success',
    message: 'the classroom has been deleted',
    classroom,
  });
});
