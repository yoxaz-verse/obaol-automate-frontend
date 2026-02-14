// components/EditModal.tsx
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
} from "@nextui-org/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getData, patchData } from "@/core/api/apiHandler";
import { queryClient } from "@/app/provider";
import { toast } from "react-toastify";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { Dashboard } from "@uppy/react";
import Image from "next/image";
import { parseDate, parseTime, Time, CalendarDate } from "@internationalized/date";
import { EditModalProps, FormField } from "@/data/interface-data";
import { toTitleCase } from "../titles";
import { Key } from "@react-types/shared";

export default function EditModal({
  _id,
  currentTable,
  formFields,
  apiEndpoint,
  refetchData,
}: EditModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const uppyRef = useRef<Uppy | null>(null);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>(
    {}
  );

  // 1) Fetch the record when modal opens
  const { data: fetched } = useQuery({
    queryKey: [apiEndpoint, _id],
    queryFn: () => getData(`${apiEndpoint}/${_id}`),
    enabled: open,
    refetchOnWindowFocus: false,
  });

  // 2) Init Uppy once
  useEffect(() => {
    const uppy = new Uppy({
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: ["image/*", "application/pdf"],
      },
      autoProceed: false,
    }).use(XHRUpload, {
      endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/upload`,
      fieldName: "file",
      formData: true,
    });
    uppyRef.current = uppy;
    return () => {
      uppy.destroy();
      uppyRef.current = null;
    };
  }, []);
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
            } catch (err) {
              console.error(`Error fetching dependency for ${field.key}:`, err);
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
      setOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Update failed";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    mutation.mutate(formData);
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

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // 7) Render fields, disabling everything but `isLive` when locked
  const renderField = (f: FormField) => {
    const disabled = isLocked && f.key !== "isLive";
    switch (f.type) {
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

        return (
          // @ts-ignore
          <Autocomplete
            name={f.key}
            className="w-[90%] text-foreground"
            label={`Select ${f.label}`}
            placeholder={
              isDisabled && f.dependsOn
                ? `Please select ${toTitleCase(f.dependsOn)} first`
                : f.label
            }
            isDisabled={!!isDisabled}
            items={options}
            selectedKey={formData[f.key] ? String(formData[f.key]) : ""}
            onSelectionChange={(key: any) =>
              handleInputChange({
                target: {
                  name: f.key,
                  value: String(key || ""),
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
      case "multiselect":
        return (
          <>
            <Select
              selectionMode="multiple"
              isDisabled={disabled}
              selectedKeys={new Set(formData[f.key] || [])}
              onSelectionChange={(keys: any) =>
                setFormData((p) => ({ ...p, [f.key]: Array.from(keys as Set<string>) }))
              }
              placeholder={`Select ${f.label}`}
            >
              {(f.values ?? []).map((opt) => (
                <SelectItem key={opt.key} value={String(opt.key)} className="text-foreground">
                  {opt.value}
                </SelectItem>
              ))}
            </Select>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(formData[f.key] || []).map((val: string) => {
                const options =
                  f.dependsOn && dynamicOptions[f.key]
                    ? dynamicOptions[f.key]
                    : f.dynamicValuesFn
                      ? dynamicOptions[f.key] || []
                      : f.values || [];
                const label = options.find((opt: any) => String(opt.key) === String(val))?.value || val;
                return (
                  <Chip
                    isDisabled={disabled}
                    key={val}
                    onClose={() =>
                      setFormData((p) => ({
                        ...p,
                        [f.key]: p[f.key].filter((x: string) => x !== val),
                      }))
                    }
                    className="text-foreground"
                  >
                    {label}
                  </Chip>
                );
              })}
            </div>
          </>
        );
      case "file":
      case "image":
        return (
          <div>
            <label>{f.label}</label>
            {uppyRef.current && (
              <Dashboard
                uppy={uppyRef.current}
                hideUploadButton
                proudlyDisplayPoweredByUppy={false}
                note="Only images & PDFs"
              />
            )}
            {formData[f.key] && (
              <div className="mt-2 text-foreground">
                {/\.(pdf|PDF)$/.test(formData[f.key]) ? (
                  <a href={formData[f.key]} target="_blank" rel="noopener">
                    View PDF
                  </a>
                ) : (
                  // @ts-ignore
                  <Image
                    src={`${process.env.NEXT_PUBLIC_UPLOADS_URL}${formData[f.key]}`}
                    width={100}
                    height={100}
                    alt="preview"
                  />
                )}
              </div>
            )}
          </div>
        );
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
      <Button
        color="warning"
        className="text-white"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Edit
      </Button>

      <Modal
        isDismissable={false}
        isOpen={open}
        onClose={() => setOpen(false)}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Edit {capitalize(currentTable)}</ModalHeader>

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
              <form onSubmit={handleSubmit}>
                {formFields
                  .filter((f) => f.inEdit)
                  .map((f, i) => (
                    <div key={i} className="mb-4">
                      {renderField(f)}
                    </div>
                  ))}

                <div className="flex justify-end mt-4">
                  <Button
                    type="submit"
                    disabled={loading || (isLocked && !formData.isLive)}
                  >
                    {loading ? "Updating…" : "Update"}
                  </Button>
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
