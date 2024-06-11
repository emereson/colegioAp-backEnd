const express = require('express');
const { upload } = require('../utils/multer');

const notificationsMiddleware = require('../middlewares/notifications.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const notificationsController = require('../controllers/notifications.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', notificationsController.findAll);
router.post(
  '/',
  upload.single('notificationImg'),
  notificationsController.create
);

router
  .route('/:id')
  .get(
    notificationsMiddleware.validExistNotifications,
    notificationsController.findOne
  )
  .patch(
    upload.single('notificationImg'),
    notificationsMiddleware.validExistNotifications,
    notificationsController.update
  )
  .delete(
    notificationsMiddleware.validExistNotifications,
    notificationsController.delete
  );

module.exports = router;
