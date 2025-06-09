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
} from "@nextui-org/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getData, patchData } from "@/core/api/apiHandler";
import { queryClient } from "@/app/provider";
import { toast } from "react-toastify";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { Dashboard } from "@uppy/react";
import Image from "next/image";
import { parseDate } from "@internationalized/date";
import { EditModalProps, FormField } from "@/data/interface-data";

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

  // 6) Input handlers
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const handleSelection = (key: string, keys: Set<string>) => {
    setFormData((p) => ({ ...p, [key]: Array.from(keys) }));
  };
  const handleDate = (key: string, d: any) =>
    setFormData((p) => ({ ...p, [key]: d.toString() }));
  const handleBool = (key: string, v: boolean) =>
    setFormData((p) => ({ ...p, [key]: v }));
  const handleTime = (key: string, t: any) =>
    setFormData((p) => ({ ...p, [key]: t }));

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
            value={val}
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
      case "time":
        return (
          <TimeInput
            label={f.label}
            value={formData[f.key] || ""}
            isDisabled={disabled}
            onChange={(t) => handleTime(f.key, t)}
          />
        );
      case "select":
        return (
          <Select
            placeholder={`Select ${f.label}`}
            isDisabled={disabled}
            selectedKeys={
              new Set(formData[f.key] ? [String(formData[f.key])] : [])
            }
            onSelectionChange={(keys) =>
              handleChange({
                target: { name: f.key, value: Array.from(keys)[0] },
              })
            }
          >
            {(f.values ?? []).map((opt) => (
              <SelectItem key={opt.key} value={String(opt.key)}>
                {opt.value}
              </SelectItem>
            ))}
          </Select>
        );
      case "multiselect":
        return (
          <>
            <Select
              selectionMode="multiple"
              isDisabled={disabled}
              selectedKeys={new Set(formData[f.key] || [])}
              onSelectionChange={(keys) =>
                handleSelection(f.key, keys as Set<string>)
              }
              placeholder={`Select ${f.label}`}
            >
              {(f.values ?? []).map((opt) => (
                <SelectItem key={opt.key} value={String(opt.key)}>
                  {opt.value}
                </SelectItem>
              ))}
            </Select>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(formData[f.key] || []).map((val: string) => (
                <Chip
                  isDisabled={disabled}
                  key={val}
                  onClose={() =>
                    setFormData((p) => ({
                      ...p,
                      [f.key]: p[f.key].filter((x: string) => x !== val),
                    }))
                  }
                >
                  {val}
                </Chip>
              ))}
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
              <div className="mt-2">
                {/\.(pdf|PDF)$/.test(formData[f.key]) ? (
                  <a href={formData[f.key]} target="_blank" rel="noopener">
                    View PDF
                  </a>
                ) : (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_UPLOADS_URL}${
                      formData[f.key]
                    }`}
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
            onChange={handleChange}
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

      <Modal isOpen={open} onClose={() => setOpen(false)} size="lg">
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
