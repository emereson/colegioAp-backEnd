import Payments from '../models/payments.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistPay = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const pay = await Payments.findOne({
    where: {
      id,
    },
  });
  if (!pay) {
    return next(new AppError(`data of the pay not found`, 404));
  }
  req.pay = pay;
  next();
});
