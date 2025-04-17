const express = require('express');

const examMiddleware = require('../middlewares/exam.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const courseMiddleware = require('../middlewares/course.middleware');

const examController = require('../controllers/exam.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', examController.findAll);
router.get('/whatsApp/:id/:nameExam', examController.whatsApp);
router.post('/classrooms', examController.createClassrooms);

router
  .route('/:id')
  .post(courseMiddleware.validExistCourse, examController.create)
  .patch(examMiddleware.validExistExam, examController.update)
  .delete(examMiddleware.validExistExam, examController.delete)
  .get(examMiddleware.validExistExam, examController.findOne);

module.exports = router;
