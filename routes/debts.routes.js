const express = require('express');

const debtsMiddleware = require('../middlewares/debts.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const studentMiddleware = require('../middlewares/student.middleware');

const debtsController = require('../controllers/debts.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/students', debtsController.findAllStudents);
router.get(
  '/student/:id',
  studentMiddleware.validExistStudent,
  debtsController.findAllStudent
);

router
  .route('/:id')
  .post(studentMiddleware.validExistStudent, debtsController.create)
  .patch(debtsMiddleware.validExistDebt, debtsController.update)
  .delete(debtsMiddleware.validExistDebt, debtsController.delete)
  .get(debtsMiddleware.validExistDebt, debtsController.findOne);

module.exports = router;
