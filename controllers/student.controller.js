const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/jwt');
const AppError = require('../utils/AppError');
const Student = require('../models/student.model');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../utils/firebase');
const Classroom = require('../models/classroom.model');
const Course = require('../models/courses.model');
const Exam = require('../models/exam.model');
const Attendance = require('../models/attendance.model');
const { Op } = require('sequelize');
const Payments = require('../models/payments.model');
const Observations = require('../models/observations.model');
const Debts = require('../models/debts.model');

exports.findAll = catchAsync(async (req, res, next) => {
  const { search } = req.query;

  const students = await Student.findAll({
    where: {
      [Op.or]: [
        { lastName: { [Op.iLike]: `%${search}%` } }, // Búsqueda insensible a mayúsculas y minúsculas para el apellido
        { name: { [Op.iLike]: `%${search}%` } }, // Búsqueda insensible a mayúsculas y minúsculas para el nombre
        { dni: { [Op.like]: `%${search}%` } },
      ],
    },
    include: [{ model: Classroom }],
  });

  return res.status(200).json({
    status: 'Success',
    results: students.length,
    students,
  });
});
exports.findAllLastName = catchAsync(async (req, res, next) => {
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

exports.findAllClasroom = catchAsync(async (req, res, next) => {
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
exports.findAllClasroomAttendance = catchAsync(async (req, res, next) => {
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

exports.findAllClassroomExam = catchAsync(async (req, res, next) => {
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

exports.findAllClassroomExamName = catchAsync(async (req, res, next) => {
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
            model: Course,
            where: {
              name: nameExam,
            },
            include: [
              {
                model: Exam,
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
exports.findAllClasroomStudent = catchAsync(async (req, res, next) => {
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
exports.signup = catchAsync(async (req, res, next) => {
  const { name, lastName, dni, phoneNumber, password } = req.body;

  const salt = await bcrypt.genSalt(12);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const imgRef = ref(
    storage,
    `studentImg/${Date.now()}-${req.file.originalname}`
  );

  await uploadBytes(imgRef, req.file.buffer);

  const imgUploaded = await getDownloadURL(imgRef);

  const student = await Student.create({
    name,
    lastName,
    dni,
    phoneNumber,
    password: encryptedPassword,
    studentImg: imgUploaded,
  });

  const token = await generateJWT(student.id);

  res.status(201).json({
    status: 'success',
    message: 'the student has ben created successfully!',
    token,
    student,
  });
});

exports.login = catchAsync(async (req, res, next) => {
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

  console.log(token);
  res.status(201).json({
    status: 'success',
    token,
    student,
  });
});

exports.findOne = catchAsync(async (req, res, next) => {
  const { student } = req;

  return res.status(200).json({
    status: 'Success',
    student,
  });
});
exports.update = catchAsync(async (req, res) => {
  const { student } = req;
  const { name, lastName, dni, status, phoneNumber } = req.body;

  if (req.file) {
    const imgRef = ref(
      storage,
      `studentImg/${Date.now()}-${req.file.originalname}`
    );

    await uploadBytes(imgRef, req.file.buffer);

    const imgUploaded = await getDownloadURL(imgRef);

    await student.update({
      name,
      lastName,
      dni,
      status,
      phoneNumber,
      studentImg: imgUploaded,
    });
  } else {
    await student.update({
      name,
      lastName,
      dni,
      status,
      phoneNumber,
    });
  }

  res.status(201).json({
    status: 'success',
    message: 'The student has been updated successfully!',
    student,
  });
});

exports.delete = catchAsync(async (req, res) => {
  const { student } = req;

  await student.destroy();

  return res.status(200).json({
    status: 'success',
    message: `The user with id: ${student.id} has been deleted`,
    student,
  });
});
