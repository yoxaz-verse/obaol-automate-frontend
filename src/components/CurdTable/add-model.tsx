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
        size="xl"
        className="!max-h-[90vh] sm:!max-h-[80vh] overflow-hidden"
        classNames={{
          closeButton: "text-foreground-500 hover:bg-default-100 active:bg-default-200",
        }}
        scrollBehavior="inside"
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col">
            <h5 className="font-extrabold text-yellow-500 text-[42px] m-0 p-0 opacity-20">
              Add new
            </h5>
            <h5 className="font-extrabold text-yellow-500 text-[54px] mt-2 p-0 opacity-40">
              {currentTable}
            </h5>
          </ModalHeader>
          <ModalBody>
            <div className=" w-full ">
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
