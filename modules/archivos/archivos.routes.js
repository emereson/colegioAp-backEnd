const express = require('express');
const { upload } = require('../../utils/multer');

const archivosController = require('./archivos.controller');
const archivosMiddleware = require('./archivos.middleware');
const classroomMiddleware = require('../../middlewares/classroom.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', archivosController.findAll);
router.get(
  '/classroom/:id',
  classroomMiddleware.validExistClassroom,
  archivosController.findAllClassroom
);

router
  .route('/:id')
  .post(
    upload.single('file'),
    classroomMiddleware.validExistClassroom,
    archivosController.create
  )
  .get(archivosMiddleware.validExistArchivo, archivosController.findOne)
  .patch(
    upload.single('file'),
    archivosMiddleware.validExistArchivo,
    archivosController.update
  )
  .delete(archivosMiddleware.validExistArchivo, archivosController.delete);

module.exports = router;
