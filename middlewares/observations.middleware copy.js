import Observations from '../models/observations.model.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const validExistObservations = catchAsync(async (req, res, next) => {
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
