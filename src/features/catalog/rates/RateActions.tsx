"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button, Switch, Tooltip, useDisclosure } from "@nextui-org/react";
import { FiCheckCircle, FiPlusCircle } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchData } from "@/core/api/apiHandler";
import { apiRoutesByRole } from "@/utils/tableValues";
import { invalidateListingQueries } from "@/utils/listingQueryCache";
import { normalizeApiError } from "@/core/api/apiErrors";
import { showToastMessage } from "@/utils/utils";
import { LISTING_ACTION_CLASS } from "./constants";
import type { RateRow } from "./domain";

const AddToCatalogModal = dynamic(
  () => import("@/components/dashboard/Catalog/AddToCatalogModal"),
  { ssr: false },
);

export type LiveStatusToggleProps = {
  variantRate: RateRow & { isLive?: boolean };
  refetchData?: () => void;
  apiEndpoint?: string;
  layout?: "stacked" | "inline";
};

export function LiveStatusToggle({
  variantRate, refetchData, apiEndpoint: endpoint, layout = "stacked",
}: LiveStatusToggleProps) {
  const [selected, setSelected] = useState(Boolean(variantRate.isLive));
  const queryClient = useQueryClient();
  useEffect(() => setSelected(Boolean(variantRate.isLive)), [variantRate.isLive]);

  const mutation = useMutation({
    mutationFn: (isLive: boolean) => patchData(`${endpoint || apiRoutesByRole.variantRate}/${String(variantRate._id)}`, { isLive }),
    onSuccess: () => {
      invalidateListingQueries(queryClient);
      refetchData?.();
    },
    onError: (error: unknown) => {
      setSelected(Boolean(variantRate.isLive));
      showToastMessage({ type: "error", message: normalizeApiError(error, "Unable to update listing status.").message, position: "top-right" });
    },
  });
  const label = selected ? "Live" : "Not live";
  return (
    <div className={layout === "inline" ? "flex min-w-0 items-center gap-3" : "flex min-w-[60px] flex-col items-center gap-1"}>
      {layout === "inline" && <p className={`m-0 text-[10px] font-black  tracking-widest ${selected ? "text-success-600" : "text-danger-500"}`}>{label}</p>}
      <Switch
        size="sm"
        color="success"
        isSelected={selected}
        isDisabled={mutation.isPending}
        onValueChange={(value) => { setSelected(value); mutation.mutate(value); }}
        aria-label={selected ? "Mark listing as not live" : "Mark listing as live"}
        classNames={{ wrapper: "ring-offset-background focus-visible:ring-2 focus-visible:ring-obaol-500/60" }}
      />
      {layout === "stacked" && <p className={`m-0 p-0 text-[10px] font-bold leading-none ${selected ? "text-success-500" : "text-danger-500"}`}>{label.toUpperCase()}</p>}
    </div>
  );
}

export type AddToCatalogActionProps = {
  rowItem: RateRow & { isAdded?: boolean; productVariantId?: unknown; rawBasePrice?: unknown; rate?: unknown };
  isPersonalCatalogMode?: boolean;
  onSuccess?: () => void;
};

export function AddToCatalogAction({ rowItem, isPersonalCatalogMode = false, onSuccess }: AddToCatalogActionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const productVariant = rowItem.productVariant;
  const productVariantRecord = productVariant && typeof productVariant === "object" ? productVariant as RateRow : {};
  return (
    <>
      <Tooltip content={rowItem.isAdded ? "Already in Catalog" : "Add to Catalog"} closeDelay={0}>
        <Button
          isIconOnly size="sm" variant="flat" color={rowItem.isAdded ? "success" : "primary"}
          onPress={onOpen} isDisabled={rowItem.isAdded}
          aria-label={rowItem.isAdded ? "Already in catalog" : "Add to catalog"}
          className={`${LISTING_ACTION_CLASS} p-0 ${rowItem.isAdded ? "opacity-70" : ""}`}
        >
          {rowItem.isAdded ? <FiCheckCircle size={20} className="text-success-600/80" /> : <FiPlusCircle size={20} className="text-blue-600/80" />}
        </Button>
      </Tooltip>
      {isOpen && <AddToCatalogModal
        isOpen={isOpen} onClose={onClose} onSuccess={onSuccess}
        productVariantId={String(rowItem.productVariantId || productVariantRecord._id || "")}
        baseRateId={String(rowItem._id || "")}
        basePrice={Number(rowItem.rawBasePrice || rowItem.rate || 0)}
        productName={typeof productVariant === "string" ? productVariant : "Product"}
        isPersonalCatalogMode={isPersonalCatalogMode}
      />}
    </>
  );
}
