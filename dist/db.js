"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootPool = exports.pool = void 0;
exports.clearTestDatabase = clearTestDatabase;
const pg_1 = require("pg");
const config_1 = __importDefault(require("./src/config"));
const isProduction = process.env.NODE_ENV === 'production';
const username = config_1.default.db.username;
const password = config_1.default.db.password;
const hostname = config_1.default.db.hostname;
const DBName = config_1.default.db.database;
const DBPort = config_1.default.db.port;
const connString = `postgres://${username}:${password}@${hostname}:${DBPort}/${DBName}`;
exports.pool = new pg_1.Client({
    connectionString: isProduction ? process.env.DATABASE_URL : connString
});
exports.rootPool = exports.pool;
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
function clearTestDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.pool.query(createUsersTable, (err, res) => {
    if (err)
        console.log(err);
});
exports.pool.query(createOrgTable, (err, res) => {
    if (err)
        console.log(err);
});
exports.pool.query(user_organisation, (err, res) => {
    if (err)
        console.log(err);
});
//# sourceMappingURL=db.js.map