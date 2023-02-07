import React, { useContext, useState } from 'react';
import {
  faCircleDollarToSlot,
  faLocationDot,
  faSuitcase,
  faTrashAlt,
  faUserGroup
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppContext from 'app/AppContext';
import { AxiosError } from 'axios';
import { JobMode, JobType } from 'constants/jobFields';
import { useRouter } from 'next/navigation';
import { StudentDemographic, WorkingRights } from 'types/api';
import JobDescriptionModal from 'components/JobDescriptionModal/JobDescriptionModal';
import api from 'config/api';
import styles from './styles.module.css';

type JobProfileCardProps = {
  jobID: number;
  role: string;
  isPaidPosition: string;
  jobType: string;
  mode: string;
  expiry: string;
  description: string;
  applicationLink: string;
  workingRights: WorkingRights[];
  studentDemographic: StudentDemographic[];
  wamRequirements: string;
  additionalInfo: string;
  listName: string;
};

const JobProfileCard = ({
  jobID,
  role,
  isPaidPosition,
  jobType,
  mode,
  expiry,
  description,
  applicationLink,
  workingRights,
  studentDemographic,
  wamRequirements,
  additionalInfo,
  listName
}: JobProfileCardProps) => {
  const [openModal, setOpenModal] = useState(false);

  const { apiToken } = useContext(AppContext);

  const router = useRouter();

  const jobTypeObject = JobType;
  const jobModeObject = JobMode;

  const closeJobModal = () => {
    setOpenModal(false);
  };

  const deleteJob = async () => {
    try {
      await api.delete(`/company/job/${jobID}`, {
        headers: {
          Authorization: apiToken
        }
      });
      listName === 'postedJobs' && closeJobModal();
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 401) {
          setTimeout(() => {
            router.push('/company/login');
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
        expiryDate={expiry}
        isPaidPosition={isPaidPosition}
        jobType={jobType}
        jobMode={mode}
        workingRights={workingRights}
        studentDemographic={studentDemographic}
        wamRequirements={wamRequirements}
        additionalInfo={additionalInfo}
        onClose={closeJobModal}
      />
      <div
        className={`${styles.box} relative mt-6 ml-6 mb-8 rounded-xl w-[190px] h-[230px] cursor-pointer px-6`}
        onClick={() => setOpenModal(true)}
        role="button"
        tabIndex={0}
      >
        <div className="text-left">
          <h1 className="font-bold text-xl text-[#1a324e] text-center leading-[60px] mb-[-6px] truncate">
            {role}
          </h1>
          {/* <!-- Description --> */}
          <div className="flex">
            <div>
              <div>
                <FontAwesomeIcon icon={faSuitcase} className="text-black" size="1x" />
              </div>
              <div>
                <FontAwesomeIcon icon={faLocationDot} className="text-black ml-0.5" size="1x" />
              </div>
              <div>
                <FontAwesomeIcon icon={faUserGroup} className="text-black" size="1x" />
              </div>
              <div>
                <FontAwesomeIcon icon={faCircleDollarToSlot} className="text-black" size="1x" />
              </div>
            </div>

            <div className="truncate">
              <p className="ml-3 text-jb-subheadings truncate">
                {jobTypeObject[jobType as keyof typeof JobType]}
              </p>
              <p className="ml-3 text-jb-subheadings truncate">
                {jobModeObject[mode as keyof typeof JobMode]}
              </p>
              <p className="ml-3 text-jb-subheadings truncate">
                {studentDemographic.length === 2 ? 'Penult & Final' : 'All Students'}
              </p>
              <p className="ml-3 text-jb-subheadings truncate">
                {isPaidPosition ? 'Paid' : 'Not Paid'}
              </p>
            </div>
          </div>

          <p className="text-[#1a324e] text-sm text-center mt-4">
            Expiry Date: {new Date(expiry).toLocaleDateString()}
          </p>
        </div>
        {listName === 'postedJobs' && (
          <div
            className="w-[105px] h-[25px] mt-4 rounded-lg flex justify-center cursor-pointer"
            onClick={deleteJob}
            role="button"
            tabIndex={0}
          >
            <div>
              <FontAwesomeIcon icon={faTrashAlt} className="text-[#FF7060]" size="1x" />
            </div>
            <div>
              <p className="font-bold text-[#FF7060] text-[15px] ml-1 mb-0.5">Remove Job</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobProfileCard;
