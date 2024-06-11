const express = require('express');
const { upload } = require('../utils/multer');

const calendarMiddleware = require('../middlewares/calendar.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const calendarController = require('../controllers/calendar.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', calendarController.findAll);
router.post('/', upload.single('calendarImg'), calendarController.create);

router
  .route('/:id')
  .get(
    calendarMiddleware.validExistCalendar,

    calendarController.findOne
  )
  .patch(
    upload.single('calendarImg'),
    calendarMiddleware.validExistCalendar,
    calendarController.update
  )
  .delete(calendarMiddleware.validExistCalendar, calendarController.delete);

module.exports = router;
