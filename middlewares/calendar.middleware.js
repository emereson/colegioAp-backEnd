import Calendar from '../models/calendar.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistCalendar = catchAsync(async (req, res, next) => {
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
