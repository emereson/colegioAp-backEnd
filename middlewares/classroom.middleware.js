import Classroom from '../models/classroom.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistClassroom = catchAsync(async (req, res, next) => {
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
