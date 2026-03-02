import express from 'express';

import * as evaluacionController from './evaluacion.controller.js';
import * as evaluacionMiddleware from './evaluacion.middleware.js';
import * as semanaEvaluacionMiddleware from '../semanaEvaluacion/semanaEvaluacion.middleware.js';
import * as authMiddleware from '../../../middlewares/auth.middleware.js';
import { upload } from '../../../utils/multer.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', evaluacionController.findAll);

router
  .route('/:id')
  .post(
    upload.any(),
    semanaEvaluacionMiddleware.validExistSemanaEvaluacion,
    evaluacionController.create,
  )
  .get(
    evaluacionMiddleware.validExistEvaluaciones,
    evaluacionController.findOne,
  )
  .patch(
    upload.any(),
    evaluacionMiddleware.validExistEvaluaciones,
    evaluacionController.update,
  )
  .delete(
    evaluacionMiddleware.validExistEvaluaciones,
    evaluacionController.remove,
  );

const evaluacionRouter = router;

export default evaluacionRouter;
