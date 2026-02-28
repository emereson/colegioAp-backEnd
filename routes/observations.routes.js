import express from 'express';

import * as observationsMiddleware from '../middlewares/observations.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as studentMiddleware from '../middlewares/student.middleware.js';

import * as observationsController from '../controllers/observations.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/students', observationsController.findAllStudents);

router.get(
  '/student/:id',
  studentMiddleware.validExistStudent,
  observationsController.findAllStudentId,
);

router.get(
  '/notification/:id',
  observationsMiddleware.validExistObservations,
  observationsController.notification,
);

router
  .route('/:id')
  .post(studentMiddleware.validExistStudent, observationsController.create)
  .patch(
    observationsMiddleware.validExistObservations,
    observationsController.update,
  )
  .delete(
    observationsMiddleware.validExistObservations,
    observationsController.remove,
  )
  .get(
    observationsMiddleware.validExistObservations,
    observationsController.findOne,
  );

export default router;
