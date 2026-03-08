"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { getData, patchData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

const STATUS_OPTIONS = [
  "ALL",
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "RESOLVED",
  "ACTION_TAKEN",
  "REJECTED",
] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const ACTION_OPTIONS = ["NONE", "DEACTIVATE_ASSOCIATE", "REMOVE_FROM_COMPANY"] as const;
type ActionType = (typeof ACTION_OPTIONS)[number];

const formatDate = (value: unknown) => {
  const date = value ? new Date(String(value)) : null;
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const statusColor = (status: string) => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "ACTION_TAKEN" || normalized === "RESOLVED") return "success";
  if (normalized === "REJECTED") return "danger";
  if (normalized === "UNDER_REVIEW") return "secondary";
  return "warning";
};

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("PENDING_REVIEW");
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [activeReport, setActiveReport] = useState<any>(null);
  const [nextStatus, setNextStatus] = useState("UNDER_REVIEW");
  const [actionType, setActionType] = useState<ActionType>("NONE");
  const [adminNotes, setAdminNotes] = useState("");

  const companiesQuery = useQuery({
    queryKey: ["reports-company-options"],
    queryFn: async () => {
      const response = await getData(apiRoutes.associateCompany.getAll, {
        page: 1,
        limit: 500,
        sort: "name:asc",
      });
      return response?.data?.data?.data || [];
    },
  });

  const reportsQuery = useQuery({
    queryKey: ["admin-reports", status, search, companyId, page, limit],
    queryFn: async () => {
      const params: Record<string, any> = { page, limit, sort: "createdAt:desc" };
      if (status !== "ALL") params.status = status;
      if (search.trim()) params.search = search.trim();
      if (companyId) params.reporterCompanyId = companyId;

      const response = await getData(apiRoutes.organizationReports.list, params);
      return {
        rows: response?.data?.data?.data || [],
        meta: response?.data?.data?.meta || response?.data?.meta || { page: 1, totalPages: 1, total: 0 },
      };
    },
  });

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!activeReport?._id) throw new Error("No report selected.");
      await patchData(apiRoutes.organizationReports.action(activeReport._id), {
        status: nextStatus,
        adminNotes: adminNotes.trim(),
        actionType,
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Report updated successfully.", position: "top-right" });
      setActiveReport(null);
      setActionType("NONE");
      setAdminNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to process report action.",
        position: "top-right",
      });
    },
  });

  const rows = useMemo(() => (Array.isArray(reportsQuery.data?.rows) ? reportsQuery.data.rows : []), [reportsQuery.data]);
  const meta = reportsQuery.data?.meta || { page: 1, totalPages: 1, total: 0 };
  const companies = useMemo(
    () => (Array.isArray(companiesQuery.data) ? companiesQuery.data : []),
    [companiesQuery.data]
  );

  return (
    <div className="w-full p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports Queue</h1>
        <p className="text-sm text-default-600">
          Review organization member reports and apply account actions when required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          label="Search"
          labelPlacement="outside"
          placeholder="Reason or description"
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
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
        <Select
          label="Company"
          labelPlacement="outside"
          selectedKeys={companyId ? [companyId] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys as Set<string>)[0] || "";
            setCompanyId(String(selected));
            setPage(1);
          }}
          placeholder="All companies"
          isLoading={companiesQuery.isLoading}
        >
          {companies.map((company: any) => (
            <SelectItem key={company?._id || ""} value={company?._id || ""}>
              {company?.name || "-"}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="rounded-xl border border-default-200/80 bg-content1/95 overflow-x-auto shadow-sm">
        {reportsQuery.isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-default-500">No reports found for current filters.</div>
        ) : (
          <table className="w-full min-w-[1080px] text-sm text-foreground">
            <thead className="bg-default-100/70">
              <tr>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Reporter</th>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Target</th>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Company</th>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Reason</th>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Status</th>
                <th className="text-left px-3 py-2 text-default-600 font-semibold">Created</th>
                <th className="text-center px-3 py-2 text-default-600 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, index: number) => (
                <tr
                  key={row?._id || index}
                  className={`border-t border-default-200/70 ${index % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                >
                  <td className="px-3 py-2">{row?.reporterAssociateId?.name || "-"}</td>
                  <td className="px-3 py-2">{row?.targetAssociateId?.name || "-"}</td>
                  <td className="px-3 py-2">{row?.reporterCompanyId?.name || "-"}</td>
                  <td className="px-3 py-2 text-default-600">{row?.reasonCode || "-"}</td>
                  <td className="px-3 py-2">
                    <Chip size="sm" color={statusColor(row?.status) as any} variant="flat">
                      {row?.status || "PENDING_REVIEW"}
                    </Chip>
                  </td>
                  <td className="px-3 py-2 text-default-600">{formatDate(row?.createdAt)}</td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      size="sm"
                      color="warning"
                      variant="flat"
                      onPress={() => {
                        setActiveReport(row);
                        setNextStatus(String(row?.status || "UNDER_REVIEW"));
                        setActionType("NONE");
                        setAdminNotes(String(row?.adminNotes || ""));
                      }}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-default-600">
        <div>
          Page {meta.page || 1} of {meta.totalPages || 1} • Total {meta.total || 0}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="flat"
            isDisabled={(meta.page || 1) <= 1 || reportsQuery.isLoading}
            onPress={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="flat"
            isDisabled={(meta.page || 1) >= (meta.totalPages || 1) || reportsQuery.isLoading}
            onPress={() => setPage((prev) => Math.min(meta.totalPages || 1, prev + 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal
        isOpen={Boolean(activeReport)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveReport(null);
            setActionType("NONE");
            setAdminNotes("");
          }
        }}
      >
        <ModalContent>
          <ModalHeader>Review Report</ModalHeader>
          <ModalBody className="space-y-3">
            <Input
              label="Target"
              labelPlacement="outside"
              value={activeReport?.targetAssociateId?.name || "-"}
              isReadOnly
            />
            <Select
              label="Status"
              labelPlacement="outside"
              selectedKeys={[nextStatus]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>)[0];
                if (selected) setNextStatus(String(selected));
              }}
            >
              {STATUS_OPTIONS.filter((option) => option !== "ALL").map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Account Action"
              labelPlacement="outside"
              selectedKeys={[actionType]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>)[0] as ActionType;
                if (selected) setActionType(selected);
              }}
            >
              {ACTION_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
            <Textarea
              label="Admin Notes"
              labelPlacement="outside"
              minRows={3}
              value={adminNotes}
              onValueChange={setAdminNotes}
              placeholder="Add review or action notes for audit trail."
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setActiveReport(null)}>
              Cancel
            </Button>
            <Button color="warning" isLoading={actionMutation.isPending} onPress={() => actionMutation.mutate()}>
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
