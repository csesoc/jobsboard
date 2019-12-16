// modules
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import "reflect-metadata";
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnection,
  getRepository,
} from "typeorm";

// custom libraries
import Auth from "./auth";
import { seedDB } from "./dev";
import JWT from "./jwt";
import Logger from "./logging";
import Secrets from "./secrets";

// custom entities
import { Company } from "./entity/company";
import { CompanyAccount } from "./entity/company_account";
import { Job } from "./entity/job";
import { Student } from "./entity/student";

// custom middleware
import Middleware from "./middleware";

dotenv.config();
Logger.Init();

const app = express();
const port = process.env.SERVER_PORT;
const API_URL = "http://localhost";
app.use(bodyParser.json());
app.use(Middleware.genericLoggingMiddleware);
// app.options("*", cors());
// app.use(bodyParser.urlencoded());
if (process.env.NODE_ENV === "development") {
  app.use(cors());
}

const activeEntities = [
  Company,
  CompanyAccount,
  Job,
  Student,
];

// swagger api generator based on jsdoc
const swaggerjsdocOptions: any = {
  apis: ["./dist/**/*.js"],
  swaggerDefinition: {
    info: {
      description: "API for the CSESoc Jobs Board site with autogenerated swagger doc",
      title: "Jobs Board API",
      version: "1.0.0",
    },
  },
};

const specs = swaggerJsdoc(swaggerjsdocOptions);

const options: ConnectionOptions = {
  database: process.env.MYSQL_DATABASE,
  entities: activeEntities,
  host: process.env.DATABASE_HOST,
  logging: true,
  migrations: [
  ],
  password: process.env.MYSQL_PASSWD,
  port: 3306,
  subscribers: [
  ],
  synchronize: true,
  type: "mysql",
  username: process.env.MYSQL_USER,
};

async function bootstrap() {
  await createConnection(options);
  await seedDB(activeEntities);
}

function requireParameters(result: any): void {
  // if a single required parameter is undefined, the result field should evaluate to
  // undefined
  if (result === undefined) {
    throw new Error("Missing parameters.");
  }
}

/**
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         role:
 *           type: string
 *         company:
 *           type: integer
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         location:
 *           type: string
 */

/**
 *  @swagger
 *  /jobs:
 *    get:
 *      description: List all active job posts
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Job'
 */
app.get("/jobs", Middleware.authenticateStudentMiddleware, async (_, res) => {
  try {
    const conn: Connection = await getConnection();
    const jobs = await conn.getRepository(Job).find({
      relations: ["company"],
    });
    res.send(jobs);
  } catch (error) {
    res.sendStatus(400);
  }
});

/**
 *  @swagger
 *  /job/{jobID}:
 *    get:
 *      description: Get a specific job description
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Job'
 *      400:
 *        description: failed to find job
 */
app.get("/job/:jobID", Middleware.authenticateStudentMiddleware, async (req, res) => {
  try {
    requireParameters(req.params.jobID);
    const conn: Connection = await getConnection();
    const jobInfo = await conn.getRepository(Job).findOneOrFail({
      relations: ["company"],
      where: {
        id: parseInt(req.params.jobID, 10),
      },
    });
    res.send(jobInfo);
  } catch (error) {
    res.sendStatus(400);
  }
});

/**
 *  @swagger
 *  /company/{companyID}:
 *    get:
 *      description: Get the information for a specific company
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Company'
 *      400:
 *        description: failed to find company
 */
app.get("/company/:companyID", Middleware.authenticateStudentMiddleware, async (req, res) => {
  try {
    const conn: Connection = await getConnection();
    const companyInfo = await getRepository(Company).find({id: parseInt(req.params.companyID, 10)});
    if (companyInfo.length !== 1) {
      throw new Error("Cannot find the requested company.");
    }
    res.send(companyInfo);
  } catch (error) {
    res.sendStatus(400);
  }
});

/**
 *  @swagger
 *  /company/{companyID}/jobs:
 *    get:
 *      description: Get the jobs from a specific company
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Company'
 *      400:
 *        description: failed to find company
 */
app.get("/company/:companyID/jobs", Middleware.authenticateStudentMiddleware, async (req, res) => {
  try {
    const jobsForCompany = await getRepository(Company).find({id: parseInt(req.params.companyID, 10)});
    res.send(jobsForCompany[0].jobs);
  } catch (error) {
    res.sendStatus(400);
  }
});

