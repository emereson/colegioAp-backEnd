const Attendance = require('./attendance.model');
const Classroom = require('./classroom.model');
const ClassroomsStudent = require('./classroomsStudents.model');
const Exam = require('./exams.model');
const Debts = require('./debts.model');
const Course = require('./course.model');
const GaleryPhotos = require('./galeryPhotos.model');
const GaleryPhotosImg = require('./galeryPhotosImg');
const Observations = require('./observations.model');
const Payments = require('./payments.model');
const Student = require('./student.model');

const initModel = () => {
  Student.hasMany(Observations, { foreignKey: 'studentId' });
  Observations.belongsTo(Student, { foreignKey: 'studentId' });

  Student.hasMany(ClassroomsStudent, { foreignKey: 'student_id' });
  ClassroomsStudent.belongsTo(Student, { foreignKey: 'student_id' });

  ClassroomsStudent.hasMany(Exam, { foreignKey: 'classroom_student_id' });
  Exam.belongsTo(ClassroomsStudent, { foreignKey: 'classroom_student_id' });

  Classroom.hasMany(ClassroomsStudent, { foreignKey: 'classroom_id' });
  ClassroomsStudent.belongsTo(Classroom, { foreignKey: 'classroom_id' });

  Student.hasMany(Debts, { foreignKey: 'studentId' });
  Debts.belongsTo(Student, { foreignKey: 'studentId' });

  // Classroom.hasMany(Course, { foreignKey: 'classroomId' });
  // Course.belongsTo(Classroom, { foreignKey: 'classroomId' });

  ClassroomsStudent.hasMany(Payments, { foreignKey: 'classroom_student_id' });
  Payments.belongsTo(ClassroomsStudent, { foreignKey: 'classroom_student_id' });

  Classroom.hasMany(Attendance, { foreignKey: 'classroomId' });
  Attendance.belongsTo(Classroom, { foreignKey: 'classroomId' });

  ClassroomsStudent.hasMany(Attendance, { foreignKey: 'classroom_student_id' });
  Attendance.belongsTo(ClassroomsStudent, {
    foreignKey: 'classroom_student_id',
  });

  Exam.hasMany(Course, { foreignKey: 'exam_id' });
  Course.belongsTo(Exam, { foreignKey: 'exam_id' });

  GaleryPhotos.hasMany(GaleryPhotosImg, { foreignKey: 'galeryPhotosId' });
  GaleryPhotosImg.belongsTo(GaleryPhotos, { foreignKey: 'galeryPhotosId' });
};

module.exports = initModel;
