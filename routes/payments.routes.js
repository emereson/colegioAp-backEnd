const express = require('express');

const paymentsMiddleware = require('../middlewares/payments.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const classroomMiddleware = require('../middlewares/classroom.middleware');

const paymentsController = require('../controllers/payments.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/:id')
  .post(classroomMiddleware.validExistClassroom, paymentsController.create)
  .patch(paymentsMiddleware.validExistPay, paymentsController.update)
  .delete(paymentsMiddleware.validExistPay, paymentsController.delete)
  .get(paymentsMiddleware.validExistPay, paymentsController.findOne);

router.get('/student/:id', paymentsController.findAll);
module.exports = router;
