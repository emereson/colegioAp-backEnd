const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Exam = require('../models/exam.model');

exports.validExistExam = catchAsync(async (req, res, next) => {
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
