const express = require('express');

const classroomMiddleware = require('../middlewares/classroom.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const studentMiddleware = require('../middlewares/student.middleware');

const classroomController = require('../controllers/classroom.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', classroomController.findAll);
router.get('/student/:id', classroomController.findAllStudent);
router.post('/', classroomController.create);

router
  .route('/:id')
  .get(classroomMiddleware.validExistClassroom, classroomController.findOne)
  .patch(classroomMiddleware.validExistClassroom, classroomController.update)
  .delete(classroomMiddleware.validExistClassroom, classroomController.delete);

module.exports = router;
