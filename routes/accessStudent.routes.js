import express from 'express';
import { upload } from '../utils/multer.js';

import * as studentMiddleware from '../middlewares/student.middleware.js';
import * as accesStudentController from '../controllers/accesStudent.controller.js';
import * as calendarController from '../controllers/calendar.controller.js';
import * as studentController from '../controllers/student.controller.js';
import * as notificationsController from '../controllers/notifications.controller.js';
import * as galeryPhotosController from '../controllers/galeryPhotos.controller.js';
import * as classroomStudentMiddleware from '../middlewares/classroomStudent.middleware.js';
import * as classroomMiddleware from '../middlewares/classroom.middleware.js';

const router = express.Router();

router.get('/gallery', galeryPhotosController.findAll);
router.post('/login', studentController.login);

router.use(studentMiddleware.protect);

router.get(
  '/attendance/:id',
  classroomStudentMiddleware.validExistClassroomsStudent,
  accesStudentController.findAllAttendances,
);

router.get(
  '/exams/:id',
  classroomStudentMiddleware.validExistClassroomsStudent,
  accesStudentController.findAllExams,
);

router.get(
  '/pays/:id',
  classroomStudentMiddleware.validExistClassroomsStudent,
  accesStudentController.findAllPays,
);

router.get(
  '/debts/:id',
  studentMiddleware.validExistStudent,
  accesStudentController.findAllDebts,
);

router.get(
  '/files/:id',
  classroomMiddleware.validExistClassroom,
  accesStudentController.findAllFiles,
);

router.get(
  '/student-files/:id',
  classroomStudentMiddleware.validExistClassroomsStudent,
  accesStudentController.findAllStudentFiles,
);

router.post(
  '/student-files/:id',
  upload.single('file'),
  classroomStudentMiddleware.validExistClassroomsStudent,
  accesStudentController.createdStudentFile,
);

router.get('/notifications', notificationsController.findAll);
router.get('/calendar', calendarController.findAll);

router.get(
  '/:id',
  studentMiddleware.validExistStudent2,
  studentMiddleware.protectAccountOwner,
  studentController.findOne,
);

export default router;
