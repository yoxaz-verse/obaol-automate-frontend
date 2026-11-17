"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Chip, Input, Spinner, Textarea } from "@nextui-org/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiMapPin, FiPackage, FiPlus, FiSave, FiTrash2, FiUser } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { DashboardPanel } from "@/components/dashboard/DashboardUI";
import { getData, postData, putData } from "@/core/api/apiHandler";
import { packagingRoutes } from "@/core/api/apiRoutes";
import { emptyCapability, emptyPackagingUnit, PackagingUnitSnapshot } from "@/types/packagingUnit";

export type PackagingStep = "details" | "location" | "capabilities" | "review";
const steps: Array<{ key: PackagingStep; label: string; icon: typeof FiUser }> = [
  { key: "details", label: "Details", icon: FiUser },
  { key: "location", label: "Location", icon: FiMapPin },
  { key: "capabilities", label: "Capabilities", icon: FiPackage },
  { key: "review", label: "Review", icon: FiCheckCircle },
];
const control = "w-full rounded-xl border border-divider bg-background px-3 py-2 text-sm";
const message = (error: any) => error?.response?.data?.message || "Unable to save this packaging unit.";
const optionId = (value: any) => String(value?._id || value || "");
const cleanSnapshot = (value: any): PackagingUnitSnapshot => {
  const fallback = emptyPackagingUnit();
  return { ...fallback, ...(value || {}), locations: value?.locations?.length ? value.locations : fallback.locations, capabilities: value?.capabilities?.length ? value.capabilities : fallback.capabilities };
};

