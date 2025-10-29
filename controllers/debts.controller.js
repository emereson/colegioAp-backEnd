const catchAsync = require('../utils/catchAsync');
const Debts = require('../models/debts.model');
const { clientWhatsApp } = require('../utils/whatsapp');
const Student = require('../models/student.model');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.findAllStudents = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  // Si search está vacío o no contiene letras, devolver array vacío
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

exports.findAllStudent = catchAsync(async (req, res, next) => {
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

exports.create = catchAsync(async (req, res, next) => {
  const { student } = req;
  const { name, amount, notificationWhatsApp } = req.body;

  const debt = await Debts.create({
    studentId: student.id,
    name,
    amount,
  });
  if (notificationWhatsApp) {
    const message = `Se le comunica que se ha registrado una deuda por concepto de ${name} ascendente al monto de ${amount} En nuestro sistema. Para mayor detalle puede ingresar a la siguiente dirección https://alipioponce.com/
      `;

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
    message: 'the debt has ben created successfully!',
    debt,
  });
});

exports.update = catchAsync(async (req, res) => {
  const { debt } = req;
  const { name, amount, status } = req.body;

  await debt.update({
    name,
    amount,
    status,
  });

  return res.status(200).json({
    status: 'success',
    message: 'debt  has been updated',
    debt,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { debt } = req;

  return res.status(200).json({
    status: 'success',
    debt,
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { debt } = req;

  await debt.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The debt with id: ${debt.id} has been deleted`,
    debt,
  });
});
