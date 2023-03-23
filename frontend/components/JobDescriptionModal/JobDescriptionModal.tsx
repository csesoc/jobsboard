import React from 'react';
import {
  faAddressCard,
  faCalendar,
  faCircleDollarToSlot,
  faGraduationCap,
  faLink,
  faSuitcase,
  faUser,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from 'components/Modal/Modal';
import {
  JobMode as JobModeObj,
  StudentDemographic as StudentDemographicObj,
  WamRequirements as WamRequirementsObj,
  WorkingRights as WorkingRightsObj
} from 'constants/jobFields';
import { StudentDemographic, WorkingRights } from 'types/api';

type JobDescriptionModalProps = {
  role: string;
  description: string;
  applicationLink: string;
  expiry: string;
  isPaid: boolean;
  jobType: string;
  jobMode: string;
  workingRights: WorkingRights[];
  studentDemographic: StudentDemographic[];
  wamRequirements: string;
  additionalInfo: string;
  open: boolean;
  onClose(): void;
};

const JobDescriptionModal = ({
  role,
  description,
  applicationLink,
  expiry,
  isPaid,
  jobType,
  jobMode,
  workingRights,
  studentDemographic,
  wamRequirements,
  additionalInfo,
  open,
  onClose
}: JobDescriptionModalProps) => {
  return (
    <Modal open={open}>
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-h-[80%] my-auto overflow-auto">
        {/* <!-- Modal header --> */}
        <div className="flex justify-between items-center p-5 rounded-t border-b dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{role}</h2>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} size="2x" />
          </button>
        </div>
        {/* <!-- Modal body --> */}
        <div className="flex items-start flex-col p-6 space-y-6">
          <div className="grid grid-cols-2 w-full text-left">
            <h3 className="text-l font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faSuitcase} className="mr-1" />
              Job Mode:&nbsp;
              <span className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {JobModeObj[jobMode as keyof typeof JobModeObj]}
              </span>
            </h3>
            <h3 className="text-l font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faSuitcase} className="mr-1" />
              Job Type:&nbsp;
              <span className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {JobModeObj[jobType as keyof typeof JobModeObj]}
              </span>
            </h3>
            <h3 className="text-l font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faCircleDollarToSlot} className="mr-1" />
              Is this position paid?&nbsp;
              <span className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {isPaid ? 'Yes' : 'No'}
              </span>
            </h3>
            <h3 className="text-l font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faCalendar} className="mr-1" />
              Application Expiry Date:&nbsp;
              <span className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {new Date(expiry).toLocaleDateString()}
              </span>
            </h3>
            <h3 className="text-l font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faGraduationCap} className="mr-1" />
              Applicant&apos;s WAM:&nbsp;
              <span className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {WamRequirementsObj[wamRequirements as keyof typeof WamRequirementsObj]}
              </span>
            </h3>
            <h3 className="text-l font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faLink} className="mr-1" />
              Application Link:&nbsp;
              <span className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {applicationLink}
              </span>
            </h3>
            <h3 className="text-l font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faAddressCard} className="mr-1" />
              Applicant&apos;s Working Rights:&nbsp;
              <span className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                <ul className="list-disc list-inside">
                  {workingRights.map((workingRight) => (
                    <li key={workingRight}>
                      {WorkingRightsObj[workingRight as keyof typeof WorkingRightsObj]}
                    </li>
                  ))}
                </ul>
              </span>
            </h3>
            <h3 className="text-l font-medium text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              Who should apply for this role?&nbsp;
              <span className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                <ul className="list-disc list-inside">
                  {studentDemographic.map((student) => (
                    <li key={student}>
                      {StudentDemographicObj[student as keyof typeof StudentDemographicObj]}
                    </li>
                  ))}
                </ul>
              </span>
            </h3>
          </div>
          <h3 className="text-l font-medium text-gray-900 dark:text-white">Job Description:</h3>
          <p
            className="text-base leading-relaxed text-gray-500 dark:text-gray-400 text-left list-inside"
            dangerouslySetInnerHTML={{
              __html: description
            }}
          />
          <h3 className="text-l font-medium text-gray-900 dark:text-white">Additional Info:</h3>
          <p
            className="text-base leading-relaxed text-gray-500 dark:text-gray-400 text-left list-inside"
            dangerouslySetInnerHTML={{
              __html: additionalInfo
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default JobDescriptionModal;
