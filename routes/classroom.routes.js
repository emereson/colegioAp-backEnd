import express from 'express';

import * as classroomMiddleware from '../middlewares/classroom.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as classroomController from '../controllers/classroom.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', classroomController.findAll);
router.get('/student/:id', classroomController.findAllStudent);
router.post('/', classroomController.create);

router
  .route('/:id')
  .get(classroomMiddleware.validExistClassroom, classroomController.findOne)
  .patch(classroomMiddleware.validExistClassroom, classroomController.update)
  .delete(classroomMiddleware.validExistClassroom, classroomController.remove);

export default router;
