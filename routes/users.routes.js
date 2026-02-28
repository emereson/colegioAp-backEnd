import express from 'express';

import * as userMiddleware from '../middlewares/user.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as userController from '../controllers/user.controllers.js';

const router = express.Router();

router.post('/login', userController.login);
router.use(authMiddleware.protect);
router.post('/signup', userController.signup);
router.get('/', userController.findAll);

router
  .route('/:id')
  .patch(userMiddleware.validExistUser, userController.update)
  .delete(userMiddleware.validExistUser, userController.remove)
  .get(userMiddleware.validExistUser, userController.findOne);

export default router;
