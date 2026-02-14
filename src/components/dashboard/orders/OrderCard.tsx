import React from "react";
import { Card, CardBody, CardFooter, CardHeader, Avatar, Button, Divider } from "@heroui/react";
import { FiTruck, FiCalendar, FiBox, FiPhone } from "react-icons/fi";
import OrderStatus from "./OrderStatus";

interface OrderCardProps {
    data: any;
    action?: React.ReactNode;
}

const OrderCard: React.FC<OrderCardProps> = ({ data, action }) => {
    // Extract data safely
    const product = data.enquiry?.productVariant?.product?.name || "Product";
    const variant = data.enquiry?.productVariant?.name || "Variant";
    const customer = data.enquiry?.name || "Customer";
    const company = data.enquiry?.associateCompany?.name || "Direct";
    const employee = data.enquiry?.associateCompany?.assignedEmployee?.name || "Unassigned";
    const date = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Recent";
    const status = data.status || "Procuring";
    const vehicleNo = data.logistics?.vehicleNo || "No Vehicle Info";
    const transportCompany = data.logistics?.transportCompany || "In-house";

    return (
        <Card className="w-full bg-content1 border border-default-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-col items-start pb-0 px-4 pt-4">
                <div className="flex justify-between w-full mb-2 items-start">
                    <div className="flex flex-col">
                        <h4 className="text-medium font-bold text-foreground leading-tight">{product}</h4>
                        <span className="text-tiny text-default-500 mt-0.5">{variant}</span>
                    </div>
                    <div className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-bold border border-primary-200 uppercase whitespace-nowrap ml-2">
                        {date}
                    </div>
                </div>
                <Divider className="my-1 opacity-50" />
            </CardHeader>

            <CardBody className="px-4 py-3 gap-3">
                {/* Customer Info */}
                <div className="flex items-start gap-3">
                    <Avatar
                        radius="sm"
                        size="sm"
                        name={customer[0]}
                        className="bg-primary-100 text-primary-600 font-bold"
                    />
                    <div>
                        <p className="text-sm font-bold text-foreground leading-tight">{customer}</p>
                        <p className="text-tiny text-default-500">{company}</p>
                    </div>
                </div>

                {/* Logistics Info */}
                <div className="bg-default-50 rounded-xl p-3 flex flex-col gap-2 border border-default-100">
                    <div className="flex items-center gap-2 text-default-600">
                        <FiTruck size={14} className="text-primary-500" />
                        <span className="text-xs font-semibold">{vehicleNo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-default-500">
                        <FiBox size={14} className="text-default-400" />
                        <span className="text-tiny italic">{transportCompany}</span>
                    </div>
                </div>

                {/* Handling Details */}
                <div className="flex flex-col gap-1">
                    <div className="text-[10px] text-default-400 uppercase tracking-wider font-bold">Assigned Handler</div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success-500" />
                        <span className="text-xs font-bold text-primary-600">{employee}</span>
                    </div>
                </div>
            </CardBody>

            <CardFooter className="gap-3 pt-0 px-4 pb-4 flex justify-between items-center">
                <OrderStatus status={status} />
                <div className="flex gap-2">
                    <Button size="sm" isIconOnly variant="flat" color="primary" className="rounded-full">
                        <FiPhone size={14} />
                    </Button>
                    {action}
                </div>
            </CardFooter>
        </Card>
    );
};

export default OrderCard;
