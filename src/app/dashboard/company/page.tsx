"use client";

import { useContext, useEffect, useMemo, useState } from "react";
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

const INTEREST_OPTIONS = [
  "PROCUREMENT",
  "CERTIFICATION",
  "TRANSPORTATION",
  "SHIPPING",
  "PACKAGING",
  "QUALITY_TESTING",
  "OCEAN_FREIGHT",
  "AIR_FREIGHT",
  "INLAND_LOGISTICS",
  "SEA_FREIGHT_FORWARDING",
  "AIR_FREIGHT_FORWARDING",
  "CUSTOMS_CLEARANCE",
  "INLAND_TRANSPORT",
  "WAREHOUSING",
  "CONSOLIDATION_LCL",
  "PROJECT_CARGO",
];

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

const getCompanyPreviewUrl = (company: any) => {
  const customDomain = String(company?.customDomain || "").trim();
  if (customDomain) return `https://${customDomain}`;
  const subdomain = String(company?.subdomain || "").trim();
  if (subdomain) return `https://${subdomain}.company.obaol.com`;
  const slug = String(company?.slug || "").trim();
  if (slug) return `https://obaol.com/obaol/${slug}`;
  return "";
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
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [requestedInterests, setRequestedInterests] = useState<string[]>([]);
  const [interestNote, setInterestNote] = useState("");
  const [recentInterestSubmission, setRecentInterestSubmission] = useState<{
    requestedInterests: string[];
    createdAt: string;
    syncing: boolean;
  } | null>(null);

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
      const payload = response?.data?.data;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload)) return payload;
      return [];
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

  const interestsQuery = useQuery({
    queryKey: ["company-workspace-interests", associateCompanyId],
    queryFn: async () => {
      const response = await getData("/auth/company-interests/status");
      return response?.data?.data || null;
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

  const interestRequestMutation = useMutation({
    mutationFn: async () => {
      if (!requestedInterests.length) throw new Error("Select at least one interest.");
      const response = await postData(apiRoutes.organizationReports.create, {
        targetAssociateId: user?.id,
        reasonCode: "COMPANY_INTEREST_UPDATE",
        description: interestNote.trim() || "Company interest update request from My Company.",
        payload: {
          requestedInterests,
        },
      });
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Failed to submit interest request.");
      }
      return response?.data?.data || null;
    },
    onSuccess: (createdReport: any) => {
      const submittedInterests = [...requestedInterests];
      showToastMessage({
        type: "success",
        message:
          "Interest update request submitted. Previous pending/under-review requests were auto-cancelled.",
        position: "top-right",
      });
      setRecentInterestSubmission({
        requestedInterests:
          Array.isArray(createdReport?.payload?.requestedInterests) && createdReport.payload.requestedInterests.length
            ? createdReport.payload.requestedInterests.map((value: any) => String(value || "").toUpperCase())
            : submittedInterests,
        createdAt: String(createdReport?.createdAt || new Date().toISOString()),
        syncing: !Boolean(createdReport?._id),
      });
      setIsInterestModalOpen(false);
      setRequestedInterests([]);
      setInterestNote("");
      queryClient.invalidateQueries({ queryKey: ["company-workspace-reports"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || error?.message || "Failed to submit interest request.",
        position: "top-right",
      });
    },
  });

  const company = companyQuery.data;
  const previewUrl = getCompanyPreviewUrl(company);
  const isWebsiteLive = Boolean((company as any)?.isWebsiteLive);
  const members = useMemo(() => (Array.isArray(membersQuery.data) ? membersQuery.data : []), [membersQuery.data]);
  const reports = useMemo(() => (Array.isArray(reportsQuery.data) ? reportsQuery.data : []), [reportsQuery.data]);
  const interestsFromStatus = Array.isArray(interestsQuery.data?.companyInterests)
    ? interestsQuery.data.companyInterests.map((value: any) => String(value || "").toUpperCase())
    : [];
  const interestsFromCompany = Array.isArray((company as any)?.serviceCapabilities)
    ? (company as any).serviceCapabilities.map((value: any) => String(value || "").toUpperCase())
    : [];
  const companyInterests = interestsFromStatus.length ? interestsFromStatus : interestsFromCompany;
  const interestReports = useMemo(
    () => reports.filter((row: any) => String(row?.reasonCode || "").toUpperCase() === "COMPANY_INTEREST_UPDATE"),
    [reports]
  );
  const interestStatusSummary = useMemo(() => {
    const summary = {
      pending: 0,
      underReview: 0,
      actionTaken: 0,
      rejected: 0,
      latest: null as any,
    };
    if (!interestReports.length) return summary;
    summary.latest = interestReports[0];
    interestReports.forEach((row: any) => {
      const status = String(row?.status || "").toUpperCase();
      if (status === "PENDING_REVIEW") summary.pending += 1;
      if (status === "UNDER_REVIEW") summary.underReview += 1;
      if (status === "ACTION_TAKEN") summary.actionTaken += 1;
      if (status === "REJECTED") summary.rejected += 1;
    });
    return summary;
  }, [interestReports]);
  const latestPendingLikeReport = useMemo(() => {
    return interestReports.find((row: any) => {
      const status = String(row?.status || "").toUpperCase();
      return status === "PENDING_REVIEW" || status === "UNDER_REVIEW";
    }) || null;
  }, [interestReports]);

  useEffect(() => {
    if (!recentInterestSubmission) return;
    if (latestPendingLikeReport) {
      setRecentInterestSubmission(null);
    }
  }, [latestPendingLikeReport, recentInterestSubmission]);

  useEffect(() => {
    if (!recentInterestSubmission?.syncing) return;
    const timer = setTimeout(() => {
      setRecentInterestSubmission(null);
    }, 15000);
    return () => clearTimeout(timer);
  }, [recentInterestSubmission]);

  const pendingBannerRequestedInterests = useMemo(() => {
    if (latestPendingLikeReport && Array.isArray(latestPendingLikeReport?.payload?.requestedInterests)) {
      return latestPendingLikeReport.payload.requestedInterests.map((value: any) => String(value || "").toUpperCase());
    }
    if (recentInterestSubmission?.requestedInterests?.length) {
      return recentInterestSubmission.requestedInterests.map((value) => String(value || "").toUpperCase());
    }
    return [];
  }, [latestPendingLikeReport, recentInterestSubmission]);

  const pendingBannerCreatedAt = latestPendingLikeReport?.createdAt || recentInterestSubmission?.createdAt || null;

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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{company?.name || "My Company"}</h1>
              {isSupervisor ? (
                <Chip color="warning" variant="flat" size="sm">
                  Supervisor
                </Chip>
              ) : null}
              </div>
              {previewUrl ? (
                <div className="flex items-center gap-2">
                  {!isWebsiteLive && (
                    <Chip size="sm" variant="flat" color="warning">
                      Preview
                    </Chip>
                  )}
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}
                  >
                    View Website
                  </Button>
                </div>
              ) : null}
            </div>
            <p className="text-default-600 text-sm">{company?.email || "-"} • {company?.phone || "-"}</p>
            <p className="text-default-500 text-sm">{company?.address || "No address available."}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Company Interests</h2>
            <p className="text-sm text-default-600">
              Execution opportunities are matched using approved company interests.
            </p>
          </div>
          <Button color="primary" variant="flat" onPress={() => setIsInterestModalOpen(true)}>
            Request Interest Update
          </Button>
        </div>
        <div className="mb-3">
          <Chip size="sm" color={companyInterests.length ? "success" : "warning"} variant="flat">
            {companyInterests.length ? "Configured" : "Not Configured"}
          </Chip>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Chip size="sm" variant="flat" color="warning">
            Pending: {interestStatusSummary.pending}
          </Chip>
          <Chip size="sm" variant="flat" color="secondary">
            Under Review: {interestStatusSummary.underReview}
          </Chip>
          <Chip size="sm" variant="flat" color="success">
            Action Taken: {interestStatusSummary.actionTaken}
          </Chip>
          <Chip size="sm" variant="flat" color="danger">
            Rejected: {interestStatusSummary.rejected}
          </Chip>
        </div>
        {(latestPendingLikeReport || recentInterestSubmission) && (
          <div className="mb-4 rounded-lg border border-warning-200 bg-warning-50 px-3 py-2 dark:border-warning-400/30 dark:bg-warning-400/10">
            <div className="text-sm font-medium text-warning-800 dark:text-warning-200">
              {latestPendingLikeReport ? "Request sent and pending admin approval." : "Submitting request (syncing status...)"} 
            </div>
            <div className="mt-1 text-xs text-warning-700/90 dark:text-warning-200/90">
              Previous pending/under-review requests were auto-cancelled. Latest request is now active.
            </div>
            <div className="mt-1 text-xs text-warning-700/90 dark:text-warning-200/90">
              Services requested:
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {pendingBannerRequestedInterests.map((interest) => (
                <Chip key={`pending-interest-${interest}`} size="sm" color="warning" variant="flat">
                  {interest.replace(/_/g, " ")}
                </Chip>
              ))}
            </div>
            <div className="mt-2 text-xs text-warning-700/90 dark:text-warning-200/90">
              Submitted: {formatDate(pendingBannerCreatedAt)}
            </div>
          </div>
        )}
        {companyInterests.length ? (
          <div className="flex flex-wrap gap-2">
            {companyInterests.map((interest: string) => (
              <Chip key={interest} size="sm" color="primary" variant="flat">
                {interest.replace(/_/g, " ")}
              </Chip>
            ))}
          </div>
        ) : (
          <p className="text-sm text-default-500">
            No approved interests available yet. Submit an update request for admin approval.
          </p>
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
          <h2 className="text-xl font-semibold text-foreground">Interest Update Requests</h2>
          <p className="text-sm text-default-600">Track company interest change requests and their admin status.</p>
        </div>
        {reportsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : interestReports.length === 0 ? (
          <div className="py-6 text-default-500">No interest update requests submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-default-100/70">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Requested Interests</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Status</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Admin Notes</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {interestReports.map((report: any, idx: number) => (
                  <tr
                    key={report?._id || idx}
                    className={`border-t border-default-200/70 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(report?.payload?.requestedInterests) && report.payload.requestedInterests.length > 0
                          ? report.payload.requestedInterests.map((interest: string) => (
                              <Chip key={`${report?._id}-${interest}`} size="sm" color="primary" variant="flat">
                                {String(interest || "").replace(/_/g, " ")}
                              </Chip>
                            ))
                          : "-"}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <Chip size="sm" variant="flat" color={statusColor(report?.status) as any}>
                        {report?.status || "PENDING_REVIEW"}
                      </Chip>
                    </td>
                    <td className="px-3 py-2 text-default-600">{report?.adminNotes || "-"}</td>
                    <td className="px-3 py-2 text-default-600">{formatDate(report?.createdAt)}</td>
                  </tr>
                ))}
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
        isDismissable={false}
        isKeyboardDismissDisabled
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

      <Modal
        isOpen={isInterestModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsInterestModalOpen(false);
            setRequestedInterests([]);
            setInterestNote("");
          }
        }}
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalContent>
          <ModalHeader>Request Company Interest Update</ModalHeader>
          <ModalBody>
            <Select
              label="Requested Interests"
              labelPlacement="outside"
              selectionMode="multiple"
              selectedKeys={new Set(requestedInterests)}
              onSelectionChange={(keys) =>
                setRequestedInterests(Array.from(keys as Set<string>).map((value) => String(value)))
              }
            >
              {INTEREST_OPTIONS.map((interest) => (
                <SelectItem key={interest} value={interest}>
                  {interest.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </Select>
            <p className="text-xs text-default-500">
              Select one or more interests. Submit to admin for approval.
            </p>
            <Textarea
              label="Note (Optional)"
              labelPlacement="outside"
              minRows={3}
              placeholder="Add context for admin review."
              value={interestNote}
              onValueChange={setInterestNote}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsInterestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={interestRequestMutation.isPending}
              isDisabled={requestedInterests.length === 0}
              onPress={() => interestRequestMutation.mutate()}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
