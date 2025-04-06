const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courses.model');
const Classroom = require('../models/classroom.model');
const ClassroomsStudent = require('../models/classroomsStudents.model');
const { where } = require('sequelize');
const Student = require('../models/student.model');

exports.findAll = catchAsync(async (req, res, next) => {
  // Todos los cursos del aula "2DO SECUNDARIA 2024"
  const coursesFiltres = await Course.findAll({
    include: [
      {
        model: Classroom,
        where: { name: '6TO PRIMARIA 2024' },
      },
      // {
      //   model: ClassroomsStudent,
      //   include: [{ model: Classroom }],
      // },
    ],
    order: [['classroomId', 'ASC']],
  });

  // Todas las relaciones estudiantes-aulas del aula 132
  // const classroomsStudent = await ClassroomsStudent.findAll({
  //   where: { classroom_id: 138 }, // mejor filtrar aquí
  // });

  // for (const curso of coursesFiltres) {
  //   const findCurso = await Course.findOne({ where: { id: curso.id } });

  //   for (const classroom of classroomsStudent) {
  //     if (classroom.student_id === curso.classroom.student_id) {
  //       findCurso.update({ classroom_student_id: classroom.id });
  //     }
  //   }
  // }

  return res.status(200).json({
    status: 'success',
    message: 'All courses successfully',
    coursesFiltres,
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
