"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { extractList } from "@/core/data/queryUtils";
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
  "INLAND_TRANSPORTATION",
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

const approvalStatusColor = (status: string) => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "APPROVED") return "success";
  if (normalized === "REJECTED") return "danger";
  return "warning";
};

const buildTemporaryPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const bytes = new Uint32Array(14);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((value) => chars[value % chars.length])
      .join("");
  }
  return `${Math.random().toString(36).slice(-8)}A!9`;
};

export default function CompanyWorkspacePage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const roleLower = String(user?.role || "").toLowerCase();
  const isAssociate = roleLower === "associate";
  const isOperatorFamily = roleLower === "operator" || roleLower === "team";
  const isAdmin = roleLower === "admin";
  const canViewObaolConfig = isAdmin;
  const associateCompanyId = String(user?.associateCompanyId || "");
  const queryClient = useQueryClient();

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [reasonCode, setReasonCode] = useState("INACTIVE_MEMBER");
  const [description, setDescription] = useState("");
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [requestedInterests, setRequestedInterests] = useState<string[]>([]);
  const [interestNote, setInterestNote] = useState("");
  const [selectedObaolCompanyId, setSelectedObaolCompanyId] = useState("");
  const [recentInterestSubmission, setRecentInterestSubmission] = useState<{
    requestedInterests: string[];
    createdAt: string;
    syncing: boolean;
  } | null>(null);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [isAddAssociateModalOpen, setIsAddAssociateModalOpen] = useState(false);
  const [operatorCompanyForm, setOperatorCompanyForm] = useState({
    name: "",
    email: "",
    phone: "",
    phoneSecondary: "",
    address: "",
    geoType: "INDIAN",
    country: "",
    state: "",
    district: "",
    division: "",
    pincodeEntry: "",
    companyType: "",
    serviceCapabilities: [] as string[],
  });
  const [operatorAssociateForm, setOperatorAssociateForm] = useState({
    name: "",
    email: "",
    phone: "",
    phoneSecondary: "",
    associateCompany: "",
  });
  const [createdAssociateCredential, setCreatedAssociateCredential] = useState<{
    name: string;
    email: string;
    password: string;
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

  const operatorAssignedCompaniesQuery = useQuery({
    queryKey: ["company-workspace-operator-companies"],
    queryFn: async () => {
      const response = await getData(apiRoutes.associateCompany.getAll, {
        page: 1,
        limit: 250,
        sort: "createdAt:desc",
      });
      return extractList(response);
    },
    enabled: isOperatorFamily,
  });

  const operatorAssociatesQuery = useQuery({
    queryKey: ["company-workspace-operator-associates"],
    queryFn: async () => {
      const response = await getData(apiRoutes.associate.getAll, {
        page: 1,
        limit: 250,
        sort: "createdAt:desc",
      });
      return extractList(response);
    },
    enabled: isOperatorFamily,
  });

  const countriesQuery = useQuery({
    queryKey: ["company-workspace-countries"],
    queryFn: async () => {
      const response = await getData(apiRoutes.country.getAll, {
        page: 1,
        limit: 400,
        sort: "name:asc",
      });
      return extractList(response);
    },
    enabled: isOperatorFamily,
  });

  const statesQuery = useQuery({
    queryKey: ["company-workspace-states"],
    queryFn: async () => {
      const response = await getData(apiRoutes.state.getAll, {
        page: 1,
        limit: 500,
        sort: "name:asc",
      });
      return extractList(response);
    },
    enabled: isOperatorFamily,
  });

  const districtsQuery = useQuery({
    queryKey: ["company-workspace-districts", operatorCompanyForm.state],
    queryFn: async () => {
      const response = await getData(apiRoutes.district.getAll, {
        page: 1,
        limit: 500,
        sort: "name:asc",
        state: operatorCompanyForm.state,
      });
      return extractList(response);
    },
    enabled: isOperatorFamily && Boolean(operatorCompanyForm.state),
  });

  const divisionsQuery = useQuery({
    queryKey: ["company-workspace-divisions", operatorCompanyForm.district],
    queryFn: async () => {
      const response = await getData(apiRoutes.division.getAll, {
        page: 1,
        limit: 500,
        sort: "name:asc",
        district: operatorCompanyForm.district,
      });
      return extractList(response);
    },
    enabled: isOperatorFamily && Boolean(operatorCompanyForm.district),
  });

  const pincodeEntriesQuery = useQuery({
    queryKey: ["company-workspace-pincode-entries", operatorCompanyForm.division],
    queryFn: async () => {
      const response = await getData(apiRoutes.pincodeEntry.getAll, {
        page: 1,
        limit: 500,
        division: operatorCompanyForm.division,
      });
      return extractList(response);
    },
    enabled: isOperatorFamily && Boolean(operatorCompanyForm.division),
  });

  const companyTypesQuery = useQuery({
    queryKey: ["company-workspace-company-types"],
    queryFn: async () => {
      const response = await getData(apiRoutes.companyType.getAll, {
        page: 1,
        limit: 250,
        sort: "name:asc",
      });
      return extractList(response);
    },
    enabled: isOperatorFamily,
  });

  const obaolConfigQuery = useQuery({
    queryKey: ["system-config-obaol-company"],
    queryFn: async () => {
      const response = await getData(apiRoutes.systemConfig.obaolCompany);
      return response?.data?.data || null;
    },
    enabled: canViewObaolConfig,
  });

  const obaolCompanyDirectoryQuery = useQuery({
    queryKey: ["system-config-obaol-company-directory"],
    queryFn: () =>
      getData(apiRoutes.associateCompany.getAll, {
        page: 1,
        limit: 500,
        sort: "name:asc",
      }),
    enabled: canViewObaolConfig,
  });

  const obaolConfigMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const response = await postData(apiRoutes.systemConfig.obaolCompany, { companyId });
      return response?.data?.data || null;
    },
    onSuccess: (data: any) => {
      showToastMessage({
        type: "success",
        message: data?.company?.name ? `OBAOL company set to ${data.company.name}.` : "OBAOL company updated.",
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["system-config-obaol-company"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to update OBAOL company configuration.",
        position: "top-right",
      });
    },
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

  const operatorCreateCompanyMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: operatorCompanyForm.name.trim(),
        email: operatorCompanyForm.email.trim(),
        phone: operatorCompanyForm.phone.trim(),
        phoneSecondary: operatorCompanyForm.phoneSecondary.trim(),
      };

      if (operatorCompanyForm.address.trim()) payload.address = operatorCompanyForm.address.trim();
      payload.geoType = operatorCompanyForm.geoType;
      if (operatorCompanyForm.companyType) payload.companyType = operatorCompanyForm.companyType;
      if (operatorCompanyForm.serviceCapabilities.length) payload.serviceCapabilities = operatorCompanyForm.serviceCapabilities;

      if (operatorCompanyForm.geoType === "INTERNATIONAL") {
        if (operatorCompanyForm.country) payload.country = operatorCompanyForm.country;
      } else {
        if (operatorCompanyForm.state) payload.state = operatorCompanyForm.state;
        if (operatorCompanyForm.district) payload.district = operatorCompanyForm.district;
        if (operatorCompanyForm.division) payload.division = operatorCompanyForm.division;
        if (operatorCompanyForm.pincodeEntry) payload.pincodeEntry = operatorCompanyForm.pincodeEntry;
      }

      const response = await postData(apiRoutes.associateCompany.getAll, payload);
      return response?.data?.data || null;
    },
    onSuccess: () => {
      showToastMessage({
        type: "success",
        message: "Company added successfully and sent for admin approval.",
        position: "top-right",
      });
      setIsAddCompanyModalOpen(false);
      setOperatorCompanyForm({
        name: "",
        email: "",
        phone: "",
        phoneSecondary: "",
        address: "",
        geoType: "INDIAN",
        country: "",
        state: "",
        district: "",
        division: "",
        pincodeEntry: "",
        companyType: "",
        serviceCapabilities: [],
      });
      queryClient.invalidateQueries({ queryKey: ["company-workspace-operator-companies"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to add company.",
        position: "top-right",
      });
    },
  });

  const operatorCreateAssociateMutation = useMutation({
    mutationFn: async () => {
      const temporaryPassword = buildTemporaryPassword();
      const payload = {
        name: operatorAssociateForm.name.trim(),
        email: operatorAssociateForm.email.trim(),
        phone: operatorAssociateForm.phone.trim(),
        phoneSecondary: operatorAssociateForm.phoneSecondary.trim(),
        associateCompany: operatorAssociateForm.associateCompany,
        password: temporaryPassword,
      };
      const response = await postData(apiRoutes.associate.getAll, payload);
      return {
        created: response?.data?.data || null,
        temporaryPassword,
      };
    },
    onSuccess: (result: any) => {
      showToastMessage({
        type: "success",
        message: "Associate created successfully.",
        position: "top-right",
      });
      setIsAddAssociateModalOpen(false);
      setOperatorAssociateForm({
        name: "",
        email: "",
        phone: "",
        phoneSecondary: "",
        associateCompany: "",
      });
      setCreatedAssociateCredential({
        name: String(result?.created?.name || ""),
        email: String(result?.created?.email || operatorAssociateForm.email || ""),
        password: String(result?.temporaryPassword || ""),
      });
      queryClient.invalidateQueries({ queryKey: ["company-workspace-operator-associates"] });
      queryClient.invalidateQueries({ queryKey: ["company-workspace-operator-companies"] });
    },
    onError: (error: any) => {
      showToastMessage({
        type: "error",
        message: error?.response?.data?.message || "Failed to add associate.",
        position: "top-right",
      });
    },
  });

  const company = companyQuery.data;
  const previewUrl = getCompanyPreviewUrl(company);
  const isWebsiteLive = Boolean((company as any)?.isWebsiteLive);
  const members = useMemo(() => (Array.isArray(membersQuery.data) ? membersQuery.data : []), [membersQuery.data]);
  const reports = useMemo(() => (Array.isArray(reportsQuery.data) ? reportsQuery.data : []), [reportsQuery.data]);
  const obaolConfig = obaolConfigQuery.data;
  const obaolCompanyId = String(obaolConfig?.companyId || "");
  const obaolCompany = obaolConfig?.company || null;
  const obaolCompanies = useMemo(
    () => extractList(obaolCompanyDirectoryQuery.data),
    [obaolCompanyDirectoryQuery.data]
  );
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

  useEffect(() => {
    if (!canViewObaolConfig) return;
    if (!obaolCompanyId) return;
    setSelectedObaolCompanyId((current) => current || obaolCompanyId);
  }, [canViewObaolConfig, obaolCompanyId]);

  useEffect(() => {
    if (!isAdmin) return;
    router.replace("/dashboard/companies");
  }, [isAdmin, router]);

  useEffect(() => {
    setOperatorCompanyForm((current) => ({
      ...current,
      district: "",
      division: "",
      pincodeEntry: "",
    }));
  }, [operatorCompanyForm.state]);

  useEffect(() => {
    setOperatorCompanyForm((current) => ({
      ...current,
      division: "",
      pincodeEntry: "",
    }));
  }, [operatorCompanyForm.district]);

  useEffect(() => {
    setOperatorCompanyForm((current) => ({
      ...current,
      pincodeEntry: "",
    }));
  }, [operatorCompanyForm.division]);

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
  const operatorAssignedCompanies = useMemo(
    () => (Array.isArray(operatorAssignedCompaniesQuery.data) ? operatorAssignedCompaniesQuery.data : []),
    [operatorAssignedCompaniesQuery.data]
  );
  const operatorAssociates = useMemo(
    () => (Array.isArray(operatorAssociatesQuery.data) ? operatorAssociatesQuery.data : []),
    [operatorAssociatesQuery.data]
  );
  const locationCountries = useMemo(
    () => (Array.isArray(countriesQuery.data) ? countriesQuery.data : []),
    [countriesQuery.data]
  );
  const locationStates = useMemo(
    () => (Array.isArray(statesQuery.data) ? statesQuery.data : []),
    [statesQuery.data]
  );
  const locationDistricts = useMemo(
    () => (Array.isArray(districtsQuery.data) ? districtsQuery.data : []),
    [districtsQuery.data]
  );
  const locationDivisions = useMemo(
    () => (Array.isArray(divisionsQuery.data) ? divisionsQuery.data : []),
    [divisionsQuery.data]
  );
  const locationPincodes = useMemo(
    () => (Array.isArray(pincodeEntriesQuery.data) ? pincodeEntriesQuery.data : []),
    [pincodeEntriesQuery.data]
  );
  const availableCompanyTypes = useMemo(
    () => (Array.isArray(companyTypesQuery.data) ? companyTypesQuery.data : []),
    [companyTypesQuery.data]
  );

  if (isAdmin) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!isAssociate && !isOperatorFamily && !canViewObaolConfig) {
    return (
      <div className="w-full p-6">
        <div className="rounded-xl border border-default-200 bg-content1 p-6 text-default-700">
          This workspace is available for associates and operators.
        </div>
      </div>
    );
  }

  if (isAssociate && !associateCompanyId && !canViewObaolConfig) {
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
      {canViewObaolConfig && (
        <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-foreground">OBAOL Company Configuration</h2>
            <p className="text-sm text-default-600">
              Select the system company used for Seller ↔ OBAOL and OBAOL ↔ Buyer document generation.
            </p>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Chip size="sm" color={obaolCompanyId ? "success" : "warning"} variant="flat">
              {obaolCompanyId ? "Configured" : "Missing"}
            </Chip>
            {obaolCompany?.name && (
              <span className="text-sm text-default-600">
                Current: <span className="font-medium text-foreground">{obaolCompany.name}</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(240px,1fr)_auto] md:items-end">
            <Select
              label="OBAOL Company"
              labelPlacement="outside"
              placeholder="Select the OBAOL company"
              isLoading={obaolCompanyDirectoryQuery.isLoading}
              selectedKeys={selectedObaolCompanyId ? new Set([selectedObaolCompanyId]) : new Set()}
              onSelectionChange={(keys) => {
                const nextValue = Array.from(keys as Set<string>)[0] || "";
                setSelectedObaolCompanyId(nextValue);
              }}
            >
              {obaolCompanies.map((companyItem: any) => (
                <SelectItem key={companyItem?._id || companyItem?.id} value={companyItem?._id || companyItem?.id}>
                  {companyItem?.name || "Unnamed Company"}
                </SelectItem>
              ))}
            </Select>
            <Button
              color="primary"
              isLoading={obaolConfigMutation.isPending}
              isDisabled={!selectedObaolCompanyId}
              onPress={() => obaolConfigMutation.mutate(selectedObaolCompanyId)}
            >
              Save OBAOL Company
            </Button>
          </div>
          <div className="mt-4 text-xs text-default-500">
            This configuration is required to draft quotations, proforma invoices, and purchase orders without errors.
          </div>
        </div>
      )}

      {isOperatorFamily && (
        <>
          <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Operator Company Workspace</h1>
                <p className="text-sm text-default-600">
                  Manage companies assigned to you and onboard their associates.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button color="primary" onPress={() => setIsAddCompanyModalOpen(true)}>
                  Add Company
                </Button>
                <Button
                  color="secondary"
                  variant="flat"
                  onPress={() => setIsAddAssociateModalOpen(true)}
                >
                  Add Associate
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Assigned Companies</h2>
              <p className="text-sm text-default-600">These are the companies currently handled by you.</p>
            </div>
            {operatorAssignedCompaniesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : operatorAssignedCompaniesQuery.isError ? (
              <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-200">
                Failed to load assigned companies.
              </div>
            ) : operatorAssignedCompanies.length === 0 ? (
              <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800 dark:border-warning-400/30 dark:bg-warning-500/10 dark:text-warning-100">
                No companies are assigned yet. Use <span className="font-semibold">Add Company</span> to onboard one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-default-100/70">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Company</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Email</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Phone</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Company Type</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Status</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorAssignedCompanies.map((item: any, idx: number) => (
                      <tr
                        key={item?._id || idx}
                        className={`border-t border-default-200/70 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                      >
                        <td className="px-3 py-2 font-medium text-foreground">{item?.name || "-"}</td>
                        <td className="px-3 py-2 text-default-600">{item?.email || "-"}</td>
                        <td className="px-3 py-2 text-default-600">{item?.phone || "-"}</td>
                        <td className="px-3 py-2 text-default-600">
                          {item?.companyType?.name || item?.companyTypeName || "-"}
                        </td>
                        <td className="px-3 py-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={approvalStatusColor(String(item?.registrationStatus || "")) as any}
                          >
                            {String(item?.registrationStatus || "PENDING_REVIEW")}
                          </Chip>
                        </td>
                        <td className="px-3 py-2 text-default-600">{formatDate(item?.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Company Associates</h2>
              <p className="text-sm text-default-600">
                Members visible here belong to companies assigned to your operator account.
              </p>
            </div>
            {operatorAssociatesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : operatorAssociatesQuery.isError ? (
              <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 dark:border-danger-500/30 dark:bg-danger-500/10 dark:text-danger-200">
                Failed to load associates.
              </div>
            ) : operatorAssociates.length === 0 ? (
              <div className="py-4 text-sm text-default-500">No associates found for your assigned companies.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-default-100/70">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Name</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Email</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Phone</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Company</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Status</th>
                      <th className="text-left px-3 py-2 font-semibold text-default-700">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatorAssociates.map((item: any, idx: number) => (
                      <tr
                        key={item?._id || idx}
                        className={`border-t border-default-200/70 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                      >
                        <td className="px-3 py-2 font-medium text-foreground">{item?.name || "-"}</td>
                        <td className="px-3 py-2 text-default-600">{item?.email || "-"}</td>
                        <td className="px-3 py-2 text-default-600">{item?.phone || "-"}</td>
                        <td className="px-3 py-2 text-default-600">
                          {item?.associateCompany?.name || item?.associateCompanyName || "-"}
                        </td>
                        <td className="px-3 py-2">
                          <Chip
                            size="sm"
                            variant="flat"
                            color={approvalStatusColor(String(item?.registrationStatus || "")) as any}
                          >
                            {String(item?.registrationStatus || "PENDING_REVIEW")}
                          </Chip>
                        </td>
                        <td className="px-3 py-2 text-default-600">{formatDate(item?.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {isAssociate && (
        <>
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
        </>
      )}

      <Modal
        isOpen={isAddCompanyModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsAddCompanyModalOpen(false);
        }}
      >
        <ModalContent>
          <ModalHeader>Add Company</ModalHeader>
          <ModalBody>
            <Input
              label="Company Name"
              labelPlacement="outside"
              value={operatorCompanyForm.name}
              onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, name: value }))}
              isRequired
            />
            <Input
              label="Email"
              type="email"
              labelPlacement="outside"
              value={operatorCompanyForm.email}
              onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, email: value }))}
              isRequired
            />
            <Input
              label="Phone"
              labelPlacement="outside"
              value={operatorCompanyForm.phone}
              onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, phone: value }))}
              isRequired
            />
            <Input
              label="Phone Secondary"
              labelPlacement="outside"
              value={operatorCompanyForm.phoneSecondary}
              onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, phoneSecondary: value }))}
              isRequired
            />
            <Textarea
              label="Address (Optional)"
              labelPlacement="outside"
              minRows={2}
              value={operatorCompanyForm.address}
              onValueChange={(value) => setOperatorCompanyForm((current) => ({ ...current, address: value }))}
            />
            <Select
              label="Geo Type"
              labelPlacement="outside"
              selectedKeys={new Set([operatorCompanyForm.geoType])}
              onSelectionChange={(keys) => {
                const value = Array.from(keys as Set<string>)[0] || "INDIAN";
                setOperatorCompanyForm((current) => ({ ...current, geoType: String(value) }));
              }}
            >
              <SelectItem key="INDIAN" value="INDIAN">
                Indian
              </SelectItem>
              <SelectItem key="INTERNATIONAL" value="INTERNATIONAL">
                International
              </SelectItem>
            </Select>
            {operatorCompanyForm.geoType === "INTERNATIONAL" ? (
              <Select
                label="Country (Optional)"
                labelPlacement="outside"
                selectedKeys={operatorCompanyForm.country ? new Set([operatorCompanyForm.country]) : new Set()}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys as Set<string>)[0] || "";
                  setOperatorCompanyForm((current) => ({ ...current, country: String(value) }));
                }}
                isLoading={countriesQuery.isLoading}
              >
                {locationCountries.map((countryItem: any) => (
                  <SelectItem key={countryItem?._id || countryItem?.id} value={countryItem?._id || countryItem?.id}>
                    {countryItem?.name || "Unnamed Country"}
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <>
                <Select
                  label="State (Optional)"
                  labelPlacement="outside"
                  selectedKeys={operatorCompanyForm.state ? new Set([operatorCompanyForm.state]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys as Set<string>)[0] || "";
                    setOperatorCompanyForm((current) => ({ ...current, state: String(value) }));
                  }}
                  isLoading={statesQuery.isLoading}
                >
                  {locationStates.map((stateItem: any) => (
                    <SelectItem key={stateItem?._id || stateItem?.id} value={stateItem?._id || stateItem?.id}>
                      {stateItem?.name || "Unnamed State"}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="District (Optional)"
                  labelPlacement="outside"
                  selectedKeys={operatorCompanyForm.district ? new Set([operatorCompanyForm.district]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys as Set<string>)[0] || "";
                    setOperatorCompanyForm((current) => ({ ...current, district: String(value) }));
                  }}
                  isDisabled={!operatorCompanyForm.state}
                  isLoading={districtsQuery.isLoading}
                >
                  {locationDistricts.map((districtItem: any) => (
                    <SelectItem key={districtItem?._id || districtItem?.id} value={districtItem?._id || districtItem?.id}>
                      {districtItem?.name || "Unnamed District"}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Division (Optional)"
                  labelPlacement="outside"
                  selectedKeys={operatorCompanyForm.division ? new Set([operatorCompanyForm.division]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys as Set<string>)[0] || "";
                    setOperatorCompanyForm((current) => ({ ...current, division: String(value) }));
                  }}
                  isDisabled={!operatorCompanyForm.district}
                  isLoading={divisionsQuery.isLoading}
                >
                  {locationDivisions.map((divisionItem: any) => (
                    <SelectItem key={divisionItem?._id || divisionItem?.id} value={divisionItem?._id || divisionItem?.id}>
                      {divisionItem?.name || "Unnamed Division"}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Pincode (Optional)"
                  labelPlacement="outside"
                  selectedKeys={operatorCompanyForm.pincodeEntry ? new Set([operatorCompanyForm.pincodeEntry]) : new Set()}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys as Set<string>)[0] || "";
                    setOperatorCompanyForm((current) => ({ ...current, pincodeEntry: String(value) }));
                  }}
                  isDisabled={!operatorCompanyForm.division}
                  isLoading={pincodeEntriesQuery.isLoading}
                >
                  {locationPincodes.map((entry: any) => (
                    <SelectItem key={entry?._id || entry?.id} value={entry?._id || entry?.id}>
                      {entry?.pincode ? `${entry.pincode}${entry?.officename ? ` - ${entry.officename}` : ""}` : "Pincode Entry"}
                    </SelectItem>
                  ))}
                </Select>
              </>
            )}
            <Select
              label="Company Type (Optional)"
              labelPlacement="outside"
              selectedKeys={operatorCompanyForm.companyType ? new Set([operatorCompanyForm.companyType]) : new Set()}
              onSelectionChange={(keys) => {
                const value = Array.from(keys as Set<string>)[0] || "";
                setOperatorCompanyForm((current) => ({ ...current, companyType: String(value) }));
              }}
              isLoading={companyTypesQuery.isLoading}
            >
              {availableCompanyTypes.map((companyType: any) => (
                <SelectItem key={companyType?._id || companyType?.id} value={companyType?._id || companyType?.id}>
                  {companyType?.name || "Unnamed Company Type"}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Service Capabilities (Optional)"
              labelPlacement="outside"
              selectionMode="multiple"
              selectedKeys={new Set(operatorCompanyForm.serviceCapabilities)}
              onSelectionChange={(keys) =>
                setOperatorCompanyForm((current) => ({
                  ...current,
                  serviceCapabilities: Array.from(keys as Set<string>).map((value) => String(value)),
                }))
              }
            >
              {INTEREST_OPTIONS.map((interest) => (
                <SelectItem key={interest} value={interest}>
                  {interest.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsAddCompanyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={operatorCreateCompanyMutation.isPending}
              isDisabled={
                !operatorCompanyForm.name.trim() ||
                !operatorCompanyForm.email.trim() ||
                !operatorCompanyForm.phone.trim() ||
                !operatorCompanyForm.phoneSecondary.trim()
              }
              onPress={() => operatorCreateCompanyMutation.mutate()}
            >
              Add Company
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isAddAssociateModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsAddAssociateModalOpen(false);
        }}
      >
        <ModalContent>
          <ModalHeader>Add Associate</ModalHeader>
          <ModalBody>
            <Input
              label="Associate Name"
              labelPlacement="outside"
              value={operatorAssociateForm.name}
              onValueChange={(value) => setOperatorAssociateForm((current) => ({ ...current, name: value }))}
              isRequired
            />
            <Input
              label="Email"
              type="email"
              labelPlacement="outside"
              value={operatorAssociateForm.email}
              onValueChange={(value) => setOperatorAssociateForm((current) => ({ ...current, email: value }))}
              isRequired
            />
            <Input
              label="Phone"
              labelPlacement="outside"
              value={operatorAssociateForm.phone}
              onValueChange={(value) => setOperatorAssociateForm((current) => ({ ...current, phone: value }))}
              isRequired
            />
            <Input
              label="Phone Secondary"
              labelPlacement="outside"
              value={operatorAssociateForm.phoneSecondary}
              onValueChange={(value) => setOperatorAssociateForm((current) => ({ ...current, phoneSecondary: value }))}
              isRequired
            />
            <Select
              label="Assign Company"
              labelPlacement="outside"
              selectedKeys={operatorAssociateForm.associateCompany ? new Set([operatorAssociateForm.associateCompany]) : new Set()}
              onSelectionChange={(keys) => {
                const value = Array.from(keys as Set<string>)[0] || "";
                setOperatorAssociateForm((current) => ({ ...current, associateCompany: String(value) }));
              }}
              isRequired
            >
              {operatorAssignedCompanies.map((companyItem: any) => (
                <SelectItem key={companyItem?._id || companyItem?.id} value={companyItem?._id || companyItem?.id}>
                  {companyItem?.name || "Unnamed Company"}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsAddAssociateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="secondary"
              isLoading={operatorCreateAssociateMutation.isPending}
              isDisabled={
                !operatorAssociateForm.name.trim() ||
                !operatorAssociateForm.email.trim() ||
                !operatorAssociateForm.phone.trim() ||
                !operatorAssociateForm.phoneSecondary.trim() ||
                !operatorAssociateForm.associateCompany
              }
              onPress={() => operatorCreateAssociateMutation.mutate()}
            >
              Add Associate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={Boolean(createdAssociateCredential)}
        onOpenChange={(open) => {
          if (!open) setCreatedAssociateCredential(null);
        }}
      >
        <ModalContent>
          <ModalHeader>Associate Credentials</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Credentials are shown once. Share these securely with the associate.
            </p>
            <Input
              label="Associate"
              labelPlacement="outside"
              value={createdAssociateCredential?.name || "-"}
              isReadOnly
            />
            <Input
              label="Email"
              labelPlacement="outside"
              value={createdAssociateCredential?.email || "-"}
              isReadOnly
            />
            <Input
              label="Temporary Password"
              labelPlacement="outside"
              value={createdAssociateCredential?.password || "-"}
              isReadOnly
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              color="primary"
              onPress={async () => {
                const password = createdAssociateCredential?.password || "";
                if (!password) return;
                try {
                  await navigator.clipboard.writeText(password);
                  showToastMessage({
                    type: "success",
                    message: "Temporary password copied.",
                    position: "top-right",
                  });
                } catch {
                  showToastMessage({
                    type: "error",
                    message: "Unable to copy password.",
                    position: "top-right",
                  });
                }
              }}
            >
              Copy Password
            </Button>
            <Button color="primary" onPress={() => setCreatedAssociateCredential(null)}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
