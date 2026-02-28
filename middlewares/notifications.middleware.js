import Notifications from '../models/notifications.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistNotifications = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notifications.findOne({
    where: {
      id,
    },
  });
  if (!notification) {
    return next(new AppError(`data of the notification not found`, 404));
  }
  req.notification = notification;
  next();
});
