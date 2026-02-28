import express from 'express';

import * as paymentsMiddleware from '../middlewares/payments.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as classroomsStudentMiddleware from '../middlewares/classroomStudent.middleware.js';

import * as paymentsController from '../controllers/payments.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/students', paymentsController.findAllStudents);

router
  .route('/:id')
  .post(
    classroomsStudentMiddleware.validExistClassroomsStudent,
    paymentsController.create,
  )
  .patch(paymentsMiddleware.validExistPay, paymentsController.update)
  .delete(paymentsMiddleware.validExistPay, paymentsController.remove)
  .get(paymentsMiddleware.validExistPay, paymentsController.findOne);

router.get('/student/:id', paymentsController.findAll);

export default router;
