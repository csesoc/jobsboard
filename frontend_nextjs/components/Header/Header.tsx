'use client';
import React, { useContext } from 'react';
import logo from 'assets/logos/csesocwhite.png';
import moon from 'assets/misc/moon.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AppContext from 'app/AppContext';
import styles from './styles.module.css';
import Link from 'next/link';

type HeaderProps = {
  style?: React.CSSProperties;
};

const Header = ({ style }: HeaderProps) => {
  const router = useRouter();
  const { apiToken, resetApiToken } = useContext(AppContext);

  const handleLogout = () => {
    resetApiToken();
    router.push('/student/login');
  };

  return (
    <div
      style={style}
      className="flex justify-evenly items-center py-4
           bg-gradient-to-br from-[#3a76f8] via-[#2c8bf4] to-[#619fcc]"
    >
      <Link href="/">
        <Image className="cursor-pointer" src={logo} width={150} alt="CSESoc" />
      </Link>
      <div className="flex justify-evenly items-center gap-5">
        <div className="group cursor-pointer relative">
          <Image className="rotate-220" src={moon} alt="Toggle Theme" width={25} />
          {/* Tooltip */}
          <span
            className={`invisible group-hover:visible bg-white text-black font-bold shadow-card w-32 text-center rounded py-2 absolute z-10 ${styles.tooltipText}`}
          >
            Coming soon
          </span>
        </div>
        {!apiToken ? (
          <Link href="/student/login">
            <button
              className="bg-transparent border-2 border-solid border-[#f9f7f1] rounded-2xl text-[#f9f7f1]
                 py-[2px] px-[15px] font-bold cursor-pointer duration-500 hover:bg-white hover:text-[#3a76f8]
                 hover:translate-y-[-2px] hover:shadow-lg"
            >
              Log In
            </button>
          </Link>
        ) : (
          <button
            className="bg-transparent border-2 border-solid border-[#f9f7f1] rounded-2xl text-[#f9f7f1]
                 py-[5px] px-[15px] font-bold cursor-pointer duration-500 hover:bg-white hover:text-[#3a76f8]
                 hover:translate-y-[-2px] hover:shadow-lg"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
