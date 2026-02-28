import express from 'express';

import * as courseMiddleware from '../middlewares/course.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as classroomMiddleware from '../middlewares/classroom.middleware.js';

import * as courseController from '../controllers/course.controller.js';

const router = express.Router();

router.get('/', courseController.findAll);

router.use(authMiddleware.protect);

router.patch('/notas', courseController.updateNotas);
router.post('/students', courseController.createStudens);

router
  .route('/:id')
  .post(classroomMiddleware.validExistClassroom, courseController.create)
  .patch(courseMiddleware.validExistCourse, courseController.update)
  .delete(courseMiddleware.validExistCourse, courseController.remove)
  .get(courseMiddleware.validExistCourse, courseController.findOne);

export default router;
