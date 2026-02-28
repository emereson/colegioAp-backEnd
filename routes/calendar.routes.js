import express from 'express';
import { upload } from '../utils/multer.js';

import * as calendarMiddleware from '../middlewares/calendar.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as calendarController from '../controllers/calendar.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', calendarController.findAll);
router.post('/', upload.single('calendarImg'), calendarController.create);

router
  .route('/:id')
  .get(calendarMiddleware.validExistCalendar, calendarController.findOne)
  .patch(
    upload.single('calendarImg'),
    calendarMiddleware.validExistCalendar,
    calendarController.update,
  )
  .delete(calendarMiddleware.validExistCalendar, calendarController.remove);

export default router;
