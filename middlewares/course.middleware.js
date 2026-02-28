import Course from '../models/course.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
export const validExistCourse = catchAsync(async (req, res, next) => {
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
