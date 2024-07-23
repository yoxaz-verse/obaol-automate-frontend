import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Tooltip } from "@nextui-org/react";
import { FiDelete } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import { deleteData } from "@/core/api/apiHandler";
import { userRoutes } from "@/core/api/apiRoutes";
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";

type field = {
  name: string,
  value: string,
}

interface CommonDeleteModalProps {
  onOpenChange: () => any;
  isOpen: boolean;
  data: {
    _id: string,
    type: string,
    name: string,
    role: string,
    endpoint: string,
    key: any[],
  }
}

export default function CommonDeleteModal({ data, onOpenChange, isOpen }: CommonDeleteModalProps) {
  const deleteMuation = useMutation({
    mutationFn: async (data: any) => {
      return deleteData(data.endpoint + data._id, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: data.key
      }
      )
      alert(`${data.type} Deleted Successfully`)
      showToastMessage({
        type: "success",
        message: `${data.type} Deleted Successfully`,
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
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete {data.type}</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete </p>
                {
                  data.name
                }
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Tooltip
                  key={"top"}
                  placement={"top"}
                  content={"Double Click to Confirm"}
                  color="danger"
                >
                  <Button color="danger" onDoubleClick={() => {
                    deleteMuation.mutate({ _id: data._id })
                    onClose()
                  }}>
                    Delete
                  </Button>
                </Tooltip>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
