import catchAsync from '../utils/catchAsync.js';
import Debts from '../models/debts.model.js';
import Student from '../models/student.model.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

export const findAllStudents = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  // Si search está vacío devolver array vacío
  if (!search || search.trim() === '') {
    return res.status(200).json({
      status: 'Success',
      results: 0,
      students: [],
    });
  }

  const searchTerm = search.trim();

  const students = await Student.findAll({
    where: {
      [Op.or]: [
        { lastName: { [Op.iLike]: `%${searchTerm}%` } },
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { dni: { [Op.like]: `%${searchTerm}%` } },
        { phoneNumber: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    include: [{ model: Debts }],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});

export const findAllStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const debts = await Debts.findAll({
    where: {
      studentId: id,
    },
  });

  return res.status(200).json({
    status: 'Success',
    results: debts.length,
    debts,
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { student } = req;
  const { name, amount, notificationWhatsApp } = req.body;

  const debt = await Debts.create({
    studentId: student.id,
    name,
    amount,
  });

  if (notificationWhatsApp) {
    const message = `Se le comunica que se ha registrado una deuda por concepto de ${name} ascendente al monto de ${amount}. 
Para mayor detalle puede ingresar a: https://alipioponce.com/`;

    const numberWhatsApp = `+51${student.phoneNumber}`;
    const chatId = numberWhatsApp.substring(1) + '@c.us';

    const existNumber = await clientWhatsApp.getNumberId(chatId);

    if (existNumber) {
      await clientWhatsApp.sendMessage(chatId, message);
      logger.info('mensaje enviado');
    }
  }

  res.status(201).json({
    status: 'success',
    message: 'the debt has been created successfully!',
    debt,
  });
});

export const update = catchAsync(async (req, res) => {
  const { debt } = req;
  const { name, amount, status } = req.body;

  await debt.update({
    name,
    amount,
    status,
  });

  return res.status(200).json({
    status: 'success',
    message: 'debt has been updated',
    debt,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { debt } = req;

  return res.status(200).json({
    status: 'success',
    debt,
  });
});

export const remove = catchAsync(async (req, res) => {
  const { debt } = req;

  await debt.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The debt with id: ${debt.id} has been deleted`,
    debt,
  });
});
