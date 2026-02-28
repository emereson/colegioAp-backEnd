import catchAsync from '../utils/catchAsync.js';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import storage from '../utils/firebase.js';
import Calendar from '../models/calendar.model.js';

export const findAll = catchAsync(async (req, res, next) => {
  const calendars = await Calendar.findAll();

  return res.status(200).json({
    status: 'Success',
    results: calendars.length,
    calendars,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const imgRef = ref(
    storage,
    `calendarImg/${Date.now()}-${req.file.originalname}`,
  );

  await uploadBytes(imgRef, req.file.buffer);

  const imgUploaded = await getDownloadURL(imgRef);

  const calendar = await Calendar.create({
    name,
    calendarImg: imgUploaded,
  });

  res.status(201).json({
    status: 'success',
    message: 'the calendar has ben created successfully!',
    calendar,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { calendar } = req;

  return res.status(200).json({
    status: 'Success',
    calendar,
  });
});
export const update = catchAsync(async (req, res) => {
  const { calendar } = req;
  const { name } = req.body;

  const imgRef = ref(
    storage,
    `calendarImg/${Date.now()}-${req.file.originalname}`,
  );

  await uploadBytes(imgRef, req.file.buffer);

  const imgUploaded = await getDownloadURL(imgRef);

  await calendar.update({
    name,
    calendarImg: imgUploaded,
  });

  res.status(201).json({
    status: 'success',
    message: 'the calendar has ben update successfully!',
    calendar,
  });
});
export const remove = catchAsync(async (req, res) => {
  const { calendar } = req;

  await calendar.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${calendar.id} has been deleted`,
    calendar,
  });
});
