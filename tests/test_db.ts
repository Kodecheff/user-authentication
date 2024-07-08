import { pool, rootPool } from '../db';
import dotEnv from 'dotenv'

// import { Client } from 'pg';

const isTestEnv = process.env.NODE_ENV === 'test';

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const hostname = process.env.HOSTNAME;
const DBName = process.env.DATABASE_NAME;


export async function setTestDatabase(){

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
}

export async function disconnectTestDatabase() {
  await pool.end()
}

export async function clearTestDatabase() {

  pool.end()

  rootPool.connect()
  // if (DBName != 'hng-test' || process.env.NODE_ENV != 'test')
  //   throw Error('PANIC FAILURE - Clearing DB in non-test connection!!!')

  await pool.query('BEGIN')

  console.log("Clear Database")

  await pool.query('COMMIT')

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