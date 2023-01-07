'use client';
import BigBlob from 'assets/misc/BigBlob.svg';
import JobsboardLogo from 'assets/logos/JobsboardLogo.png';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SponsorCarousel from 'components/SponsorCarousel/SponsorCarousel';
import Header from 'components/Header/Header';

import container from 'styles/container.module.css';
import { useEffect, useState } from 'react';
import RecruitmentModal from 'components/RecruitmentModal/RecruitmentModal';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import api from 'config/api';
import FeaturedJobCard from 'components/FeaturedJobCard/FeaturedJobCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Link from 'next/link';
import Button from 'ui/Button';

const HomePage = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);

  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    const getFeaturedJobs = async () => {
      try {
        const res = await api.get('/featured-jobs');
        setFeaturedJobs(res.data.featuredJobs);
      } catch (e) {
        console.error('Error at getFeaturedJobs', e);
      }
    };

    getFeaturedJobs();
  }, []);

  return (
    <div className="text-center">
      <RecruitmentModal open={openModal} onClose={() => setOpenModal(false)} />
      <Header
        style={{
          background: 'transparent',
          position: 'absolute',
          top: 0,
          zIndex: 100,
          width: '100%'
        }}
      />
      <div className="relative h-[80vh] overflow-hidden flex flex-col justify-center items-center xs:h-[100vh]">
        <Image
          src={BigBlob}
          className="absolute top-1/2 left-1/2 h-full -z-10 -translate-x-1/2 -translate-y-1/2"
          alt="big blob"
          style={{
            height: '100%',
            width: 'unset'
          }}
        />
        <div className="flex justify-around align-middle mx-auto gap-7">
          <div className="flex flex-col justify-center text-left sm:justify-center sm:text-center font-bold">
            <p className="text-lg text-white">CSESoc presents</p>
            <h1 className="text-[#143A6C] font-bold text-6xl leading-[72px] m-0">Jobs Board</h1>
            <p className="text-lg text-white mt-3">
              Connecting UNSW students with top employers since 2018.
            </p>
            <div className="justify-start flex gap-5 mt-4 sm:justify-center sm:flex-wrap">
              <Link href="/student/login">
                <button
                  className="bg-[#264c79] rounded-xl shadow-md text-white text-lg py-[3px] px-8
                        hover:duration-500 hover:translate-y-[-2px] hover:shadow-lg"
                >
                  Explore
                </button>
              </Link>
              <Link href="/company/login">
                <button
                  className="bg-[#264c79] rounded-xl shadow-md text-white text-lg py-[3px] px-8
                        hover:duration-500 hover:translate-y-[-2px] hover:shadow-lg"
                >
                  Advertise
                </button>
              </Link>
            </div>
          </div>
          <Image alt="Jobsboard" width="200" src={JobsboardLogo} className="sm:hidden" />
        </div>
      </div>
      <div className={container.pageContainer}>
        {/* <!-- Sponsors --> */}
        <div className="my-12 mx-auto">
          <h3 className="font-bold text-3xl mb-0 text-jb-headings">Our Sponsors</h3>
          <p className="text-lg text-jb-subheadings my-4 mx-16 sm:mx-0">
            We aim to give you a pleasant student working experience by partnering up with only the
            best.
          </p>
          <SponsorCarousel />
          <h3 className="font-bold text-3xl mb-0 text-jb-headings">
            Discover Featured Student Jobs and Internships
          </h3>
          <p className="text-lg text-jb-subheadings my-4 mx-16 sm:mx-0">
            Spent hours trying to find something that suited you? Look no further, we&apos;ve got
            you covered with some amazing opportunities.
          </p>
          <p className="text-lg text-jb-subheadings my-4 mx-16 sm:mx-0">
            Check out the full list of open jobs&nbsp;
            <Link
              className="text-jb-textlink font-bold transition-colors duration-200 ease-linear
                    cursor-pointer hover:text-jb-textlink-hovered"
              href="/student/login"
            >
              here
            </Link>
            .
          </p>
          {!!featuredJobs.length ? (
            <Swiper
              slidesPerView={1}
              navigation={true}
              pagination={{
                clickable: true
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2
                },
                768: {
                  slidesPerView: 3
                },
                1024: {
                  slidesPerView: 4
                }
              }}
              loop
              autoplay
              modules={[Pagination, Navigation]}
            >
              {featuredJobs.map((job) => (
                <SwiperSlide key={job.title}>
                  <FeaturedJobCard
                    title={job.title}
                    description={job.description}
                    tag={job.workingRights}
                    imgSrc={job.logo}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="mb-28" />
          )}
          <h3 className="font-bold text-3xl mb-0 text-jb-headings">Want to Post a Job?</h3>
          <p className="text-lg text-jb-subheadings my-4 mx-16 sm:mx-0">
            Are you a company looking to advertise with us? We&apos;d absolutely love to hear from
            you. In the meantime, you can also check out&nbsp;
            <a
              className="text-jb-textlink font-bold transition-colors duration-200 ease-linear cursor-pointer hover:text-jb-textlink-hovered"
              href="https://www.csesoc.unsw.edu.au/sponsors"
              target="_blank"
              rel="noreferrer"
            >
              other companies
            </a>
            &nbsp;that have partnered with us.
          </p>
          <div className="flex flex-row justify-evenly mt-8 mb-28 mx-24 sm:m-0 sm:flex-col sm:gap-4">
            <div>
              <Link href="/company/signup">
                <Button>Join Us</Button>
              </Link>
            </div>
            <div>
              <Link href="/company/login">
                <Button>Post a Job</Button>
              </Link>
            </div>
          </div>

          <h3 className="font-bold text-3xl mb-0 text-jb-headings">Looking for More?</h3>
          <p className="text-lg text-jb-subheadings my-4 mx-16 sm:mx-0">
            If you&apos;re a CSE student with a keen interest in Jobs Board and looking to get
            involved, keep an eye out for our recruitment announcements on CSESoc&apos;s socials.
            Otherwise, you can also contribute by suggesting cool new features or even make a pull
            request on the Jobs Board repo.
          </p>
          <div className="mt-8 flex justify-center gap-5 mb-28 mx-24 sm:m-0">
            <Button onClick={() => setOpenModal(true)}>Join the Team</Button>
            <a href="https://github.com/csesoc/jobs-board" target="_blank" rel="noreferrer">
              <Button>Source Code</Button>
            </a>
          </div>
          <div className="mt-20 flex justify-center">
            <FontAwesomeIcon
              icon={faChevronCircleUp}
              className="fill-[0c3149] cursor-pointer text-[#0c3149]"
              size="3x"
              onClick={() => {
                window.scrollTo({
                  left: 0,
                  top: 0,
                  behavior: 'smooth'
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
