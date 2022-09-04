import "reflect-metadata";

import { AppDataSource } from './index';
import Logger from "./logging";
import { AdminAccount } from "./entity/admin_account";
import { Company } from "./entity/company";
import { CompanyAccount } from "./entity/company_account";
import { Job } from "./entity/job";
import { Statistics } from "./entity/statistics";
import Secrets from "./secrets";
import { JobMode, JobType, StudentDemographic, WamRequirements, WorkingRights } from "./types/job-field";

export async function seedDB(activeEntities: any[]) {
  Logger.Info("SEEDING DATABASE");
  // clear all tables
  if (process.env.NODE_ENV === "development") {
    Logger.Info("Clearing all tables.");
    await AppDataSource.synchronize(true);
  }

  // create dummy admin account
  const adminAccount = new AdminAccount();
  adminAccount.username = "admin";
  adminAccount.hash = Secrets.hash("incorrect pony plug paperclip");
  await AppDataSource.manager.save(adminAccount);

  // create a verified company account
  const companyAccount = new CompanyAccount();
  companyAccount.username = "test";
  companyAccount.hash = Secrets.hash("test");
  companyAccount.verified = true;
  const company = new Company();
  company.name = "Test company";
  company.location = "Sydney";
  companyAccount.company = company;
  
  // every job except job1 and job 2 have not expired yet
  const job1 = new Job();
  job1.role = "Software Engineer and Reliability";
  job1.description = "Doing software engineer things and SRE things";
  job1.applicationLink = "https://sampleapplication.link";
  job1.approved = true;
  job1.hidden = false;
  job1.company = company;
  job1.mode = JobMode.Remote;
  job1.studentDemographic = [StudentDemographic.All];
  job1.jobType = JobType.Intern;
  job1.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes];
  job1.wamRequirements = WamRequirements.HD;
  job1.additionalInfo = "";
  job1.isPaid = true;
  job1.expiry = new Date('2015-01-01');

  const job2 = new Job();
  job2.role = "Software Engineer";
  job2.description = "Doing software engineer things";
  job2.applicationLink = "mailto:example@example.com";
  job2.approved = true;
  job2.hidden = false;
  job2.company = company;
  job2.mode = JobMode.Remote;
  job2.studentDemographic = [StudentDemographic.All];
  job2.jobType = JobType.Intern;
  job2.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes];
  job2.wamRequirements = WamRequirements.C;
  job2.additionalInfo = "";
  job2.isPaid = true;
  job2.expiry = new Date('1995-01-01');

  const job3 = new Job();
  job3.role = "Mechanical Engineer";
  job3.description = "Doing mechanical engineer things";
  job3.applicationLink = "https://sampleapplication.net";
  job3.approved = true;
  job3.company = company;
  job3.mode = JobMode.Hybrid;
  job3.studentDemographic = [StudentDemographic.FinalYear, StudentDemographic.Penultimate];
  job3.jobType = JobType.Grad;
  job3.workingRights = [WorkingRights.All];
  job3.wamRequirements = WamRequirements.None;
  job3.additionalInfo = "";
  job3.isPaid = true;
  job3.expiry = new Date('2032-01-01')

  const job4 = new Job();
  job4.role = "Computer Scientist";
  job4.description = "Computer science and software engineering are both degrees";
  job4.applicationLink = "https://sampleapplicationlink.net";
  job4.company = company;
  job4.approved = true;
  job4.mode = JobMode.Remote;
  job4.studentDemographic = [StudentDemographic.All];
  job4.jobType = JobType.Intern;
  job4.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  job4.wamRequirements = WamRequirements.HD;
  job4.additionalInfo = "";
  job4.isPaid = true;
  job4.approved = true; 
  job4.expiry = new Date('2030-01-10');

  const job5 = new Job();
  job5.role = "Frontend Developer";
  job5.description = "React masters only";
  job5.applicationLink = "https://sampleapplicationlink.net";
  job5.company = company;
  job5.approved = true;
  job5.expiry = new Date('2035-01-01');
  job5.mode = JobMode.Remote;
  job5.studentDemographic = [StudentDemographic.All];
  job5.jobType = JobType.Intern;
  job5.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  job5.wamRequirements = WamRequirements.HD;
  job5.additionalInfo = "";
  job5.isPaid = true;

  const job6 = new Job();
  job6.role = "Backend Developer";
  job6.description = "Java is not poggers";
  job6.applicationLink = "https://sampleapplicationlink.net";
  job6.company = company;
  job6.approved = true;
  job6.expiry = new Date('2030-01-10');
  job6.mode = JobMode.Remote;
  job6.studentDemographic = [StudentDemographic.All];
  job6.jobType = JobType.Intern;
  job6.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  job6.wamRequirements = WamRequirements.HD;
  job6.additionalInfo = "";
  job6.isPaid = true;
  // const job9 = new Job();
  // job9.role = "Backend Developer";
  // job9.description = "Java is not poggers";
  // job9.applicationLink = "https://sampleapplicationlink.net";
  // job9.company = company;
  // job9.approved = true;
  // job9.expiry = new Date('2030-01-10');
  // job9.mode = JobMode.Remote;
  // job9.studentDemographic = [StudentDemographic.All];
  // job9.jobType = JobType.Intern;
  // job9.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job9.wamRequirements = WamRequirements.HD;
  // job9.additionalInfo = "";
  // job9.isPaid = true;
  // const job10 = new Job();
  // job10.role = "Backend Developer";
  // job10.description = "Java is not poggers";
  // job10.applicationLink = "https://sampleapplicationlink.net";
  // job10.company = company;
  // job10.approved = true;
  // job10.expiry = new Date('2030-01-10');
  // job10.mode = JobMode.Remote;
  // job10.studentDemographic = [StudentDemographic.All];
  // job10.jobType = JobType.Intern;
  // job10.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job10.wamRequirements = WamRequirements.HD;
  // job10.additionalInfo = "";
  // job10.isPaid = true;
  // const job11 = new Job();
  // job11.role = "Backend Developer";
  // job11.description = "Java is not poggers";
  // job11.applicationLink = "https://sampleapplicationlink.net";
  // job11.company = company;
  // job11.approved = true;
  // job11.expiry = new Date('2030-01-10');
  // job11.mode = JobMode.Remote;
  // job11.studentDemographic = [StudentDemographic.All];
  // job11.jobType = JobType.Intern;
  // job11.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job11.wamRequirements = WamRequirements.HD;
  // job11.additionalInfo = "";
  // job11.isPaid = true;
  // const job12 = new Job();
  // job12.role = "Backend Developer";
  // job12.description = "Java is not poggers";
  // job12.applicationLink = "https://sampleapplicationlink.net";
  // job12.company = company;
  // job12.approved = true;
  // job12.expiry = new Date('2030-01-10');
  // job12.mode = JobMode.Remote;
  // job12.studentDemographic = [StudentDemographic.All];
  // job12.jobType = JobType.Intern;
  // job12.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job12.wamRequirements = WamRequirements.HD;
  // job12.additionalInfo = "";
  // job12.isPaid = true;
  // const job13 = new Job();
  // job13.role = "Backend Developer";
  // job13.description = "Java is not poggers";
  // job13.applicationLink = "https://sampleapplicationlink.net";
  // job13.company = company;
  // job13.approved = true;
  // job13.expiry = new Date('2030-01-10');
  // job13.mode = JobMode.Remote;
  // job13.studentDemographic = [StudentDemographic.All];
  // job13.jobType = JobType.Intern;
  // job13.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job13.wamRequirements = WamRequirements.HD;
  // job13.additionalInfo = "";
  // job13.isPaid = true;
  // const job14 = new Job();
  // job14.role = "Backend Developer";
  // job14.description = "Java is not poggers";
  // job14.applicationLink = "https://sampleapplicationlink.net";
  // job14.company = company;
  // job14.approved = true;
  // job14.expiry = new Date('2030-01-10');
  // job14.mode = JobMode.Remote;
  // job14.studentDemographic = [StudentDemographic.All];
  // job14.jobType = JobType.Intern;
  // job14.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job14.wamRequirements = WamRequirements.HD;
  // job14.additionalInfo = "";
  // job14.isPaid = true;
  // const job15 = new Job();
  // job15.role = "Backend Developer";
  // job15.description = "Java is not poggers";
  // job15.applicationLink = "https://sampleapplicationlink.net";
  // job15.company = company;
  // job15.approved = true;
  // job15.expiry = new Date('2030-01-10');
  // job15.mode = JobMode.Remote;
  // job15.studentDemographic = [StudentDemographic.All];
  // job15.jobType = JobType.Intern;
  // job15.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job15.wamRequirements = WamRequirements.HD;
  // job15.additionalInfo = "";
  // job15.isPaid = true;
  // const job16 = new Job();
  // job16.role = "Backend Developer";
  // job16.description = "Java is not poggers";
  // job16.applicationLink = "https://sampleapplicationlink.net";
  // job16.company = company;
  // job16.approved = true;
  // job16.expiry = new Date('2030-01-10');
  // job16.mode = JobMode.Remote;
  // job16.studentDemographic = [StudentDemographic.All];
  // job16.jobType = JobType.Intern;
  // job16.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job16.wamRequirements = WamRequirements.HD;
  // job16.additionalInfo = "";
  // job16.isPaid = true;
  // const job17 = new Job();
  // job17.role = "Backend Developer";
  // job17.description = "Java is not poggers";
  // job17.applicationLink = "https://sampleapplicationlink.net";
  // job17.company = company;
  // job17.approved = true;
  // job17.expiry = new Date('2030-01-10');
  // job17.mode = JobMode.Remote;
  // job17.studentDemographic = [StudentDemographic.All];
  // job17.jobType = JobType.Intern;
  // job17.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job17.wamRequirements = WamRequirements.HD;
  // job17.additionalInfo = "";
  // job17.isPaid = true;
  // const job18 = new Job();
  // job18.role = "Backend Developer";
  // job18.description = "Java is not poggers";
  // job18.applicationLink = "https://sampleapplicationlink.net";
  // job18.company = company;
  // job18.approved = true;
  // job18.expiry = new Date('2030-01-10');
  // job18.mode = JobMode.Remote;
  // job18.studentDemographic = [StudentDemographic.All];
  // job18.jobType = JobType.Intern;
  // job18.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job18.wamRequirements = WamRequirements.HD;
  // job18.additionalInfo = "";
  // job18.isPaid = true;
  // const job19 = new Job();
  // job19.role = "Backend Developer";
  // job19.description = "Java is not poggers";
  // job19.applicationLink = "https://sampleapplicationlink.net";
  // job19.company = company;
  // job19.approved = true;
  // job19.expiry = new Date('2030-01-10');
  // job19.mode = JobMode.Remote;
  // job19.studentDemographic = [StudentDemographic.All];
  // job19.jobType = JobType.Intern;
  // job19.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job19.wamRequirements = WamRequirements.HD;
  // job19.additionalInfo = "";
  // job19.isPaid = true;
  // const job20 = new Job();
  // job20.role = "Backend Developer";
  // job20.description = "Java is not poggers";
  // job20.applicationLink = "https://sampleapplicationlink.net";
  // job20.company = company;
  // job20.approved = true;
  // job20.expiry = new Date('2030-01-10');
  // job20.mode = JobMode.Remote;
  // job20.studentDemographic = [StudentDemographic.All];
  // job20.jobType = JobType.Intern;
  // job20.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  // job20.wamRequirements = WamRequirements.HD;
  // job20.additionalInfo = "";
  // job20.isPaid = true;
  
  // following two jobs are used for testing retrieving number of verified job posts
  const job7 = new Job();
  job7.role = "verified job 1";
  job7.description = "Java is not poggers";
  job7.applicationLink = "https://sampleapplicationlink.net";
  job7.company = company;
  job7.approved = true;
  job7.expiry = new Date('2030-01-10');
  job7.mode = JobMode.Remote;
  job7.studentDemographic = [StudentDemographic.All];
  job7.jobType = JobType.Intern;
  job7.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  job7.wamRequirements = WamRequirements.HD;
  job7.additionalInfo = "";
  job7.isPaid = true;
  job7.createdAt = new Date('1999-5-10')
  
  const job8 = new Job();
  job8.role = "verified job 1";
  job8.description = "Java is not poggers";
  job8.applicationLink = "https://sampleapplicationlink.net";
  job8.company = company;
  job8.approved = true;
  job8.expiry = new Date('2030-01-10');
  job8.mode = JobMode.Remote;
  job8.studentDemographic = [StudentDemographic.All];
  job8.jobType = JobType.Intern;
  job8.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  job8.wamRequirements = WamRequirements.HD;
  job8.additionalInfo = "";
  job8.isPaid = true;
  job8.createdAt = new Date('1999-10-10')

  companyAccount.company.jobs = [
    job1,
    job2,
    job3,
    job4,
    job5,
    job6,
    job7,
    job8,
    // job9,
    // job10,
    // job11,
    // job12,
    // job13,
    // job14,
    // job15,
    // job16,
    // job17,
    // job18,
    // job19,
    // job20
  ];

  await AppDataSource.manager.save(companyAccount);
  
  // create an unverfied company account 
  const companyAccount2 = new CompanyAccount();
  companyAccount2.username = "test2";
  companyAccount2.hash = Secrets.hash("test2");
  companyAccount.verified = false;
  const company2 = new Company();
  company2.name = "Test company 2";
  company2.location = "Hong Kong";
  companyAccount2.company = company2;

  await AppDataSource.manager.save(companyAccount2);
  
  // create another verified company account for tests 
  const companyAccount3 = new CompanyAccount();
  companyAccount3.username = "test3";
  companyAccount3.hash = Secrets.hash("test3");
  companyAccount3.verified = true;
  const company3 = new Company();
  company3.name = "Test company 3";
  company3.location = "Singapore";
  companyAccount3.company = company3;
  
  // normal approved job
  const companyAccount3_job1 = new Job();
  companyAccount3_job1.role = "approved job";
  companyAccount3_job1.description = "Java is not poggers";
  companyAccount3_job1.applicationLink = "https://sampleapplicationlink.net";
  companyAccount3_job1.company = company3;
  companyAccount3_job1.approved = true;
  companyAccount3_job1.expiry = new Date('2030-01-10');
  companyAccount3_job1.mode = JobMode.Remote;
  companyAccount3_job1.studentDemographic = [StudentDemographic.All];
  companyAccount3_job1.jobType = JobType.Intern;
  companyAccount3_job1.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  companyAccount3_job1.wamRequirements = WamRequirements.HD;
  companyAccount3_job1.additionalInfo = "";
  companyAccount3_job1.isPaid = true;
  companyAccount3_job1.createdAt = new Date('2020-10-10')
  
  // approved but expired job
  const companyAccount3_job2 = new Job();
  companyAccount3_job2.role = "expired job";
  companyAccount3_job2.description = "Java is not poggers";
  companyAccount3_job2.applicationLink = "https://sampleapplicationlink.net";
  companyAccount3_job2.company = company3;
  companyAccount3_job2.approved = true;
  companyAccount3_job2.expiry = new Date('2003-01-28');
  companyAccount3_job2.mode = JobMode.Remote;
  companyAccount3_job2.studentDemographic = [StudentDemographic.All];
  companyAccount3_job2.jobType = JobType.Intern;
  companyAccount3_job2.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  companyAccount3_job2.wamRequirements = WamRequirements.HD;
  companyAccount3_job2.additionalInfo = "";
  companyAccount3_job2.isPaid = true;
  companyAccount3_job2.createdAt = new Date('2020-10-10')
  
  // approved but hidden job
  const companyAccount3_job3 = new Job();
  companyAccount3_job3.role = "hidden job";
  companyAccount3_job3.description = "Java is not poggers";
  companyAccount3_job3.applicationLink = "https://sampleapplicationlink.net";
  companyAccount3_job3.company = company3;
  companyAccount3_job3.approved = true;
  companyAccount3_job3.expiry = new Date('2003-01-28');
  companyAccount3_job3.mode = JobMode.Remote;
  companyAccount3_job3.studentDemographic = [StudentDemographic.All];
  companyAccount3_job3.jobType = JobType.Intern;
  companyAccount3_job3.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  companyAccount3_job3.wamRequirements = WamRequirements.HD;
  companyAccount3_job3.additionalInfo = "";
  companyAccount3_job3.isPaid = true;
  companyAccount3_job3.hidden = true;
  companyAccount3_job3.createdAt = new Date('2020-10-10')
  
  // approved by deleted job 
  const companyAccount3_job4 = new Job();
  companyAccount3_job4.role = "deleted job";
  companyAccount3_job4.description = "Java is not poggers";
  companyAccount3_job4.applicationLink = "https://sampleapplicationlink.net";
  companyAccount3_job4.company = company3;
  companyAccount3_job4.approved = true;
  companyAccount3_job4.expiry = new Date('2003-01-28');
  companyAccount3_job4.mode = JobMode.Remote;
  companyAccount3_job4.studentDemographic = [StudentDemographic.All];
  companyAccount3_job4.jobType = JobType.Intern;
  companyAccount3_job4.workingRights = [WorkingRights.AusCtz, WorkingRights.AusPermRes, WorkingRights.AusStudVisa];
  companyAccount3_job4.wamRequirements = WamRequirements.HD;
  companyAccount3_job4.additionalInfo = "";
  companyAccount3_job4.isPaid = true;
  companyAccount3_job4.deleted = true;
  companyAccount3_job4.createdAt = new Date('2020-10-10')
  
  companyAccount3.company.jobs = [
    companyAccount3_job1,
    companyAccount3_job2,
    companyAccount3_job3,
    companyAccount3_job4
  ];
  
  await AppDataSource.manager.save(companyAccount3);
  
  // create a testing statistic 
  const stats1 = new Statistics();
  stats1.year = 2000;
  stats1.numJobPosts = 7;
  await AppDataSource.manager.save(stats1);
  
  Logger.Info("FINISHED SEEDING");
}
