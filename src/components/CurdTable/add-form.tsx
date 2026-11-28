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
import { Key } from "@react-types/shared";
import { motion } from "framer-motion";

import { AddFormProps, AddModalProps, FormField } from "@/data/interface-data";
import { toast } from "react-toastify";
import { showToastMessage } from "@/utils/utils";
import { toTitleCase } from "../titles";
import PhoneField from "../form/PhoneField";
import { parsePhoneValue } from "@/utils/phone";
import { uploadFormFile } from "@/utils/uploadFormFile";
import { normalizeApiError } from "@/core/api/apiErrors";
import { useCompanyAccess } from "@/utils/companyAccess";
import AsyncActionButton from "@/components/ui/AsyncActionButton";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ImagePicker from "@/components/ui/ImagePicker";
import FileDropzone from "@/components/ui/FileDropzone";

const PAYMENT_DOC_TYPES = [
  "PROFORMA_INVOICE",
  "PURCHASE_ORDER",
  "SALES_CONTRACT",
  "PACKING_LIST",
  "INSPECTION_CERTIFICATE",
  "PHYTOSANITARY_CERTIFICATE",
  "FUMIGATION_CERTIFICATE",
  "BILL_OF_LADING",
  "AIR_WAYBILL",
  "LORRY_RECEIPT",
  "LCL_DRAFT",
  "INSURANCE_CERTIFICATE",
  "INVOICE",
  "PAYMENT_ADVICE",
];

const PAYMENT_STAGE_KEYS = [
  "ENQUIRY_CREATED",
  "LOI_ACCEPTED_QTY_CONFIRMED",
  "QUOTATION_REVISION",
  "QUOTATION_CREATED",
  "QUOTATION_DECISION",
  "RESPONSIBILITIES_FINALIZED",
  "PROFORMA_ISSUED",
  "OTHER_DOCUMENTS",
  "PURCHASE_ORDER_CREATED",
  "ORDER_CREATED",
  "CONTRACT_SIGNED",
  "PRODUCTION_STARTED",
  "QUALITY_VERIFIED",
  "COMPLIANCE_APPROVED",
  "PACKING_COMPLETED",
  "READY_FOR_SHIPMENT",
  "SHIPPED",
  "DELIVERED",
  "PAYMENT_PENDING",
  "PAYMENT_COMPLETED",
  "TRADE_CLOSED",
];

