const express = require('express');

const studentMiddleware = require('../middlewares/student.middleware');

const calendarController = require('../controllers/calendar.controller');
const studentController = require('../controllers/student.controller');
const notificationsController = require('../controllers/notifications.controller');
const galeryPhotosController = require('../controllers/galeryPhotos.controller');
const classroomController = require('../controllers/classroom.controller');
const classroomMiddleware = require('../middlewares/classroom.middleware');

const router = express.Router();

router.get('/gallery', galeryPhotosController.findAll);
router.post('/login', studentController.login);
router.use(studentMiddleware.protect);
router.get(
  '/classroom/:id',
  classroomMiddleware.validExistClassroom,
  classroomController.findOne
);

router.get('/notifications', notificationsController.findAll);
router.get('/calendar', calendarController.findAll);
router.get(
  '/:id',
  studentMiddleware.validExistStudent2,
  studentMiddleware.protectAccountOwner,
  studentController.findOne
);

module.exports = router;
