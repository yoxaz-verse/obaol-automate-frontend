import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem, Input, Textarea, image, Chip } from "@nextui-org/react";
import { EditModalProps } from "./edit-project";
import { locationRoutes, userRoutes } from "@/core/api/apiRoutes";
import { getData, postMultipart } from "@/core/api/apiHandler";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";
import Image from "next/image";

export default function EditLocation({ isOpen, onOpenChange, data }: EditModalProps) {
  const [imageURL, setImageURL] = React.useState('/upload_image.jpg' as string);
  const [locationImage, setLocationImage] = React.useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocationImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
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

  const userByRoleDataCustomer = useQuery({
    queryKey: ['userByRoleData', "Customer"],
    queryFn: async () => {
      const response = await getData(userRoutes.getByRole + "Customer", {});
      return response.data;
    }
  });

  const userByRoleDataManager = useQuery({
    queryKey: ['userByRoleData', "Manager"],
    queryFn: async () => {
      const response = await getData(userRoutes.getByRole + "Manager", {});
      return response.data;
    }
  });

  const addLocation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await postMultipart(locationRoutes.getAll, {}, formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locationData"] });
      showToastMessage({
        type: "success",
        message: "Location Created Successfully",
        position: "top-right",
      });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "Failed to create location",
        position: "top-right",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (locationImage) {
      formData.append('images', locationImage);
    }

    addLocation.mutate(formData);
    setImageURL('/upload_image.jpg');
    setLocationImage(null);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Edit Location</ModalHeader>
            <ModalBody>
              <form onSubmit={handleSubmit} className='w-full flex flex-col gap-4 h-full items-center'>
                <div className='w-full h-full flex justify-between flex-col gap-5 '>
                  <div className='w-full  h-full'>
                    <label htmlFor="location_upload" className='w-full h-full  bg-[#F0F0F0] rounded-2xl cursor-pointer'>
                      <Image src={data.image || imageURL} alt='location_image' width={200} height={200} />
                    </label>
                    <input onChange={handleImageUpload} type='file' id="location_upload" className='hidden' />
                  </div>
                </div>
                <Input
                  placeholder="Location Name"
                  className='w-full'
                  variant='underlined'
                  name='name'
                  defaultValue={data.name}
                />

                <Textarea
                  placeholder="Description"
                  className='w-full '
                  variant='underlined'
                  name='description'
                  defaultValue={data.description}
                />
                <Input
                  placeholder="URL"
                  className='w-full '
                  variant='underlined'
                  name='url'
                  defaultValue={data.url}
                />
                <Input
                  placeholder="Nation"
                  className='w-full '
                  variant='underlined'
                  name='nation'
                  defaultValue={data.nation}
                />
                <Input
                  placeholder="City"
                  className='w-full '
                  variant='underlined'
                  name='city'
                  defaultValue={data.city}
                />
                <Input
                  placeholder="Latitude"
                  className='w-full '
                  variant='underlined'
                  name='lat'
                  defaultValue={data.lat}
                />
                <Input
                  placeholder="Longitude"
                  className='w-full '
                  variant='underlined'
                  name='long'
                  defaultValue={data.long}
                />
                <Input
                  placeholder="Codes"
                  className='w-full '
                  variant='underlined'
                  name='codes'
                  defaultValue={data.codes}
                />
                <Input
                  placeholder="Region"
                  className='w-full '
                  variant='underlined'
                  name='region'
                  defaultValue={data.region}
                />
                <Input
                  placeholder="Province"
                  className='w-full '
                  variant='underlined'
                  name='province'
                  defaultValue={data.province}
                />
                <Input
                  placeholder="Owner"
                  className='w-full '
                  variant='underlined'
                  name='owner'
                  defaultValue={data.owner}
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

                {/*
                <Select
                  className='w-full '
                  variant='underlined'
                  placeholder='Assign Manager'
                  name='managerId'
                >
                  {
                    userByRoleDataManager.data?.map((data: any) => (
                      <SelectItem key={data._id} value={data._id}>{data.name}</SelectItem>
                    ))
                  }
                </Select>
                <Select
                  className='w-full '
                  variant='underlined'
                  placeholder='Assign Customer'
                  name='customerId'
                >
                  {
                    userByRoleDataCustomer.data?.map((data: any) => (
                      <SelectItem key={data._id} value={data._id}>{data.name}</SelectItem>
                    ))
                  }
                </Select>
              */}
                <Button color='secondary' className='w-full' radius='full' type="submit">Edit</Button>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal >
  );
}
