import { Pool, Client } from 'pg'
import dotEnv from 'dotenv'

//Configure environment variables
dotEnv.config({path: './.env'})

const isProduction = process.env.NODE_ENV === 'production';

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const hostname = process.env.HOSTNAME;


const connString = `postgres://${username}:${password}@${hostname}:5432/hng`

export const pool = new Client({
  connectionString: isProduction ? process.env.DATABASE_URL : connString
})

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users(
    userId VARCHAR(255) PRIMARY KEY UNIQUE NOT NULL,
    firstName VARCHAR(30) NOT NULL,
    lastName VARCHAR(30) NOT NULL,
    email VARCHAR(60) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password TEXT NOT NULL
  );
`;

const createOrgTable = `
  CREATE TABLE IF NOT EXISTS organisations(
    orgId VARCHAR(255) PRIMARY KEY NOT NULL UNIQUE,
    name VARCHAR(30) NOT NULL,
    description TEXT,
    owner_id VARCHAR(255) REFERENCES users(userid) ON DELETE CASCADE
  );
`;


const user_organisation = `
  CREATE TABLE IF NOT EXISTS user_organisations(
    orgId VARCHAR(255) NOT NULL REFERENCES organisations(orgid) ON DELETE CASCADE,
    userId VARCHAR(255) NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    PRIMARY KEY (userid, orgid)
  );
`;

pool.query(createUsersTable, (err, res) => {
  if(err) console.log(err)
})

pool.query(createOrgTable, (err, res) => {
  if(err) console.log(err)
})

pool.query(user_organisation, (err, res) => {
  if(err) console.log(err)
})