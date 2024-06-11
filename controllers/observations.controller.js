const catchAsync = require('../utils/catchAsync');
const Observations = require('../models/observations.model');
const { clientWhatsApp } = require('../utils/whatsapp');

exports.findAll = catchAsync(async (req, res, next) => {
  const observations = await Observations.findAll({});

  return res.status(200).json({
    status: 'success',
    message: 'All observations  successfully',
    observations,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, student, notificationWhatsApp } = req.body;

  const observation = await Observations.create({
    studentId: id,
    name,
    description,
  });
  if (notificationWhatsApp) {
    const message = `Se le comunica que se ha registrado la siguiente observación ${name} del alumno ${student.name} ${student.lastName}. Para mayor detalle puede ingresar a la siguiente dirección https://alipioponce.com/`;

    const numberWhatsApp = `+51${student.phoneNumber}`;
    const chatId = numberWhatsApp.substring(1) + '@c.us';

    const existNumber = await clientWhatsApp.getNumberId(chatId);

    if (existNumber) {
      await clientWhatsApp.sendMessage(chatId, message);
      console.log('mensaje enviado');
    }
  }
  return res.status(201).json({
    status: 'Success',
    message: 'observation created successfully',
    observation,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { observation } = req;

  return res.status(200).json({
    status: 'success',
    observation,
  });
});

exports.update = catchAsync(async (req, res, next) => {
  const { observation } = req;
  const { name, description } = req.body;

  await observation.update({
    name,
    description,
  });

  return res.status(200).json({
    status: 'success',
    message: 'the observation has been updated',
    observation,
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  const { observation } = req;

  await observation.destroy();

  return res.status(200).json({
    status: 'success',
    message: 'the observation has been delete',
    observation,
  });
});
