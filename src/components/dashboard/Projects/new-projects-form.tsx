"use client"
import { queryClient } from '@/app/provider'
import { getData, postData, postMultipart } from '@/core/api/apiHandler'
import { showToastMessage } from '@/utils/utils'
import { Card, CardBody, Input, Select, SelectItem, Textarea } from '@nextui-org/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { authRoutes, locationRoutes, projectRoutes, statusRoutes, subStatusRoutes, userRoutes } from "@/core/api/apiRoutes";

const NewProjectsForm = () => {

  const [imageURL, setImageURL] = React.useState('/upload_image.jpg' as string)
  const [locationImage, setLocationImage] = React.useState<any>()
  const [choosenLocation, setChoosenLocation] = React.useState<any>()
  const [choosenStatus, setChoosenStatus] = React.useState<any>()
  const [generatedCustomId, setGeneratedCustomId] = React.useState<any>()




  const locationData = useQuery({
    queryKey: ['locationData'],
    queryFn: async () => {
      return await getData(locationRoutes.getAll, {})
    },
  });

  // statusData
  const statusData = useQuery({
    queryKey: ['statusData'],
    queryFn: async () => {
      return await getData(statusRoutes.getAll, {})
    },
  });

  // subStatusData
  const subStatusData = useQuery({
    queryKey: ['subStatusData'],
    queryFn: async () => {
      return await getData(subStatusRoutes.getAll, {})
    },
  });

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0]
    setLocationImage(e.target.files)
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
  const projectAddMutation = useMutation({
    mutationFn: async (data: any) => {
      return postMultipart(projectRoutes.create, {}, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projectData']
      })
      alert('Project Created Successfully')
      showToastMessage({
        type: "success",
        message: "Project Created Successfully",
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
      title: (inputs[0] as HTMLInputElement).value,
      description: (inputs[1] as HTMLInputElement).value,
      budget: (inputs[2] as HTMLInputElement).value,
      location: (inputs[3] as HTMLInputElement).value,
      customId: (inputs[4] as HTMLInputElement).value,
      status: (inputs[5] as HTMLInputElement).value,
      subStatus: (inputs[6] as HTMLInputElement).value,
      managerId: (inputs[7] as HTMLInputElement).value,
      customerId: (inputs[8] as HTMLInputElement).value,

    }

    const formData = new FormData();
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('budget', data.budget)
    formData.append('Location', data.location)
    formData.append('customId', data.customId)
    formData.append('status', data.status)
    formData.append('subStatus', data.subStatus)
    formData.append('managerId', data.managerId)
    formData.append('customerId', data.customerId)
    formData.append('images', locationImage)


    projectAddMutation.mutate(formData)
    setImageURL('/upload_image.jpg')
    setLocationImage(null)
  }

  useEffect(() => {
    if (choosenLocation) {

      const location = locationData.data?.data.data.find((data: any) => data._id === choosenLocation)
      if (location) {

        setGeneratedCustomId(location.name)
      }
    }
  }, [choosenLocation, locationData])
  return (

    <Card>
      <CardBody>
        <div className='w-full flex gap-5 flex-col lg:flex-row'>
          <div className='w-full '>
            <form onSubmit={handleSubmit} className='w-full flex flex-col justify-evenly h-full items-center'>
              <Input
                placeholder="Title"
                className='w-full m-2'
                variant='underlined'
                name='title'
              />
              <Textarea
                placeholder="Description"
                className='w-full m-2'
                variant='underlined'
                name="description"
              />
              <Input
                placeholder="Budget"
                name='budget'
                className='w-full m-2'
                variant='underlined'
              />

              <Select
                className='w-full m-2'
                variant='underlined'
                name="location"
                placeholder='Assign Location'
                onChange={(e) => setChoosenLocation(e.target.value)}
              >
                {
                  locationData.data?.data.data.map((data: any) => {
                    return <SelectItem key={data._id}>{data.name}</SelectItem>
                  })
                }
              </Select>
              {/* readOnly Input */}
              <Input
                placeholder="CustomId"
                className='w-full m-2'
                variant='underlined'
                name='customId'
                value={generatedCustomId}
              />
              <Select
                className='w-full m-2'
                variant='underlined'
                name="status"
                placeholder='Assign Status'
                onChange={(e) => {
                  setChoosenStatus(e.target.value)
                }}
              >
                {
                  statusData.data?.data.data.map((data: any) => {
                    return <SelectItem key={data._id}>{data.title}</SelectItem>
                  })
                }
              </Select>

              <Select
                className='w-full m-2'
                variant='underlined'
                name="status"
                placeholder='Assign Sub Status'
                disabled={!choosenStatus}
              >
                {
                  subStatusData.data?.data.data.filter(
                    (data: any) => data.status === choosenStatus
                  ).map((data: any) => {
                    return <SelectItem key={data._id}>{data.title}</SelectItem>
                  })
                }
              </Select>

              <Select
                className='w-full m-2'
                variant='underlined'
                name='manager'
                placeholder='Assign Manager'
              >
                {
                  userByRoleDataManager.data?.data.data.map((data: any) => {
                    return <SelectItem key={data._id}>{data.name}</SelectItem>
                  })
                }
              </Select>
              <Select
                className='w-full m-2'
                variant='underlined'
                name='customer'
                placeholder='Assign Customer'
              >
                {
                  userByRoleDataCustomer.data?.data.data.map((data: any) => {
                    return <SelectItem key={data._id}>{data.name}</SelectItem>
                  })
                }
              </Select>
              {/* hiddenInput */}

              <div className='w-full flex items-center justify-center my-3'><button className='w-[150px] bg-[#3EADEB] rounded-3xl text-white p-3' type='submit'>Create</button></div>
            </form>
          </div>
          <div className='w-full h-auto flex justify-between flex-col gap-5 '>
            <div className='w-full  h-full '>
              {/* Image Input with label*/}
              <label htmlFor="location_upload" className='w-full h-full  bg-[#F0F0F0] rounded-2xl cursor-pointer'>
                <Image src={imageURL} alt='location_image' width={500} height={500} style={{
                  objectFit: 'cover',
                  borderRadius: '20px',
                  width: '100%',
                  height: '500px',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }} />
              </label>
              <input onChange={handleImageUpload} type='file' multiple id="location_upload" className='hidden' />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default NewProjectsForm
