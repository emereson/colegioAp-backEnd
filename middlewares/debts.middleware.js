const Debts = require('../models/debts.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.validExistDebt = catchAsync(async (req, res, next) => {
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