const AddForm: React.FC<AddFormProps> = ({
  name,
  currentTable,
  formFields,
  apiEndpoint,
  refetchData,
  additionalVariable,
  onSuccess,
  grid = 2,
}) => {
  const { actionsAllowed } = useCompanyAccess();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // 👈 success state
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>(
    {}
  );
  const [autocompleteInput, setAutocompleteInput] = useState<Record<string, string>>({});

  const isFieldVisible = (field: FormField, data: Record<string, any>) => {
    if (!field.showWhen) return true;
    const expected = field.showWhen.equals;
    if (Array.isArray(expected)) {
      return expected.includes(data[field.showWhen.key]);
    }
    return data[field.showWhen.key] === expected;
  };

  const getVisibleFormFields = (data: Record<string, any>) =>
    formFields.filter((field) => field.inForm && isFieldVisible(field, data));

  const pruneHiddenFormData = (data: Record<string, any>) => {
    const next = { ...data };
    formFields.forEach((field) => {
      if (!isFieldVisible(field, next) && field.clearWhenHidden !== false) {
        delete next[field.key];
      }
    });
    return next;
  };

  const openModal = () => setOpen(true);
  const closeModal = () => {
    setOpen(false);
    setFormData({});
    setSelectedUploadFile(null);
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

      const results = await Promise.allSettled(fetchOptionsPromises);

      const optionsMap: Record<string, any[]> = {};
      let firstError: unknown;
      results.forEach((result) => {
        if (result.status === "fulfilled") optionsMap[result.value.key] = result.value.options;
        else firstError ??= result.reason;
      });

      setDynamicOptions((prev) => ({
        ...prev,
        ...optionsMap,
      }));
      if (firstError) {
        showToastMessage({
          type: "error",
          message: normalizeApiError(firstError, "Some form options could not be loaded. Reopen the form to retry.").message,
          position: "top-right",
        });
      }
    };

    preloadDynamicSelectOptions();
  }, [formFields]);

  const addItem = useMutation({
    mutationFn: async (data: any) => postData(apiEndpoint, data, {}),
    onSuccess: (result: any) => {
      queryClient.refetchQueries({
        queryKey: [currentTable, apiEndpoint],
      });

      toast.success("You did it!"); // Displays a success message

      closeModal();
      setSuccess(true); // 👈 trigger success state
      setLoading(false);
      refetchData?.();
      // Auto-close after 2s
      onSuccess?.(result.data); // 👈 Notify parent with result data
      setTimeout(() => {
        setSuccess(false);
        closeModal();
      }, 2000);
    },
    onError: (error: any) => {
      const normalized = normalizeApiError(error, "An error occurred");
      showToastMessage({
        type: "error",
        message: normalized.message,
        position: "top-right",
      });
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const visibleFields = getVisibleFormFields(formData);
    const missing = validateFields(visibleFields, formData);
    setMissingFields(missing);

    if (missing.length > 0) {
      // console.log("Missing fields:", missing);
      setLoading(false);
      return;
    }

    if (currentTable === "paymentTerm") {
      const milestones = Array.isArray(formData.milestones) ? formData.milestones : [];
      const total = milestones.reduce((sum: number, item: any) => sum + Number(item?.percent || 0), 0);
      if (!milestones.length || Math.round(total * 100) / 100 !== 100 || milestones.some((item: any) => !String(item?.label || "").trim() || Number(item?.percent) <= 0 || !String(item?.triggerValue || "").trim())) {
        showToastMessage({ type: "error", message: "Add complete payment sections with positive percentages totaling 100%.", position: "top-right" });
        setLoading(false);
        return;
      }
    }

    try {
      const hasFileInput = formFields.some(
        (field) => field.type === "file" || field.type === "image"
      );

      let fileId: string | null = null;
      let fileURL: string | null = null;

      if (hasFileInput && selectedUploadFile) {
        // Define the entities array based on the current form context
        const entities = [
          { entity: "projects", entityId: "projectId123" }, // Replace with actual IDs
          { entity: "activities", entityId: "activityId456" },
          { entity: "timesheets", entityId: "timesheetId789" },
        ];

        const uploadedFile = await uploadFormFile(selectedUploadFile, { ...formData, entities });
        fileId = uploadedFile.fileId;
        fileURL = uploadedFile.fileURL;

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

      let completeFormData = pruneHiddenFormData({ ...formData });

      // Prepare the complete form data
      if (fileId || fileURL)
        completeFormData = {
          ...pruneHiddenFormData({ ...formData }),
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

      if (currentTable === "inventories") {
        uploadFormData = {
          ...uploadFormData,
          unit: "MT",
        };
      }

      const associateCompanyField = formFields.find((field) => field.key === "associateCompany");
      if (associateCompanyField && uploadFormData.associateCompany) {
        const options =
          associateCompanyField.dependsOn && dynamicOptions[associateCompanyField.key]
            ? dynamicOptions[associateCompanyField.key]
            : associateCompanyField.dynamicValuesFn
              ? dynamicOptions[associateCompanyField.key] || []
              : associateCompanyField.values || [];

        const normalizedOptions = (Array.isArray(options) ? options : []).map((o: any) => ({
          key: String(o?.key ?? o?._id ?? o?.value ?? ""),
          value: String(o?.value ?? o?.label ?? o?.name ?? o?._id ?? ""),
        }));

        if (
          normalizedOptions.length > 0 &&
          !normalizedOptions.some((option) => String(option.key) === String(uploadFormData.associateCompany))
        ) {
          showToastMessage({
            type: "error",
            message: "Selected company is not available for your scope.",
            position: "top-right",
          });
          setLoading(false);
          return;
        }
      }
      formFields.forEach((field) => {
        if (isWebsiteLikeField(field) && uploadFormData[field.key] !== undefined) {
          const raw = uploadFormData[field.key];
          const trimmed = String(raw || "").trim();
          if (trimmed === "https://" || trimmed === "http://" || trimmed === "https:" || trimmed === "http:") {
            uploadFormData[field.key] = "";
          }
        }
      });
      // Proceed with form submission
      addItem.mutate(uploadFormData);
    } catch (error: unknown) {
      showToastMessage({
        type: "error",
        message: normalizeApiError(error, "An error occurred during submission").message,
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

    setFormData((prevData) => {
      const nextData = pruneHiddenFormData({
        ...prevData,
        [name]: value,
      });
      return nextData;
    });

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
          ...pruneHiddenFormData(prevData),
          [field.key]: "",
        }));
        setAutocompleteInput((prev) => ({
          ...prev,
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
      const val = data[field.key];
      const isWebsite = isWebsiteLikeField(field);
      const isWebsiteEmpty = isWebsite && (!val || val === "https://" || val === "http://");
      if (field.required && (!val || val === "" || isWebsiteEmpty)) {
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

  const updatePaymentMilestone = (fieldKey: string, index: number, patch: Record<string, any>) => {
    setFormData((prev) => {
      const next = Array.isArray(prev[fieldKey]) ? [...prev[fieldKey]] : [];
      next[index] = { ...(next[index] || {}), ...patch };
      return { ...prev, [fieldKey]: next };
    });
  };

  const addPaymentMilestone = (fieldKey: string) => {
    setFormData((prev) => {
      const next = Array.isArray(prev[fieldKey]) ? [...prev[fieldKey]] : [];
      next.push({ label: "", percent: 0, triggerType: "DOC", triggerValue: "" });
      return { ...prev, [fieldKey]: next };
    });
  };

  const movePaymentMilestone = (fieldKey: string, index: number, direction: -1 | 1) => {
    setFormData((prev) => {
      const next = Array.isArray(prev[fieldKey]) ? [...prev[fieldKey]] : [];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, [fieldKey]: next };
    });
  };

  const removePaymentMilestone = (fieldKey: string, index: number) => {
    setFormData((prev) => {
      const next = Array.isArray(prev[fieldKey]) ? [...prev[fieldKey]] : [];
      next.splice(index, 1);
      return { ...prev, [fieldKey]: next };
    });
  };

  // Helper function to render form fields based on type
  const isPhoneLikeField = (field: FormField) =>
    field.type === "phone" ||
    (/phone/i.test(field.key) && ["number", "text", "tel", "phone"].includes(String(field.type || "").toLowerCase()));

  const isWebsiteLikeField = (field: FormField) =>
    field.type === "url" ||
    field.type === "link" ||
    (/website/i.test(field.key) && ["text", "url", "link", ""].includes(String(field.type || "").toLowerCase()));

  const getPhoneMetaKeys = (baseKey: string) => ({
    countryCodeKey: `${baseKey}CountryCode`,
    nationalKey: `${baseKey}National`,
  });

  const renderFormField = (field: FormField) => {
    if (isPhoneLikeField(field)) {
      const { countryCodeKey, nationalKey } = getPhoneMetaKeys(field.key);
      const parsed = parsePhoneValue({
        raw: formData[field.key],
        countryCode: formData[countryCodeKey],
        national: formData[nationalKey],
      });
      return (
        <PhoneField
          name={field.key}
          label={field.label}
          value={parsed.e164}
          countryCodeValue={parsed.countryCode}
          nationalValue={parsed.national}
          className="w-full"
          onChange={(next) => {
            setFormData((prev) => ({
              ...prev,
              [field.key]: next.e164,
              [countryCodeKey]: next.countryCode,
              [nationalKey]: next.national,
            }));
          }}
        />
      );
    }

    if (isWebsiteLikeField(field)) {
      const currentValue = formData[field.key] !== undefined ? formData[field.key] : "https://";
      return (
        <Input
          aria-label={`Enter ${field.label}`}
          name={field.key}
          type="url"
          label={field.label}
          placeholder="https://"
          className="w-full"
          value={currentValue}
          onChange={(e) => {
            const val = e.target.value;
            setFormData((prev) => ({ ...prev, [field.key]: val }));
          }}
        />
      );
    }

    switch (field.type) {
      case "paymentMilestones": {
        const milestones: any[] = Array.isArray(formData[field.key]) ? formData[field.key] : [];
        const milestoneTotal = milestones.reduce((sum, item) => sum + Number(item?.percent || 0), 0);
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
              <label className="font-medium">{field.label}</label>
              <Button
                size="sm"
                type="button"
                onClick={() => addPaymentMilestone(field.key)}
                className="px-3 py-1 bg-obaol-500 text-white rounded"
              >
                + Add Segment
              </Button>
            </div>
            <div className={`rounded-lg border px-3 py-2 text-sm font-semibold ${milestoneTotal === 100 ? "border-success-300 bg-success-50 text-success-700" : "border-warning-300 bg-warning-50 text-warning-700"}`}>
              Allocated: {milestoneTotal}% · {milestoneTotal <= 100 ? `${100 - milestoneTotal}% remaining` : `${milestoneTotal - 100}% over`}
            </div>
            {milestones.length === 0 && (
              <p className="text-[11px] text-default-500">Add payment sections that sum to 100%.</p>
            )}
            {milestones.map((milestone, index) => {
              const triggerType = String(milestone?.triggerType || "DOC");
              const triggerOptions = triggerType === "STAGE" ? PAYMENT_STAGE_KEYS : PAYMENT_DOC_TYPES;
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <Input
                    label="Label"
                    value={milestone?.label || ""}
                    onChange={(e) => updatePaymentMilestone(field.key, index, { label: e.target.value })}
                  />
                  <Input
                    label="Percent"
                    type="number"
                    value={milestone?.percent ?? ""}
                    onChange={(e) => updatePaymentMilestone(field.key, index, { percent: Number(e.target.value) })}
                  />
                  <Select
                    label="Trigger Type"
                    selectedKeys={new Set([triggerType])}
                    onSelectionChange={(keys) => {
                      const nextType = Array.from(keys as Set<Key>)[0] || "DOC";
                      updatePaymentMilestone(field.key, index, {
                        triggerType: String(nextType),
                        triggerValue: "",
                      });
                    }}
                  >
                    <SelectItem key="DOC">DOC</SelectItem>
                    <SelectItem key="STAGE">STAGE</SelectItem>
                  </Select>
                  <Select
                    label="Trigger Value"
                    selectedKeys={milestone?.triggerValue ? new Set([String(milestone.triggerValue)]) : new Set()}
                    onSelectionChange={(keys) => {
                      const nextValue = Array.from(keys as Set<Key>)[0] || "";
                      updatePaymentMilestone(field.key, index, { triggerValue: String(nextValue) });
                    }}
                  >
                    {triggerOptions.map((opt) => (
                      <SelectItem key={opt}>{opt}</SelectItem>
                    ))}
                  </Select>
                  <div className="md:col-span-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" type="button" variant="flat" isDisabled={index === 0} onPress={() => movePaymentMilestone(field.key, index, -1)}>Move up</Button>
                      <Button size="sm" type="button" variant="flat" isDisabled={index === milestones.length - 1} onPress={() => movePaymentMilestone(field.key, index, 1)}>Move down</Button>
                      <Button size="sm" type="button" onClick={() => removePaymentMilestone(field.key, index)} className="bg-red-500 text-white rounded">Remove Segment</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      case "textarea":
        return (
          <textarea
            aria-label={`Select ${field.label}`}
            name={field.key}
            placeholder={field.label}
            className="py-2 border rounded-md w-full"
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
            className="w-full"
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
          <div className="flex flex-col gap-3 w-full">
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
          <div className="flex flex-col gap-3 w-full">
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

      case "select": {
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
        const normalizedOptions = (Array.isArray(options) ? options : []).map((o: any) => ({
          key: String(o?.key ?? o?._id ?? o?.value ?? ""),
          value: String(o?.value ?? o?.label ?? o?.name ?? o?._id ?? ""),
        }));

        const currentKey = formData[field.key] ? String(formData[field.key]) : null;

        return (
          <div className="w-full">
            <SearchableSelect
              label={field.label}
              multiple={false}
              allowSelectAll={false}
              options={normalizedOptions.map(option => ({ key: option.key, label: option.value }))}
              value={currentKey ? [currentKey] : []}
              placeholder={
                isDisabled && field.dependsOn
                  ? `Please select ${toTitleCase(field.dependsOn)} first`
                  : `Search ${field.label.toLowerCase()}`
              }
              disabled={!!isDisabled}
              required={field.required}
              onChange={(values) => {
                handleInputChange({ target: { name: field.key, value: values[0] || "" } });
              }}
            />
            {field.key === "geoType" && (
              <p className="mt-1 text-[11px] text-default-500">
                {formData.geoType === "INTERNATIONAL"
                  ? "Country + legal compliance details required."
                  : "State, district, division and pincode required for Indian profiles."}
              </p>
            )}
          </div>
        );
      }
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
        const normalizedOptions = (Array.isArray(options) ? options : []).map((o: any) => ({
          key: String(o?.key ?? o?._id ?? o?.value ?? ""),
          value: String(o?.value ?? o?.label ?? o?.name ?? o?._id ?? ""),
        }));

        // Ensure formData is always stored as an array of strings
        const selectedValues: string[] = formData[field.key] || [];
        const selectedKeys = new Set(selectedValues);

        return (
          <div className="w-full text-foreground">
            <SearchableSelect
              label={field.label}
              options={normalizedOptions.map(option => ({ key: option.key, label: option.value }))}
              value={selectedValues}
              placeholder={
                isDisabled && field.dependsOn
                  ? `Please select ${toTitleCase(field.dependsOn)} first`
                  : `Search ${field.label.toLowerCase()}`
              }
              disabled={!!isDisabled}
              required={field.required}
              onChange={values => setFormData(prev => ({ ...prev, [field.key]: values }))}
            />
          </div>
        );
      }

      case "multiselectValue":
        return renderMultiselectValueField(field);

      case "image":
        return <ImagePicker label={field.label} value={selectedUploadFile} preset={field.imagePreset || "product"} accept={field.accept} required={field.required} onChange={setSelectedUploadFile} />;
      case "file":
        return <FileDropzone label={field.label} file={selectedUploadFile} accept={field.accept || "image/*,application/pdf"} onChange={setSelectedUploadFile} />;

      default:
        return (
          <Input
            aria-label={`Select ${field.label}`}
            name={field.key}
            type={field.type}
            label={field.label}
            placeholder={"Enter the " + field.label}
            className="w-full"
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-8 text-center relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(27,38,50,0.05)]"
          >
            {/* Celebratory Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, (i % 2 === 0 ? -100 : -80)],
                  x: [0, (i < 3 ? -40 : 40)],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeOut",
                }}
                className="absolute w-2 h-2 rounded-full bg-obaol-400/40"
              />
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="w-24 h-24 flex items-center justify-center rounded-3xl bg-gradient-to-br from-obaol-400 to-orange-500 text-white shadow-[0_20px_50px_rgba(228,199,153,0.3)] mb-8"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  d="M20 6L9 17l-5-5"
                />
              </svg>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
            >
              All Set!
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-default-500 font-medium text-lg max-w-xs"
            >
              The {name ?? currentTable} has been added to the network.
            </motion.p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              className="w-full grid grid-cols-1 gap-y-3 md:gap-x-4 md:gap-y-4 overflow-auto md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
              style={{ ["--cols" as any]: grid }}
            >
              {formFields
                .filter((field) => field.inForm && isFieldVisible(field, formData))
                .map((field, index) => (
                  <div
                    key={index}
                    className={`text-foreground w-full ${isPhoneLikeField(field) ? "md:col-span-2" : ""}`}
                  >
                    {renderFormField(field)}
                  </div>
                ))}
            </div>

            <div className="flex justify-end w-full mt-4">
              <AsyncActionButton
                className="min-w-[100px] bg-obaol-400 rounded-3xl text-white h-[38px] text-sm"
                type="submit"
                isDisabled={loading || !actionsAllowed}
                title={!actionsAllowed ? "Your company must be accepted before you can add records." : undefined}
                state={loading ? "processing" : "idle"}
                labels={{
                  idle: `Add ${name ?? "Record"}`,
                  processing: `Creating ${name ?? "Record"}…`,
                  success: `${name ?? "Record"} Created`,
                  error: `Unable to Create — Retry`,
                }}
              />
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
