import { Card, CardHeader, Divider } from '@nextui-org/react'
import React from 'react'
import { MultiTypeChart } from '../Charts/multitype-chart'
import DashboardTile from '../dashboard-tile'

const ManagerActivityDetailsComponent = () => {
  return (
    <>
    <div className='text-lg font-medium pb-5 pt-2'>View Manager Analytics</div>
    <div className='flex items-start flex-col lg:flex-row lg:justify-between'>
      <div className='w-full lg:w-[70%]'><Card className='p-2'>
        <CardHeader className='flex flex-col'>
          <div className='w-full text-start'>Worker Activity Graph</div>
          <div className='w-full text-start'>Current Progress of your work</div>
        </CardHeader>
        <Divider/>
        <MultiTypeChart/>
        </Card></div>
      <div className='w-full lg:w-[25%]'><DashboardTile type='line charts' heading="Real time activity" stats="33%"/></div>
    </div>
    </>
  )
}

export default ManagerActivityDetailsComponent