const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/jwt');
const AppError = require('../utils/AppError');

exports.findAll = catchAsync(async (req, res, next) => {
  const users = await User.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: users.length,
    users,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { user } = req;

  return res.status(200).json({
    status: 'Success',
    user,
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const { name, lastName, dni, password, role } = req.body;

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    lastName,
    dni,
    role,
    password: encryptedPassword,
  });

  const token = await generateJWT(user.id);

  res.status(201).json({
    status: 'success',
    message: 'the user has ben created successfully!',
    token,
    user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { dni, password } = req.body;

  const user = await User.findOne({
    where: {
      dni,
    },
  });
  if (!user) {
    return next(new AppError('the user could not be found', 404));
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = await generateJWT(user.id);

  res.status(201).json({
    status: 'success',
    token,
    user,
  });
});
exports.update = catchAsync(async (req, res) => {
  const { name, lastName, dni, role } = req.body;
  const { user } = req;

  await user.update({
    name,
    lastName,
    dni,
    role,
  });

  return res.status(200).json({
    status: 'success',
    message: 'User information has been updated',
    user,
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { user } = req;
  await user.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${user.id} has been deleted`,
    user,
  });
});
