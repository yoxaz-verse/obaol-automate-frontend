"use client";

import React from "react";
import { Button, Input, Slider } from "@heroui/react";
import { FiSearch } from "react-icons/fi";

type MarketplaceTabKey = "marketplace-live" | "marketplace-offline";

export type MarketplaceFilterState = {
  search: string;
  filters: {
    minRate?: number;
    maxRate?: number;
    minQty?: number;
    maxQty?: number;
    location?: string;
  };
};

type Props = {
  activeTab: MarketplaceTabKey;
  state: MarketplaceFilterState;
  onStateChange: (next: MarketplaceFilterState) => void;
};

const MarketplaceFilterBar: React.FC<Props> = ({
  activeTab,
  state,
  onStateChange,
}) => {
  const rateRange: [number, number] = [
    Number(state?.filters?.minRate ?? 0),
    Number(state?.filters?.maxRate ?? 100000),
  ];
  const qtyRange: [number, number] = [
    Number(state?.filters?.minQty ?? 0),
    Number(state?.filters?.maxQty ?? 1000),
  ];

  const setSearch = (nextSearch: string) => {
    onStateChange({
      search: nextSearch,
      filters: { ...(state.filters || {}) },
    });
  };

  const setRateRange = (nextValue: number | number[]) => {
    if (!Array.isArray(nextValue)) return;
    onStateChange({
      search: state.search || "",
      filters: {
        ...(state.filters || {}),
        minRate: Number(nextValue[0] ?? 0),
        maxRate: Number(nextValue[1] ?? 100000),
      },
    });
  };

  const setQtyRange = (nextValue: number | number[]) => {
    if (!Array.isArray(nextValue)) return;
    onStateChange({
      search: state.search || "",
      filters: {
        ...(state.filters || {}),
        minQty: Number(nextValue[0] ?? 0),
        maxQty: Number(nextValue[1] ?? 1000),
      },
    });
  };

  const setLocation = (nextLocation: string) => {
    onStateChange({
      search: state.search || "",
      filters: {
        ...(state.filters || {}),
        location: nextLocation,
      },
    });
  };

  const clearCurrentTab = () => {
    onStateChange({ search: "", filters: {} });
  };

  return (
    <div className="mb-4 rounded-2xl border border-default-200 bg-content1 p-3 md:p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <Input
            size="sm"
            placeholder={`Search ${activeTab === "marketplace-live" ? "live" : "offline"} marketplace...`}
            startContent={<FiSearch className="text-default-400" />}
            value={state.search || ""}
            onValueChange={setSearch}
            isClearable
            onClear={() => setSearch("")}
            variant="flat"
            classNames={{
              inputWrapper: "bg-default-100/60",
            }}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-default-200 px-3 py-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-default-500">
              Price Range
            </p>
            <Slider
              size="sm"
              color="warning"
              step={100}
              minValue={0}
              maxValue={100000}
              value={rateRange}
              onChange={setRateRange}
              className="max-w-full"
            />
            <p className="mt-1 text-[11px] text-default-500">
              {rateRange[0]} - {rateRange[1]}
            </p>
          </div>
          <div className="rounded-xl border border-default-200 px-3 py-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-default-500">
              Size (Quantity)
            </p>
            <Slider
              size="sm"
              color="primary"
              step={1}
              minValue={0}
              maxValue={1000}
              value={qtyRange}
              onChange={setQtyRange}
              className="max-w-full"
            />
            <p className="mt-1 text-[11px] text-default-500">
              {qtyRange[0]} - {qtyRange[1]} MT
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="w-full">
            <Input
              size="sm"
              placeholder="Filter by location..."
              value={String(state?.filters?.location || "")}
              onValueChange={setLocation}
              variant="flat"
              classNames={{
                inputWrapper: "bg-default-100/60",
              }}
            />
          </div>
          <div className="flex justify-end">
          <Button size="sm" variant="light" color="danger" onPress={clearCurrentTab}>
            Clear
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilterBar;
