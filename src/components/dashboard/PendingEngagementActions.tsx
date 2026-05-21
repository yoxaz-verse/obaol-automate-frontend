"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@nextui-org/react";
import { getData, patchData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

type Props = {
  user: any;
};

const hasInterest = (values: string[], keys: string[]) => {
  const normalized = new Set(values.map((v) => String(v || "").toUpperCase()));
  return keys.some((key) => normalized.has(String(key).toUpperCase()));
};

export default function PendingEngagementActions({ user }: Props) {
  const roleLower = String(user?.role || "").toLowerCase();
  const interests = Array.isArray(user?.companyInterests) ? user.companyInterests : [];
  const isAssociate = roleLower === "associate";
  const canSupplier = isAssociate && hasInterest(interests, ["SUPPLIER", "PROCUREMENT"]);
  const canLab = isAssociate && hasInterest(interests, ["QUALITY_TESTING"]);
  const canWarehouse = isAssociate && hasInterest(interests, ["WAREHOUSING"]);

  const [supplierOpen, setSupplierOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [warehouseOpen, setWarehouseOpen] = useState(false);

  const [selectedRateId, setSelectedRateId] = useState("");
  const [supplierMargin, setSupplierMargin] = useState("0");

  const [labName, setLabName] = useState("");
  const [labEmail, setLabEmail] = useState(String(user?.email || ""));
  const [labPhone, setLabPhone] = useState(String(user?.phone || ""));

  const [warehouseName, setWarehouseName] = useState("");
  const [warehousePhone, setWarehousePhone] = useState(String(user?.phone || ""));
  const [warehouseAddress, setWarehouseAddress] = useState("");

  const { data: marketplaceRatesRaw, isLoading: ratesLoading } = useQuery({
    queryKey: ["pending-supplier-marketplace-rates"],
    queryFn: async () => getData(apiRoutes.variantRate.getAll, { view: "marketplace", isLive: true, limit: 100 }),
    enabled: supplierOpen && canSupplier,
  });

  const marketplaceRates = useMemo(() => {
    const payload = marketplaceRatesRaw?.data?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }, [marketplaceRatesRaw]);

  const selectedRate = useMemo(
    () => marketplaceRates.find((row: any) => String(row?._id || "") === selectedRateId) || null,
    [marketplaceRates, selectedRateId]
  );

  const addCatalogMutation = useMutation({
    mutationFn: async () => {
      const productVariantId = selectedRate?.productVariant || selectedRate?.productVariantId?._id || selectedRate?.productVariantId;
      if (!selectedRate?._id || !productVariantId) throw new Error("Select a product first.");
      return postData(apiRoutes.catalog.add, {
        baseRateId: selectedRate._id,
        productVariantId,
        margin: Number(supplierMargin || 0),
      });
    },
    onSuccess: () => {
      showToastMessage({
        type: "success",
        message: "Saved now. Your product listing will be published automatically after approval.",
      });
      setSupplierOpen(false);
      setSelectedRateId("");
      setSupplierMargin("0");
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to save product listing." });
    },
  });

  const saveLabMutation = useMutation({
    mutationFn: async () => {
      const companyId = String(user?.associateCompanyId || "").trim();
      if (!companyId) throw new Error("Associate company is missing.");
      return patchData(`${apiRoutes.associateCompany.getAll}/${companyId}`, {
        isQualityLabListed: true,
        labDisplayName: labName.trim() || "Quality Lab",
        labContactEmail: labEmail.trim(),
        labContactPhone: labPhone.trim(),
      });
    },
    onSuccess: () => {
      showToastMessage({
        type: "success",
        message: "Lab details saved. They will be listed automatically after approval.",
      });
      setLabOpen(false);
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to save lab details." });
    },
  });

  const saveWarehouseMutation = useMutation({
    mutationFn: async () => {
      if (!warehouseName.trim()) throw new Error("Warehouse name is required.");
      if (!warehousePhone.trim()) throw new Error("Warehouse phone is required.");
      return postData(apiRoutes.warehouses.create, {
        name: warehouseName.trim(),
        contactPhone: warehousePhone.trim(),
        address: warehouseAddress.trim(),
      });
    },
    onSuccess: () => {
      showToastMessage({
        type: "success",
        message: "Warehouse details saved. It will be listed automatically after approval.",
      });
      setWarehouseOpen(false);
    },
    onError: (error: any) => {
      showToastMessage({ type: "error", message: error?.response?.data?.message || error?.message || "Unable to save warehouse details." });
    },
  });

  if (!canSupplier && !canLab && !canWarehouse) return null;

  return (
    <div className="mt-6 rounded-[1.5rem] border border-success-500/20 bg-success-500/8 p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-success-500">
        You can add now.
      </p>
      <p className="mt-2 text-[11px] font-semibold text-default-400">
        You can add details now. Your entries will be listed automatically after approval.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {canSupplier && (
          <Button className="bg-warning-500 text-black font-black uppercase tracking-[0.12em]" onPress={() => setSupplierOpen(true)}>
            List Your Products
          </Button>
        )}
        {canLab && (
          <Button className="bg-success-600 text-white font-black uppercase tracking-[0.12em]" onPress={() => setLabOpen(true)}>
            Add Lab Details
          </Button>
        )}
        {canWarehouse && (
          <Button className="bg-primary-600 text-white font-black uppercase tracking-[0.12em]" onPress={() => setWarehouseOpen(true)}>
            Add Warehouse Details
          </Button>
        )}
      </div>

      <Modal isOpen={supplierOpen} onClose={() => setSupplierOpen(false)}>
        <ModalContent>
          <ModalHeader>List Your Products</ModalHeader>
          <ModalBody>
            <Select
              label="Marketplace Product"
              selectedKeys={selectedRateId ? [selectedRateId] : []}
              onSelectionChange={(keys) => {
                if (keys === "all") return;
                const values = Array.from(keys as Set<React.Key>).map((k) => String(k));
                setSelectedRateId(values[0] || "");
              }}
              isLoading={ratesLoading}
            >
              {marketplaceRates.map((row: any) => {
                const productName = String(row?.productVariantId?.product?.name || "Product");
                const variantName = String(row?.productVariantId?.name || "Variant");
                const price = Number(row?.rate || 0);
                return (
                  <SelectItem key={String(row?._id || "")} textValue={`${productName} ${variantName}`}>
                    {`${productName} - ${variantName} (Base INR ${price})`}
                  </SelectItem>
                );
              })}
            </Select>
            <Input
              label="Your Margin (INR)"
              type="number"
              value={supplierMargin}
              onValueChange={setSupplierMargin}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setSupplierOpen(false)}>Cancel</Button>
            <Button color="warning" isLoading={addCatalogMutation.isPending} onPress={() => addCatalogMutation.mutate()}>
              Save Product Listing
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={labOpen} onClose={() => setLabOpen(false)}>
        <ModalContent>
          <ModalHeader>Add Lab Details</ModalHeader>
          <ModalBody>
            <Input label="Lab Display Name" value={labName} onValueChange={setLabName} />
            <Input label="Lab Email" value={labEmail} onValueChange={setLabEmail} />
            <Input label="Lab Phone" value={labPhone} onValueChange={setLabPhone} />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setLabOpen(false)}>Cancel</Button>
            <Button color="success" isLoading={saveLabMutation.isPending} onPress={() => saveLabMutation.mutate()}>
              Save Lab Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={warehouseOpen} onClose={() => setWarehouseOpen(false)}>
        <ModalContent>
          <ModalHeader>Add Warehouse Details</ModalHeader>
          <ModalBody>
            <Input label="Warehouse Name" value={warehouseName} onValueChange={setWarehouseName} />
            <Input label="Phone" value={warehousePhone} onValueChange={setWarehousePhone} />
            <Input label="Address" value={warehouseAddress} onValueChange={setWarehouseAddress} />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setWarehouseOpen(false)}>Cancel</Button>
            <Button color="primary" isLoading={saveWarehouseMutation.isPending} onPress={() => saveWarehouseMutation.mutate()}>
              Save Warehouse
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
