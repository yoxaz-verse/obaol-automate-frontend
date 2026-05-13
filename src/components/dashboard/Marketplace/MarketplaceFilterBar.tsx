"use client";

import React from "react";
import { Button, Chip, Input } from "@heroui/react";
import { FiSearch } from "react-icons/fi";
import { ClassificationTheme, getClassificationOptions, getClassificationTheme, resolveActiveClassificationTheme } from "@/utils/classificationTheme";

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
  const resolvedTheme = activeTheme || resolveActiveClassificationTheme(state?.filters?.classifications || []);
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

  const classificationOptions = getClassificationOptions();

  const toggleClassification = (key: string) => {
    const prev = Array.isArray(state?.filters?.classifications) ? state.filters.classifications : [];
    const next = prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key];
    onStateChange({
      search: state.search || "",
      filters: {
        ...(state.filters || {}),
        classifications: next,
      },
    });
  };

  return (
    <div className={`mb-4 rounded-2xl border p-3 md:p-4 shadow-sm ${resolvedTheme.shellClass} ${resolvedTheme.shellBorderClass}`}>
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
        <div className="flex flex-wrap gap-2">
          {classificationOptions.map((option) => {
            const selected = (state?.filters?.classifications || []).includes(option.key);
            return (
              <Chip
                key={option.key}
                variant={selected ? "solid" : "flat"}
                color={selected ? "warning" : "default"}
                className={`cursor-pointer border transition-all duration-300 ${selected ? resolvedTheme.chipActiveClass : getClassificationTheme(option.key).chipIdleClass}`}
                onClick={() => toggleClassification(option.key)}
              >
                <span className="inline-flex items-center gap-1.5">
                  <option.icon size={13} className={getClassificationTheme(option.key).iconClass} />
                  <span>{option.label}</span>
                </span>
              </Chip>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilterBar;
