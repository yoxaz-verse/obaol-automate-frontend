"use client";

import React, { useState } from "react";
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
  onApply: (filters: Record<string, any>) => void; // Callback prop to send filters to the parent
}

const DynamicFilter: React.FC<DynamicFilterProps> = ({
  currentTable,
  formFields,
  onApply,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // State for managing filters dynamically
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Handle changes in filters
  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Remove a specific filter and trigger onApply
  const removeFilter = (key: string) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters[key];
      onApply(updatedFilters); // Trigger onApply with updated filters
      return updatedFilters;
    });
  };

  // Validate the filters before applying
  const isValidFilters = () => {
    for (const key in filters) {
      const value = filters[key];
      if (
        typeof value === "object" &&
        value !== null &&
        value.start &&
        !value.end
      ) {
        alert(`${key} has an invalid date range.`);
        return false;
      }
    }
    return true;
  };

  // Apply filters and send the payload to the parent component
  const applyFilters = () => {
    const payload: Record<string, any> = {};

    for (const key in filters) {
      const value = filters[key];
      if (Array.isArray(value)) {
        // Handle multiselect filters
        payload[key] = value;
      } else if (
        typeof value === "object" &&
        value !== null &&
        value.start &&
        value.end
      ) {
        // Ensure start and end are valid Date objects
        payload[key] = {
          start: value.start,
          end: value.end,
        };
      } else {
        // Handle other filter types (e.g., text, select)
        payload[key] = value;
      }
    }

    if (isValidFilters()) {
      onApply(payload); // Send filters to parent
      console.log("Payload to Send:", payload);
    }
  };

  // Render filters based on their type
  const renderFilter = (field: FormField) => {
    const { key, label, filterType, values } = field;

    switch (filterType) {
      case "text":
        return (
          <Input
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
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0];
              handleFilterChange(key, selectedKey || null);
            }}
          >
            {(values || []).map((option) => (
              <SelectItem key={String(option.key)} value={String(option.key)}>
                {option.value}
              </SelectItem>
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
            {(values || []).map((option) => (
              <SelectItem key={String(option.key)} value={String(option.key)}>
                {option.value}
              </SelectItem>
            ))}
          </Select>
        );
      case "date":
        return (
          <DateRangePicker
            label={label}
            defaultValue={filters[key] || null}
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
            aria-label={label}
            isSelected={filters[key] || false}
            onChange={(value) => handleFilterChange(key, value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-4">
      {/* Display applied filters as chips */}
      {/* Display applied filters as chips */}
      <div className="mb-4 flex flex-wrap gap-2 justify-end">
        {Object.entries(filters).map(([key, value]) => {
          const field = formFields.find((field) => field.key === key); // Find the corresponding form field
          const values = field?.values || []; // Get the options for the field

          const getLabel = (val: string) => {
            const option = values.find((item) => item.key === val); // Match key with options
            return option ? option.value : val; // Return the label or the value itself if no match is found
          };

          return (
            <Chip
              key={key}
              variant="bordered"
              color="primary"
              onClose={() => removeFilter(key)} // Remove filter on close
            >
              {capitalize(key)}:{" "}
              {Array.isArray(value)
                ? value.map(getLabel).join(", ") // For multiselect, map to labels
                : typeof value === "object" && value?.start
                ? `${new Date(value.start).toDateString()} - ${new Date(
                    value.end
                  ).toDateString()}` // For date ranges
                : getLabel(value)}{" "}
              {/* For select or single value, map to label */}
            </Chip>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onPress={onOpen} variant="ghost" color="primary">
          <IoFilterOutline />
          Filter
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {capitalize(currentTable)} Filter
              </ModalHeader>
              <ModalBody>
                {formFields.map((field) => (
                  <div key={field.key} className="">
                    {renderFilter(field)}
                  </div>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
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
