"use client";

import React, { useEffect, useState } from "react";
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
} from "@nextui-org/react";
import { IoFilterOutline } from "react-icons/io5";
import { FormField } from "@/data/interface-data";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface DynamicFilterProps {
  currentTable: string;
  formFields: FormField[];
  onApply: (filters: Record<string, any>) => void;
}

const DynamicFilter: React.FC<DynamicFilterProps> = ({
  currentTable,
  formFields,
  onApply,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>(
    {}
  );

  // Load options that have dynamic functions and no dependencies
  useEffect(() => {
    const loadInitialOptions = async () => {
      const updatedOptions: Record<string, any[]> = {};
      for (const field of formFields) {
        if (field.dynamicValuesFn && !field.dependsOn) {
          const result = await field.dynamicValuesFn(""); // ✅ Pass empty string
          updatedOptions[field.key] = result;
        } else if (field.values) {
          updatedOptions[field.key] = field.values;
        }
      }
      setDynamicOptions(updatedOptions);
    };
    loadInitialOptions();
  }, [formFields]);

  // Fetch dependent dropdown values
  useEffect(() => {
    for (const field of formFields) {
      const fn = field.dynamicValuesFn;
      const dependencyKey = field.dependsOn;

      if (dependencyKey && filters[dependencyKey] && typeof fn === "function") {
        const fetchDependentValues = async () => {
          try {
            const result = await fn(filters[dependencyKey]);
            setDynamicOptions((prev) => ({ ...prev, [field.key]: result }));
          } catch (err) {
            console.error(
              `Error fetching dynamic values for ${field.key}:`,
              err
            );
          }
        };
        fetchDependentValues();
      }
    }
  }, [filters, formFields]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key: string) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters[key];
      onApply(updatedFilters);
      return updatedFilters;
    });
  };

  const isValidFilters = () => {
    for (const key in filters) {
      const value = filters[key];
      if (
        typeof value === "object" &&
        value !== null &&
        value.start &&
        !value.end
      ) {
        alert(`${capitalize(key)} has an invalid date range.`);
        return false;
      }
    }
    return true;
  };

  const applyFilters = () => {
    if (!isValidFilters()) return;

    const payload: Record<string, any> = {};
    for (const key in filters) {
      const value = filters[key];
      if (Array.isArray(value)) {
        payload[key] = value;
      } else if (
        typeof value === "object" &&
        value !== null &&
        value.start &&
        value.end
      ) {
        payload[key] = { start: value.start, end: value.end };
      } else {
        payload[key] = value;
      }
    }

    onApply(payload);
    console.log("Applied Filters Payload:", payload);
  };

  const renderFilter = (field: FormField) => {
    const { key, label, filterType } = field;
    const options = field.values || dynamicOptions[key] || [];

    switch (filterType) {
      case "text":
        return (
          <Input
            label={label}
            type="text"
            placeholder={`Search by ${label}`}
            value={filters[key] || ""}
            onChange={(e) => handleFilterChange(key, e.target.value)}
          />
        );
      case "select":
        return (
          <Select
            label={label}
            placeholder={`Select ${label}`}
            selectedKeys={filters[key] ? new Set([filters[key]]) : new Set()}
            onSelectionChange={(keys) =>
              handleFilterChange(key, Array.from(keys)[0] || null)
            }
          >
            {options.map((option) => (
              <SelectItem key={String(option.key)}>{option.value}</SelectItem>
            ))}
          </Select>
        );
      case "multiselect":
        return (
          <Select
            label={label}
            placeholder={`Select ${label}`}
            selectionMode="multiple"
            selectedKeys={filters[key] ? new Set(filters[key]) : new Set()}
            onSelectionChange={(keys) =>
              handleFilterChange(key, Array.from(keys))
            }
          >
            {options.map((option) => (
              <SelectItem key={String(option.key)}>{option.value}</SelectItem>
            ))}
          </Select>
        );
      case "date":
        return (
          <DateRangePicker
            label={label}
            value={filters[key] || null}
            onChange={(range) => handleFilterChange(key, range)}
          />
        );
      case "range":
        return (
          <Slider
            label={label}
            minValue={0}
            maxValue={1000}
            step={10}
            value={filters[key] || [100, 500]}
            onChange={(value) => handleFilterChange(key, value)}
          />
        );
      case "boolean":
        return (
          <Switch
            isSelected={filters[key] || false}
            onChange={(e) => handleFilterChange(key, e.target.checked)}
          >
            {label}
          </Switch>
        );
      default:
        return null;
    }
  };

  const renderChipValue = (key: string, value: any) => {
    const field = formFields.find((field) => field.key === key);
    const options = field?.values || dynamicOptions[key] || [];

    const getLabel = (val: any) => {
      const option = options.find((item) => item.key === val);
      return option?.value ?? String(val);
    };

    if (Array.isArray(value)) {
      return value.map(getLabel).join(", ");
    } else if (typeof value === "object" && value?.start && value?.end) {
      return `${new Date(value.start).toLocaleDateString()} - ${new Date(
        value.end
      ).toLocaleDateString()}`;
    } else if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    } else {
      return getLabel(value);
    }
  };

  return (
    <div className="my-4">
      <div className="mb-4 flex flex-wrap gap-2 justify-end">
        {Object.entries(filters).map(([key, value]) => (
          <Chip
            key={key}
            variant="bordered"
            color="primary"
            onClose={() => removeFilter(key)}
          >
            {capitalize(key)}: {renderChipValue(key, value)}
          </Chip>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onPress={onOpen} variant="ghost" color="primary">
          <IoFilterOutline className="mr-1" /> Filter
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{capitalize(currentTable)} Filters</ModalHeader>
              <ModalBody className="space-y-4">
                {formFields.map((field) => (
                  <div key={field.key}>{renderFilter(field)}</div>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    applyFilters();
                    onClose();
                  }}
                >
                  Apply
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
