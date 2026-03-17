"use client";

import React from "react";
import { Button, Select, SelectItem, Switch } from "@nextui-org/react";

export type DocRuleDraft = {
  docType: string;
  actionType: string;
  visibility: string;
  responsibleRole: string;
  tradeType: string;
  isRequired: boolean;
};

type DocRulesEditorProps = {
  docTypes: string[];
  selectedDocs: DocRuleDraft[];
  setSelectedDocs: React.Dispatch<React.SetStateAction<DocRuleDraft[]>>;
  defaults: {
    actionType: string;
    visibility: string;
    responsibleRole: string;
    tradeType: string;
  };
  actionTypes: string[];
  visibilityOptions: string[];
  responsibleRoles: string[];
  tradeTypes: string[];
};

export default function DocRulesEditor({
  docTypes,
  selectedDocs,
  setSelectedDocs,
  defaults,
  actionTypes,
  visibilityOptions,
  responsibleRoles,
  tradeTypes,
}: DocRulesEditorProps) {
  const [newDocType, setNewDocType] = React.useState<string>("");

  return (
    <div className="pt-2">
      <div className="text-sm font-semibold mb-2">Required Documents</div>
      <div className="flex gap-2 items-end flex-wrap">
        <Select
          label="Add Document"
          className="min-w-[220px]"
          selectedKeys={newDocType ? [newDocType] : []}
          onSelectionChange={(keys) => setNewDocType(String(Array.from(keys)[0] || ""))}
        >
          {docTypes.filter((t) => !selectedDocs.some((d) => d.docType === t)).map((t) => (
            <SelectItem key={t}>{t}</SelectItem>
          ))}
        </Select>
        <Button
          size="sm"
          onPress={() => {
            if (!newDocType) return;
            setSelectedDocs((prev) => [
              ...prev,
              {
                docType: newDocType,
                actionType: defaults.actionType,
                visibility: defaults.visibility,
                responsibleRole: defaults.responsibleRole,
                tradeType: defaults.tradeType,
                isRequired: true,
              },
            ]);
            setNewDocType("");
          }}
        >
          Add
        </Button>
      </div>

      {selectedDocs.length === 0 ? (
        <div className="mt-3 text-xs text-default-500">No documents selected for this stage.</div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {selectedDocs.map((doc, idx) => (
            <div key={doc.docType} className="rounded-lg border border-default-200/70 p-3 bg-default-50/40">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">{doc.docType}</div>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => setSelectedDocs((prev) => prev.filter((d) => d.docType !== doc.docType))}
                >
                  Remove
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Select
                  label="Action Type"
                  selectedKeys={[doc.actionType]}
                  onSelectionChange={(keys) => {
                    const value = String(Array.from(keys)[0] || defaults.actionType);
                    setSelectedDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, actionType: value } : d)));
                  }}
                >
                  {actionTypes.map((a) => (
                    <SelectItem key={a}>{a}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Visibility"
                  selectedKeys={[doc.visibility]}
                  onSelectionChange={(keys) => {
                    const value = String(Array.from(keys)[0] || defaults.visibility);
                    setSelectedDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, visibility: value } : d)));
                  }}
                >
                  {visibilityOptions.map((v) => (
                    <SelectItem key={v}>{v}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Responsible Role"
                  selectedKeys={[doc.responsibleRole]}
                  onSelectionChange={(keys) => {
                    const value = String(Array.from(keys)[0] || defaults.responsibleRole);
                    setSelectedDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, responsibleRole: value } : d)));
                  }}
                >
                  {responsibleRoles.map((r) => (
                    <SelectItem key={r}>{r}</SelectItem>
                  ))}
                </Select>
                <Select
                  label="Trade Type"
                  selectedKeys={[doc.tradeType]}
                  onSelectionChange={(keys) => {
                    const value = String(Array.from(keys)[0] || defaults.tradeType);
                    setSelectedDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, tradeType: value } : d)));
                  }}
                >
                  {tradeTypes.map((t) => (
                    <SelectItem key={t}>{t}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="mt-2">
                <Switch
                  isSelected={doc.isRequired}
                  onValueChange={(value) =>
                    setSelectedDocs((prev) => prev.map((d, i) => (i === idx ? { ...d, isRequired: value } : d)))
                  }
                >
                  Required
                </Switch>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
