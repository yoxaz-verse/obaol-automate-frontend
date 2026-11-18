"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { LuWarehouse } from "react-icons/lu";
import { postData } from "@/core/api/apiHandler";
import { apiRoutes, inventoryRoutes } from "@/core/api/apiRoutes";
import { normalizeApiError } from "@/core/api/apiErrors";
import AsyncActionButton, { type AsyncActionState } from "@/components/ui/AsyncActionButton";
import ActionFeedback from "@/components/ui/ActionFeedback";

type WarehouseStockContext = {
  productId: string;
  productVariantId: string;
  productName: string;
  variantName?: string;
  associateId: string;
  associateCompanyId: string;
  initialQuantity: number;
  unit?: "MT";
};

export type QuickWarehouseStockResult = {
  inventory: any | null;
  quantity: number;
  error?: string;
};

type QuickCreateWarehouseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ownerCompanyId?: string | null;
  stockContext?: WarehouseStockContext | null;
  onCreated: (warehouse: any, stockResult?: QuickWarehouseStockResult) => void | Promise<void>;
};

export default function QuickCreateWarehouseModal({
  isOpen,
  onClose,
  ownerCompanyId,
  stockContext,
  onCreated,
}: QuickCreateWarehouseModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionState, setActionState] = useState<AsyncActionState>("idle");

  useEffect(() => {
    if (isOpen) {
      setQuantity(stockContext ? String(stockContext.initialQuantity || "") : "");
      return;
    }
    setName("");
    setCity("");
    setPhone("");
    setWhatsappPhone("");
    setQuantity("");
    setError("");
    setSubmitting(false);
    setActionState("idle");
  }, [isOpen, stockContext]);

  const submit = async () => {
    const warehouseName = name.trim();
    const warehouseCity = city.trim();
    const contactPhone = phone.trim();
    if (!warehouseName || !warehouseCity || !contactPhone) {
      setError("Warehouse name, city, and contact phone are required.");
      return;
    }
    const stockQuantity = Number(quantity);
    if (stockContext && (!quantity || !Number.isFinite(stockQuantity) || stockQuantity <= 0)) {
      setError("Available product quantity must be greater than 0 MT.");
      return;
    }

    setSubmitting(true);
    setActionState("processing");
    setError("");
    try {
      const response = await postData(apiRoutes.warehouses.create, {
        name: warehouseName,
        contactPhone,
        whatsappPhone: whatsappPhone.trim(),
        address: warehouseCity,
        category: "GENERAL",
        totalCapacity: 0,
        storageRatePerUnit: 0,
        unit: "MT",
        listingType: "PRIVATE",
        isRentalActive: false,
        isActive: true,
        ...(ownerCompanyId ? { ownerCompanyId } : {}),
      });
      const warehouse = response?.data?.data || response?.data;
      if (stockContext) {
        try {
          const inventoryResponse = await postData(inventoryRoutes.getAll, {
            product: stockContext.productId,
            productVariant: stockContext.productVariantId,
            associate: stockContext.associateId,
            associateCompany: stockContext.associateCompanyId,
            storageLocation: "MY",
            warehouseId: warehouse?._id || warehouse?.id,
            quantity: stockQuantity,
            unit: stockContext.unit || "MT",
          });
          const inventory = inventoryResponse?.data?.data || inventoryResponse?.data;
          await onCreated(warehouse, { inventory, quantity: stockQuantity });
        } catch (inventoryError) {
          const message = normalizeApiError(inventoryError, "Warehouse created, but its product stock could not be added.").message;
          await onCreated(warehouse, { inventory: null, quantity: stockQuantity, error: message });
        }
      } else {
        await onCreated(warehouse);
      }
      setActionState("success");
      window.setTimeout(onClose, 700);
    } catch (submissionError) {
      setError(normalizeApiError(submissionError, "Unable to create the warehouse. Please try again.").message);
      setActionState("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isDismissable={!submitting} isKeyboardDismissDisabled={submitting}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <LuWarehouse className="text-obaol-500" aria-hidden />
          Create Private Warehouse
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="rounded-xl border border-obaol-500/20 bg-obaol-500/5 px-3 py-2 text-xs leading-5 text-default-500">
            This warehouse is private to your company. It will not be published as a rental or trade listing. You can add its full address, map location, and capacity later in My Warehouses.
          </div>
          {error && (
            <div role="alert" className="rounded-xl border border-danger-300/40 bg-danger-500/10 px-3 py-2 text-sm text-danger-600">
              {error}
            </div>
          )}
          <ActionFeedback state={actionState}>
            {actionState === "processing" ? "Creating the warehouse and saving its stock…" : actionState === "success" ? "Warehouse created successfully." : null}
          </ActionFeedback>
          <Input label="Warehouse name" value={name} onValueChange={(value) => { setName(value); setError(""); }} isRequired isDisabled={submitting} variant="bordered" />
          <Input label="City" value={city} onValueChange={(value) => { setCity(value); setError(""); }} isRequired isDisabled={submitting} variant="bordered" />
          <Input label="Contact phone" value={phone} onValueChange={(value) => { setPhone(value); setError(""); }} isRequired isDisabled={submitting} type="tel" inputMode="tel" variant="bordered" />
          <Input label="WhatsApp number (optional)" description="Include the international country code" value={whatsappPhone} onValueChange={(value) => { setWhatsappPhone(value); setError(""); }} isDisabled={submitting} type="tel" inputMode="tel" variant="bordered" />
          {stockContext && (
            <div className="flex flex-col gap-3 rounded-xl border border-default-200/70 bg-default-50/60 p-3">
              <div>
                <div className="text-xs font-medium text-default-500">Selected product</div>
                <div className="font-semibold text-foreground">
                  {stockContext.productName}{stockContext.variantName ? ` • ${stockContext.variantName}` : ""}
                </div>
              </div>
              <Input
                label={`Available quantity in this warehouse (${stockContext.unit || "MT"})`}
                value={quantity}
                onValueChange={(value) => { setQuantity(value); setError(""); }}
                isRequired
                isDisabled={submitting}
                type="number"
                inputMode="decimal"
                min="0.01"
                step="any"
                variant="bordered"
                description="Enter the total quantity of this product currently available at this warehouse."
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={submitting}>Cancel</Button>
          <AsyncActionButton
            intent="primary"
            onPress={submit}
            state={actionState}
            labels={{ idle: "Create Warehouse", validating: "Checking Warehouse Details…", processing: "Creating Warehouse…", success: "Warehouse Created", error: "Unable to Create — Retry" }}
          />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

