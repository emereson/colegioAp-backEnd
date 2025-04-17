const catchAsync = require('../utils/catchAsync');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../utils/firebase');
const Notifications = require('../models/notifications.model');

exports.findAll = catchAsync(async (req, res, next) => {
  const notifications = await Notifications.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: notifications.length,
    notifications,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { title } = req.body;

  const imgRef = ref(
    storage,
    `notificationImg/${Date.now()}-${req.file.originalname}`
  );

  await uploadBytes(imgRef, req.file.buffer);

  const imgUploaded = await getDownloadURL(imgRef);

  const notification = await Notifications.create({
    title,
    notificationImg: imgUploaded,
  });

  res.status(201).json({
    status: 'success',
    message: 'the notification has ben created successfully!',
    notification,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { notification } = req;

  return res.status(200).json({
    status: 'Success',
    notification,
  });
});
exports.update = catchAsync(async (req, res) => {
  const { notification } = req;
  const { title } = req.body;

  if (req.file) {
    const imgRef = ref(
      storage,
      `notificationImg/${Date.now()}-${req.file.originalname}`
    );

    await uploadBytes(imgRef, req.file.buffer);

    const imgUploaded = await getDownloadURL(imgRef);

    await notification.update({
      title,
      notificationImg: imgUploaded,
    });
  } else {
    await notification.update({
      title,
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'the notification has ben update successfully!',
    notification,
  });
});
exports.delete = catchAsync(async (req, res) => {
  const { notification } = req;

  await notification.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${notification.id} has been deleted`,
    notification,
  });
});
