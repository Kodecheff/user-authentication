import { Client } from 'pg'
import config from './src/config'
// import { User } from 'src/models/User';
import dotEnv = require('dotenv')

const isProduction = process.env.NODE_ENV === 'production';

const username = config.db.username
const password = config.db.password
const hostname = config.db.hostname
const DBName = config.db.database
const DBPort = config.db.port


const connString = `postgres://${username}:${password}@${hostname}:${DBPort}/${DBName}`

export const pool = new Client({
  connectionString: isProduction ? process.env.DATABASE_URL : connString
})

export const rootPool = pool


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
    description TEXT
  );
`;


const user_organisation = `
  CREATE TABLE IF NOT EXISTS user_organisations(
    orgId VARCHAR(255) NOT NULL REFERENCES organisations(orgid) ON DELETE CASCADE,
    userId VARCHAR(255) NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    PRIMARY KEY (userid, orgid)
  );
`;

export async function clearTestDatabase() {
  // if (DBName != 'hng-test' || process.env.NODE_ENV != 'test')
  //   throw Error('PANIC FAILURE - Clearing DB in non-test connection!!!')

  // await pool.query('BEGIN')

  // await pool.query('COMMIT')

  // const drop = await pool.query(`DROP DATABASE ${DBName}`)
  // // console.log(drop)
  // if(drop.rows.length === 0){
  //   console.log("Drop 1")
  //   return
  // }else{
  //   console.log("Drop 2")
  //   return
  // }

  // await pool.query(`CREATE DATABASE IF NOT EXISTS ${DBName}`)
  // await setTestDatabase()

  // console.log('Database reset')
}

pool.query(createUsersTable, (err, res) => {
  if(err) console.log(err)
})

pool.query(createOrgTable, (err, res) => {
  if(err) console.log(err)
})

pool.query(user_organisation, (err, res) => {
  if(err) console.log(err)
})