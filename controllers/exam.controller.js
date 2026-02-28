import catchAsync from '../utils/catchAsync.js';
import Exam from '../models/exams.model.js';
import ClassroomsStudent from '../models/classroomsStudents.model.js';
import Student from '../models/student.model.js';
import { clientWhatsApp } from '../routes/vincularWsp.js';
import logger from '../utils/logger.js';

export const findAll = catchAsync(async (req, res, next) => {
  const exams = await Exam.findAll({});

  return res.status(200).json({
    status: 'success',
    message: 'All exams successfully',
    exams,
  });
});

export const whatsApp = catchAsync(async (req, res, next) => {
  const { id, nameExam } = req.params;

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

  // Verificar si WhatsApp está listo
  if (!clientWhatsApp?.info || !clientWhatsApp?.pupPage) {
    logger.error(
      '⚠️ El cliente de WhatsApp no está inicializado correctamente.',
    );
    return res.status(503).json({
      status: 'fail',
      message: 'El cliente de WhatsApp no está listo. Intente más tarde.',
    });
  }

  for (const classroomStudent of classroomsStudents) {
    if (!classroomStudent.exams || classroomStudent.exams.length === 0)
      continue;

    const examName = classroomStudent.exams[0].name;
    const student = classroomStudent.student;

    if (!student?.phoneNumber) {
      logger.info(`⚠️ El alumno ${student?.name} no tiene número de teléfono.`);
      continue;
    }

    const message = `Se le comunica que se ha registrado las notas del examen de ${examName} del alumno ${student.name}. 
Para mayor detalle puede ingresar a: https://alipioponce.com/`;

    const number = `51${student.phoneNumber.replace(/\D/g, '')}`;

    try {
      const numberDetails = await clientWhatsApp.getNumberId(number);

      if (!numberDetails) {
        logger.info(
          `⚠️ El número ${number} (${student.name}) no tiene WhatsApp.`,
        );
        continue;
      }

      const chatId = numberDetails._serialized;

      await clientWhatsApp.sendMessage(chatId, message);
      logger.info(`✅ Mensaje enviado a ${student.name} (${chatId})`);

      // Esperar para evitar bloqueo
      await new Promise((resolve) => setTimeout(resolve, 8000));
    } catch (err) {
      logger.error(
        `❌ Error al enviar mensaje a ${student.name}: ${err.message}`,
      );
    }
  }

  return res.status(201).json({
    status: 'success',
    message: 'Mensajes procesados correctamente.',
  });
});

export const createClassrooms = catchAsync(async (req, res, next) => {
  const { idAula, data } = req.body;

  const classroomsStudent = await ClassroomsStudent.findAll({
    where: {
      classroom_id: idAula,
    },
  });

  if (!classroomsStudent.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'No hay ningún alumno registrado para esta aula',
    });
  }

  await Promise.all(
    classroomsStudent.map(({ id }) =>
      Exam.create({
        classroom_student_id: id,
        name: data.name,
        teacher: data.teacher,
      }),
    ),
  );

  return res.status(201).json({
    status: 'Success',
    message: 'Exams created successfully',
  });
});

export const create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, teacher } = req.body;

  const exam = await Exam.create({
    classroomId: id,
    name,
    teacher,
  });

  return res.status(201).json({
    status: 'Success',
    message: 'Exam created successfully',
    exam,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { exam } = req;

  return res.status(200).json({
    status: 'success',
    exam,
  });
});

export const update = catchAsync(async (req, res) => {
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

export const remove = catchAsync(async (req, res, next) => {
  const { exam } = req;

  await exam.destroy();

  return res.status(200).json({
    status: 'success',
    message: 'The exam has been deleted',
    exam,
  });
});
