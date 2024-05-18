import { ProjectDetailCardProps } from '@/data/interface-data'
import { Avatar, AvatarGroup, Card, CardHeader, Select, SelectItem } from '@nextui-org/react'
import React from 'react'
import { FiEdit } from 'react-icons/fi'

const ProjectDetailCard = ({data}:ProjectDetailCardProps) => {
  return (
    <Card className='flex flex-col p-5'>
    <div className='flex justify-between w-full items-center pb-4'>
      <div className='text-[#3EADEB] text-lg font-medium'>{data.projectName}</div>
      <div><FiEdit/></div>
    </div>
    <div>
      {/* Render project manager */}
      <div className='flex'>
        <Avatar src={data.projectManager.avatar} alt='avatar' size='lg'/>
        <div className='flex flex-col px-2'>
          <div className='font-medium'>{data.projectManager.name}</div>
          <div className='text-[#A1A1AA] text-sm'>{data.projectManager.role}</div>
        </div>
      </div>
      <div className='text-[#A1A1AA] text-sm pt-4 pb-8'>{data.description}</div>
      <div className='flex justify-between w-full'>
        <Card className='w-[230px] pb-1'>
            <CardHeader className='flex w-full'>
                <div className='font-medium'>Manager</div>
                <div className='pl-2'><FiEdit/></div>
            </CardHeader>
            <div className='flex flex-row pl-2'>
            <Avatar src={data.projectManager.avatar} alt='avatar' size='sm'/>
        <div className='flex flex-col pl-5'>
        <div className='font-medium'>{data.projectManager.name}</div>
        <div className='text-[#A1A1AA] text-sm'>{data.projectManager.role}</div>
        </div>
        </div>
        </Card>
        <Card className='w-[230px]'>
            <CardHeader  className='font-medium'>Workers/Services</CardHeader>
        <AvatarGroup className='w-full items-start justify-start pl-3'>
      <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
      <Avatar src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
      <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
    </AvatarGroup>
        </Card>
        </div>
      {/* Render status and sub status */}
      <div className='flex justify-between w-full pt-5 pb-5'>
        <Card className='w-[230px]'>
          <Select className='w-full' placeholder='Status'>
            {data.statusOptions.map(option => (
              <SelectItem key={option.key} className={option.color}>{option.text}</SelectItem>
            ))}
          </Select>
        </Card>
        {/* Sub status card */}
        <Card className='w-[230px]'>
          <Select className='w-full' placeholder='Sub Status'>
            {data.statusOptions.map(option => (
              <SelectItem key={option.key} className={option.color}>{option.text}</SelectItem>
            ))}
          </Select>
        </Card>
      </div>
    </div>
  </Card>
  )
}

export default ProjectDetailCard 