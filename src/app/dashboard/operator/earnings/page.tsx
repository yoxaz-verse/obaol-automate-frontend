"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Skeleton } from "@nextui-org/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

type CommissionRow = {
  dealId: string;
  type: "closer" | "portfolio" | "leadership" | string;
  level?: number | null;
  percent?: number;
  amount?: number;
  createdAt?: string;
};

const toNumber = (value: unknown) => Number(value || 0);

const formatAmount = (value: unknown) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

const formatDateTime = (value: unknown) => {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const aggregateMonthlyRows = (rows: CommissionRow[], maxPoints = 6) => {
  const monthly = new Map<string, number>();

  rows.forEach((row) => {
    const date = row.createdAt ? new Date(row.createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return;

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthly.set(monthKey, toNumber(monthly.get(monthKey)) + toNumber(row.amount));
  });

  const points = Array.from(monthly.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxPoints)
    .map(([key, value]) => {
      const [year, month] = key.split("-");
      const labelDate = new Date(Number(year), Number(month) - 1, 1);
      return {
        month: labelDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        amount: Math.round((toNumber(value) + Number.EPSILON) * 100) / 100,
      };
    });

  return points;
};

const typeTone = (type: string) => {
  const key = String(type || "").toLowerCase();
  if (key === "closer") return "primary" as const;
  if (key === "portfolio") return "success" as const;
  if (key === "leadership") return "secondary" as const;
  return "default" as const;
};

const toId = (value: unknown) => String(value || "").trim();
const toName = (value: unknown) => String(value || "").trim() || "-";
const extractList = (response: any): any[] => {
  const payload = response?.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function OperatorEarningsPage() {
  const { user } = useContext(AuthContext);
  const selfOperatorId = toId(user?.id);
  const roleLower = String(user?.role || "").trim().toLowerCase();
  const isAdmin = roleLower === "admin";
  const [selectedOperatorId, setSelectedOperatorId] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const operatorsQuery = useQuery({
    queryKey: ["operator-earnings", "operators", isAdmin],
    queryFn: async () => getData(apiRoutes.operator.getAll, { page: 1, limit: 5000 }),
    enabled: isAdmin,
    refetchOnWindowFocus: false,
  });

  const operatorOptions = useMemo(() => {
    const rows = extractList(operatorsQuery.data);
    return rows
      .map((row: any) => ({
        id: toId(row?._id || row?.id),
        name: toName(row?.name),
      }))
      .filter((row: any) => Boolean(row.id));
  }, [operatorsQuery.data]);

  useEffect(() => {
    if (!isAdmin) return;
    const validIds = new Set(operatorOptions.map((option: any) => String(option.id)));
    if (operatorOptions.length === 0) {
      if (selectedOperatorId) setSelectedOperatorId("");
      return;
    }
    if (selectedOperatorId && validIds.has(selectedOperatorId)) return;
    setSelectedOperatorId(operatorOptions[0].id);
  }, [operatorOptions, isAdmin, selectedOperatorId, selfOperatorId]);

  const operatorId = isAdmin ? selectedOperatorId : selfOperatorId;

  const earningsQuery = useQuery({
    queryKey: ["operator-earnings", operatorId, page, limit],
    queryFn: async () =>
      getData(apiRoutes.commissions.operatorHistory(operatorId), {
        page,
        limit,
      }),
    enabled: Boolean(operatorId),
    refetchOnWindowFocus: false,
  });

  const chartSourceQuery = useQuery({
    queryKey: ["operator-earnings", "chart", operatorId],
    queryFn: async () =>
      getData(apiRoutes.commissions.operatorHistory(operatorId), {
        page: 1,
        limit: 200,
      }),
    enabled: Boolean(operatorId),
    refetchOnWindowFocus: false,
  });

  const data = earningsQuery.data?.data?.data || {};
  const rows: CommissionRow[] = Array.isArray(data.rows) ? data.rows : [];
  const summary = data.summary || {};
  const pagination = data.pagination || { page: 1, totalPages: 1, total: 0 };

  const chartRows: CommissionRow[] = useMemo(() => {
    const sourceRows = chartSourceQuery.data?.data?.data?.rows;
    if (Array.isArray(sourceRows) && sourceRows.length > 0) {
      return sourceRows;
    }
    return rows;
  }, [chartSourceQuery.data, rows]);

  const monthlyChartData = useMemo(() => aggregateMonthlyRows(chartRows, 6), [chartRows]);

  const leadershipEarnings = useMemo(
    () =>
      chartRows
        .filter((row) => String(row.type || "").toLowerCase() === "leadership")
        .reduce((sum, row) => sum + toNumber(row.amount), 0),
    [chartRows]
  );

  if ((isAdmin && operatorsQuery.isLoading) || earningsQuery.isLoading) {
    return (
      <div className="w-full p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border border-default-200/80">
              <CardBody className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </CardBody>
            </Card>
          ))}
        </div>
        <Card className="border border-default-200/80">
          <CardBody>
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (earningsQuery.isError) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="w-full rounded-xl border border-danger-300/60 bg-danger-500/10 px-4 py-3 text-sm text-danger-600 dark:text-danger-300">
          Failed to load earnings data.
        </div>
      </div>
    );
  }

  if (!operatorId) {
    return (
      <div className="w-full p-4 md:p-6">
        <div className="w-full rounded-xl border border-default-300/70 bg-content1 px-4 py-3 text-sm text-default-600">
          {isAdmin && operatorOptions.length === 0
            ? "No operators available to inspect."
            : "Select an operator to view earnings."}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Earnings Dashboard</h1>
        <p className="text-sm text-default-500">Commission visibility across closer, portfolio, and leadership streams.</p>
      </div>

      {isAdmin ? (
        <Card className="border border-default-200/80">
          <CardBody className="gap-2">
            <p className="text-xs uppercase tracking-wide text-default-500">Select Operator</p>
            <select
              value={selectedOperatorId}
              onChange={(event) => {
                setSelectedOperatorId(String(event.target.value || ""));
                setPage(1);
              }}
              className="h-10 rounded-lg border border-default-300 bg-content1 px-3 text-sm text-foreground"
            >
              {operatorOptions.length === 0 ? <option value="">No operators found</option> : null}
              {operatorOptions.map((option: any) => (
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
            <p className="text-xs uppercase tracking-wide text-default-500">Total Commission Earned</p>
            <p className="text-2xl font-semibold text-foreground">₹{formatAmount(summary.totalEarnings || 0)}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">This Month Earnings</p>
            <p className="text-2xl font-semibold text-foreground">₹{formatAmount(summary.monthlyEarnings || 0)}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Deals Closed</p>
            <p className="text-2xl font-semibold text-foreground">{toNumber(summary.dealsClosed)}</p>
          </CardBody>
        </Card>
        <Card className="border border-default-200/80">
          <CardBody>
            <p className="text-xs uppercase tracking-wide text-default-500">Leadership Earnings</p>
            <p className="text-2xl font-semibold text-foreground">₹{formatAmount(leadershipEarnings)}</p>
          </CardBody>
        </Card>
      </div>

      <Card className="border border-default-200/80">
        <CardBody className="h-[320px]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Monthly Commission Trend</h2>
            <span className="text-xs text-default-500">Last 6 months</span>
          </div>
          {monthlyChartData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-default-500 text-sm">
              No monthly commission data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.25)" />
                <XAxis dataKey="month" tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${formatAmount(value)}`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${formatAmount(value)}`, "Commission"]}
                  labelStyle={{ color: "#94a3b8" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    background: "rgba(15, 23, 42, 0.92)",
                    color: "#e2e8f0",
                  }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>

      <Card className="border border-default-200/80 bg-content1/95 overflow-x-auto">
        <CardBody className="p-0">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-default-500">No commission records found.</div>
          ) : (
            <table className="w-full min-w-[880px] text-sm text-foreground">
              <thead className="bg-default-100/80">
                <tr>
                  <th className="px-3 py-3 text-left text-default-700 font-semibold">Deal ID</th>
                  <th className="px-3 py-3 text-left text-default-700 font-semibold">Commission Type</th>
                  <th className="px-3 py-3 text-left text-default-700 font-semibold">Level</th>
                  <th className="px-3 py-3 text-left text-default-700 font-semibold">Amount</th>
                  <th className="px-3 py-3 text-left text-default-700 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${String(row.dealId)}-${String(row.type)}-${String(row.level ?? "n")}-${index}`}
                    className={`border-t border-default-200/70 ${index % 2 === 0 ? "bg-transparent" : "bg-default-50/30 dark:bg-default-100/5"}`}
                  >
                    <td className="px-3 py-3 text-foreground">{String(row.dealId || "-")}</td>
                    <td className="px-3 py-3">
                      <Chip size="sm" variant="flat" color={typeTone(String(row.type || ""))}>
                        {String(row.type || "-").toUpperCase()}
                      </Chip>
                    </td>
                    <td className="px-3 py-3 text-default-700 dark:text-default-300">{row.level ?? "-"}</td>
                    <td className="px-3 py-3 text-default-700 dark:text-default-300">₹{formatAmount(row.amount || 0)}</td>
                    <td className="px-3 py-3 text-default-700 dark:text-default-300">{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-default-600">
        <div>
          Page {pagination.page || page} of {pagination.totalPages || 1} • Total {pagination.total || rows.length}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            isDisabled={(pagination.page || page) <= 1 || earningsQuery.isFetching}
            onPress={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="flat"
            isDisabled={(pagination.page || page) >= (pagination.totalPages || 1) || earningsQuery.isFetching}
            onPress={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
