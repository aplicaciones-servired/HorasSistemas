import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseName = process.env.DB_NAME ?? 'horas_sistemas';
const databaseUser = process.env.DB_USER ?? 'root';
const databasePassword = process.env.DB_PASSWORD ?? '';
const databaseHost = process.env.DB_HOST ?? 'localhost';
const enableLogging = process.env.DB_LOGGING === 'true';

export const sequelize = new Sequelize(databaseName, databaseUser, databasePassword, {
  host: databaseHost,
  dialect: 'mysql',
  logging: enableLogging ? console.log : false
});