"use client";

import { useContext, useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Checkbox, CheckboxGroup, Input, Spinner, Chip, Divider } from "@nextui-org/react";
import AuthContext from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractList } from "@/core/data/queryUtils";
import CompanyFunctionComponent from "@/components/dashboard/CompanyFunctionComponent";
import { motion } from "framer-motion";
import { LuSearch, LuChevronUp, LuChevronDown, LuCommand, LuInfo, LuCheck } from "react-icons/lu";

type FunctionRow = {
  functionId: string;
  slug: string;
  name: string;
  orderIndex?: number;
  metrics: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
  };
  recentExecutionInquiries?: any[];
  recentOrders?: any[];
  placeholderRecommended?: boolean;
};

export default function FunctionPreviewPage() {
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAdmin = roleLower === "admin";

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const functionsQuery = useQuery({
    queryKey: ["admin-function-preview-list"],
    queryFn: () => getData(apiRoutes.companyFunction.getAll, { page: 1, limit: 200, sort: "orderIndex:asc" }),
    enabled: isAdmin,
  });

  const previewQuery = useQuery({
    queryKey: ["admin-function-preview-components"],
    queryFn: () => getData(apiRoutes.analytics.companyFunctionComponentsGlobal),
    enabled: isAdmin,
  });

  const functions = extractList(functionsQuery.data) as any[];
  const previewItems = extractList(previewQuery.data) as FunctionRow[];

  const previewById = useMemo(() => {
    const map = new Map<string, FunctionRow>();
    previewItems.forEach((item) => {
      if (item.functionId) map.set(String(item.functionId), item);
      if (item.slug) map.set(String(item.slug).toLowerCase(), item);
    });
    return map;
  }, [previewItems]);

  const filteredFunctions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return functions;
    return functions.filter((fn: any) => String(fn.name || "").toLowerCase().includes(needle));
  }, [functions, search]);

  const selectedFunctions = useMemo(() => {
    return selected
      .map((id) => functions.find((fn: any) => String(fn._id) === String(id)))
      .filter(Boolean) as any[];
  }, [selected, functions]);

  const moveSelected = (id: string, direction: "up" | "down") => {
    setSelected((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIndex = direction === "up" ? idx - 1 : idx + 1;
      if (swapIndex < 0 || swapIndex >= next.length) return prev;
      [next[idx], next[swapIndex]] = [next[swapIndex], next[idx]];
      return next;
    });
  };

  if (!isAdmin) {
    return (
      <Card className="border border-danger-200/50 bg-danger-50/10 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
        <CardBody className="p-8 text-sm text-danger-600 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-danger/10 flex items-center justify-center text-danger">
             <LuInfo size={24} />
          </div>
          <div className="flex flex-col gap-1">
             <h2 className="text-lg font-black uppercase tracking-tight">Access Restricted</h2>
             <p className="text-[10px] uppercase font-bold tracking-widest text-danger-400">Security Clearance Level Required: ADMIN</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10">
      <div>
        <Card className="border border-default-200/50 bg-content1/70 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] rounded-[3rem] sticky top-6">
          <CardHeader className="flex flex-col gap-1 p-10 pb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                    <LuCommand size={20} />
                </div>
                <h2 className="text-3xl font-black tracking-tighter leading-none">BUILDER</h2>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-default-400 leading-none">Mission Control Logic</p>
          </CardHeader>
          <Divider className="mx-10 w-auto bg-default-200/40" />
          <CardBody className="p-10 space-y-8">
            <Input
              placeholder="Search components..."
              value={search}
              onValueChange={setSearch}
              startContent={<LuSearch className="text-default-400 mr-2" />}
              classNames={{
                inputWrapper: "bg-content2/30 border-default-200/60 rounded-[1.5rem] h-14 shadow-inner px-6",
                input: "text-sm font-black uppercase tracking-tight",
              }}
            />
            {functionsQuery.isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-6">
                <Spinner color="primary" size="lg" className="scale-125" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-default-400 animate-pulse">Initializing Neural Link...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                <CheckboxGroup
                  value={selected}
                  onValueChange={(values) => setSelected(values as string[])}
                  className="gap-3"
                >
                  {filteredFunctions.map((fn: any) => (
                    <div
                        key={fn._id}
                        className={`group flex items-center justify-between p-4 rounded-[1.5rem] border transition-all duration-300 ${selected.includes(String(fn._id)) ? 'bg-primary/10 border-primary/30 shadow-xl shadow-primary/5' : 'bg-transparent border-transparent hover:bg-content2/20 hover:border-default-200/60'}`}
                    >
                      <Checkbox 
                        value={String(fn._id)}
                        classNames={{
                            label: `text-xs font-black uppercase tracking-wide transition-all ${selected.includes(String(fn._id)) ? 'text-foreground' : 'text-default-400 group-hover:text-default-600'}`,
                            wrapper: "before:border-primary shrink-0",
                        }}
                      >
                        {String(fn.slug || "").toLowerCase() === "importing-distribution" ? "Importer" : fn.name}
                      </Checkbox>
                      {selected.includes(String(fn._id)) && (
                        <div className="flex gap-1.5 ml-2">
                          <Button isIconOnly size="sm" variant="shadow" className="rounded-xl h-8 w-8 min-w-0 bg-content1 shadow-md hover:bg-primary hover:text-white transition-all" onPress={() => moveSelected(String(fn._id), "up")}>
                            <LuChevronUp size={14} />
                          </Button>
                          <Button isIconOnly size="sm" variant="shadow" className="rounded-xl h-8 w-8 min-w-0 bg-content1 shadow-md hover:bg-primary hover:text-white transition-all" onPress={() => moveSelected(String(fn._id), "down")}>
                            <LuChevronDown size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CheckboxGroup>
              </div>
            )}
          </CardBody>
          <Divider className="mx-10 w-auto bg-default-200/40" />
          <CardHeader className="p-10 pt-6">
             <div className="w-full p-5 rounded-[1.5rem] bg-content2/20 border border-dashed border-default-200/60 flex items-center justify-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] font-black text-default-500 uppercase tracking-[0.4em] leading-none">SYSTEM STANDBY</span>
             </div>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-12 pb-20">
        {previewQuery.isError && (
          <div className="relative z-50">
            <div className="absolute -inset-1 bg-gradient-to-r from-warning/40 via-transparent to-warning/40 blur-md rounded-[2.1rem]" />
            <Card className="border border-warning-200/50 bg-warning-50/10 backdrop-blur-2xl rounded-[2rem] relative z-10">
                <CardBody className="text-xs font-black text-warning-700 flex items-center justify-between p-8">
                    <div className="flex items-center gap-5">
                        <div className="h-10 w-10 rounded-2xl bg-warning/20 flex items-center justify-center text-warning">
                            <LuInfo size={20} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="uppercase tracking-widest text-warning-600">Telemetry Feed Offline</p>
                            <p className="text-[10px] font-bold text-warning-500/80">RENDERING SIMULATED COMPONENT PROTOTYPES</p>
                        </div>
                    </div>
                    <Chip size="sm" variant="shadow" color="warning" className="uppercase font-black h-6 px-4 text-[9px] tracking-widest border-none">LINK FAILURE</Chip>
                </CardBody>
            </Card>
          </div>
        )}

        {selectedFunctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-48 gap-10">
            <div className="relative">
                <div className="absolute inset-0 bg-primary blur-[100px] opacity-10 animate-pulse" />
                <div className="h-32 w-32 rounded-[3.5rem] border-2 border-dashed border-default-200 flex items-center justify-center relative z-10 group hover:border-primary/40 transition-colors duration-500">
                    <LuCommand size={48} className="text-default-200 group-hover:text-primary transition-colors duration-500 group-hover:rotate-90 transition-transform" />
                </div>
            </div>
            <div className="text-center space-y-3">
                <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-foreground/40">Awaiting Initialization</h3>
                <p className="text-[10px] font-black text-default-300 uppercase tracking-[0.5em]">SELECT MODULES FROM THE BUILDER TO SYNC INTERFACE</p>
            </div>
            <Button 
                variant="flat" 
                color="primary" 
                className="h-12 px-10 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20"
                onPress={() => setSelected(functions.slice(0, 3).map(fn => String(fn._id)))}
            >
                AUTO-LOAD MODULES
            </Button>
          </div>
        ) : (
          <div className="space-y-16">
            {selectedFunctions.map((fn: any) => {
              const preview = previewById.get(String(fn._id)) || previewById.get(String(fn.slug || "").toLowerCase());
              return (
                <div key={fn._id}>
                  <CompanyFunctionComponent
                    name={fn.name}
                    slug={fn.slug}
                    metrics={preview?.metrics || { total: 0, open: 0, inProgress: 0, completed: 0 }}
                    recentExecutionInquiries={preview?.recentExecutionInquiries || []}
                    recentOrders={preview?.recentOrders || []}
                    previewMode
                    placeholderRecommended={preview?.placeholderRecommended ?? true}
                  />
                </div>
              );
            })}
            
            <div className="flex flex-col items-center justify-center py-10 opacity-30 gap-4">
                <LuCheck size={32} className="text-default-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-default-300">END OF MODULE STACK</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
