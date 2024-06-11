const Observations = require('../models/observations.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.validExistObservations = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const observation = await Observations.findOne({
    where: {
      id,
    },
  });
  if (!observation) {
    return next(new AppError(`data of the observation not found`, 404));
  }
  req.observation = observation;
  next();
});
