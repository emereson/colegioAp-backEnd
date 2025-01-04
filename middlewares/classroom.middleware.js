const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const Classroom = require('../models/classroom.model');
const Course = require('../models/courses.model');
const Exam = require('../models/exam.model');
const Payments = require('../models/payments.model');
const Attendance = require('../models/attendance.model');

exports.validExistClassroom = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const classroom = await Classroom.findOne({
    where: {
      id,
    },
    include: [
      { model: Course, include: { model: Exam } },
      { model: Payments },
      { model: Attendance },
    ],
  });

  if (!classroom) {
    return next(new AppError(`Data of the classroom not found`, 404));
  }

  req.classroom = classroom;
  next();
});
