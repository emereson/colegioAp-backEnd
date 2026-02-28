import express from 'express';

import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as studentMiddleware from '../middlewares/student.middleware.js';
import * as classroomsStudentController from '../controllers/classroomsStudent.controller.js';
import * as classroomsStudentMiddleware from '../middlewares/classroomStudent.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/student/:id',
  studentMiddleware.validExistStudent,
  classroomsStudentController.findAll,
);

router.get('/exams/:id', classroomsStudentController.findAllExams);

router.get('/notas/:id/:nameExam', classroomsStudentController.findAllNotas);

router.post('/', classroomsStudentController.create);

router
  .route('/:id')
  .get(
    classroomsStudentMiddleware.validExistClassroomsStudentIncluide,
    classroomsStudentController.findOne,
  )
  .patch(
    classroomsStudentMiddleware.validExistClassroomsStudent,
    classroomsStudentController.update,
  )
  .delete(
    classroomsStudentMiddleware.validExistClassroomsStudent,
    classroomsStudentController.remove,
  );

export default router;
