// modules
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import helmet from "helmet";

import "reflect-metadata";

import { DataSource } from "typeorm";

// custom libraries
import Auth from "./auth";
import { seedDB } from "./dev";
import Logger from "./logging";

// endpoint implementations
import AdminFunctions from "./admin";
import CompanyFunctions from "./company";
import StudentFunctions from "./student";
import MailFunctions from "./mail";

// custom entities
import { AdminAccount } from "./entity/admin_account";
import { Company } from "./entity/company";
import { CompanyAccount } from "./entity/company_account";
import { Job } from "./entity/job";
import { Student } from "./entity/student";
import { MailRequest } from "./entity/mail_request";
import { Logs } from "./entity/logs";
import { Statistics } from "./entity/statistics";

// custom middleware
import Middleware from "./middleware";

// dotenv.config({ path: '../.env' });
dotenv.config();
Logger.Init();

const app = express();
const port = process.env.SERVER_PORT;
app.use(bodyParser.json());
app.use(helmet());

var corsOptions;
if (process.env.NODE_ENV !== "development") {
  // assuming production, set up a particular config and allow only requests from
  // the current URL to be consumed
  const whitelist = [
    'https://jobsboard.csesoc.unsw.edu.au'
  ];
  const corsOptions = {
    origin: (origin: any, callback: Function) => {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  }
}

app.options("*", cors(corsOptions));

const activeEntities = [
  Company,
  CompanyAccount,
  Job,
  Student,
  AdminAccount,
  MailRequest,
  Logs,
  Statistics
];

// swagger api generator based on jsdoc
const swaggerjsdocOptions: any = {
  apis: ["./dist/**/*.js"],
  swaggerDefinition: {
    info: {
      openapi: "3.0.0",
      description: "API for the CSESoc Jobs Board site",
      title: "Jobs Board API",
      version: "2.0.0",
    },
  },
};

const specs = swaggerJsdoc(swaggerjsdocOptions);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: activeEntities,
  migrations: [],
  subscribers: [],
});


