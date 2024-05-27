import React from 'react'
import DashboardTile from './dashboard-tile'
import { dashboardTilesData } from '@/data/content-data'

const DashboardTilesComponent = () => {
  return (
    <div className='grid 
    grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
    gap-5 px-4'>
      {dashboardTilesData.map((tile, index) => (
        <div key={index} className='w-full'>
          <DashboardTile heading={tile.title} data={tile.data} type='details' />
        </div>
      ))}

    </div>
  )
}

export default DashboardTilesComponent