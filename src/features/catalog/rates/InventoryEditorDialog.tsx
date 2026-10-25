"use client";

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getData, postData } from "@/core/api/apiHandler";
import { associateRoutes, inventoryRoutes } from "@/core/api/apiRoutes";
import { normalizeApiError } from "@/core/api/apiErrors";
import { showToastMessage } from "@/utils/utils";
import { adaptRows } from "./adapters";
import type { RateRow, UnknownRecord } from "./domain";

interface InventoryRate extends RateRow {
  product?: unknown; productId?: unknown; productVariant?: unknown; productVariantId?: unknown;
  companyId?: unknown; associateCompany?: unknown; associateId?: unknown; associate?: unknown;
  stateId?: unknown; state?: unknown; districtId?: unknown; district?: unknown;
  divisionId?: unknown; division?: unknown; pincodeEntryId?: unknown; pincodeEntry?: unknown;
}
interface Props {
  rate: InventoryRate | null;
  companyId?: string | null;
  onClose: () => void;
  onCreated?: () => void;
}
const nested = (value: unknown, key: string) => value && typeof value === "object" ? (value as UnknownRecord)[key] : undefined;
const id = (direct: unknown, populated: unknown) => direct || nested(populated, "_id") || populated || undefined;

export const InventoryEditorDialog = ({ rate, companyId, onClose, onCreated }: Props) => {
  const client = useQueryClient();
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const close = () => { if (!submitting) { setQuantity(""); onClose(); } };
  const create = async () => {
    if (!rate) return;
    const amount = Number(quantity);
    if (!amount || Number.isNaN(amount) || amount <= 0) return showToastMessage({ type: "error", message: "Enter a valid quantity in MT.", position: "top-right" });
    setSubmitting(true);
    try {
      const resolvedCompany = id(rate.companyId, rate.associateCompany) || companyId;
      let associate = id(rate.associateId, rate.associate);
      if (!associate && resolvedCompany) {
        const response = await getData(associateRoutes.getAll, { associateCompany: resolvedCompany, limit: 1 });
        const row = adaptRows<UnknownRecord>(response)[0];
        associate = row?._id || row?.id;
      }
      if (!associate) {
        showToastMessage({ type: "error", message: "No associate found for this company.", position: "top-right" });
        return;
      }
      const variant = rate.productVariant;
      await postData(inventoryRoutes.getAll, {
        productVariant: id(rate.productVariantId, variant),
        product: rate.productId || nested(nested(variant, "product"), "_id") || nested(variant, "product"),
        associateCompany: resolvedCompany,
        associate,
        state: id(rate.stateId, rate.state), district: id(rate.districtId, rate.district),
        division: id(rate.divisionId, rate.division), pincodeEntry: id(rate.pincodeEntryId, rate.pincodeEntry),
        quantity: amount, unit: "MT",
      });
      await client.invalidateQueries({ queryKey: ["inventory-status"] });
      setQuantity(""); onClose(); onCreated?.();
      showToastMessage({ type: "success", message: "Stock added successfully.", position: "top-right" });
    } catch (error: unknown) {
      showToastMessage({ type: "error", message: normalizeApiError(error, "Unable to add stock. Please try again.").message, position: "top-right" });
    } finally { setSubmitting(false); }
  };
  const product = typeof rate?.product === "string" ? rate.product : "—";
  const variant = typeof rate?.productVariant === "string" ? rate.productVariant : String(nested(rate?.productVariant, "name") || "Standard");
  return (
    <Modal isOpen={Boolean(rate)} onOpenChange={(open) => { if (!open) close(); }} isDismissable={!submitting} size="md">
      <ModalContent className="border border-divider bg-gradient-to-br from-background to-content1">
        <ModalHeader className="flex gap-3 border-b border-divider px-6 pb-4"><div className="rounded-xl bg-warning/10 p-2 text-obaol-500">▣</div><div><h3 className="text-base font-black">Add Stock</h3><p className="text-[10px] font-bold  tracking-widest text-default-400">Stock in Metric Tonnes (MT)</p></div></ModalHeader>
        <ModalBody className="flex flex-col gap-4 px-6 py-5">
          {rate && <div className="flex items-center justify-between gap-3 rounded-xl border border-divider/30 bg-default-100/50 p-3"><div className="min-w-0"><span className="block text-[10px] font-black  tracking-widest text-default-400">Product</span><span className="truncate text-sm font-bold">{product}</span></div><div className="shrink-0 rounded-xl border border-warning/20 bg-warning/10 px-3 py-1.5 text-xs font-black text-obaol-600">{variant}</div></div>}
          <Input size="sm" label="Quantity (MT)" type="number" value={quantity} onValueChange={setQuantity} placeholder="e.g. 10" isDisabled={submitting} variant="bordered" labelPlacement="outside" startContent={<span className="text-sm font-semibold text-default-400">MT</span>} description="Enter the quantity available at this location in Metric Tonnes." />
          <div className="rounded-xl border border-divider/20 bg-default-100/40 px-3 py-2.5 text-xs text-default-400">Location, state, and district will be inherited from the rate record.</div>
        </ModalBody>
        <ModalFooter className="gap-2 border-t border-divider px-6 py-3"><Button size="sm" variant="flat" onPress={close} isDisabled={submitting}>Cancel</Button><Button size="sm" color="warning" isLoading={submitting} className="font-bold" onPress={() => void create()}>Add Stock</Button></ModalFooter>
      </ModalContent>
    </Modal>
  );
};
