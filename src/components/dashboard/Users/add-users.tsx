import { queryClient } from '@/app/provider'
import { getData, postData } from '@/core/api/apiHandler'
import { roleRoutes, userRoutes } from '@/core/api/apiRoutes'
import { showToastMessage } from '@/utils/utils'
import { Input, Modal, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Textarea } from '@nextui-org/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'

const AddUsers = ({ currentRole }: { currentRole: string }) => {
  const [open, setOpen] = useState(false)
  function openModal() {
    setOpen(true)
  }
  function closeModal() {
    setOpen(false)
  }

  const addUser = useMutation({
    mutationFn: async (data: any) => {
      return postData(userRoutes.getAll, {}, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userByRoleData', currentRole]
      }
      )
      alert('User Created Successfully')
      showToastMessage({
        type: "success",
        message: "User Created Successfully",
        position: "top-right",
      });
    },
    onError: (error: any) => {
      alert(error.response.data.message)
      showToastMessage({
        type: "error",
        message: error.response.data.message,
        position: "top-right",
      });
      console.log(error);
    }

  })

  function handleSubmit(e: any) {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const inputs = formElement.querySelectorAll("input");
    // auto generate password
    const password = Math.random().toString(36).slice(-8);
    const data = {
      name: (inputs[0] as HTMLInputElement).value,
      email: (inputs[1] as HTMLInputElement).value,
      Role: (inputs[2] as HTMLInputElement).value,
      password: password,
      passwordConfirm: password
    }

    console.log(data);
    addUser.mutate(data)
    closeModal()

  }

  const roleData = useQuery({
    queryKey: ['roleData'],
    queryFn: async () => {
      return await getData(roleRoutes.getAll, {})
    }
  })
  return (
    <>
      <button className="w-[120px] bg-[#3EADEB] rounded-3xl text-white h-[45px] text-sm" onClick={openModal}>Add</button>
      <Modal isOpen={open} onClose={() => closeModal()} className='' size='lg'>
        <ModalHeader className='text-black' title='Add New Activity' />
        <ModalContent className='p-5'>
          <div className='pb-6 font-medium text-lg'>Add User</div>
          <form onSubmit={handleSubmit}>
            <Input type='text' variant='bordered' required placeholder='Name' className='py-2' id='name' />
            <Input type='email' variant='bordered' required placeholder='Email' className='py-2' id='target' />
            <Select variant='bordered' placeholder='Select Role' required className='py-2' id='selectuser'>
              {
                roleData.data && roleData.data.data.data.filter((x: any) => x.roleName !== "Super_Admin").map((role: any) => (
                  <SelectItem value={role._id} key={role._id}>{role.roleName}</SelectItem>
                ))
              }
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