export default function PackagingUnitEditor({ step, isNew = false }: { step: PackagingStep; isNew?: boolean }) {
  const router = useRouter(), params = useParams(), search = useSearchParams(), { user } = useContext(AuthContext);
  const unitId = isNew ? "" : String(params.unitId || ""), companyId = search.get("companyId") || "";
  const role = String(user?.role || "").toLowerCase(), staff = ["admin", "operator", "team"].includes(role);
  const [form, setForm] = useState<PackagingUnitSnapshot>(emptyPackagingUnit()), [problem, setProblem] = useState(""), [ready, setReady] = useState(isNew);
  const unit = useQuery({ queryKey: ["packaging-unit", unitId], queryFn: async () => (await getData(packagingRoutes.unit(unitId))).data.data, enabled: !!unitId, retry: false });
  const taxonomy = useQuery({ queryKey: ["packaging-taxonomy"], queryFn: async () => (await getData(packagingRoutes.taxonomy)).data.data || [] });
  useEffect(() => { if (unit.data) { setForm(cleanSnapshot(unit.data.draft || unit.data.published)); setReady(true); } }, [unit.data]);
  const locked = !!unit.data && ["PENDING_REVIEW", "ARCHIVED"].includes(unit.data.status);
  const suffix = staff && (companyId || unit.data?.companyId?._id) ? `?companyId=${encodeURIComponent(companyId || optionId(unit.data.companyId))}` : "";
  const href = (key: PackagingStep, id = unitId) => `/dashboard/packaging/my/${id}/${key}${suffix}`;
  const save = useMutation({
    mutationFn: async () => unitId ? putData(packagingRoutes.unit(unitId), { snapshot: form }) : postData(packagingRoutes.unitDrafts, { companyId: companyId || undefined, snapshot: form }),
    onError: (error) => setProblem(message(error)),
  });
  const submit = useMutation({ mutationFn: async () => postData(packagingRoutes.submitUnit(unitId), {}), onSuccess: () => router.push("/dashboard/packaging/my?notice=submitted"), onError: (error) => setProblem(message(error)) });
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
    }
    if (step === "capabilities") form.capabilities.forEach((cap, index) => {
      if (!cap.name.trim() || !cap.serviceIds.length || !cap.formatIds.length || !cap.materialIds.length || !cap.commodityIds.length) errors.push(`Capability ${index + 1}`);
    });
    if (errors.length) { setProblem(`Complete the required fields: ${errors.join(", ")}.`); return false; }
    return true;
  };
  const continueTo = () => { const index = steps.findIndex((item) => item.key === step); if (validate()) void saveDraft(steps[index + 1]?.key); };
  const setLocation = (key: string, value: any) => setForm((current) => ({ ...current, locations: [{ ...current.locations[0], [key]: value, ...(key === "country" && !current.locations[0].coverageCountries.length ? { coverageCountries: [value] } : {}) }] }));
  const setCap = (index: number, key: string, value: any) => setForm((current) => ({ ...current, capabilities: current.capabilities.map((cap, i) => i === index ? { ...cap, [key]: value } : cap) }));
  const options = (kind: string) => (taxonomy.data || []).filter((item: any) => item.kind === kind && item.status === "ACTIVE");
  const names = useMemo(() => new Map((taxonomy.data || []).map((item: any) => [optionId(item), item.name])), [taxonomy.data]);
  const multi = (index: number, kind: string, key: string) => <label className="text-sm font-medium">{kind.replaceAll("_", " ")} <span className="text-danger">*</span><select multiple disabled={locked} className={`${control} mt-1 min-h-28 disabled:cursor-not-allowed disabled:opacity-60`} value={(form.capabilities[index] as any)[key].map(optionId)} onChange={(event) => setCap(index, key, Array.from(event.target.selectedOptions, (item) => item.value))}>{options(kind).map((item: any) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>;
  if (!ready || unit.isLoading) return <div className="grid min-h-72 place-items-center"><Spinner label="Loading packaging unit…" /></div>;
  if (!isNew && unit.isError) return <DashboardPanel className="p-8 text-center"><h1 className="text-xl font-black">Packaging unit unavailable</h1><p className="mt-2 db-muted">It may not exist or you may not have access.</p><Button as={Link} href="/dashboard/packaging/my" className="mt-5">Back to units</Button></DashboardPanel>;
  const currentIndex = steps.findIndex((item) => item.key === step), loc = form.locations[0];
  return <main className="mx-auto max-w-6xl space-y-5 pb-24">
    <DashboardPanel feature className="overflow-hidden p-0"><header className="p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="dashboard-label text-warning-700 dark:text-warning-400">Packaging unit setup</p><h1 className="mt-2 text-3xl font-black tracking-tight">{isNew ? "Add Packaging Unit" : form.displayName || "Packaging unit draft"}</h1><p className="mt-2 db-muted">Complete one focused section at a time. Your work can be saved as a draft.</p></div>{unit.data?.status && <Chip color={unit.data.status === "PENDING_REVIEW" ? "warning" : "default"}>{unit.data.status}</Chip>}</div>
      <nav aria-label="Packaging unit setup progress" className="mt-6 grid gap-2 border-t border-[var(--db-border-subtle)] pt-5 sm:grid-cols-4">{steps.map((item, index) => { const Icon = item.icon, available = !isNew && !!unitId; return available ? <Link key={item.key} href={href(item.key)} aria-current={item.key === step ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-bold transition ${item.key === step ? "border-warning-500 bg-warning-500/10 text-warning-700" : "border-transparent hover:bg-default-100"}`}><span className="grid h-8 w-8 place-items-center rounded-lg bg-content1"><Icon /></span><span>{index + 1}. {item.label}</span></Link> : <div key={item.key} aria-current={item.key === step ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-bold ${item.key === step ? "border-warning-500 bg-warning-500/10 text-warning-700" : "border-transparent opacity-50"}`}><span className="grid h-8 w-8 place-items-center rounded-lg bg-content1"><Icon /></span><span>{index + 1}. {item.label}</span></div>; })}</nav></header></DashboardPanel>
    {locked && <p role="alert" className="rounded-xl bg-warning-500/10 p-4 text-sm text-warning-700">This unit is {unit.data.status.toLowerCase().replaceAll("_", " ")} and cannot be edited.</p>}
    {problem && <p role="alert" className={`rounded-xl p-4 text-sm ${problem === "Draft saved." ? "bg-success-500/10 text-success-600" : "bg-danger-50 text-danger"}`}>{problem}</p>}
    <DashboardPanel className="p-5 md:p-7">
      {step === "details" && <section><h2 className="text-xl font-black">Unit identity and contact</h2><p className="mt-1 text-sm db-muted">Public information customers will use to identify and contact this facility.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><Input label="Unit display name" isRequired isDisabled={locked} value={form.displayName} onValueChange={(value) => setForm({ ...form, displayName: value })} /><Input label="Contact email" type="email" isRequired isDisabled={locked} value={form.contactEmail} onValueChange={(value) => setForm({ ...form, contactEmail: value })} /><Input label="Contact phone" isRequired isDisabled={locked} value={form.contactPhone} onValueChange={(value) => setForm({ ...form, contactPhone: value })} /><Input label="WhatsApp phone" isDisabled={locked} value={form.whatsappPhone} onValueChange={(value) => setForm({ ...form, whatsappPhone: value })} /><Input label="Website" type="url" isDisabled={locked} value={form.website} onValueChange={(value) => setForm({ ...form, website: value })} /><Textarea className="md:col-span-2" minRows={4} label="Public summary" isDisabled={locked} value={form.summary} onValueChange={(value) => setForm({ ...form, summary: value })} /></div></section>}
      {step === "location" && <section><h2 className="text-xl font-black">Physical location and service coverage</h2><p className="mt-1 text-sm db-muted">Describe where this unit operates and the markets it can serve.</p><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Input label="Facility name" isRequired isDisabled={locked} value={loc.name} onValueChange={(value) => setLocation("name", value)} /><Input label="Address" isRequired isDisabled={locked} value={loc.address} onValueChange={(value) => setLocation("address", value)} /><Input label="City" isDisabled={locked} value={loc.city} onValueChange={(value) => setLocation("city", value)} /><Input label="State" isDisabled={locked} value={loc.state} onValueChange={(value) => setLocation("state", value)} /><Input label="Country" isRequired isDisabled={locked} value={loc.country} onValueChange={(value) => setLocation("country", value)} /><Input label="Service countries" description="Comma-separated" isDisabled={locked} value={loc.coverageCountries.join(", ")} onValueChange={(value) => setLocation("coverageCountries", value.split(",").map((part) => part.trim()).filter(Boolean))} /><Input label="Latitude" type="number" isDisabled={locked} value={String(loc.latitude ?? "")} onValueChange={(value) => setLocation("latitude", value)} /><Input label="Longitude" type="number" isDisabled={locked} value={String(loc.longitude ?? "")} onValueChange={(value) => setLocation("longitude", value)} /></div></section>}
      {step === "capabilities" && <section><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">Packaging capabilities</h2><p className="mt-1 text-sm db-muted">Add every service this physical unit can perform.</p></div><Button color="warning" startContent={<FiPlus />} isDisabled={locked} onPress={() => setForm({ ...form, capabilities: [...form.capabilities, emptyCapability()] })}>Add capability</Button></div><div className="mt-6 space-y-5">{form.capabilities.map((cap, index) => <Card key={index} className="border border-default-200"><CardBody className="gap-4 p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-warning-600">Capability {index + 1}</p><b>{cap.name || "Untitled capability"}</b></div>{form.capabilities.length > 1 && <Button isIconOnly color="danger" variant="light" aria-label={`Remove capability ${index + 1}`} isDisabled={locked} onPress={() => setForm({ ...form, capabilities: form.capabilities.filter((_, i) => i !== index) })}><FiTrash2 /></Button>}</div><div className="grid gap-4 md:grid-cols-2"><Input label="Capability name" isRequired isDisabled={locked} value={cap.name} onValueChange={(value) => setCap(index, "name", value)} />{multi(index, "SERVICE", "serviceIds")}{multi(index, "FORMAT", "formatIds")}{multi(index, "MATERIAL", "materialIds")}{multi(index, "COMMODITY", "commodityIds")}{multi(index, "MACHINERY", "machineryIds")}{multi(index, "QUALITY_OPTION", "qualityOptionIds")}<Input label="Minimum quantity" type="number" min={0} isDisabled={locked} value={String(cap.minimumQuantity)} onValueChange={(value) => setCap(index, "minimumQuantity", Number(value))} /><Input label="Capacity per day" type="number" min={0} isDisabled={locked} value={String(cap.capacityPerDay)} onValueChange={(value) => setCap(index, "capacityPerDay", Number(value))} /><Input label="Turnaround days" type="number" min={0} isDisabled={locked} value={String(cap.turnaroundDays)} onValueChange={(value) => setCap(index, "turnaroundDays", Number(value))} /><Textarea label="Notes / custom options" isDisabled={locked} value={cap.notes} onValueChange={(value) => setCap(index, "notes", value)} /></div></CardBody></Card>)}</div></section>}
      {step === "review" && <section><h2 className="text-xl font-black">Review your packaging unit</h2><p className="mt-1 text-sm db-muted">Check the information below before sending it to OBAOL for verification.</p><div className="mt-6 grid gap-4 lg:grid-cols-2"><Review title="Identity and contact" editHref={href("details")} locked={locked} rows={[["Unit", form.displayName], ["Email", form.contactEmail], ["Phone", form.contactPhone], ["Website", form.website], ["Summary", form.summary]]} /><Review title="Location and coverage" editHref={href("location")} locked={locked} rows={[["Facility", loc.name], ["Address", [loc.address, loc.city, loc.state, loc.country].filter(Boolean).join(", ")], ["Service countries", loc.coverageCountries.join(", ")]]} /><Card className="border border-default-200 lg:col-span-2"><CardBody className="gap-4 p-5"><div className="flex justify-between"><div><h3 className="font-black">Capabilities</h3><p className="text-sm db-muted">{form.capabilities.length} configured</p></div>{!locked && <Button as={Link} href={href("capabilities")} size="sm" variant="flat">Edit</Button>}</div>{form.capabilities.map((cap, index) => <div key={index} className="rounded-xl bg-default-100 p-4"><b>{cap.name || `Capability ${index + 1}`}</b><p className="mt-1 text-xs db-muted">{[...cap.serviceIds, ...cap.formatIds, ...cap.materialIds, ...cap.commodityIds].map((id) => names.get(optionId(id))).filter(Boolean).join(" · ") || "Required selections missing"}</p><p className="mt-2 text-sm">{cap.capacityPerDay || 0} {cap.quantityUnit}/day · {cap.turnaroundDays || 0} day turnaround</p></div>)}</CardBody></Card></div></section>}
    </DashboardPanel>
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-default-200 bg-content1/95 p-3 shadow-lg backdrop-blur"><Button as={Link} href={currentIndex === 0 ? "/dashboard/packaging/my" : href(steps[currentIndex - 1].key)} variant="light" startContent={<FiArrowLeft />}>{currentIndex === 0 ? "Cancel" : "Back"}</Button><div className="flex flex-wrap gap-2">{!locked && <Button variant="bordered" startContent={<FiSave />} isLoading={save.isPending} onPress={() => void saveDraft()}>Save draft</Button>}{step !== "review" ? <Button color="warning" endContent={<FiArrowRight />} isDisabled={locked} isLoading={save.isPending} onPress={continueTo}>Save & continue</Button> : !locked && <Button color="warning" startContent={<FiCheck />} isLoading={submit.isPending} onPress={() => submit.mutate()}>Submit for review</Button>}</div></div>
  </main>;
}

function Review({ title, rows, editHref, locked }: { title: string; rows: string[][]; editHref: string; locked: boolean }) {
  return <Card className="border border-default-200"><CardBody className="gap-4 p-5"><div className="flex justify-between"><h3 className="font-black">{title}</h3>{!locked && <Button as={Link} href={editHref} size="sm" variant="flat">Edit</Button>}</div><dl className="space-y-3">{rows.map(([label, value]) => <div key={label}><dt className="text-xs font-bold db-muted">{label}</dt><dd className={`mt-1 text-sm ${value ? "" : "text-danger"}`}>{value || "Missing"}</dd></div>)}</dl></CardBody></Card>;
}
