import express = require('express');
import dotEnv = require('dotenv')
import fileUpload = require('express-fileupload');
import session = require('express-session')
import { Session } from 'express-session';

import authRoute from './routers/auth'
import apiRoute from './routers/api'
import logger from './middlewares/logger';
import { pool } from '../db';

const app = express()

const port = 1999

// Sessioning
export interface CustomSession extends Session {
  userId: string;
}


//Configure environment variables
dotEnv.config({path: './.env'})


app.use(fileUpload())

app.use(express.urlencoded({extended: false}))
app.use(express.json());

// connect to database
pool.connect().then(() => {
  console.log('Connected to PostgreSQL database');
})
.catch((err) => {
  console.error('Error connecting to PostgreSQL database', err);
});


//configure middleware
app.use(logger)
app.use(session({
  secret: process.env.SESSION_KEY as string,
  resave: false,
  saveUninitialized: false
}))

//Routes
app.use('/auth', authRoute)
app.use('/api', apiRoute)

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send("Welcome to my HNG task 2")
})


app.listen(port, () => {
  console.log(`Server running on port: ${port}`)
})