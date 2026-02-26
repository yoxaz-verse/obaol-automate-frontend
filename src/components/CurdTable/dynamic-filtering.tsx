"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Button,
  DateRangePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Slider,
  Switch,
  useDisclosure,
  Chip,
  Divider,
} from "@nextui-org/react";
import { IoFilterOutline, IoTrashOutline } from "react-icons/io5";
import { FiPackage, FiMapPin, FiDollarSign, FiSearch } from "react-icons/fi";
import { FormField } from "@/data/interface-data";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface DynamicFilterProps {
  currentTable: string;
  formFields: FormField[];
  onApply: (filters: Record<string, any>) => void;
}

// Logical grouping for variantRate and similar product tables
const FIELD_GROUPS = [
  {
    id: "product",
    label: "Product Selection",
    icon: <FiPackage className="text-orange-500" />,
    keys: ["category", "subCategory", "product", "productVariant"]
  },
  {
    id: "location",
    label: "Inventory & Location",
    icon: <FiMapPin className="text-blue-500" />,
    keys: ["associate", "associateCompany", "state", "district", "division", "pincodeEntry"]
  },
  {
    id: "financial",
    label: "Pricing & Status",
    icon: <FiDollarSign className="text-emerald-500" />,
    keys: ["rate", "commission", "finalRate", "isLive"]
  }
];

