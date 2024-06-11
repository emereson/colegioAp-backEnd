const catchAsync = require('../utils/catchAsync');
const Payments = require('../models/payments.model');
const { clientWhatsApp } = require('../utils/whatsapp');

exports.findAll = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const payments = await Payments.findAll({
    where: {
      studentId: id,
    },
  });

  return res.status(200).json({
    status: 'Success',
    results: payments.length,
    payments,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, date, amount, student, notificationWhatsApp } = req.body;

  const pay = await Payments.create({
    classroomId: id,
    name,
    date,
    amount,
  });
  if (notificationWhatsApp) {
    const message = `Se le comunica que se ha registrado un pago por concepto de ${name} ascendente al monto de s./${amount} En nuestro sistema. Para mayor detalle puede ingresar a la siguiente dirección https://alipioponce.com/
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
    message: 'the pay has ben created successfully!',
    pay,
  });
});

exports.update = catchAsync(async (req, res) => {
  const { pay } = req;
  const { name, date, amount } = req.body;

  await pay.update({
    name,
    date,
    amount,
  });

  return res.status(200).json({
    status: 'success',
    message: 'User information has been updated',
    pay,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { pay } = req;

  return res.status(200).json({
    status: 'success',
    pay,
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { pay } = req;

  await pay.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${pay.id} has been deleted`,
    pay,
  });
});
