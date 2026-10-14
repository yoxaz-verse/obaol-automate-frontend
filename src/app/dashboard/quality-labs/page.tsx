"use client";
import { useContext, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Input, Pagination, Select, SelectItem, Spinner, Switch } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FiGrid, FiMail, FiMap, FiMapPin, FiPhone, FiSearch, FiSliders } from "react-icons/fi";
import { LuPlus, LuRotateCcw } from "react-icons/lu";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import type { CountryOption, LabOption, LabProfile } from "@/types/labProfile";
import { optionName } from "@/types/labProfile";

const QualityLabsMap = dynamic(() => import("@/components/Labs/QualityLabsMap"), { ssr: false });
type Filters = { search: string; state: string; city: string; source: string; physicalCountryIds: string[]; destinationCountryIds: string[]; commodityIds: string[]; qualityClassifications: string[]; testIds: string[]; parameterIds: string[]; accreditationIds: string[]; verifiedOnly: boolean; latitude: string; longitude: string; radiusKm: string };
const EMPTY: Filters = { search: "", state: "", city: "", source: "", physicalCountryIds: [], destinationCountryIds: [], commodityIds: [], qualityClassifications: [], testIds: [], parameterIds: [], accreditationIds: [], verifiedOnly: false, latitude: "", longitude: "", radiusKm: "" };
const selected = (keys: any) => keys === "all" ? [] : Array.from(keys as Set<React.Key>).map(String);
function MultiFilter({ label, values, options, onChange }: { label: string; values: string[]; options: Array<{ _id: string; name: string }>; onChange: (values: string[]) => void }) {
  return <Select label={label} selectionMode="multiple" selectedKeys={new Set(values)} onSelectionChange={(keys) => onChange(selected(keys))} variant="bordered" size="sm">{options.map((item) => <SelectItem key={item._id}>{item.name}</SelectItem>)}</Select>;
}

