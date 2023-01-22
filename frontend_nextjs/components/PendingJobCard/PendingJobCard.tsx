import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppContext from 'app/AppContext';
import JobDescriptionModal from 'components/JobDescriptionModal/JobDescriptionModal';
import api from 'config/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import googleLogo from 'assets/companies/googleLogo.png';
import { faBuilding, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { StudentDemographic, WorkingRights } from 'types/api';
import { AxiosError } from 'axios';

type PendingJobCardProps = {
  company: string;
  location: string;
  jobID: number;
  role: string;
  description: string;
  applicationLink: string;
  expiryDate: string;
  isPaidPosition: string;
  jobType: string;
  jobMode: string;
  workingRights: WorkingRights[];
  studentDemographic: StudentDemographic[];
  wamRequirements: string;
  additionalInfo: string;
  onSuccess(message: string): void;
  onError(message: string): void;
  onRemove(): void;
};

const PendingJobCard = ({
  company,
  location,
  jobID,
  role,
  description,
  applicationLink,
  expiryDate,
  isPaidPosition,
  jobType,
  jobMode,
  workingRights,
  studentDemographic,
  wamRequirements,
  additionalInfo,
  onSuccess,
  onError,
  onRemove
}: PendingJobCardProps) => {
  const [openModal, setOpenModal] = useState(false);

  const router = useRouter();
  const { apiToken, setApiToken } = useContext(AppContext);

  const approveJob = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const res = await api.patch(
        `/job/${jobID}/approve`,
        {},
        {
          headers: {
            Authorization: apiToken
          }
        }
      );
      setApiToken(res.data.token);
      onRemove();
      onSuccess('Job successfully approved!');
      onError('');
    } catch (e) {
      onError('Something went wrong. Please try again.');
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          onSuccess('');
          onError('Invalid user credentials. Redirecting to home page.');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      }
      window.scrollTo(0, 10);
    }
  };

  const rejectJob = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const res = await api.patch(
        `/job/${jobID}/reject`,
        {},
        {
          headers: {
            Authorization: apiToken
          }
        }
      );
      setApiToken(res.data.token);
      onRemove();
      onSuccess('Job successfully rejected!');
    } catch (e) {
      onError('Something went wrong. Please try again!');
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          onError('Invalid user credentials. Redirecting to home page.');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      }
    }
  };

  return (
    <div>
      <JobDescriptionModal
        open={openModal}
        title={role}
        description={description}
        applicationLink={applicationLink}
        expiryDate={expiryDate}
        isPaidPosition={isPaidPosition}
        jobType={jobType}
        jobMode={jobMode}
        workingRights={workingRights}
        studentDemographic={studentDemographic}
        wamRequirements={wamRequirements}
        additionalInfo={additionalInfo}
        onClose={() => setOpenModal(false)}
      />
      <br />
      <div>
        <button
          className="flex flex-row p-4 shadow-card rounded-md w-full sm:flex-wrap hover-anim bg-white"
          onClick={() => setOpenModal(true)}
        >
          {/* <!-- TODO: to be replaced with company logo --> */}
          <Image
            src={googleLogo}
            className="h-auto max-w-[100px] max-h-[90px] mr-8 self-center"
            alt="job logo"
          />
          <div className="flex flex-col text-left pt-3 grow min-w-[200px]">
            <h2 className="font-bold text-jb-headings">{role}</h2>
            <p>
              <FontAwesomeIcon icon={faBuilding} className="h-4 mr-1" />
              {company}
            </p>
            <p>
              <FontAwesomeIcon icon={faLocationDot} className="h-4 mr-1" />
              {location}
            </p>
          </div>
          <div className="sm:flex mx-auto">
            <button className="btn btn-green w-36 h-10 p-2 my-2" onClick={approveJob}>
              Approve
            </button>
            <button className="btn btn-red w-36 h-10 p-2 my-2" onClick={rejectJob}>
              Reject
            </button>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PendingJobCard;
