const catchAsync = require('../utils/catchAsync');
const Attendance = require('../models/attendance.model');

exports.findAll = catchAsync(async (req, res, next) => {
  const assists = await Attendance.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: assists.length,
    assists,
  });
});

exports.findAllAttendanceClassroom = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const assists = await Attendance.findAll({
    where: {
      classroomId: id,
    },
  });

  return res.status(200).json({
    status: 'Success',
    results: assists.length,
    assists,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, date } = req.body;

  const attendance = await Attendance.create({
    classroomId: id,
    status,
    date,
  });

  res.status(201).json({
    status: 'success',
    message: 'the attendance has ben created successfully!',
    attendance,
  });
});

exports.update = catchAsync(async (req, res) => {
  const { attendance } = req;
  const { status } = req.body;

  await attendance.update({
    status,
  });

  return res.status(200).json({
    status: 'success',
    message: 'User attendance has been updated',
    attendance,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { attendance } = req;

  return res.status(200).json({
    status: 'success',
    attendance,
  });
});
