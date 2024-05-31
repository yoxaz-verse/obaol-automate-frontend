import { Input, Modal, Button, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from '@nextui-org/react'
import React, { useState } from 'react'

const AddNewActivityModal = () => {
  const [open, setOpen] = useState(false)
  function openModal() {
    setOpen(true)
  }
  function closeModal() {
    setOpen(false)
  }
  function handleSubmit(e: any) {
    e.preventDefault();
    //  const inputs = document.querySelectorAll("input","textarea");

    closeModal();
  }
  return (
    <>
      <Button className="w-[120px] bg-[#3EADEB] rounded-3xl text-white h-[45px] text-sm" onClick={openModal}>Add Activity</Button>
      <Modal isOpen={open} onClose={() => closeModal()} className='' size='lg'>
        <ModalHeader className='text-black' title='Add New Activity' />
        <ModalContent className='p-5'>
          <div className='pb-6 font-medium text-lg'>Add new Activity</div>
          <form onSubmit={handleSubmit}>
            <Input type='text' variant='bordered' placeholder='title' className='py-2' id='name' />
            <Textarea rows={5} type='text' name="description" variant='bordered' placeholder='Description' className='py-2' id='description' />
            <Input type='text' variant='bordered' placeholder='budget' className='py-2' id='budget' />
            <Input type='text' variant='bordered' placeholder='Target date' className='py-2' id='target' />
            <Select variant='bordered' placeholder='Select user' className='py-2' id='selectuser'>
              <SelectItem value='user 1' key='user 1'>User 1</SelectItem>
              <SelectItem value='user 1' key='user 1'>User 1</SelectItem>
            </Select>
            <div className='flex justify-end w-full mt-4'>
              <button className="w-[100px] bg-[#3EADEB] rounded-3xl text-white h-[38px] text-sm" type='submit'>Add</button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AddNewActivityModal