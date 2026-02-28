import catchAsync from '../utils/catchAsync.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Notifications from '../models/notifications.model.js';
import storage from '../utils/firebase.js';

export const findAll = catchAsync(async (req, res, next) => {
  const notifications = await Notifications.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: notifications.length,
    notifications,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { title } = req.body;

  const imgRef = ref(
    storage,
    `notificationImg/${Date.now()}-${req.file.originalname}`,
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

export const findOne = catchAsync(async (req, res, next) => {
  const { notification } = req;

  return res.status(200).json({
    status: 'Success',
    notification,
  });
});
export const update = catchAsync(async (req, res) => {
  const { notification } = req;
  const { title } = req.body;

  if (req.file) {
    const imgRef = ref(
      storage,
      `notificationImg/${Date.now()}-${req.file.originalname}`,
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
export const remove = catchAsync(async (req, res) => {
  const { notification } = req;

  await notification.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${notification.id} has been deleted`,
    notification,
  });
});
