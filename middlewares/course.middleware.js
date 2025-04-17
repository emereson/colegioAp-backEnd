const Course = require('../models/course.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.validExistCourse = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findOne({
    where: {
      id,
    },
  });
  if (!course) {
    return next(new AppError(`data of the course not found`, 404));
  }
  req.course = course;
  next();
});
