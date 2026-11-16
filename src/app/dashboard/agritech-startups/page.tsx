"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Input, Select, SelectItem } from "@nextui-org/react";
import Link from "next/link";
import { FiCpu, FiGlobe, FiMap, FiMapPin, FiSearch } from "react-icons/fi";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes, stateRoutes } from "@/core/api/apiRoutes";

const AgritechMap = dynamic(() => import("@/components/Agritech/AgritechMap"), { ssr: false });
const stages = ["SOURCING", "PREPARATION", "QUALITY_TESTING", "TRACEABILITY", "LOGISTICS", "FINANCE", "TRADE_EXECUTION", "OTHER"];
const label = (value: string) => value.replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
export default function AgritechDirectoryPage() {
  const [search, setSearch] = useState(""), [workflowStage, setWorkflow] = useState(""), [hasApi, setHasApi] = useState(""), [state, setState] = useState(""), [view, setView] = useState<"cards" | "map">("cards");
  const query = useQuery({ queryKey: ["agritech-directory", search, workflowStage, hasApi, state], queryFn: async () => (await getData(apiRoutes.agritechProfiles.directory, { search, workflowStage, hasApi, state })).data });
  const states = useQuery({ queryKey: ["agritech-states"], queryFn: async () => (await getData(stateRoutes.getAll, { limit: 100 })).data?.data || [] });
  const rows = query.data?.data || [], markers = query.data?.markers || [];
  return <section className="min-h-screen bg-background p-4 md:p-8"><div className="mx-auto max-w-[1500px] space-y-6">
    <PageHeader variant="plain" eyebrow="Technology network" eyebrowTone="brand" title="Agritech Startups" description="Find approved technology companies by the trade problem they solve, API availability, and operational coverage." />
    <Card><CardBody className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5"><Input aria-label="Search startups" placeholder="Search startups" startContent={<FiSearch />} value={search} onValueChange={setSearch} /><Select aria-label="Workflow problem" placeholder="All workflow problems" selectedKeys={workflowStage ? [workflowStage] : []} onSelectionChange={(keys) => setWorkflow(String(Array.from(keys)[0] || ""))}>{stages.map((x) => <SelectItem key={x}>{label(x)}</SelectItem>)}</Select><Select aria-label="API availability" placeholder="Any API status" selectedKeys={hasApi ? [hasApi] : []} onSelectionChange={(keys) => setHasApi(String(Array.from(keys)[0] || ""))}><SelectItem key="true">API available</SelectItem><SelectItem key="false">No API</SelectItem></Select><Select aria-label="Operational state" placeholder="All operational regions" selectedKeys={state ? [state] : []} onSelectionChange={(keys) => setState(String(Array.from(keys)[0] || ""))}>{(states.data || []).map((x: any) => <SelectItem key={x.name || x._id}>{x.name || x.state}</SelectItem>)}</Select><div className="flex gap-2"><Button className="flex-1" color={view === "cards" ? "success" : "default"} variant={view === "cards" ? "flat" : "bordered"} onPress={() => setView("cards")} startContent={<FiCpu />}>Cards</Button><Button className="flex-1" color={view === "map" ? "success" : "default"} variant={view === "map" ? "flat" : "bordered"} onPress={() => setView("map")} startContent={<FiMap />}>Map</Button></div></CardBody></Card>
    {query.isLoading ? <LoadingState title="Loading agritech startups" /> : query.isError ? <ErrorState title="Unable to load agritech startups" onRetry={() => query.refetch()} /> : !rows.length ? <EmptyState title="No approved startups found" message="Try clearing filters or check again after new profiles are approved." /> : view === "map" ? <div className="themed-map-frame h-[560px]"><AgritechMap markers={markers} /></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((row: any) => { const p = row.published; return <Card key={row._id} className="border border-default-200"><CardBody className="gap-4 p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-xl font-black">{p.displayName}</h2><Chip color={p.hasApi ? "success" : "default"} variant="flat">{p.hasApi ? "API available" : "No API"}</Chip></div><p className="text-sm text-default-600">{p.shortDescription}</p><div className="flex flex-wrap gap-2">{p.workflowStages.map((x: string) => <Chip key={x} size="sm" variant="flat">{label(x)}</Chip>)}</div><p className="flex items-start gap-2 text-sm text-default-500"><FiMapPin className="mt-0.5" />{p.coverageMode === "ALL_INDIA" ? "All India" : p.coverageStates.join(", ")}</p><div className="mt-auto flex gap-2 border-t border-default-200 pt-4"><Button as={Link} href={`/dashboard/agritech-startups/${row._id}`} color="success" variant="flat">View profile</Button><Button as="a" href={p.website} target="_blank" rel="noopener noreferrer" variant="bordered" startContent={<FiGlobe />}>Website</Button></div></CardBody></Card>; })}</div>}
  </div></section>;
}
