import express = require("express");
import bcrypt = require("bcryptjs");
import jwt = require('jsonwebtoken')
import { body, validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";

import { pool } from "../../../db";
import { CustomSession } from "../../app";

const router = express.Router();

/*
----@usage: To register a user
----@url: /auth/register
----@access: PUBLIC
----@method: POST
*/
router.post(
  "/register",
  [
    body("firstName").not().isEmpty().withMessage("First name is required."),
    body("lastName").not().isEmpty().withMessage("Last name is required."),
    body("email").isEmail().withMessage("Incorrect email format"),
    body("password").not().isEmpty().withMessage("Password is required."),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      let { firstName, lastName, email, phone, password } = req.body;

      const users = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (users.rows.length > 0) {
        return res.status(400).json({
          status: "Bad request",
          message: "Registration unsuccessful",
          statusCode: 400
      });
      }

      // Encrypt password
      let salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      // Begin transaction
      await pool.query('BEGIN')

      let userId = uuidv4();

      //register user
      const result = await pool.query(
        "INSERT INTO users(userId, firstname, lastname, email, password, phone) VALUES($1, $2, $3, $4, $5, $6) RETURNING firstname, lastname, email, password, phone",
        [userId, firstName, lastName, email, password, phone]
      );

      let user = result.rows[0];

      //create organisation
      const orgQuery = await pool.query(`INSERT INTO organisations(orgid, name, description) VALUES($1, $2, $3) RETURNING *`, 
        [uuidv4(), `${user.firstname}'s Organisation`, null]
      )


      //create organisation
      await pool.query(`INSERT INTO user_organisations(orgid, userid) VALUES($1, $2)`, 
        [orgQuery.rows[0].orgid, userId]
      )

      //Commit the transaction
      await pool.query('COMMIT')

      if (!result.rows) {
        res.status(400).json({
          status: "Bad request",
          message: "Registration unsuccessful",
          statusCode: 400,
        });
      }

      (req.session as CustomSession).userId = user.userid;

      req.session.save((err) => {
        if (err) {
          console.log("Error saving session: ", err);
        }
      });

      const token = jwt.sign(user, process.env.SESSION_KEY as string)

      res.status(201).json({
        status: "success",
        message: "Registration successful",
        data: {
          accessToken: token,
          user: {
            userId: user.userid,
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            phone: user.phone,
          },
        },
      });
    } catch (err) {
      await pool.query('ROLLBACK');
      console.log(err)
      res.status(500).send({ error: 'Internal server error.' });
    }
  }
);

/*
----@usage: To login a user
----@url: /auth/login
----@access: PUBLIC
----@method: POST
*/
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Incorrect email format"),
    body("password").not().isEmpty().withMessage("Password is required."),
  ],
  async (req: express.Request, res: express.Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const results = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (!results.rows.length) {
        return res.status(401).json({
          status: "Bad request",
          message: "Authentication failed",
          statusCode: 401,
        });
      }

      const user = results.rows[0];

      let isMatch: boolean = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          status: "Bad request",
          message: "Authentication failed",
          statusCode: 401,
        });
      }


      (req.session as CustomSession).userId = user.userid;

      req.session.save((err) => {
        if (err) {
          console.log("Error saving session: ", err);
        }
      });

      const token = jwt.sign((req.session as CustomSession).userId, process.env.SESSION_KEY as string)

      res.status(200).json({
        status: "success",
        message: "Login successful",
        accessToken: token,
        data: {
          user: {
            userId: user.userid,
            firstName: user.firstname,
            lastName: user.lastname,
            email: user.email,
            phone: user.phone,
          },
        },
      });
    } catch (err) {
      console.log(err);
    }
});

export default router;
