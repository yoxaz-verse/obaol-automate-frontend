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

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import { baseUrl } from "@/core/api/axiosInstance";
import { AddModalProps, FormField } from "@/data/interface-data";
import { toast } from "react-toastify";
import { showToastMessage } from "@/utils/utils";

const AddModal: React.FC<AddModalProps> = ({
  name,
  currentTable,
  formFields,
  apiEndpoint,
  additionalVariable,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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
            field.type === "select" &&
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
      setLoading(false);
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
  function toTitleCase(str: string): string {
    return str
      .replace(/[_\-]+/g, " ") // Replace underscores/dashes with space
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  }

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

  // Helper function to render form fields based on type
  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
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
            showMonthAndYearPickers
            name={field.key}
            labelPlacement="outside"
            label={field.label}
            className="max-w-[284px]"
            defaultValue={formData[field.key] || null} // Set the initial date if it exists in formData
            onChange={(date) => handleDateChange(field.key, date)} // Use handleDateChange to update state
          />
        );
      case "boolean":
        return (
          <Switch
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
            name={field.key}
            label={field.label}
            hourCycle={24}
            value={formData[field.key]} // Controlled state
            onChange={(time) => handleTimeChange(field.key, time)} // Update handler
          />
        );
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
          <Autocomplete
            name={field.key}
            className="w-[90%]"
            label={`Select ${field.label}`}
            placeholder={
              isDisabled && field.dependsOn
                ? `Please select ${toTitleCase(field.dependsOn)} first`
                : field.label
            }
            isDisabled={!!isDisabled}
            defaultItems={options}
            selectedKey={
              formData[field.key] ? String(formData[field.key]) : null
            }
            onSelectionChange={(key) =>
              handleInputChange({
                target: {
                  name: field.key,
                  value: String(key),
                },
              })
            }
          >
            {(item) => (
              <AutocompleteItem key={String(item.key)}>
                {item.value}
              </AutocompleteItem>
            )}
          </Autocomplete>
        );

      case "multiselect":
        if (field.values)
          return (
            <>
              <Select
                name={field.key}
                label={`Select Multiple ${field.label}`}
                placeholder={field.label}
                className="py-2 border rounded-md w-full"
                selectionMode="multiple"
                selectedKeys={new Set(formData[field.key] || [])}
                onSelectionChange={(keys) =>
                  handleSelectionChange(field.key, keys as Set<Key>)
                }
              >
                {field.values.map((option) => (
                  <SelectItem
                    key={String(option.key)}
                    value={String(option.key)}
                  >
                    {option.value}
                  </SelectItem>
                ))}
              </Select>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(formData[field.key] || []).map(
                  (item: string, index: number) => (
                    <Chip
                      key={index}
                      onClose={() => handleChipClose(item, field.key)}
                      variant="flat"
                    >
                      {field?.values?.find((option) => option.key === item)
                        ?.value || item}
                    </Chip>
                  )
                )}
              </div>
            </>
          );
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
            name={field.key}
            type={field.type}
            placeholder={field.label}
            className="py-2 w-[90%]"
            value={formData[field.key] || ""}
            onChange={handleInputChange}
          />
        );
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          className="min-w-[120px] px-2 bg-warning-400 rounded-lg text-white h-[35px] text-sm shadow-sm shadow-warning-200"
          onClick={openModal}
        >
          Add {name ?? ""}
        </button>
      </div>
      <Modal
        isOpen={open}
        onClose={closeModal}
        size="lg"
        className="!max-h-[90vh] sm:!max-h-[80vh] overflow-hidden"
        scrollBehavior="inside"
        isDismissable={true}
        hideCloseButton={false}
      >
        {" "}
        <ModalContent>
          <ModalHeader className="flex flex-col ">
            Add New {currentTable} {/* Translate */}
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col   max-h-[80vh]  overflow-auto">
                {formFields
                  .filter((field) => field.inForm)
                  .map((field, index) => (
                    <div key={index} className="mb-4 ">
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
            {missingFields.length > 0 && (
              <div className="mt-4">
                <span>Please fill:</span>
                {/* Translate */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {missingFields.map((field, index) => (
                    <Chip key={index} color="warning" variant="bordered">
                      {field}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddModal;
