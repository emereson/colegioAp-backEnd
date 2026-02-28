import express from 'express';

import * as examMiddleware from '../middlewares/exam.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as courseMiddleware from '../middlewares/course.middleware.js';

import * as examController from '../controllers/exam.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', examController.findAll);
router.get('/whatsApp/:id/:nameExam', examController.whatsApp);
router.post('/classrooms', examController.createClassrooms);

router
  .route('/:id')
  .post(courseMiddleware.validExistCourse, examController.create)
  .patch(examMiddleware.validExistExam, examController.update)
  .delete(examMiddleware.validExistExam, examController.remove)
  .get(examMiddleware.validExistExam, examController.findOne);

export default router;
