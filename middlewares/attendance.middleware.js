const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Attendance = require('../models/attendance.model');

exports.validExistAttendance = catchAsync(async (req, res, next) => {
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
