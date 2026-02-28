import catchAsync from '../utils/catchAsync.js';
import Attendance from '../models/attendance.model.js';
import ClassroomsStudent from '../models/classroomsStudents.model.js';
import Student from '../models/student.model.js';
import Classroom from '../models/classroom.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const assists = await Attendance.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: assists.length,
    assists,
  });
});

export const findAllAttendance = catchAsync(async (req, res, next) => {
  const { id, fecha } = req.params;

  const classroomsStudents = await ClassroomsStudent.findAll({
    where: { classroom_id: id },
    include: [
      {
        model: Attendance,
        required: false,
        where: { date: fecha },
      },
      {
        model: Student,
        where: { status: 'activo' },
        attributes: { exclude: ['password'] },
      },
      { model: Classroom },
    ],
    order: [[{ model: Student }, 'lastName', 'ASC']],
  });

  return res.status(200).json({
    status: 'success',
    message: 'Estudiante con más exámenes/cursos encontrado',
    notas: classroomsStudents,
  });
});

export const createsOrUpdates = catchAsync(async (req, res, next) => {
  const { fecha, asistencias } = req.body;

  await Promise.all(
    asistencias.map(async ({ classroom_student_id, asistencia_id, status }) => {
      if (asistencia_id) {
        await Attendance.update(
          { status },
          {
            where: { id: asistencia_id },
            individualHooks: true,
          },
        );
      } else {
        await Attendance.create({
          classroom_student_id,
          date: fecha,
          status,
        });
      }
    }),
  );

  res.status(201).json({
    status: 'success',
    message: 'the attendance has ben created successfully!',
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, date } = req.body;

  const attendance = await Attendance.create({
    classroomId: id,
    status,
    date,
  });

  res.status(201).json({
    status: 'success',
    message: 'the attendance has ben created successfully!',
    attendance,
  });
});

export const update = catchAsync(async (req, res) => {
  const { attendance } = req;
  const { status } = req.body;

  await attendance.update({
    status,
  });

  return res.status(200).json({
    status: 'success',
    message: 'User attendance has been updated',
    attendance,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { attendance } = req;

  return res.status(200).json({
    status: 'success',
    attendance,
  });
});
