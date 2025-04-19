const express = require('express');

const studentMiddleware = require('../middlewares/student.middleware');

const calendarController = require('../controllers/calendar.controller');
const studentController = require('../controllers/student.controller');
const notificationsController = require('../controllers/notifications.controller');
const galeryPhotosController = require('../controllers/galeryPhotos.controller');
const classroomController = require('../controllers/classroom.controller');
const classroomMiddleware = require('../middlewares/classroom.middleware');

const accesStudentController = require('../controllers/accesStudent.controller');
const classroomsStudentController = require('../middlewares/classroomStudent.middleware');

const router = express.Router();

router.get('/gallery', galeryPhotosController.findAll);
router.post('/login', studentController.login);
router.use(studentMiddleware.protect);

router.get(
  '/attendance/:id',
  classroomsStudentController.validExistClassroomsStudent,
  accesStudentController.findAllAttendances
);

router.get(
  '/exams/:id',
  classroomsStudentController.validExistClassroomsStudent,
  accesStudentController.findAllExams
);

router.get(
  '/pays/:id',
  classroomsStudentController.validExistClassroomsStudent,
  accesStudentController.findAllPays
);

router.get(
  '/debts/:id',
  studentMiddleware.validExistStudent,
  accesStudentController.findAllDebts
);

router.get(
  '/files/:id',
  classroomMiddleware.validExistClassroom,
  accesStudentController.findAllFiles
);

router.get('/notifications', notificationsController.findAll);
router.get('/calendar', calendarController.findAll);
router.get(
  '/:id',
  studentMiddleware.validExistStudent2,
  studentMiddleware.protectAccountOwner,
  studentController.findOne
);

module.exports = router;
