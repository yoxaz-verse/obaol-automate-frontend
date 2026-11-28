"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Chip, Input, Select, SelectItem, Spinner, Textarea } from "@nextui-org/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiMapPin, FiPackage, FiPlus, FiSave, FiTrash2, FiUser } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { DashboardPanel } from "@/components/dashboard/DashboardUI";
import LocationSelector from "@/components/location/LocationSelector";
import SearchableSelect from "@/components/ui/SearchableSelect";
import AppCombobox from "@/components/ui/AppCombobox";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { packagingRoutes } from "@/core/api/apiRoutes";
import { isValidCoordinate, toStructuredLocation, type StructuredLocation } from "@/types/location";
import { emptyCapability, emptyPackagingUnit, PackagingUnitSnapshot } from "@/types/packagingUnit";

export type PackagingStep = "details" | "location" | "capabilities" | "review";
const steps: Array<{ key: PackagingStep; label: string; icon: typeof FiUser }> = [
  { key: "details", label: "Details", icon: FiUser },
  { key: "location", label: "Location", icon: FiMapPin },
  { key: "capabilities", label: "Capabilities", icon: FiPackage },
  { key: "review", label: "Review", icon: FiCheckCircle },
];
const message = (error: any) => error?.response?.data?.message || "Unable to save this packaging unit.";
const optionId = (value: any) => String(value?._id || value || "");
const quantityUnits = ["KG", "MT", "Quintal", "UNIT"];
const taxonomyFields: Record<string, { label: string; requestLabel: string; key: string; required: boolean; guidance: string; example: string }> = {
  SERVICE: { label: "Services", requestLabel: "service", key: "serviceIds", required: true, guidance: "Choose the packaging services you provide.", example: "For example: filling, sealing, labelling or repacking." },
  FORMAT: { label: "Packaging formats", requestLabel: "packaging format", key: "formatIds", required: true, guidance: "Choose the packaging formats your facility supports.", example: "For example: bags, pouches, cartons or bulk packs." },
  MATERIAL: { label: "Packaging materials", requestLabel: "packaging material", key: "materialIds", required: true, guidance: "Choose the packaging materials you can work with.", example: "For example: paper, plastic, jute or laminated film." },
  COMMODITY: { label: "Commodities", requestLabel: "commodity", key: "commodityIds", required: true, guidance: "Choose the agricultural commodities you can package.", example: "For example: rice, wheat, pulses or spices." },
  MACHINERY: { label: "Machinery (optional)", requestLabel: "machinery option", key: "machineryIds", required: false, guidance: "Choose the machinery and equipment available at your facility.", example: "Add a request below if your equipment is not listed." },
  QUALITY_OPTION: { label: "Quality options (optional)", requestLabel: "quality option", key: "qualityOptionIds", required: false, guidance: "Choose the standards, grades or inspection options your facility supports.", example: "Add a request below if the required quality option is not listed." },
};
const normalizedSnapshot = (form: PackagingUnitSnapshot): PackagingUnitSnapshot => ({
  ...form,
  capabilities: form.capabilities.map((capability) => ({
    ...capability,
    minimumQuantity: capability.minimumQuantity === "" ? 0 : Number(capability.minimumQuantity),
    capacityPerDay: capability.capacityPerDay === "" ? 0 : Number(capability.capacityPerDay),
    turnaroundDays: capability.turnaroundDays === "" ? 0 : Number(capability.turnaroundDays),
  })),
});
const cleanSnapshot = (value: any): PackagingUnitSnapshot => {
  const fallback = emptyPackagingUnit();
  return { ...fallback, ...(value || {}), locations: value?.locations?.length ? value.locations : fallback.locations, capabilities: value?.capabilities?.length ? value.capabilities : fallback.capabilities };
};

