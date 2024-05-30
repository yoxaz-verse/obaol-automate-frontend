"use client"
import { queryClient } from '@/app/provider'
import { getData, postData, postMultipart } from '@/core/api/apiHandler'
import { locationRoutes, userRoutes } from '@/core/api/apiRoutes'
import { showToastMessage } from '@/utils/utils'
import { Card, CardBody, Input, Select, SelectItem, Textarea } from '@nextui-org/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import React from 'react'

const NewProjectsForm = () => {

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
            }
            )
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
        formData.append('image', locationImage)

        addLocation.mutate(formData)
        setImageURL('/upload_image.jpg')
        setLocationImage(null)
    }
    return (

        <Card>
            <CardBody>
                <div className='w-full flex gap-5 flex-col lg:flex-row'>
                    <div className='w-full '>
                        <form onSubmit={handleSubmit} className='w-full flex flex-col justify-evenly h-full items-center'>
                            <Input
                                placeholder="Location Name"
                                className='w-full m-2'
                                variant='underlined'
                                name='name'
                            />

                            <Textarea
                                placeholder="Description"
                                className='w-full m-2'
                                variant='underlined'
                            />


                            <Input
                                placeholder="URL"
                                className='w-full m-2'
                                variant='underlined'
                            />


                            <Input
                                placeholder="Nation"
                                className='w-full m-2'
                                variant='underlined'
                            />

                            <Input
                                placeholder="City"
                                className='w-full m-2'
                                variant='underlined'
                            />

                            <Input
                                placeholder="Latitude"
                                className='w-full m-2'
                                variant='underlined'
                            />

                            <Input
                                placeholder="Longitude"
                                className='w-full m-2'
                                variant='underlined'
                            />

                            <Input
                                placeholder="Codes"
                                className='w-full m-2'
                                variant='underlined'
                            />

                            <Input
                                placeholder="Region"
                                className='w-full m-2'
                                variant='underlined'
                            />

                            <Input
                                placeholder="Province"
                                className='w-full m-2'
                                variant='underlined'
                            />

                            <Input
                                placeholder="Owner"
                                className='w-full m-2'
                                variant='underlined'
                            />

                            <Select
                                className='w-full m-2'
                                variant='underlined'
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
                                placeholder='Assign Customer'
                            >
                                {
                                    userByRoleDataCustomer.data?.data.data.map((data: any) => {
                                        return <SelectItem key={data._id}>{data.name}</SelectItem>
                                    })
                                }
                            </Select>
                            <div className='w-full flex items-center justify-center my-3'><button className='w-[150px] bg-[#3EADEB] rounded-3xl text-white p-3' type='submit'>Create</button></div>



                        </form>
                    </div>
                    <div className='w-full h-auto flex justify-between flex-col gap-5 '>
                        <div className='w-full h-[500px] '>
                            <iframe src="https://www.google.com/maps/embed/v1/place?q=Door+No:730+E+Abg+Tower+Mundakayam+P.O,+near+South+Indian+Bank,+Kerala+686513&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8" className='w-full rounded-xl h-full'></iframe>
                        </div>
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
                            <input onChange={handleImageUpload} type='file' id="location_upload" className='hidden' />
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

export default NewProjectsForm