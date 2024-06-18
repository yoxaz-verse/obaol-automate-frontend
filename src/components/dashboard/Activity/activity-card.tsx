import { ActivityDetailCardProps } from '@/data/interface-data'
import { Avatar, AvatarGroup, Card, CardHeader, Select, SelectItem } from '@nextui-org/react'
import React from 'react'
import { FiEdit } from 'react-icons/fi'

const ActivityDetailCard = ({ data }: ActivityDetailCardProps) => {
  console.log(data);
  return (
    <Card className='flex flex-col p-9'>
      <div className='flex justify-between w-full items-center pb-4'>
        <div className='text-[#3EADEB] text-lg font-medium'>Project</div>
        <FiEdit />
      </div>
      <div>
        <div className='flex'>
          <Avatar src={data?.projectManager?.avatar} alt='avatar' size='lg' />
          <div className='flex flex-col px-2'>
            <div className='font-medium'>{data.projectManager.name}</div>
            <div className='text-[#A1A1AA] text-sm'>{data.projectManager.role}</div>
          </div>
        </div>

        <div className='text-[#A1A1AA] text-sm pt-4 pb-8'>{data.description}</div>
        <Card className='bg-[#F8F8F8] border-1 border-[#E9E9E9] flex justify-center items-center text-[#454545]'>
          <div className='flex justify-between w-[90%] mt-4 mb-8'>
            <div className='flex flex-col w-[50%]'>
              <div className='text-sm font-medium'>Actual Date</div>
              <div className='text-xs pt-2'>{data?.actualdate}</div>
            </div>
            <div className='flex flex-col w-[50%]'>
              <div className='text-sm font-medium'>Forecast Date</div>
              <div className='text-xs pt-2'>{data.forecastdate}</div>
            </div>
          </div>
          {/* Render status and sub status */}
          <div className='flex justify-between pt-5 pb-10 w-[90%]'>
            <div className='flex flex-col w-[50%]'>
              <div className='text-sm font-medium'>Target Date</div>
              <div className='text-xs pt-2'>{data.targetdate}</div>
            </div>
            <div className='w-[50%]'>
              {data.statusOptions.map((d: any) => {
                return <h1 className={`${d.color}`} key={d.key} > {d.key}</h1>
              })}
            </div>
            {/*<Select placeholder='Status'>
              {data.statusOptions.map((option: any) => {
                return <SelectItem key={option.key} className={option.color}>
                  {option.text}</SelectItem>
              })}
            </Select> */}
          </div>
        </Card>
      </div >
    </Card >
  )
}

export default ActivityDetailCard 
