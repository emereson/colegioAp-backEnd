import catchAsync from '../utils/catchAsync.js';
import bcrypt from 'bcryptjs';
import generateJWT from '../utils/jwt.js';
import AppError from '../utils/AppError.js';
import Student from '../models/student.model.js';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import Classroom from '../models/classroom.model.js';
import Exam from '../models/exams.model.js';
import Course from '../models/course.model.js';
import Attendance from '../models/attendance.model.js';
import { Op } from 'sequelize';
import Payments from '../models/payments.model.js';
import Observations from '../models/observations.model.js';
import Debts from '../models/debts.model.js';
import ClassroomsStudent from '../models/classroomsStudents.model.js';
import logger from '../utils/logger.js';
import storage from '../utils/firebase.js';

export const findAll = catchAsync(async (req, res, next) => {
  const { name, aula } = req.query; // Aquí es donde recibimos el parámetro de búsqueda

  let whereFilter = {};
  let whereClassroom = {};
  let shouldLimit = true;

  if (aula && aula !== 'undefined' && aula.length > 0) {
    whereClassroom.classroom_id = aula;
    shouldLimit = false;
  }

  if (name && name !== 'undefined' && name.length > 3) {
    whereFilter = {
      [Op.or]: [
        { lastName: { [Op.iLike]: `%${name}%` } }, // Búsqueda insensible a mayúsculas y minúsculas para el apellido
        { name: { [Op.iLike]: `%${name}%` } }, // Búsqueda insensible a mayúsculas y minúsculas para el nombre
        { dni: { [Op.like]: `%${name}%` } }, // Búsqueda con LIKE para el DNI
        { phoneNumber: { [Op.like]: `%${name}%` } }, // Búsqueda con LIKE para el DNI
      ],
    };
    shouldLimit = false;
  }

  const students = await Student.findAll({
    where: whereFilter, // Aplicamos el filtro de búsqueda
    include: [
      {
        model: ClassroomsStudent,
        where: whereClassroom,
        required: whereClassroom.classroom_id ? true : false,
      },
    ],
    order: [['createdAt', 'DESC']],
    ...(shouldLimit && { limit: 10 }), // Incluimos la relación con la tabla Classroom
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length, // Número de resultados encontrados
    students, // Los estudiantes encontrados
  });
});

export const findAllLastName = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  const students = await Student.findAll({
    where: {
      [Op.or]: [
        { lastName: { [Op.iLike]: `%${search}%` } }, // Búsqueda insensible a mayúsculas y minúsculas para el apellido
        { name: { [Op.iLike]: `%${search}%` } }, // Búsqueda insensible a mayúsculas y minúsculas para el nombre
        { dni: { [Op.like]: `%${search}%` } },
      ],
    },
    attributes: { exclude: ['password'] }, // Excluir la columna 'password'
    include: [
      { model: Classroom, include: Payments },
      { model: Observations },
      { model: Debts },
    ],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});

