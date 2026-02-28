import Debts from '../models/debts.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistDebt = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const debt = await Debts.findOne({
    where: {
      id,
    },
  });
  if (!debt) {
    return next(new AppError(`data of the debt not found`, 404));
  }
  req.debt = debt;
  next();
});
