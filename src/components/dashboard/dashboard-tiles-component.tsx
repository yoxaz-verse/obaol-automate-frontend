import React from 'react'
import DashboardTile from './dashboard-tile'
import { dashboardTilesData } from '@/data/content-data'

const DashboardTilesComponent = () => {
  return (
    <div className='flex flex-wrap gap-5 px-4'>
        {dashboardTilesData.map((tile, index) => (
            <div key={index} className='w-full lg:w-[23%]'>
                <DashboardTile heading={tile.title} data={tile.data} type='details'/>
            </div>
        ))}

    </div>
  )
}

export default DashboardTilesComponent