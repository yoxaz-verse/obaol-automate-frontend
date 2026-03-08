"use client";

import { useContext, useMemo, useState } from "react";
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
import AuthContext from "@/context/AuthContext";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

const REPORT_REASONS = [
  { key: "INACTIVE_MEMBER", label: "Inactive Member" },
  { key: "MISCONDUCT", label: "Misconduct" },
  { key: "WRONG_COMPANY_LINK", label: "Wrong Company Link" },
  { key: "SPAM_BEHAVIOR", label: "Spam Behavior" },
  { key: "PROFILE_ISSUE", label: "Profile Issue" },
  { key: "OTHER", label: "Other" },
];

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

export default function CompanyWorkspacePage() {
  const { user } = useContext(AuthContext);
  const roleLower = String(user?.role || "").toLowerCase();
  const isAssociate = roleLower === "associate";
  const associateCompanyId = String(user?.associateCompanyId || "");
  const queryClient = useQueryClient();

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [reasonCode, setReasonCode] = useState("INACTIVE_MEMBER");
  const [description, setDescription] = useState("");

  const companyQuery = useQuery({
    queryKey: ["company-workspace-company", associateCompanyId],
    queryFn: async () => {
      const response = await getData(`${apiRoutes.associateCompany.getAll}/${associateCompanyId}`);
      return response?.data?.data || null;
    },
    enabled: isAssociate && Boolean(associateCompanyId),
  });

  const membersQuery = useQuery({
    queryKey: ["company-workspace-members", associateCompanyId],
    queryFn: async () => {
      const response = await getData(apiRoutes.associate.getAll, {
        associateCompany: associateCompanyId,
        page: 1,
        limit: 250,
        sort: "createdAt:desc",
      });
      return response?.data?.data?.data || [];
    },
    enabled: isAssociate && Boolean(associateCompanyId),
  });

  const reportsQuery = useQuery({
    queryKey: ["company-workspace-reports", associateCompanyId],
    queryFn: async () => {
      const response = await getData(apiRoutes.organizationReports.list, {
        page: 1,
        limit: 200,
        sort: "createdAt:desc",
      });
      return response?.data?.data?.data || [];
    },
    enabled: isAssociate && Boolean(associateCompanyId),
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMember?._id) {
        throw new Error("Select a member to report.");
      }
      await postData(apiRoutes.organizationReports.create, {
        targetAssociateId: selectedMember._id,
        reasonCode,
        description: description.trim(),
      });
    },
    onSuccess: () => {
      showToastMessage({ type: "success", message: "Report submitted for admin review.", position: "top-right" });
      setSelectedMember(null);
      setDescription("");
      setReasonCode("INACTIVE_MEMBER");
      queryClient.invalidateQueries({ queryKey: ["company-workspace-reports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to submit report.",
        position: "top-right",
      });
    },
  });

  const company = companyQuery.data;
  const members = useMemo(() => (Array.isArray(membersQuery.data) ? membersQuery.data : []), [membersQuery.data]);
  const reports = useMemo(() => (Array.isArray(reportsQuery.data) ? reportsQuery.data : []), [reportsQuery.data]);

  const supervisorId = String(company?.supervisor?._id || company?.supervisor || "");
  const isSupervisor = Boolean(user?.id && supervisorId && user?.id === supervisorId);

  if (!isAssociate) {
    return (
      <div className="w-full p-6">
        <div className="rounded-xl border border-default-200 bg-content1 p-6 text-default-700">
          This workspace is available only for associates.
        </div>
      </div>
    );
  }

  if (!associateCompanyId) {
    return (
      <div className="w-full p-6">
        <div className="rounded-xl border border-default-200 bg-content1 p-6 text-default-700">
          No company is linked to your associate account yet.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
        {companyQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{company?.name || "My Company"}</h1>
              {isSupervisor ? (
                <Chip color="warning" variant="flat" size="sm">
                  Supervisor
                </Chip>
              ) : null}
            </div>
            <p className="text-default-600 text-sm">{company?.email || "-"} • {company?.phone || "-"}</p>
            <p className="text-default-500 text-sm">{company?.address || "No address available."}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Company Members</h2>
          <p className="text-sm text-default-600">Report member issues for admin review. Direct delete is disabled.</p>
        </div>
        {membersQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : members.length === 0 ? (
          <div className="py-6 text-default-500">No members found in your company.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-default-100/70">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Name</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Email</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Phone</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Status</th>
                  <th className="text-right px-3 py-2 font-semibold text-default-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member: any, idx: number) => {
                  const isSelf = String(member?._id || "") === String(user?.id || "");
                  return (
                    <tr
                      key={member?._id || idx}
                      className={`border-t border-default-200/70 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                    >
                      <td className="px-3 py-2">{member?.name || "-"}</td>
                      <td className="px-3 py-2 text-default-600">{member?.email || "-"}</td>
                      <td className="px-3 py-2 text-default-600">{member?.phone || "-"}</td>
                      <td className="px-3 py-2">
                        <Chip size="sm" color={member?.isActive ? "success" : "danger"} variant="flat">
                          {member?.isActive ? "Active" : "Inactive"}
                        </Chip>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          isDisabled={isSelf}
                          onPress={() => setSelectedMember(member)}
                        >
                          {isSelf ? "Self" : "Report Member"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">{isSupervisor ? "Company Reports" : "My Submitted Reports"}</h2>
          <p className="text-sm text-default-600">
            {isSupervisor
              ? "As supervisor, you can track all company reports."
              : "Track the status of reports you submitted."}
          </p>
        </div>
        {reportsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : reports.length === 0 ? (
          <div className="py-6 text-default-500">No reports available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-default-100/70">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Reporter</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Target</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Reason</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Status</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: any, idx: number) => (
                  <tr
                    key={report?._id || idx}
                    className={`border-t border-default-200/70 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                  >
                    <td className="px-3 py-2">{report?.reporterAssociateId?.name || "-"}</td>
                    <td className="px-3 py-2">{report?.targetAssociateId?.name || "-"}</td>
                    <td className="px-3 py-2 text-default-600">{report?.reasonCode || "-"}</td>
                    <td className="px-3 py-2">
                      <Chip size="sm" variant="flat" color={statusColor(report?.status) as any}>
                        {report?.status || "PENDING_REVIEW"}
                      </Chip>
                    </td>
                    <td className="px-3 py-2 text-default-600">{formatDate(report?.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selectedMember)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMember(null);
            setDescription("");
          }
        }}
      >
        <ModalContent>
          <ModalHeader>Report Member</ModalHeader>
          <ModalBody>
            <Input
              label="Target Member"
              labelPlacement="outside"
              value={selectedMember?.name || "-"}
              isReadOnly
            />
            <Select
              label="Reason"
              labelPlacement="outside"
              selectedKeys={[reasonCode]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys as Set<string>)[0];
                if (selected) setReasonCode(String(selected));
              }}
            >
              {REPORT_REASONS.map((reason) => (
                <SelectItem key={reason.key} value={reason.key}>
                  {reason.label}
                </SelectItem>
              ))}
            </Select>
            <Textarea
              label="Description"
              labelPlacement="outside"
              minRows={3}
              placeholder="Describe the issue clearly for admin review."
              value={description}
              onValueChange={setDescription}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setSelectedMember(null)}>
              Cancel
            </Button>
            <Button
              color="warning"
              isLoading={reportMutation.isPending}
              isDisabled={!description.trim()}
              onPress={() => reportMutation.mutate()}
            >
              Submit Report
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
