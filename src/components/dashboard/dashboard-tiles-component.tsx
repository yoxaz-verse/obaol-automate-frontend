import React from 'react'
import DashboardTile from './dashboard-tile'
import { useQuery } from '@tanstack/react-query';
import { getData } from '@/core/api/apiHandler';
import { projectRoutes } from '@/core/api/apiRoutes';

const DashboardTilesComponent = () => {
  const dashboardTilesData = [
    {
      title: 'Total Projects',
      data: '112'
    },
    {
      title: 'Pending Projects',
      data: '10'
    }, {
      title: 'Worked progress',
      data: '45',
    }, {
      title: 'Project Finished',
      data: '44'
    }]
  const projectCountData = useQuery({
    queryKey: ['projectCountData'],
    queryFn: async () => {
      return await getData(projectRoutes.count, {})
    },
  });
  return (
    <div className='grid 
    grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
    gap-5 px-4'>

      <DashboardTile heading='Total Projects' data='112' type='details' />
      <DashboardTile heading='Pending Projects' data='10' type='details' />
      <DashboardTile heading='Worked progress' data='45' type='details' />
      <DashboardTile heading='Project Finished' data='44' type='details' />

    </div>
  )
}

export default DashboardTilesComponent