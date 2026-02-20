import React, { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Spacer,
} from "@nextui-org/react";
import { postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { toast } from "sonner";

interface AddToCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
    productVariantId: string;
    baseRateId: string;
    basePrice: number;
    productName: string;
}

const AddToCatalogModal: React.FC<AddToCatalogModalProps> = ({
    isOpen,
    onClose,
    productVariantId,
    baseRateId,
    basePrice,
    productName,
}) => {
    const [loading, setLoading] = useState(false);
    const [margin, setMargin] = useState<number>(0);

    const sellingPrice = Number(basePrice) + Number(margin);

    const handleAddToCatalog = async () => {
        try {
            setLoading(true);
            const payload = {
                productVariantId,
                baseRateId,
                margin: Number(margin),
            };

            const response = await postData(apiRoutes.catalog.add, payload);

            if (response.data.success) {
                toast.success("Product added to your catalog!");
                onClose();
            } else {
                toast.error(response.data.message || "Failed to add product");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} placement="center">
            <ModalContent>
                <ModalHeader>Add to My Catalog</ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <div>
                            <p className="text-small text-default-500">Product</p>
                            <p className="font-semibold">{productName}</p>
                        </div>

                        <div className="flex gap-4">
                            <Input
                                label="Base Price"
                                value={basePrice.toString()}
                                isReadOnly
                                variant="flat"
                                className="opacity-70"
                                description="Includes Admin Commission"
                            />
                            <Input
                                label="Your Commission"
                                type="number"
                                placeholder="0"
                                value={margin.toString()}
                                onValueChange={(val) => setMargin(Number(val))}
                                description="Add your own profit margin"
                            />
                        </div>

                        <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                            <p className="text-tiny text-primary-600 font-medium">Final Selling Price</p>
                            <p className="text-xl font-bold text-primary-700">₹{sellingPrice.toFixed(2)}</p>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" color="danger" onPress={onClose}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        isLoading={loading}
                        onPress={handleAddToCatalog}
                    >
                        Add to Catalog
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddToCatalogModal;
