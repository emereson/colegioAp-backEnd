const catchAsync = require('../utils/catchAsync');
const Classroom = require('../models/classroom.model');
const Student = require('../models/student.model');
const Course = require('../models/courses.model');
const Payments = require('../models/payments.model');
const AppError = require('../utils/AppError');

exports.findAll = catchAsync(async (req, res, next) => {
  const { year, aula } = req.query;

  let whereFilter = {};

  // Verifica si year no es 'undefined' y tiene más de 3 caracteres
  if (year && year !== 'undefined' && year.length > 3) {
    whereFilter.year = year;
  }

  // Verifica si aula no es 'undefined' y tiene más de 3 caracteres
  if (aula && aula !== 'undefined' && aula.length > 3) {
    whereFilter.name = aula;
  }

  const classroom = await Classroom.findAll({
    where: whereFilter,
    order: [['name', 'ASC']],
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
  const { name, tutor, year } = req.body;

  const validExistClassroom = await Classroom.findOne({
    where: {
      name,
      year,
    },
  });

  if (validExistClassroom) {
    return next(
      new AppError(`El aula de ${name} ${year} ya está registrada.`, 409)
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
