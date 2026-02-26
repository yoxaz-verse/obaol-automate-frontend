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
  AutocompleteItem,
  Autocomplete,
} from "@nextui-org/react";
import { IoFilterOutline } from "react-icons/io5";
import { FormField } from "@/data/interface-data";
import { toTitleCase } from "../titles";

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
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>(
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
    const updatedFilters = { ...filters };
    delete updatedFilters[key];

    setFilters(updatedFilters);
    setSelectedLabels((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });

    onApply(updatedFilters); // 🔥 Ensure parent's query logic is triggered
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | {
        target: { name: string; show: string | null; value: string | number };
      }
  ) => {
    const { name, value } = e.target;
    const show = "show" in e.target ? e.target.show : null;

    setFilters((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (show) {
      setSelectedLabels((prev) => ({
        ...prev,
        [name]: show, // This is the display label (e.g. category name or user name)
      }));
    }

    // Update dependent fields if any
    formFields.forEach(async (field) => {
      if (
        field.dependsOn === name &&
        typeof field.dynamicValuesFn === "function"
      ) {
        const updatedValues = await field.dynamicValuesFn(String(value));
        setDynamicOptions((prev) => ({
          ...prev,
          [field.key]: updatedValues,
        }));

        setFilters((prevData) => ({
          ...prevData,
          [field.key]: "",
        }));

        setSelectedLabels((prev) => ({
          ...prev,
          [field.key]: "",
        }));
      }
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
        const dependsOnValue = field.dependsOn
          ? filters[field.dependsOn]
          : null;
        const isDisabled = field.dependsOn && !dependsOnValue;

        const options =
          field.dependsOn && dynamicOptions[field.key]
            ? dynamicOptions[field.key]
            : field.dynamicValuesFn
              ? dynamicOptions[field.key] || []
              : field.values || [];

        return (
          // @ts-ignore
          <Autocomplete
            aria-label={`Select ${field.label}`}
            name={field.key}
            className="w-full text-foreground"
            label={field.label}
            placeholder={`Select ${field.label}`}
            isDisabled={!!isDisabled}
            defaultItems={options}
            selectedKey={filters[field.key] ? String(filters[field.key]) : ""}
            onSelectionChange={(key: any) => {
              const selectedItem = options.find((opt: any) => String(opt.key) === String(key));
              handleInputChange({
                target: {
                  name: field.key,
                  value: key,
                  show: selectedItem ? selectedItem.value : ""
                }
              });
            }}
          >
            {(item: any) => (
              <AutocompleteItem key={String(item.key)} className="text-foreground">
                {item.value}
              </AutocompleteItem>
            )}
          </Autocomplete>
        );
      // case "multiselect":
      //   return (
      //     <Select
      //       label={label}
      //       placeholder={`Select ${label}`}
      //       selectionMode="multiple"
      //       selectedKeys={filters[key] ? new Set(filters[key]) : new Set()}
      //       onSelectionChange={(keys) =>
      //         handleFilterChange(key, Array.from(keys))
      //       }
      //     >
      //       {options.map((option) => (
      //         <SelectItem key={String(option.key)}>{option.value}</SelectItem>
      //       ))}
      //     </Select>
      //   );
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
    <div className="z-100">
      <div className="mb-4 flex flex-wrap gap-2 justify-end">
        {Object.entries(filters).map(([key, value]) => (
          <Chip
            key={key}
            variant="bordered"
            color="warning"
            onClose={() => removeFilter(key)}
          >
            {capitalize(key)}:{" "}
            {selectedLabels[key] || renderChipValue(key, value)}
          </Chip>
        ))}
      </div>

      <div className="flex justify-end z-100">
        <Button onPress={onOpen} variant="ghost" size="sm" color="warning">
          <IoFilterOutline className="mr-1" /> Filter
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        isDismissable={false}
        size="2xl"
        backdrop="blur"
        className={"z-100"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-default-100 pb-4">
                <h2 className="text-xl font-bold">{capitalize(currentTable)} Filters</h2>
                <p className="text-sm text-default-500 font-normal mt-1">
                  Refine your search results. Dropdowns grouped hierarchically (like Category and Product) will unlock sequentially automatically.
                </p>
              </ModalHeader>
              <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-6">
                {formFields.map((field) => (
                  <div
                    key={field.key}
                    className={`w-full ${field.filterType === 'date' || field.filterType === 'range' ? 'md:col-span-2' : ''}`}
                  >
                    {renderFilter(field)}
                  </div>
                ))}
              </ModalBody>
              <ModalFooter className="border-t border-default-100 pt-4">
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
