const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const courseMiddleware = require('../middlewares/course.middleware');
const courseExamMiddleware = require('../middlewares/courseExam.middleware');
const courseExamController = require('../controllers/courseExam.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', courseExamController.findAll);

router
  .route('/:id')
  .post(courseMiddleware.validExistCourse, courseExamController.create)
  .patch(courseExamMiddleware.validExistCourseExam, courseExamController.update)
  .delete(
    courseExamMiddleware.validExistCourseExam,
    courseExamController.delete
  )
  .get(courseExamMiddleware.validExistCourseExam, courseExamController.findOne);

module.exports = router;
