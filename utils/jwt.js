const jwt = require('jsonwebtoken');
const logger = require('./logger');

const generateJWT = (id) => {
  return new Promise((resolve, reject) => {
    const payload = { id };

    jwt.sign(
      payload,
      process.env.SECRET_JWT_SEED,
      {
        expiresIn: process.env.JWT_EXPIRE_IN,
      },
      (err, token) => {
        if (err) {
          logger.info(err);
          reject(err);
        }

        resolve(token);
      }
    );
  });
};

module.exports = generateJWT;
