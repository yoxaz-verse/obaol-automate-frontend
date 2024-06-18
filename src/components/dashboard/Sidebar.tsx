import React, { useState, useEffect } from 'react';
import { FiInbox, FiSettings, FiUsers } from 'react-icons/fi';
import { MdDashboard } from "react-icons/md";
import { RiBuildingLine } from "react-icons/ri";
import { useRouter } from 'next/navigation'


const Sidebar = () => {
  const [selectedOption, setSelectedOption] = useState<any>('Dashboard');

  const sidebarOptions = [
    { name: 'Dashboard', icon: <MdDashboard />, color: selectedOption === 'Dashboard' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/dashboard" },
    { name: 'Projects', icon: <FiUsers />, color: selectedOption === 'Projects' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/projects" },
    { name: 'Activity', icon: <FiInbox />, color: selectedOption === 'Activity' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/activity" },
    { name: 'Users', icon: <FiSettings />, color: selectedOption === 'Analytics' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/users" },
    { name: 'Services', icon: <RiBuildingLine />, color: selectedOption === 'Services' ? 'text-blue-600' : 'text-[#8E8E93]' },
  ].filter(option => option !== null);
  const routes = useRouter();

  useEffect(() => {
    console.log(window.location.href);
  });
  const handleOptionClick = (option: string) => {
    const name: any = sidebarOptions.filter((op) => {
      return op.link === option
    });
    setSelectedOption(name[0].name);
    if (option === '/dashboard') {
      routes.push('/dashboard');
    }
    routes.push(`/dashboard/${option}`);
  }
  return (
    <>
      <div className='flex fixed flex-col justify-between w-1/6 h-full'>

        <div className='bg-white p-2 sm:p-4 rounded-lg shadow-lg justify-evenly h-full hidden md:block'>
          <div className='flex py-[50px] justify-center items-center'>LOGO</div>
          {sidebarOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(option?.link ? option.link : 'Dashboard')}
              className={`p-4 cursor-pointer ${selectedOption === option?.name ? 'bg-blue-200' : 'text-[#8E8E93]'} rounded font-medium`}
            >
              <div className='flex items-center gap-5 text-xs xl:text-base'>
                <span className={`${option?.color}`}>{option?.icon}</span>
                <span className={`${selectedOption === option?.name ? 'text-blue-600' : 'text-black'}`}>{option?.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
