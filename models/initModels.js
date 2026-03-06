import Attendance from './attendance.model.js';
import Classroom from './classroom.model.js';
import ClassroomsStudent from './classroomsStudents.model.js';
import Exam from './exams.model.js';
import Debts from './debts.model.js';
import Course from './course.model.js';
import GaleryPhotos from './galeryPhotos.model.js';
import GaleryPhotosImg from './galeryPhotosImg.js';
import Observations from './observations.model.js';
import Payments from './payments.model.js';
import Student from './student.model.js';
import SemanaEvaluacion from '../modules/evaluaciones/semanaEvaluacion/semanaEvaluacion.model.js';
import Evaluaciones from '../modules/evaluaciones/evaluacion/evaluacion.model.js';
import PreguntaEvaluacion from '../modules/evaluaciones/preguntasEvaluacion/preguntaEvaluacion.model.js';
import ResultadosEvaluacion from '../modules/evaluaciones/resultadosEvaluacion/resultadosEvaluacion.model.js';

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

  Classroom.hasMany(SemanaEvaluacion, {
    foreignKey: 'aula_id',
    as: 'semanas_evaluaciones',
  });
  SemanaEvaluacion.belongsTo(Classroom, {
    foreignKey: 'aula_id',
    as: 'aula',
  });

  Classroom.hasMany(Evaluaciones, {
    foreignKey: 'aula_id',
    as: 'evaluaciones',
  });
  Evaluaciones.belongsTo(Classroom, {
    foreignKey: 'aula_id',
    as: 'aula',
  });

  SemanaEvaluacion.hasMany(Evaluaciones, {
    foreignKey: 'semana_id',
    as: 'evaluaciones',
  });
  Evaluaciones.belongsTo(SemanaEvaluacion, {
    foreignKey: 'semana_id',
    as: 'semana_evaluacion',
  });

  Evaluaciones.hasMany(PreguntaEvaluacion, {
    foreignKey: 'evaluacion_id',
    as: 'preguntas_evaluacion',
  });
  PreguntaEvaluacion.belongsTo(Evaluaciones, {
    foreignKey: 'evaluacion_id',
    as: 'evaluacion',
  });

  Evaluaciones.hasOne(ResultadosEvaluacion, {
    foreignKey: 'evaluacion_id',
    as: 'resultados_evaluacion',
  });
  ResultadosEvaluacion.belongsTo(Evaluaciones, {
    foreignKey: 'evaluacion_id',
    as: 'evaluacion',
  });
};

export default initModel;
