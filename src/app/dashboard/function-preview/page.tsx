"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Checkbox, Input } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuChevronDown, LuChevronUp, LuInfo, LuSearch } from "react-icons/lu";
import AuthContext from "@/context/AuthContext";
import { getData, putData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractList } from "@/core/data/queryUtils";
import CompanySearch from "@/components/dashboard/Company/CompanySearch";
import CompanyFunctionComponent from "@/components/dashboard/CompanyFunctionComponent";
import { filterCanonicalPreviewFunctions, getPreviewDefinition, normalizePreviewFunctionSlug } from "@/utils/companyFunctionPreview";
import { reconcileCompanyFunctionPriorities } from "@/utils/companyFunctionPriorities";
import { showToastMessage } from "@/utils/utils";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";

type FunctionRow = { _id: string; slug: string; name: string; orderIndex?: number };
type Perspective = "provided" | "sought";
const emptyMetrics = { total: 0, open: 0, inProgress: 0, completed: 0 };

export default function FunctionPreviewPage() {
  const { user } = useContext(AuthContext);
  const client = useQueryClient();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [perspective, setPerspective] = useState<Perspective>("provided");
  const [search, setSearch] = useState("");
  const [providedIds, setProvidedIds] = useState<string[]>([]);
  const [soughtIds, setSoughtIds] = useState<string[]>([]);
  const [providedPriorities, setProvidedPriorities] = useState<string[]>([]);
  const [soughtPriorities, setSoughtPriorities] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);

  const functionsQuery = useQuery({
    queryKey: ["admin-function-preview-list"],
    queryFn: () => getData(apiRoutes.companyFunction.getAll, { page: 1, limit: 200, sort: "orderIndex:asc", activeOnly: true }),
    enabled: isAdmin,
  });
  const companyQuery = useQuery({
    queryKey: ["function-preview-company", companyId],
    queryFn: () => getData(`${apiRoutes.associateCompany.getAll}/${companyId}`),
    enabled: isAdmin && Boolean(companyId),
    refetchOnWindowFocus: false,
  });

  const functions = useMemo(() => filterCanonicalPreviewFunctions(extractList(functionsQuery.data) as FunctionRow[]), [functionsQuery.data]);
  const bySlug = useMemo(() => new Map(functions.map((fn) => [normalizePreviewFunctionSlug(fn.slug), String(fn._id)])), [functions]);
  const company = companyQuery.data?.data?.data || companyQuery.data?.data || null;

  useEffect(() => {
    if (!company || !functions.length) return;
    const ids = (key: "providedCapabilities" | "soughtCapabilities") => Array.from(new Set<string>((Array.isArray(company[key]) ? company[key] : [])
      .map((slug: unknown) => bySlug.get(normalizePreviewFunctionSlug(slug)) || "").filter(Boolean)));
    const provided = ids("providedCapabilities");
    const sought = ids("soughtCapabilities");
    setProvidedIds(provided);
    setSoughtIds(sought);
    setProvidedPriorities(reconcileCompanyFunctionPriorities(provided, (company.providedCapabilityPriorities || []).map(String)));
    setSoughtPriorities(reconcileCompanyFunctionPriorities(sought, (company.soughtCapabilityPriorities || []).map(String)));
    setDirty(false);
  }, [company, functions, bySlug]);

  const activeIds = perspective === "provided" ? providedIds : soughtIds;
  const activePriorities = perspective === "provided" ? providedPriorities : soughtPriorities;
  const filteredFunctions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return functions.filter((fn) => !needle || `${getPreviewDefinition(fn.slug, perspective)?.name || fn.name} ${getPreviewDefinition(fn.slug, perspective)?.description || ""}`.toLowerCase().includes(needle));
  }, [functions, perspective, search]);
  const previewFunctions = useMemo(() => {
    const selected = activeIds.map((id) => functions.find((fn) => String(fn._id) === id)).filter(Boolean) as FunctionRow[];
    return [...selected].sort((a, b) => {
      const ap = activePriorities.indexOf(String(a._id));
      const bp = activePriorities.indexOf(String(b._id));
      return (ap < 0 ? 99 : ap) - (bp < 0 ? 99 : bp) || activeIds.indexOf(String(a._id)) - activeIds.indexOf(String(b._id));
    });
  }, [activeIds, activePriorities, functions]);

  const toggle = (id: string) => {
    const setIds = perspective === "provided" ? setProvidedIds : setSoughtIds;
    const setPriorities = perspective === "provided" ? setProvidedPriorities : setSoughtPriorities;
    setIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : current.length < 6 ? [...current, id] : current;
      if (next === current) return current;
      setPriorities((priorities) => reconcileCompanyFunctionPriorities(next, priorities));
      setDirty(true);
      return next;
    });
  };
  const movePriority = (id: string, direction: -1 | 1) => {
    const setter = perspective === "provided" ? setProvidedPriorities : setSoughtPriorities;
    setter((current) => {
      const index = current.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      setDirty(true);
      return next;
    });
  };

  const save = useMutation({
    mutationFn: () => putData("/auth/company-interests", { associateCompanyId: companyId, providedFunctionIds: providedIds, soughtFunctionIds: soughtIds, providedFunctionPriorities: providedPriorities, soughtFunctionPriorities: soughtPriorities }),
    onSuccess: async () => {
      setDirty(false);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["function-preview-company", companyId] }),
        client.invalidateQueries({ queryKey: ["company-function-dashboard-company"] }),
        client.invalidateQueries({ queryKey: ["company-function-dashboard-components"] }),
        client.invalidateQueries({ queryKey: ["dashboard"] }),
        client.invalidateQueries({ queryKey: ["companies"] }),
      ]);
      showToastMessage({ type: "success", message: `${companyName || "Company"} dashboard functions updated.`, position: "top-right" });
    },
    onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to update company functions.", position: "top-right" }),
  });

  if (!isAdmin) return <Card className="rounded-2xl border border-danger-200 shadow-none"><CardBody className="flex flex-row items-start gap-3 p-6 text-danger-700"><LuInfo className="mt-0.5" size={20} /><div><h2 className="font-semibold">Access restricted</h2><p className="mt-1 text-sm">Only administrators can configure company dashboard functions.</p></div></CardBody></Card>;

  return <div className="space-y-6">
    <PageHeader variant="plain" title="Dashboard function configuration" description="Select a company, configure its functions, and preview the exact cards shown on its dashboard." />
    <Card className="rounded-2xl border border-default-200 shadow-sm"><CardBody className="gap-3 p-5"><label className="text-sm font-bold">Company</label><CompanySearch defaultSelected={companyId || null} onSelect={(id) => { setCompanyId(id || ""); setCompanyName(""); setDirty(false); }} onSelectCompany={(row) => setCompanyName(row?.name || "")} /><p className="text-xs text-default-500">Changes apply immediately to the selected company after you save.</p></CardBody></Card>
    {!companyId ? <EmptyState title="Select a company" message="Search for the company whose dashboard functions you want to configure." /> : companyQuery.isLoading || functionsQuery.isLoading ? <LoadingState title="Loading company functions" /> : companyQuery.isError || functionsQuery.isError ? <ErrorState title="Configuration could not be loaded" message="Try loading the selected company again." onRetry={() => { companyQuery.refetch(); functionsQuery.refetch(); }} /> : <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Function perspective" className="inline-flex rounded-xl border border-default-200 bg-default-100 p-1">{(["provided", "sought"] as Perspective[]).map((key) => <Button key={key} role="tab" aria-selected={perspective === key} variant="light" className={perspective === key ? "bg-obaol-500 font-bold text-obaol-950" : ""} onPress={() => setPerspective(key)}>{key === "provided" ? "Providing" : "Seeking"}</Button>)}</div>
        <Button color="warning" className="font-bold" isLoading={save.isPending} isDisabled={!dirty || !providedIds.length || !soughtIds.length} onPress={() => save.mutate()}>Save dashboard functions</Button>
      </div>
      {(!providedIds.length || !soughtIds.length) ? <p className="rounded-xl border border-warning-300 bg-warning-50 p-3 text-sm text-warning-800">Select at least one Providing and one Seeking function before saving.</p> : null}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside><Card className="rounded-2xl border border-default-200 shadow-sm lg:sticky lg:top-6"><CardBody className="space-y-4 p-5"><div><h2 className="text-xl font-bold">{perspective === "provided" ? "Functions provided" : "Functions sought"}</h2><p className="mt-1 text-sm text-default-500">Selected {activeIds.length}/6 · first three are priorities.</p></div><Input aria-label="Search functions" placeholder="Search functions" value={search} onValueChange={setSearch} startContent={<LuSearch />} variant="bordered" /><div className="space-y-2">{filteredFunctions.map((fn) => { const id = String(fn._id); const selected = activeIds.includes(id); const priority = activePriorities.indexOf(id); return <div key={id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${selected ? "border-obaol-500/40 bg-obaol-500/5" : "border-default-200"}`}><Checkbox isSelected={selected} isDisabled={!selected && activeIds.length >= 6} onValueChange={() => toggle(id)}><span className="text-sm font-medium">{getPreviewDefinition(fn.slug, perspective)?.name || fn.name}{priority >= 0 ? ` · P${priority + 1}` : ""}</span></Checkbox>{priority >= 0 ? <div className="flex"><Button isIconOnly size="sm" variant="light" isDisabled={priority === 0} onPress={() => movePriority(id, -1)} aria-label="Move priority up"><LuChevronUp /></Button><Button isIconOnly size="sm" variant="light" isDisabled={priority === activePriorities.length - 1} onPress={() => movePriority(id, 1)} aria-label="Move priority down"><LuChevronDown /></Button></div> : null}</div>; })}</div></CardBody></Card></aside>
        <main className="space-y-4 pb-16"><div><h2 className="text-2xl font-bold">Live dashboard preview</h2><p className="mt-1 text-sm text-default-500">Every available action is shown using the same cards as the associate dashboard.</p></div>{previewFunctions.length ? <div className={`grid grid-cols-1 gap-3 ${previewFunctions.length > 1 ? "xl:grid-cols-2" : ""}`}>{previewFunctions.map((fn) => <CompanyFunctionComponent key={fn._id} name={fn.name} slug={normalizePreviewFunctionSlug(fn.slug)} priorityRank={activePriorities.indexOf(String(fn._id)) + 1 || null} metrics={emptyMetrics} perspective={perspective} previewMode />)}</div> : <EmptyState title={`No ${perspective === "provided" ? "Providing" : "Seeking"} functions selected`} message="Choose at least one function to populate this dashboard view." />}</main>
      </div>
    </>}
  </div>;
}
