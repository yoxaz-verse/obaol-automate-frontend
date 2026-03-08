"use client";

import React from "react";
import { Button, Input } from "@heroui/react";
import { FiSearch } from "react-icons/fi";

type MarketplaceTabKey = "marketplace-live" | "marketplace-offline";

export type MarketplaceFilterState = {
  search: string;
  filters: Record<string, any>;
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
  const setSearch = (nextSearch: string) => {
    onStateChange({
      search: nextSearch,
      filters: {},
    });
  };

  const clearCurrentTab = () => {
    onStateChange({ search: "", filters: {} });
  };

  return (
    <div className="mb-4 rounded-2xl border border-default-200 bg-content1 p-3 md:p-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
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
        <div className="flex justify-end">
          <Button size="sm" variant="light" color="danger" onPress={clearCurrentTab}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilterBar;
