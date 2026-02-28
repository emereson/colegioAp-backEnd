import Exam from '../models/exams.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistExam = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const exam = await Exam.findOne({
    where: {
      id,
    },
  });
  if (!exam) {
    return next(new AppError(`data of the exam not found`, 404));
  }
  req.exam = exam;
  next();
});
