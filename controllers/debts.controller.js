const catchAsync = require('../utils/catchAsync');
const Debts = require('../models/debts.model');
const { clientWhatsApp } = require('../utils/whatsapp');

exports.findAll = catchAsync(async (req, res, next) => {
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
  const { id } = req.params;
  const { name, amount, student, notificationWhatsApp } = req.body;

  const debt = await Debts.create({
    studentId: id,
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
      console.log('mensaje enviado');
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
  const { name, amount } = req.body;

  await debt.update({
    name,

    amount,
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