async function bootstrap() {
  await AppDataSource.initialize();
  await seedDB(activeEntities);
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
 *         description:
 *           type: string
 */

/**
 *  @swagger
 *  /jobs:
 *    get:
 *      description: List all active job posts
 *      tags:
 *        - Jobs
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
// NOTE: Temporarily deprecated in favour of pagination
// app.get("/jobs", Middleware.authenticateStudentMiddleware, StudentFunctions.GetAllActiveJobs);

/**
 *  @swagger
 *  /jobs/pending:
 *    get:
 *      description: List all pending (un-approved or un-rejected) job posts
 *      tags:
 *        - Jobs
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
 *        description: Missing parameters or invalid credentials
 */
app.get(
  "/admin/jobs/pending",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.GetPendingJobs,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /jobs/{offset}:
 *    get:
 *      description: List all active job post (paginated)
 *      tags:
 *        - Jobs
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
app.get(
  "/jobs/:offset",
  cors(corsOptions),
  Middleware.authenticateStudentMiddleware,
  StudentFunctions.GetPaginatedJobs,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /job/{jobID}:
 *    get:
 *      description: Get a specific job description
 *      tags:
 *        - Jobs
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
app.get(
  "/job/:jobID",
  cors(corsOptions),
  Middleware.authenticateStudentMiddleware,
  StudentFunctions.GetJob,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /job/company/hidden:
 *  get:
 *    description: retrieve all the hidden jobs in the system 
 *    tags:
 *      - Jobs
 *    responses:
 *      200: 
 *        description: Success
 *        content: 
 *          application/json:
 *          schema:
 *            type: object
 *            properties:
 *              hiddenJobs: 
 *                type: string
 *              value:
 *                type: array 
 *      400:
 *        description: unable to query the database
 *      401:
 *        description: invalid parameters
 */
app.get(
  "/job/company/hidden",
  cors(corsOptions),
  Middleware.authenticateCompanyMiddleware,
  CompanyFunctions.GetCompanyHiddenJobs,
  Middleware.genericLoggingMiddleware
)

/**
 *  @swagger
 *  /company/{companyID}:
 *    get:
 *      description: Get the information for a specific company
 *      tags:
 *        - Company
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
app.get(
  "/company/:companyID",
  cors(corsOptions),
  Middleware.authenticateStudentMiddleware,
  CompanyFunctions.GetCompanyInfo,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /company/{companyID}/jobs:
 *    get:
 *      description: Get the jobs from a specific company
 *      tags:
 *        - Company
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
app.get(
  "/company/:companyID/jobs",
  cors(corsOptions),
  Middleware.authenticateStudentMiddleware,
  CompanyFunctions.GetJobsFromCompany,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /authenticate/student:
 *    post:
 *      description: Authenticate a students credentials
 *      tags:
 *        - Authentication
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
app.post(
  "/authenticate/student",
  cors(corsOptions),
  Auth.AuthenticateStudent,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *
 *  /company:
 *    put:
 *      description: Create a company account
 *      tags:
 *        - Company
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
app.put(
  "/company",
  cors(corsOptions),
  CompanyFunctions.CreateCompany,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /authenticate/company:
 *    post:
 *      description: Authenticate a company's credentials
 *      tags:
 *        - Authentication
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
app.post(
  "/authenticate/company",
  cors(corsOptions),
  Auth.AuthenticateCompany,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /company/update/details:
 *    put:
 *      description: change the details of a company
 *      parameters:
 *        - name: name 
 *          description: name of the company
 *          type: string
 *          required: true 
 *        - name: location 
 *          description: location of the company
 *          type: string
 *          required: true 
 *        - name: description 
 *          description: description about the company
 *          type: string
 *          required: true 
 *        - name: sponsor 
 *          description: is the company a sponsor
 *          type: boolean
 *          required: true 
 *        - name: logo
 *          description: logo of company
 *          type: base64 string
 *          required: true
 *    responses:
 *      200:
 *        description: success
 *      400:
 *        description: Missing parameters or unauthorized
 */
app.put(
  "/company/update/details",
  cors(corsOptions),
  Middleware.authenticateCompanyMiddleware,
  CompanyFunctions.UpdateCompanyDetails,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /company/upload/logo:
 *    put:
 *      description: change the details of a company
 *      parameters:
 *        - name: logo
 *          description: logo of company
 *          type: base64 string
 *          required: true
 *    responses:
 *      200:
 *        description: success
 *      400:
 *        description: Missing parameters or unauthorized
 */
app.put(
  "/company/update/logo",
  cors(corsOptions),
  Middleware.authenticateCompanyMiddleware,
  CompanyFunctions.UploadLogo,
  Middleware.genericLoggingMiddleware
);


/**
 *  @swagger
 *  /jobs:
 *    put:
 *      description: Create a job as the logged in company
 *      tags:
 *        - Jobs
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
app.put(
  "/jobs",
  cors(corsOptions),
  Middleware.authenticateCompanyMiddleware,
  CompanyFunctions.CreateJob,
  Middleware.genericLoggingMiddleware
);

/**
*  @swagger
*  /company/job/edit:
*    put:
*      description: allow companies to update the information of their jobs
*      tags: 
*        - Company
*      parameters:
*        - name: id
*          description: id of the job post
*          type: number
*          required: true
*        - name: role
*          description: role of the job (seems like this property is stale)
*          type: string
*          required: true
*        - name: mode
*          description: remote, hybrid, onsite
*          type: string
*          required: true
*        - name: studentDemographic 
*          description: grads, penultimates or all students 
*          type: array of strings 
*          required: true 
*        - name: jobType
*          description: intern / grad 
*          type: String
*          required: true
*        - name: workingRights
*          description: aus citizen, pr, etc 
*          type: array of strings
*          required: true 
*        - name: wamRequirements
*          description: wam requirements HD or above, etc 
*          type: string 
*          required: true
*        - name: additionalInfo
*          description: additional information
*          type: string
*          required: true
*        - name: description
*          description: description about the job 
*          type: string 
*          required: true 
*        - name: applicationLink
*          description: application link
*          type: string
*          required: true
*        - name: isPaid
*          description: will the job be paid 
*          type: boolean
*          required: true 
*        - name: expiry 
*          description: expiry date of the job opening 
*          type: Date 
*          required: true  
*    responses:
*      200:
*        description: success
*      400:
*        description: failed to find company account
*      403:
*        description: database failed to update
*/
app.put(
  "/company/job/edit",
  cors(corsOptions),
  Middleware.authenticateCompanyMiddleware,
  CompanyFunctions.EditJob,
  Middleware.genericLoggingMiddleware
)

/**
*  @swagger
*  /company/forgot:
*    post:
*      description: Send mail to company account to reset password
*      tags:
*        - Company
*      parameters:
*        - name: username
*          description: The username of the company account
*          type: string
*          required: true
*    responses:
*      200:
*        description: success
*      400:
*        description: failed to find company account
*/
app.post(
  "/company/forgot-password",
  cors(corsOptions),
  CompanyFunctions.SendResetPasswordEmail,
  Middleware.genericLoggingMiddleware
);


/**
*  @swagger
*  /company/password-reset-token/{username}:
*    get:
*      description: Retrieve the token that a company is using to reset its password
*      tags:
*        - Company
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
*        description: failed to find company account
*/


app.get(
  "/company/password-reset-token/:username",
  cors(corsOptions),
  CompanyFunctions.GetPasswordResetToken,
  Middleware.genericLoggingMiddleware
)

/**
 *  @swagger
 *  /company/password-reset/:
 *    put:
 *      description: Reset a company's password
 *      tags:
 *        - Company
 *      parameters:
 *        - name: newPassword 
 *          description: The company's new password which will be hashed and stored in the database
 *          type: string
 *          required: true
 *    responses:
 *      200:
 *        description: success
 *      400:
 *        description: required parameters not supplied
 *      401:
 *        description: invalid or expired token
 */
 app.put(
  "/company/password-reset",
  cors(corsOptions),
  Middleware.authenticateResetPasswordRequestMiddleware,
  CompanyFunctions.PasswordReset,
  Middleware.genericLoggingMiddleware
);


/**
 *  @swagger
 *  /authenticate/admin:
 *    post:
 *      description: Authenticate an admin's credentials
 *      tags:
 *        - Authentication
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
app.post(
  "/authenticate/admin",
  cors(corsOptions),
  Auth.AuthenticateAdmin,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /job/:jobID/approve:
 *    patch:
 *      description: Approve a job request as the admin
 *      tags:
 *        - Jobs
 *    responses:
 *      200:
 *        description: success
 *      400:
 *        description: Missing parameters or invalid credentials
 */
app.patch(
  "/job/:jobID/approve",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.ApproveJobRequest,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /job/:jobID/approve:
 *    patch:
 *      description: Approve a job request as the admin
 *      tags:
 *        - Jobs
 *    responses:
 *      200:
 *        description: success
 *      400:
 *        description: Missing parameters or invalid credentials
 */
app.patch(
  "/job/:jobID/reject",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.RejectJobRequest,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /admin/pending/companies:
 *    post:
 *      description: List all pending (non-verified) company accounts
 *      tags:
 *        - Admin
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
 *        description: Missing parameters or invalid credentials
 */
app.get(
  "/admin/pending/companies",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.GetPendingCompanyVerifications,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /admin/company/:companyID/verify:
 *    patch:
 *      description: Verify a specific company account as an admin
 *      tags:
 *        - Admin
 *    responses:
 *      200:
 *        description: success
 *      400:
 *        description: Missing parameters or invalid credentials
 */
app.patch(
  "/admin/company/:companyAccountID/verify",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.VerifyCompanyAccount,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /job/admin/hidden:
 *  get:
 *    description: retrieve all the hidden jobs in the system
 *    tags:
 *      - Admin
 *    responses:
 *      200: 
 *        description: Success
 *        content: 
 *          application/json:
 *          schema:
 *            type: object
 *            properties:
 *              hiddenJobs: 
 *                type: string
 *              value:
 *                type: object
 *      400:
 *        description: invalid credentials or unable to query the database
 */
app.get(
  "/job/admin/hidden",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.GetAllHiddenJobs,
  Middleware.genericLoggingMiddleware
)

/**
 *  @swagger
 *  /companyjobs:
 *    get:
 *      description: Get all submitted from a specific company
 *      tags:
 *        - Company
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
 *        description: failed to find company
 */
app.get(
  "/companyjobs",
  cors(corsOptions),
  Middleware.authenticateCompanyMiddleware,
  CompanyFunctions.GetAllJobsFromCompany,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /company/job/:jobID:
 *    delete:
 *      description: Delete a job post request from a company
 *      tags:
 *        - Company
 *    responses:
 *      200:
 *        description: success
 *      403:
 *        description: failed to delete job as it does not belong to company
 */
app.delete(
  "/company/job/:jobID",
  cors(corsOptions),
  Middleware.authenticateCompanyMiddleware,
  CompanyFunctions.MarkJobPostRequestAsDeleted,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /company/stats/verifiedCompanies:
 *  get:
 *    description: Retrieve the number of verified companies
 *    tags:
 *      - Statistics
 *    responses:
 *      200: 
 *        description: Success
 *        content: 
 *          application/json:
 *          schema:
 *            type: object
 *            properties:
 *              num: 
 *                type: string
 *              value:
 *                type: integer
 *      400:
 *        description: Unable to query the database
 */
app.get(
  "/company/stats/verifiedCompanies",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.GetNumVerifiedCompanies,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /job/stats/approvedJobPosts/:year:
 *  get:
 *    description: Retrieve the number of approved job posts in the given year
 *    tags:
 *      - Statistics
 *    responses:
 *      200: 
 *        description: Success
 *        content: 
 *          application/json:
 *          schema:
 *            type: object
 *            properties:
 *              numJobsPosts: 
 *                type: integer
 *              value:
 *                type: integer
 *      400:
 *        description: Unable to query the database
*/
app.get(
  "/job/stats/approvedJobPosts/:year",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.getNumApprovedJobPosts,
  Middleware.genericLoggingMiddleware
);
  
  
/**
 *  @swagger
 *  /admin/companies:
 *    get:
 *      description: Get a list of all onboarded companies as an admin
 *      tags:
 *        - Admin
 *    responses:
 *      200:
 *        description: success
 *      401:
 *        description: bad permissions
 */
app.get(
  "/admin/companies",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.ListAllCompaniesAsAdmin,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /admin/company/:companyID/jobs:
 *    put:
 *      description: Create a job as an admin on behalf of a company account
 *      tags:
 *        - Admin
 *    responses:
 *      200:
 *        description: success
 *      401:
 *        description: bad permissions
 */
app.put(
  "/admin/company/:companyID/jobs",
  cors(corsOptions),
  Middleware.authenticateAdminMiddleware,
  AdminFunctions.CreateJobOnBehalfOfExistingCompany,
  Middleware.genericLoggingMiddleware
);

/**
 *  @swagger
 *  /getFeaturedJobs:
 *    get:
 *      description: List the 4 latest jobs in the database
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
 *        description: failed to get Jobs
 */
app.get(
  "/featured-jobs",
  cors(corsOptions),
  StudentFunctions.GetFeaturedJobs,
  Middleware.genericLoggingMiddleware
);

/**
 * Comment/uncomment to enable/disable swagger docs and sending test emails.
 * Currently only works in development mode.
 */
if (process.env.NODE_ENV === "development") {
  // app.post("/email", MailFunctions.SendTestEmail);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
}

app.listen(port, async () => {
  if (process.env.NODE_ENV === "development") {
    await bootstrap();
  } else {
    await AppDataSource.initialize();
  }
  if (process.env.NODE_ENV === "production") {
    MailFunctions.InitMailQueueScheduler(2000);
  }
  Logger.Info(`SERVER STARTED AT PORT=${port}`);
});


