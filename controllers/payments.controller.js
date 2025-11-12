const catchAsync = require('../utils/catchAsync');
const Payments = require('../models/payments.model');
const { clientWhatsApp } = require('../utils/whatsapp');
const Student = require('../models/student.model');
const { Op } = require('sequelize');
const ClassroomsStudent = require('../models/classroomsStudents.model');
const Classroom = require('../models/classroom.model');
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
    include: [
      {
        model: ClassroomsStudent,
        include: [
          { model: Payments, separate: true, order: [['date', 'ASC']] },
          { model: Classroom },
        ],
      },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});

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

  // Crear el pago
  const pay = await Payments.create({
    classroom_student_id: id,
    name,
    date,
    amount,
  });

  // Si está activada la notificación por WhatsApp
  if (notificationWhatsApp) {
    const message = `Se le comunica que se ha registrado un pago por concepto de ${name}, ascendente al monto de S/.${amount}. Para mayor detalle puede ingresar a la siguiente dirección: https://alipioponce.com/`;

    const number = `51${student.phoneNumber}`; // sin el '+'

    try {
      // Obtener ID del número
      const numberDetails = await clientWhatsApp.getNumberId(number);

      if (!numberDetails) {
        logger.info(`⚠️ Número no encontrado o no tiene WhatsApp: ${number}`);
      } else {
        const chatId = numberDetails._serialized;
        await clientWhatsApp.sendMessage(chatId, message);
        logger.info(`✅ Mensaje enviado a ${chatId}`);
      }
    } catch (err) {
      logger.error('❌ Error al enviar mensaje de WhatsApp:', err.message);
    }
  }

  // Respuesta final
  res.status(201).json({
    status: 'success',
    message: 'El pago se ha registrado correctamente.',
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
