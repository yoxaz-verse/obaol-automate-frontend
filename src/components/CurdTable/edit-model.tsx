// components/EditModal.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  DatePicker,
  Switch,
  TimeInput,
  Spinner,
  AutocompleteItem,
  Autocomplete,
  Tooltip,
} from "@nextui-org/react";
import { FiEdit2, FiUser, FiPhone, FiBriefcase, FiMapPin } from "react-icons/fi";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getData, patchData } from "@/core/api/apiHandler";
import { queryClient } from "@/app/provider";
import { toast } from "react-toastify";
import Image from "next/image";
import { parseDate, parseTime, Time, CalendarDate } from "@internationalized/date";
import { EditModalProps, FormField } from "@/data/interface-data";
import { toTitleCase } from "../titles";
import { Key } from "@react-types/shared";
import PhoneField from "../form/PhoneField";
import { parsePhoneValue } from "@/utils/phone";
import { useCompanyAccess } from "@/utils/companyAccess";
import { uploadFormFile } from "@/utils/uploadFormFile";
import { normalizeApiError } from "@/core/api/apiErrors";
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

const ASSOCIATE_ADMIN_CONTROLLED_FIELDS = [
  "isActive",
  "isCompanyVerified",
  "isEmailVerified",
  "registrationStatus",
] as const;

