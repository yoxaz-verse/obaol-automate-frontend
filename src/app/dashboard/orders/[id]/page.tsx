"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Divider,
    Select,
    SelectItem,
    Input,
    Textarea,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const ORDER_STATUSES = [
    "Procuring",
    "Loaded",
    "In Transit",
    "Arrived",
    "Unloading",
    "Completed",
    "Cancelled",
];

export default function OrderDetailsPage() {
    const { id } = useParams();
    const orderId = Array.isArray(id) ? id[0] : id;
    const queryClient = useQueryClient();
    const [logisticsList, setLogisticsList] = useState<any[]>([]);
    const [trackingId, setTrackingId] = useState("");

    // Fetch Order Data
    const { data: order, isLoading } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => getData(`${apiRoutes.orders.getAll}/${orderId}`),
        select: (res) => res?.data?.data,
        enabled: !!orderId,
    });

    // Update Status Mutation
    const updateMutation = useMutation({
        mutationFn: async (payload: any) => {
            return patchData(`${apiRoutes.orders.getAll}/${orderId}`, payload);
        },
        onSuccess: () => {
            toast.success("Order updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["order", id] });
        },
    });

    // Sync state with fetching data
    React.useEffect(() => {
        if (order) {
            setLogisticsList(order.logistics || []);
            setTrackingId(order.trackingId || "");
        }
    }, [order]);

    const handleStatusChange = (newStatus: string) => {
        updateMutation.mutate({ status: newStatus });
    };

    const handleGeneralUpdate = () => {
        updateMutation.mutate({ logistics: logisticsList, trackingId });
    }

    const addTruck = () => {
        setLogisticsList([...logisticsList, {
            vehicleNo: "",
            driverName: "",
            driverPhone: "",
            transportCompany: "",
            currentLocation: "",
            estimatedArrival: null
        }]);
    };

    const updateTruck = (index: number, field: string, value: any) => {
        const newList = [...logisticsList];
        newList[index] = { ...newList[index], [field]: value };
        setLogisticsList(newList);
    };

    const removeTruck = (index: number) => {
        setLogisticsList(logisticsList.filter((_, i) => i !== index));
    };

    if (isLoading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="w-full p-6 flex flex-col gap-6">
            {/* Header */}
            <Card className="w-full bg-gradient-to-r from-blue-900 to-slate-900 text-white">
                <CardHeader className="flex justify-between items-center px-6 py-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold">Order #{orderId?.slice(-6).toUpperCase()}</h1>
                        <span className="opacity-80">
                            Generated from Enquiry #{(order.enquiry?._id || order.enquiry)?.slice(-6).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Chip className="capitalize font-bold" color="primary" size="lg">
                            {order.status}
                        </Chip>
                        <span className="text-xs opacity-70">Last updated: {dayjs(order.updatedAt).fromNow()}</span>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Actions */}
                <Card className="lg:col-span-1">
                    <CardHeader className="font-bold text-lg">Workflow Actions</CardHeader>
                    <Divider />
                    <CardBody className="flex flex-col gap-4">
                        <Select
                            label="Update Status"
                            selectedKeys={[order.status]}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            {ORDER_STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </Select>

                        <Input
                            label="Internal Tracking ID"
                            placeholder="e.g. OBA-2024-X100"
                            value={trackingId}
                            onValueChange={setTrackingId}
                        />

                        <Button color="primary" variant="shadow" className="mt-2" onClick={handleGeneralUpdate} isLoading={updateMutation.isPending}>
                            Save Changes
                        </Button>
                    </CardBody>
                </Card>

                {/* Logistics Details */}
                <Card className="lg:col-span-2">
                    <CardHeader className="font-bold text-lg flex justify-between">
                        <span>Truck Loads & Dispatch</span>
                        <Button size="sm" color="secondary" variant="flat" onPress={addTruck}>+ Add Truck</Button>
                    </CardHeader>
                    <Divider />
                    <CardBody className="flex flex-col gap-8">
                        {logisticsList.length === 0 && (
                            <div className="text-center py-10 text-default-400 italic">
                                No trucks assigned to this order yet.
                            </div>
                        )}
                        {logisticsList.map((truck, index) => (
                            <div key={index} className="p-5 border border-default-200 rounded-2xl relative bg-default-50/50">
                                <div className="absolute top-4 right-4 text-xs font-bold text-default-300 uppercase">
                                    Truck #{index + 1}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <Input
                                        label="Vehicle Number"
                                        placeholder="e.g. KA-01-AB-1234"
                                        value={truck.vehicleNo}
                                        onValueChange={(v) => updateTruck(index, "vehicleNo", v)}
                                    />
                                    <Input
                                        label="Transport Company"
                                        placeholder="e.g. Fast Movers Ltd."
                                        value={truck.transportCompany}
                                        onValueChange={(v) => updateTruck(index, "transportCompany", v)}
                                    />
                                    <Input
                                        label="Driver Name"
                                        value={truck.driverName}
                                        onValueChange={(v) => updateTruck(index, "driverName", v)}
                                    />
                                    <Input
                                        label="Driver Phone"
                                        value={truck.driverPhone}
                                        onValueChange={(v) => updateTruck(index, "driverPhone", v)}
                                    />
                                    <Input
                                        label="Current Location"
                                        className="md:col-span-2"
                                        value={truck.currentLocation}
                                        onValueChange={(v) => updateTruck(index, "currentLocation", v)}
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button size="sm" color="danger" variant="light" onPress={() => removeTruck(index)}>Remove Truck</Button>
                                </div>
                            </div>
                        ))}
                    </CardBody>
                </Card>
            </div>

            {/* Documents Section (Initial Placeholder) */}
            <Card>
                <CardHeader className="font-bold text-lg">Documents & Invoices</CardHeader>
                <Divider />
                <CardBody>
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-default-300 rounded-lg text-default-500">
                        <p>Invoice Ninja Integration Pending</p>
                        <Button size="sm" variant="light" color="primary" className="mt-2">Upload Manually</Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
