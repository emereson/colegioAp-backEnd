const express = require('express');

const courseMiddleware = require('../middlewares/course.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const classroomMiddleware = require('../middlewares/classroom.middleware');

const courseController = require('../controllers/course.controller');

const router = express.Router();
router.get('/', courseController.findAll);

router.use(authMiddleware.protect);

router
  .route('/:id')
  .post(classroomMiddleware.validExistClassroom, courseController.create)
  .patch(courseMiddleware.validExistCourse, courseController.update)
  .delete(courseMiddleware.validExistCourse, courseController.delete)
  .get(courseMiddleware.validExistCourse, courseController.findOne);

module.exports = router;
