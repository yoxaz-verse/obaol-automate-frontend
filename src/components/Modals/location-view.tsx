import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { FiEye } from "react-icons/fi";
import Image from "next/image";
interface UserDeleteModalProps {
  isOpen: boolean,
  onOpenChange: () => any;
  data: {
    _id: string,
    name: string,
    description: string,
    imageId: {
      imageName: string
    }
  }
}
export default function LocationViewModal(props: UserDeleteModalProps) {

  return (
    <>
      <Modal size="2xl" isOpen={props.isOpen} onOpenChange={props.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-secondary">Location Details</ModalHeader>
              <ModalBody>
                <div className="flex justify-evenly w-full">
                  <div className="max-w-[500px] grid grid-cols-2 gap-5">
                    <div className="font-bold text-lg">Id:</div>
                    <div className=" text-lg">{props.data?._id}</div>
                    <div className="font-bold text-lg">Name:</div>
                    <div className=" text-lg">{props.data?.name}</div>
                    <div className="font-bold text-lg">Description:</div>
                    <div className=" text-lg">{props.data?.description}</div>
                  </div>
                  <div className="grid grid-row-2 gap-5">
                    <Image src={
                      `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/${props.data?.imageId?.imageName}`
                    } alt="image" width={1000} height={1000} className=" rounded-full " style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover"
                    }} />
                    <iframe src={"https://www.google.com/maps/embed/v1/place?q=Door+No:730+E+Abg+Tower+Mundakayam+P.O,+near+South+Indian+Bank,+Kerala+686513&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"} width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" className="w-full h-full"></iframe>
                  </div>
                </div>

              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
