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
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express_validator_1 = require("express-validator");
const uuid_1 = require("uuid");
const db_1 = require("../../../db");
const router = express.Router();
/*
----@usage: To register a user
----@url: /auth/register
----@access: PUBLIC
----@method: POST
*/
router.post("/register", [
    (0, express_validator_1.body)("firstName").not().isEmpty().withMessage("First name is required."),
    (0, express_validator_1.body)("lastName").not().isEmpty().withMessage("Last name is required."),
    (0, express_validator_1.body)("email").isEmail().withMessage("Incorrect email format"),
    (0, express_validator_1.body)("password").not().isEmpty().withMessage("Password is required."),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
        let { firstName, lastName, email, phone, password } = req.body;
        const users = yield db_1.pool.query("SELECT * FROM users WHERE email = $1", [
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
        let salt = yield bcrypt.genSalt(10);
        password = yield bcrypt.hash(password, salt);
        // Begin transaction
        yield db_1.pool.query('BEGIN');
        let userId = (0, uuid_1.v4)();
        //register user
        const result = yield db_1.pool.query("INSERT INTO users(userId, firstname, lastname, email, password, phone) VALUES($1, $2, $3, $4, $5, $6) RETURNING firstname, lastname, email, password, phone", [userId, firstName, lastName, email, password, phone]);
        let user = result.rows[0];
        //create organisation
        const orgQuery = yield db_1.pool.query(`INSERT INTO organisations(orgid, name, description) VALUES($1, $2, $3) RETURNING *`, [(0, uuid_1.v4)(), `${user.firstname}'s Organisation`, null]);
        //create organisation
        yield db_1.pool.query(`INSERT INTO user_organisations(orgid, userid) VALUES($1, $2)`, [orgQuery.rows[0].orgid, userId]);
        //Commit the transaction
        yield db_1.pool.query('COMMIT');
        if (!result.rows) {
            res.status(400).json({
                status: "Bad request",
                message: "Registration unsuccessful",
                statusCode: 400,
            });
        }
        req.session.userId = user.userid;
        req.session.save((err) => {
            if (err) {
                console.log("Error saving session: ", err);
            }
        });
        const token = jwt.sign(user, process.env.SESSION_KEY);
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
    }
    catch (err) {
        yield db_1.pool.query('ROLLBACK');
        console.log(err);
        res.status(500).send({ error: 'Internal server error.' });
    }
}));
/*
----@usage: To login a user
----@url: /auth/login
----@access: PUBLIC
----@method: POST
*/
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().withMessage("Incorrect email format"),
    (0, express_validator_1.body)("password").not().isEmpty().withMessage("Password is required."),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const results = yield db_1.pool.query("SELECT * FROM users WHERE email = $1", [
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
        let isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: "Bad request",
                message: "Authentication failed",
                statusCode: 401,
            });
        }
        req.session.userId = user.userid;
        req.session.save((err) => {
            if (err) {
                console.log("Error saving session: ", err);
            }
        });
        const token = jwt.sign(req.session.userId, process.env.SESSION_KEY);
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
    }
    catch (err) {
        console.log(err);
    }
}));
exports.default = router;
//# sourceMappingURL=index.js.map