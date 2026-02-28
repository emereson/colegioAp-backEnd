import express from 'express';
import { upload } from '../../utils/multer.js';

import * as studentFilesController from './studentFiles.controller.js';
import * as studentFilesMiddleware from './studentFiles.middleware.js';
import * as classroomStudentMiddleware from '../../middlewares/classroomStudent.middleware.js';
import * as authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', studentFilesController.findAll);

router.get(
  '/classroom/:id',
  classroomStudentMiddleware.validExistClassroomsStudent,
  studentFilesController.findAllClassroom,
);

router
  .route('/:id')
  .get(
    studentFilesMiddleware.validExistStudentFiles,
    studentFilesController.findOne,
  )
  .patch(
    upload.single('file'),
    studentFilesMiddleware.validExistStudentFiles,
    studentFilesController.update,
  )
  .delete(
    studentFilesMiddleware.validExistStudentFiles,
    studentFilesController.remove,
  );

export default router;
