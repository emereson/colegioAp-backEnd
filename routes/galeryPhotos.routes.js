const express = require('express');
const { upload } = require('../utils/multer');

const galeryPhotosMiddleware = require('../middlewares/galeryPhotos.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const galeryPhotosController = require('../controllers/galeryPhotos.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', galeryPhotosController.findAll);

router.post(
  '/',
  upload.array('galleryImgUrl', 50),
  galeryPhotosController.create
);

router
  .route('/:id')

  .delete(
    galeryPhotosMiddleware.validExistGaleryPhotos,
    galeryPhotosController.delete
  )
  .get(
    galeryPhotosMiddleware.validExistGaleryPhotos,
    galeryPhotosController.findOne
  );

module.exports = router;
