import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import ClassroomsStudent from '../models/classroomsStudents.model.js';
import Exam from '../models/exams.model.js';
import Attendance from '../models/attendance.model.js';
import Course from '../models/course.model.js';

export const validExistClassroomsStudent = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const classroom = await ClassroomsStudent.findOne({
      where: {
        id,
      },
    });

    if (!classroom) {
      return next(new AppError(`Data of the classroom not found`, 404));
    }

    req.classroom = classroom;
    next();
  },
);

export const validExistClassroomsStudentIncluide = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;

    const classroom = await ClassroomsStudent.findOne({
      where: { id },
      include: [
        {
          model: Exam,
          include: [{ model: Course }],
        },
        { model: Attendance },
      ],
      order: [[Exam, Course, 'name', 'ASC']],
    });

    if (!classroom) {
      return next(new AppError(`Data of the classroom not found`, 404));
    }

    req.classroom = classroom;
    next();
  },
);
