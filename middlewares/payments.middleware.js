const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Payments = require('../models/payments.model');

exports.validExistPay = catchAsync(async (req, res, next) => {
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
