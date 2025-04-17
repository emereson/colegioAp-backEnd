const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const Classroom = require('../models/classroom.model');

exports.validExistClassroom = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const classroom = await Classroom.findOne({
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
