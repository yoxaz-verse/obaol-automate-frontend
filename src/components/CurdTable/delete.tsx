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
  Tooltip,
} from "@nextui-org/react";
import { FiTrash2 } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import { deleteData } from "@/core/api/apiHandler";
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";
import { DeleteModalProps } from "@/data/interface-data";

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
          <Tooltip color="danger" content="Delete">
            <span
              onClick={onOpen}
              className="flex flex-col items-center gap-1 cursor-pointer active:opacity-50 group hover:text-danger transition-colors"
            >
              <FiTrash2 size={18} className="text-default-400 group-hover:text-danger" />
              <div className="h-[10px]" /> {/* Spacer to align with LiveToggle status text */}
            </span>
          </Tooltip>
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
