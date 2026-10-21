"use client";

import { useContext, useMemo, useState } from "react";
import { Button, Card, CardBody, Checkbox, CheckboxGroup, Input } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { LuChevronDown, LuChevronUp, LuInfo, LuSearch } from "react-icons/lu";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractList } from "@/core/data/queryUtils";
import CompanyFunctionComponent from "@/components/dashboard/CompanyFunctionComponent";
import { filterCanonicalPreviewFunctions, getPreviewDefinition, normalizePreviewFunctionSlug } from "@/utils/companyFunctionPreview";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";

type FunctionRow = { _id: string; slug: string; name: string };

export default function FunctionPreviewPage() {
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const functionsQuery = useQuery({
    queryKey: ["admin-function-preview-list"],
    queryFn: () => getData(apiRoutes.companyFunction.getAll, { page: 1, limit: 200, sort: "orderIndex:asc", activeOnly: true }),
    enabled: isAdmin,
  });

  const functions = useMemo(
    () => filterCanonicalPreviewFunctions(extractList(functionsQuery.data) as FunctionRow[]),
    [functionsQuery.data]
  );

  const filteredFunctions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return functions;
    return functions.filter((fn) => {
      const definition = getPreviewDefinition(fn.slug);
      return `${definition?.name || fn.name} ${definition?.description || ""}`.toLowerCase().includes(needle);
    });
  }, [functions, search]);

  const selectedFunctions = useMemo(
    () => selected.map((id) => functions.find((fn) => String(fn._id) === id)).filter(Boolean) as FunctionRow[],
    [selected, functions]
  );

  const moveSelected = (id: string, direction: "up" | "down") => {
    setSelected((current) => {
      const index = current.indexOf(id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  if (!isAdmin) {
    return (
      <Card className="rounded-2xl border border-danger-200 shadow-none">
        <CardBody className="flex flex-row items-start gap-3 p-6 text-danger-700">
          <LuInfo className="mt-0.5 shrink-0" size={20} />
          <div><h2 className="font-semibold">Access restricted</h2><p className="mt-1 text-sm">Only administrators can open the function preview.</p></div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader variant="plain" title="Function preview" description="Choose, arrange, and preview the actions currently available for each company function." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside>
        <Card className="rounded-2xl border border-default-200 shadow-sm lg:sticky lg:top-6">
          <CardBody className="space-y-5 p-5">
            <div><h2 className="text-xl font-bold">Select functions</h2><p className="mt-1 text-sm text-default-500">Choose and arrange the functions you want to preview.</p></div>
            <Input aria-label="Search functions" placeholder="Search functions" value={search} onValueChange={setSearch} startContent={<LuSearch className="text-default-400" />} variant="bordered" />
            {functionsQuery.isLoading ? (
              <LoadingState compact title="Loading functions" className="border-0" />
            ) : functionsQuery.isError ? (
              <ErrorState title="Functions could not be loaded" message="Try refreshing the page." onRetry={() => functionsQuery.refetch()} compact />
            ) : (
              <CheckboxGroup value={selected} onValueChange={(values) => setSelected(values as string[])} className="gap-2">
                {filteredFunctions.map((fn) => {
                  const definition = getPreviewDefinition(fn.slug);
                  const id = String(fn._id);
                  const isSelected = selected.includes(id);
                  return (
                    <div key={id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${isSelected ? "border-primary/40 bg-primary/5" : "border-default-200"}`}>
                      <Checkbox value={id} classNames={{ label: "text-sm font-medium" }}>{definition?.name || fn.name}</Checkbox>
                      {isSelected ? (
                        <div className="flex gap-1">
                          <Button isIconOnly size="sm" variant="light" aria-label={`Move ${definition?.name || fn.name} up`} onPress={() => moveSelected(id, "up")}><LuChevronUp size={16} /></Button>
                          <Button isIconOnly size="sm" variant="light" aria-label={`Move ${definition?.name || fn.name} down`} onPress={() => moveSelected(id, "down")}><LuChevronDown size={16} /></Button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </CheckboxGroup>
            )}
          </CardBody>
        </Card>
      </aside>

      <main className="space-y-5 pb-16">
        <div><h2 className="text-2xl font-bold">Selected functions</h2><p className="mt-1 text-sm text-default-500">Each function shows only actions that are currently available in OBAOL.</p></div>
        {selectedFunctions.length ? selectedFunctions.map((fn, index) => (
          <CompanyFunctionComponent
            key={fn._id}
            name={fn.name}
            slug={normalizePreviewFunctionSlug(fn.slug)}
            priorityRank={index + 1}
            metrics={{ total: 0, open: 0, inProgress: 0, completed: 0 }}
            previewMode
          />
        )) : (
          <EmptyState title="No functions selected" message="Select one or more functions from the list to see the actions available for each role." action={<Button color="primary" variant="flat" onPress={() => setSelected(functions.slice(0, 3).map((fn) => String(fn._id)))}>Select first three</Button>} />
        )}
      </main>
      </div>
    </div>
  );
}
