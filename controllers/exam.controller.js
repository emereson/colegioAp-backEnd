const catchAsync = require('../utils/catchAsync');
const Exam = require('../models/exam.model');
const { clientWhatsApp } = require('../utils/whatsapp');

exports.findAll = catchAsync(async (req, res, next) => {
  const exams = await Exam.findAll({});

  return res.status(200).json({
    status: 'success',
    message: 'All exams successfully',
    exams,
  });
});

exports.whatsApp = catchAsync(async (req, res, next) => {
  const { nameExam, studentsExam } = req.body;

  for (const student of studentsExam) {
    const message = `Se le comunica que se ha registrado las notas del examen de la ${nameExam} del alumno ${student.name}. Para mayor detalle puede ingresar a la siguiente dirección https://alipioponce.com/`;

    const numberWhatsApp = `+51${student.phoneNumber}`;
    const chatId = numberWhatsApp.substring(1) + '@c.us';

    const existNumber = await clientWhatsApp.getNumberId(chatId);

    // Verificar si el número de WhatsApp existe
    if (existNumber) {
      await clientWhatsApp.sendMessage(chatId, message);
      console.log('Mensaje enviado a', student.name);
    } else {
      console.log('Número de WhatsApp no encontrado para', student.name);
    }

    await new Promise((resolve) => setTimeout(resolve, 15000));
  }

  // Enviar respuesta al cliente
  return res.status(201).json({
    status: 'Success',
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, note } = req.body;

  const exam = await Exam.create({
    courseId: id,
    name,
    note,
  });

  return res.status(201).json({
    status: 'Success',
    message: 'The exam created successfully',
    exam,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { exam } = req;

  return res.status(200).json({
    status: 'success',
    exam,
  });
});

exports.update = catchAsync(async (req, res) => {
  const { exam } = req;
  const { name, note } = req.body;

  await exam.update({
    name,
    note,
  });

  return res.status(200).json({
    status: 'success',
    message: 'The exam information has been updated',
    exam,
  });
});

exports.delete = catchAsync(async (req, res, next) => {
  const { exam } = req;

  await exam.destroy();
  return res.status(200).json({
    status: 'success',
    message: 'the exam has been delete',
    exam,
  });
});
