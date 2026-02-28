import express from 'express';

import * as evaluacionController from './preguntaEvaluacion.controller.js';
import * as evaluacionMiddleware from './preguntaEvaluacion.middleware.js';
import * as semanaEvaluacionMiddleware from '../semanaEvaluacion/semanaEvaluacion.middleware.js';
import * as authMiddleware from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', evaluacionController.findAll);

router
  .route('/:id')
  .post(
    semanaEvaluacionMiddleware.validExistSemanaEvaluacion,
    evaluacionController.create,
  )
  .get(
    evaluacionMiddleware.validExistEvaluaciones,
    evaluacionController.findOne,
  )
  .patch(
    evaluacionMiddleware.validExistEvaluaciones,
    evaluacionController.create,
  )
  .delete(
    evaluacionMiddleware.validExistEvaluaciones,
    evaluacionController.remove,
  );

const evaluacionRouter = router;

export default evaluacionRouter;
