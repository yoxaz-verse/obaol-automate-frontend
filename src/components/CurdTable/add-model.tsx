"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
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
      <div className="flex justify-end">
        <button
          className="min-w-[120px] px-2 bg-warning-400 rounded-lg text-white h-[35px] text-sm shadow-sm shadow-warning-200"
          onClick={openModal}
        >
          Add {name ?? ""}
        </button>
      </div>

      <Modal
        isOpen={open}
        onClose={closeModal}
        placement="top-center"
        size="xl"
        className="!max-h-[90vh] sm:!max-h-[80vh] overflow-hidden"
        scrollBehavior="inside"
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
