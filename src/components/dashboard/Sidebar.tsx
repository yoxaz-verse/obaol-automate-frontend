import React, { useState, useEffect } from 'react';
import { FiInbox, FiSettings, FiUsers } from 'react-icons/fi';
import { MdDashboard } from "react-icons/md";
import { RiBuildingLine } from "react-icons/ri";
import { useRouter } from 'next/navigation'


const Sidebar = () => {
  const [selectedOption, setSelectedOption] = useState<any>('dashboard');

  const sidebarOptions = [
    { name: 'Dashboard', icon: <MdDashboard />, color: selectedOption === 'dashboard' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/dashboard" },
    { name: 'Projects', icon: <FiUsers />, color: selectedOption === 'projects' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/projects" },
    { name: 'Activity', icon: <FiInbox />, color: selectedOption === 'activity' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/activity" },
    { name: 'Users', icon: <FiSettings />, color: selectedOption === 'analytics' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/users" },
    { name: 'Services', icon: <RiBuildingLine />, color: selectedOption === 'services' ? 'text-blue-600' : 'text-[#8E8E93]', link: "/users" },
  ].filter(option => option !== null);
  const routes = useRouter();

  useEffect(() => {

    if (window.location.href.split("/").length === 3) {
      setSelectedOption(window.location.href.split("/")[3]);
    } else {
      setSelectedOption(window.location.href.split("/")[4]);
    }
  });
  const handleOptionClick = (option: string) => {
    const name: any = sidebarOptions.filter((op) => {
      return op.link === option
    });
    console.log(option);
    setSelectedOption(name[0].name);
    if (option === '/dashboard') {
      routes.push('/dashboard');
    } else {
      routes.push(`/dashboard/${option}`);
    }
  }
  console.log(selectedOption?.toLowerCase());
  return (
    <>
      <div className='flex fixed flex-col justify-between w-1/6 h-full'>
        <div className='bg-white p-2 sm:p-4 rounded-lg shadow-lg justify-evenly h-full hidden md:block'>
          <div className='flex py-[50px] justify-center items-center'>LOGO</div>
          {sidebarOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionClick(option?.link ? option.link : 'dashboard')}
              className={`p-4 cursor-pointer ${selectedOption?.toLowerCase() === option?.name.toLowerCase() ? 'bg-blue-200' : 'text-[#8E8E93]'} rounded font-medium`}
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
