const Notifications = require('../models/notifications.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.validExistNotifications = catchAsync(async (req, res, next) => {
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
