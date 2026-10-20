"use client";

import { useContext, useState } from "react";
import { Button, Card, CardBody, Chip, Spinner } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiEdit3, FiMail, FiMapPin, FiPhone, FiPlus } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import AuthContext from "@/context/AuthContext";
import CompanySearch from "@/components/dashboard/Company/CompanySearch";
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
  const addUrl = `/dashboard/quality-labs/my/new${companyId ? `?companyId=${companyId}` : ""}`;
  const rows: any[] = query.data || [];

  return <section className="space-y-6 pb-16">
    <Card className="border border-default-200"><CardBody className="gap-5 p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.25em] text-success-500">Providing · Quality testing</p><h1 className="mt-1 text-3xl font-black">My Labs</h1><p className="mt-1 text-sm text-default-500">Manage laboratory locations, publication status, capabilities, and private contact interest.</p></div><Button color="success" startContent={<FiPlus />} isDisabled={isAdmin && !companyId} onPress={() => router.push(addUrl)}>Add Laboratory</Button></CardBody></Card>
    {isAdmin ? <Card><CardBody><p className="mb-2 text-sm font-bold">Manage an associate company</p><CompanySearch onSelect={(value) => setCompanyId(value || "")} /></CardBody></Card> : null}
    {!query.isEnabled ? <Card><CardBody className="items-center py-14 text-center"><h2 className="font-bold">Select a company</h2><p className="text-sm text-default-500">Choose an associate company to view its laboratory listings.</p></CardBody></Card> : query.isLoading ? <div className="flex justify-center py-20"><Spinner color="success" /></div> : query.isError ? <Card><CardBody className="items-center gap-3 py-14 text-center"><p className="text-danger">Unable to load laboratory listings.</p><Button variant="flat" onPress={() => query.refetch()}>Try again</Button></CardBody></Card> : !rows.length ? <Card className="border border-dashed border-default-300"><CardBody className="items-center gap-3 py-16 text-center"><h2 className="text-xl font-black">No labs added yet</h2><p className="max-w-lg text-sm text-default-500">Add the first laboratory location, its credentials, testing capabilities, and country coverage.</p><Button color="success" startContent={<FiPlus />} onPress={() => router.push(addUrl)}>Add Laboratory</Button></CardBody></Card> : <div className="grid gap-4 lg:grid-cols-2">{rows.map((row) => { const profile = row.draft || row.published || {}; const metrics = row.contactMetrics || {}; const editUrl = `/dashboard/quality-labs/my/${row._id}${companyId ? `?companyId=${companyId}` : ""}`; return <Card key={row._id} className="border border-default-200"><CardBody className="gap-5 p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black">{profile.displayName || "Untitled lab"}</h2><p className="mt-1 flex items-center gap-2 text-sm text-default-500"><FiMapPin />{[optionName(profile.city), optionName(profile.state), optionName(profile.physicalCountryId)].filter(Boolean).join(", ") || profile.address || "Location not added"}</p></div><Chip color={statusColor(row.status) as any} variant="flat">{String(row.status || "DRAFT").replaceAll("_", " ")}</Chip></div><p className="text-sm text-default-500">{profile.productCapabilityTemplates?.length || 0} capabilities · {profile.countryAssignments?.length || 0} export countries · Updated {new Date(row.updatedAt).toLocaleString()}</p><div><p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-default-400">Unique contact interest</p><div className="grid grid-cols-3 gap-2"><div className="rounded-xl bg-default-100 p-3"><FiPhone /><b className="mt-1 block text-xl">{metrics.PHONE || 0}</b><span className="text-xs text-default-500">Phone</span></div><div className="rounded-xl bg-default-100 p-3"><FaWhatsapp /><b className="mt-1 block text-xl">{metrics.WHATSAPP || 0}</b><span className="text-xs text-default-500">WhatsApp</span></div><div className="rounded-xl bg-default-100 p-3"><FiMail /><b className="mt-1 block text-xl">{metrics.EMAIL || 0}</b><span className="text-xs text-default-500">Email</span></div></div></div><div className="flex flex-wrap gap-2"><Button color="success" variant="flat" startContent={<FiEdit3 />} isDisabled={row.status === "ARCHIVED"} onPress={() => router.push(editUrl)}>View / Edit</Button><Button variant="bordered" color={row.status === "ARCHIVED" ? "success" : "danger"} isLoading={lifecycle.isPending} onPress={() => { if (row.status === "ARCHIVED" || window.confirm("Archive and unpublish this laboratory?")) lifecycle.mutate({ row, action: row.status === "ARCHIVED" ? "restore" : "archive" }); }}>{row.status === "ARCHIVED" ? "Restore" : "Archive"}</Button></div></CardBody></Card>; })}</div>}
  </section>;
}
