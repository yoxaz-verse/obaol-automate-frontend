import { ProjectDetailProps } from '@/data/interface-data'
import React, { useState } from 'react'
import ProjectDetailProgressComponent from './project-detail-progress-component';
import ProjectDetailComponent from './project-detail-component';
import CommonTable from '../Table/common-table';
import { columns, tableData } from '@/data/content-data';
import ManagerActivityDetailsComponent from './manager-activity-details'
import WorkerAnalyticsComponent from './worker-analytics';
import AddNewActivityModal from './add-new-activity-modal';
import { useQuery } from '@tanstack/react-query';
import { getData } from '@/core/api/apiHandler';
import { activityRoutes, projectRoutes } from '@/core/api/apiRoutes';
import { Button } from '@nextui-org/react';
import UnderDevelopment from '@/components/hashed/under-development';
import LocationViewModal from '@/components/Modals/location-view';
import CommonDeleteModal from '@/components/Modals/Common-delete-modal';
import ActivityDetailComponent from '../Activity/acitivty-detail-component';
import ActivityDetailProgressComponent from '../Activity/activity-detail-progress-component';

const ProjectDetails = ({ id, role, setProjectDetail }: ProjectDetailProps) => {
  const projectDetailsData = useQuery({
    queryKey: ['projectDetailsData', id],
    queryFn: async () => {
      return await getData(projectRoutes.getAll + id, {})
    },
  });

  const [isAcivityDetails, setIsAcivityDetails] = useState(true)

  const activityData = useQuery({
    queryKey: ['activityData', id],
    queryFn: async () => {
      return await getData(activityRoutes.getByProject + id, {})
    },
  });

  const activityColoumns = [
    { name: "Title", uid: "title" },
    { name: "Description", uid: "description" },
    { name: "Target Date", uid: "targetDate" },
    { name: "Actions", uid: "actions2" },
  ];

  return (
    <>
      {/* back button */}
      {
        isAcivityDetails ? <>
          <div className='flex justify-between items-center py-5'>
            <div className='text-lg font-bold'>Project Details</div>
            <Button className='cursor-pointer' color='secondary' onPress={() => setProjectDetail(false)}>Back</Button>
          </div>
          <div className='w-full flex flex-col gap-5'>
            {
              projectDetailsData.data?.data?.data &&
              <ProjectDetailProgressComponent data={
                projectDetailsData.data?.data?.data
              } />
            }
            {
              projectDetailsData.data?.data?.data &&
              <ProjectDetailComponent data={
                projectDetailsData.data?.data?.data
              } />}
            <div className='w-full justify-between flex pt-10 pb-2 items-center'>
              <div className='font-bold text-xl '>Activities List</div>
              <AddNewActivityModal id={id} />
            </div>
            <div className='mb-4'>
              <CommonTable
                TableData={
                  activityData.data?.data?.data || []
                }
                isLoading={activityData.isLoading}
                columns={
                  activityColoumns
                }
                viewModal={(data: any) => {
                  return <LocationViewModal data={data} />
                }}
                redirect={(data: any) => {
                  setIsAcivityDetails(false)
                }}
                deleteData={
                  {
                    endpoint: projectRoutes.delete,
                    key: ["projectData"],
                    type: "project"
                  }
                }
                deleteModal={(data: any) => {
                  return <CommonDeleteModal data={data} />
                }}
              />
            </div>
            <UnderDevelopment>
              <ManagerActivityDetailsComponent />
              <WorkerAnalyticsComponent />
            </UnderDevelopment>
          </div>
        </> : <div className="w-[95%]">
          {/* back  */}
          <div className='flex justify-between items-center py-5'>
            <div className='font-bold text-xl '>Activity Details</div>
            <Button className='cursor-pointer' color='secondary' onPress={() => setIsAcivityDetails(true)}>Back</Button>
          </div>
          <div className='flex flex-col gap-5'>

            <ActivityDetailProgressComponent />
            <ActivityDetailComponent />
          </ div>
          <div className='my-4'>
            <div className="py-2 text-lg font-medium">Activities List</div>
            <CommonTable
              TableData={activityData.data?.data?.data || []}
              columns={activityColoumns}
              viewProjectDetails={(data: any) => {
                setIsAcivityDetails(true)
              }}
              verifyActivity={(data: any) => {
                console.log(data)
              }}
              deleteData={
                {
                  endpoint: activityRoutes.delete,
                  key: ["activityData"],
                  type: "Activity"
                }
              }
              deleteModal={(data: any) => {
                return <CommonDeleteModal data={data} />
              }}
            />
          </div>
        </div>
      }


    </>
  )
}

export default ProjectDetails
