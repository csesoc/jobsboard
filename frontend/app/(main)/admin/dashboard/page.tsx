'use client';

import React, { useContext, useEffect, useState } from 'react';
import {
  faAngleRight,
  faBell,
  faBriefcase,
  faUserShield,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppContext from 'app/AppContext';
import Alert from 'components/Alert/Alert';
import api from 'config/api';
import { AdminPendingCompaniesPayload, AdminPendingJobsPayload } from 'types/api';
import Button from 'ui/Button/Button';

const AdminDashboardPage = () => {
  const router = useRouter();
  const { apiToken, setApiToken } = useContext(AppContext);

  const [alertMsg, setAlertMsg] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [infoAlert, setInfoAlert] = useState(true);
  const [nPendingCompanies, setNPendingCompanies] = useState(0);
  const [nPendingJobs, setNPendingJobs] = useState(0);

  const fetchInfo = async () => {
    try {
      // Get the number of companies pending verification
      const res = await api.get<AdminPendingCompaniesPayload>('/admin/pending/companies', {
        headers: {
          Authorization: apiToken
        }
      });

      setApiToken(res.data.token);
      setNPendingCompanies(res.data.pendingCompanyVerifications.length);
    } catch (e) {
      setAlertOpen(true);
      setAlertMsg(
        "Failed to get pending companies. You might want to check what's happening in the console."
      );
      window.scrollTo(0, 10);
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          setAlertMsg('You are not authorized to perform this action. Redirecting to login page.');
          setTimeout(() => {
            router.push('/');
          }, 5000);
        }
      }
    }

    try {
      // Get the number of jobs pending verification
      const pendingJobsRes = await api.get<AdminPendingJobsPayload>('/admin/jobs/pending', {
        headers: {
          Authorization: apiToken
        }
      });

      setApiToken(pendingJobsRes.data.token);
      setNPendingJobs(pendingJobsRes.data.pendingJobs.length);
    } catch (e) {
      setAlertOpen(true);
      setAlertMsg(
        "Failed to get pending jobs. You might want to check what's happening in the console."
      );
      window.scrollTo(0, 10);
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          setAlertMsg('You are not authorized to perform this action. Redirecting to login page.');
          setTimeout(() => {
            router.push('/');
          }, 5000);
        }
      }
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div>
      <h1 className="text-3xl text-jb-headings font-bold mt-0 mb-3 md:mt-10">Welcome Back 👋</h1>
      <h3 className="text-base text-jb-subheadings">
        Hey there! It&apos;s great to see you again.
      </h3>

      {/* <!-- Error Alert --> */}
      <Alert
        type="error"
        message={alertMsg}
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        // className='mx-96 my-5 lg:mx-[25%]'
      />

      {/* <!-- Notification Alert --> */}
      {infoAlert && !alertOpen && (
        <div className="flex justify-evenly items-start my-10 mx-[30%] bg-white rounded-md py-5 px-2 border-2 border-blue-300 lg:mx-[25%]">
          <div className="mx-3 my-auto">
            <FontAwesomeIcon icon={faBell} className="text-2xl text-jb-headings bell" />
          </div>
          <div className="flex flex-col items-start text-left ml-2">
            <h3 className="text-xl font-bold text-jb-headings">
              Looks like we&apos;re still in business
            </h3>
            <p className="text-base text-jb-headings">
              There are&nbsp;
              <span className="text-jb-textlink font-bold hover:text-jb-textlink-hovered">
                {nPendingCompanies} companies
              </span>
              &nbsp;waiting for verification and&nbsp;
              <span className="text-jb-textlink font-bold hover:text-jb-textlink-hovered">
                {nPendingJobs} job posts
              </span>
              &nbsp;awaiting approval.
            </p>
          </div>
          <div className="flex items-start mx-2">
            <FontAwesomeIcon
              icon={faXmark}
              className="text-xl ml-2 text-jb-headings cursor-pointer"
              onClick={() => setInfoAlert(false)}
            />
          </div>
        </div>
      )}

      {/* <!-- Company Verification --> */}
      <div className="flex flex-col justify-center items-center bg-white p-6 mx-[30%] my-4 lg:mx-[25%] rounded-md shadow-card">
        <h3 className="text-2xl font-bold text-jb-headings">Company Verification</h3>
        <p className="text-md text-jb-subheadings pt-2 pb-5">
          Please ensure that the
          <span className="text-jb-textlink font-bold"> company is legitimate </span>
          before verifying.
        </p>
        <Link href="/admin/company">
          <Button variant="primary">
            <FontAwesomeIcon icon={faUserShield} />
            <span className="mx-3">Verify Company</span>
            <FontAwesomeIcon icon={faAngleRight} />
          </Button>
        </Link>
      </div>

      {/* <!-- Job Verification --> */}
      <div className="flex flex-col justify-center items-center bg-white p-6 mx-[30%] mt-6 lg:mx-[25%] rounded-md shadow-card">
        <h3 className="text-2xl font-bold text-jb-headings">Job Verification</h3>
        <p className="text-md text-jb-subheadings pt-2 pb-5">
          Please ensure that all job posts complies with the
          <span className="text-jb-textlink font-bold"> Australian Fair Work Act 2009</span>.
        </p>
        <Link href="/admin/jobs">
          <Button variant="primary">
            <FontAwesomeIcon icon={faBriefcase} />
            <span className="mx-3">Verify Job Post</span>
            <FontAwesomeIcon icon={faAngleRight} />
          </Button>
        </Link>
      </div>

      {/* <!-- Post Job as Company --> */}
      <div className="flex flex-col justify-center items-center bg-white p-6 mx-[30%] mt-6 lg:mx-[25%] rounded-md shadow-card mb-10">
        <h3 className="text-2xl font-bold text-jb-headings">Post job as Company</h3>
        <p className="text-md text-jb-subheadings pt-2 pb-5">
          Make a job
          <span className="text-jb-textlink font-bold"> post on behalf of a company</span>. Ensure
          that you have their explicit permission before doing so.
        </p>
        <Link href="/admin/post">
          <Button variant="primary">
            <FontAwesomeIcon icon={faBriefcase} />
            <span className="mx-3">Post Job</span>
            <FontAwesomeIcon icon={faAngleRight} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
