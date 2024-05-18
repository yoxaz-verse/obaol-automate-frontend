import { Input, Select, SelectItem, Textarea } from '@nextui-org/react'
import React from 'react'

const NewProjectsForm = () => {
  return (
    <div>
        <div className='flex justify-between bg-[white] rounded-xl shadow-md p-6 flex-col lg:flex-row'>
        <div className='w-full lg:w-[43%] lg:ml-5'>
        <form className='w-full flex flex-col justify-evenly h-full items-center'>
    <div className='w-full'>      <Input
            placeholder="Project Name"
            className='w-full'
            variant='underlined'
        />
    </div>
    <div className='w-full'>     <Textarea
            placeholder="Description"
            className='w-full'
            variant='underlined'

        />
    </div>
    <div className='w-full'>   <Input
            placeholder="Custom ID"
             className='w-full'
            variant='underlined'
        />
    </div>
    <div className='w-full'>        <Select
            className='w-full'
            variant='underlined'
            placeholder='Assign Manager'
        >
            <SelectItem key='Manager 1'>Manager 1</SelectItem>
            <SelectItem key='Manager 2'>Manager 2</SelectItem>
            <SelectItem key='Manager 3'>Manager 3</SelectItem>
        </Select>
    </div>
    <div className='w-full'>
        <Select
            className='w-full'
            variant='underlined'
            placeholder='Assign Customer'
        >
            <SelectItem key='Customer 1'>Customer 1</SelectItem>
            <SelectItem key='Customer 2'>Customer 2</SelectItem>
            <SelectItem key='Customer 3'>Customer 3</SelectItem>
        </Select>
        <div className='w-full flex items-center justify-center my-3'><button className='w-[150px] bg-[#3EADEB] rounded-3xl text-white p-3'>Create</button></div>
    </div>
</form>
        </div>
        <div className='w-full lg:w-[43%]'>
        <div className='w-full h-[400px] lg:h-[400px]'>
        <iframe src="https://www.google.com/maps/embed/v1/place?q=Door+No:730+E+Abg+Tower+Mundakayam+P.O,+near+South+Indian+Bank,+Kerala+686513&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8" className='w-full h-full'></iframe>
    </div>
        </div>
        </div>
    </div>
  )
}

export default NewProjectsForm