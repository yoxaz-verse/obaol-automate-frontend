import React from 'react'
import ActivityDetailProgressComponent from './activity-detail-progress-component'
import CommonTable from '../Table/common-table'
import { activityColumns, activityTableData, columns, tableData } from '@/data/content-data'

const Activity = ({role}:{role:string}) => {
    function viewActivityDetails(data: any) {
        console.log(data)
    }
  return (
    <div>
         <div className="flex items-center justify-center">
      <div className="w-[95%]">
       <ActivityDetailProgressComponent/>
       <div className="py-2 text-lg font-medium">Activities List</div>
       <CommonTable
          TableData={activityTableData}
          columns={activityColumns}
          viewProjectDetails={viewActivityDetails}
        />
      </div>
    </div>
    </div>
  )
}

export default Activity