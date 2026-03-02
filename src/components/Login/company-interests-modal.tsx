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

type Props = {
  open: boolean;
  associateCompanyId?: string | null;
  onSaved: (interests: string[]) => void;
};

export default function CompanyInterestsModal({ open, associateCompanyId, onSaved }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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
    <Modal isOpen={open} isDismissable={false} hideCloseButton size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Set Company Responsibilities</ModalHeader>
        <ModalBody className="gap-3">
          <p className="text-sm text-default-600">
            Select the responsibilities your company handles. Execution panel enquiries will be routed based on this.
          </p>
          <Select
            label="Responsibilities / Interests"
            labelPlacement="outside"
            selectionMode="multiple"
            selectedKeys={new Set(selected)}
            onSelectionChange={(keys) => setSelected(Array.from(keys as Set<string>).map((x) => String(x)))}
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
                  {item.replace(/_/g, " ")}
                </Chip>
              ))}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onPress={handleSave} isDisabled={!canSave} isLoading={saving}>
            Save & Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
