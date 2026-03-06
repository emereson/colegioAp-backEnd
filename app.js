import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';

import AppError from './utils/AppError.js';
import globalErrorHandler from './controllers/error.controllers.js';
import { rateLimit } from 'express-rate-limit';

import usersRouter from './routes/users.routes.js';
import classroomRouter from './routes/classroom.routes.js';
import classroomsStudentRouter from './routes/classroomsStudent.routes.js';
import courseRouter from './routes/course.routes.js';
import examRouter from './routes/exam.routes.js';
import studentRouter from './routes/student.routes.js';
import attendanceRouter from './routes/attendance.routes.js';
import paymentsRouter from './routes/payments.routes.js';
import debtsRouter from './routes/debts.routes.js';
import observationsRouter from './routes/observations.routes.js';
import notificationsRouter from './routes/notifications.routes.js';
import calendarRouter from './routes/calendar.routes.js';
import galeryPhotosRouter from './routes/galeryPhotos.routes.js';
import accessStudentRouter from './routes/accessStudent.routes.js';
import vincularWspRouter from './routes/vincularWsp.js';
import archivosRouter from './modules/archivos/archivos.routes.js';
import studentFilesRouter from './modules/studentFiles/studentFiles.routes.js';
import semanaEvaluacionesRouter from './modules/evaluaciones/semanaEvaluacion/semanaEvaluacion.routes.js';
import evaluacionRouter from './modules/evaluaciones/evaluacion/evaluacion.routes.js';
import resuldatosEvaluacionRouter from './modules/evaluaciones/resultadosEvaluacion/resultadosEvaluacion.routes.js';

const app = express();

app.set('trust proxy', 1);

const limiter = rateLimit({
  max: 1000000,
  windowMs: 60 * 60 * 1000,
  message: 'too many request from this IP , please try again in one hour ',
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(hpp());

app.use('/api/v1', limiter);
app.use('/api/v1/user', usersRouter);
app.use('/api/v1/classroom', classroomRouter);
app.use('/api/v1/classrooms-student', classroomsStudentRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/exam', examRouter);
app.use('/api/v1/student', studentRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/debts', debtsRouter);
app.use('/api/v1/observation', observationsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/calendar', calendarRouter);
app.use('/api/v1/galeryPhotos', galeryPhotosRouter);
app.use('/api/v1/accessStudent', accessStudentRouter);
app.use('/api/v1/vincular-wsp', vincularWspRouter);
app.use('/api/v1/archivos', archivosRouter);
app.use('/api/v1/student-files', studentFilesRouter);
// evaluaciones
app.use('/api/v1/semana-evaluaciones', semanaEvaluacionesRouter);
app.use('/api/v1/evaluacion', evaluacionRouter);
app.use('/api/v1/resultado-evaluacion', resuldatosEvaluacionRouter);

// evaluaciones

app.use((req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this seerver! 💀`, 404),
  );
});

app.use(globalErrorHandler);

export default app;