export const findAllClasroom = catchAsync(async (req, res, next) => {
  const { name } = req.query;

  const students = await Student.findAll({
    include: [
      {
        model: Classroom,
        where: {
          name,
        },
      },
    ],
    order: [['lastName', 'ASC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});

export const findAllClasroomAttendance = catchAsync(async (req, res, next) => {
  const { name, date } = req.query;

  const students = await Student.findAll({
    include: [
      {
        model: Classroom,
        where: { name },
        include: {
          model: Attendance,
          where: { date },
        },
      },
    ],
    order: [['lastName', 'ASC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});

export const findAllClassroomExam = catchAsync(async (req, res, next) => {
  const { name } = req.query;

  const students = await Student.findAll({
    include: [
      {
        model: Classroom,
        where: {
          name,
        },
        include: {
          model: Course,
        },
      },
    ],
    order: [['lastName', 'ASC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});

export const findAllClassroomExamName = catchAsync(async (req, res, next) => {
  const { name, nameExam } = req.query;

  const students = await Student.findAll({
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Classroom,
        where: {
          name,
        },
        include: [
          {
            model: Exam,
            where: {
              name: nameExam,
            },
            include: [
              {
                model: Course,
              },
            ],
          },
        ],
      },
    ],
    order: [['lastName', 'ASC']],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});

export const findAllClasroomStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const classroom = await Classroom.findAll({
    where: {
      studentId: id,
    },

    include: [{ model: Course, include: { model: Exam } }, { model: Payments }],
  });
  return res.status(200).json({
    status: 'Success',
    results: classroom.length,
    classroom,
  });
});
export const signup = catchAsync(async (req, res, next) => {
  const { name, lastName, dni, phoneNumber, password } = req.body;

  // Verificar existencia de dni y phoneNumber en paralelo
  const [existingDni, existingPhone] = await Promise.all([
    Student.findOne({ where: { dni } }),
    Student.findOne({ where: { phoneNumber } }),
  ]);

  // Validaciones de datos existentes
  if (existingDni) {
    return next(new AppError(`El DNI ${dni} ya está registrado.`, 409));
  }

  if (existingPhone) {
    return next(
      new AppError(
        `El número de teléfono ${phoneNumber} ya está registrado.`,
        409,
      ),
    );
  }

  // Encriptar contraseña y subir imagen en paralelo
  const [encryptedPassword, imgUploaded] = await Promise.all([
    // Encriptar contraseña
    (async () => {
      const salt = await bcrypt.genSalt(12);
      return bcrypt.hash(password, salt);
    })(),

    // Subir imagen
    (async () => {
      if (!req.file) {
        return null; // O una imagen por defecto
      }

      const imgRef = ref(
        storage,
        `studentImg/${Date.now()}-${req.file.originalname}`,
      );

      await uploadBytes(imgRef, req.file.buffer);
      return getDownloadURL(imgRef);
    })(),
  ]);

  // Crear estudiante
  const student = await Student.create({
    name,
    lastName,
    dni,
    phoneNumber,
    password: encryptedPassword,
    studentImg: imgUploaded,
  });

  // Generar token

  // Responder
  res.status(201).json({
    status: 'success',
    message: 'El estudiante ha sido creado exitosamente!',
    student: {
      id: student.id,
      name: student.name,
      lastName: student.lastName,
      dni: student.dni,
      phoneNumber: student.phoneNumber,
      studentImg: student.studentImg,
    },
  });
});
export const login = catchAsync(async (req, res, next) => {
  const { dni, password } = req.body;

  const student = await Student.findOne({
    where: {
      dni,
    },
  });
  if (!student) {
    return next(new AppError('the student could not be found', 404));
  }

  if (!(await bcrypt.compare(password, student.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = await generateJWT(student.id);

  logger.info(token);
  res.status(201).json({
    status: 'success',
    token,
    student,
  });
});

export const findOne = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const student = await Student.findOne({
    where: {
      id: sessionUser.id,
    },
    include: [
      {
        model: ClassroomsStudent,
        include: [{ model: Classroom }],
      },
      {
        model: Observations,
      },
      {
        model: Debts,
      },
    ],
  });
  return res.status(200).json({
    status: 'Success',
    student,
  });
});

export const update = catchAsync(async (req, res) => {
  const { student } = req;
  const { name, lastName, dni, status, phoneNumber, password } = req.body;

  // Preparar el objeto de actualización
  const updateData = {
    name,
    lastName,
    dni,
    status,
    phoneNumber,
  };

  // Procesar la contraseña si se proporciona una válida
  if (password && password !== 'undefined' && password.length > 3) {
    const salt = await bcrypt.genSalt(12);
    updateData.password = await bcrypt.hash(password, salt);
  }

  // Procesar imagen si existe
  if (req.file) {
    const imgRef = ref(
      storage,
      `studentImg/${Date.now()}-${req.file.originalname}`,
    );

    await uploadBytes(imgRef, req.file.buffer);
    updateData.studentImg = await getDownloadURL(imgRef);
  }

  // Actualizar estudiante con todos los datos en una sola operación
  await student.update(updateData);

  // Obtener los datos actualizados
  const updatedStudent = await student.reload();

  res.status(200).json({
    status: 'success',
    message: 'El estudiante ha sido actualizado exitosamente!',
    student: updatedStudent,
  });
});

export const remove = catchAsync(async (req, res) => {
  const { student } = req;

  await student.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${student.id} has been deleted`,
    student,
  });
});
