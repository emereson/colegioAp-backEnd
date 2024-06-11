const CourseExam = require('../models/courseExam.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.validExistCourseExam = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const courseExam = await CourseExam.findOne({
    where: {
      id,
    },
  });
  if (!courseExam) {
    return next(new AppError(`data of the courseExam not found`, 404));
  }
  req.courseExam = courseExam;
  next();
});
