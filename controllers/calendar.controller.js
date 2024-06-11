const catchAsync = require('../utils/catchAsync');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../utils/firebase');
const Calendar = require('../models/calendar.model');

exports.findAll = catchAsync(async (req, res, next) => {
  const calendars = await Calendar.findAll();

  return res.status(200).json({
    status: 'Success',
    results: calendars.length,
    calendars,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const imgRef = ref(
    storage,
    `calendarImg/${Date.now()}-${req.file.originalname}`
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

exports.findOne = catchAsync(async (req, res, next) => {
  const { calendar } = req;

  return res.status(200).json({
    status: 'Success',
    calendar,
  });
});
exports.update = catchAsync(async (req, res) => {
  const { calendar } = req;
  const { name } = req.body;

  const imgRef = ref(
    storage,
    `calendarImg/${Date.now()}-${req.file.originalname}`
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
exports.delete = catchAsync(async (req, res) => {
  const { calendar } = req;

  await calendar.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${calendar.id} has been deleted`,
    calendar,
  });
});
