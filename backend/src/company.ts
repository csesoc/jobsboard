import { Request, Response, NextFunction } from "express";
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

export default class CompanyFunctions {
  public static async GetCompanyInfo(req: any, res: Response, next: NextFunction) {
    Helpers.catchAndLogError(res, async () => {
      const companyInfo = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Company)
          .createQueryBuilder()
          .select(["Company.name", "Company.location", "Company.description"])
          .leftJoinAndSelect("Company.jobs", "Job")
          .where("company.id = :id", { id: parseInt(req.params.companyID, 10) })
          .getOne();
      }, `Company ${req.params.companyID} not found.`);
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
      const companyJobs = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Job)
          .createQueryBuilder()
          .leftJoinAndSelect("Job.company", "company")
          .where("company.id = :id", { id: parseInt(req.params.companyID, 10) })
          .andWhere("Job.approved = :approved", { approved: true })
          .andWhere("Job.hidden = :hidden", { hidden: false })
          .select(["Job.id", "Job.role", "Job.description", "Job.applicationLink"])
          .getMany();
      }, `Couldn't find jobs for company with ID: ${req.params.companyID}`);

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

      // await conn.manager.save(newCompanyAccount);
      MailFunctions.AddMailToQueue(
        newCompanyAccount.username,
        "Thank you for adding your company to the CSESoc Jobs Board",
        `
        Thank you for registering your company with the CSESoc Jobs Board. We really appreciate your time and are looking forward to working with you to share amazing opportunities with our students.
            <br>
          Please contact our executive committee at <a href="mailto:info@csesoc.org.au">info@csesoc.org.au</a> to verify your company account.
          <br>
        Best regards,
        Adam Tizzone
        CSESoc Jobs Board Administrator
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
      };
      Helpers.requireParameters(msg.role);
      Helpers.requireParameters(msg.description);
      Helpers.requireParameters(msg.applicationLink);
      Helpers.validApplicationLink(msg.applicationLink);
      const conn: Connection = getConnection();
      const newJob = new Job();
      newJob.role = msg.role;
      newJob.description = msg.description;
      newJob.applicationLink = msg.applicationLink;

      let companyAccount: CompanyAccount = undefined;
      try {
        companyAccount = await Helpers.doSuccessfullyOrFail(async () => {
          return await getRepository(CompanyAccount)
            .createQueryBuilder()
            .leftJoinAndSelect("CompanyAccount.company", "company")
            .where("CompanyAccount.id = :id", { id: req.companyAccountID })
            .andWhere("CompanyAccount.verified = :verified", { verified: true })
            .getOne();
        }, `Couldn't find company account with ID ${req.companyAccountID}`);
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
      }, `Cannot find jobs for company account with ID: ${req.companyAccountID}`);

      companyAccount.company.jobs.push(newJob);

      await conn.manager.save(companyAccount);

      const newJobID: number = companyAccount.company.jobs[companyAccount.company.jobs.length - 1].id;
      Logger.Info(`Created job with id: ${newJobID}`);

      // check to see if that job is queryable
      const newJobQueryVerification = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Job)
          .createQueryBuilder()
          .where("Job.id = :id", { id: newJobID })
          .getOne();
      }, `Couldn't fetch the newly created job with ID: ${newJobID}`);

      MailFunctions.AddMailToQueue(
        companyAccount.username,
        "CSESoc Jobs Board - Job Post request submitted",
        `
        Thank you for adding a job post to the CSESoc Jobs Board. As part of our aim to ensure student safety, we check all job posting requests to ensure they follow our guidelines, as the safety of our students is our utmost priority.
            <br>
          A result will be sent to you shortly.
          <br>
        Best regards,
        Adam Tizzone
        CSESoc Jobs Board Administrator
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
      const companyJobs = await Helpers.doSuccessfullyOrFail(async () => {
        return await getRepository(Job)
          .createQueryBuilder()
          .leftJoinAndSelect("Job.company", "company")
          .where("company.id = :id", { id: parseInt(req.companyAccountID, 10) })
          .orderBy("job.createdAt", "DESC")
          .select([
            "Job.id",
            "Job.role",
            "Job.description",
            "Job.applicationLink",
            "Job.approved",
            "Job.hidden"
          ])
          .getMany();
      }, `Couldn't find jobs for company with ID: ${req.companyAccountID}`);

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
}
