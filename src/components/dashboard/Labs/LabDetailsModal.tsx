"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { apiRoutes } from "@/core/api/apiRoutes";
import { getData, postData } from "@/core/api/apiHandler";
import { extractList } from "@/core/data/queryUtils";
import { showToastMessage } from "@/utils/utils";

type LabDetailsModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

type TagSectionProps = {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  masterOptions: string[];
  placeholder: string;
};

const normalizeTag = (value: string) => String(value || "").trim();

function TagSection({ label, tags, setTags, masterOptions, placeholder }: TagSectionProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const next = normalizeTag(raw);
    if (!next) return;
    if (tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) return;
    setTags([...tags, next]);
    setDraft("");
  };

  const removeTag = (value: string) => {
    setTags(tags.filter((tag) => tag !== value));
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-default-500">{label}</p>
      <Select
        aria-label={`${label} master options`}
        selectionMode="multiple"
        selectedKeys={new Set(tags)}
        onSelectionChange={(keys) => {
          if (keys === "all") return;
          const selected = Array.from(keys as Set<React.Key>).map((k) => String(k));
          setTags(selected);
        }}
        variant="bordered"
        radius="lg"
        classNames={{
          trigger: "bg-content1/50 border-divider shadow-inner min-h-12",
        }}
      >
        {masterOptions.map((option) => (
          <SelectItem key={option} textValue={option}>
            {option}
          </SelectItem>
        ))}
      </Select>
      <div className="flex gap-2">
        <Input
          value={draft}
          onValueChange={setDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag(draft);
            }
          }}
          placeholder={placeholder}
          variant="bordered"
          radius="lg"
          classNames={{
            inputWrapper: "bg-content1/50 border-divider shadow-inner h-12 ring-0 outline-none data-[focus=true]:ring-0 data-[focus-visible=true]:ring-0 data-[focus=true]:border-default-400 data-[focus-visible=true]:border-default-400",
            input: "text-sm leading-5 focus:outline-none focus:ring-0 focus-visible:outline-none",
          }}
        />
        <Button color="success" variant="flat" className="font-bold uppercase text-[10px] tracking-widest h-12 px-4" onPress={() => addTag(draft)}>
          Add
        </Button>
      </div>
      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Chip key={tag} variant="flat" color="success" onClose={() => removeTag(tag)}>
              {tag}
            </Chip>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-default-500">No entries yet.</p>
      )}
    </div>
  );
}

