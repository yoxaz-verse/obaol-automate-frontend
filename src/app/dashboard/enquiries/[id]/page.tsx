"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes"; // meaningful abstraction
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Divider,
    Progress,
    useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const STATUS_STEPS = ["Pending", "Converted", "Completed", "Cancelled"];

export default function EnquiryDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [conversionNote, setConversionNote] = useState("");

    // Fetch Enquiry Data
    const { data: enquiry, isLoading } = useQuery({
        queryKey: ["enquiry", id],
        queryFn: () => getData(`${apiRoutes.enquiry.getAll}/${id}`),
        select: (res) => res?.data?.data,
    });

    // Convert to Order Mutation
    const convertMutation = useMutation({
        mutationFn: async () => {
            // 1. Create Order
            const orderRes = await postData(apiRoutes.orders.create, {
                enquiry: id,
                status: "Procuring",
                notes: conversionNote,
                customer: enquiry.customer, // Link customer
                product: enquiry.productVariant?.product?._id,
                variant: enquiry.productVariant?._id,
                quantity: enquiry.details?.quantity || 1,
            });
            const orderId = orderRes?.data?.data?._id;

            // 2. Update Enquiry Status
            await patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                status: "Converted",
                order: orderId,
                history: [
                    ...(enquiry.history || []),
                    { status: "Converted", note: conversionNote, timestamp: new Date() },
                ],
            });

            return orderId;
        },
        onSuccess: (orderId) => {
            toast.success("Enquiry converted to Order!");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
            router.push(`/dashboard/orders/${orderId}`);
        },
        onError: () => {
            toast.error("Failed to convert enquiry.");
        },
    });

    // Update Status Mutation (General)
    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: string) =>
            patchData(`${apiRoutes.enquiry.getAll}/${id}`, {
                status: newStatus,
                history: [
                    ...(enquiry.history || []),
                    { status: newStatus, note: `Status changed to ${newStatus}`, timestamp: new Date() },
                ],
            }),
        onSuccess: () => {
            toast.success("Status updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["enquiry", id] });
        },
        onError: () => {
            toast.error("Failed to update status.");
        },
    });

    if (isLoading) return <div className="flex items-center justify-center h-screen"><Progress isIndeterminate className="max-w-md" /></div>;
    if (!enquiry) return <div className="p-10 text-center">Enquiry not found</div>;

    const currentStepIndex = STATUS_STEPS.indexOf(enquiry.status) !== -1
        ? STATUS_STEPS.indexOf(enquiry.status)
        : 0;

    // Extract Handling Details
    const assignedEmployeeObj = enquiry.associateCompany?.assignedEmployee ||
        enquiry.variantRate?.associateCompany?.assignedEmployee ||
        enquiry.productAssociate?.associateCompany?.assignedEmployee;

    const assignedEmployeeName = assignedEmployeeObj?.name || "Not Assigned";
    const associateCompany = enquiry.associateCompany?.name ||
        enquiry.productAssociate?.associateCompany?.name ||
        "N/A";

    // Financial Calculations
    const quantity = enquiry.quantity || 0;
    const rate = enquiry.rate || enquiry.variantRate?.rate || 0;
    const commission = enquiry.commission || enquiry.variantRate?.commission || 0;

    const tradeVolume = (quantity * rate).toLocaleString();
    const estimatedProfit = (quantity * commission).toLocaleString();

    return (
        <div className="w-full p-6 flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header & Status */}
            <Card className="w-full shadow-md border-none bg-gradient-to-r from-content1 to-default-50">
                <CardHeader className="flex justify-between items-start px-6 py-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight">Enquiry #{(Array.isArray(id) ? id[0] : id)?.slice(-6).toUpperCase()}</h1>
                            <Chip
                                color={enquiry.status === "Converted" ? "success" : enquiry.status === "Cancelled" ? "danger" : "warning"}
                                variant="shadow"
                                size="sm"
                                className="font-bold"
                            >
                                {enquiry.status}
                            </Chip>
                        </div>
                        <span className="text-default-500 text-sm font-medium">
                            Submitted on {dayjs(enquiry.createdAt).format("DD MMM YYYY, hh:mm A")}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {enquiry.status === "Pending" && (
                            <Button
                                color="secondary"
                                variant="flat"
                                onPress={() => updateStatusMutation.mutate("Quoted")}
                                isLoading={updateStatusMutation.isPending}
                            >
                                Mark as Quoted
                            </Button>
                        )}
                        {enquiry.status === "Quoted" && (
                            <Button color="primary" variant="shadow" onPress={onOpen}>
                                Convert to Order
                            </Button>
                        )}
                        {enquiry.status === "Converted" && (
                            <div className="flex gap-2">
                                <Button
                                    color="success"
                                    variant="flat"
                                    onPress={() => updateStatusMutation.mutate("Completed")}
                                    isLoading={updateStatusMutation.isPending}
                                >
                                    Complete Enquiry
                                </Button>
                                <Button
                                    color="secondary"
                                    variant="shadow"
                                    onPress={() => router.push(`/dashboard/orders/${enquiry.order}`)}
                                >
                                    View Order
                                </Button>
                            </div>
                        )}
                        {enquiry.status !== "Cancelled" && enquiry.status !== "Completed" && (
                            <Button
                                color="danger"
                                variant="light"
                                onPress={() => updateStatusMutation.mutate("Cancelled")}
                                isLoading={updateStatusMutation.isPending}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-6 py-10">
                    {/* Status Stepper */}
                    <div className="relative flex items-center justify-between w-full mb-12 px-4">
                        <div className="absolute top-[15px] left-0 w-full h-[2px] bg-default-200 -z-0" />
                        <div
                            className="absolute top-[15px] left-0 h-[2px] bg-success transition-all duration-1000 -z-0"
                            style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                        {STATUS_STEPS.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <div key={step} className="flex flex-col items-center gap-3 bg-transparent relative z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCurrent ? "border-primary bg-primary text-white scale-110 shadow-lg" :
                                        isCompleted ? "border-success bg-success text-white" :
                                            "border-default-300 bg-content1 text-default-300"
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span className={`text-xs uppercase tracking-widest font-bold ${isCurrent ? "text-primary shadow-sm" :
                                        isCompleted ? "text-success" :
                                            "text-default-400"
                                        }`}>{step}</span>
                                </div>
                            )
                        })}
                    </div>
                </CardBody>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Info */}
                <Card className="md:col-span-1 shadow-sm border-none">
                    <CardHeader className="font-bold text-lg px-6 pt-6">Customer & Contact</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-5 px-6 pb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Customer Name</span>
                            <span className="font-semibold text-lg">{enquiry.name}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Phone Number</span>
                            <span className="font-medium text-primary hover:underline cursor-pointer">{enquiry.phoneNumber}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Email Address</span>
                            <span className="font-medium">{enquiry.email || "N/A"}</span>
                        </div>
                    </CardBody>
                </Card>

                {/* Product Info */}
                <Card className="md:col-span-1 shadow-sm border-none">
                    <CardHeader className="font-bold text-lg px-6 pt-6">Product Details</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-5 px-6 pb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Rate / Unit</span>
                            <span className="font-bold text-success text-xl">{enquiry.rate || enquiry.variantRate?.rate || "N/A"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Quantity (MT)</span>
                            <span className="font-bold text-lg">{enquiry.quantity || 0} {enquiry.quantityUnit || "MT"}</span>
                        </div>
                    </CardBody>
                </Card>

                {/* Financial Insights */}
                <Card className="md:col-span-1 shadow-sm border-none bg-success-50/30">
                    <CardHeader className="font-bold text-lg px-6 pt-6">Financial Insights</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-5 px-6 pb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Trade Volume</span>
                            <span className="font-bold text-xl text-primary">₹ {tradeVolume}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Estimated Profit</span>
                            <span className="font-bold text-xl text-success">₹ {estimatedProfit}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Own Margin (Commission)</span>
                            <span className="font-medium">₹ {commission} / Unit</span>
                        </div>
                    </CardBody>
                </Card>

                {/* Handling & Associates */}
                <Card className="md:col-span-1 shadow-sm border-none">
                    <CardHeader className="font-bold text-lg px-6 pt-6">Handling & Associate</CardHeader>
                    <Divider className="my-2" />
                    <CardBody className="flex flex-col gap-5 px-6 pb-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Assigned Employee</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${assignedEmployeeName === "Not Assigned" ? "bg-danger" : "bg-primary animate-pulse"}`} />
                                <span className={`font-bold ${assignedEmployeeName === "Not Assigned" ? "text-danger" : "text-primary"}`}>{assignedEmployeeName}</span>
                            </div>
                            {assignedEmployeeName === "Not Assigned" && (
                                <Button size="sm" variant="flat" color="primary" className="mt-2 text-[10px] h-7">
                                    Assign Manually
                                </Button>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Associate Company</span>
                            <span className="font-medium">{associateCompany}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-default-400">Product Associate</span>
                            <span className="font-medium text-default-600">{enquiry.productAssociate?.name || "N/A"}</span>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Conversion Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Convert to Order</ModalHeader>
                            <ModalBody>
                                <p>Are you sure you want to convert this enquiry to an order? This will create a new tracking workflow.</p>
                                <Input
                                    label="Initial Notes"
                                    placeholder="Any specific instructions..."
                                    value={conversionNote}
                                    onValueChange={setConversionNote}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={() => convertMutation.mutate()} isLoading={convertMutation.isPending}>
                                    Confirm Conversion
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
