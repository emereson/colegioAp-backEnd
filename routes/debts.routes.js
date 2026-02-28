import express from 'express';

import * as debtsMiddleware from '../middlewares/debts.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as studentMiddleware from '../middlewares/student.middleware.js';

import * as debtsController from '../controllers/debts.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/students', debtsController.findAllStudents);

router.get(
  '/student/:id',
  studentMiddleware.validExistStudent,
  debtsController.findAllStudent,
);

router
  .route('/:id')
  .post(studentMiddleware.validExistStudent, debtsController.create)
  .patch(debtsMiddleware.validExistDebt, debtsController.update)
  .delete(debtsMiddleware.validExistDebt, debtsController.remove)
  .get(debtsMiddleware.validExistDebt, debtsController.findOne);

export default router;
