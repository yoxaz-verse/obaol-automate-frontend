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
import { DeleteModalProps } from "@/data/interface-data";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function DeleteModal({
  _id,
  name,
  queryKey,
  deleteApiEndpoint,
  useBody = false,
  triggerText,
  triggerColor = "danger",
  refetchData,
}: DeleteModalProps & { triggerText?: string; triggerColor?: any; refetchData?: () => void }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const deleteItem = useMutation({
    mutationFn: async () =>
      deleteData(`${deleteApiEndpoint}/${_id}`, useBody ? { _id } : undefined),

    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey,
      });
      if (refetchData) refetchData();
      showToastMessage({
        type: "success",
        message: `Removed successfully`,
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
      <div className="flex items-center">
        {triggerText ? (
          <Button size="sm" color={triggerColor} variant="flat" onPress={onOpen}>
            {triggerText}
          </Button>
        ) : (
          <RiDeleteBin6Line
            onClick={onOpen}
            className="text-[24px] text-gray-300 hover:text-red-600"
          />
        )}
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Delete Confirmation{/* Translate */}
              </ModalHeader>
              <ModalBody>Are you sure you want to delete {name}?</ModalBody>
              {/* Translate */}
              <ModalFooter>
                <Button
                  color="danger"
                  onPress={handleDelete}
                  isLoading={loading}
                >
                  Delete{/* Translate */}
                </Button>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cancel {/* Translate */}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
