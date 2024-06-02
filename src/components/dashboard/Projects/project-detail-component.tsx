import React from 'react'
import ProjectDetailCard from './project-detail-card'
import { Card, CardBody, CardHeader } from '@nextui-org/react'
import { projectDetailCard } from '@/data/content-data'

const ProjectDetailComponent = ({ data }: { data: any }) => {
  console.log(data);

  return (
    <div>
   
      <div className='flex flex-col lg:flex-row lg:justify-between'>
        <div className='lg:w-[49%]'><ProjectDetailCard data={data} /></div>
        <div className='lg:w-[49%]'>
          <Card className='w-full lg:w-1/2 mb-6 py-2 mt-4 lg:mt-0'>
            <CardBody className='flex flex-col'>
              <div className='text-sm font-medium'>
                {
                  data.customId ?? "Custom Id"
                }

              </div>
              <div>{data.customId ?? "Custom Id"}</div></CardBody>
          </Card>
          <div className='w-full h-[400px] lg:h-[300px]'>
            <iframe src="https://www.google.com/maps/embed/v1/place?q=Door+No:730+E+Abg+Tower+Mundakayam+P.O,+near+South+Indian+Bank,+Kerala+686513&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8" className='w-full h-full'></iframe>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailComponent