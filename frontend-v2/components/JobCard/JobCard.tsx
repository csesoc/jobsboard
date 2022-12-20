import React, { useState } from 'react'
import { JobType, WorkingRights, JobMode } from 'constants/jobFields';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './styles.module.css'

type Props = {
  jobID: number,
  jobTitle: number,
  imagePath: any,
  jobType: string,
  jobTag: string[],
  jobLocation: string,
  jobRole: string,
  jobMode: string
}

const JobCard = ({ jobID, jobTitle, imagePath, jobType, jobTag, jobLocation, jobRole, jobMode}: Props) => {
  const router = useRouter()
  return (
    <div
    className='flex flex-col rounded-lg m-4 shadow-card hover-anim w-60'
    onClick={() => router.push(`/jobs/${jobID}`)}
  >
    <div className='flex mx-5'>
      <Image
        src={imagePath}
        className='h-[100px] max-w-[180px] m-auto my-4 object-contain'
        alt='sponsor logo'
      />
    </div>
    <h3 className='text-xl text-left font-bold mx-4 mb-4'>
      {jobRole}
    </h3>
    <h3 className='text-l text-left font-bold mx-4'>
      {jobTitle}
    </h3>

    <div className='flex flex-wrap flex-row m-0 items-center mx-4 my-2 xs:flex-col xs:items-start'>
      {jobTag.map((tag, idx) => 
        <div
        key={tag}
        className='flex justify-center items-center rounded-md my-1 px-2 h-6 bg-jb-tags text-base'
      >
        {WorkingRights[tag as keyof typeof WorkingRights] }
      </div>
      )}
    </div>

    <div className='flex items-center mx-4 my-1'>
      <FontAwesomeIcon
        className='w-4'
        icon='clock'
      />
      <p className='ml-2'>
        {JobType[jobType as keyof typeof JobType] }
      </p>
    </div>
    <div className='flex items-center mx-4 my-1'>
      <FontAwesomeIcon
        className='w-4'
        icon='location-dot'
      />
      <p className='ml-2'>
        {jobLocation}
      </p>
    </div>
    <div className='flex items-center mx-4 my-1 mb-4'>
      <FontAwesomeIcon
        className='w-4'
        icon='address-card'
      />
      <p className='ml-2'>
        {JobMode[jobMode as keyof typeof JobMode] }
      </p>
    </div>

    <div className='flex justify-center mt-auto'>
      <button className={styles.learnMoreBtn}>Learn More</button>
    </div>
  </div>
  )
}

export default JobCard