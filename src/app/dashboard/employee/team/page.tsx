"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Input, Skeleton } from "@nextui-org/react";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

type TeamRow = {
  employeeId: string;
  name: string;
  mentorEmployee?: { employeeId: string; name: string } | null;
  teamSize?: number;
  totalCommission?: number;
};

type EmployeeRecord = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  createdAt?: string;
};

type SortKey = "name" | "teamSize" | "totalCommission" | "joinDate";
type SortDirection = "asc" | "desc";

const toId = (value: unknown) => String(value || "").trim();
const toName = (value: unknown) => String(value || "").trim() || "-";
const toNumber = (value: unknown) => Number(value || 0);

const formatAmount = (value: unknown) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

const formatDate = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const extractList = (response: any): any[] => {
  const payload = response?.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function EmployeeTeamPage() {
  const { user } = useContext(AuthContext);
  const selfEmployeeId = toId(user?.id);
  const roleLower = String(user?.role || "").trim().toLowerCase();
  const isAdmin = roleLower === "admin";
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const employeesQuery = useQuery({
    queryKey: ["employee-team", "employees", isAdmin],
    queryFn: async () => getData(apiRoutes.employee.getAll, { page: 1, limit: 5000 }),
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  const employeeOptions = useMemo(() => {
    const rows = extractList(employeesQuery.data);
    return rows
      .map((row: any) => ({
        id: toId(row?._id || row?.id),
        name: toName(row?.name),
      }))
      .filter((row: any) => Boolean(row.id));
  }, [employeesQuery.data]);

  useEffect(() => {
    if (!isAdmin) return;
    const validIds = new Set(employeeOptions.map((option: any) => String(option.id)));
    if (employeeOptions.length === 0) {
      if (selectedEmployeeId) setSelectedEmployeeId("");
      return;
    }
    if (selectedEmployeeId && validIds.has(selectedEmployeeId)) return;
    setSelectedEmployeeId(employeeOptions[0].id);
  }, [employeeOptions, isAdmin, selfEmployeeId, selectedEmployeeId]);

  const employeeId = isAdmin ? selectedEmployeeId : selfEmployeeId;

  const teamQuery = useQuery({
    queryKey: ["employee-team", employeeId],
    queryFn: async () => getData(apiRoutes.employeeHierarchy.team(employeeId)),
    enabled: Boolean(employeeId),
    refetchOnWindowFocus: false,
  });

  const directTeam: TeamRow[] = useMemo(() => {
    const data = teamQuery.data?.data?.data || {};
    return Array.isArray(data.directTeam) ? data.directTeam : [];
  }, [teamQuery.data]);

  const teamIds = useMemo(() => directTeam.map((row) => toId(row.employeeId)).filter(Boolean), [directTeam]);

  const employeeLookupQuery = useQuery({
    queryKey: ["employee-team", "lookup", teamIds.join("|")],
    queryFn: async () => getData(apiRoutes.employee.getAll, { page: 1, limit: 5000 }),
    enabled: teamIds.length > 0,
    refetchOnWindowFocus: false,
  });

  const employeeLookup = useMemo(() => {
    const rows = extractList(employeeLookupQuery.data);
    const idSet = new Set(teamIds);

    return rows.reduce<Map<string, EmployeeRecord>>((acc, row: EmployeeRecord) => {
      const id = toId(row?._id || row?.id);
      if (id && idSet.has(id)) {
        acc.set(id, row);
      }
      return acc;
    }, new Map<string, EmployeeRecord>());
  }, [employeeLookupQuery.data, teamIds]);

  const enrichedRows = useMemo(() => {
    return directTeam.map((row) => {
      const id = toId(row.employeeId);
      const lookup = employeeLookup.get(id);
      return {
        employeeId: id,
        name: toName(row.name),
        email: String(lookup?.email || ""),
        mentor: toName(row.mentorEmployee?.name),
        teamSize: toNumber(row.teamSize),
        totalCommission: toNumber(row.totalCommission),
        joinDate: lookup?.createdAt || "",
      };
    });
  }, [directTeam, employeeLookup]);

  const dealQueries = useQueries({
    queries: enrichedRows.map((row) => ({
      queryKey: ["employee-team", "deals", row.employeeId],
      queryFn: async () =>
        getData(apiRoutes.commissions.employeeHistory(row.employeeId), {
          page: 1,
          limit: 1,
        }),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      enabled: Boolean(row.employeeId),
    })),
  });

  const dealsByEmployee = useMemo(() => {
    const dealsMap = new Map<string, number>();
    enrichedRows.forEach((row, index) => {
      const summary = (dealQueries[index]?.data as any)?.data?.data?.summary || {};
      dealsMap.set(row.employeeId, toNumber(summary.dealsClosed));
    });
    return dealsMap;
  }, [dealQueries, enrichedRows]);

  const totalDealsClosed = useMemo(
    () => enrichedRows.reduce((sum, row) => sum + toNumber(dealsByEmployee.get(row.employeeId)), 0),
    [dealsByEmployee, enrichedRows]
  );

  const totalTeamEarnings = useMemo(
    () => enrichedRows.reduce((sum, row) => sum + toNumber(row.totalCommission), 0),
    [enrichedRows]
  );

  const totalDownline = useMemo(
    () => enrichedRows.reduce((sum, row) => sum + toNumber(row.teamSize), 0),
    [enrichedRows]
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enrichedRows;

    return enrichedRows.filter((row) => {
      const name = row.name.toLowerCase();
      const email = String(row.email || "").toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }, [enrichedRows, search]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];
    rows.sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (sortKey === "name") {
        return a.name.localeCompare(b.name) * modifier;
      }

      if (sortKey === "joinDate") {
        const aTime = a.joinDate ? new Date(a.joinDate).getTime() : 0;
        const bTime = b.joinDate ? new Date(b.joinDate).getTime() : 0;
        return (aTime - bTime) * modifier;
      }

      return (toNumber(a[sortKey]) - toNumber(b[sortKey])) * modifier;
    });
    return rows;
  }, [filteredRows, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const activePage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [activePage, pageSize, sortedRows]);

  const toggleSort = (key: SortKey) => {
    setPage(1);
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const renderSortLabel = (label: string, key: SortKey) => {
    const isCurrent = sortKey === key;
    const arrow = isCurrent ? (sortDirection === "asc" ? "↑" : "↓") : "↕";
    return (
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="inline-flex items-center gap-1 font-semibold text-default-700 hover:text-foreground"
      >
        <span>{label}</span>
        <span className="text-[11px]">{arrow}</span>
      </button>
    );
  };

  if ((isAdmin && employeesQuery.isLoading) || teamQuery.isLoading) {
    return (
      <div className="w-full p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border border-default-200/80">
              <CardBody className="space-y-2">
                <Skeleton className="h-3 w-28 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </CardBody>
            </Card>
          ))}
        </div>
        <Card className="border border-default-200/80">
          <CardBody className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </CardBody>
        </Card>
      </div>
    );
  }

  if (teamQuery.isError) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="w-full rounded-xl border border-danger-300/60 bg-danger-500/10 px-4 py-3 text-sm text-danger-600 dark:text-danger-300">
          Unable to load team data.
        </div>
      </div>
    );
  }

  if (!employeeId) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="w-full rounded-xl border border-default-300/70 bg-content1 px-4 py-3 text-sm text-default-600">
          {isAdmin && employeeOptions.length === 0
            ? "No employees available to inspect."
            : "Select an employee to view team data."}
        </div>
      </div>
    );
  }

  const isDealsLoading = dealQueries.some((query) => query.isFetching);

  return (
    <div className="w-full p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
        <p className="text-sm text-default-500">Track your direct reports, downline strength, and team earnings.</p>
      </div>

      {isAdmin ? (
        <Card className="border border-default-200/80">
          <CardBody className="gap-2">
            <p className="text-xs uppercase tracking-wide text-default-500">Select Employee</p>
            <select
              value={selectedEmployeeId}
              onChange={(event) => {
                setSelectedEmployeeId(String(event.target.value || ""));
                setPage(1);
              }}
              className="h-10 rounded-lg border border-default-300 bg-content1 px-3 text-sm text-foreground"
            >
              {employeeOptions.length === 0 ? <option value="">No employees found</option> : null}
              {employeeOptions.map((option: any) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Total Downline</p>
            <p className="text-2xl font-semibold text-foreground">{totalDownline}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Direct Team Members</p>
            <p className="text-2xl font-semibold text-foreground">{enrichedRows.length}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Total Team Earnings</p>
            <p className="text-2xl font-semibold text-foreground">₹{formatAmount(totalTeamEarnings)}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Total Deals Closed</p>
            <p className="text-2xl font-semibold text-foreground">{isDealsLoading ? "..." : totalDealsClosed}</p>
          </CardBody>
        </Card>
      </div>

      <Card className="border border-default-200/80">
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Input
              value={search}
              onValueChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search by employee name or email"
              className="max-w-xl"
            />
            <div className="flex items-center gap-3">
              <label className="text-xs text-default-500 flex items-center gap-2">
                Rows
                <select
                  value={String(pageSize)}
                  onChange={(event) => {
                    const nextSize = Number(event.target.value || 10);
                    setPageSize(nextSize);
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-default-300 bg-content1 px-2 text-sm text-foreground"
                >
                  {[10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-default-200/70 bg-content1/95">
            <table className="w-full min-w-[920px] text-sm text-foreground">
              <thead className="bg-default-100/80">
                <tr>
                  <th className="px-3 py-3 text-left">{renderSortLabel("Employee Name", "name")}</th>
                  <th className="px-3 py-3 text-left text-default-700 font-semibold">Mentor</th>
                  <th className="px-3 py-3 text-left">{renderSortLabel("Team Size", "teamSize")}</th>
                  <th className="px-3 py-3 text-left">{renderSortLabel("Total Commission", "totalCommission")}</th>
                  <th className="px-3 py-3 text-left">{renderSortLabel("Join Date", "joinDate")}</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-default-500">
                      No team members found for the current filter.
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row, index) => (
                    <tr
                      key={row.employeeId}
                      className={`border-t border-default-200/70 ${index % 2 === 0 ? "bg-transparent" : "bg-default-50/30 dark:bg-default-100/5"}`}
                    >
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{row.name}</span>
                          <span className="text-xs text-default-500">{row.email || "-"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-default-700 dark:text-default-300">{row.mentor}</td>
                      <td className="px-3 py-3 text-default-700 dark:text-default-300">{row.teamSize}</td>
                      <td className="px-3 py-3 text-default-700 dark:text-default-300">₹{formatAmount(row.totalCommission)}</td>
                      <td className="px-3 py-3 text-default-700 dark:text-default-300">{formatDate(row.joinDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-default-600">
            <div>
              Page {activePage} of {totalPages} • Total {sortedRows.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                isDisabled={activePage <= 1}
                onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="flat"
                isDisabled={activePage >= totalPages}
                onPress={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>

          {employeeLookupQuery.isError ? (
            <p className="text-xs text-warning-600 dark:text-warning-300">
              Employee email/join-date enrichment is currently unavailable.
            </p>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
