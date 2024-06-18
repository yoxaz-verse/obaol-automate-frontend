import { activityDetailProgressCards } from '@/data/content-data'
import React from 'react'
import ProjectDetailProgressCard from '../Projects/project-detail-progress-card'

const ActivityDetailProgressComponent = () => {
  return (
    <div className='flex flex-wrap justify-between flex-col lg:flex-row gap-5 lg:gap-0'>
      {activityDetailProgressCards.map((item, index) => (
        <div key={index} className='w-full lg:w-[23%]'>
          <ProjectDetailProgressCard heading={item.heading} subheading={item.subheading} progress={item.progress} />
        </div>
      ))}
    </div>
  )
}

export default ActivityDetailProgressComponent
