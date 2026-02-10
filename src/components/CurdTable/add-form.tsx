"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Input,
  Select,
  SelectItem,
  ModalBody,
  Chip,
  DatePicker,
  Switch,
  TimeInput,
  Button,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { postData } from "@/core/api/apiHandler";
import { queryClient } from "@/app/provider";
// import { Key } from "react";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { Dashboard } from "@uppy/react";
import { Key } from "@react-types/shared";
import { motion } from "framer-motion";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { baseUrl } from "@/core/api/axiosInstance";
import { AddFormProps, AddModalProps, FormField } from "@/data/interface-data";
import { toast } from "react-toastify";
import { showToastMessage } from "@/utils/utils";
import { toTitleCase } from "../titles";

const AddForm: React.FC<AddFormProps> = ({
  name,
  currentTable,
  formFields,
  apiEndpoint,
  additionalVariable,
  onSuccess,
  grid = 2,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // 👈 success state
  const [uppy, setUppy] = useState<Uppy | null>(null);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>(
    {}
  );

  useEffect(() => {
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles: 1, // Adjust as needed
        allowedFileTypes: ["image/*", "application/pdf"], // Example: images and PDFs
      },
      autoProceed: false,
      allowMultipleUploads: false,
      debug: true, // Enable for debugging
    });

    uppyInstance.use(XHRUpload, {
      endpoint: `${baseUrl}/upload`, // Backend upload endpoint for single file
      fieldName: "file", // Must match backend's expected field name
      formData: true,
      method: "POST",
      bundle: false, // Send files individually
      withCredentials: true,
      headers: {
        // Add any required headers here, e.g., authorization tokens
        // Authorization: `Bearer ${yourToken}`,
      },
    });

    setUppy(uppyInstance);

    return () => {
      uppyInstance.destroy(); // Properly clean up the Uppy instance
    };
  }, [apiEndpoint]);
  const openModal = () => setOpen(true);
  const closeModal = () => {
    setOpen(false);
    setFormData({});
    uppy?.clear(); // Reset Uppy instance
  };
  useEffect(() => {
    const preloadDynamicSelectOptions = async () => {
      const fetchOptionsPromises = formFields
        .filter(
          (field) =>
            (field.type === "select" || field.type === "multiselect") &&
            !field.dependsOn && // only fields with no dependency
            typeof field.dynamicValuesFn === "function"
        )
        .map(async (field: any) => {
          const options = await field.dynamicValuesFn();
          return { key: field.key, options };
        });

      const results = await Promise.all(fetchOptionsPromises);

      const optionsMap: Record<string, any[]> = {};
      results.forEach(({ key, options }) => {
        optionsMap[key] = options;
      });

      setDynamicOptions((prev) => ({
        ...prev,
        ...optionsMap,
      }));
    };

    preloadDynamicSelectOptions();
  }, [formFields]);

  const addItem = useMutation({
    mutationFn: async (data: any) => postData(apiEndpoint, data, {}),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [currentTable, apiEndpoint],
      });

      toast.success("You did it!"); // Displays a success message

      closeModal();
      setSuccess(true); // 👈 trigger success state
      setLoading(false);
      // Auto-close after 2s
      setTimeout(() => {
        setSuccess(false);
        closeModal();
        onSuccess?.(); // 👈 Notify parent to close
      }, 2000);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error.response?.data?.message || "An error occurred",
        position: "top-right",
      });
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const missing = validateFields(formFields, formData);
    setMissingFields(missing);

    if (missing.length > 0) {
      // console.log("Missing fields:", missing);
      setLoading(false);
      return;
    }

    try {
      const hasFileInput = formFields.some(
        (field) => field.type === "file" || field.type === "image"
      );

      let fileId: string | null = null;
      let fileURL: string | null = null;

      if (hasFileInput && uppy && uppy.getFiles().length > 0) {
        // Define the entities array based on the current form context
        const entities = [
          { entity: "projects", entityId: "projectId123" }, // Replace with actual IDs
          { entity: "activities", entityId: "activityId456" },
          { entity: "timesheets", entityId: "timesheetId789" },
        ];

        // Attach form data as meta data, including the entities array
        uppy.setMeta({
          ...formData,
          entities: JSON.stringify(entities), // Serialize the array
        });

        // Initiate the upload
        const uploadResult = await uppy.upload();
        showToastMessage({
          type: "error",
          message: "File uploaded passing to formData",
          position: "top-right",
        });

        if (uploadResult?.failed && uploadResult.failed.length > 0) {
          // Handle upload failures
          showToastMessage({
            type: "error",
            message: "File upload failed",
            position: "top-right",
          });

          setLoading(false);
          return;
        }

        // Extract the file ID and file URL from the response
        const uploadedFile =
          uploadResult?.successful && uploadResult.successful[0];

        if (
          uploadedFile &&
          uploadedFile.response &&
          uploadedFile.response.body
        ) {
          // Assuming only one file is uploaded
          fileId = uploadedFile.response.body.fileIds[0];
          fileURL = uploadedFile.response.body.fileURLs[0];
        }

        if (!fileId || !fileURL) {
          // Handle missing fileId or fileURL
          showToastMessage({
            type: "error",
            message: "Failed to retrieve uploaded file details",
            position: "top-right",
          });
          setLoading(false);
          return;
        }
      }

      let completeFormData = {
        ...formData,
      };

      // Prepare the complete form data
      if (fileId || fileURL)
        completeFormData = {
          ...formData,
          fileId, // Include the uploaded file's ID
          fileURL, // Include the uploaded file's URL (optional, based on backend design)
        };

      let uploadFormData = completeFormData;

      if (additionalVariable) {
        uploadFormData = {
          ...completeFormData,
          ...additionalVariable,
        };
      }
      // Proceed with form submission
      addItem.mutate(uploadFormData);
    } catch (error: any) {
      console.error("Submission error:", error);
      showToastMessage({
        type: "error",
        message: "An error occurred during submission",
        position: "top-right",
      });
      setLoading(false);
    }
  };

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | number } }
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

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

        setFormData((prevData) => ({
          ...prevData,
          [field.key]: "",
        }));
      }
    });
  };

  const handleDateChange = (key: string, date: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: date instanceof Date ? date : new Date(date), // Example transformation
    }));
  };
  const handleBooleanChange = (key: string, checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: checked,
    }));
  };
  const handleSelectionChange = (fieldKey: string, value: Set<Key>) => {
    const valueArray = Array.from(value).map(String);
    setFormData((prevData) => ({
      ...prevData,
      [fieldKey]: valueArray,
    }));
  };
  const handleTimeChange = (key: string, time: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: time,
    }));
  };

  const handleChipClose = (itemToRemove: string, fieldKey: string) => {
    const updatedItems = (formData[fieldKey] || []).filter(
      (item: string) => item !== itemToRemove
    );

    setFormData((prevData) => ({
      ...prevData,
      [fieldKey]: updatedItems,
    }));
  };

  const validateFields = (
    fields: any[],
    data: Record<string, any>
  ): string[] => {
    const missing: string[] = [];
    fields.forEach((field) => {
      if (field.required && (!data[field.key] || data[field.key] === "")) {
        missing.push(field.label || field.key); // Add missing field's label
      }
    });
    return missing;
  };

  const handleMultiselectValueChange = (
    fieldKey: string,
    selectedKeys: Set<Key>,
    updatedValues?: { [key: string]: string }
  ) => {
    const currentSelections = Array.from(selectedKeys).map(String);
    const customValues = formData[fieldKey]?.customValues || {};

    const newValues = currentSelections.reduce((acc, key) => {
      acc[key] = updatedValues?.[key] || customValues[key] || ""; // Preserve existing or default to empty
      return acc;
    }, {} as { [key: string]: string });

    setFormData((prevData) => ({
      ...prevData,
      [fieldKey]: { selectedKeys: currentSelections, customValues: newValues },
    }));
  };
  const renderMultiselectValueField = (field: any) => {
    const fieldData = formData[field.key] || {
      selectedKeys: [],
      customValues: {},
    };
    const selectedKeys = new Set(fieldData.selectedKeys || []);
    const customValues = fieldData.customValues || {};

    return (
      <>
        <Select
          name={field.key}
          label={`Select ${field.label}`}
          placeholder={field.label}
          className="py-2 border rounded-md w-full"
          selectionMode="multiple"
          selectedKeys={selectedKeys as unknown as Set<Key>}
          onSelectionChange={(keys) =>
            handleMultiselectValueChange(field.key, keys as Set<Key>)
          }
        >
          {field.values &&
            field.values.map((option: any) => (
              <SelectItem key={String(option.key)} value={String(option.key)}>
                {option.value}
              </SelectItem>
            ))}
        </Select>

        <div className="mt-4 space-y-2">
          {Array.from(selectedKeys).map((key, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="font-medium">
                {field.values.find((option: any) => option.key === key)
                  ?.value || key}
              </span>
              <Input
                type="text"
                placeholder="Enter Code"
                value={customValues[key as string]}
                onChange={(e) =>
                  handleMultiselectValueChange(
                    field.key,
                    selectedKeys as Set<Key>,
                    {
                      ...customValues,
                      [key as string]: e.target.value,
                    }
                  )
                }
              />
            </div>
          ))}
        </div>
      </>
    );
  };
  // --- MultiTime Helpers ---
  const handleMultiTimeChange = (
    fieldKey: string,
    index: number,
    time: any
  ) => {
    setFormData((prev) => {
      const updated = [...(prev[fieldKey] || [])];
      updated[index] = time;
      return { ...prev, [fieldKey]: updated };
    });
  };

  const addTimeField = (fieldKey: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), ""], // start empty
    }));
  };

  const removeTimeField = (fieldKey: string, index: number) => {
    setFormData((prev) => {
      const updated = [...(prev[fieldKey] || [])];
      updated.splice(index, 1);
      return { ...prev, [fieldKey]: updated };
    });
  };
  // --- Time Range Helpers ---
  const handleTimeRangeChange = (
    fieldKey: string,
    index: number,
    type: "start" | "end",
    time: any
  ) => {
    setFormData((prev) => {
      const updated = [...(prev[fieldKey] || [])];
      updated[index] = {
        ...updated[index],
        [type]: time,
      };
      return { ...prev, [fieldKey]: updated };
    });
  };

  const addTimeRangeField = (fieldKey: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), { start: "", end: "" }],
    }));
  };

  const removeTimeRangeField = (fieldKey: string, index: number) => {
    setFormData((prev) => {
      const updated = [...(prev[fieldKey] || [])];
      updated.splice(index, 1);
      return { ...prev, [fieldKey]: updated };
    });
  };

  // Helper function to render form fields based on type
  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            aria-label={`Select ${field.label}`}
            name={field.key}
            placeholder={field.label}
            className="py-2 border rounded-md w-[90%]"
            value={formData[field.key] || ""}
            onChange={handleInputChange}
          />
        );
      case "date":
      case "week":
        return (
          <DatePicker
            aria-label={`Select ${field.label}`}
            showMonthAndYearPickers
            name={field.key}
            label={field.label}
            className="w-[90%]"
            defaultValue={formData[field.key] || null} // Set the initial date if it exists in formData
            onChange={(date) => handleDateChange(field.key, date)} // Use handleDateChange to update state
          />
        );
      case "boolean":
        return (
          <Switch
            aria-label={`Select ${field.label}`}
            name={field.key}
            defaultSelected={formData[field.key] || false}
            onChange={(e) => handleBooleanChange(field.key, e.target.checked)} // Use handleBooleanChange
          >
            {field.label}
          </Switch>
        );
      case "time":
        return (
          <TimeInput
            aria-label={`Select ${field.label}`}
            name={field.key}
            label={field.label}
            hourCycle={24}
            value={formData[field.key]} // Controlled state
            onChange={(time) => handleTimeChange(field.key, time)} // Update handler
          />
        );

      case "multiTime": {
        const timeValues: any[] = formData[field.key] || [];

        return (
          <div className="flex flex-col gap-3 w-[90%]">
            <label className="font-medium">{field.label}</label>

            {timeValues.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <TimeInput
                  aria-label={`Select ${field.label} ${index + 1}`}
                  value={time || ""}
                  onChange={(t) => handleMultiTimeChange(field.key, index, t)}
                  hourCycle={24}
                />
                <Button
                  type="button"
                  onClick={() => removeTimeField(field.key, index)}
                  className=" py-1 bg-red-500 text-white rounded"
                >
                  ✕
                </Button>
              </div>
            ))}

            <Button
              size="sm"
              type="button"
              onClick={() => addTimeField(field.key)}
              className="px-3 py-1 bg-blue-500 text-white rounded mt-2"
            >
              + Add Time
            </Button>
          </div>
        );
      }
      case "multiTimeRange": {
        const timeRanges: { start: any; end: any }[] =
          formData[field.key] || [];

        return (
          <div className="flex flex-col gap-3 w-[90%]">
            <label className="font-medium">{field.label}</label>
            {timeRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-1">
                {/* Start Time */}
                <TimeInput
                  aria-label={`Select start time ${index + 1}`}
                  value={range.start || ""}
                  onChange={(t) =>
                    handleTimeRangeChange(field.key, index, "start", t)
                  }
                  hourCycle={24}
                />

                <span className="mx-1">to</span>

                {/* End Time */}
                <TimeInput
                  aria-label={`Select end time ${index + 1}`}
                  value={range.end || ""}
                  onChange={(t) =>
                    handleTimeRangeChange(field.key, index, "end", t)
                  }
                  hourCycle={24}
                />

                {/* Remove Button */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => removeTimeRangeField(field.key, index)}
                  className=" bg-red-500 text-white rounded"
                >
                  ✕
                </Button>
              </div>
            ))}
            {/* Add Button */}
            <Button
              size="sm"
              type="button"
              onClick={() => addTimeRangeField(field.key)}
              className="px-3 py-1 bg-yellow-500 text-white rounded mt-2"
            >
              + Add Time Range
            </Button>
          </div>
        );
      }

      case "select":
        const dependsOnValue = field.dependsOn
          ? formData[field.dependsOn]
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
            className="w-[90%] text-foreground"
            label={`Select ${field.label}`}
            placeholder={
              isDisabled && field.dependsOn
                ? `Please select ${toTitleCase(field.dependsOn)} first`
                : field.label
            }
            isDisabled={!!isDisabled}
            items={options}
            selectedKey={
              formData[field.key] ? String(formData[field.key]) : null
            }
            onSelectionChange={(key: any) =>
              handleInputChange({
                target: {
                  name: field.key,
                  value: String(key),
                },
              })
            }
          >
            {(item: any) => (
              <AutocompleteItem key={String(item.key)} className="text-foreground">
                {item.value}
              </AutocompleteItem>
            )}
          </Autocomplete>
        );

      case "multiselect": {
        const dependsOnValue = field.dependsOn
          ? formData[field.dependsOn]
          : null;
        const isDisabled = field.dependsOn && !dependsOnValue;

        const options =
          field.dependsOn && dynamicOptions[field.key]
            ? dynamicOptions[field.key] || []
            : field.dynamicValuesFn
              ? dynamicOptions[field.key] || []
              : field.values || [];

        // Ensure formData is always stored as an array of strings
        const selectedValues: string[] = formData[field.key] || [];
        const selectedKeys = new Set(selectedValues);

        return (
          <div className="w-[90%] text-foreground">
            <Select
              aria-label={`Select ${field.label}`}
              name={field.key}
              label={`Select Multi ${field.label}`}
              placeholder={
                isDisabled && field.dependsOn
                  ? `Please select ${toTitleCase(field.dependsOn)} first`
                  : field.label
              }
              className="w-full"
              selectionMode="multiple"
              isDisabled={!!isDisabled}
              selectedKeys={selectedKeys}
              onSelectionChange={(keys) => {
                const values = Array.from(keys as Set<Key>).map(String);
                setFormData((prev) => ({
                  ...prev,
                  [field.key]: values,
                }));
              }}
            >
              {options.map((option) => (
                <SelectItem key={String(option.key)} className="text-foreground">{option.value}</SelectItem>
              ))}
            </Select>

            <div className="flex gap-2 mt-2 flex-wrap">
              {selectedValues.map((item, index) => (
                <Chip
                  key={index}
                  onClose={() => {
                    const updated = selectedValues.filter((v) => v !== item);
                    setFormData((prev) => ({
                      ...prev,
                      [field.key]: updated,
                    }));
                  }}
                  variant="flat"
                >
                  {options.find((option) => option.key === item)?.value || item}
                </Chip>
              ))}
            </div>
          </div>
        );
      }

      case "multiselectValue":
        return renderMultiselectValueField(field);

      case "file":
      case "image":
        return (
          <div>
            <label className="block mb-2">{field.label}</label>
            {uppy && (
              <Dashboard
                uppy={uppy}
                hideUploadButton
                proudlyDisplayPoweredByUppy={false}
                note="Only image and document files are allowed."
              />
            )}
          </div>
        );

      default:
        return (
          <Input
            aria-label={`Select ${field.label}`}
            name={field.key}
            type={field.type}
            label={field.label}
            placeholder={"Enter the " + field.label}
            className=" w-[90%]"
            value={formData[field.key] || ""}
            onChange={handleInputChange}
          />
        );
    }
  };

  return (
    <>
      <div className="w-full ">
        {success ? (
          <div className="flex flex-col items-center justify-center py-10">
            {/* ✅ Tick Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 flex items-center justify-center rounded-full bg-green-500 text-white text-4xl"
            >
              ✓
            </motion.div>
            <p className="mt-4 text-green-600 font-semibold text-lg">
              {name ?? "Form"} Submitted Successfully!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              className="w-full grid grid-cols-1 overflow-auto md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
              style={{ ["--cols" as any]: grid }}
            >
              {formFields
                .filter((field) => field.inForm)
                .map((field, index) => (
                  <div key={index} className="mb-4 text-foreground">
                    {renderFormField(field)}
                  </div>
                ))}
            </div>

            <div className="flex justify-end w-full mt-4">
              <Button
                className="min-w-[100px] bg-warning-400 rounded-3xl text-white h-[38px] text-sm"
                type="submit"
                disabled={loading}
              >
                {loading ? `Adding ${name ?? ""} ...` : `Add ${name ?? ""}`}
              </Button>
            </div>
          </form>
        )}

        {missingFields.length > 0 && !success && (
          <div className="mt-4">
            <span>Please fill:</span>
            <div className="flex gap-2 mt-2 flex-wrap">
              {missingFields.map((field, index) => (
                <Chip key={index} color="warning" variant="bordered">
                  {field}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddForm;
