"use client";
import { useContext, useMemo, useState } from "react";
import { Button, Card, CardBody, Chip, Input, Pagination, Select, SelectItem, Tab, Tabs } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiMapPin, FiSearch, FiShield } from "react-icons/fi";
import { LuBuilding2, LuTruck } from "react-icons/lu";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { serviceDirectoryRoutes } from "@/core/api/apiRoutes";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { categoryLabel, serviceCategories, ServiceDirectoryProvider } from "@/types/serviceDirectory";

const first = (keys: any) => String(Array.from(keys)[0] || "");
export default function ServicesDirectoryPage() {
  const router = useRouter(); const { user } = useContext(AuthContext); const admin = String(user?.role || "").toLowerCase() === "admin";
  const [view, setView] = useState("directory"), [search, setSearch] = useState(""), [category, setCategory] = useState(""), [status, setStatus] = useState(""), [page, setPage] = useState(1);
  const params = useMemo(() => ({ search, category, page, limit: 18, ...(view === "management" ? { admin: true, status } : {}) }), [search, category, page, view, status]);
  const query = useQuery({ queryKey: ["service-directory", params], queryFn: async () => (await getData(serviceDirectoryRoutes.list, params)).data });
  const payload: any = query.data || {}; const rows: ServiceDirectoryProvider[] = payload.data || [];
  return <main className="space-y-6 pb-16">
    <header className="rounded-3xl border border-primary-200 bg-primary-50/50 p-6 dark:bg-primary-900/10"><p className="text-xs font-black uppercase tracking-[.24em] text-primary">Service network</p><h1 className="mt-2 text-3xl font-black">Service Providers</h1><p className="mt-2 max-w-3xl text-default-500">Find approved companies for procurement, storage, packaging, quality, transportation, freight, customs, finance, insurance, logistics, and agritech.</p></header>
    {admin ? <Tabs selectedKey={view} onSelectionChange={(key) => { setView(String(key)); setPage(1); }} color="primary" variant="underlined"><Tab key="directory" title="Published directory"/><Tab key="management" title="Admin management"/></Tabs> : null}
    <Card><CardBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"><Input label="Company, capability, or location" startContent={<FiSearch/>} value={search} onValueChange={(value) => { setSearch(value); setPage(1); }}/><Select label="Service category" selectedKeys={[category || "all"]} onSelectionChange={(keys) => { const value = first(keys); setCategory(value === "all" ? "" : value); setPage(1); }}>{serviceCategories.map((item) => <SelectItem key={item.key || "all"}>{item.label}</SelectItem>)}</Select>{view === "management" ? <Select label="Registration status" selectedKeys={[status || "all"]} onSelectionChange={(keys) => { const value = first(keys); setStatus(value === "all" ? "" : value); setPage(1); }}><SelectItem key="all">All statuses</SelectItem><SelectItem key="APPROVED">Approved</SelectItem><SelectItem key="PENDING_REVIEW">Pending review</SelectItem><SelectItem key="REJECTED">Rejected</SelectItem></Select> : null}</CardBody></Card>
    {query.isLoading ? <LoadingState title="Loading service providers" message="Building the approved service network."/> : query.isError ? <ErrorState title="Unable to load service providers" onRetry={() => query.refetch()}/> : !rows.length ? <EmptyState title="No service providers match" message="Try clearing one or more filters."/> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((provider) => <Card key={provider.companyId} className="border border-default-200 shadow-sm"><CardBody className="gap-4 p-5"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary"><LuBuilding2/></div><div><h2 className="text-lg font-black">{provider.name}</h2><p className="mt-1 flex items-center gap-1 text-xs text-default-500"><FiMapPin/>{provider.location?.label || [provider.location?.state, provider.location?.country].filter(Boolean).join(", ") || "Location not supplied"}</p></div></div>{provider.verified ? <Chip size="sm" color="success" variant="flat" startContent={<FiShield/>}>Verified</Chip> : null}</div><p className="line-clamp-2 min-h-10 text-sm text-default-600">{provider.summary || "Approved OBAOL service provider."}</p><div className="flex flex-wrap gap-1">{provider.categories.slice(0, 4).map((item) => <Chip key={item} size="sm" variant="flat">{categoryLabel(item)}</Chip>)}</div>{provider.transport ? <p className="flex items-center gap-2 text-xs text-default-500"><LuTruck/>{provider.transport.fleetCount} published trucks · {provider.transport.vehicleTypes.slice(0, 2).join(", ") || "Fleet details available"}</p> : null}<div className="mt-auto flex items-center justify-between border-t border-default-200 pt-3">{view === "management" ? <Chip size="sm" color={provider.status === "APPROVED" ? "success" : provider.status === "REJECTED" ? "danger" : "warning"} variant="flat">{provider.status.replaceAll("_", " ")}</Chip> : <span/>}<Button size="sm" color="primary" variant="bordered" onPress={() => router.push(`/dashboard/services/${provider.companyId}`)}>View provider</Button></div></CardBody></Card>)}</div>}
    {(payload.meta?.pages || 0) > 1 ? <div className="flex justify-center"><Pagination page={page} total={payload.meta.pages} onChange={setPage}/></div> : null}
  </main>;
}
