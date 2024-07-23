"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
  SelectItem,
  Select,
} from "@nextui-org/react";
import { getData, postMultipart } from "@/core/api/apiHandler";
import { projectRoutes, locationRoutes, statusRoutes, userRoutes } from "@/core/api/apiRoutes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";

interface EditModalProps {
  onOpenChange: () => any;
  isOpen: boolean;
  data: any;
}

const ProjectModal: React.FC<EditModalProps> = ({ onOpenChange, isOpen, data }) => {
  const projectAddMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return postMultipart(projectRoutes.create, {}, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectData'] });
      alert('Project Created Successfully');
      showToastMessage({
        type: "success",
        message: "Project Created Successfully",
        position: "top-right",
      });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "An error occurred");
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "An error occurred",
        position: "top-right",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    projectAddMutation.mutate(formData);
  };

  const { data: locationData } = useQuery({
    queryKey: ['locationData'],
    queryFn: async () => {
      return await getData(locationRoutes.getAll, {});
    },
  });

  const { data: statusData } = useQuery({
    queryKey: ['statusData'],
    queryFn: async () => {
      return await getData(statusRoutes.getAll, {});
    },
  });

  const { data: userByRoleDataCustomer } = useQuery({
    queryKey: ['userByRoleData', "Customer"],
    queryFn: async () => {
      return await getData(userRoutes.getByRole + "Customer", {});
    },
  });

  const { data: userByRoleDataManager } = useQuery({
    queryKey: ['userByRoleData', "Manager"],
    queryFn: async () => {
      return await getData(userRoutes.getByRole + "Manager", {});
    },
  });

  const [generatedCustomId, setGeneratedCustomId] = React.useState<any>();
  const [choosenLocation, setChoosenLocation] = React.useState<any>();
  const [choosenStatus, setChoosenStatus] = React.useState<any>();

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Edit Project</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="w-full flex flex-col justify-evenly h-full items-center">
            <Input placeholder="Title" className="w-full" variant="underlined" name="title" value={data.title} />
            <Textarea placeholder="Description" className="w-full" variant="underlined" name="description" value={data.description} />
            <Input placeholder="Budget" name="budget" className="w-full" variant="underlined" value={data.budget} />

            <Select
              className="w-full"
              variant="underlined"
              name="location"
              selectedKeys={[data.location]}
              placeholder="Assign Location"
              onChange={(e) => setChoosenLocation(e.target.value)}
            >
              {locationData?.data?.data.map((data: any) => (
                <SelectItem key={data._id}>{data.name}</SelectItem>
              ))}
            </Select>

            <Input placeholder="CustomId" className="w-full" variant="underlined" name="customId" value={generatedCustomId} />

            <Select
              className="w-full"
              variant="underlined"
              name="status"
              value={data.status}
              placeholder="Assign Status"
              onChange={(e) => setChoosenStatus(e.target.value)}
            >
              {statusData?.data?.data.map((data: any) => (
                <SelectItem key={data._id}>{data.title}</SelectItem>
              ))}
            </Select>

            <Button className="w-full" radius="full" type="submit" color="secondary">
              Edit
            </Button>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onOpenChange}>
            Close
          </Button>
          <Button color="primary" onPress={onOpenChange}>
            Action
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProjectModal;
