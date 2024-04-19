import { projectDetailProgressCards } from '@/data/content-data'
import React from 'react'
import ProjectDetailProgressCard from './project-detail-progress-card'

const ProjectDetailProgressComponent = () => {
  return (
    <div className='flex flex-wrap justify-between flex-col lg:flex-row gap-5 lg:gap-0'>
      {projectDetailProgressCards.map((item, index) => (
  <div key={index} className='w-full lg:w-[23%]'>
    <ProjectDetailProgressCard heading={item.heading} subheading={item.subheading} progress={item.progress}/>
  </div>
))}
    </div>
  )
}

export default ProjectDetailProgressComponent