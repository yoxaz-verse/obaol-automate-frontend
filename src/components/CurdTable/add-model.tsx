"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { LuPlus } from "react-icons/lu";
import { AddModalProps } from "@/data/interface-data";
import AddForm from "./add-form";

const AddModal: React.FC<AddModalProps> = ({
  name,
  currentTable,
  formFields,
  apiEndpoint,
  additionalVariable,
}) => {
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);

  return (
    <>
      <div className="flex justify-end pr-2 group">
        <Button
          size="sm"
          onPress={openModal}
          variant="flat"
          color="warning"
          className="font-bold tracking-tight px-4 h-9 rounded-xl hover:bg-warning-500 hover:text-white transition-all duration-200"
          startContent={<LuPlus className="text-lg font-black" />}
        >
          {name ? `Add ${name}` : `Create ${currentTable}`}
        </Button>
      </div>

      <Modal
        isOpen={open}
        onClose={closeModal}
        placement="top-center"
        size="3xl"
        className="!max-h-[92vh] overflow-hidden"
        classNames={{
          base: "border border-default-200/20 bg-content1/95 backdrop-blur-xl",
          header: "px-6 pt-5 pb-3 border-b border-default-200/20",
          body: "px-6 py-4",
          footer: "px-6 pb-4",
          closeButton: "text-foreground-500 hover:bg-default-100 active:bg-default-200",
        }}
        scrollBehavior="inside"
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h5 className="m-0 p-0 text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Add New {currentTable}
            </h5>
            <p className="m-0 p-0 text-sm text-default-500">
              Fill the required details and save to continue.
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="w-full">
              <AddForm
                name={name}
                currentTable={currentTable}
                formFields={formFields}
                apiEndpoint={apiEndpoint}
                additionalVariable={additionalVariable}
                onSuccess={closeModal}
              />
            </div>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddModal;
