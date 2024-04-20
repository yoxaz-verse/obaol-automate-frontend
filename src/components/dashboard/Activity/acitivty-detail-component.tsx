import React from 'react'
import { Card, CardBody, CardHeader } from '@nextui-org/react'
import { activityDetailCard, projectDetailCard } from '@/data/content-data'
import ActivityDetailCard from './activity-card'

const ActivityDetailComponent = () => {
  return (
    <div>
        <div className='font-bold text-xl pt-10 pb-2 my-3'>Activity Details</div>
        <div className='flex flex-col lg:flex-row lg:justify-between'>
            <div className='lg:w-[49%]'><ActivityDetailCard data={activityDetailCard}/></div>
            <div className='lg:w-[49%] mt-4 lg:mt-0'>
            <div className='w-full h-[400px] lg:h-full'>
        <iframe src="https://www.google.com/maps/embed/v1/place?q=Door+No:730+E+Abg+Tower+Mundakayam+P.O,+near+South+Indian+Bank,+Kerala+686513&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8" className='w-full h-full'></iframe>
    </div>
            </div>
        </div>
    </div>
  )
}

export default ActivityDetailComponent