const express = require('express');
const { upload } = require('../../utils/multer');

const studentFilesController = require('./studentFiles.controller');
const studentFilesMiddleware = require('./studentFiles.middleware');
const classroomStudentMiddleware = require('../../middlewares/classroomStudent.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', studentFilesController.findAll);
router.get(
  '/classroom/:id',
  classroomStudentMiddleware.validExistClassroomsStudent,
  studentFilesController.findAllClassroom
);

router
  .route('/:id')
  .get(
    studentFilesMiddleware.validExistStudentFiles,
    studentFilesController.findOne
  )
  .patch(
    upload.single('file'),
    studentFilesMiddleware.validExistStudentFiles,
    studentFilesController.update
  )
  .delete(
    studentFilesMiddleware.validExistStudentFiles,
    studentFilesController.delete
  );

module.exports = router;
