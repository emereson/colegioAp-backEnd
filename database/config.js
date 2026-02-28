import { Sequelize } from 'sequelize';

const db = new Sequelize({
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 120000,
    idle: 10000,
  },
  dialectOptions: {
    statement_timeout: 300000,
    query_timeout: 300000,
  },
});

export default db;