export default function EditModal({
  _id,
  currentTable,
  formFields,
  apiEndpoint,
  refetchData,
  initialData,
  isOpen: controlledOpen,
  onClose: controlledClose,
  presentation,
  triggerLabel,
}: EditModalProps) {
  const { actionsAllowed } = useCompanyAccess();
  const [open, setOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpenActual = isControlled ? controlledOpen : open;
  const isAssociateDrawer = presentation === "drawer" || currentTable === "associate";

  const handleClose = () => {
    if (isControlled && controlledClose) {
      controlledClose();
    } else {
      setOpen(false);
    }
  };

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>(
    {}
  );
  const [autocompleteInput, setAutocompleteInput] = useState<Record<string, string>>({});
  const isAssociateCompanyOnly =
    currentTable === "associate" &&
    formFields.length === 1 &&
    formFields[0]?.key === "associateCompany";
  const isAssociatePersonalProfile =
    currentTable === "associate" &&
    formFields.some((field) => field.key === "name") &&
    !formFields.some((field) => field.key === "associateCompany");

  // 1) Fetch the record when modal opens
  const { data: fetched } = useQuery({
    queryKey: [apiEndpoint, _id],
    queryFn: () => getData(`${apiEndpoint}/${_id}`),
    enabled: isOpenActual,
    refetchOnWindowFocus: false,
  });

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
      if (firstError) toast.error(normalizeApiError(firstError, "Some form options could not be loaded. Reopen the form to retry.").message);
    };

    preloadDynamicSelectOptions();
  }, [formFields]);

  // 3) Populate formData from fetched.data.data
  useEffect(() => {
    if (!fetched?.data?.data) return;
    const raw = fetched.data.data;
    const clone: Record<string, any> = { ...raw };

    formFields.forEach((f) => {
      const val = raw[f.key];
      if (f.type === "select" && val) {
        clone[f.key] = val._id || val;
      }
      if (f.type === "multiselect" && Array.isArray(val)) {
        clone[f.key] = val.map((x: any) => x._id || x);
      }
    });

    setFormData(clone);
  }, [fetched, formFields]);

  // 3.5) Pre-fetch dependent options when formData is populated
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;

    const fetchDependencies = async () => {
      const updates: Record<string, any[]> = {};

      for (const field of formFields) {
        if (field.dependsOn && typeof field.dynamicValuesFn === "function") {
          const parentValue = formData[field.dependsOn];
          if (parentValue && !dynamicOptions[field.key]) {
            try {
              const updatedValues = await field.dynamicValuesFn(String(parentValue));
              updates[field.key] = updatedValues;
            } catch (error: unknown) {
              toast.error(normalizeApiError(error, `Could not load ${field.label.toLowerCase()} options.`).message);
            }
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        setDynamicOptions((prev) => ({ ...prev, ...updates }));
      }
    };

    fetchDependencies();
  }, [formData, formFields, dynamicOptions]);

  // 4) Compute lock & unlock using raw = fetched.data.data
  const { isLocked, unlockAt } = useMemo(() => {
    const raw = fetched?.data?.data;
    if (!raw?.coolingStartTime) {
      return { isLocked: false, unlockAt: null };
    }
    const start = new Date(raw.coolingStartTime).getTime();
    const end = start + (raw.duration || 1) * 86400_000;
    return { isLocked: Date.now() < end, unlockAt: new Date(end) };
  }, [fetched]);

  // 5) PATCH mutation
  const mutation = useMutation({
    mutationFn: (payload: any) =>
      patchData(`${apiEndpoint}/${_id}`, payload, {}),
    onSuccess: () => {
      queryClient.invalidateQueries();
      refetchData();
      toast.success(`${capitalize(currentTable)} updated successfully`);
      setLoading(false);
      if (isControlled && controlledClose) controlledClose();
      else setOpen(false);
    },
    onError: (err: any) => {
      const msg = normalizeApiError(err, "Update failed").message;
      if (msg.includes("locked or in cooldown") && unlockAt) {
        toast.warning(
          `Locked until ${unlockAt.toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}`
        );
      } else {
        toast.error(msg);
      }
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTable === "paymentTerm") {
      const milestones = Array.isArray(formData.milestones) ? formData.milestones : [];
      const total = milestones.reduce((sum: number, item: any) => sum + Number(item?.percent || 0), 0);
      if (!milestones.length || Math.round(total * 100) / 100 !== 100 || milestones.some((item: any) => !String(item?.label || "").trim() || Number(item?.percent) <= 0 || !String(item?.triggerValue || "").trim())) {
        toast.error("Add complete payment sections with positive percentages totaling 100%.");
        return;
      }
    }
    const associateCompanyField = formFields.find((field) => field.key === "associateCompany");
    if (associateCompanyField && formData.associateCompany) {
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
        !normalizedOptions.some((option) => String(option.key) === String(formData.associateCompany))
      ) {
        toast.error("Selected company is not available for your scope.");
        return;
      }
    }
    setLoading(true);
    const associatePayload = currentTable === "associate"
      ? formFields.reduce((result: Record<string, any>, field) => {
          if (Object.prototype.hasOwnProperty.call(formData, field.key)) {
            result[field.key] = formData[field.key];
          }
          const isPhoneField = /phone/i.test(field.key);
          if (isPhoneField) {
            [`${field.key}CountryCode`, `${field.key}National`].forEach((key) => {
              if (Object.prototype.hasOwnProperty.call(formData, key)) result[key] = formData[key];
            });
          }
          return result;
        }, {})
      : formData;
    const basePayload = currentTable === "inventories" ? { ...formData, unit: "MT" } : associatePayload;
    const payload = { ...basePayload };
    if (currentTable === "associate") {
      const editableFieldKeys = new Set(formFields.map((field) => field.key));
      ASSOCIATE_ADMIN_CONTROLLED_FIELDS.forEach((field) => {
        if (!editableFieldKeys.has(field)) delete payload[field];
      });
    }
    if (selectedUploadFile) {
      try {
        const uploadedFile = await uploadFormFile(selectedUploadFile, formData);
        payload.fileId = uploadedFile.fileId;
        payload.fileURL = uploadedFile.fileURL;
      } catch (error: unknown) {
        toast.error(normalizeApiError(error, "File upload failed").message);
        setLoading(false);
        return;
      }
    }
    if (currentTable === "inventories" && !basePayload.storageLocation) {
      delete payload.storageLocation;
      delete payload.warehouseId;
    }
    formFields.forEach((field) => {
      if (field.showWhen && !isFieldVisible(field, basePayload)) {
        delete payload[field.key];
      }
    });
    mutation.mutate(payload);
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
        setAutocompleteInput((prev) => ({
          ...prev,
          [field.key]: "",
        }));
      }
    });
  };

  const handleDate = (key: string, d: any) =>
    setFormData((p) => ({ ...p, [key]: d ? d.toString() : "" }));
  const handleBool = (key: string, v: boolean) =>
    setFormData((p) => ({ ...p, [key]: v }));
  const handleTime = (key: string, t: any) =>
    setFormData((p) => ({ ...p, [key]: t }));

  // --- MultiTime Helpers ---
  const handleMultiTimeChange = (fieldKey: string, index: number, time: any) => {
    setFormData((prev) => {
      const updated = [...(prev[fieldKey] || [])];
      updated[index] = time;
      return { ...prev, [fieldKey]: updated };
    });
  };

  const addTimeField = (fieldKey: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), ""],
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

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const isFieldVisible = (field: FormField, data: Record<string, any>) => {
    if (!field.showWhen) return true;
    const expected = field.showWhen.equals;
    const current = data[field.showWhen.key];
    if (Array.isArray(expected)) {
      return expected.includes(current);
    }
    return current === expected;
  };

  // 7) Render fields, disabling everything but `isLive` when locked
  const renderField = (f: FormField) => {
    const disabled = isLocked && f.key !== "isLive";
    const isPhoneLikeField =
      f.type === "phone" ||
      (/phone/i.test(f.key) && ["number", "text", "tel", "phone"].includes(String(f.type || "").toLowerCase()));

    if (isPhoneLikeField) {
      const countryCodeKey = `${f.key}CountryCode`;
      const nationalKey = `${f.key}National`;
      const parsed = parsePhoneValue({
        raw: formData[f.key],
        countryCode: formData[countryCodeKey],
        national: formData[nationalKey],
      });
      return (
        <PhoneField
          name={f.key}
          label={f.label}
          value={parsed.e164}
          countryCodeValue={parsed.countryCode}
          nationalValue={parsed.national}
          disabled={disabled}
          className="w-full"
          onChange={(next) =>
            setFormData((prev) => ({
              ...prev,
              [f.key]: next.e164,
              [countryCodeKey]: next.countryCode,
              [nationalKey]: next.national,
            }))
          }
        />
      );
    }

    switch (f.type) {
      case "paymentMilestones": {
        const milestones: any[] = Array.isArray(formData[f.key]) ? formData[f.key] : [];
        const milestoneTotal = milestones.reduce((sum, item) => sum + Number(item?.percent || 0), 0);
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between">
              <label className="font-medium">{f.label}</label>
              <Button
                size="sm"
                type="button"
                onClick={() => addPaymentMilestone(f.key)}
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
                    onChange={(e) => updatePaymentMilestone(f.key, index, { label: e.target.value })}
                    isDisabled={disabled}
                  />
                  <Input
                    label="Percent"
                    type="number"
                    value={milestone?.percent ?? ""}
                    onChange={(e) => updatePaymentMilestone(f.key, index, { percent: Number(e.target.value) })}
                    isDisabled={disabled}
                  />
                  <Select
                    label="Trigger Type"
                    selectedKeys={new Set([triggerType])}
                    onSelectionChange={(keys) => {
                      const nextType = Array.from(keys as Set<Key>)[0] || "DOC";
                      updatePaymentMilestone(f.key, index, {
                        triggerType: String(nextType),
                        triggerValue: "",
                      });
                    }}
                    isDisabled={disabled}
                  >
                    <SelectItem key="DOC">DOC</SelectItem>
                    <SelectItem key="STAGE">STAGE</SelectItem>
                  </Select>
                  <Select
                    label="Trigger Value"
                    selectedKeys={milestone?.triggerValue ? new Set([String(milestone.triggerValue)]) : new Set()}
                    onSelectionChange={(keys) => {
                      const nextValue = Array.from(keys as Set<Key>)[0] || "";
                      updatePaymentMilestone(f.key, index, { triggerValue: String(nextValue) });
                    }}
                    isDisabled={disabled}
                  >
                    {triggerOptions.map((opt) => (
                      <SelectItem key={opt}>{opt}</SelectItem>
                    ))}
                  </Select>
                  <div className="md:col-span-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" type="button" variant="flat" isDisabled={disabled || index === 0} onPress={() => movePaymentMilestone(f.key, index, -1)}>Move up</Button>
                      <Button size="sm" type="button" variant="flat" isDisabled={disabled || index === milestones.length - 1} onPress={() => movePaymentMilestone(f.key, index, 1)}>Move down</Button>
                      <Button size="sm" type="button" onClick={() => removePaymentMilestone(f.key, index)} className="bg-red-500 text-white rounded" isDisabled={disabled}>Remove Segment</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      case "date": {
        const val = formData[f.key]
          ? parseDate(new Date(formData[f.key]).toISOString().split("T")[0])
          : undefined;
        return (
          <DatePicker
            name={f.key}
            label={f.label}
            value={val as any}
            isDisabled={disabled}
            onChange={(d) => handleDate(f.key, d)}
          />
        );
      }
      case "boolean":
        return (
          <Switch
            isDisabled={false}
            checked={formData[f.key] || false}
            onChange={(e) => handleBool(f.key, e.target.checked)}
          >
            {f.label}
          </Switch>
        );
        return (
          <TimeInput
            label={f.label}
            value={formData[f.key] || null}
            isDisabled={disabled}
            onChange={(t) => handleTime(f.key, t)}
            hourCycle={24}
          />
        );
      case "multiTime": {
        const timeValues: any[] = formData[f.key] || [];
        return (
          <div className="flex flex-col gap-3 w-full">
            <label className="font-medium">{f.label}</label>
            {timeValues.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <TimeInput
                  aria-label={`Select ${f.label} ${index + 1}`}
                  value={time || null}
                  onChange={(t) => handleMultiTimeChange(f.key, index, t)}
                  hourCycle={24}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => removeTimeField(f.key, index)}
                  className="bg-red-500 text-white rounded"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              type="button"
              onClick={() => addTimeField(f.key)}
              className="px-3 py-1 bg-blue-500 text-white rounded mt-2 max-w-fit"
            >
              + Add Time
            </Button>
          </div>
        );
      }
      case "multiTimeRange": {
        const timeRanges: { start: any; end: any }[] = formData[f.key] || [];
        return (
          <div className="flex flex-col gap-3 w-full">
            <label className="font-medium">{f.label}</label>
            {timeRanges.map((range, index) => (
              <div key={index} className="flex items-center gap-1">
                <TimeInput
                  aria-label={`Select start time ${index + 1}`}
                  value={range.start || null}
                  onChange={(t) => handleTimeRangeChange(f.key, index, "start", t)}
                  hourCycle={24}
                />
                <span className="mx-1">to</span>
                <TimeInput
                  aria-label={`Select end time ${index + 1}`}
                  value={range.end || null}
                  onChange={(t) => handleTimeRangeChange(f.key, index, "end", t)}
                  hourCycle={24}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => removeTimeRangeField(f.key, index)}
                  className="bg-red-500 text-white rounded"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              type="button"
              onClick={() => addTimeRangeField(f.key)}
              className="px-3 py-1 bg-yellow-500 text-white rounded mt-2 max-w-fit"
            >
              + Add Time Range
            </Button>
          </div>
        );
      }
      case "textarea":
        return (
          <textarea
            aria-label={f.label}
            name={f.key}
            placeholder={f.label}
            className="py-2 px-3 border rounded-md w-full bg-transparent text-foreground"
            value={formData[f.key] || ""}
            onChange={handleInputChange}
            disabled={disabled}
          />
        );
      case "select":
        const dependsOnValue = f.dependsOn ? formData[f.dependsOn] : null;
        const isDisabled = f.dependsOn && !dependsOnValue;

        const options =
          f.dependsOn && dynamicOptions[f.key]
            ? dynamicOptions[f.key]
            : f.dynamicValuesFn
              ? dynamicOptions[f.key] || []
              : f.values || [];
        const normalizedOptions = (Array.isArray(options) ? options : []).map((o: any) => ({
          key: String(o?.key ?? o?._id ?? o?.value ?? ""),
          value: String(o?.value ?? o?.label ?? o?.name ?? o?._id ?? ""),
        }));
        const currentKey = formData[f.key] ? String(formData[f.key]) : null;
        return (
          <SearchableSelect
            label={f.label}
            multiple={false}
            allowSelectAll={false}
            options={normalizedOptions.map(option => ({ key: option.key, label: option.value }))}
            value={currentKey ? [currentKey] : []}
            placeholder={
              isDisabled && f.dependsOn
                ? `Please select ${toTitleCase(f.dependsOn)} first`
                : `Search ${f.label.toLowerCase()}`
            }
            disabled={disabled || !!isDisabled}
            required={f.required}
            onChange={values => handleInputChange({ target: { name: f.key, value: values[0] || "" } })}
          />
        );
      case "multiselect": {
        const multiOptions =
          f.dependsOn && dynamicOptions[f.key]
            ? dynamicOptions[f.key]
            : f.dynamicValuesFn
              ? dynamicOptions[f.key] || []
              : f.values || [];
        return <SearchableSelect label={f.label} options={multiOptions.map((option: any) => ({ key: String(option.key), label: String(option.value) }))} value={(formData[f.key] || []).map(String)} disabled={disabled} required={f.required} placeholder={`Search ${f.label.toLowerCase()}`} onChange={values => setFormData(current => ({ ...current, [f.key]: values }))} />;
      }
      case "image":
        return <ImagePicker label={f.label} value={selectedUploadFile} existingUrl={formData[f.key] ? `${process.env.NEXT_PUBLIC_UPLOADS_URL || ""}${formData[f.key]}` : null} preset={f.imagePreset || "product"} accept={f.accept} disabled={disabled} required={f.required} onChange={setSelectedUploadFile} />;
      case "file":
        return <div className="space-y-2"><FileDropzone label={f.label} file={selectedUploadFile} accept={f.accept || "image/*,application/pdf"} disabled={disabled} onChange={setSelectedUploadFile} />{formData[f.key] ? <a className="text-sm font-semibold text-obaol-600" href={formData[f.key]} target="_blank" rel="noopener noreferrer">View current file</a> : null}</div>;
      default:
        return (
          <Input
            name={f.key}
            placeholder={f.label}
            value={formData[f.key] || ""}
            onChange={handleInputChange}
            isDisabled={disabled}
          />
        );
    }
  };

  return (
    <>
      {!isControlled && (
        <Tooltip content={triggerLabel || "Edit associate"} closeDelay={0}>
          <button
            type="button"
            aria-label={triggerLabel || "Edit associate"}
            className={`flex items-center justify-center rounded-xl bg-obaol-500/10 hover:bg-obaol-500/20 cursor-pointer active:opacity-50 group transition-all ${triggerLabel ? "min-h-10 gap-2 px-4 text-sm font-bold text-obaol-700 dark:text-obaol-300" : "p-2"}`}
            onClick={() => setOpen(true)}
          >
            <FiEdit2 size={20} className="text-obaol-500/80 group-hover:text-obaol-600 transition-colors" />
            {triggerLabel && <span>{triggerLabel}</span>}
          </button>
        </Tooltip>
      )}

      <Modal
        isDismissable={false}
        isOpen={isOpenActual}
        onClose={handleClose}
        size={isAssociateDrawer ? "full" : "lg"}
        placement={isAssociateDrawer ? "center" : undefined}
        classNames={{
          wrapper: isAssociateDrawer ? "justify-end p-0" : undefined,
          base: isAssociateDrawer ? "m-0 h-dvh max-h-dvh w-full max-w-[720px] rounded-none sm:rounded-l-[2rem] bg-content1" : undefined,
          header: isAssociateDrawer ? "border-b border-default-200/70 px-6 py-5 dark:border-white/10" : undefined,
          body: isAssociateDrawer ? "px-5 py-5 sm:px-7" : undefined,
          closeButton: "text-foreground-500 hover:bg-default-100 active:bg-default-200",
        }}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className={isAssociateDrawer ? "flex items-center gap-3 pr-12" : undefined}>
            {isAssociateDrawer ? (
              <>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-obaol-500/12 text-obaol-600 dark:text-obaol-300"><FiEdit2 /></span>
                <span><span className="block text-lg font-bold">{isAssociateCompanyOnly ? "Change associate company" : "Edit associate profile"}</span><span className="mt-0.5 block text-xs font-medium text-default-400">{isAssociateCompanyOnly ? "Choose the approved company linked to your profile" : isAssociatePersonalProfile ? "Update your personal, contact, and location details" : "Update personal, contact, and company details"}</span></span>
              </>
            ) : `Edit ${capitalize(currentTable)}`}
          </ModalHeader>

          {isLocked && unlockAt && (
            <ModalBody>
              <p className="text-red-500">
                🔒 Locked until{" "}
                {unlockAt.toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                . Only “Live” can be toggled.
              </p>
            </ModalBody>
          )}

          {!fetched ? (
            <Spinner />
          ) : (
            <ModalBody>
              <form onSubmit={handleSubmit} className={isAssociateDrawer ? "flex min-h-full flex-col" : undefined}>
                {isAssociateDrawer && !isAssociateCompanyOnly && (
                  <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-default-200/70 bg-default-50/70 p-2 text-center text-[11px] font-bold text-default-500 dark:border-white/10 dark:bg-white/[0.03]">
                    <span className="flex items-center justify-center gap-1.5 rounded-xl bg-content1 px-2 py-2 shadow-sm"><FiUser /> Personal</span>
                    <span className="flex items-center justify-center gap-1.5 px-2 py-2"><FiPhone /> Contact</span>
                    <span className="flex items-center justify-center gap-1.5 px-2 py-2">{isAssociatePersonalProfile ? <><FiMapPin /> Location</> : <><FiBriefcase /> Company</>}</span>
                  </div>
                )}
                <div className={isAssociateDrawer ? "grid grid-cols-1 gap-x-4 sm:grid-cols-2" : undefined}>
                {formFields
                  .filter((f) => (f.inEdit ?? f.inForm) && f.type !== "password" && isFieldVisible(f, formData))
                  .map((f, i) => (
                    <div key={i} className={`mb-4 ${isAssociateDrawer && ["name", "email", "associateCompany"].includes(f.key) ? "sm:col-span-2" : ""}`}>
                      {renderField(f)}
                    </div>
                  ))}
                </div>

                <div className={`flex justify-end gap-3 mt-4 ${isAssociateDrawer ? "sticky bottom-0 -mx-5 mt-auto border-t border-default-200/70 bg-content1/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7 dark:border-white/10" : ""}`}>
                  {isAssociateDrawer && <Button type="button" variant="flat" onPress={handleClose}>Cancel</Button>}
                  <AsyncActionButton
                    type="submit"
                    intent={isAssociateDrawer ? "warning" : "primary"}
                    isDisabled={!actionsAllowed || loading || (isLocked && !formData.isLive)}
                    title={!actionsAllowed ? "Your company must be accepted before you can update records." : undefined}
                    state={loading ? "processing" : "idle"}
                    labels={{
                      idle: isAssociateDrawer ? "Save Changes" : "Update",
                      processing: "Saving Changes…",
                      success: "Changes Saved",
                      error: "Unable to Save — Retry",
                    }}
                  />
                </div>
              </form>
            </ModalBody>
          )}

          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
}
