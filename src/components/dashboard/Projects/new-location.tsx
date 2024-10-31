"use client"
import { queryClient } from '@/app/provider'
import { getData, postData, postMultipart } from '@/core/api/apiHandler'
import { locationRoutes, userRoutes } from '@/core/api/apiRoutes'
import { showToastMessage } from '@/utils/utils'
import { Button, Card, CardBody, Input, Modal, Select, SelectItem, Textarea, useDisclosure, ModalBody, ModalContent, Chip } from '@nextui-org/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import React, { useState } from 'react'

const NewLocationForm = () => {
  const [imageURL, setImageURL] = React.useState('/upload_image.jpg' as string)
  const [locationImage, setLocationImage] = React.useState<any>()
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0]
    setLocationImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageURL(reader.result as string)
    }
    reader.readAsDataURL(file)
  }
  const userByRoleDataCustomer = useQuery({
    queryKey: ['userByRoleData', "Customer"],
    queryFn: async () => {
      return await getData(userRoutes.getByRole + "Customer", {})
    }
  })
  const userByRoleDataManager = useQuery({
    queryKey: ['userByRoleData', "Manager"],
    queryFn: async () => {
      return await getData(userRoutes.getByRole + "Manager", {})
    }
  })
  const addLocation = useMutation({
    mutationFn: async (data: any) => {
      return postMultipart(locationRoutes.getAll, {}, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['locationData']
      })
      alert('Location Created Successfully')
      showToastMessage({
        type: "success",
        message: "Location Created Successfully",
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
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const inputs = formElement.querySelectorAll("input,textarea");


    // fetch according the name attribute
    const data = {
      name: (inputs[0] as HTMLInputElement).value,
      description: (inputs[1] as HTMLInputElement).value,
      url: (inputs[2] as HTMLInputElement).value,
      nation: (inputs[3] as HTMLInputElement).value,
      city: (inputs[4] as HTMLInputElement).value,
      lat: (inputs[5] as HTMLInputElement).value,
      long: (inputs[6] as HTMLInputElement).value,
      codes: (inputs[7] as HTMLInputElement).value,
      region: (inputs[8] as HTMLInputElement).value,
      province: (inputs[9] as HTMLInputElement).value,
      owner: (inputs[10] as HTMLInputElement).value,
      managerId: (inputs[11] as HTMLInputElement).value,
      customerId: (inputs[12] as HTMLInputElement).value,
    }

    const formData = new FormData();
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('url', data.url)
    formData.append('nation', data.nation)
    formData.append('city', data.city)
    formData.append('lat', data.lat)
    formData.append('long', data.long)
    formData.append('codes', data.codes)
    formData.append('region', data.region)
    formData.append('province', data.province)
    formData.append('owner', data.owner)
    formData.append('managerId', data.managerId)
    formData.append('customerId', data.customerId)
    formData.append('images', locationImage)

    addLocation.mutate(formData)
    setImageURL('/upload_image.jpg')
    setLocationImage(null)
  }
  const [tabs, setTabs] = useState<string[]>([]);
  const pushTabs = (tab: string) => {
    const tabsArr = [...tabs];
    tabsArr.push(tab);
    setTabs(tabsArr);
  };
  const [service, setService] = useState<string>("");
  const [serviceArr, setServiceArr] = useState<string[]>([]);
  const removeTab = (index: number): void => {

    const tabsArr = [...tabs];
    const updatedServiceArr = [...serviceArr];
    updatedServiceArr.splice(index, 1);
    tabsArr.splice(index, 1);
    setTabs(tabsArr);
    setServiceArr(updatedServiceArr);
  };
  const { onOpen, isOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button color='secondary' onPress={onOpen}>Create Location</Button>
      <Modal scrollBehavior='outside' isDismissable={false} size='xl' isOpen={isOpen} onOpenChange={onOpenChange} className='overflow-y-scroll p-[1rem]' placement='center'>
        <ModalContent className='w-full p-[1rem] overflow-scroll'>
          <h3 className='text-[34px] font-extrabold text-secondary'>Create Location</h3>
          <form onSubmit={handleSubmit} className='w-full flex flex-col justify-center gap-4 h-full items-center'>
            <div className='w-full h-full flex justify-between flex-col gap-5 '>
              <div className='w-full  h-full'>
                <label htmlFor="location_upload" className='w-full h-full  bg-[#F0F0F0] rounded-2xl cursor-pointer'>
                  <Image src={imageURL} alt='location_image' width={200} height={200} />
                </label>
                <input onChange={handleImageUpload} type='file' id="location_upload" className='hidden' />
              </div>
            </div>
            <Input
              placeholder="Location Name"
              className='w-full'
              variant='underlined'
              name='name'
            />

            <Textarea
              placeholder="Description"
              className='w-full '
              variant='underlined'
            />
            <Input
              placeholder="URL"
              className='w-full '
              variant='underlined'
            />
            <Input
              placeholder="Nation"
              className='w-full '
              variant='underlined'
            />
            <Input
              placeholder="City"
              className='w-full '
              variant='underlined'
            />
            <Input
              placeholder="Latitude"
              className='w-full '
              variant='underlined'
            />
            <Input
              placeholder="Longitude"
              className='w-full '
              variant='underlined'
            />
            <Input
              placeholder="Codes"
              className='w-full '
              variant='underlined'
            />
            <Input
              placeholder="Region"
              className='w-full '
              variant='underlined'
            />
            <div className="flex flex-col gap-4 justify-around">
              <div className="flex flex-row gap-2">
                {tabs.map((tab, tabIndex) => (
                  tab !== "" && <Chip variant="flat" color="warning" onClose={() => removeTab(tabIndex)} key={tabIndex}>{tab}</Chip>
                ))}
              </div>
              <div className="flex flex-row justify-around">
                <Input
                  required
                  className="w-1/2"
                  value={service}
                  placeholder={"Type"}
                  type="text"
                  onChange={(e) => setService(e.target.value)}
                />
                <Button color="primary" onClick={() => {
                  pushTabs(service);
                  setServiceArr([...serviceArr, service]);
                  setService("");
                }}>Add</Button>
              </div>
            </div>
            <Input
              placeholder="Province"
              className='w-full '
              variant='underlined'
            />
            <Input
              placeholder="Owner"
              className='w-full '
              variant='underlined'
            />
            {/*
            <Select
              className='w-full '
              variant='underlined'
              placeholder='Assign Manager'
            >
              {
                userByRoleDataManager.data?.data?.data.map((data: any) => {
                  return <SelectItem key={data._id}>{data.name}</SelectItem>
                })
              }
            </Select>
                
            <Select
              className='w-full '
              variant='underlined'
              placeholder='Assign Customer'
            >
              {
                userByRoleDataCustomer.data?.data.data.map((data: any) => {
                  return <SelectItem key={data._id}>{data.name}</SelectItem>
                })
              }
            </Select>
          */}
            <Button color='secondary' className='w-full' radius='full'>Create</Button>
          </form>
        </ModalContent>
      </Modal >
    </>
  )
}

export default NewLocationForm
