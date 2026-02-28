import express from 'express';

import * as semanaEvaluacionController from './semanaEvaluacion.controller.js';
import * as semanaEvaluacionMiddleware from './semanaEvaluacion.middleware.js';
import * as classroomMiddleware from '../../../middlewares/classroom.middleware.js';
import * as authMiddleware from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', semanaEvaluacionController.findAll);

router
  .route('/:id')
  .post(
    classroomMiddleware.validExistClassroom,
    semanaEvaluacionController.create,
  )
  .get(
    semanaEvaluacionMiddleware.validExistSemanaEvaluacion,
    semanaEvaluacionController.findOne,
  )
  .patch(
    semanaEvaluacionMiddleware.validExistSemanaEvaluacion,
    semanaEvaluacionController.create,
  )
  .delete(
    semanaEvaluacionMiddleware.validExistSemanaEvaluacion,
    semanaEvaluacionController.remove,
  );

export default router;
