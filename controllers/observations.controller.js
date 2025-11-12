const catchAsync = require('../utils/catchAsync');
const Observations = require('../models/observations.model');
const Student = require('../models/student.model');
const { Op } = require('sequelize');
const { clientWhatsApp } = require('../routes/vincularWsp');
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
    include: [{ model: Observations }],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});

exports.findAllStudentId = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const observations = await Observations.findAll({
    where: {
      studentId: id,
    },
  });

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

  return res.status(201).json({
    status: 'Success',
    message: 'observation created successfully',
    observation,
  });
});

exports.notification = catchAsync(async (req, res, next) => {
  const { observation } = req;

  const message = `Se le comunica que se ha registrado la siguiente observación ${observation.name} del alumno ${observation.student.name} ${observation.student.lastName}. Para mayor detalle puede ingresar a la siguiente dirección https://alipioponce.com/`;

  const number = `51${observation.student.phoneNumber}`; // sin el '+'

  // 👇 obtener correctamente el ID del número
  const numberDetails = await clientWhatsApp.getNumberId(number);

  if (!numberDetails) {
    logger.info(`⚠️ Número no encontrado o no tiene WhatsApp: ${number}`);
    return res.status(404).json({
      status: 'fail',
      message: `El número ${number} no tiene cuenta de WhatsApp`,
    });
  }

  const chatId = numberDetails._serialized; // formato correcto, ej: "51987654321@c.us"

  try {
    await clientWhatsApp.sendMessage(chatId, message);
    logger.info(`✅ Mensaje enviado a ${chatId}`);
  } catch (err) {
    logger.error('❌ Error al enviar mensaje:', err.message);
    return res.status(500).json({
      status: 'fail',
      message: 'Error al enviar el mensaje de WhatsApp',
      error: err.message,
    });
  }

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
