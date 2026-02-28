import express from 'express';
import { upload } from '../../utils/multer.js';

import * as archivosController from './archivos.controller.js';
import * as archivosMiddleware from './archivos.middleware.js';
import * as classroomMiddleware from '../../middlewares/classroom.middleware.js';
import * as authMiddleware from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', archivosController.findAll);

router.get(
  '/classroom/:id',
  classroomMiddleware.validExistClassroom,
  archivosController.findAllClassroom,
);

router
  .route('/:id')
  .post(
    upload.single('file'),
    classroomMiddleware.validExistClassroom,
    archivosController.create,
  )
  .get(archivosMiddleware.validExistArchivo, archivosController.findOne)
  .patch(
    upload.single('file'),
    archivosMiddleware.validExistArchivo,
    archivosController.update,
  )
  .delete(
    archivosMiddleware.validExistArchivo,
    archivosController.remove, // ojo: tu controller usa "remove" no "delete"
  );

export default router;
