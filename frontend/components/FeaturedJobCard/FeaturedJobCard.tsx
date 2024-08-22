import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';
import styles from './styles.module.css';
import { JobMode, JobType } from 'constants/jobFields';
import {
  faAddressCard,
  faBuilding,
  faClock,
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';

type FeaturedJobCardProps = {
  title: string;
  description: string;
  workingRights: string[];
  imgSrc: string;
  jobType: string;
  location: string;
  mode: string;
};

const FeaturedJobCard = ({
  title,
  description,
  imgSrc,
  jobType,
  location,
  mode
}: FeaturedJobCardProps) => {
  return (
    <Link href="/student/login">
      <div className="flex mx-4 mt-8 mb-12 flex-col justify-between shadow-card rounded-lg bg-white relative hover-anim max-h-[600px]">
        <div className="flex-grow overflow-hidden">
          <div className="flex justify-center min-w-0 h-52 mx-5">
            {imgSrc ? (
              <Image
                src={imgSrc}
                className="select-none pointer-events-none object-contain w-full py-4"
                width={100}
                height={100}
                alt="sponsor logo"
              />
            ) : (
              <FontAwesomeIcon
                icon={faBuilding}
                className="select-none pointer-events-none object-contain w-full py-4 min-h-[165px]"
              />
            )}
          </div>
          <h3 className="text-xl font-bold mx-4 mb-4">{title}</h3>

          <div className="flex items-center mx-4 my-1">
            <FontAwesomeIcon className="w-4" icon={faClock} />
            <p className="ml-2">{JobType[jobType as keyof typeof JobType]}</p>
          </div>
          <div className="flex items-center mx-4 my-1">
            <FontAwesomeIcon className="w-4" icon={faLocationDot} />
            <p className="ml-2">{location}</p>
          </div>
          <div className="flex items-center mx-4 my-1 mb-4">
            <FontAwesomeIcon className="w-4" icon={faAddressCard} />
            <p className="ml-2">{JobMode[mode as keyof typeof JobMode]}</p>
          </div>

          <p
            className="text-base m-0 py-4 px-5 text-left text-jb-placeholder h-[600px]"
            dangerouslySetInnerHTML={{
              __html: description
            }}
          />
        </div>
        <div className="flex-justify-center mt-5">
          <button type="button" className={styles.learnMoreBtn}>
            Learn More
          </button>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedJobCard;