export default function QualityLabsPage() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const canManage = ["admin", "associate"].includes(String(user?.role || "").toLowerCase());
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"cards" | "map">("cards");
  const params = useMemo(() => Object.fromEntries(Object.entries({ ...applied, page, limit: 18 }).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value]).filter(([, value]) => value !== "" && value !== false)), [applied, page]);
  const query = useQuery({ queryKey: ["lab-directory-v2", params], queryFn: async () => (await getData(apiRoutes.labProfiles.directory, params as any)).data });
  const payload: any = query.data || {};
  const labs: LabProfile[] = Array.isArray(payload.data) ? payload.data : [];
  const taxonomy: LabOption[] = payload.facets?.taxonomy || [];
  const countries: CountryOption[] = payload.facets?.countries || [];
  const byKind = (kind: string) => taxonomy.filter((item) => item.kind === kind);
  const tests = byKind("TEST").filter((item) => !filters.commodityIds.length || !item.parentIds?.length || item.parentIds.some((id) => filters.commodityIds.includes(String(id))));
  const parameters = byKind("PARAMETER").filter((item) => !filters.testIds.length || !item.parentIds?.length || item.parentIds.some((id) => filters.testIds.includes(String(id))));
  const activeCount = Object.values(applied).reduce((count, value) => count + (Array.isArray(value) ? value.length : value ? 1 : 0), 0);
  const clear = () => { setFilters(EMPTY); setApplied(EMPTY); setPage(1); };
  const useMyLocation = () => navigator.geolocation?.getCurrentPosition(({ coords }) => setFilters((current) => ({ ...current, latitude: String(coords.latitude), longitude: String(coords.longitude), radiusKm: current.radiusKm || "100" })), () => showToastMessage({ type: "warning", message: "Location permission was not available." }));
  return <section className="min-h-screen bg-background p-4 text-foreground md:p-8"><div className="mx-auto max-w-[1500px] space-y-6">
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.3em] text-success-500">Quality network</p><h1 className="mt-2 text-3xl font-black">Quality Testing Labs</h1><p className="mt-2 max-w-2xl text-sm text-default-500">Search country-wise product coverage, tests, parameters, certificates, and accreditations.</p></div>{canManage ? <Button color="success" startContent={<LuPlus />} onPress={() => router.push("/dashboard/quality-labs/location")}>Add or manage lab</Button> : null}</header>
    <Card className="border border-default-200"><CardBody className="gap-4 p-5"><div className="flex items-center gap-2 text-sm font-bold"><FiSliders /> Match requirements {activeCount ? <Chip size="sm" color="success">{activeCount} active</Chip> : null}</div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Input label="Lab name or location" value={filters.search} onValueChange={(search) => setFilters((current) => ({ ...current, search }))} startContent={<FiSearch />} variant="bordered" size="sm" />
      <MultiFilter label="Lab country" values={filters.physicalCountryIds} options={countries} onChange={(value) => setFilters((current) => ({ ...current, physicalCountryIds: value }))} />
      <MultiFilter label="Export destination" values={filters.destinationCountryIds} options={countries} onChange={(value) => setFilters((current) => ({ ...current, destinationCountryIds: value }))} />
      <MultiFilter label="Commodity" values={filters.commodityIds} options={byKind("COMMODITY")} onChange={(value) => setFilters((current) => ({ ...current, commodityIds: value, testIds: [], parameterIds: [] }))} />
      <MultiFilter label="Quality type" values={filters.qualityClassifications} options={["ORGANIC", "CONVENTIONAL", "IPM"].map((name) => ({ _id: name, name }))} onChange={(value) => setFilters((current) => ({ ...current, qualityClassifications: value }))} />
      <MultiFilter label="Test or package" values={filters.testIds} options={tests} onChange={(value) => setFilters((current) => ({ ...current, testIds: value, parameterIds: [] }))} />
      <MultiFilter label="Parameters" values={filters.parameterIds} options={parameters} onChange={(value) => setFilters((current) => ({ ...current, parameterIds: value }))} />
      <MultiFilter label="Accreditation" values={filters.accreditationIds} options={byKind("ACCREDITATION")} onChange={(value) => setFilters((current) => ({ ...current, accreditationIds: value }))} />
      <Input label="Physical state / region" value={filters.state} onValueChange={(state) => setFilters((current) => ({ ...current, state }))} size="sm" variant="bordered" />
      <Input label="Physical city / district" value={filters.city} onValueChange={(city) => setFilters((current) => ({ ...current, city }))} size="sm" variant="bordered" />
      <Select label="Directory source" selectedKeys={filters.source ? new Set([filters.source]) : new Set()} onSelectionChange={(keys) => setFilters((current) => ({ ...current, source: selected(keys)[0] || "" }))} size="sm" variant="bordered"><SelectItem key="SPICES_BOARD_QEL">Spices Board QEL</SelectItem><SelectItem key="SPICES_BOARD_EMPANELLED">Spices Board Empanelled</SelectItem></Select>
      <Select label="Distance radius" selectedKeys={filters.radiusKm ? new Set([filters.radiusKm]) : new Set()} onSelectionChange={(keys) => setFilters((current) => ({ ...current, radiusKm: selected(keys)[0] || "" }))} size="sm" variant="bordered">{[25, 50, 100, 250].map((value) => <SelectItem key={String(value)}>{value} km</SelectItem>)}</Select>
    </div><div className="flex flex-wrap items-center justify-between gap-3"><Switch isSelected={filters.verifiedOnly} onValueChange={(verifiedOnly) => setFilters((current) => ({ ...current, verifiedOnly }))} size="sm">Only valid, verified credentials</Switch><div className="flex gap-2"><Button variant="flat" startContent={<LuRotateCcw />} onPress={clear}>Clear</Button><Button color="success" onPress={() => { setPage(1); setApplied(filters); }}>Apply filters</Button></div></div></CardBody></Card>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xs font-black uppercase tracking-[.2em]">Matching labs</h2><span className="text-sm text-default-500">{payload.meta?.total || 0} found</span></div><div className="flex gap-2"><Button size="sm" variant="flat" startContent={<FiMapPin />} onPress={useMyLocation}>Use my location</Button><Button isIconOnly size="sm" color={view === "cards" ? "success" : "default"} onPress={() => setView("cards")}><FiGrid /></Button><Button isIconOnly size="sm" color={view === "map" ? "success" : "default"} onPress={() => setView("map")}><FiMap /></Button></div></div>
    {query.isLoading ? <div className="flex justify-center py-24"><Spinner color="success" /></div> : query.isError ? <Card><CardBody className="py-16 text-center text-danger">Unable to load the lab directory.</CardBody></Card> : !labs.length ? <Card><CardBody className="py-16 text-center text-default-500">No published lab matches this country-product combination.</CardBody></Card> : view === "map" ? <div className="h-[620px] overflow-hidden rounded-2xl border border-default-200"><QualityLabsMap center={[20.5937, 78.9629]} zoom={5} searchPoint={applied.latitude && applied.longitude ? { latitude: Number(applied.latitude), longitude: Number(applied.longitude), label: "Search center" } : null} labs={labs.map((lab) => ({ _id: lab._id, name: lab.published!.displayName, contactPhone: lab.published!.contactPhone, location: lab.published!.location }))} onContact={(lab) => router.push(`/dashboard/quality-labs/${lab._id}`)} /></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{labs.map((lab) => { const profile = lab.published!; return <Card key={lab._id} isPressable onPress={() => router.push(`/dashboard/quality-labs/${lab._id}`)} className="border border-default-200 text-left"><CardBody className="gap-4 p-5"><div><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-black">{profile.displayName}</h3><Chip color="success" variant="flat" size="sm">Published</Chip></div><p className="mt-2 flex items-center gap-2 text-sm text-default-500"><FiMapPin />{[profile.city, profile.state, optionName(profile.physicalCountryId)].filter(Boolean).join(", ")}</p></div>{profile.summary ? <p className="line-clamp-2 text-sm text-default-500">{profile.summary}</p> : null}<div className="flex flex-wrap gap-2"><Chip size="sm" variant="flat">{profile.countryAssignments.length} export countries</Chip>{profile.productCapabilityTemplates.slice(0, 3).map((template) => <Chip key={template._id} size="sm" variant="flat">{optionName(template.commodityId)}</Chip>)}</div><div className="flex gap-4 border-t border-default-200 pt-3 text-xs text-default-500"><span className="flex items-center gap-1"><FiPhone />{profile.contactPhone}</span><span className="flex min-w-0 items-center gap-1 truncate"><FiMail />{profile.contactEmail}</span></div></CardBody></Card>; })}</div>}
    {(payload.meta?.pages || 0) > 1 ? <div className="flex justify-center"><Pagination page={page} total={payload.meta.pages} onChange={setPage} color="success" /></div> : null}
  </div></section>;
}
