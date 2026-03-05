"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Chip, Input, Select, SelectItem, Spinner, Tab, Tabs, Textarea } from "@nextui-org/react";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

type StatusFilter = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

const STATUS_OPTIONS: StatusFilter[] = ["PENDING_REVIEW", "APPROVED", "REJECTED"];

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
  const [tab, setTab] = useState<"associates" | "companies">("associates");
  const [status, setStatus] = useState<StatusFilter>("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [activeAction, setActiveAction] = useState<{ id: string; action: "APPROVE" | "REJECT" } | null>(null);

  const listQuery = useQuery({
    queryKey: ["approvals", tab, status, search, page, limit],
    queryFn: async () => {
      const route = tab === "associates" ? apiRoutes.approvals.associatesList : apiRoutes.approvals.companiesList;
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
      const routeBase = tab === "associates" ? apiRoutes.approvals.associateAction : apiRoutes.approvals.companyAction;
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

  return (
    <div className="w-full min-w-0 max-w-full p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
        <p className="text-sm text-default-600">Review pending associates and companies before dashboard access.</p>
      </div>

      <Tabs
        selectedKey={tab}
        onSelectionChange={(key) => {
          setTab(String(key) as "associates" | "companies");
          setPage(1);
        }}
      >
        <Tab key="associates" title="Pending Associates" />
        <Tab key="companies" title="Pending Companies" />
      </Tabs>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          label="Search"
          placeholder={tab === "associates" ? "Name, email, phone" : "Name, email, GST"}
          labelPlacement="outside"
        />
        <Select
          label="Status"
          labelPlacement="outside"
          selectedKeys={[status]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys as Set<string>)[0] as StatusFilter;
            if (selected) {
              setStatus(selected);
              setPage(1);
            }
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </Select>
        <Textarea
          value={notes}
          onValueChange={setNotes}
          label="Review Note"
          labelPlacement="outside"
          placeholder="Optional note for approve/reject action"
          minRows={1}
          maxRows={2}
        />
      </div>

      <div className="mt-5 rounded-xl border border-default-200/80 bg-content1/95 overflow-x-auto shadow-sm">
        {listQuery.isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-default-500">No records found for current filters.</div>
        ) : (
          <table className="w-full min-w-[980px] text-sm text-foreground">
            <thead className="bg-default-100/70 backdrop-blur-sm">
              <tr>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Name</th>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Email</th>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Phone</th>
                {tab === "associates" ? (
                  <th className="text-left px-3 py-2 text-default-600 font-semibold">Company</th>
                ) : (
                  <th className="text-left px-3 py-2 text-default-600 font-semibold">GST</th>
                )}
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Status</th>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Created At</th>
                <th className="text-center px-3 py-2 text-default-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, index: number) => (
                <tr
                  key={row._id}
                  className={`border-t border-default-200/70 transition-colors hover:bg-default-100/40 ${index % 2 === 0 ? "bg-transparent" : "bg-default-50/30 dark:bg-default-100/5"
                    }`}
                >
                  {(() => {
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
                      <>
                  <td className="px-3 py-2 text-foreground">{row.name || "-"}</td>
                  <td className="px-3 py-2 text-foreground/90">{row.email || "-"}</td>
                  <td className="px-3 py-2 text-foreground/90">{row.phone || "-"}</td>
                  {tab === "associates" ? (
                    <td className="px-3 py-2 text-foreground/90">{row.associateCompany?.name || "-"}</td>
                  ) : (
                    <td className="px-3 py-2 text-foreground/90">{row.gstin || "-"}</td>
                  )}
                  <td className="px-3 py-2">
                    <Chip size="sm" color={formatStatusColor(row.registrationStatus) as any} variant="flat">
                      {row.registrationStatus || "PENDING_REVIEW"}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-default-600">{formatDate(row.createdAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-2">
                      {isPendingReview ? (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            isLoading={isRowApproving}
                            isDisabled={actionMutation.isPending}
                            onPress={() => actionMutation.mutate({ id: row._id, action: "APPROVE" })}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            isLoading={isRowRejecting}
                            isDisabled={actionMutation.isPending}
                            onPress={() => actionMutation.mutate({ id: row._id, action: "REJECT" })}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </div>
                  </td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-default-600">
        <div>
          Page {meta.page} of {meta.pages} • Total {meta.total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            isDisabled={meta.page <= 1 || listQuery.isLoading}
            onPress={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="flat"
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
