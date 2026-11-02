"use client";

import { useContext, useState } from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiEdit3, FiMail, FiMapPin, FiPhone, FiPlus } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import AuthContext from "@/context/AuthContext";
import CompanySearch from "@/components/dashboard/Company/CompanySearch";
import { AppButton } from "@/components/ui/AppButton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
import { getData, postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import { optionName } from "@/types/labProfile";
import { showToastMessage } from "@/utils/utils";

const statusColor = (status: string) => status === "PUBLISHED" ? "success" : status === "REJECTED" ? "danger" : status === "PENDING_REVIEW" ? "warning" : "default";

export default function MyLabPage() {
  const router = useRouter();
  const client = useQueryClient();
  const { user } = useContext(AuthContext);
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const [companyId, setCompanyId] = useState("");
  const params = isAdmin && companyId ? { companyId } : {};
  const query = useQuery({ queryKey: ["my-labs", companyId], queryFn: async () => (await getData(apiRoutes.labProfiles.mine, params)).data.data || [], enabled: !isAdmin || Boolean(companyId), retry: false });
  const lifecycle = useMutation({ mutationFn: ({ row, action }: any) => postData(action === "archive" ? apiRoutes.labProfiles.mineArchive(row._id) : apiRoutes.labProfiles.mineRestore(row._id), { expectedRevision: row.revision, ...params }), onSuccess: () => { client.invalidateQueries({ queryKey: ["my-labs"] }); showToastMessage({ type: "success", message: "Laboratory status updated." }); }, onError: (error: any) => showToastMessage({ type: "error", message: error?.response?.data?.message || "Unable to update this laboratory." }) });
  const addLabUrl = `/dashboard/quality-labs/location${companyId ? `?companyId=${companyId}` : ""}`;
  const rows: any[] = query.data || [];

  return <section className="min-h-screen bg-background p-4 text-foreground md:p-8"><div className="mx-auto max-w-[1500px] space-y-6 pb-16">
    <PageHeader variant="plain" eyebrowTone="brand" eyebrow="Quality testing" title="My Labs" description="Create and manage your laboratory profiles, testing capabilities, publication status, and contact activity." actions={<AppButton intent="primary" startContent={<FiPlus />} isDisabled={isAdmin && !companyId} onPress={() => router.push(addLabUrl)}>Add Lab</AppButton>} />
    {isAdmin ? <Card><CardBody><p className="mb-2 text-sm font-bold">Manage an associate company</p><CompanySearch onSelect={(value) => setCompanyId(value || "")} /></CardBody></Card> : null}
    {!query.isEnabled ? <EmptyState title="Select a company" message="Choose an associate company to view and manage its laboratory profiles." /> : query.isLoading ? <LoadingState title="Loading your labs" message="Retrieving laboratory profiles and contact activity." /> : query.isError ? <ErrorState title="Unable to load laboratory profiles" onRetry={() => query.refetch()} /> : !rows.length ? <EmptyState title="No labs added yet" message="Add your first laboratory profile with its location, credentials, testing capabilities, and country coverage." action={<AppButton intent="primary" startContent={<FiPlus />} onPress={() => router.push(addLabUrl)}>Add Lab</AppButton>} /> : <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-3">{rows.map((row) => { const profile = row.draft || row.published || {}; const metrics = row.contactMetrics || {}; const locationLabel = profile.location?.label || [optionName(profile.city), optionName(profile.state), optionName(profile.physicalCountryId)].filter(Boolean).join(", ") || profile.address || "Location not added"; const editUrl = `/dashboard/quality-labs/my/${row._id}${companyId ? `?companyId=${companyId}` : ""}`; return <Card key={row._id} className="h-full border border-default-200 shadow-sm"><CardBody className="flex h-full gap-5 p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-xl font-black">{profile.displayName || "Untitled lab"}</h2><p className="mt-1 flex items-start gap-2 text-sm text-default-500"><FiMapPin className="mt-0.5 shrink-0" /><span>{locationLabel}</span></p></div><Chip className="shrink-0" color={statusColor(row.status) as any} variant="flat" size="sm">{String(row.status || "DRAFT").replaceAll("_", " ")}</Chip></div><p className="text-sm leading-6 text-default-500">{profile.productCapabilityTemplates?.length || 0} capabilities · {profile.countryAssignments?.length || 0} export countries · Updated {new Date(row.updatedAt).toLocaleString()}</p><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-default-500">Contact activity</p><div className="grid grid-cols-3 gap-2"><div className="rounded-xl bg-default-100 p-3"><FiPhone /><b className="mt-1 block text-xl">{metrics.PHONE || 0}</b><span className="text-xs text-default-500">Phone</span></div><div className="rounded-xl bg-default-100 p-3"><FaWhatsapp /><b className="mt-1 block text-xl">{metrics.WHATSAPP || 0}</b><span className="text-xs text-default-500">WhatsApp</span></div><div className="rounded-xl bg-default-100 p-3"><FiMail /><b className="mt-1 block text-xl">{metrics.EMAIL || 0}</b><span className="text-xs text-default-500">Email</span></div></div></div><div className="mt-auto flex flex-wrap items-center gap-2 border-t border-default-200 pt-4"><AppButton intent="primary" size="sm" startContent={<FiEdit3 />} isDisabled={row.status === "ARCHIVED"} onPress={() => router.push(editUrl)}>View / Edit</AppButton><AppButton intent={row.status === "ARCHIVED" ? "secondary" : "tertiary"} size="sm" color={row.status === "ARCHIVED" ? "success" : "danger"} isLoading={lifecycle.isPending} onPress={() => { if (row.status === "ARCHIVED" || window.confirm("Archive and unpublish this laboratory?")) lifecycle.mutate({ row, action: row.status === "ARCHIVED" ? "restore" : "archive" }); }}>{row.status === "ARCHIVED" ? "Restore" : "Archive"}</AppButton></div></CardBody></Card>; })}</div>}
  </div></section>;
}
