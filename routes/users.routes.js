const express = require('express');

const userMiddleware = require('../middlewares/user.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const userController = require('../controllers/user.controllers');

const router = express.Router();

router.post('/login', userController.login);
router.use(authMiddleware.protect);
router.post('/signup', userController.signup);
router.get('/', userController.findAll);

router
  .route('/:id')
  .patch(userMiddleware.validExistUser, userController.update)
  .delete(userMiddleware.validExistUser, userController.delete)
  .get(userMiddleware.validExistUser, userController.findOne);

module.exports = router;
