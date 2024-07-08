import jwt from 'jsonwebtoken'
import supertest from 'supertest'
import config from '../src/config'
import { pool } from '../db';

import { setTestDatabase, clearTestDatabase, disconnectTestDatabase } from "./test_db";
// import { clearTestDatabase } from '../db';

export const request = supertest(`${config.hostname}:${config.port}`)
const DBName = process.env.DATABASE_NAME;

jest.setTimeout(60000); // 30 seconds timeout

describe('User Test', () => {

  describe('User Registration Tests', () => {
    it('PASS: should register a user successfully', async () => {
      const userData = {
        firstName: 'Pascal',
        lastName: 'Akunne',
        email: 'test@gmail.com',
        password: 'password',
        phone: '123456'
      };

      const response = await request
        .post('/auth/register')
        .send(userData)
        .trustLocalhost()

      console.log(response.text)
    })


    it('PASS: should login a user successfully', async () => {
      const userData = {
        email: 'test@gmail.com',
        password: 'password',
      };

      const response = await request
        .post('/auth/login')
        .send(userData)
        .trustLocalhost()

      const { status, data, accessToken } = response.body
      
      const decodedToken = jwt.decode(accessToken)

      expect(status).toBe('success')
      expect(decodedToken).toBe(data.user.userId)
      expect(data.user.firstName).toBe('Pascal')
      expect(data.user.lastName).toBe('Akunne')
    })

    it('FAIL: try to register user with missing required field', async () => {
      const userData = {
        firstName: 'Pascal',
        lastName: 'Akunne',
        password: 'password',
        phone: '123456'
      };

      const result = await request
        .post('/auth/register')
        .send(userData)
        .trustLocalhost()

      const {errors} = result.body

      expect(result.status).toBe(422)
      expect(errors[0].msg).toBe('Incorrect email format')
    })

    it('FAIL: register two users with the same email.', async () => {
      const userData1 = {
        firstName: 'Khal',
        lastName: 'Stephen',
        email: 'test1@gmail.com',
        password: 'password',
        phone: '123456'
      };

      const userData2 = {
        firstName: 'Pascal',
        lastName: 'Akunne',
        email: 'test1@gmail.com',
        password: 'password',
        phone: '123456'
      };

      const result1 = await request
        .post('/auth/register')
        .send(userData1)
        .trustLocalhost()

      expect(result1.status).toBe(201)
      expect(result1.body.status).toBe('success')

      const result2 = await request
        .post('/auth/register')
        .send(userData2)
        .trustLocalhost()

      console.log(result2.body)

      expect(result2.body.statusCode).toBe(400)
      expect(result2.body.status).toBe('Bad request')
    })
  });
})