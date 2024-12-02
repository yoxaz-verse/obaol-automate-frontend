import { queryClient } from "@/app/provider";
import { getData, postData } from "@/core/api/apiHandler";
import { activityRoutes, userRoutes } from "@/core/api/apiRoutes";
import {
  Input,
  Modal,
  Button,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  Chip,
  Avatar,
} from "@nextui-org/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

const AddNewActivityModal = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  const [workers, setWorkers] = useState<any>([]);
  function openModal() {
    setOpen(true);
  }
  function closeModal() {
    setOpen(false);
  }

  // const userByRoleData = useQuery({
  //   queryKey: ["userByRoleData", "Worker"],
  //   queryFn: async () => {
  //     return await getData(userRoutes.getByRole + "Worker", {});
  //   },
  // });

  const addActivity = useMutation({
    mutationFn: async (data: any) => {
      return postData(activityRoutes.getAll + id, {}, data);
    },
    onSuccess: () => {
      alert("Activity Added Successfully");
      queryClient.invalidateQueries({
        queryKey: ["activityData", id],
      });
      closeModal();
    },
    onError: (error: any) => {
      alert(error.response.data.message);
      console.log(error);
      closeModal();
    },
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const inputs = formElement.querySelectorAll("input,textarea");
    console.log(inputs);

    // only take _id from workers
    let updatedWorkers = workers.map((worker: any) => {
      return worker._id;
    });

    console.log(updatedWorkers);

    const data = {
      title: (inputs[0] as HTMLInputElement).value,
      description: (inputs[1] as HTMLInputElement).value,
      budget: (inputs[2] as HTMLInputElement).value,
      target: (inputs[3] as HTMLInputElement).value,
      workerId: updatedWorkers,
    };
    console.log(data);
    addActivity.mutate(data);
  };
  return (
    <>
      <Button
        className="w-[120px] bg-[#3EADEB] rounded-3xl text-white h-[45px] text-sm"
        onClick={openModal}
      >
        Add Activity
      </Button>
      <Modal isOpen={open} onClose={() => closeModal()} className="" size="lg">
        <ModalHeader className="text-black" title="Add New Activity" />
        <ModalContent className="p-5">
          <div className="pb-6 font-medium text-lg">Add new Activity</div>
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              variant="bordered"
              placeholder="title"
              className="py-2"
              id="name"
            />
            <Textarea
              rows={5}
              type="text"
              name="description"
              variant="bordered"
              placeholder="Description"
              className="py-2"
              id="description"
            />
            <Input
              type="text"
              variant="bordered"
              placeholder="budget"
              className="py-2"
              id="budget"
            />
            <Input
              type="date"
              variant="bordered"
              placeholder="Target date"
              className="py-2"
              id="target"
            />

            <div className="flex flex-wrap gap-2">
              {/* if empty array , put a block */}
              {workers.length === 0 && (
                <div className="text-gray-400">No workers added yet</div>
              )}
              {workers.map((worker: any, index: number) => {
                return (
                  <Chip
                    variant="flat"
                    key={index}
                    onClose={() => {
                      setWorkers(
                        workers.filter((w: any) => w._id !== worker._id)
                      );
                    }}
                    avatar={
                      <Avatar
                        name={worker.name}
                        size="sm"
                        getInitials={(name: any) => name.charAt(0)}
                      />
                    }
                  >
                    {worker.name}
                  </Chip>
                );
              })}
            </div>

            <Select
              variant="bordered"
              placeholder="Select user"
              onChange={(e: any) => {}}
              className="py-2"
              id="selectuser"
            >
              {userByRoleData.data?.data?.data
                .filter(
                  (user: any) =>
                    !workers.find((worker: any) => worker._id === user._id)
                )
                .map((user: any) => {
                  return (
                    <SelectItem
                      onClick={(e: any) => {
                        setWorkers([...workers, user]);
                      }}
                      value={user._id}
                      key={user._id}
                    >
                      {user.name}
                    </SelectItem>
                  );
                })}
            </Select>
            <div className="flex justify-end w-full mt-4">
              <button
                className="w-[100px] bg-[#3EADEB] rounded-3xl text-white h-[38px] text-sm"
                type="submit"
              >
                Add
              </button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddNewActivityModal;
