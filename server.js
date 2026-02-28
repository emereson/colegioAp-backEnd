import 'dotenv/config';
import app from './app.js';
import initModel from './models/initModels.js';
import logger from './utils/logger.js';
import db from './database/config.js';

db.authenticate()
  .then(() => logger.info('Database Authenticated! ✔'))
  .catch((error) => logger.info(error));

db.sync()
  .then(() => logger.info('Database Synced! ❤'))
  .catch((error) => logger.info(error));

initModel();
const port = +process.env.PORT || 3026;

app.listen(port, () => {
  logger.info(`App Running on port ${port}`);
});
