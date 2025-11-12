const catchAsync = require('../utils/catchAsync');
const Exam = require('../models/exams.model');
const ClassroomsStudent = require('../models/classroomsStudents.model');
const Student = require('../models/student.model');
const { clientWhatsApp } = require('../routes/vincularWsp');
const logger = require('../utils/logger');

exports.findAll = catchAsync(async (req, res, next) => {
  const exams = await Exam.findAll({});

  return res.status(200).json({
    status: 'success',
    message: 'All exams successfully',
    exams,
  });
});

exports.whatsApp = catchAsync(async (req, res, next) => {
  const { id, nameExam } = req.params;

  // Obtener los estudiantes con sus exámenes
  const classroomsStudents = await ClassroomsStudent.findAll({
    where: { classroom_id: id },
    include: [
      {
        model: Exam,
        where: { name: nameExam },
        required: false,
      },
      {
        model: Student,
      },
    ],
    order: [[{ model: Student }, 'lastName', 'ASC']],
  });

  // Verificar si el cliente de WhatsApp está listo antes de comenzar
  if (!clientWhatsApp.info || !clientWhatsApp.pupPage) {
    logger.error(
      '⚠️ El cliente de WhatsApp no está inicializado correctamente.'
    );
    return res.status(503).json({
      status: 'fail',
      message: 'El cliente de WhatsApp no está listo. Intente más tarde.',
    });
  }

  for (const classroomStudent of classroomsStudents) {
    // Si no hay examen, salta
    if (!classroomStudent.exams || classroomStudent.exams.length === 0)
      continue;

    const examName = classroomStudent.exams[0].name;
    const student = classroomStudent.student;

    // Si no tiene número, salta
    if (!student.phoneNumber) {
      logger.info(`⚠️ El alumno ${student.name} no tiene número de teléfono.`);
      continue;
    }

    const message = `Se le comunica que se ha registrado las notas del examen de la ${examName} del alumno ${student.name}. Para mayor detalle puede ingresar a la siguiente dirección https://alipioponce.com/`;

    const number = `51${student.phoneNumber.replace(/\D/g, '')}`; // limpia y agrega código de país

    try {
      // Obtener correctamente el número de WhatsApp
      const numberDetails = await clientWhatsApp.getNumberId(number);

      if (!numberDetails) {
        logger.info(
          `⚠️ El número ${number} (${student.name}) no tiene cuenta de WhatsApp.`
        );
        continue;
      }

      const chatId = numberDetails._serialized;

      await clientWhatsApp.sendMessage(chatId, message);
      logger.info(`✅ Mensaje enviado a ${student.name} (${chatId})`);

      // Esperar 8 segundos para evitar bloqueo de WhatsApp
      await new Promise((resolve) => setTimeout(resolve, 8000));
    } catch (err) {
      logger.error(
        `❌ Error al enviar mensaje a ${student.name}:`,
        err.message
      );
    }
  }

  return res.status(201).json({
    status: 'success',
    message: 'Mensajes procesados correctamente.',
  });
});

exports.createClassrooms = catchAsync(async (req, res, next) => {
  const { idAula, data } = req.body;
  const classroomsStudent = await ClassroomsStudent.findAll({
    where: {
      classroom_id: idAula,
    },
  });
  if (!classroomsStudent.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'No  hay ningun alumno registrado para esta  aula',
    });
  }
  await Promise.all(
    classroomsStudent.map(
      async ({ id }) =>
        await Exam.create({
          classroom_student_id: id,
          name: data.name,
          teacher: data.teacher,
        })
    )
  );

  return res.status(201).json({
    status: 'Success',
    message: 'course created successfully',
    // course,
  });
});

exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, teacher } = req.body;

  const course = await Exam.create({
    classroomId: id,
    name,
    teacher,
  });

  return res.status(201).json({
    status: 'Success',
    message: 'course created successfully',
    course,
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
