import { ProjectDetailProgressProps } from '@/data/interface-data'
import { Card, Slider, cn } from '@nextui-org/react'
import React from 'react'

const ProjectDetailProgressCard = ({heading,subheading,progress}:ProjectDetailProgressProps) => {
  return (
    <Card className='p-4'>
     <div className='font-bold py-2'>{heading}</div>
     <div className='text-sm text-[#797878] font-medium'>{subheading}</div>
     <Slider 
      aria-label="Player progress" 
      color="primary"
      size='sm'
      hideThumb={true}
      defaultValue={progress}
      className='py-3 opacity-100'
      isDisabled
      classNames={{
        base: "max-w-md gap-3",
        filler: "bg-[#08A0F7] opacity-100",
      }}/>
    </Card>
  )
}

export default ProjectDetailProgressCard