import express from 'express';

import * as resultadosEvaluacionController from './resultadosEvaluacion.controller.js';
import * as resultadosEvaluacionnMiddleware from './resultadosEvaluacion.middleware.js';
import * as studentMiddleware from '../../../middlewares/student.middleware.js';
import * as evaluacionMiddleware from '../evaluacion/evaluacion.middleware.js';
import * as authMiddleware from '../../../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
  '/',
  authMiddleware.protect,
  resultadosEvaluacionController.getExamenes,
);

router.get(
  '/revision-admin/:id',
  authMiddleware.protect,
  resultadosEvaluacionController.getExamReviewAdmin,
);
router.use(studentMiddleware.protect);

router.get('/:id', resultadosEvaluacionController.getExamsByWeek);

router.get('/evaluacion/:id', resultadosEvaluacionController.getExam);
router.get('/existe/:id', resultadosEvaluacionController.validExistResultado);
router.get('/revision/:id', resultadosEvaluacionController.getExamReview);

router.post(
  '/:id',
  evaluacionMiddleware.validExistEvaluaciones,
  resultadosEvaluacionController.startExam,
);
router.patch(
  '/:id',
  resultadosEvaluacionnMiddleware.validExistResultadosEvaluacion,
  resultadosEvaluacionController.submitExam,
);

const resuldatosEvaluacionRouter = router;

export default resuldatosEvaluacionRouter;
