const Attendance = require('./attendance.model');
const Classroom = require('./classroom.model');
const ClassroomsStudent = require('./classroomsStudents.model');
const Course = require('./courses.model');
const Debts = require('./debts.model');
const Exam = require('./exam.model');
const GaleryPhotos = require('./galeryPhotos.model');
const GaleryPhotosImg = require('./galeryPhotosImg');
const Observations = require('./observations.model');
const Payments = require('./payments.model');
const Student = require('./student.model');

const initModel = () => {
  Student.hasMany(Observations, { foreignKey: 'studentId' });
  Observations.belongsTo(Student, { foreignKey: 'studentId' });

  Student.hasMany(Classroom, { foreignKey: 'student_id' });
  Classroom.belongsTo(Student, { foreignKey: 'student_id' });

  Student.hasMany(ClassroomsStudent, { foreignKey: 'student_id' });
  ClassroomsStudent.belongsTo(Student, { foreignKey: 'student_id' });

  Classroom.hasMany(ClassroomsStudent, { foreignKey: 'classroom_id' });
  ClassroomsStudent.belongsTo(Classroom, { foreignKey: 'classroom_id' });

  Student.hasMany(Debts, { foreignKey: 'studentId' });
  Debts.belongsTo(Student, { foreignKey: 'studentId' });

  Classroom.hasMany(Course, { foreignKey: 'classroomId' });
  Course.belongsTo(Classroom, { foreignKey: 'classroomId' });

  Classroom.hasMany(Payments, { foreignKey: 'classroomId' });
  Payments.belongsTo(Classroom, { foreignKey: 'classroomId' });

  Classroom.hasMany(Attendance, { foreignKey: 'classroomId' });
  Attendance.belongsTo(Classroom, { foreignKey: 'classroomId' });

  Course.hasMany(Exam, { foreignKey: 'courseId' });
  Exam.belongsTo(Course, { foreignKey: 'courseId' });

  GaleryPhotos.hasMany(GaleryPhotosImg, { foreignKey: 'galeryPhotosId' });
  GaleryPhotosImg.belongsTo(GaleryPhotos, { foreignKey: 'galeryPhotosId' });
};

module.exports = initModel;
