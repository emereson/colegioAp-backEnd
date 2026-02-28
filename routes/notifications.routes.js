import express from 'express';
import { upload } from '../utils/multer.js';

import * as notificationsMiddleware from '../middlewares/notifications.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as notificationsController from '../controllers/notifications.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', notificationsController.findAll);

router.post(
  '/',
  upload.single('notificationImg'),
  notificationsController.create,
);

router
  .route('/:id')
  .get(
    notificationsMiddleware.validExistNotifications,
    notificationsController.findOne,
  )
  .patch(
    upload.single('notificationImg'),
    notificationsMiddleware.validExistNotifications,
    notificationsController.update,
  )
  .delete(
    notificationsMiddleware.validExistNotifications,
    notificationsController.remove,
  );

export default router;
