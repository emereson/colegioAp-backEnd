import express from 'express';

import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as courseMiddleware from '../middlewares/course.middleware.js';
import * as courseExamMiddleware from '../middlewares/courseExam.middleware.js';
import * as courseExamController from '../controllers/courseExam.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', courseExamController.findAll);

router
  .route('/:id')
  .post(courseMiddleware.validExistCourse, courseExamController.create)
  .patch(courseExamMiddleware.validExistCourseExam, courseExamController.update)
  .delete(
    courseExamMiddleware.validExistCourseExam,
    courseExamController.remove,
  )
  .get(courseExamMiddleware.validExistCourseExam, courseExamController.findOne);

export default router;