export default function PackagingUnitEditor({ step, isNew = false }: { step: PackagingStep; isNew?: boolean }) {
  const router = useRouter(), params = useParams(), search = useSearchParams(), { user } = useContext(AuthContext);
  const unitId = isNew ? "" : String(params.unitId || ""), companyId = search.get("companyId") || "";
  const role = String(user?.role || "").toLowerCase(), staff = ["admin", "operator", "team"].includes(role);
  const [form, setForm] = useState<PackagingUnitSnapshot>(emptyPackagingUnit()), [problem, setProblem] = useState(""), [ready, setReady] = useState(isNew);
  const [optionRequest, setOptionRequest] = useState({ kind: "SERVICE", name: "", description: "" });
  const requestFormRef = useRef<HTMLDivElement>(null), requestNameRef = useRef<HTMLInputElement>(null);
  const unit = useQuery({ queryKey: ["packaging-unit", unitId], queryFn: async () => (await getData(packagingRoutes.unit(unitId))).data.data, enabled: !!unitId, retry: false });
  const taxonomy = useQuery({ queryKey: ["packaging-taxonomy"], queryFn: async () => (await getData(packagingRoutes.taxonomy)).data.data || [] });
  useEffect(() => { if (unit.data) { setForm(cleanSnapshot(unit.data.draft || unit.data.published)); setReady(true); } }, [unit.data]);
  const locked = !!unit.data && ["PENDING_REVIEW", "ARCHIVED"].includes(unit.data.status);
  const suffix = staff && (companyId || unit.data?.companyId?._id) ? `?companyId=${encodeURIComponent(companyId || optionId(unit.data.companyId))}` : "";
  const href = (key: PackagingStep, id = unitId) => `/dashboard/packaging/my/${id}/${key}${suffix}`;
  const save = useMutation({
    mutationFn: async () => unitId ? putData(packagingRoutes.unit(unitId), { snapshot: normalizedSnapshot(form) }) : postData(packagingRoutes.unitDrafts, { companyId: companyId || undefined, snapshot: normalizedSnapshot(form) }),
    onError: (error) => setProblem(message(error)),
  });
  const submit = useMutation({ mutationFn: async () => postData(packagingRoutes.submitUnit(unitId), {}), onSuccess: () => router.push("/dashboard/packaging/my?notice=submitted"), onError: (error) => setProblem(message(error)) });
  const requestOption = useMutation({
    mutationFn: async () => postData(packagingRoutes.taxonomyRequests, optionRequest),
    onSuccess: () => { setProblem("Packaging option submitted for admin review."); setOptionRequest({ kind: "SERVICE", name: "", description: "" }); void taxonomy.refetch(); },
    onError: (error) => setProblem(message(error)),
  });
  const saveDraft = async (next?: PackagingStep) => {
    if (locked) return;
    setProblem("");
    try {
      const response: any = await save.mutateAsync();
      const id = unitId || optionId(response?.data?.data);
      if (next) router.push(href(next, id)); else if (!unitId) router.replace(href(step, id)); else setProblem("Draft saved.");
    } catch { /* mutation displays the API error */ }
  };
  const validate = () => {
    const loc = form.locations[0], errors: string[] = [];
    if (step === "details") {
      if (!form.displayName.trim()) errors.push("Unit display name");
      if (!form.contactEmail.trim()) errors.push("Contact email");
      if (!form.contactPhone.trim()) errors.push("Contact phone");
    }
    if (step === "location") {
      if (!loc?.name?.trim()) errors.push("Facility name");
      if (!loc?.address?.trim()) errors.push("Address");
      if (!loc?.country?.trim()) errors.push("Country");
      if (!isValidCoordinate(loc?.latitude, loc?.longitude)) errors.push("Map location");
    }
    if (step === "capabilities") form.capabilities.forEach((cap, index) => {
      const prefix = `Capability ${index + 1}`;
      if (!cap.name.trim()) errors.push(`${prefix} name`);
      Object.values(taxonomyFields).filter((field) => field.required).forEach((field) => { if (!(cap as any)[field.key]?.length) errors.push(`${prefix} ${field.label.toLowerCase()}`); });
      if (cap.minimumQuantity !== "" && (!Number.isFinite(Number(cap.minimumQuantity)) || Number(cap.minimumQuantity) < 0)) errors.push(`${prefix} minimum quantity`);
      if (cap.capacityPerDay !== "" && (!Number.isFinite(Number(cap.capacityPerDay)) || Number(cap.capacityPerDay) < 0)) errors.push(`${prefix} capacity per day`);
      if (cap.turnaroundDays !== "" && (!Number.isInteger(Number(cap.turnaroundDays)) || Number(cap.turnaroundDays) < 0)) errors.push(`${prefix} turnaround days`);
    });
    if (errors.length) { setProblem(`Complete the required fields: ${errors.join(", ")}.`); return false; }
    return true;
  };
  const continueTo = () => { const index = steps.findIndex((item) => item.key === step); if (validate()) void saveDraft(steps[index + 1]?.key); };
  const setLocation = (key: string, value: any) => setForm((current) => ({ ...current, locations: [{ ...current.locations[0], [key]: value, ...(key === "country" && !current.locations[0].coverageCountries.length ? { coverageCountries: [value] } : {}) }] }));
  const setPhysicalLocation = (selected: StructuredLocation) => setForm((current) => {
    const currentLocation = current.locations[0];
    return { ...current, locations: [{ ...currentLocation, address: selected.address, city: selected.city, state: selected.state, country: selected.country, latitude: selected.latitude, longitude: selected.longitude, ...(!currentLocation.coverageCountries.length && selected.country ? { coverageCountries: [selected.country] } : {}) }] };
  });
  const setCap = (index: number, key: string, value: any) => setForm((current) => ({ ...current, capabilities: current.capabilities.map((cap, i) => i === index ? { ...cap, [key]: value } : cap) }));
  const options = (kind: string) => (taxonomy.data || []).filter((item: any) => item.kind === kind && item.status === "ACTIVE");
  const names = useMemo(() => new Map((taxonomy.data || []).map((item: any) => [optionId(item), item.name])), [taxonomy.data]);
  const requestKind = (kind: string) => {
    setOptionRequest((current) => ({ ...current, kind }));
    requestFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => requestNameRef.current?.focus(), 350);
  };
  const multi = (index: number, kind: string) => {
    const field = taxonomyFields[kind], available = options(kind);
    return <div className="space-y-2"><SearchableSelect label={field.label} required={field.required} disabled={locked || taxonomy.isLoading || taxonomy.isError} options={available.map((item: any) => ({ key: optionId(item), label: item.name, description: item.description }))} value={(form.capabilities[index] as any)[field.key].map(optionId)} onChange={(value) => setCap(index, field.key, value)} helperText={`${field.guidance} ${field.example}`} placeholder={`Search ${field.label.toLowerCase()}`} /><Button size="sm" variant="light" className="h-auto min-h-8 whitespace-normal px-2 text-left text-warning-700" isDisabled={locked} onPress={() => requestKind(kind)}>Can’t find it? Request a new {field.requestLabel}</Button>{!taxonomy.isLoading && !taxonomy.isError && !available.length ? <p className="text-xs text-default-500">No approved options are available yet.</p> : null}</div>;
  };
  const numericError = (value: number | "", whole = false) => value !== "" && (!Number.isFinite(Number(value)) || Number(value) < 0 || (whole && !Number.isInteger(Number(value))));
  if (!ready || unit.isLoading) return <div className="grid min-h-72 place-items-center"><Spinner label="Loading packaging unit…" /></div>;
  if (!isNew && unit.isError) return <DashboardPanel className="p-8 text-center"><h1 className="text-xl font-black">Packaging unit unavailable</h1><p className="mt-2 db-muted">It may not exist or you may not have access.</p><Button as={Link} href="/dashboard/packaging/my" className="mt-5">Back to units</Button></DashboardPanel>;
  const currentIndex = steps.findIndex((item) => item.key === step), loc = form.locations[0];
  const mappedLocation = isValidCoordinate(loc.latitude, loc.longitude) ? toStructuredLocation({ latitude: Number(loc.latitude), longitude: Number(loc.longitude), label: loc.address || loc.name, address: loc.address, city: loc.city, state: loc.state, country: loc.country, countryCode: "IN" }) : null;
  return <main className="mx-auto max-w-6xl space-y-5 pb-24">
    <DashboardPanel feature className="overflow-hidden p-0"><header className="p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="dashboard-label text-warning-700 dark:text-warning-400">Packaging unit setup</p><h1 className="mt-2 text-3xl font-black tracking-tight">{isNew ? "Add Packaging Unit" : form.displayName || "Packaging unit draft"}</h1><p className="mt-2 db-muted">Complete one focused section at a time. Your work can be saved as a draft.</p></div>{unit.data?.status && <Chip color={unit.data.status === "PENDING_REVIEW" ? "warning" : "default"}>{unit.data.status}</Chip>}</div>
      <nav aria-label="Packaging unit setup progress" className="mt-6 grid gap-2 border-t border-[var(--db-border-subtle)] pt-5 sm:grid-cols-4">{steps.map((item, index) => { const Icon = item.icon, available = !isNew && !!unitId; return available ? <Link key={item.key} href={href(item.key)} aria-current={item.key === step ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-bold transition ${item.key === step ? "border-warning-500 bg-warning-500/10 text-warning-700" : "border-transparent hover:bg-default-100"}`}><span className="grid h-8 w-8 place-items-center rounded-lg bg-content1"><Icon /></span><span>{index + 1}. {item.label}</span></Link> : <div key={item.key} aria-current={item.key === step ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-bold ${item.key === step ? "border-warning-500 bg-warning-500/10 text-warning-700" : "border-transparent opacity-50"}`}><span className="grid h-8 w-8 place-items-center rounded-lg bg-content1"><Icon /></span><span>{index + 1}. {item.label}</span></div>; })}</nav></header></DashboardPanel>
    {locked && <p role="alert" className="rounded-xl bg-warning-500/10 p-4 text-sm text-warning-700">This unit is {unit.data.status.toLowerCase().replaceAll("_", " ")} and cannot be edited.</p>}
    {problem && <p role="alert" className={`rounded-xl p-4 text-sm ${problem === "Draft saved." || problem.includes("submitted for admin review") ? "bg-success-500/10 text-success-600" : "bg-danger-50 text-danger"}`}>{problem}</p>}
    <DashboardPanel className="p-5 md:p-7">
      {step === "details" && <section><h2 className="text-xl font-black">Unit identity and contact</h2><p className="mt-1 text-sm db-muted">Public information customers will use to identify and contact this facility.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><Input label="Unit display name" isRequired isDisabled={locked} value={form.displayName} onValueChange={(value) => setForm({ ...form, displayName: value })} /><Input label="Contact email" type="email" isRequired isDisabled={locked} value={form.contactEmail} onValueChange={(value) => setForm({ ...form, contactEmail: value })} /><Input label="Contact phone" isRequired isDisabled={locked} value={form.contactPhone} onValueChange={(value) => setForm({ ...form, contactPhone: value })} /><Input label="WhatsApp phone" isDisabled={locked} value={form.whatsappPhone} onValueChange={(value) => setForm({ ...form, whatsappPhone: value })} /><Input label="Website" type="url" placeholder="https://" isDisabled={locked} value={form.website || "https://"} onValueChange={(value) => setForm({ ...form, website: value })} /><Textarea className="md:col-span-2" minRows={4} label="Public summary" isDisabled={locked} value={form.summary} onValueChange={(value) => setForm({ ...form, summary: value })} /></div></section>}
      {step === "location" && <section><h2 className="text-xl font-black">Physical location and service coverage</h2><p className="mt-1 text-sm db-muted">Describe where this unit operates and the markets it can serve.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><Input label="Facility name" isRequired isDisabled={locked} value={loc.name} onValueChange={(value) => setLocation("name", value)} /><Input label="Service countries" description="Comma-separated" isDisabled={locked} value={loc.coverageCountries.join(", ")} onValueChange={(value) => setLocation("coverageCountries", value.split(",").map((part) => part.trim()).filter(Boolean))} /></div><div className="mt-5"><LocationSelector required disabled={locked} countryCode="IN" value={mappedLocation} onChange={setPhysicalLocation} label="Search for a facility location in India" /></div></section>}
      {step === "capabilities" && <section className="pb-28 sm:pb-20"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">Packaging capabilities</h2><p className="mt-1 text-sm db-muted">Choose approved options for each capability. Use Notes for free-form specifications or special requirements.</p></div><Button color="warning" startContent={<FiPlus />} isDisabled={locked} onPress={() => setForm({ ...form, capabilities: [...form.capabilities, emptyCapability()] })}>Add capability</Button></div>{taxonomy.isError ? <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-danger-50 p-4 text-sm text-danger"><span>Approved packaging options could not be loaded.</span><Button size="sm" color="danger" variant="flat" onPress={() => taxonomy.refetch()}>Retry</Button></div> : taxonomy.isLoading ? <p role="status" className="mt-5 rounded-xl bg-default-100 p-4 text-sm db-muted">Loading approved packaging options…</p> : null}<Card ref={requestFormRef} className="mt-5 scroll-mt-24 border border-warning-300/40"><CardBody className="gap-4 p-5"><div><h3 className="font-black">Can’t find a packaging option?</h3><p className="mt-1 text-sm db-muted">Request a new option here. It becomes selectable after administrator approval.</p></div><div className="grid gap-3 md:grid-cols-3"><AppCombobox label="Option type" disabled={locked} value={optionRequest.kind} onChange={value => setOptionRequest({ ...optionRequest, kind: value || "SERVICE" })} options={["SERVICE", "FORMAT", "MATERIAL", "COMMODITY", "MACHINERY", "QUALITY_OPTION"].map(kind => ({ key: kind, label: kind.replaceAll("_", " ") }))} /><Input ref={requestNameRef} label="Option name" description="Enter the specific approved-list option you need." isDisabled={locked} value={optionRequest.name} onValueChange={(name) => setOptionRequest({ ...optionRequest, name })} /><Input label="Description" description="Explain what the option means or how your facility uses it." isDisabled={locked} value={optionRequest.description} onValueChange={(description) => setOptionRequest({ ...optionRequest, description })} /></div><div className="flex justify-end"><Button variant="flat" color="warning" isDisabled={locked || !optionRequest.name.trim()} isLoading={requestOption.isPending} onPress={() => requestOption.mutate()}>Submit option for approval</Button></div></CardBody></Card><div className="mt-6 space-y-5">{form.capabilities.map((cap, index) => <Card key={index} className="scroll-mb-32 border border-default-200"><CardBody className="gap-5 p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-warning-600">Capability {index + 1}</p><b>{cap.name || "Untitled capability"}</b></div>{form.capabilities.length > 1 && <Button isIconOnly color="danger" variant="light" aria-label={`Remove capability ${index + 1}`} isDisabled={locked} onPress={() => setForm({ ...form, capabilities: form.capabilities.filter((_, i) => i !== index) })}><FiTrash2 /></Button>}</div><div className="grid gap-5 md:grid-cols-2"><Input label="Capability name" description="Give this capability a short name, such as Retail rice pouch packing." placeholder="e.g. Retail rice pouch packing" isRequired isDisabled={locked} value={cap.name} onValueChange={(value) => setCap(index, "name", value)} />{multi(index, "SERVICE")}{multi(index, "FORMAT")}{multi(index, "MATERIAL")}{multi(index, "COMMODITY")}{multi(index, "MACHINERY")}{multi(index, "QUALITY_OPTION")}<Select label="Quantity unit" description="Used for minimum quantity and daily capacity." isDisabled={locked} selectedKeys={[cap.quantityUnit]} onSelectionChange={(keys) => setCap(index, "quantityUnit", String(Array.from(keys)[0] || "KG"))}>{quantityUnits.map((unit) => <SelectItem key={unit}>{unit}</SelectItem>)}</Select><Input label="Minimum quantity" description={`Minimum amount accepted per packaging order (${cap.quantityUnit}).`} placeholder="0" type="number" min={0} step="any" isInvalid={numericError(cap.minimumQuantity)} errorMessage="Enter zero or a positive quantity." isDisabled={locked} value={String(cap.minimumQuantity)} onValueChange={(value) => setCap(index, "minimumQuantity", value === "" ? "" : Number(value))} /><Input label="Capacity per day" description={`Maximum packaging capacity per day (${cap.quantityUnit}).`} placeholder="0" type="number" min={0} step="any" isInvalid={numericError(cap.capacityPerDay)} errorMessage="Enter zero or a positive capacity." isDisabled={locked} value={String(cap.capacityPerDay)} onValueChange={(value) => setCap(index, "capacityPerDay", value === "" ? "" : Number(value))} /><Input label="Turnaround days" description="Estimated whole number of days required to complete an order." placeholder="0" type="number" min={0} step={1} isInvalid={numericError(cap.turnaroundDays, true)} errorMessage="Enter zero or a positive whole number of days." isDisabled={locked} value={String(cap.turnaroundDays)} onValueChange={(value) => setCap(index, "turnaroundDays", value === "" ? "" : Number(value))} /><Textarea className="md:col-span-2 scroll-mb-40" minRows={4} label="Notes / custom options" description="Add other packaging capabilities, specifications or special requirements. This is free-form text." placeholder="Describe custom pack sizes, special handling, printing, labelling or other requirements." isDisabled={locked} value={cap.notes} onValueChange={(value) => setCap(index, "notes", value)} /></div></CardBody></Card>)}</div></section>}
      {step === "review" && <section><h2 className="text-xl font-black">Review your packaging unit</h2><p className="mt-1 text-sm db-muted">Check the information below before sending it to OBAOL for verification.</p><div className="mt-6 grid gap-4 lg:grid-cols-2"><Review title="Identity and contact" editHref={href("details")} locked={locked} rows={[["Unit", form.displayName], ["Email", form.contactEmail], ["Phone", form.contactPhone], ["Website", form.website], ["Summary", form.summary]]} /><Review title="Location and coverage" editHref={href("location")} locked={locked} rows={[["Facility", loc.name], ["Address", [loc.address, loc.city, loc.state, loc.country].filter(Boolean).join(", ")], ["Service countries", loc.coverageCountries.join(", ")]]} /><Card className="border border-default-200 lg:col-span-2"><CardBody className="gap-4 p-5"><div className="flex justify-between"><div><h3 className="font-black">Capabilities</h3><p className="text-sm db-muted">{form.capabilities.length} configured</p></div>{!locked && <Button as={Link} href={href("capabilities")} size="sm" variant="flat">Edit</Button>}</div>{form.capabilities.map((cap, index) => <div key={index} className="rounded-xl bg-default-100 p-4"><b>{cap.name || `Capability ${index + 1}`}</b><p className="mt-1 text-xs db-muted">{[...cap.serviceIds, ...cap.formatIds, ...cap.materialIds, ...cap.commodityIds].map((id) => names.get(optionId(id))).filter(Boolean).join(" · ") || "Required selections missing"}</p><p className="mt-2 text-sm">{cap.capacityPerDay || 0} {cap.quantityUnit}/day · {cap.turnaroundDays || 0} day turnaround</p></div>)}</CardBody></Card></div></section>}
    </DashboardPanel>
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-default-200 bg-content1/95 p-3 shadow-lg backdrop-blur"><Button as={Link} href={currentIndex === 0 ? "/dashboard/packaging/my" : href(steps[currentIndex - 1].key)} variant="light" startContent={<FiArrowLeft />}>{currentIndex === 0 ? "Cancel" : "Back"}</Button><div className="flex flex-wrap gap-2">{!locked && <Button variant="bordered" startContent={<FiSave />} isLoading={save.isPending} onPress={() => void saveDraft()}>Save draft</Button>}{step !== "review" ? <Button color="warning" endContent={<FiArrowRight />} isDisabled={locked} isLoading={save.isPending} onPress={continueTo}>Save & continue</Button> : !locked && <Button color="warning" startContent={<FiCheck />} isLoading={submit.isPending} onPress={() => submit.mutate()}>Submit for review</Button>}</div></div>
  </main>;
}

function Review({ title, rows, editHref, locked }: { title: string; rows: string[][]; editHref: string; locked: boolean }) {
  return <Card className="border border-default-200"><CardBody className="gap-4 p-5"><div className="flex justify-between"><h3 className="font-black">{title}</h3>{!locked && <Button as={Link} href={editHref} size="sm" variant="flat">Edit</Button>}</div><dl className="space-y-3">{rows.map(([label, value]) => <div key={label}><dt className="text-xs font-bold db-muted">{label}</dt><dd className={`mt-1 text-sm ${value ? "" : "text-danger"}`}>{value || "Missing"}</dd></div>)}</dl></CardBody></Card>;
}
