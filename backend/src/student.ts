import { Response, NextFunction } from 'express';
import Fuse from 'fuse.js';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from './config';
import Job from './entity/job';
import Student from './entity/student';
import StudentProfile from './entity/student_profile';
import Helpers, { IResponseWithStatus } from './helpers';
import { Logger, LogModule } from './logging';

import { WorkingRights } from './types/job-field';

import { StudentBase } from './types/shared';

import {
  StudentPaginatedJobsRequest,
  StudentGetJobRequest,
  StudentFeaturedJobsRequest,
  SearchJobRequest,
  StudentGetProfileRequest,
  StudentEditProfileRequest,
} from './types/request';

const LM = new LogModule('STUDENT');

const paginatedJobLimit = 10;

export default class StudentFunctions {
  public static async GetPaginatedJobs(
    this: void,
    req: StudentPaginatedJobsRequest,
    res: Response,
    next: NextFunction,
  ) {
    await Helpers.catchAndLogError(
      res,
      async (): Promise<IResponseWithStatus> => {
        const { offset } = req.params;
        Logger.Info(LM, `STUDENT=${req.studentZID} getting paginated jobs with OFFSET=${offset}`);
        Helpers.requireParameters(offset);

        const jobs = await AppDataSource.getRepository(Job)
          .createQueryBuilder('job')
          .leftJoinAndSelect('job.company', 'company')
          .select(['job', 'company'])
          .where('job.approved = :approved', { approved: true })
          .andWhere('job.hidden = :hidden', { hidden: false })
          .andWhere('job.deleted = :deleted', { deleted: false })
          .andWhere('job.expiry > :expiry', { expiry: new Date() })
          .select([
            'job.id',
            'job.role',
            'job.jobType',
            'job.workingRights',
            'job.mode',
            'job.expiry',
            'company.name',
            'company.logo',
            'company.location',
          ])
          .take(paginatedJobLimit)
          .skip(parseInt(offset, 10))
          .orderBy('job.expiry', 'ASC')
          .getMany();

        return {
          status: StatusCodes.OK,
          msg: { jobs },
        };
      },
      () => ({
        status: StatusCodes.BAD_REQUEST,
        msg: { token: req.newJbToken },
      }),
      next,
    );
  }

  public static async GetJob(
    this: void,
    req: StudentGetJobRequest,
    res: Response,
    next: NextFunction,
  ) {
    await Helpers.catchAndLogError(
      res,
      async (): Promise<IResponseWithStatus> => {
        Logger.Info(LM, `STUDENT=${req.studentZID} getting individual JOB=${req.params.jobID}`);
        Helpers.requireParameters(req.params.jobID);
        const jobInfo: Job = await AppDataSource.getRepository(Job)
          .createQueryBuilder()
          .select([
            'company.name',
            'company.location',
            'company.description',
            'Job.id',
            'Job.role',
            'Job.description',
            'Job.applicationLink',
            'Job.mode',
            'Job.studentDemographic',
            'Job.jobType',
            'Job.workingRights',
            'Job.additionalInfo',
            'Job.wamRequirements',
            'Job.isPaid',
            'Job.expiry',
          ])
          .leftJoinAndSelect('Job.company', 'company')
          .where('Job.approved = :approved', { approved: true })
          .andWhere('Job.id = :id', { id: parseInt(req.params.jobID, 10) })
          .andWhere('Job.deleted = :deleted', { deleted: false })
          .getOne();

        return {
          status: StatusCodes.OK,
          msg: { token: req.newJbToken, job: jobInfo },
        };
      },
      () => ({
        status: StatusCodes.BAD_REQUEST,
        msg: { token: req.newJbToken },
      }),
      next,
    );
  }

  public static async GetFeaturedJobs(
    this: void,
    req: StudentFeaturedJobsRequest,
    res: Response,
    next: NextFunction,
  ) {
    await Helpers.catchAndLogError(
      res,
      async (): Promise<IResponseWithStatus> => {
        Logger.Info(LM, 'Attempting to get featured jobs');

        let jobs = await AppDataSource.getRepository(Job)
          .createQueryBuilder()
          .select([
            'company.logo',
            'Job.id',
            'Job.role',
            'Job.description',
            'Job.workingRights',
            'Job.applicationLink',
          ])
          .leftJoinAndSelect('Job.company', 'company')
          .where('Job.approved = :approved', { approved: true })
          .andWhere('Job.expiry > :expiry', { expiry: new Date() })
          .andWhere('Job.hidden = :hidden', { hidden: false })
          .getMany();

        // check if there are enough jobs to feature
        if (jobs.length >= 4) {
          jobs = jobs.slice(0, 4);
        } else {
          jobs = jobs.slice(0, jobs.length);
        }

        const featuredJobs = jobs.map((job: Job) => {
          if (job === null) {
            return null;
          }
          const newJob: {
            id: number;
            logo: string;
            role: string;
            description: string;
            workingRights: WorkingRights[];
            applicationLink: string;
            company: string;
          } = {
            id: job.id,
            logo: job.company.logo ? job.company.logo.toString() : null,
            role: job.role,
            description: job.description,
            workingRights: job.workingRights,
            applicationLink: job.applicationLink,
            company: job.company.name,
          };
          return newJob;
        });

        return {
          status: StatusCodes.OK,
          msg: { token: req.newJbToken, featuredJobs },
        };
      },
      () => ({
        status: StatusCodes.BAD_REQUEST,
        msg: { token: req.newJbToken },
      }),
      next,
    );
  }

