"use client";

import React from "react";
import { Button, Input } from "@heroui/react";
import { FiSearch } from "react-icons/fi";
import { ClassificationTheme, resolveActiveClassificationTheme } from "@/utils/classificationTheme";

type MarketplaceTabKey = "marketplace-live" | "marketplace-offline";

export type MarketplaceFilterState = {
  search: string;
  filters: {
    location?: string;
    classifications?: string[];
  };
};

type Props = {
  activeTab: MarketplaceTabKey;
  state: MarketplaceFilterState;
  onStateChange: (next: MarketplaceFilterState) => void;
  activeTheme?: ClassificationTheme;
};

const MarketplaceFilterBar: React.FC<Props> = ({
  activeTab,
  state,
  onStateChange,
  activeTheme,
}) => {
  const resolvedTheme = activeTheme || resolveActiveClassificationTheme([]);
  const setSearch = (nextSearch: string) => {
    onStateChange({
      search: nextSearch,
      filters: { ...(state.filters || {}) },
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
    <div className={`mb-4 rounded-2xl border p-3 md:p-4 shadow-sm ${resolvedTheme.shellClass} ${resolvedTheme.shellBorderClass}`}>
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <Input
            size="sm"
            placeholder={`Search ${activeTab === "marketplace-live" ? "current listings" : "past listings"}...`}
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
