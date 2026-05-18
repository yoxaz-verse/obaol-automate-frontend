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
import { FiTrash2, FiAlertTriangle } from "react-icons/fi";
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
  isOpen: controlledOpen,
  onClose: controlledClose,
}: DeleteModalProps & { triggerText?: string; triggerColor?: any; refetchData?: () => void }) {
  const { isOpen: disclosureOpen, onOpen, onOpenChange: disclosureOnOpenChange } = useDisclosure();
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : disclosureOpen;
  const onOpenChange = isControlled ? controlledClose : disclosureOnOpenChange;

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
      {!isControlled && (
        <div className="flex items-center">
          {triggerText ? (
            <Button size="sm" color={triggerColor} variant="flat" onPress={onOpen}>
              {triggerText}
            </Button>
          ) : (
            <Tooltip color="danger" content="Remove Record" closeDelay={0}>
              <span
                onClick={onOpen}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-danger-500/10 hover:bg-danger-500/20 cursor-pointer active:opacity-50 group transition-all"
              >
                <FiTrash2 size={20} className="text-danger-500/80 group-hover:text-danger-600 transition-colors" />
                <div className="h-[2px]" />
              </span>
            </Tooltip>
          )}
        </div>
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="sm"
        placement="center"
        backdrop="blur"
        classNames={{
          wrapper: "z-[1200]",
          backdrop: "z-[1190] bg-background/80 backdrop-blur-md",
          base: "mx-4 mb-24 sm:mb-0 bg-background/90 border border-danger-500/20 backdrop-blur-3xl shadow-2xl rounded-2xl",
          header: "border-b border-danger-500/10 py-4 px-6",
          body: "py-6 px-6",
          footer: "border-t border-danger-500/10 py-4 px-6 bg-danger-500/5",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-danger-500">
                  <FiAlertTriangle size={24} className="animate-pulse" />
                  <span className="text-lg font-black uppercase tracking-wider">Confirm Deletion</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-sm text-default-500 font-medium leading-relaxed">
                  Are you absolutely sure you want to delete <span className="text-foreground font-bold">{name}</span>?
                </p>
                <p className="text-[11px] text-danger-400 mt-1 uppercase tracking-wider font-semibold">
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button 
                  className="w-full sm:w-auto font-bold tracking-wider" 
                  variant="flat" 
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full sm:w-auto font-black tracking-widest uppercase text-[11px] shadow-lg shadow-danger-500/30"
                  color="danger"
                  onPress={handleDelete}
                  isLoading={loading}
                  startContent={!loading && <FiTrash2 size={16} />}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
