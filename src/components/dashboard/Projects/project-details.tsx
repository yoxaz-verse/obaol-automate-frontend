import { ProjectDetailProps } from '@/data/interface-data'
import React, { useState } from 'react'
import ProjectDetailProgressComponent from './project-detail-progress-component';
import ProjectDetailComponent from './project-detail-component';
import CommonTable from '../Table/common-table';
import { columns, tableData } from '@/data/content-data';
import ManagerActivityDetailsComponent from './manager-activity-details'
import WorkerAnalyticsComponent from './worker-analytics';
import AddNewActivityModal from './add-new-activity-modal';

const ProjectDetails = ({ data }: ProjectDetailProps) => {
  return (
    <>
      <div className='w-full flex flex-col'>
        <ProjectDetailProgressComponent />
        <ProjectDetailComponent />
        <div className='w-full justify-between flex pt-10 pb-2 items-center'>
          <div className='font-bold text-xl '>Activities List</div>
          <AddNewActivityModal />
        </div>
        <div className='mb-4'>
          <CommonTable
            TableData={tableData}
            columns={columns}
          />
        </div>
        <ManagerActivityDetailsComponent />
        <WorkerAnalyticsComponent />
      </div>
    </>
  )
}

export default ProjectDetails
