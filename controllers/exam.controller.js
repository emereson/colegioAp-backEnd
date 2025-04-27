const catchAsync = require('../utils/catchAsync');
const Exam = require('../models/exams.model');
const ClassroomsStudent = require('../models/classroomsStudents.model');
const Student = require('../models/student.model');
const { clientWhatsApp } = require('../routes/vincularWsp');

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

  for (const classroomStudent of classroomsStudents) {
    const message = `Se le comunica que se ha registrado las notas del examen de la ${classroomStudent?.exams?.[0].name} del alumno ${classroomStudent.student.name}. Para mayor detalle puede ingresar a la siguiente dirección https://alipioponce.com/`;

    const numberWhatsApp = `+51${classroomStudent.student.phoneNumber}`;
    const chatId = numberWhatsApp.substring(1) + '@c.us';

    const existNumber = await clientWhatsApp.getNumberId(chatId);

    // Verificar si el número de WhatsApp existe
    if (existNumber) {
      await clientWhatsApp.sendMessage(chatId, message);
      console.log('Mensaje enviado a', classroomStudent.student.name);
    } else {
      console.log(
        'Número de WhatsApp no encontrado para',
        classroomStudent.student.name
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 8000));
  }

  // Enviar respuesta al cliente
  return res.status(201).json({
    status: 'Success',
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
