import express from 'express';
import { upload } from '../utils/multer.js';

import * as studentMiddleware from '../middlewares/student.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as studentController from '../controllers/student.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', studentController.findAll);

router.post('/', upload.single('studentImg'), studentController.signup);
router.get('/classroom', studentController.findAllClasroom);
router.get('/classroomAttendance', studentController.findAllClasroomAttendance);
router.get('/classroomExam', studentController.findAllClassroomExam);
router.get('/classroomExamName', studentController.findAllClassroomExamName);
router.get('/searchLastName', studentController.findAllLastName);

router.get('/:id/classroom', studentController.findAllClasroomStudent);

router
  .route('/:id')
  .patch(
    upload.single('studentImg'),
    studentMiddleware.validExistStudent,
    studentController.update,
  )
  .delete(studentMiddleware.validExistStudent, studentController.remove)
  .get(studentMiddleware.validExistStudent, studentController.findOne);

export default router;
