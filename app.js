const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/error.controllers');
const { rateLimit } = require('express-rate-limit');
const xss = require('xss-clean');

const usersRouter = require('./routes/users.routes');
const classroomRouter = require('./routes/classroom.routes');
const classroomsStudentRouter = require('./routes/classroomsStudent.routes');
const courseRouter = require('./routes/course.routes');
const examRouter = require('./routes/exam.routes');
const studentRouter = require('./routes/student.routes');
const attendanceRouter = require('./routes/attendance.routes');
const paymentsRouter = require('./routes/payments.routes');
const debtsRouter = require('./routes/debts.routes');
const observationsRouter = require('./routes/observations.routes');
const notificationsRouter = require('./routes/notifications.routes');
const calendarRouter = require('./routes/calendar.routes');
const galeryPhotosRouter = require('./routes/galeryPhotos.routes');
const accessStudentRouter = require('./routes/accessStudent.routes');
const vincularWspRouter = require('./routes/vincularWsp');
const archivosRouter = require('./modules/archivos/archivos.routes');
const studentFilesRouter = require('./modules/studentFiles/studentFiles.routes');

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
app.use(xss());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
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

app.all('*', (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this seerver! 💀`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
