import { 
  // Request, 
  Response, 
  NextFunction 
} from "express";
import {
  Connection,
  getConnection,
  getRepository,
} from "typeorm";
import { Company } from "./entity/company";
import { CompanyAccount } from "./entity/company_account";
import { Job } from "./entity/job";
import Helpers, { IResponseWithStatus } from "./helpers";
import Secrets from "./secrets";
import MailFunctions from "./mail";
import Logger from "./logging";
import { ActiveResetTokens } from "./entity/active_reset_tokens";

export default class CompanyFunctions {
  public static async GetCompanyInfo(req: any, res: Response, next: NextFunction) {
    Helpers.catchAndLogError(res, async () => {
      Logger.Info(`STUDENT=${req.studentZID} getting company info for COMPANY=${req.params.companyID}`);
      const companyInfo = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Company)
          .createQueryBuilder()
          .select(["Company.name", "Company.location", "Company.description"])
          .leftJoinAndSelect("Company.jobs", "Job")
          .where("Company.id = :id", { id: parseInt(req.params.companyID, 10) })
          .getOne();
      }, `Failed to find COMPANY=${req.params.companyID}.`);
      return {
        status: 200,
        msg: {
          token: req.newJbToken,
          companyInfo: companyInfo
        }
      } as IResponseWithStatus;
    }, () => {
      return {
        status: 400,
        msg: {
          token: req.newJbToken
        }
      } as IResponseWithStatus;
    }, next);
  }

  public static async GetJobsFromCompany(req: any, res: Response, next: NextFunction) {
    Helpers.catchAndLogError(res, async () => {
      Logger.Info(`STUDENT=${req.studentZID} getting jobs for COMPANY=${req.params.companyID}`);
      const companyJobs = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Job)
          .createQueryBuilder()
          .leftJoinAndSelect("Job.company", "company")
          .where("company.id = :id", { id: parseInt(req.params.companyID, 10) })
          .andWhere("Job.approved = :approved", { approved: true })
          .andWhere("Job.hidden = :hidden", { hidden: false })
          .andWhere("Job.deleted = :deleted", { deleted: false })
          .select(["Job.id", "Job.role", "Job.description", "Job.applicationLink"])
          .getMany();
      }, `Failed to find jobs for COMPANY=${req.params.companyID}`);

      return {
        status: 200,
        msg: {
          token: req.newJbToken,
          companyJobs: companyJobs
        }
      } as IResponseWithStatus;
    }, () => {
      return {
        status: 400,
        msg: {
          token: req.newJbToken
        }
      } as IResponseWithStatus;
    }, next);
  }

  public static async PasswordReset(req: any, res: Response, next: NextFunction) {
    Helpers.catchAndLogError(res, async () => {
    
      // check if required parameters are supplied
      const msg = {
        newPassword: req.body.newPassword,
        token: req.body.token
      }
      Helpers.requireParameters(msg.newPassword);
      Helpers.requireParameters(msg.token);

      Logger.Info(`Attempting to reset a company\'s password with TOKEN=${msg.token}`);

      // connect to the database
      const conn: Connection = getConnection();
      
      let activeResetToken: ActiveResetTokens = undefined;
      try { 
        // check if there 
        activeResetToken = await Helpers.doSuccessfullyOrFail(async () => {
          return await getRepository(ActiveResetTokens)
          .createQueryBuilder("active_reset_tokens")
          .where("company_reset_tokens.token = :token", { token: msg.token })
          .getOne()
        // fail message 
        }, "failed to find the company that holds the provided token")
      }
      catch (err) {
        // send 403 error if no company with matching token can be found 
        return {
          status: 403,
          msg: undefined
        } as IResponseWithStatus;
      };

      // now a company with the provided token has been found, check if it has expired
      Helpers.hasResetTokenExpired(activeResetToken.expiry);

      // update the company's password with the new password 
      await conn
      .createQueryBuilder()
      .update(CompanyAccount)
      .set({ hash: Secrets.hash(msg.newPassword) })
      .where("username = :username", { username: activeResetToken.name })
      .execute();

      Logger.Info(`Password for company NAME=${activeResetToken.name} updated`);

      // save the password into the database
      await conn.manager.save(CompanyAccount);
      
      // delete the token for that company
      await conn
      .createQueryBuilder()
      .delete()
      .from(ActiveResetTokens)
      .where("name = :username", { username: activeResetToken.name })
      .execute();

      // save the changes into the database
      await conn.manager.save(ActiveResetTokens);

      return {
        status: 200,
        msg: undefined
      } as IResponseWithStatus;

    }, () => {
      return {
        status: 400,
        msg: undefined
      } as IResponseWithStatus;
    }, next);
  };

  public static async CreateCompany(req: any, res: Response, next: NextFunction) {
    Helpers.catchAndLogError(res, async () => {
      // verify input paramters
      const msg = {
        location: req.body.location,
        name: req.body.name,
        password: req.body.password,
        username: req.body.username,
      };
      Helpers.requireParameters(msg.username);
      Helpers.requireParameters(msg.password);
      Helpers.requireParameters(msg.name);
      Helpers.requireParameters(msg.location);
      Logger.Info(`Attempting to create company with USERNAME=${msg.username} NAME=${msg.name} LOCATION=${msg.location}`);
      // check if the company account exists with the same name
      const conn: Connection = getConnection();
      // using the original typeorm OR convention fails to construct a suitable MySQL
      // query, so we have to do this in two separate queries
      const companyAccountUsernameSearchResult = await getRepository(CompanyAccount)
        .createQueryBuilder("company_account")
        .where("company_account.username = :username", { username: msg.username })
        .getOne();
      const companyNameSearchResult = await getRepository(Company)
        .createQueryBuilder("company")
        .where("company.name = :name", { name: msg.name })
        .getOne();
      if (companyAccountUsernameSearchResult !== undefined || companyNameSearchResult !== undefined) {
        // company exists, send conflict error
        return {
          status: 409,
          msg: undefined,
        } as IResponseWithStatus;
      }
      // if there is no conflict, create the company account and company record
      const newCompany = new Company();
      newCompany.name = msg.name;
      newCompany.location = msg.location;
      const newCompanyAccount = new CompanyAccount();
      newCompanyAccount.username = msg.username;
      newCompanyAccount.hash = Secrets.hash(msg.password);
      newCompanyAccount.company = newCompany;
      newCompany.companyAccount = newCompanyAccount;

      await conn.manager.save(newCompanyAccount);

      Logger.Info(`Created company with USERNAME=${msg.username} NAME=${msg.name} LOCATION=${msg.location}`);

      // await conn.manager.save(newCompanyAccount);
      MailFunctions.AddMailToQueue(
        newCompanyAccount.username,
        "Thank you for adding your company to the CSESoc Jobs Board",
        `
        Thank you for registering your company with the CSESoc Jobs Board. We really appreciate your time and are looking forward to working with you to share amazing opportunities with our students.
            <br>
          Please contact our executive committee at <a href="mailto:careers@csesoc.org.au">careers@csesoc.org.au</a> to verify your company account.
          <br>
        <p>Best regards,</p>
        <p>Adam Tizzone</p>
        <p>CSESoc Jobs Board Administrator</p>
        `,
      );
      return {
        status: 200,
        msg: undefined
      } as IResponseWithStatus;
    }, () => {
      return {
        status: 400,
        msg: undefined
      } as IResponseWithStatus;
    }, next);
  }

  public static async CreateJob(req: any, res: Response, next: NextFunction) {
    Helpers.catchAndLogError(res, async () => {
      if (req.companyAccountID === undefined) {
        return {
          status: 401,
          msg: {
            token: req.newJbToken
          }
        } as IResponseWithStatus;
      }
      // ensure required parameters are present
      const msg = {
        applicationLink: req.body.applicationLink.trim(),
        description: req.body.description.trim(),
        role: req.body.role.trim(),
        expiry: req.body.expiry,
      };
      Helpers.requireParameters(msg.role);
      Helpers.requireParameters(msg.description);
      Helpers.requireParameters(msg.applicationLink);
      Helpers.requireParameters(msg.expiry);
      Helpers.isDateInTheFuture(msg.expiry);
      Helpers.validApplicationLink(msg.applicationLink);
      Logger.Info(`Attempting to create job for COMPANY=${req.companyAccountID} with ROLE=${msg.role} DESCRIPTION=${msg.description} applicationLink=${msg.applicationLink}`);
      const conn: Connection = getConnection();
      const newJob = new Job();
      newJob.role = msg.role;
      newJob.description = msg.description;
      newJob.applicationLink = msg.applicationLink;
      newJob.expiry = new Date(msg.expiry);

      let companyAccount: CompanyAccount = undefined;
      try {
        companyAccount = await Helpers.doSuccessfullyOrFail(async () => {
          return await getRepository(CompanyAccount)
            .createQueryBuilder()
            .leftJoinAndSelect("CompanyAccount.company", "company")
            .where("CompanyAccount.id = :id", { id: req.companyAccountID })
            .andWhere("CompanyAccount.verified = :verified", { verified: true })
            .getOne();
        }, `Failed to find COMPANY_ACCOUNT=${req.companyAccountID}`);
      } catch (error) {
        // reject because a verified account could not be found and thus can't post a job
        return {
          status: 403,
          msg: {
            token: req.newJbToken
          }
        } as IResponseWithStatus;
      }

      companyAccount.company.jobs = await Helpers.doSuccessfullyOrFail(async () => {
        return await getConnection()
          .createQueryBuilder()
          .relation(Company, "jobs")
          .of(companyAccount.company)
          .loadMany();
      }, `Failed to find jobs for COMPANY_ACCOUNT=${req.companyAccountID}`);

      companyAccount.company.jobs.push(newJob);

      await conn.manager.save(companyAccount);

      const newJobID: number = companyAccount.company.jobs[companyAccount.company.jobs.length - 1].id;
      Logger.Info(`Created JOB=${newJobID} for COMPANY_ACCOUNT=${req.companyAccountID}`);

      // check to see if that job is queryable
      const newJobQueryVerification = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Job)
          .createQueryBuilder()
          .where("Job.id = :id", { id: newJobID })
          .getOne();
      }, `Failed to fetch the newly created JOB=${newJobID}`);

      MailFunctions.AddMailToQueue(
        companyAccount.username,
        "CSESoc Jobs Board - Job Post request submitted",
        `
        Thank you for adding a job post to the CSESoc Jobs Board. As part of our aim to ensure student safety, we check all job posting requests to ensure they follow our guidelines, as the safety of our students is our utmost priority.
            <br>
          A result will be sent to you shortly.
          <br>
        <p>Best regards,</p>
        <p>Adam Tizzone</p>
        <p>CSESoc Jobs Board Administrator</p>
        `,
      );
      return {
        status: 200,
        msg: {
          token: req.newJbToken,
          id: newJobID
        }
      } as IResponseWithStatus;
    }, () => {
      return {
        status: 400,
        msg: {
          token: req.newJbToken
        }
      } as IResponseWithStatus;
    }, next);
  }

  public static async GetAllJobsFromCompany(req: any, res: Response, next: NextFunction) {
    Helpers.catchAndLogError(res, async () => {
      Logger.Info(`COMPANY_ACCOUNT=${req.companyAccountID} attempting to list all of its jobs`);
      const companyJobs = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Job)
          .createQueryBuilder()
          .leftJoinAndSelect("Job.company", "company")
          .where("company.id = :id", { id: parseInt(req.companyAccountID, 10) })
          .andWhere("Job.deleted = :deleted", { deleted: false })
          .orderBy("Job.createdAt", "DESC")
          .select([
            "Job.id",
            "Job.role",
            "Job.description",
            "Job.applicationLink",
            "Job.approved",
            "Job.hidden"
          ])
          .getMany();
      }, `Failed to find jobs for COMPANY=${req.companyAccountID}`);

      const fixedCompanyJobs = companyJobs.map((job: any) => {
        let jobStatus = "Unknown";
        if (job.approved && !job.hidden) {
          jobStatus = "Approved";
        } else if (!job.approved && job.hidden) {
          jobStatus = "Rejected";
        } else if (!job.approved && !job.hidden) {
          jobStatus = "Pending";
        }
        return {
          id: job.id,
          role: job.role,
          description: job.description,
          applicationLink: job.applicationLink,
          status: jobStatus,
        };
      })

      return {
        status: 200,
        msg: {
          token: req.newJbToken,
          companyJobs: fixedCompanyJobs,
        }
      } as IResponseWithStatus;
    }, () => {
      return {
        status: 400,
        msg: {
          token: req.newJbToken
        }
      } as IResponseWithStatus;
    }, next);
  }

  public static async MarkJobPostRequestAsDeleted(req: any, res: Response, next: NextFunction) {
    Helpers.catchAndLogError(res, async () => {
      Logger.Info(`COMPANY=${req.companyAccountID} attempting to mark JOB=${req.params.jobID} as deleted`);
      const jobToDelete = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Job)
          .createQueryBuilder()
          .leftJoinAndSelect("Job.company", "company")
          .where("company.id = :id", { id: parseInt(req.companyAccountID, 10) })
          .andWhere("Job.id = :jobID", { jobID: req.params.jobID })
          .andWhere("Job.deleted = :deleted", { deleted: false })
          .getOne();
      }, `Failed to find JOB=${req.params.jobID} for COMPANY_ACCOUNT=${req.companyAccountID}`);

      // found a valid job that can be deleted
      await getConnection().createQueryBuilder()
        .update(Job)
        .set({ deleted: true })
        .where("id = :id", { id: jobToDelete.id })
        .execute();
      Logger.Info(`COMPANY=${req.companyAccountID} marked JOB=${req.params.jobID} as deleted`);

      return {
        status: 200,
        msg: {
          token: req.newJbToken,
        }
      } as IResponseWithStatus;
    }, () => {
      return {
        status: 400,
        msg: {
          token: req.newJbToken
        }
      } as IResponseWithStatus;
    }, next);
  }
}
