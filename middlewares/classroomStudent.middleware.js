const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const ClassroomsStudent = require('../models/classroomsStudents.model');
const Exam = require('../models/exams.model');
const Attendance = require('../models/attendance.model');
const Course = require('../models/course.model');
const Classroom = require('../models/classroom.model');

exports.validExistClassroomsStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const classroom = await ClassroomsStudent.findOne({
    where: {
      id,
    },
  });

  if (!classroom) {
    return next(new AppError(`Data of the classroom not found`, 404));
  }

  req.classroom = classroom;
  next();
});
('');

exports.validExistClassroomsStudentIncluide = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const classroom = await ClassroomsStudent.findOne({
      where: { id },
      include: [
        {
          model: Exam,
          include: [{ model: Course }],
        },
        { model: Attendance },
      ],
      order: [[Exam, Course, 'name', 'ASC']],
    });

    if (!classroom) {
      return next(new AppError(`Data of the classroom not found`, 404));
    }

    req.classroom = classroom;
    next();
  }
);