export default function LabDetailsModal({ isOpen, onOpenChange }: LabDetailsModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    phoneSecondary: "",
    companyType: "",
    country: "",
    state: "",
    district: "",
    division: "",
    pincodeEntry: "",
    address: "",
    description: "",
  });
  const [labTests, setLabTests] = useState<string[]>([]);
  const [labCertifications, setLabCertifications] = useState<string[]>([]);
  const [labSpecifications, setLabSpecifications] = useState<string[]>([]);
  const [labAcceptedItems, setLabAcceptedItems] = useState<string[]>([]);
  const [labNotes, setLabNotes] = useState("");

  const companyTypesQuery = useQuery({
    queryKey: ["lab-details-company-types"],
    queryFn: async () => extractList(await getData(apiRoutes.companyType.getAll, { page: 1, limit: 300, sort: "name:asc" })),
    enabled: isOpen,
  });
  const countriesQuery = useQuery({
    queryKey: ["lab-details-countries"],
    queryFn: async () => extractList(await getData(apiRoutes.country.getAll, { page: 1, limit: 400, sort: "name:asc" })),
    enabled: isOpen,
  });
  const statesQuery = useQuery({
    queryKey: ["lab-details-states"],
    queryFn: async () => extractList(await getData(apiRoutes.state.getAll, { page: 1, limit: 400, sort: "name:asc" })),
    enabled: isOpen,
  });
  const districtsQuery = useQuery({
    queryKey: ["lab-details-districts", form.state],
    queryFn: async () => extractList(await getData(apiRoutes.district.getAll, { state: form.state, page: 1, limit: 400, sort: "name:asc" })),
    enabled: isOpen && Boolean(form.state),
  });
  const divisionsQuery = useQuery({
    queryKey: ["lab-details-divisions", form.district],
    queryFn: async () => extractList(await getData(apiRoutes.division.getAll, { district: form.district, page: 1, limit: 400, sort: "name:asc" })),
    enabled: isOpen && Boolean(form.district),
  });
  const pincodesQuery = useQuery({
    queryKey: ["lab-details-pincodes", form.district],
    queryFn: async () => extractList(await getData(apiRoutes.pincodeEntry.getAll, { district: form.district, page: 1, limit: 500, sort: "officename:asc" })),
    enabled: isOpen && Boolean(form.district),
  });
  const certificationsQuery = useQuery({
    queryKey: ["lab-details-certifications-master"],
    queryFn: async () => extractList(await getData(apiRoutes.certification.getAll, { page: 1, limit: 500, sort: "name:asc" })),
    enabled: isOpen,
  });

  const certificationOptions = useMemo(
    () =>
      (Array.isArray(certificationsQuery.data) ? certificationsQuery.data : [])
        .map((row: any) => String(row?.name || "").trim())
        .filter(Boolean),
    [certificationsQuery.data]
  );

  const requiredValid = Boolean(
    form.name.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.phoneSecondary.trim() &&
      form.companyType.trim()
  );

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      phoneSecondary: "",
      companyType: "",
      country: "",
      state: "",
      district: "",
      division: "",
      pincodeEntry: "",
      address: "",
      description: "",
    });
    setLabTests([]);
    setLabCertifications([]);
    setLabSpecifications([]);
    setLabAcceptedItems([]);
    setLabNotes("");
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {
        ...form,
        serviceCapabilities: ["QUALITY_TESTING"],
        labTests,
        labCertifications,
        labSpecifications,
        labAcceptedItems,
        labNotes: labNotes.trim(),
      };

      ["country", "state", "district", "division", "pincodeEntry"].forEach((key) => {
        if (!String(payload[key] || "").trim()) delete payload[key];
      });

      return postData(apiRoutes.associateCompany.getAll, payload);
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Quality lab details added." });
      queryClient.invalidateQueries({ queryKey: ["quality-labs-directory"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Unable to add lab details.",
      });
    },
  });

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" scrollBehavior="inside" backdrop="blur" classNames={{ base: "border border-divider/50 bg-content1/95" }}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-2xl font-black italic tracking-tight uppercase text-foreground">Lab Details</h3>
              <p className="text-[11px] text-default-500 uppercase tracking-[0.16em]">Quality testing and certification profile</p>
            </ModalHeader>
            <ModalBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Lab Name" labelPlacement="outside" variant="bordered" radius="lg" value={form.name} onValueChange={(v) => setForm((c) => ({ ...c, name: v }))} isRequired classNames={{ inputWrapper: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }} />
                <Input label="Lab Email" labelPlacement="outside" variant="bordered" radius="lg" value={form.email} onValueChange={(v) => setForm((c) => ({ ...c, email: v }))} isRequired classNames={{ inputWrapper: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }} />
                <Input label="Primary Phone" labelPlacement="outside" variant="bordered" radius="lg" value={form.phone} onValueChange={(v) => setForm((c) => ({ ...c, phone: v }))} isRequired classNames={{ inputWrapper: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }} />
                <Input label="Secondary Phone" labelPlacement="outside" variant="bordered" radius="lg" value={form.phoneSecondary} onValueChange={(v) => setForm((c) => ({ ...c, phoneSecondary: v }))} isRequired classNames={{ inputWrapper: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }} />
                <Select label="Company Type" labelPlacement="outside" variant="bordered" radius="lg" selectedKeys={form.companyType ? new Set([form.companyType]) : new Set()} onSelectionChange={(keys) => setForm((c) => ({ ...c, companyType: String(Array.from(keys as Set<string>)[0] || "") }))} isRequired classNames={{ trigger: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }}>
                  {(companyTypesQuery.data || []).map((type: any) => (
                    <SelectItem key={String(type?._id || type?.id)} textValue={String(type?.name || "")}>
                      {String(type?.name || "Company Type")}
                    </SelectItem>
                  ))}
                </Select>
                <Input label="Address" labelPlacement="outside" variant="bordered" radius="lg" value={form.address} onValueChange={(v) => setForm((c) => ({ ...c, address: v }))} classNames={{ inputWrapper: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }} />
                <Select label="Country" labelPlacement="outside" variant="bordered" radius="lg" selectedKeys={form.country ? new Set([form.country]) : new Set()} onSelectionChange={(keys) => setForm((c) => ({ ...c, country: String(Array.from(keys as Set<string>)[0] || "") }))} classNames={{ trigger: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }}>
                  {(countriesQuery.data || []).map((row: any) => (
                    <SelectItem key={String(row?._id || row?.id)} textValue={String(row?.name || "")}>
                      {String(row?.name || "Country")}
                    </SelectItem>
                  ))}
                </Select>
                <Select label="State" labelPlacement="outside" variant="bordered" radius="lg" selectedKeys={form.state ? new Set([form.state]) : new Set()} onSelectionChange={(keys) => setForm((c) => ({ ...c, state: String(Array.from(keys as Set<string>)[0] || ""), district: "", division: "", pincodeEntry: "" }))} classNames={{ trigger: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }}>
                  {(statesQuery.data || []).map((row: any) => (
                    <SelectItem key={String(row?._id || row?.id)} textValue={String(row?.name || "")}>
                      {String(row?.name || "State")}
                    </SelectItem>
                  ))}
                </Select>
                <Select label="District" labelPlacement="outside" variant="bordered" radius="lg" selectedKeys={form.district ? new Set([form.district]) : new Set()} onSelectionChange={(keys) => setForm((c) => ({ ...c, district: String(Array.from(keys as Set<string>)[0] || ""), division: "", pincodeEntry: "" }))} classNames={{ trigger: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }}>
                  {(districtsQuery.data || []).map((row: any) => (
                    <SelectItem key={String(row?._id || row?.id)} textValue={String(row?.name || "")}>
                      {String(row?.name || "District")}
                    </SelectItem>
                  ))}
                </Select>
                <Select label="Division" labelPlacement="outside" variant="bordered" radius="lg" selectedKeys={form.division ? new Set([form.division]) : new Set()} onSelectionChange={(keys) => setForm((c) => ({ ...c, division: String(Array.from(keys as Set<string>)[0] || "") }))} classNames={{ trigger: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }}>
                  {(divisionsQuery.data || []).map((row: any) => (
                    <SelectItem key={String(row?._id || row?.id)} textValue={String(row?.name || "")}>
                      {String(row?.name || "Division")}
                    </SelectItem>
                  ))}
                </Select>
                <Select label="Pincode Entry" labelPlacement="outside" variant="bordered" radius="lg" selectedKeys={form.pincodeEntry ? new Set([form.pincodeEntry]) : new Set()} onSelectionChange={(keys) => setForm((c) => ({ ...c, pincodeEntry: String(Array.from(keys as Set<string>)[0] || "") }))} classNames={{ trigger: "bg-content1/50 border-divider shadow-inner h-12", label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500" }}>
                  {(pincodesQuery.data || []).map((row: any) => {
                    const key = String(row?._id || row?.id);
                    const title = String(row?.officename || row?.pincode || "Pincode");
                    return (
                      <SelectItem key={key} textValue={title}>
                        {title}
                      </SelectItem>
                    );
                  })}
                </Select>
              </div>

              <TagSection label="Lab Tests" tags={labTests} setTags={setLabTests} masterOptions={["Microbiology", "Heavy Metals", "Pesticide Residue", "Moisture Analysis", "Shelf-Life Testing"]} placeholder="Add custom lab test" />
              <TagSection label="Certifications" tags={labCertifications} setTags={setLabCertifications} masterOptions={certificationOptions} placeholder="Add custom certification" />
              <TagSection label="Specifications" tags={labSpecifications} setTags={setLabSpecifications} masterOptions={["ISO 17025", "NABL Protocol", "FSSAI Compliance", "AOAC Method", "HACCP Audit"]} placeholder="Add custom specification" />
              <TagSection label="Accepted Items" tags={labAcceptedItems} setTags={setLabAcceptedItems} masterOptions={["Spices", "Grains", "Herbs", "Pulses", "Oil Seeds", "Extracts"]} placeholder="Add accepted item category" />

              <Textarea
                label="Lab Notes"
                labelPlacement="outside"
                variant="bordered"
                minRows={3}
                value={labNotes}
                onValueChange={setLabNotes}
                placeholder="Add lab operational notes, constraints, sample handling preferences, or timelines."
                classNames={{
                  inputWrapper: "bg-content1/50 border-divider shadow-inner ring-0 outline-none data-[focus=true]:ring-0 data-[focus-visible=true]:ring-0 data-[focus=true]:border-default-400 data-[focus-visible=true]:border-default-400",
                  input: "text-sm leading-5 focus:outline-none focus:ring-0 focus-visible:outline-none",
                  label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500",
                }}
              />
              <Textarea
                label="Public Summary"
                labelPlacement="outside"
                variant="bordered"
                minRows={2}
                value={form.description}
                onValueChange={(v) => setForm((c) => ({ ...c, description: v }))}
                placeholder="Optional short summary used in card previews."
                classNames={{
                  inputWrapper: "bg-content1/50 border-divider shadow-inner ring-0 outline-none data-[focus=true]:ring-0 data-[focus-visible=true]:ring-0 data-[focus=true]:border-default-400 data-[focus-visible=true]:border-default-400",
                  input: "text-sm leading-5 focus:outline-none focus:ring-0 focus-visible:outline-none",
                  label: "text-[9px] font-black uppercase tracking-widest ml-1 mb-2 text-default-500",
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} className="font-black uppercase text-[10px] tracking-widest h-10 px-8">
                Cancel
              </Button>
              <Button
                color="success"
                isLoading={createMutation.isPending}
                isDisabled={!requiredValid}
                onPress={() => createMutation.mutate()}
                className="font-black uppercase text-[10px] tracking-widest h-10 px-8"
              >
                Add Lab Details
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
