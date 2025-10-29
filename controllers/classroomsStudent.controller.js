const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ClassroomsStudent = require('../models/classroomsStudents.model');
const Classroom = require('../models/classroom.model');
const Exam = require('../models/exams.model');
const Course = require('../models/course.model');
const Student = require('../models/student.model');

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

exports.findAllExams = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const classroomsStudents = await ClassroomsStudent.findAll({
    where: { classroom_id: id },
    include: [
      {
        model: Exam,
        required: false,
      },
    ],
    order: [
      [{ model: Exam }, 'name', 'DESC'], // Esta es la forma correcta de ordenar modelos incluidos
    ],
  });

  if (!classroomsStudents.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'No se encontraron registros para ese aula',
    });
  }

  const estudianteConMasExamenes = classroomsStudents.reduce((max, current) => {
    return (current.exams?.length || 0) > (max.exams?.length || 0)
      ? current
      : max;
  });

  return res.status(200).json({
    status: 'success',
    message: 'Estudiante con más exámenes encontrado',
    estudianteConMasExamenes,
  });
});

exports.findAllNotas = catchAsync(async (req, res, next) => {
  const { id, nameExam } = req.params;

  const classroomsStudents = await ClassroomsStudent.findAll({
    where: { classroom_id: id },
    include: [
      {
        model: Exam,
        where: { name: nameExam },
        required: false,
        include: [{ model: Course }],
      },
      {
        model: Student,
        where: { status: 'activo' },
        attributes: { exclude: ['password'] },
      },
      { model: Classroom },
    ],
    order: [
      [{ model: Student }, 'lastName', 'ASC'],
      [{ model: Exam }, { model: Course }, 'name', 'ASC'],
    ],
  });

  // Encontrar el estudiante con más cursos (sumando todos los exams -> courses)
  let estudianteMax = null;
  let maxCursosCount = -1;

  for (const estudiante of classroomsStudents) {
    const exams = estudiante.exams || [];

    let totalCourses = 0;
    for (const exam of exams) {
      totalCourses += exam.courses?.length || 0;
    }

    if (totalCourses > maxCursosCount) {
      maxCursosCount = totalCourses;
      estudianteMax = estudiante;
    }
  }

  const newData = {
    classroomsStudents,
    estudianteMax,
  };

  return res.status(200).json({
    status: 'success',
    message: 'Estudiante con más exámenes/cursos encontrado',
    notas: newData,
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
