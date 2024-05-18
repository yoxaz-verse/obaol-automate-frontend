import { Input, Modal, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from '@nextui-org/react'
import React, { useState } from 'react'

const AddUsers = () => {
    const [open, setOpen] = useState(false)
    function openModal(){
      setOpen(true)
    }
      function closeModal(){
          setOpen(false)
      }
      function handleSubmit(e:any){
        e.preventDefault();
         closeModal()
      }
  return (
    <>
     <button className="w-[120px] bg-[#3EADEB] rounded-3xl text-white h-[45px] text-sm" onClick={openModal}>Add</button>
    <Modal isOpen={open} onClose={()=>closeModal()} className='' size='lg'>
        <ModalHeader className='text-black' title='Add New Activity'/>
        <ModalContent className='p-5'>
            <div className='pb-6 font-medium text-lg'>Add User</div>
    <form onSubmit={handleSubmit}>
     <Input type='text' variant='bordered' placeholder='Name' className='py-2' id='name'/>
     <Input type='text' variant='bordered' placeholder='Email' className='py-2' id='target'/>
     <Select variant='bordered' placeholder='Select Role' className='py-2' id='selectuser'>
        <SelectItem value='Worker' key='user 1'>Worker</SelectItem>
        <SelectItem value='Admin' key='user 1'>Admin</SelectItem>
        <SelectItem value='Customer' key='user 1'>Customer</SelectItem>
        <SelectItem value='Managers' key='user 1'>Managers</SelectItem>
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

export default AddUsers