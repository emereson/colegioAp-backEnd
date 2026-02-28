import express from 'express';
import { upload } from '../utils/multer.js';

import * as galeryPhotosMiddleware from '../middlewares/galeryPhotos.middleware.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';
import * as galeryPhotosController from '../controllers/galeryPhotos.controller.js';

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', galeryPhotosController.findAll);

router.post(
  '/',
  upload.array('galleryImgUrl', 50),
  galeryPhotosController.create,
);

router
  .route('/:id')
  .delete(
    galeryPhotosMiddleware.validExistGaleryPhotos,
    galeryPhotosController.remove,
  )
  .get(
    galeryPhotosMiddleware.validExistGaleryPhotos,
    galeryPhotosController.findOne,
  );

export default router;
