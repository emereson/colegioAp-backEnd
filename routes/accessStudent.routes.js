const express = require('express');

const studentMiddleware = require('../middlewares/student.middleware');
const accesStudentController = require('../controllers/accesStudent.controller');

const calendarController = require('../controllers/calendar.controller');
const studentController = require('../controllers/student.controller');
const notificationsController = require('../controllers/notifications.controller');
const galeryPhotosController = require('../controllers/galeryPhotos.controller');
const classroomsStudentController = require('../middlewares/classroomStudent.middleware');
const classroomMiddleware = require('../middlewares/classroom.middleware');
const classroomStudentMiddleware = require('../middlewares/classroomStudent.middleware');
const { upload } = require('../utils/multer');

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

router.get(
  '/student-files/:id',
  classroomStudentMiddleware.validExistClassroomsStudent,
  accesStudentController.findAllStudentFiles
);

router.post(
  '/student-files/:id',
  upload.single('file'),
  classroomStudentMiddleware.validExistClassroomsStudent,
  accesStudentController.createdStudentFile
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
