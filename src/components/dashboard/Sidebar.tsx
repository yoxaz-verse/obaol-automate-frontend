import React, { useState } from 'react';
import { FiUser, FiInbox, FiSettings, FiMessageCircle, FiFileText, FiUsers, FiLogOut } from 'react-icons/fi';
import { RiAdminFill } from "react-icons/ri";
import Cookies from 'js-cookie';
import { MdDashboard } from "react-icons/md";
import { GrUserManager } from "react-icons/gr";
import { RiBuildingLine } from "react-icons/ri";
const Sidebar = () => {
  const [selectedOption, setSelectedOption] = useState('Profile');
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const sidebarOptions = [
    { name: 'Dashboard', icon: <MdDashboard />, color: selectedOption === 'Dashboard' ? 'text-blue-600' : '' },
    { name: 'Projects', icon: <FiUsers />, color: selectedOption === 'Projects' ? 'text-blue-600' : '' },
    { name: 'Activity', icon: <FiInbox />, color: selectedOption === 'Activity' ? 'text-blue-600' : '' },
    { name: 'Analytics', icon: <FiSettings />, color: selectedOption === 'Analytics' ? 'text-blue-600' : '' },
    { name: 'Workers', icon: <FiMessageCircle />, color: selectedOption === 'Workers' ? 'text-blue-600' : '' } ,
    { name: 'Customers', icon: <FiFileText />, color: selectedOption === 'Customers' ? 'text-blue-600' : '' } ,
    { name: 'Manager', icon: <GrUserManager />, color: selectedOption === 'Manager' ? 'text-blue-600' : '' } ,
    { name: 'Services', icon: < RiBuildingLine/>, color: selectedOption === 'Services' ? 'text-blue-600' : '' } ,
    { name: 'Admins', icon: <RiAdminFill />, color: selectedOption === 'Admins' ? 'text-blue-600' : '' } ,
].filter(option => option !== null);
const handleOptionClick = (option: string) => {
  setSelectedOption(option);
  console.log(option);
}
  return (
    <>
    <div className='flex flex-col justify-between w-full h-screen'>
      <div className='bg-white p-2 sm:p-4 rounded-lg shadow-lg justify-evenly h-screen'>
      <div className='flex py-3 justify-center items-center'>LOGO</div>
        {sidebarOptions.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option?.name?option.name:'Dashboard')}
            className={`p-2 cursor-pointer ${selectedOption === option?.name ? 'bg-blue-200' : ''} rounded font-bold`}
          >
            <div className='flex items-center space-x-2 text-xs xl:text-base'>
              <span className={`${option?.color}`}>{option?.icon}</span>
              <span className={`${selectedOption === option?.name ? 'text-blue-600' : ''}`}>{option?.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
   </>
  );
};

export default Sidebar;
