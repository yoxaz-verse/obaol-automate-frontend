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
import { apiRoutes } from "@/core/api/apiRoutes";
import { normalizeApiError } from "@/core/api/apiErrors";

type QuickCreateWarehouseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ownerCompanyId?: string | null;
  onCreated: (warehouse: any) => void | Promise<void>;
};

export default function QuickCreateWarehouseModal({
  isOpen,
  onClose,
  ownerCompanyId,
  onCreated,
}: QuickCreateWarehouseModalProps) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) return;
    setName("");
    setCity("");
    setPhone("");
    setError("");
    setSubmitting(false);
  }, [isOpen]);

  const submit = async () => {
    const warehouseName = name.trim();
    const warehouseCity = city.trim();
    const contactPhone = phone.trim();
    if (!warehouseName || !warehouseCity || !contactPhone) {
      setError("Warehouse name, city, and contact phone are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await postData(apiRoutes.warehouses.create, {
        name: warehouseName,
        contactPhone,
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
      await onCreated(warehouse);
      onClose();
    } catch (submissionError) {
      setError(normalizeApiError(submissionError, "Unable to create the warehouse. Please try again.").message);
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
          <Input label="Warehouse name" value={name} onValueChange={(value) => { setName(value); setError(""); }} isRequired isDisabled={submitting} variant="bordered" />
          <Input label="City" value={city} onValueChange={(value) => { setCity(value); setError(""); }} isRequired isDisabled={submitting} variant="bordered" />
          <Input label="Contact phone" value={phone} onValueChange={(value) => { setPhone(value); setError(""); }} isRequired isDisabled={submitting} type="tel" inputMode="tel" variant="bordered" />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={submitting}>Cancel</Button>
          <Button color="primary" onPress={submit} isLoading={submitting}>Create Warehouse</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

