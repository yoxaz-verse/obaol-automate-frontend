"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem, Spinner } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { getData } from "@/core/api/apiHandler";
import { inlandTransportationRoutes as api } from "@/core/api/apiRoutes";
import AuthContext from "@/context/AuthContext";

export type TransportCompany = { id: string; name: string; slug?: string; registrationStatus?: string };
type Scope = { companyId: string; companies: TransportCompany[]; loading: boolean; staff: boolean; selectCompany: (id: string) => void; params: { companyId?: string } };
const ScopeContext = createContext<Scope | null>(null);
const storageKey = "obaol:transport-company";

export function TransportCompanyScope({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  const router = useRouter(), pathname = usePathname(), search = useSearchParams();
  const staff = ["admin", "operator", "team"].includes(String(user?.role || "").toLowerCase());
  const companiesQuery = useQuery({ queryKey: ["transport-companies", user?.id], queryFn: async () => (await getData(api.companies)).data.data || [], enabled: Boolean(user?.id), staleTime: 60_000 });
  const [companyId, setCompanyId] = useState("");
  const companies: TransportCompany[] = useMemo(() => companiesQuery.data || [], [companiesQuery.data]);

  const selectCompany = useCallback((id: string) => {
    setCompanyId(id);
    if (typeof window !== "undefined" && id) sessionStorage.setItem(storageKey, id);
    const params = new URLSearchParams(search.toString());
    if (id) params.set("companyId", id); else params.delete("companyId");
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  }, [pathname, router, search]);

  useEffect(() => {
    if (!companies.length) return;
    const requested = search.get("companyId") || (typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : "") || "";
    const valid = companies.some(row => row.id === requested) ? requested : (!staff && companies[0]?.id) || "";
    if (valid && valid !== companyId) selectCompany(valid);
  }, [companies, companyId, search, selectCompany, staff]);

  const value = useMemo<Scope>(() => ({ companyId, companies, loading: companiesQuery.isLoading, staff, selectCompany, params: companyId ? { companyId } : {} }), [companyId, companies, companiesQuery.isLoading, staff, selectCompany]);
  return <ScopeContext.Provider value={value}>
    {staff && <div className="mb-5 rounded-2xl border border-default-200 bg-content1 p-4">
      <Select label="Transport company" placeholder="Select a company to manage" selectedKeys={companyId ? new Set([companyId]) : new Set()} onSelectionChange={keys => selectCompany(String(Array.from(keys as Set<string>)[0] || ""))} isDisabled={companiesQuery.isLoading} startContent={companiesQuery.isLoading ? <Spinner size="sm" /> : undefined}>
        {companies.map(row => <SelectItem key={row.id} textValue={row.name}>{row.name}{row.registrationStatus ? ` · ${row.registrationStatus.replaceAll("_", " ")}` : ""}</SelectItem>)}
      </Select>
    </div>}
    {children}
  </ScopeContext.Provider>;
}

export function useTransportCompany() {
  const value = useContext(ScopeContext);
  if (!value) throw new Error("useTransportCompany must be used inside TransportCompanyScope");
  return value;
}