/**
 *  @swagger
 *  /authenticate/student:
 *    post:
 *      description: Authenticate a students credentials
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                token:
 *                  type: string
 *                  description: API token
 *      400:
 *        description: Missing parameters or invalid credentials
 */
app.post("/authenticate/student", (req, res) => {
  try {
    const msg = req.body;
    requireParameters(msg.zID && msg.password);
    if (Auth.authenticateStudent(msg.zID, msg.password)) {
      // successful login
      res.send({ token: JWT.create({ username: msg.zID }) });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

/**
 *  @swagger
 *
 *  /company:
 *    put:
 *      description: Create a company account
 *      parameters:
 *        - name: username
 *          description: The username of the new company account
 *          type: string
 *          required: true
 *        - name: password
 *          description: The associated password of the new company account
 *          type: string
 *          required: true
 *        - name: name
 *          description: The name of the new company
 *          type: string
 *          required: true
 *        - name: location
 *          description: The location of the new company
 *          type: string
 *          required: true
 *    responses:
 *      200:
 *        description: success
 *      400:
 *        description: Missing parameters
 *      409:
 *        description: Conflicting usernames
 */
app.put("/company", async (req, res) => {
  try {
    // verify input paramters
    const msg = JSON.parse(req.body);
    requireParameters(msg.username && msg.password && msg.name && msg.location);
    // check if the company account exists with the same name
    const newUsername = msg.username;
    const conn: Connection = await getConnection();
    const companyAccountSearchResult = await getRepository(CompanyAccount).find({
      username: newUsername,
    });
    if (companyAccountSearchResult.length !== 0) {
      // company exists, send conflict error
      res.sendStatus(409);
    }
    // if there is no conflict, create the company account and company record
    const newCompany = new Company();
    newCompany.name = msg.name;
    newCompany.location = msg.location;
    const newCompanyAccount = new CompanyAccount();
    newCompanyAccount.username = msg.username;
    newCompanyAccount.hash = Secrets.hash(msg.password);
    newCompanyAccount.company = newCompany;
    await conn.manager.save(newCompany);
    await conn.manager.save(newCompanyAccount);
  } catch (error) {
    res.sendStatus(400);
  }
});

/**
 *  @swagger
 *  /authenticate/company:
 *    post:
 *      description: Authenticate a company's credentials
 *    responses:
 *      200:
 *        description: success
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                token:
 *                  type: string
 *                  description: API token
 *      400:
 *        description: Missing parameters or invalid credentials
 */
app.post("/authenticate/company", async (req, res) => {
  try {
    const msg = JSON.parse(req.body);
    requireParameters(msg.username && msg.password);
    // check if account exists
    const companyQuery = await getRepository(CompanyAccount).findOneOrFail({
      username: msg.username,
    }).catch((error) => { throw new Error(error); });
    try {
      if (companyQuery.hash !== Secrets.hash(msg.password)) { throw new Error("Invalid credentials"); }
      // credentials match, so grant them a token
      res.send({ token: JWT.create({ id: companyQuery.id }) });
    } catch (error) {
      res.sendStatus(401);
    }
  } catch (error) {
    res.sendStatus(400);
  }
});

/**
 *  @swagger
 *  /job:
 *    put:
 *      description: Create a job as the logged in company
 *      parameters:
 *        - name: role
 *          description: The role of the job post
 *          type: string
 *          required: true
 *        - name: description
 *          description: A description fo the job
 *          type: string
 *          required: true
 *    responses:
 *      200:
 *        description: success
 *      400:
 *        description: Missing parameters or unauthorized
 */
app.put("/jobs", Middleware.authenticateCompanyMiddleware, async (req: any, res) => {
  try {
    if (req.companyID === undefined) {
      res.sendStatus(401);
    }
    // ensure required parameters are present
    const msg = JSON.parse(req.body);
    requireParameters(msg.role && msg.description);
    const conn: Connection = getConnection();
    const newJob = new Job();
    newJob.role = msg.role;
    newJob.description = msg.description;
    const companyQuery = await getRepository(Company).findOneOrFail({
      id: req.companyID,
    }).catch((error) => { throw new Error(error); });
    newJob.company = companyQuery;
    await conn.manager.save(newJob);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(port, async () => {
  await bootstrap();
  Logger.Info(`Server started at ${API_URL}:${port}`);
});
