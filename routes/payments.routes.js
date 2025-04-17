const express = require('express');

const paymentsMiddleware = require('../middlewares/payments.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const classroomsStudentMiddleware = require('../middlewares/classroomStudent.middleware');

const paymentsController = require('../controllers/payments.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/students', paymentsController.findAllStudents);

router
  .route('/:id')
  .post(
    classroomsStudentMiddleware.validExistClassroomsStudent,
    paymentsController.create
  )
  .patch(paymentsMiddleware.validExistPay, paymentsController.update)
  .delete(paymentsMiddleware.validExistPay, paymentsController.delete)
  .get(paymentsMiddleware.validExistPay, paymentsController.findOne);

router.get('/student/:id', paymentsController.findAll);
module.exports = router;
