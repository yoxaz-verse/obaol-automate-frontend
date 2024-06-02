import { projectDetailProgressCards } from '@/data/content-data'
import React from 'react'
import ProjectDetailProgressCard from './project-detail-progress-card'
import UnderDevelopment from '@/components/hashed/under-development'

const ProjectDetailProgressComponent = ({ data }: { data: any }) => {
  let progress = data.progress??0
  let pendingProgress = 100 - progress

  return (
    <div className='flex flex-wrap justify-between flex-col lg:flex-row gap-5 lg:gap-0'>
      <div className='w-full lg:w-[23%]'>
        <ProjectDetailProgressCard heading={`${progress} %`} subheading={"Your Project Progress"} progress={data.progress} />
      </div>
      <div className='w-full lg:w-[23%]'>
        <ProjectDetailProgressCard heading={`${pendingProgress} %`} subheading={"Pending Progresss"} progress={pendingProgress} />
      </div>
      <div className='w-full lg:w-[23%]'>
        <ProjectDetailProgressCard heading={`22h `} subheading={"Spend Hours"} progress={pendingProgress} />
      </div>
      <div className='w-full lg:w-[23%]'>
        <ProjectDetailProgressCard heading={`$ 1000`} subheading={"Project Budget"} progress={60} />
      </div>
    </div>
  )
}

export default ProjectDetailProgressComponent