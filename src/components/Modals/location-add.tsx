import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Tooltip, Input } from "@nextui-org/react";
import { FiDelete } from "react-icons/fi";
import { useMutation } from "@tanstack/react-query";
import { locationRoutes, userRoutes } from "@/core/api/apiRoutes";
import { queryClient } from "@/app/provider";
import { showToastMessage } from "@/utils/utils";
import { postData } from "@/core/api/apiHandler";

interface UserDeleteModalProps {
    _id: string,
    name: string,
    role: string,
}

export default function LocationAddModal(props: UserDeleteModalProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const addLocation = useMutation({
        mutationFn: async (data: any) => {
            return postData(locationRoutes.getAll, {}, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['locationData']
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

    function handleSubmit(e: any) {
        e.preventDefault();
        const formElement = e.target as HTMLFormElement;
        const inputs = formElement.querySelectorAll("input");
        // auto generate password
        const password = Math.random().toString(36).slice(-8);
        const data = {
            name: (inputs[0] as HTMLInputElement).value,
            email: (inputs[1] as HTMLInputElement).value,
            Role: (inputs[2] as HTMLInputElement).value,
            password: password,
            passwordConfirm: password
        }

        console.log(data);
        addLocation.mutate(data)

    }
    return (
        <>
            <FiDelete onClick={onOpen} />
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <form onSubmit={handleSubmit}>
                                <Input type='text' variant='bordered' required placeholder='Name' className='py-2' id='name' />
                                <Input type='email' variant='bordered' required placeholder='Email' className='py-2' id='target' />
                                
                                <div className='flex justify-end w-full mt-4'>
                                    <button className="w-[100px] bg-[#3EADEB] rounded-3xl text-white h-[38px] text-sm" type='submit'>Add</button>
                                </div>
                            </form>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
