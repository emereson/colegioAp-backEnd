require('dotenv').config();
const app = require('./app');
const { db } = require('./database/config');
const initModel = require('./models/initModels');
const logger = require('./utils/logger');

db.authenticate()
  .then(() => logger.info('Database Authenticated! ✔'))
  .catch((error) => logger.info(error));

initModel();

db.sync()
  .then(() => logger.info('Database Synced! ❤'))
  .catch((error) => logger.info(error));

const port = +process.env.PORT || 3026;

app.listen(port, () => {
  logger.info(`App Running on port ${port}`);
});
