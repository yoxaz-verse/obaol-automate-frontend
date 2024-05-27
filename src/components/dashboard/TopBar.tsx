import { TopbarProps } from '@/data/interface-data'
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, User } from '@nextui-org/react'
import React, { useState } from 'react'
import { CiMenuBurger } from 'react-icons/ci'
import { FiFileText, FiInbox, FiMessageCircle, FiSettings, FiUsers } from 'react-icons/fi'
import { GrNotification, GrSearch, GrUserManager } from 'react-icons/gr'
import { MdDashboard } from 'react-icons/md'
import { RiAdminFill, RiBuildingLine } from 'react-icons/ri'
import UnderDevelopment from '../hashed/under-development'

const TopBar = ({ username, role }: TopbarProps) => {
  const [selectedOption, setSelectedOption] = useState('Dashboard');
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const sidebarOptions = [
    { name: 'Dashboard', icon: <MdDashboard />, color: selectedOption === 'Dashboard' ? 'text-blue-600' : '' },
    { name: 'Projects', icon: <FiUsers />, color: selectedOption === 'Projects' ? 'text-blue-600' : '' },
    { name: 'Activity', icon: <FiInbox />, color: selectedOption === 'Activity' ? 'text-blue-600' : '' },
    { name: 'Analytics', icon: <FiSettings />, color: selectedOption === 'Analytics' ? 'text-blue-600' : '' },
    { name: 'Workers', icon: <FiMessageCircle />, color: selectedOption === 'Workers' ? 'text-blue-600' : '' },
    { name: 'Customers', icon: <FiFileText />, color: selectedOption === 'Customers' ? 'text-blue-600' : '' },
    { name: 'Manager', icon: <GrUserManager />, color: selectedOption === 'Manager' ? 'text-blue-600' : '' },
    { name: 'Services', icon: < RiBuildingLine />, color: selectedOption === 'Services' ? 'text-blue-600' : '' },
    { name: 'Admins', icon: <RiAdminFill />, color: selectedOption === 'Admins' ? 'text-blue-600' : '' },
  ].filter(option => option !== null);
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    console.log(option);
  }
  return (
    <div className='flex justify-between p-5'>
      <Dropdown className='items-center justify-center h-full flex md:hidden'>
        <DropdownTrigger>
          <div
            className='w-4 h-4 p-3 border-slate-300 md:hidden'
          >
            <CiMenuBurger />
          </div>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions" disallowEmptySelection
          selectionMode="single"
          selectedKeys={selectedOption}>
          {sidebarOptions.map((option, index) => (
            <DropdownItem key={option?.name} className={`${selectedOption === option?.name && 'bg-[#e7f1fe] font-bold'}`}>
              <div key="new" className={`${option?.name === 'Logout' && option?.color} flex flex-row w-full items-center`} onClick={() => handleOptionClick(option?.name ? option.name : 'Dashboard')}><div className={`mr-2 ${option?.color}`}>{option?.icon}</div><div>{option?.name}</div></div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <div className='p-5'>
        <div className='text-sm md:text-4xl font-medium'>Hi, {username}</div>
        <div className='text-xs md:text-md'>
          {
            new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'
          }

        </div>
      </div>
      <div className='flex items-center justify-center gap-5 '>

        <Input
          type="text"
          label="Search"
          className='w-[500px] h-10 pr-1'
          color='primary'
          endContent={
            <UnderDevelopment>
              <GrSearch className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
            </UnderDevelopment>
          }
        />
        <UnderDevelopment>

          <div className='h-6 flex items-center justify-center px-1'><GrNotification className='text-xl' /></div>
        </UnderDevelopment>
        <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
              }}
              className="transition-transform"
              description={username}
              name={role}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-bold">Signed in as</p>
              <p className="font-bold">{username}</p>
            </DropdownItem>
            <DropdownItem key="logout" color="danger">
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  )
}

export default TopBar