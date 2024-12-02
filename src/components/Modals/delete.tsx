// components/DeleteModal.tsx
"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { FiDelete } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import { deleteData } from "@/core/api/apiHandler";
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";

interface DeleteModalProps {
  _id: string;
  name: string;
  deleteApiEndpoint: string;
  refetchData: () => void;
  useBody?: boolean;
}

export default function DeleteModal({
  _id,
  name,
  deleteApiEndpoint,
  useBody = false,
}: DeleteModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const deleteItem = useMutation({
    mutationFn: async () =>
      deleteData(`${deleteApiEndpoint}/${_id}`, useBody ? { _id } : undefined),
    onSuccess: () => {
      queryClient.refetchQueries();
      showToastMessage({
        type: "success",
        message: `Deleted successfully`,
        position: "top-right",
      });
      onOpenChange();
      setLoading(false);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "An error occurred",
        position: "top-right",
      });
      setLoading(false);
    },
  });

  const handleDelete = () => {
    setLoading(true);
    deleteItem.mutate();
  };

  return (
    <>
      <FiDelete onClick={onOpen} />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Confirmation
              </ModalHeader>
              <ModalBody>Are you sure you want to delete {name}?</ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={loading}
                >
                  Delete
                </Button>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
