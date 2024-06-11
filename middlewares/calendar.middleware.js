const Calendar = require('../models/calendar.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.validExistCalendar = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const calendar = await Calendar.findOne({
    where: {
      id,
    },
  });
  if (!calendar) {
    return next(new AppError(`data of the calendar not found`, 404));
  }
  req.calendar = calendar;
  next();
});
