import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

// pages
const PageNotFoundPage = () => import("@/pages/PageNotFound.vue");
const LoginPage = () => import("@/pages/LoginPage.vue");
const StudentLoginPage = () => import("@/pages/StudentLoginPage.vue");
const CompanyLoginPage = () => import("@/pages/CompanyLoginPage.vue");
const CompanySignupPage = () => import("@/pages/CompanySignupPage.vue");
const CompanyPasswordForgotPage = () => import("@/pages/CompanyPasswordForgotPage.vue");
const CompanyPasswordResetPage = () => import("@/pages/CompanyPasswordResetPage.vue");
const JobsListPage = () => import("@/pages/JobsListPage.vue");
const SingleJobPage = () => import("@/pages/SingleJobPage.vue");
const CompanyAccountHome = () => import("@/pages/CompanyAccountHome.vue");
const CompanyAddJob = () => import("@/pages/CompanyAddJob.vue");
const AdminLoginPage = () => import("@/pages/AdminLoginPage.vue");
const AdminAccountHome = () => import("@/pages/AdminAccountHome.vue");
const AdminListPendingJobs = () => import("@/pages/AdminListPendingJobs.vue");
const AdminListCompanyPendingVerification = () => import("@/pages/AdminListCompanyPendingVerification.vue");
const AdminCreateJobAsCompany = () => import("@/pages/AdminCreateJobAsCompany.vue");
const CompanyManageJobs = () => import("@/pages/CompanyManageJobs.vue");

export default new Router({
  mode: "history",
  scrollBehavior: () => ({ y: 0 }),
  routes: [{
    path: "/login/student",
    component: StudentLoginPage,
  }, {
    path: "/login/company",
    component: CompanyLoginPage,
  }, {
    path: "/login/admin",
    component: AdminLoginPage,
  }, {
    path: "/signup/company",
    component: CompanySignupPage,
  }, {
    path: "/company/home",
    component: CompanyAccountHome,
  }, {
    path: "/admin/home",
    component: AdminAccountHome,
  }, {
    path: "/admin/jobs/pending",
    component: AdminListPendingJobs,
  }, {
    path: "/admin/companies/pending",
    component: AdminListCompanyPendingVerification,
  }, {
    path: "/admin/jobs/post",
    component: AdminCreateJobAsCompany,
  }, {
    path: "/company/jobs/add",
    component: CompanyAddJob,
  }, {
    path: "/login",
    component: LoginPage,
  }, {
    path: "/jobs",
    component: JobsListPage,
  }, {
    path: "/job/:jobID",
    component: SingleJobPage,
    props: true,
    name: "job",
  }, {
    path: "/company/jobs/manage",
    component: CompanyManageJobs,
  }, {
    path: "/company/password-forgot",
    component: CompanyPasswordForgotPage,
  }, {
    path: "/company/password-reset/:token",
    component: CompanyPasswordResetPage,
    props: true,
    name: "token",
  }, {
    path: "/",
    component: LoginPage,
  }, {
    path: "*",
    component: PageNotFoundPage,
  }],
} as any);
