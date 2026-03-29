"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Input, Select, SelectItem, Spinner, Tab, Tabs, Textarea } from "@nextui-org/react";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";
import { LuSearch, LuClipboardCheck, LuUserCheck, LuBuilding2, LuUserCog, LuCheck, LuX, LuChevronLeft, LuChevronRight, LuCalendar, LuMail, LuPhone, LuTag } from "react-icons/lu";
import Title from "@/components/titles";

type StatusFilter = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

const STATUS_OPTIONS: StatusFilter[] = ["PENDING_REVIEW", "APPROVED", "REJECTED"];

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatStatusColor = (status: string) => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "APPROVED") return "success";
  if (normalized === "REJECTED") return "danger";
  return "warning";
};

const formatDate = (value: any) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"associates" | "companies" | "operators">("associates");
  const [status, setStatus] = useState<StatusFilter>("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [activeAction, setActiveAction] = useState<{ id: string; action: "APPROVE" | "REJECT" } | null>(null);

  useEffect(() => {
    patchData(apiRoutes.notifications.markSectionRead("approvals"), {}).catch(() => { });
  }, []);

  const listQuery = useQuery({
    queryKey: ["approvals", tab, status, search, page, limit],
    queryFn: async () => {
      const route =
        tab === "associates"
          ? apiRoutes.approvals.associatesList
          : tab === "companies"
            ? apiRoutes.approvals.companiesList
            : apiRoutes.approvals.operatorsList;
      const response = await getData(route, { status, search, page, limit });
      return {
        rows: response?.data?.data || [],
        meta: response?.data?.meta || { page: 1, pages: 1, total: 0, limit },
      };
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (params: { id: string; action: "APPROVE" | "REJECT" }) => {
      setActiveAction(params);
      const routeBase =
        tab === "associates"
          ? apiRoutes.approvals.associateAction
          : tab === "companies"
            ? apiRoutes.approvals.companyAction
            : apiRoutes.approvals.operatorAction;
      await patchData(`${routeBase}/${params.id}`, {
        action: params.action,
        notes: notes.trim(),
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Approval status updated.", position: "top-right" });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      setNotes("");
      setActiveAction(null);
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to update status.",
        position: "top-right",
      });
      setActiveAction(null);
    },
  });

  const rows = useMemo(() => (Array.isArray(listQuery.data?.rows) ? listQuery.data?.rows : []), [listQuery.data]);
  const meta = listQuery.data?.meta || { page: 1, pages: 1, total: 0, limit };

  // Fetch counts for other tabs to show notification dots
  const associatesCountQuery = useQuery({
    queryKey: ["approvals", "associates", "PENDING_REVIEW", "count"],
    queryFn: () => getData(apiRoutes.approvals.associatesList, { status: "PENDING_REVIEW", limit: 1 }),
    staleTime: 30000,
  });
  const companiesCountQuery = useQuery({
    queryKey: ["approvals", "companies", "PENDING_REVIEW", "count"],
    queryFn: () => getData(apiRoutes.approvals.companiesList, { status: "PENDING_REVIEW", limit: 1 }),
    staleTime: 30000,
  });
  const operatorsCountQuery = useQuery({
    queryKey: ["approvals", "operators", "PENDING_REVIEW", "count"],
    queryFn: () => getData(apiRoutes.approvals.operatorsList, { status: "PENDING_REVIEW", limit: 1 }),
    staleTime: 30000,
  });

  const hasAssociatesPending = Number(associatesCountQuery.data?.data?.meta?.total || 0) > 0;
  const hasCompaniesPending = Number(companiesCountQuery.data?.data?.meta?.total || 0) > 0;
  const hasOperatorsPending = Number(operatorsCountQuery.data?.data?.meta?.total || 0) > 0;

  const TabTitle = ({ title, hasDot }: { title: string; hasDot: boolean }) => (
    <div className="flex items-center gap-2">
      <span>{title}</span>
      {hasDot && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500"></span>
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full min-w-0 max-w-full p-6 md:p-10 space-y-8">
      <div className="flex flex-col gap-2">
        <Title title="ApprovalsHub" />
        <p className="text-[12px] font-bold text-default-400 uppercase tracking-[0.3em] opacity-70">
          Onboarding Verification & Entity Authorization Protocol
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => {
            setTab(String(key) as "associates" | "companies" | "operators");
            setPage(1);
          }}
          variant="underlined"
          color="warning"
          classNames={{
            tabList: "gap-8 relative rounded-none p-0 border-b border-divider/40",
            cursor: "bg-warning-500 w-full h-[3px] rounded-t-full shadow-[0_-1px_10px_rgba(234,179,8,0.2)]",
            tab: "max-w-fit px-4 h-14 transition-all duration-300 hover:opacity-100",
            tabContent: "font-semibold uppercase tracking-wider text-[11px] text-default-400 group-data-[selected=true]:text-warning-500 group-data-[selected=true]:scale-105 transition-all"
          }}
        >
          <Tab
            key="associates"
            title={
              <div className="flex items-center gap-2">
                <LuUserCheck size={16} />
                <TabTitle title="Pending Associates" hasDot={hasAssociatesPending} />
              </div>
            }
          />
          <Tab
            key="companies"
            title={
              <div className="flex items-center gap-2">
                <LuBuilding2 size={16} />
                <TabTitle title="Pending Companies" hasDot={hasCompaniesPending} />
              </div>
            }
          />
          <Tab
            key="operators"
            title={
              <div className="flex items-center gap-2">
                <LuUserCog size={16} />
                <TabTitle title="Pending Operators" hasDot={hasOperatorsPending} />
              </div>
            }
          />
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-foreground/[0.02] p-6 rounded-[2rem] border border-foreground/5 backdrop-blur-xl shadow-sm">
        <div className="md:col-span-4">
          <Input
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            label={<span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Search Parameter</span>}
            placeholder={
              tab === "associates"
                ? "Name, email, phone..."
                : tab === "companies"
                  ? "Name, email, GST..."
                  : "Name, email, phone..."
            }
            labelPlacement="outside"
            startContent={<LuSearch className="text-default-400" size={18} />}
            classNames={{
              input: "font-medium text-sm",
              inputWrapper: "h-12 bg-background border border-foreground/5 shadow-none hover:border-warning-500/20 transition-colors rounded-xl"
            }}
          />
        </div>
        <div className="md:col-span-3">
          <Select
            label={<span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Classification</span>}
            labelPlacement="outside"
            selectedKeys={[status]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys as Set<string>)[0] as StatusFilter;
              if (selected) {
                setStatus(selected);
                setPage(1);
              }
            }}
            classNames={{
              trigger: "h-12 bg-background border border-foreground/5 shadow-none hover:border-warning-500/20 transition-colors rounded-xl",
              value: "font-medium text-sm"
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option} textValue={toTitleCase(option)}>
                <span className="font-medium text-xs">{toTitleCase(option)}</span>
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="md:col-span-5">
          <Textarea
            value={notes}
            onValueChange={setNotes}
            label={<span className="text-[10px] font-bold uppercase tracking-widest text-default-400">Decision Telemetry (Optional)</span>}
            labelPlacement="outside"
            placeholder="Technical justification or feedback for this authorization action..."
            minRows={1}
            maxRows={2}
            classNames={{
              input: "font-medium text-sm",
              inputWrapper: "bg-background border border-foreground/5 shadow-none hover:border-warning-500/20 transition-colors rounded-xl"
            }}
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-foreground/5 bg-foreground/[0.01] backdrop-blur-3xl overflow-hidden shadow-2xl flex flex-col">
        {listQuery.isLoading ? (
          <div className="p-16 flex items-center justify-center">
            <Spinner color="warning" size="lg" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-16 text-center">
            <div className="flex flex-col items-center gap-4 opacity-30">
              <LuClipboardCheck size={48} />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Zero Records Detected</p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="bg-foreground/[0.03]">
                  <th className="px-6 py-4 text-[10px] font-bold text-default-400 uppercase tracking-widest">Entity / Identity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-default-400 uppercase tracking-widest">Contact Framework</th>
                  {tab === "associates" ? (
                    <th className="px-6 py-4 text-[10px] font-bold text-default-400 uppercase tracking-widest">Affiliation</th>
                  ) : tab === "companies" ? (
                    <th className="px-6 py-4 text-[10px] font-bold text-default-400 uppercase tracking-widest">GST Matrix</th>
                  ) : (
                    <th className="px-6 py-4 text-[10px] font-bold text-default-400 uppercase tracking-widest">Tier / Designation</th>
                  )}
                  <th className="px-6 py-4 text-[10px] font-bold text-default-400 uppercase tracking-widest text-center">Protocol Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-default-400 uppercase tracking-widest text-center">Registration Timeline</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-default-400 uppercase tracking-widest text-right pr-10">Command Hub</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any) => {
                  const normalizedStatus = String(row.registrationStatus || "PENDING_REVIEW").toUpperCase();
                  const isPendingReview = normalizedStatus === "PENDING_REVIEW";
                  const isRowApproving =
                    actionMutation.isPending &&
                    activeAction?.id === row._id &&
                    activeAction?.action === "APPROVE";
                  const isRowRejecting =
                    actionMutation.isPending &&
                    activeAction?.id === row._id &&
                    activeAction?.action === "REJECT";

                  return (
                    <tr
                      key={row._id}
                      className="group border-t border-foreground/[0.05] hover:bg-foreground/[0.02] transition-all duration-300"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-warning-500/10 text-warning-600 ${isPendingReview ? "animate-pulse" : "opacity-50"}`}>
                            {tab === "companies" ? <LuBuilding2 size={16} /> : <LuUserCheck size={16} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm tracking-tight text-foreground/90">{row.name || "-"}</span>
                            <span className="text-[10px] font-bold text-default-400 uppercase tracking-wider mt-0.5 select-none">ID: {row._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1 text-[11px] font-medium text-default-500">
                          <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                            <LuMail size={12} className="opacity-50" />
                            {row.email || "-"}
                          </div>
                          <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-default">
                            <LuPhone size={12} className="opacity-50" />
                            {row.phone || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {tab === "associates" ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                            <LuBuilding2 size={14} className="text-default-400" />
                            {row.associateCompany?.name || "-"}
                          </div>
                        ) : tab === "companies" ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                            <LuTag size={14} className="text-default-400" />
                            {row.gstin || "-"}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-foreground/80">{row.jobRole?.name || "-"}</span>
                            {row.jobType?.name && (
                              <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest">{row.jobType?.name}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Chip
                          size="sm"
                          className={`font-black uppercase text-[9px] tracking-widest h-6 px-3 border-none bg-${formatStatusColor(row.registrationStatus)}-500/10 text-${formatStatusColor(row.registrationStatus)}-600`}
                        >
                          {toTitleCase(row.registrationStatus || "PENDING_REVIEW")}
                        </Chip>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[11px] font-bold text-default-500 flex items-center gap-1.5">
                            <LuCalendar size={12} className="opacity-40" />
                            {formatDate(row.createdAt).split(",")[0]}
                          </span>
                          <span className="text-[9px] font-medium text-default-400 opacity-60">
                            {formatDate(row.createdAt).split(",")[1]?.trim()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 pr-10">
                        <div className="flex items-center justify-end gap-2">
                          {isPendingReview ? (
                            <>
                              <Button
                                size="sm"
                                className="h-10 bg-success-500 text-white font-bold px-4 rounded-xl shadow-lg shadow-success-500/20"
                                startContent={<LuCheck size={16} />}
                                isLoading={isRowApproving}
                                isDisabled={actionMutation.isPending}
                                onPress={() => actionMutation.mutate({ id: row._id, action: "APPROVE" })}
                              >
                                Authorize
                              </Button>
                              <Button
                                size="sm"
                                className="h-10 bg-danger-500/10 text-danger-500 font-bold px-4 rounded-xl border border-danger-500/20 hover:bg-danger-500 hover:text-white transition-all"
                                startContent={<LuX size={16} />}
                                isLoading={isRowRejecting}
                                isDisabled={actionMutation.isPending}
                                onPress={() => actionMutation.mutate({ id: row._id, action: "REJECT" })}
                              >
                                Deny
                              </Button>
                            </>
                          ) : (
                            <div className="p-2 rounded-lg bg-foreground/5 text-default-400">
                              <LuClipboardCheck size={18} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-6 bg-foreground/[0.02] p-6 rounded-[2rem] border border-foreground/5 backdrop-blur-xl">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-default-400 opacity-60">System Registry Meta</span>
          <div className="text-xs font-bold text-default-500">
            Page {meta.page} of {meta.pages} <span className="mx-2 text-default-300">|</span> Total Entities: {meta.total}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="flat"
            className="h-10 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-foreground/5 hover:bg-foreground/10"
            startContent={<LuChevronLeft size={16} />}
            isDisabled={meta.page <= 1 || listQuery.isLoading}
            onPress={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="flat"
            className="h-10 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest bg-foreground/5 hover:bg-foreground/10"
            endContent={<LuChevronRight size={16} />}
            isDisabled={meta.page >= meta.pages || listQuery.isLoading}
            onPress={() => setPage((prev) => Math.min(meta.pages || 1, prev + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
