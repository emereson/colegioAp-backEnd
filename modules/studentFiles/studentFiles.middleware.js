import AppError from '../../utils/AppError.js';
import catchAsync from '../../utils/catchAsync.js';
import StudentFiles from './studentFiles.model.js';

export const validExistStudentFiles = catchAsync(async (req, res, next) => {
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
