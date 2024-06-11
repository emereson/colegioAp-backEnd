const express = require('express');
const { upload } = require('../utils/multer');

const studentMiddleware = require('../middlewares/student.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

const studentController = require('../controllers/student.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', studentController.findAll);

router.post('/', upload.single('studentImg'), studentController.signup);
router.get('/classroom', studentController.findAllClasroom);
router.get('/classroomAttendance', studentController.findAllClasroomAttendance);
router.get('/classroomExam', studentController.findAllClassroomExam);
router.get('/classroomExamName', studentController.findAllClassroomExamName);
router.get('/searchLastName', studentController.findAllLastName);

router.get('/:id/classroom', studentController.findAllClasroomStudent);

router
  .route('/:id')
  .patch(
    upload.single('studentImg'),
    studentMiddleware.validExistStudent,
    studentController.update
  )
  .delete(studentMiddleware.validExistStudent, studentController.delete)
  .get(studentMiddleware.validExistStudent, studentController.findOne);

module.exports = router;
