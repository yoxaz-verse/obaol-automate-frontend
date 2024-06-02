import React, { useState } from 'react'
import ActivityDetailProgressComponent from './activity-detail-progress-component'
import CommonTable from '../Table/common-table'
import { activityColumns, activityDetailCard, activityTableData, columns, tableData } from '@/data/content-data'
import AddNewActivityModal from '../Projects/add-new-activity-modal'
import ActivityDetailComponent from './acitivty-detail-component'
import VerifyActivityModal from './verify-activity-modal'

const Activity = ({ role }: { role: string }) => {
  function viewActivityDetails(data: any) {
    console.log(data)
    setNewActivity(true)
  }
  const [viewactivity, setNewActivity] = useState(false);
  const [verifyactivity, setVerifyActivity] = useState(false);
  const [activitydata, setActivityData] = useState();
  function verifyActivity(data: any) {
    console.log(data)
    setVerifyActivity(true)
  }
  return (
    <div>
      <div className="flex items-center justify-center">
        {!viewactivity ? <div className="w-[95%]">
          <ActivityDetailProgressComponent />
          <div className='flex justify-between w-full pt-5 pb-2'>
            <div className="py-2 text-lg font-medium">Activities List</div>
            {/* <AddNewActivityModal/> */}
          </div>
          <CommonTable
            TableData={activityTableData}
            columns={activityColumns}
            viewProjectDetails={viewActivityDetails}
            verifyActivity={verifyActivity}
          />
        </div> :
          <div className="w-[95%]">
            <div className='flex flex-col gap-5'>

              <ActivityDetailProgressComponent />
              <ActivityDetailComponent />
            </div>
            <div className='my-4'>
              <div className="py-2 text-lg font-medium">Activities List</div>
              <CommonTable
                TableData={activityTableData}
                columns={activityColumns}
                viewProjectDetails={viewActivityDetails}
                verifyActivity={verifyActivity}
              />
            </div>
          </div>
        }
      </div>
      <VerifyActivityModal open={verifyactivity} close={() => setVerifyActivity(false)} activity={activityDetailCard} />
    </div>
  )
}

export default Activity