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
const express = require("express");
const uuid_1 = require("uuid");
const db_1 = require("../../../db");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express.Router();
/*
  @usage: To get a user record
  @url: /api/users/:id
  @access: PUBLIC
  @method: GET
*/
router.get('/users/:id', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const result = yield db_1.pool.query("SELECT * FROM users WHERE userid = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "User not found."
            });
        }
        let user = result.rows[0];
        console.log(result.rows);
        res.status(200).json({
            status: "success",
            message: "User found.",
            data: {
                userId: user.userid,
                firstName: user.firstname,
                lastName: user.lastname,
                email: user.email,
                phone: user.phone
            }
        });
    }
    catch (err) {
    }
}));
/*
  @usage: To get all organisations
  @url: /api/organisations
  @access: PRIVATE
  @method: GET
*/
router.get('/organisations', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.session.userId;
        console.log(userId);
        const result = yield db_1.pool.query(`SELECT *
      FROM organisations o
      LEFT JOIN user_organisations uo ON o.orgid = uo.orgid
      WHERE uo.userid = $1`, [userId]);
        let organisations = [];
        result.rows.map(org => {
            organisations.push({
                orgId: org.orgid,
                name: org.name,
                description: org.description
            });
        });
        res.status(200).json({
            status: "success",
            message: "Operation successful",
            data: {
                organisations
            }
        });
    }
    catch (e) {
    }
}));
/*
  @usage: To get a single organisation record
  @url: /api/organisations/:orgId
  @access: PRIVATE
  @method: GET
*/
router.get('/organisations/:orgId', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.orgId;
    const result = yield db_1.pool.query("SELECT * FROM organisations WHERE orgid = $1", [id]);
    if (!result.rows) {
        return res.status(404).json({
            status: "error",
            message: "No organisation found.",
        });
    }
    console.log(result.rows);
    res.status(200).json({
        status: "success",
        message: "Operation successful",
        data: {
            orgId: result.rows[0].orgid,
            name: result.rows[0].name,
            description: result.rows[0].description,
        }
    });
}));
/*
  @usage: To create a new organisation
  @url: /api/organisations
  @access: PRIVATE
  @method: POST
*/
router.post('/organisations', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orgName, description } = req.body;
        const userId = req.session.userId;
        // Start a transaction
        yield db_1.pool.query('BEGIN');
        const id = (0, uuid_1.v4)();
        const orgQueryResult = yield db_1.pool.query('INSERT INTO organisations(orgid, name, description, owner_id) VALUES($1, $2, $3, $4) RETURNING orgid, name, description', [id, orgName, description, userId]);
        // Insert into user_organizations
        const insertUserOrgQuery = `
      INSERT INTO user_organisations (userid, orgid)
      VALUES ($1, $2) RETURNING *;
    `;
        const userOrgQueryResult = yield db_1.pool.query(insertUserOrgQuery, [userId, id]);
        // Commit the transaction
        yield db_1.pool.query('COMMIT');
        if (orgQueryResult.rows.length === 0 || userOrgQueryResult.rows.length === 0) {
            return res.status(400).json({
                status: "Bad request",
                message: "Client error",
                statusCode: 400,
            });
        }
        // console.log(result.rows)
        res.status(201).json({
            status: "success",
            message: "Organisation created successfully",
            data: {
                orgId: orgQueryResult.rows[0].orgid,
                name: orgQueryResult.rows[0].name,
                description: orgQueryResult.rows[0].description
            }
        });
    }
    catch (err) {
        yield db_1.pool.query('ROLLBACK');
        console.log(err);
        res.status(500).send({ error: 'Internal server error.' });
    }
}));
/*
  @usage: To add a user to a particular organisation
  @url: /api/organisations/:orgId/users
  @access: PRIVATE
  @method: POST
*/
router.post('/organisations/:orgId/users', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orgId = req.params.orgId;
    const userId = req.body.userId;
    // const result = await pool.query('SELECT users FROM organisations WHERE orgid = $1', [orgId])
    const result = yield db_1.pool.query('INSERT INTO user_organisations(orgid, userid) VALUES($1, $2)', [orgId, userId]);
    if (!result.rows) {
        return res.status(400).json({
            status: "error",
            message: "Failed to added user"
        });
    }
    res.status(200).json({
        status: "success",
        message: "User added to organisation successfully",
    });
}));
exports.default = router;
//# sourceMappingURL=index.js.map