  public static async SearchJobs(
    this: void,
    req: SearchJobRequest,
    res: Response,
    next: NextFunction,
  ) {
    await Helpers.catchAndLogError(
      res,
      async () => {
        Helpers.requireParameters(req.params.queryString);
        Logger.Info(
          LM,
          `STUDENT=${req.studentZID} attempting to search for jobs with QUERYSTRING=${req.params.queryString}`,
        );
        const { queryString } = req.params;

        const allJobs = await AppDataSource.getRepository(Job)
          .createQueryBuilder()
          .select([
            'company.name',
            'company.location',
            'company.description',
            'Job.id',
            'Job.role',
            'Job.description',
            'Job.applicationLink',
            'Job.mode',
            'Job.studentDemographic',
            'Job.jobType',
            'Job.workingRights',
            'Job.additionalInfo',
            'Job.wamRequirements',
            'Job.isPaid',
            'Job.expiry',
          ])
          .leftJoinAndSelect('Job.company', 'company')
          .where('Job.approved = :approved', { approved: true })
          .andWhere('Job.deleted = :deleted', { deleted: false })
          .andWhere('Job.hidden = :hidden', { hidden: false })
          .andWhere('Job.expiry > :expiry', { expiry: new Date() })
          .getMany();

        const options = {
          // weight of keys are normalised back to [0, 1]
          keys: [
            {
              name: 'company.name',
              weight: 4,
            },
            {
              name: 'role',
              weight: 3,
            },
            {
              name: 'mode',
              weight: 2,
            },
            {
              name: 'jobType',
              weight: 2,
            },
          ],
        };

        const fuseInstance = new Fuse(allJobs, options);
        const filteredResult = fuseInstance.search(queryString);

        return {
          status: StatusCodes.OK,
          msg: { token: req.newJbToken, searchResult: filteredResult },
        };
      },
      () => ({
        status: StatusCodes.BAD_REQUEST,
        msg: { token: req.newJbToken },
      }),
      next,
    );
  }

  public static async CreateStudent(info: StudentBase) {
    Logger.Info(LM, `Creating new student record with profile for STUDENT=${info.studentZID}`);
    const student = new Student();
    student.zID = info.studentZID;
    student.latestValidToken = info.newJbToken;
    student.studentProfile = new StudentProfile();

    await AppDataSource.manager.save(student);
  }

  public static async GetStudentProfile(
    this: void,
    req: StudentGetProfileRequest,
    res: Response,
    next: NextFunction,
  ) {
    await Helpers.catchAndLogError(
      res,
      async (): Promise<IResponseWithStatus> => {
        Logger.Info(LM, 'Attempting to get student profile');

        const student = await AppDataSource.getRepository(Student)
          .createQueryBuilder()
          .leftJoinAndSelect('Student.studentProfile', 'studentProfile')
          .where('Student.zID = :zID', { zID: req.studentZID })
          .getOneOrFail();

        if (!student.studentProfile) {
          Logger.Info(LM, `Creating new student profile record for STUDENT=${req.studentZID}`);
          student.studentProfile = new StudentProfile();
        }

        return {
          status: StatusCodes.OK,
          msg: { token: req.newJbToken, studentProfile: student.studentProfile },
        };
      },
      () => ({ status: StatusCodes.BAD_REQUEST, msg: { token: req.newJbToken } }),
      next,
    );
  }

  public static async EditStudentProfile(
    this: void,
    req: StudentEditProfileRequest,
    res: Response,
    next: NextFunction,
  ) {
    await Helpers.catchAndLogError(
      res,
      async (): Promise<IResponseWithStatus> => {
        Logger.Info(LM, 'Attempting to edit student profile');

        const { studentZID } = req;

        const studentProfile = {
          gradYear: req.body.gradYear,
          wam: req.body.wam,
          workingRights: req.body.workingRights,
        };

        Helpers.isValidGradYear(studentProfile.gradYear);
        Helpers.isValidWamRequirement(studentProfile.wam);
        Helpers.isValidWorkingRights([studentProfile.workingRights]);

        Logger.Info(LM, `STUDENT=${studentZID} attempting to edit profile.`);

        const student = await AppDataSource.getRepository(Student)
          .createQueryBuilder()
          .leftJoinAndSelect('Student.studentProfile', 'studentProfile')
          .where('Student.zID = :zID', { zID: studentZID })
          .getOneOrFail();

        await AppDataSource.getRepository(StudentProfile)
          .createQueryBuilder()
          .update(StudentProfile)
          .set({
            gradYear: studentProfile.gradYear,
            wam: studentProfile.wam,
            workingRights: studentProfile.workingRights,
          })
          .where('id = :id', { id: student.studentProfile.id })
          .execute();

        Logger.Info(LM, `STUDENT=${studentZID} sucessfully edited their profile`);

        return { status: StatusCodes.OK, msg: undefined };
      },
      () => ({ status: StatusCodes.BAD_REQUEST, msg: undefined }),
      next,
    );
  }
}
