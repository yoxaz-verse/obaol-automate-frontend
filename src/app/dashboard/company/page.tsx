"use client";

import { LuUser, LuPlus, LuLayoutDashboard, LuUsers, LuBuilding, LuActivity, LuCheck, LuChevronUp, LuChevronDown, LuGlobe, LuMapPin, LuMail, LuPhone, LuPackage, LuClipboardList, LuArrowUpRight } from "react-icons/lu";
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
import { getData, postData, putData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { extractList } from "@/core/data/queryUtils";
import { showToastMessage } from "@/utils/utils";
import OnboardingModal from "@/components/dashboard/Company/OnboardingModal";
import { COMPANY_FUNCTION_TAXONOMY_VERSION, fetchRegisterOptions } from "@/utils/registerOptions";
import { CompanyMetricCard, CompanyProfileReadiness } from "@/components/dashboard/Company/CompanyOverviewCards";
import { reconcileCompanyFunctionPriorities } from "@/utils/companyFunctionPriorities";
import { getCompanyFunctionPerspectiveDescription } from "@/utils/companyFunctionDescriptions";


const MAIN_CATEGORY_SLUGS = new Set([
  "buying", "selling", "sourcing", "packaging", "testing", "warehouse-storage", "finance-risk",
  "importing-to-india", "exporting-from-india", "freight-forwarding", "inland-logistics",
]);

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



export default function CompanyWorkspacePage() {
  const { user, refreshUser } = useContext(AuthContext);
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
  const [requestedProvidedIds, setRequestedProvidedIds] = useState<string[]>([]);
  const [requestedSoughtIds, setRequestedSoughtIds] = useState<string[]>([]);
  const [requestedProvidedPriorities, setRequestedProvidedPriorities] = useState<string[]>([]);
  const [requestedSoughtPriorities, setRequestedSoughtPriorities] = useState<string[]>([]);
  const [interestNote, setInterestNote] = useState("");
  const [selectedObaolCompanyId, setSelectedObaolCompanyId] = useState("");
  const [recentInterestSubmission, setRecentInterestSubmission] = useState<{
    requestedInterests: string[];
    createdAt: string;
    syncing: boolean;
  } | null>(null);
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

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

  const registerOptionsQuery = useQuery({
    queryKey: ["company-workspace-capability-options", COMPANY_FUNCTION_TAXONOMY_VERSION],
    queryFn: fetchRegisterOptions,
    enabled: isAssociate,
    staleTime: 5 * 60 * 1000,
  });

  const companyStatsQuery = useQuery({
    queryKey: ["company-workspace-stats", associateCompanyId],
    queryFn: async () => {
      const response = await getData(`/api/v1/web/associate-companies/${associateCompanyId}/stats`);
      return { meta: response?.data?.meta?.company || {}, team: Array.isArray(response?.data?.data) ? response.data.data : [] };
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
      if (!requestedProvidedIds.length || !requestedSoughtIds.length) throw new Error("Select at least one provided and one sought category.");
      const response = await postData(apiRoutes.organizationReports.create, {
        targetAssociateId: user?.id,
        reasonCode: "COMPANY_INTEREST_UPDATE",
        description: interestNote.trim() || "Company interest update request from My Company.",
        payload: {
          requestedProvidedFunctionIds: requestedProvidedIds,
          requestedSoughtFunctionIds: requestedSoughtIds,
          requestedProvidedFunctionPriorities: requestedProvidedPriorities,
          requestedSoughtFunctionPriorities: requestedSoughtPriorities,
          note: interestNote.trim(),
        },
      });
      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Failed to submit interest request.");
      }
      return response?.data?.data || null;
    },
    onSuccess: (createdReport: any) => {
      const submittedInterests = [...requestedProvidedIds, ...requestedSoughtIds];
      showToastMessage({
        type: "success",
        message:
          "Company capability update submitted for admin approval.",
        position: "top-right",
      });
      setRecentInterestSubmission({
        requestedInterests:
          Array.isArray(createdReport?.payload?.requestedProvidedFunctionIds) && createdReport.payload.requestedProvidedFunctionIds.length
            ? [...createdReport.payload.requestedProvidedFunctionIds, ...(createdReport.payload.requestedSoughtFunctionIds || [])].map((value: any) => String(value || ""))
            : submittedInterests,
        createdAt: String(createdReport?.createdAt || new Date().toISOString()),
        syncing: !Boolean(createdReport?._id),
      });
      setIsInterestModalOpen(false);
      setRequestedProvidedIds([]);
      setRequestedSoughtIds([]);
      setRequestedProvidedPriorities([]);
      setRequestedSoughtPriorities([]);
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
  const obaolConfig = obaolConfigQuery.data;
  const obaolCompanyId = String(obaolConfig?.companyId || "");
  const obaolCompany = obaolConfig?.company || null;
  const obaolCompanies = useMemo(
    () => extractList(obaolCompanyDirectoryQuery.data),
    [obaolCompanyDirectoryQuery.data]
  );
  const capabilityOptions = useMemo(
    () => (Array.isArray(registerOptionsQuery.data?.companyFunctions) ? registerOptionsQuery.data.companyFunctions : [])
      .filter((item: any) => MAIN_CATEGORY_SLUGS.has(String(item?.slug || "")))
      .sort((a: any, b: any) => Number(a?.orderIndex || 0) - Number(b?.orderIndex || 0)),
    [registerOptionsQuery.data]
  );
  const capabilityById = useMemo(
    () => new Map(capabilityOptions.map((item: any) => [String(item?._id || ""), item])),
    [capabilityOptions]
  );
  const capabilityBySlug = useMemo(
    () => new Map(capabilityOptions.map((item: any) => [String(item?.slug || "").toLowerCase(), item])),
    [capabilityOptions]
  );
  const idsFromSlugs = (values: any) => (Array.isArray(values) ? values : [])
    .map((slug: any) => String(capabilityBySlug.get(String(slug).toLowerCase())?._id || ""))
    .filter(Boolean);
  const providedFunctionIds = Array.isArray(interestsQuery.data?.providedFunctionIds)
    ? interestsQuery.data.providedFunctionIds.map(String)
    : idsFromSlugs(interestsQuery.data?.providedCapabilities || (company as any)?.providedCapabilities);
  const soughtFunctionIds = Array.isArray(interestsQuery.data?.soughtFunctionIds)
    ? interestsQuery.data.soughtFunctionIds.map(String)
    : Array.isArray(interestsQuery.data?.approvedCompanyFunctionIds)
      ? interestsQuery.data.approvedCompanyFunctionIds.map(String)
      : idsFromSlugs(interestsQuery.data?.soughtCapabilities || (company as any)?.soughtCapabilities);
  const providedPriorityIds = Array.isArray(interestsQuery.data?.providedFunctionPriorities)
    ? interestsQuery.data.providedFunctionPriorities.map(String)
    : [];
  const soughtPriorityIds = Array.isArray(interestsQuery.data?.soughtFunctionPriorities)
    ? interestsQuery.data.soughtFunctionPriorities.map(String)
    : Array.isArray(interestsQuery.data?.approvedCompanyFunctionPriorities)
      ? interestsQuery.data.approvedCompanyFunctionPriorities.map(String)
      : [];
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
    if (isAssociate) return;
    router.replace("/dashboard/companies");
  }, [isAssociate, router]);



  const pendingBannerRequestedInterests = useMemo(() => {
    if (latestPendingLikeReport && ((latestPendingLikeReport?.payload?.requestedProvidedFunctionIds?.length || 0) > 0 || (latestPendingLikeReport?.payload?.requestedSoughtFunctionIds?.length || 0) > 0)) {
      return [...(latestPendingLikeReport.payload.requestedProvidedFunctionIds || []), ...(latestPendingLikeReport.payload.requestedSoughtFunctionIds || [])]
        .map((value: any) => String(value || ""));
    }
    if (latestPendingLikeReport && Array.isArray(latestPendingLikeReport?.payload?.requestedCompanyFunctionIds)) {
      return latestPendingLikeReport.payload.requestedCompanyFunctionIds.map((value: any) => String(value || ""));
    }
    if (latestPendingLikeReport && Array.isArray(latestPendingLikeReport?.payload?.requestedInterests)) {
      return latestPendingLikeReport.payload.requestedInterests.map((value: any) => String(value || ""));
    }
    if (recentInterestSubmission?.requestedInterests?.length) {
      return recentInterestSubmission.requestedInterests.map((value) => String(value || "").toUpperCase());
    }
    return [];
  }, [latestPendingLikeReport, recentInterestSubmission]);

  const pendingBannerCreatedAt = latestPendingLikeReport?.createdAt || recentInterestSubmission?.createdAt || null;

  const supervisorId = String(company?.supervisor?._id || company?.supervisor || "");
  const isSupervisor = Boolean(user?.id && supervisorId && user?.id === supervisorId);
  const stats = companyStatsQuery.data?.meta || {};
  const teamPerformance = Array.isArray(companyStatsQuery.data?.team) ? companyStatsQuery.data.team : [];
  const enquiryCount = teamPerformance.reduce((sum: number, item: any) => sum + Number(item?.performance?.enquiriesHandled || 0), 0);
  const completedOrderCount = teamPerformance.reduce((sum: number, item: any) => sum + Number(item?.performance?.ordersCompleted || 0), 0);
  const profileChecks = [
    { label: "Company identity", complete: Boolean(company?.name) },
    { label: "Contact details", complete: Boolean(company?.email && company?.phone) },
    { label: "Location", complete: Boolean(company?.address || company?.location?.label) },
    { label: "Company story", complete: Boolean(company?.description || company?.aboutUs) },
    { label: "Brand assets", complete: Boolean(company?.logo || company?.banner) },
    { label: "Website", complete: Boolean(company?.website || previewUrl) },
    { label: "Capabilities", complete: providedFunctionIds.length > 0 && soughtFunctionIds.length > 0 },
    { label: "Team", complete: members.length > 0 },
  ];
  const profileCompleteness = Math.round((profileChecks.filter((item) => item.complete).length / profileChecks.length) * 100);
  const openCapabilityEditor = () => {
    setRequestedProvidedIds(providedFunctionIds);
    setRequestedSoughtIds(soughtFunctionIds);
    setRequestedProvidedPriorities(reconcileCompanyFunctionPriorities(providedFunctionIds, providedPriorityIds));
    setRequestedSoughtPriorities(reconcileCompanyFunctionPriorities(soughtFunctionIds, soughtPriorityIds));
    setInterestNote("");
    setIsInterestModalOpen(true);
  };
  const toggleRequestedFunction = (kind: "provided" | "sought", id: string) => {
    const setIds = kind === "provided" ? setRequestedProvidedIds : setRequestedSoughtIds;
    const setPriorities = kind === "provided" ? setRequestedProvidedPriorities : setRequestedSoughtPriorities;
    setIds((current) => {
      if (current.includes(id)) {
        const next = current.filter((item) => item !== id);
        setPriorities((priorities) => reconcileCompanyFunctionPriorities(next, priorities));
        return next;
      }
      if (current.length >= 6) return current;
      const next = [...current, id];
      setPriorities((priorities) => reconcileCompanyFunctionPriorities(next, priorities));
      return next;
    });
  };
  const moveRequestedPriority = (kind: "provided" | "sought", id: string, direction: -1 | 1) => {
    const setPriorities = kind === "provided" ? setRequestedProvidedPriorities : setRequestedSoughtPriorities;
    setPriorities((current) => {
      const index = current.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const renderApprovedProfile = (title: string, ids: string[], priorities: string[]) => (
    <div>
      <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-default-500">{title}</h3>
      {ids.length ? <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[...ids].sort((a, b) => {
          const ai = priorities.indexOf(a); const bi = priorities.indexOf(b);
          return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
        }).map((id) => {
          const capability = capabilityById.get(id);
          const priority = priorities.indexOf(id);
          return <div key={`${title}-${id}`} className="rounded-xl border border-default-200 bg-default-50/50 p-3"><div className="flex items-start justify-between gap-2"><p className="text-sm font-bold">{capability?.name || "Company category"}</p>{priority >= 0 ? <Chip size="sm" color="warning" variant="flat">P{priority + 1}</Chip> : null}</div><p className="mt-1 text-xs text-default-500">{capability?.description || "Company capability"}</p></div>;
        })}
      </div> : <p className="text-sm text-default-500">No categories configured.</p>}
    </div>
  );
  const renderRequestedProfile = (kind: "provided" | "sought") => {
    const ids = kind === "provided" ? requestedProvidedIds : requestedSoughtIds;
    const priorities = kind === "provided" ? requestedProvidedPriorities : requestedSoughtPriorities;
    return <section className="rounded-2xl border border-default-200 p-4">
      <h3 className="text-xs font-black uppercase tracking-widest">What your company {kind === "provided" ? "provides" : "is seeking"}</h3>
      <p className="mt-1 text-xs text-default-500">Select 1–6 categories. Your first three selections become priorities automatically.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {capabilityOptions.map((capability: any) => {
          const id = String(capability?._id || "");
          const selected = ids.includes(id);
          const priority = priorities.indexOf(id);
          const disabled = !selected && ids.length >= 6;
          return <button key={`${kind}-${id}`} type="button" disabled={disabled} aria-pressed={selected} onClick={() => toggleRequestedFunction(kind, id)} className={`min-h-16 touch-manipulation rounded-xl border p-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:p-3 ${selected ? "border-primary-500 bg-primary-500/10" : disabled ? "cursor-not-allowed border-default-100 opacity-40" : "border-default-200 hover:border-primary-500/50"}`}>
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold leading-tight">{capability?.name}</span>{priority >= 0 ? <Chip size="sm" color="primary" variant="flat">P{priority + 1}</Chip> : null}</div>
            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-default-500">
              {getCompanyFunctionPerspectiveDescription(capability?.slug, kind, capability?.description)}
            </p>
          </button>;
        })}
      </div>
      <div className="mt-4 rounded-xl bg-default-50/50 p-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-default-400">Top priorities</p>{priorities.length ? <div className="mt-2 space-y-2">{priorities.map((id, index) => <div key={`${kind}-${id}`} className="flex items-center justify-between rounded-lg bg-content1 px-3 py-2"><span className="text-sm font-semibold"><b className="mr-2 text-primary-600">P{index + 1}</b>{capabilityById.get(id)?.name || "Selected category"}</span><div className="flex gap-1"><Button isIconOnly size="sm" variant="light" isDisabled={index === 0} onPress={() => moveRequestedPriority(kind, id, -1)} aria-label="Move priority up"><LuChevronUp /></Button><Button isIconOnly size="sm" variant="light" isDisabled={index === priorities.length - 1} onPress={() => moveRequestedPriority(kind, id, 1)} aria-label="Move priority down"><LuChevronDown /></Button></div></div>)}</div> : <p className="mt-2 text-xs text-default-500">Select a category to create the priority order.</p>}</div>
    </section>;
  };
  const operatorAssignedCompanies = useMemo(
    () => (Array.isArray(operatorAssignedCompaniesQuery.data) ? operatorAssignedCompaniesQuery.data : []),
    [operatorAssignedCompaniesQuery.data]
  );
  const operatorAssociates = useMemo(
    () => (Array.isArray(operatorAssociatesQuery.data) ? operatorAssociatesQuery.data : []),
    [operatorAssociatesQuery.data]
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
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic underline decoration-primary-500/30">Operator <span className="text-primary-500">Workspace</span></h1>
               <p className="text-xs text-default-500 font-medium tracking-wider uppercase opacity-60">Manage assigned identities and onboard new associates & companies</p>
             </div>
             <Button 
               color="primary" 
               radius="full"
               className="font-black uppercase text-[11px] tracking-widest px-8 h-11 bg-primary-600 shadow-xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all text-white italic"
               onPress={() => setIsOnboardModalOpen(true)}
             >
               Onboard Associate + Company
             </Button>
          </div>

          <OnboardingModal 
            isOpen={isOnboardModalOpen} 
            onOpenChange={setIsOnboardModalOpen}
          />

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="rounded-2xl border border-divider/50 bg-[#0E0D0A]/50 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group/list">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] -z-10 group-hover/list:bg-primary-500/10 transition-all duration-1000" />
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1.5 h-8 bg-primary-500 rounded-full shadow-[0_0_15px_rgba(0,111,238,0.5)]" />
                <div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">Assigned <span className="text-primary-500">Entities</span></h2>
                  <p className="text-[10px] text-default-500 font-bold tracking-widest uppercase">Currently authorized under your operator protocol</p>
                </div>
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
              <div className="rounded-lg border border-obaol-200 bg-obaol-50 px-4 py-3 text-sm text-obaol-800 dark:border-obaol-400/30 dark:bg-obaol-500/10 dark:text-obaol-100">
                No companies are assigned yet. Use the onboarding form above to create one.
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
                          {item?.providedCapabilities?.length ? `${item.providedCapabilities.length} capabilities` : "Not configured"}
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

          <div className="rounded-xl border border-default-200/70 bg-content1/70 p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground">Company Associates</h2>
              <p className="text-sm text-default-600">
                Associates linked to companies assigned to your operator account.
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
          </div>
        </div>
      )}

      {isAssociate && (
        <>
      <section className="relative overflow-hidden rounded-[2rem] border border-default-200 bg-content1 p-5 shadow-sm md:p-8">
        {company?.banner ? <div className="absolute inset-x-0 top-0 h-28 bg-cover bg-center opacity-15" style={{ backgroundImage: `url(${company.banner})` }} /> : null}
        {companyQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="relative space-y-6">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-default-200 bg-default-100 text-xl font-black text-obaol-600">
                  {company?.logo ? <div role="img" aria-label={`${company?.name || "Company"} logo`} className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${company.logo})` }} /> : String(company?.name || "C").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">{company?.name || "My Company"}</h1>
                    <Chip color={String(company?.registrationStatus || "").toUpperCase() === "APPROVED" ? "success" : "warning"} variant="flat" size="sm">
                      {String(company?.registrationStatus || "PENDING_REVIEW").replace(/_/g, " ")}
                    </Chip>
                    {isSupervisor ? <Chip color="warning" variant="flat" size="sm">Supervisor</Chip> : null}
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-default-500">{company?.description || company?.aboutUs || "Add a company description to help your team and trading partners understand the business."}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-default-500">
                    <span className="inline-flex items-center gap-1.5"><LuMail />{company?.email || "Email not added"}</span>
                    <span className="inline-flex items-center gap-1.5"><LuPhone />{company?.phone || "Phone not added"}</span>
                    <span className="inline-flex items-center gap-1.5"><LuMapPin />{company?.address || company?.location?.label || "Location not added"}</span>
                    <span className="inline-flex items-center gap-1.5"><LuBuilding />Verified company profile</span>
                    <span>Joined {formatDate(company?.createdAt)}</span>
                    <span>Supervisor: {company?.supervisor?.name || (isSupervisor ? user?.name : "Not assigned")}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {previewUrl ? <Button color="warning" variant="flat" endContent={<LuArrowUpRight />} onPress={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}>{isWebsiteLive ? "View Website" : "Preview Website"}</Button> : null}
                <Button variant="flat" onPress={() => router.push("/dashboard/settings")}>Company Settings</Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Profile complete", value: `${profileCompleteness}%`, icon: <LuCheck /> },
          { label: "Company members", value: String(members.length || stats.associateCount || 0), icon: <LuUsers /> },
          { label: "Live listings", value: String(stats.liveProductCount || 0), icon: <LuPackage /> },
          { label: "Enquiries handled", value: String(enquiryCount), icon: <LuActivity /> },
          { label: "Orders completed", value: String(completedOrderCount), icon: <LuLayoutDashboard /> },
          { label: "Pending requests", value: String(interestStatusSummary.pending + interestStatusSummary.underReview), icon: <LuClipboardList /> },
        ].map((item) => <CompanyMetricCard key={item.label} {...item} />)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <CompanyProfileReadiness percentage={profileCompleteness} checks={profileChecks} />
        <div className="rounded-2xl border border-default-200 bg-content1 p-5 md:p-6"><h2 className="text-lg font-bold">Quick actions</h2><p className="mb-4 text-sm text-default-500">Continue common company tasks.</p><div className="grid gap-2">{[
          ["Open commodity directory", "/dashboard/catalog", <LuGlobe key="globe" />], ["Manage trade listings", "/dashboard/product", <LuPackage key="package" />], ["Account settings", "/dashboard/settings", <LuBuilding key="building" />], ["Customer support", "/dashboard/customer-support", <LuUser key="user" />],
        ].map(([label, href, icon]: any) => <Button key={href} variant="flat" className="justify-start" startContent={icon} endContent={<LuArrowUpRight className="ml-auto" />} onPress={() => router.push(href)}>{label}</Button>)}</div></div>
      </section>

      <div className="rounded-xl border border-default-200 bg-content1 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Company Capabilities</h2>
            <p className="text-sm text-default-600">
              Approved onboarding categories shape the company workspace. Priority capabilities appear first.
            </p>
            {interestsQuery.data?.updatedAt ? <p className="mt-1 text-xs text-default-400">Last updated {formatDate(interestsQuery.data.updatedAt)}</p> : null}
          </div>
          <Button color="primary" variant="flat" isDisabled={Boolean(latestPendingLikeReport)} onPress={openCapabilityEditor}>
            {latestPendingLikeReport ? "Request Pending" : "Change Capabilities"}
          </Button>
        </div>
        <div className="mb-3">
          <Chip size="sm" color={providedFunctionIds.length && soughtFunctionIds.length ? "success" : "warning"} variant="flat">
            {providedFunctionIds.length && soughtFunctionIds.length ? "Configured" : "Not Configured"}
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
          <div className="mb-4 rounded-lg border border-obaol-200 bg-obaol-50 px-3 py-2 dark:border-obaol-400/30 dark:bg-obaol-400/10">
            <div className="text-sm font-medium text-obaol-800 dark:text-obaol-200">
              {latestPendingLikeReport ? "Request sent and pending admin approval." : "Submitting request (syncing status...)"} 
            </div>
            <div className="mt-1 text-xs text-obaol-700/90 dark:text-obaol-200/90">
              Another request cannot be submitted until this request is reviewed.
            </div>
            <div className="mt-1 text-xs text-obaol-700/90 dark:text-obaol-200/90">
              Approval is completed by Admin from Dashboard &gt; Reports.
            </div>
            <div className="mt-1 text-xs text-obaol-700/90 dark:text-obaol-200/90">
              Categories requested:
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {pendingBannerRequestedInterests.map((interest) => (
                <Chip key={`pending-interest-${interest}`} size="sm" color="warning" variant="flat">
                  {capabilityById.get(interest)?.name || String(interest).replace(/[_-]/g, " ")}
                </Chip>
              ))}
            </div>
            <div className="mt-2 text-xs text-obaol-700/90 dark:text-obaol-200/90">
              Submitted: {formatDate(pendingBannerCreatedAt)}
            </div>
          </div>
        )}
        <div className="grid gap-6 xl:grid-cols-2">
          {renderApprovedProfile("What your company provides", providedFunctionIds, providedPriorityIds)}
          {renderApprovedProfile("What your company is seeking", soughtFunctionIds, soughtPriorityIds)}
        </div>
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
        ) : membersQuery.isError ? (
          <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700">Company members could not be loaded. Refresh the page to try again.</div>
        ) : members.length === 0 ? (
          <div className="py-6 text-default-500">No members found in your company.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-default-100/70">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Name</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Designation</th>
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
                      <td className="px-3 py-2"><div className="flex items-center gap-2"><span>{member?.name || "-"}</span>{String(member?._id || "") === supervisorId ? <Chip size="sm" color="warning" variant="flat">Supervisor</Chip> : null}</div></td>
                      <td className="px-3 py-2 text-default-600">{member?.designationName || member?.designation?.name || "Associate"}</td>
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
          <h2 className="text-xl font-semibold text-foreground">Capability Request Tracking</h2>
          <p className="text-sm text-default-600">See what was requested, who submitted it, and the admin decision.</p>
        </div>
        {reportsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : interestReports.length === 0 ? (
          <div className="py-6 text-default-500">No capability update requests submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-default-100/70">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Requested Categories</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Submitted By</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Status</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Admin Notes</th>
                  <th className="text-left px-3 py-2 font-semibold text-default-700">Timeline</th>
                </tr>
              </thead>
              <tbody>
                {interestReports.map((report: any, idx: number) => (
                  <tr
                    key={report?._id || idx}
                    className={`border-t border-default-200/70 ${idx % 2 ? "bg-default-50/30 dark:bg-default-100/5" : ""}`}
                  >
                    <td className="px-3 py-2">
                      {(report?.payload?.requestedProvidedFunctionIds?.length || 0) > 0 || (report?.payload?.requestedSoughtFunctionIds?.length || 0) > 0 ? (
                        <div className="space-y-2">
                          {(["provided", "sought"] as const).map((kind) => {
                            const ids = report?.payload?.[kind === "provided" ? "requestedProvidedFunctionIds" : "requestedSoughtFunctionIds"] || [];
                            const priorities = (report?.payload?.[kind === "provided" ? "requestedProvidedFunctionPriorities" : "requestedSoughtFunctionPriorities"] || []).map(String);
                            return <div key={`${report?._id}-${kind}`}><span className="mr-2 text-[10px] font-black uppercase text-default-400">{kind}</span><span className="inline-flex flex-wrap gap-1">{ids.map((id: string) => { const priority = priorities.indexOf(String(id)); return <Chip key={`${report?._id}-${kind}-${id}`} size="sm" color={priority >= 0 ? "warning" : "primary"} variant="flat">{capabilityById.get(String(id))?.name || "Company category"}{priority >= 0 ? ` · P${priority + 1}` : ""}</Chip>; })}</span></div>;
                          })}
                        </div>
                      ) : <div className="flex flex-wrap gap-1">
                        {Array.isArray(report?.payload?.requestedCompanyFunctionIds) && report.payload.requestedCompanyFunctionIds.length > 0
                          ? report.payload.requestedCompanyFunctionIds.map((id: string) => {
                              const priority = (report?.payload?.requestedCompanyFunctionPriorities || []).map(String).indexOf(String(id));
                              return <Chip key={`${report?._id}-${id}`} size="sm" color={priority >= 0 ? "warning" : "primary"} variant="flat">{capabilityById.get(String(id))?.name || "Company category"}{priority >= 0 ? ` · P${priority + 1}` : ""}</Chip>;
                            })
                          : Array.isArray(report?.payload?.requestedInterests) && report.payload.requestedInterests.length > 0
                            ? report.payload.requestedInterests.map((interest: string) => <Chip key={`${report?._id}-${interest}`} size="sm" color="default" variant="flat">{String(interest || "").replace(/_/g, " ")}</Chip>)
                          : "-"}
                      </div>}
                    </td>
                    <td className="px-3 py-2 text-default-600">{report?.reporterAssociateId?.name || "Company member"}</td>
                    <td className="px-3 py-2">
                      <Chip size="sm" variant="flat" color={statusColor(report?.status) as any}>
                        {report?.status || "PENDING_REVIEW"}
                      </Chip>
                    </td>
                    <td className="px-3 py-2 text-default-600">{report?.adminNotes || "-"}</td>
                    <td className="px-3 py-2 text-default-600"><div>Submitted {formatDate(report?.createdAt)}</div>{report?.reviewedAt ? <div className="mt-1 text-xs">Reviewed {formatDate(report.reviewedAt)}{report?.reviewedBy?.name ? ` by ${report.reviewedBy.name}` : ""}</div> : null}</td>
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
            setRequestedProvidedIds([]);
            setRequestedSoughtIds([]);
            setRequestedProvidedPriorities([]);
            setRequestedSoughtPriorities([]);
            setInterestNote("");
          }
        }}
        isDismissable={false}
        isKeyboardDismissDisabled
      >
        <ModalContent className="max-w-3xl">
          <ModalHeader className="flex flex-col items-start gap-1"><span>Change Company Capabilities</span><span className="text-xs font-normal text-default-500">Maintain separate provided and sought profiles. Changes require admin approval.</span></ModalHeader>
          <ModalBody className="max-h-[70vh] overflow-y-auto">
            {registerOptionsQuery.isLoading ? <div className="flex justify-center py-10"><Spinner /></div> : registerOptionsQuery.isError ? <div className="rounded-xl bg-danger-50 p-4 text-sm text-danger-700">Capability options could not be loaded. Try again.</div> : <div className="space-y-4">{renderRequestedProfile("provided")}{renderRequestedProfile("sought")}</div>}
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
              isDisabled={requestedProvidedIds.length === 0 || requestedSoughtIds.length === 0 || Boolean(latestPendingLikeReport)}
              onPress={() => interestRequestMutation.mutate()}
            >
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
        </>
      )}

    </div>
  );
}