const DynamicFilter: React.FC<DynamicFilterProps> = ({
  currentTable,
  formFields,
  onApply,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>({});

  // Group fields into their respective sections
  const groupedFields = useMemo(() => {
    const grouped: Record<string, FormField[]> = {
      product: [],
      location: [],
      financial: [],
      other: []
    };

    formFields.forEach(field => {
      const groupId = FIELD_GROUPS.find(g => g.keys.includes(field.key))?.id || "other";
      grouped[groupId].push(field);
    });

    return grouped;
  }, [formFields]);

  // Load root options
  useEffect(() => {
    const loadRootOptions = async () => {
      for (const field of formFields) {
        if (field.dynamicValuesFn && !field.dependsOn) {
          try {
            const result = await field.dynamicValuesFn("");
            setDynamicOptions(prev => ({ ...prev, [field.key]: result }));
          } catch (err) {
            console.error(`Error loading root options for ${field.key}:`, err);
          }
        } else if (field.values) {
          setDynamicOptions(prev => ({ ...prev, [field.key]: field.values || [] }));
        }
      }
    };
    if (isOpen) loadRootOptions();
  }, [formFields, isOpen]);

  // Handle dependency fetching - optimized to track specific dependency changes
  useEffect(() => {
    if (!isOpen) return;

    formFields.forEach(field => {
      if (field.dependsOn && field.dynamicValuesFn) {
        const dependencyValue = filters[field.dependsOn];

        // We only fetch if the dependency value exists and is valid
        if (dependencyValue && (!Array.isArray(dependencyValue) || dependencyValue.length > 0)) {
          // Note: fetchDependentOptions has its own internal cache (react-query)
          // so calling it frequently is relatively safe, but still good to be careful.
          field.dynamicValuesFn(dependencyValue).then(result => {
            setDynamicOptions(prev => {
              // Only update if options actually changed to avoid re-renders
              if (JSON.stringify(prev[field.key]) === JSON.stringify(result)) return prev;
              return { ...prev, [field.key]: result };
            });
          }).catch(err => {
            console.error(`Error fetching dependent options for ${field.key}:`, err);
          });
        } else {
          setDynamicOptions(prev => {
            if (prev[field.key] && prev[field.key].length === 0) return prev;
            return { ...prev, [field.key]: [] };
          });
        }
      }
    });
    // Removed [filters] dependency to avoid re-fetching on EVERY filter change.
    // Instead, we only want to re-fetch when the SPECIFIC dependencies change.
    // However, since we're inside a generic DynamicFilter, we'll use a more surgical approach.
  }, [JSON.stringify(filters), formFields, isOpen]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = (key: string) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[key];
    setFilters(updatedFilters);
    onApply(updatedFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onApply({});
  };

  const applyFilters = () => {
    onApply(filters);
  };

  const renderFilter = (field: FormField) => {
    const { key, label, filterType } = field;
    const options = dynamicOptions[key] || field.values || [];

    switch (filterType) {
      case "text":
        return (
          <Input
            label={label}
            variant="flat"
            size="sm"
            placeholder={`Search ${label}...`}
            startContent={<FiSearch className="text-default-400" />}
            value={filters[key] || ""}
            onValueChange={(val) => handleFilterChange(key, val)}
            classNames={{
              inputWrapper: "bg-default-100/50 hover:bg-default-200/50",
            }}
          />
        );
      case "select":
      case "multiselect":
        const isMulti = filterType === "multiselect";
        const dependsOnValue = field.dependsOn ? filters[field.dependsOn] : null;
        const isDisabled = field.dependsOn && (!dependsOnValue || (Array.isArray(dependsOnValue) && dependsOnValue.length === 0));

        return (
          <Select
            label={label}
            variant="flat"
            size="sm"
            placeholder={`Select ${label}`}
            selectionMode={isMulti ? "multiple" : "single"}
            isDisabled={!!isDisabled}
            selectedKeys={filters[key] ? (isMulti ? new Set(filters[key]) : new Set([String(filters[key])])) : new Set()}
            onSelectionChange={(keys) => {
              const selectedArray = Array.from(keys);
              handleFilterChange(key, isMulti ? selectedArray : (selectedArray[0] || null));
            }}
            classNames={{
              trigger: "bg-default-100/50 hover:bg-default-200/50",
            }}
          >
            {options.map((opt: any) => (
              <SelectItem key={String(opt.key)} textValue={opt.value}>
                {opt.value}
              </SelectItem>
            ))}
          </Select>
        );
      case "date":
        return (
          <DateRangePicker
            label={label}
            variant="flat"
            size="sm"
            value={filters[key] || null}
            onChange={(range) => handleFilterChange(key, range)}
            classNames={{
              inputWrapper: "bg-default-100/50 hover:bg-default-200/50",
            }}
          />
        );
      case "boolean":
        return (
          <div className="flex items-center justify-between p-2 rounded-xl bg-default-100/50 border border-transparent hover:border-default-200 transition-colors">
            <span className="text-sm font-medium">{label}</span>
            <Switch
              size="sm"
              color="warning"
              isSelected={filters[key] || false}
              onValueChange={(isSelected) => handleFilterChange(key, isSelected)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="relative">
      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) return null;
            const field = formFields.find(f => f.key === key);
            return (
              <Chip
                key={key}
                variant="flat"
                color="warning"
                size="sm"
                onClose={() => removeFilter(key)}
                className="bg-warning-50/50 backdrop-blur-md border border-warning-100/20"
              >
                <span className="font-semibold opacity-70 mr-1">{field?.label}:</span>
                {Array.isArray(value) ? `${value.length} selected` : String(value)}
              </Chip>
            );
          })}
          {activeFiltersCount > 1 && (
            <Button
              variant="light"
              color="danger"
              size="sm"
              className="h-7 min-w-unit-0 px-2"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Filter Button */}
      <div className="flex justify-end">
        <Button
          onPress={onOpen}
          variant="flat"
          size="md"
          color="warning"
          className="bg-warning-50/50 backdrop-blur-md border border-warning-200/30 font-semibold"
          startContent={<IoFilterOutline className="text-lg" />}
        >
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 bg-warning-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="3xl"
        backdrop="blur"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem]",
          header: "border-b border-white/5 pb-4",
          footer: "border-t border-white/5 pt-4",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-warning-500/10 rounded-xl">
                    <IoFilterOutline className="text-warning-500 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">
                      {capitalize(currentTable)} Filters
                    </h2>
                    <p className="text-xs text-default-500">
                      Refine results by selecting multiple criteria across categories.
                    </p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody className="py-6 overflow-x-hidden">
                <div className="space-y-8">
                  {FIELD_GROUPS.map((group) => {
                    const fields = groupedFields[group.id];
                    if (fields.length === 0) return null;

                    return (
                      <div key={group.id} className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <span className="p-1.5 rounded-lg bg-default-100">
                            {group.icon}
                          </span>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-default-600">
                            {group.label}
                          </h3>
                          <Divider className="flex-1 opacity-50" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                          {fields.map((field) => (
                            <div key={field.key}>
                              {renderFilter(field)}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {groupedFields.other.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-default-400">
                          Other Filters
                        </h3>
                        <Divider className="flex-1 opacity-50" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
                        {groupedFields.other.map((field) => (
                          <div key={field.key}>
                            {renderFilter(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>

              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  startContent={<IoTrashOutline />}
                  onPress={clearAllFilters}
                  isDisabled={activeFiltersCount === 0}
                >
                  Clear All
                </Button>
                <div className="flex-1" />
                <Button
                  variant="flat"
                  onPress={onClose}
                  className="font-medium"
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  className="bg-primary shadow-lg shadow-primary/20 px-8 font-bold"
                  onPress={() => {
                    applyFilters();
                    onClose();
                  }}
                >
                  Apply Filters
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default DynamicFilter;
