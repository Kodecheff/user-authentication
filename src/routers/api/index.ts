import express = require('express');
import { v4 as uuidv4 } from "uuid";

import { pool } from '../../../db';
import userAuth from '../../middlewares/auth';
import { User } from '../../models/User';
import { CustomSession } from '../../app';


const router = express.Router()

/*
  @usage: To get a user record
  @url: /api/users/:id
  @access: PUBLIC
  @method: GET
*/
router.get('/users/:id',userAuth, async (req: express.Request, res: express.Response) => {

  try{

    const id = req.params.id

    const result = await pool.query("SELECT * FROM users WHERE userid = $1", [id])

    if(result.rows.length === 0){
      return res.status(404).json({
        status: "error",
        message: "User not found."
      })
    }

    let user: User = result.rows[0]

    console.log(result.rows)

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
    })

  }catch(err){

  }

})


/*
  @usage: To get all organisations
  @url: /api/organisations
  @access: PRIVATE
  @method: GET
*/
router.get('/organisations',userAuth, async (req: express.Request, res: express.Response) => {

  try{

    const userId = (req.session as CustomSession).userId
    console.log(userId)

    const result = await pool.query(
      `SELECT *
      FROM organisations o
      LEFT JOIN user_organisations uo ON o.orgid = uo.orgid
      WHERE uo.userid = $1`,
    [userId])

    let organisations: any[] = []

    result.rows.map(org => {
      organisations.push({
        orgId: org.orgid,
        name: org.name,
        description: org.description
      })
    })
    

    res.status(200).json({
      status: "success",
      message: "Operation successful",
      data: {
        organisations
      }

    })

  }catch(e){

  }


})


/*
  @usage: To get a single organisation record
  @url: /api/organisations/:orgId
  @access: PRIVATE
  @method: GET
*/
router.get('/organisations/:orgId', userAuth, async (req: express.Request, res: express.Response) => {
  const id = req.params.orgId

  const result = await pool.query("SELECT * FROM organisations WHERE orgid = $1", [id])

  if(!result.rows){
    return res.status(404).json({
      status: "error",
      message: "No organisation found.",
    });
  }

  console.log(result.rows)

  res.status(200).json({
    status: "success",
		message: "Operation successful",
    data: {
			orgId: result.rows[0].orgid,
			name: result.rows[0].name,
			description: result.rows[0].description,
    }
  })

})


/*
  @usage: To create a new organisation
  @url: /api/organisations
  @access: PRIVATE
  @method: POST
*/
router.post('/organisations', userAuth, async (req: express.Request, res: express.Response) => {
  try{
    const {orgName, description} = req.body
    const userId = (req.session as CustomSession).userId

    // Start a transaction
    await pool.query('BEGIN');

    const id = uuidv4()
    const orgQueryResult = await pool.query('INSERT INTO organisations(orgid, name, description, owner_id) VALUES($1, $2, $3, $4) RETURNING orgid, name, description', [id, orgName, description, userId])
  
    // Insert into user_organizations
    const insertUserOrgQuery = `
      INSERT INTO user_organisations (userid, orgid)
      VALUES ($1, $2) RETURNING *;
    `;
    const userOrgQueryResult = await pool.query(insertUserOrgQuery, [userId, id]);

    // Commit the transaction
    await pool.query('COMMIT');
    
    
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
    })
  }catch(err){
    await pool.query('ROLLBACK');
    console.log(err)
    res.status(500).send({ error: 'Internal server error.' });
  }

})


/*
  @usage: To add a user to a particular organisation
  @url: /api/organisations/:orgId/users
  @access: PRIVATE
  @method: POST
*/
router.post('/organisations/:orgId/users', userAuth, async (req: express.Request, res: express.Response) => {
  const orgId = req.params.orgId
  const userId = req.body.userId

  // const result = await pool.query('SELECT users FROM organisations WHERE orgid = $1', [orgId])

  const result = await pool.query('INSERT INTO user_organisations(orgid, userid) VALUES($1, $2)', [orgId, userId])

  if(!result.rows){
    return res.status(400).json({
      status: "error",
      message: "Failed to added user"
    })
  }

  res.status(200).json({
    status: "success",
    message: "User added to organisation successfully",
  })
  
})


export default router