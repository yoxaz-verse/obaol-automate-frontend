import { TopbarProps } from '@/data/interface-data'
import { Avatar, Input } from '@nextui-org/react'
import React from 'react'
import { GrNotification, GrSearch } from 'react-icons/gr'

const TopBar = ({username}:TopbarProps) => {
  return (
    <div className='flex justify-between p-5'>
      <div>
        <div className='text-2xl'>Hi {username}</div>
        <div className='text-md'>Good Morning</div>
      </div>
      <div className='flex items-center justify-center w-2/4'>
        <Input
          type="text"
          label="Search"
          className='w-3/4 h-10 pr-1'
          color='primary'
          endContent={
            <GrSearch className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
          }
        />
        <div className='h-6 flex items-center justify-center px-1'><GrNotification className='text-xl'/></div>
        <div className='h-6 flex items-center justify-center px-1'><Avatar size="sm" src="https://avatars.githubusercontent.com/u/47231168?v=4" /></div>
      </div>
    </div>
  )
}

export default TopBar