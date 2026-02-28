import Attendance from '../models/attendance.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const attendance = await Attendance.findOne({
    where: {
      id,
    },
  });
  if (!attendance) {
    return next(new AppError(`data of the attendance not found`, 404));
  }
  req.attendance = attendance;
  next();
});
