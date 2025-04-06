const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const studentMiddleware = require('../middlewares/student.middleware');

const classroomsStudentController = require('../controllers/classroomsStudent.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/student/:id',
  studentMiddleware.validExistStudent,
  classroomsStudentController.findAll
);
router.post('/', classroomsStudentController.create);

// router
//   .route('/:id')
//   .get(
//     ClassroomsStudentMiddleware.validExistClassroomsStudent,
//     classroomsStudentController.findOne
//   )
//   .patch(
//     ClassroomsStudentMiddleware.validExistClassroomsStudent,
//     classroomsStudentController.update
//   )
//   .delete(
//     ClassroomsStudentMiddleware.validExistClassroomsStudent,
//     classroomsStudentController.delete
//   );

module.exports = router;
