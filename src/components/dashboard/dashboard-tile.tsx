import { DashboardTileProps } from '@/data/interface-data'
import { Card, CardBody, CardHeader, Divider } from '@nextui-org/react'
import React from 'react'
import { GrAdd } from 'react-icons/gr'
import DoughnutChart from './Charts/doughnut-chart'
import { doughnutChartData } from '@/data/content-data'
import LineChart from './Charts/line-chart'
import { GrowthTypeChart } from './Charts/growth-type-chart'

const DashboardTile = ({heading,data,type,stats}:DashboardTileProps) => {
function DashboardTileData(){
    if(type==='details'){
        return <>
        <CardHeader className='font-medium text-[#5B5B5B]'>{heading}</CardHeader>
        <CardBody className='bg-[#CEECFD] text-[#3EADEB] flex items-center justify-center text-3xl w-[100px] rounded-3xl h-[75px] m-5 font-semibold mb-8'>{data}</CardBody>
        </>
    }
    if(type==='add new'){
        return <>
        <CardHeader className='font-medium text-black'>New Projects</CardHeader>
        <CardBody className='border-dashed border-2 border-black my-3 w-11/12 h-32 flex justify-center items-center'><button className='w-14 h-14 text-white rounded-full flex items-center justify-center text-2xl bg-[#3EADEB] py-2'><GrAdd/></button>
        <div className='text-xs my-3'>Tap to create a new project</div>
        </CardBody>
        </>
}
if(type==='percentage charts'){
    return <>
     <CardHeader className='font-medium text-black'>{heading}</CardHeader>
        <CardBody className='my-1 w-11/12 flex justify-center items-center'>
         <DoughnutChart data={doughnutChartData}/>
        </CardBody>
    </>
}
if(type==='line charts'){
    return <>
    <CardHeader className=' text-black flex flex-col'>
        <div className='text-start w-full font-medium'>{heading}</div>
        <div className='flex justify-between w-full'>
        <div className=''>Statistics</div>
        <div className='text-green-500'>{stats}</div>
        </div>
        </CardHeader>
        <Divider/>
       <CardBody className='my-1 w-full flex justify-center items-center'>
        <LineChart/>
       </CardBody>
   </>
}
if(type==='bar chart'){
    return <>
    <CardHeader className='font-medium text-black'>{heading}</CardHeader>
       <CardBody className='my-1 w-full flex justify-center items-center'>
        <GrowthTypeChart/>
       </CardBody>
   </>
}
}
  return (
    <Card className='bg-white shadow-md outline-1 flex items-center justify-center px-6'>
        {DashboardTileData()}
    </Card>

  )
}

export default DashboardTile