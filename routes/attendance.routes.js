import express from 'express';

import * as attendanceMiddleware from '../middlewares/attendance.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as classroomMiddleware from '../middlewares/classroom.middleware.js';

import * as attendanceController from '../controllers/attendance.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', attendanceController.findAll);
router.get('/classroom/:id/:fecha', attendanceController.findAllAttendance);
router.post('/classroom', attendanceController.createsOrUpdates);

router
  .route('/:id')
  .post(classroomMiddleware.validExistClassroom, attendanceController.create)
  .patch(attendanceMiddleware.validExistAttendance, attendanceController.update)
  .get(attendanceMiddleware.validExistAttendance, attendanceController.findOne);

export default router;
