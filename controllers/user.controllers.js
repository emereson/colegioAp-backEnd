import User from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import bcrypt from 'bcryptjs';
import generateJWT from '../utils/jwt.js';
import AppError from '../utils/AppError.js';

export const findAll = catchAsync(async (req, res, next) => {
  const users = await User.findAll({});

  return res.status(200).json({
    status: 'Success',
    results: users.length,
    users,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { user } = req;

  return res.status(200).json({
    status: 'Success',
    user,
  });
});

export const signup = catchAsync(async (req, res, next) => {
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
    message: 'The user has been created successfully!',
    token,
    user,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { dni, password } = req.body;

  const user = await User.findOne({
    where: {
      dni,
    },
  });

  if (!user) {
    return next(new AppError('El dni no se encuentra registrado', 404));
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Contraseña incorrecta', 401));
  }

  const token = await generateJWT(user.id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

export const update = catchAsync(async (req, res) => {
  const { name, lastName, dni, role, password } = req.body;
  const { user } = req;

  const updateData = {
    name,
    lastName,
    dni,
    role,
  };

  if (password && password !== 'undefined' && password.length > 3) {
    const salt = await bcrypt.genSalt(12);
    updateData.password = await bcrypt.hash(password, salt);
  }

  await user.update(updateData);

  return res.status(200).json({
    status: 'success',
    message: 'User information has been updated',
    user,
  });
});

export const remove = catchAsync(async (req, res) => {
  const { user } = req;
  await user.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${user.id} has been deleted`,
    user,
  });
});
