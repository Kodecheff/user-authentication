import dotenv from 'dotenv';
import path from 'path';
import { pool } from '../db';

const env = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(__dirname, `../.${env}.env`)
});

export default {
  env,
  port: process.env.PORT || 1999,
  server_msg: process.env.SERVER_LOG as string,
  hostname: process.env.HOSTNAME as string,
  db: {
    username: process.env.USERNAME as string,
    hostname: process.env.HOSTNAME as string,
    database: process.env.DATABASE_NAME as string,
    password: process.env.PASSWORD as string,
    port: process.env.DB_PORT,
  },
};