const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');
const StudentFiles = require('./studentFiles.model');

exports.validExistStudentFiles = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const studentFile = await StudentFiles.findOne({
    where: {
      id,
    },
  });
  if (!studentFile) {
    return next(new AppError(`data of the studentFile not found`, 404));
  }
  req.studentFile = studentFile;
  next();
});
