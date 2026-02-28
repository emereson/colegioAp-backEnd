import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Student from '../models/student.model.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Classroom from '../models/classroom.model.js';
import Observations from '../models/observations.model.js';
import Debts from '../models/debts.model.js';
import ClassroomsStudent from '../models/classroomsStudents.model.js';

export const validExistStudent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const student = await Student.findOne({
    where: {
      id,
    },
  });

  if (!student) {
    return next(new AppError(`data of the student not found`, 404));
  }
  req.student = student;
  next();
});

export const validExistStudentIncluide = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const student = await Student.findOne({
    where: {
      id,
    },
    include: [
      {
        model: ClassroomsStudent,
        // include: [
        //   { model: Course, include: { model: Exam } },
        //   { model: Payments },
        //   { model: Attendance },
        // ],
      },
      {
        model: Observations,
      },
      {
        model: Debts,
      },
    ],
  });
  if (!student) {
    return next(new AppError(`data of the student not found`, 404));
  }
  req.student = student;
  req.Classroom = student.Classroom;
  req.Observations = student.Observations;
  req.Debts = student.Debts;
  next();
});

export const validExistStudent2 = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const student = await Student.findOne({
    where: {
      id,
    },
    include: [
      {
        model: ClassroomsStudent,
        include: [{ model: Classroom }],
      },
      {
        model: Observations,
      },
      {
        model: Debts,
      },
    ],
  });
  if (!student) {
    return next(new AppError(`data of the student not found`, 404));
  }
  req.student = student;

  next();
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in!, Please log in to get access', 401),
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.SECRET_JWT_SEED,
  );

  const student = await Student.findOne({
    where: {
      id: decoded.id,
    },
  });

  if (!student) {
    return next(
      new AppError('The owner of this token is not longer available', 401),
    );
  }

  if (student.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      student.passwordChangedAt.getTime() / 1000,
      10,
    );

    if (decoded.iat < changedTimeStamp) {
      return next(
        new AppError(
          'User recently changed password!, please login again.',
          401,
        ),
      );
    }
  }

  req.sessionUser = student;

  next();
});

export const protectAccountOwner = catchAsync(async (req, res, next) => {
  const { student, sessionUser } = req;

  if (student.id !== sessionUser.id) {
    return next(new AppError('You are not the owner of this account.', 401));
  }

  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    const { sessionUser } = req;

    if (!sessionUser || !sessionUser.role) {
      return next(new AppError('User role not defined or invalid', 403));
    }

    if (!roles.includes(sessionUser.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403),
      );
    }

    next();
  };
};
