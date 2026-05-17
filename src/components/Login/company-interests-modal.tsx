"use client";

import React, { useMemo, useState } from "react";
import { Button, Chip, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@nextui-org/react";
import { putData } from "@/core/api/apiHandler";
import { showToastMessage } from "@/utils/utils";

const INTEREST_OPTIONS = [
  { key: "PROCUREMENT", label: "Procurement" },
  { key: "CERTIFICATION", label: "Certification" },
  { key: "TRANSPORTATION", label: "Transportation" },
  { key: "SHIPPING", label: "Shipping" },
  { key: "PACKAGING", label: "Packaging" },
  { key: "QUALITY_TESTING", label: "Quality Testing" },
];
const INTEREST_LABEL_MAP = INTEREST_OPTIONS.reduce<Record<string, string>>((acc, item) => {
  acc[item.key] = item.label;
  return acc;
}, {});

type Props = {
  open: boolean;
  associateCompanyId?: string | null;
  initialInterests?: string[];
  title?: string;
  saveLabel?: string;
  onClose?: () => void;
  onSaved: (interests: string[]) => void;
};

export default function CompanyInterestsModal({
  open,
  associateCompanyId,
  initialInterests = [],
  title = "Set Company Responsibilities",
  saveLabel = "Save & Continue",
  onClose,
  onSaved,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [isInterestsSelectOpen, setIsInterestsSelectOpen] = useState(false);
  const modalContentRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!open) return;
    setSelected(Array.isArray(initialInterests) ? initialInterests : []);
  }, [open, initialInterests]);

  const canSave = useMemo(() => selected.length > 0 && Boolean(associateCompanyId), [selected, associateCompanyId]);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await putData("/auth/company-interests", {
        associateCompanyId,
        interests: selected,
      });
      showToastMessage({ type: "success", message: "Company interests saved.", position: "top-right" });
      onSaved(selected);
    } catch (error: any) {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to save company interests.",
        position: "top-right",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        if (isInterestsSelectOpen) return;
        onClose?.();
      }}
      isDismissable={false}
      isKeyboardDismissDisabled={saving}
      shouldCloseOnInteractOutside={() => false}
      hideCloseButton={saving}
      size="lg"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <div ref={modalContentRef}>
          <ModalBody className="gap-3">
            <p className="text-sm text-default-600">
              Select the responsibilities your company handles. Execution panel enquiries will be routed based on this.
            </p>
            <Select
              label="Responsibilities / Interests"
              labelPlacement="outside"
              selectionMode="multiple"
              selectedKeys={new Set(selected)}
              onOpenChange={(isOpen) => setIsInterestsSelectOpen(isOpen)}
              onSelectionChange={(keys) => setSelected(Array.from(keys as Set<string>).map((x) => String(x)))}
              renderValue={() => (
                <div className="whitespace-normal break-words leading-snug">
                  {selected.map((item) => INTEREST_LABEL_MAP[item] || item.replace(/_/g, " ")).join(", ")}
                </div>
              )}
              classNames={{
                value: "whitespace-normal break-words",
              }}
              popoverProps={{
                shouldCloseOnBlur: false,
                portalContainer: modalContentRef.current || undefined,
                classNames: {
                  content: "max-h-72 overflow-y-auto",
                },
              }}
              listboxProps={{
                className: "max-h-72 overflow-y-auto",
              }}
            >
              {INTEREST_OPTIONS.map((item) => (
                <SelectItem key={item.key} value={item.key}>
                  {item.label}
                </SelectItem>
              ))}
            </Select>
            {selected.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selected.map((item) => (
                  <Chip key={item} size="sm" color="primary" variant="flat">
                    {INTEREST_LABEL_MAP[item] || item.replace(/_/g, " ")}
                  </Chip>
                ))}
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter>
            {onClose ? (
              <Button variant="light" onPress={onClose} isDisabled={saving}>
                Cancel
              </Button>
            ) : null}
            <Button color="warning" onPress={handleSave} isDisabled={!canSave} isLoading={saving}>
              {saveLabel}
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
}
