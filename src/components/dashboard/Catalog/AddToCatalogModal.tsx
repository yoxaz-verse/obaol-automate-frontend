import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useCurrency } from "@/context/CurrencyContext";

interface AddToCatalogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    productVariantId: string;
    baseRateId: string;
    basePrice: number;
    productName: string;
    isPersonalCatalogMode?: boolean;
}

const AddToCatalogModal: React.FC<AddToCatalogModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    productVariantId,
    baseRateId,
    basePrice,
    productName,
    isPersonalCatalogMode = false,
}) => {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [margin, setMargin] = useState<number>(0);
    const { selectedCurrency, exchangeRates, formatRate } = useCurrency();

    const exchangeRate = exchangeRates[selectedCurrency.toUpperCase()];
    const basePriceInINR = Number(basePrice) || 0;
    const basePriceInSelected =
        selectedCurrency === "inr" || !exchangeRate ? basePriceInINR : basePriceInINR * exchangeRate;
    const sellingPriceInSelected = basePriceInSelected + margin;
    const formatSelectedCurrency = (value: number) => {
        if (selectedCurrency === "inr") return formatRate(value);
        if (!exchangeRate) return "…";
        return `${selectedCurrency.toUpperCase()} ${value.toFixed(2)}`;
    };

    const handleAddToCatalog = async () => {
        try {
            setLoading(true);
            const marginInINR =
                selectedCurrency === "inr" || !exchangeRate ? margin : margin / exchangeRate;
            const payload = {
                productVariantId,
                baseRateId,
                margin: Number(marginInINR),
            };

            const response = await postData(apiRoutes.catalog.add, payload);

            if (response.data.success) {
                await queryClient.invalidateQueries({ queryKey: ["catalogItems"] });
                toast.success(
                    isPersonalCatalogMode
                        ? "Product added to your personal catalog!"
                        : "Product added to your catalog!"
                );
                onSuccess?.();
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
                                value={formatSelectedCurrency(basePriceInSelected)}
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

                        <p className="text-xs text-default-500">
                            {isPersonalCatalogMode
                                ? "This will be saved in your personal catalog until you link a company."
                                : "This will be saved in your company catalog."}
                        </p>

                        <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                            <p className="text-tiny text-primary-600 font-medium">Final Selling Price</p>
                            <p className="text-xl font-bold text-primary-700">{formatSelectedCurrency(sellingPriceInSelected)}</p>
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
