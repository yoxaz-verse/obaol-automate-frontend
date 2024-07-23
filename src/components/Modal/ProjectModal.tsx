import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Textarea, Select, SelectItem } from "@nextui-org/react";
import { getData, postMultipart } from "@/core/api/apiHandler";
import { locationRoutes, projectRoutes, statusRoutes, userRoutes } from "@/core/api/apiRoutes";
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import Title from "../titles";

export default function ProjectModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
  });
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const inputs = formElement.querySelectorAll("input,textarea");
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
    // formData.append('images', locationImage)


    projectAddMutation.mutate(formData)
    //setImageURL('/upload_image.jpg')
    //setLocationImage(null)
  }
  const [choosenLocation, setChoosenLocation] = React.useState<any>()
  const [choosenStatus, setChoosenStatus] = React.useState<any>()
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
  const userByRoleDataCustomer = useQuery({
    queryKey: ['userByRoleData', "Customer"],
    queryFn: async () => {
      return await getData(userRoutes.getByRole + "Customer", {})
    }
  })
  const [generatedCustomId, setGeneratedCustomId] = React.useState<any>()
  const userByRoleDataManager = useQuery({
    queryKey: ['userByRoleData', "Manager"],
    queryFn: async () => {
      return await getData(userRoutes.getByRole + "Manager", {})
    }
  })


  return (
    <>
      <Button onPress={onOpen} color="secondary">Create Project</Button>

      <Modal size="xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-secondary">Add Project</ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit} className='w-full flex flex-col justify-evenly h-full items-center'>
                  <Input
                    placeholder="Title"
                    className='w-full '
                    variant='underlined'
                    name='title'
                  />
                  <Textarea
                    placeholder="Description"
                    className='w-full'
                    variant='underlined'
                    name="description"
                  />
                  <Input
                    placeholder="Budget"
                    name='budget'
                    className='w-full '
                    variant='underlined'
                  />

                  <Select
                    className='w-full '
                    variant='underlined'
                    name="location"
                    placeholder='Assign Location'
                    onChange={(e) => setChoosenLocation(e.target.value)}
                  >
                    {locationData.data?.data.data.map((data: any) => {
                      return <SelectItem key={data._id}>{data.name}</SelectItem>
                    })
                    }
                  </Select>
                  {/* readOnly Input */}
                  <Input
                    placeholder="CustomId"
                    className='w-full '
                    variant='underlined'
                    name='customId'
                    value={generatedCustomId}
                  />
                  <Select
                    className='w-full '
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
                  {/*
                  <Select
                    className='w-full '
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
                    className='w-full '
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
                  <Button className="w-full" radius="full" type="submit" color="secondary" onPress={onClose}>
                    Create
                  </Button>
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
      </Modal>
    </>
  );
}
