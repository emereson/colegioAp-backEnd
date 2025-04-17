const express = require('express');

const attemndanceMiddleware = require('../middlewares/attendance.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const classroomMiddleware = require('../middlewares/classroom.middleware');

const attemndanceController = require('../controllers/attendance.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', attemndanceController.findAll);
router.get('/classroom/:id/:fecha', attemndanceController.findAllAttendance);
router.post('/classroom', attemndanceController.createsOrUpdates);

router
  .route('/:id')
  .post(classroomMiddleware.validExistClassroom, attemndanceController.create)
  .patch(
    attemndanceMiddleware.validExistAttendance,
    attemndanceController.update
  )
  .get(
    attemndanceMiddleware.validExistAttendance,
    attemndanceController.findOne
  );

module.exports = router;
