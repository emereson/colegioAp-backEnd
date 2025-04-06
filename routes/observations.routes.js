const express = require('express');

const observationsMiddleware = require('../middlewares/observations.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const studentMiddleware = require('../middlewares/student.middleware');

const observationsController = require('../controllers/observations.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/student/:id',
  studentMiddleware.validExistStudent,
  observationsController.findAllStudentId
);

router
  .route('/:id')
  .post(studentMiddleware.validExistStudent, observationsController.create)
  .patch(
    observationsMiddleware.validExistObservations,
    observationsController.update
  )
  .delete(
    observationsMiddleware.validExistObservations,
    observationsController.delete
  )
  .get(
    observationsMiddleware.validExistObservations,
    observationsController.findOne
  );

module.exports = router;
