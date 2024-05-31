import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Tooltip } from "@nextui-org/react";
import { FiDelete } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import { deleteData } from "@/core/api/apiHandler";
import { userRoutes } from "@/core/api/apiRoutes";
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";

type field = {
        name :string,
        value : string,
}

interface CommonDeleteModalProps {
  _id: string,
  type : string,
  name: string,
  role: string,
  endpoint : string,
  fields : any,
}

export default function CommonDeleteModal(props: CommonDeleteModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const deleteUser = useMutation({
    mutationFn: async (data: any) => {
      return deleteData(props.endpoint + data._id, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userByRoleData', props.role]
      }
      )
      showToastMessage({
        type: "success",
        message: "User Deleted Successfully",
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
      <FiDelete onClick={onOpen} />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete {props.type}</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete </p>
                {props.fields.map((field : any,key:any) => (
                  <h3 key={key} className="font-bold">{field.label}</h3>
                ))}
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
                    deleteUser.mutate({ _id: props._id })
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
