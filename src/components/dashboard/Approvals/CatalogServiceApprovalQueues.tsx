"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Tab, Tabs } from "@nextui-org/react";
import CatalogApprovalQueues from "./CatalogApprovalQueues";
import { getData, patchData } from "@/core/api/apiHandler";
import { packagingRoutes } from "@/core/api/apiRoutes";
import { showToastMessage } from "@/utils/utils";

export default function CatalogServiceApprovalQueues() {
  const [section, setSection] = useState("catalog");
  const client = useQueryClient();
  const packaging = useQuery({ queryKey: ["packaging-approvals"], queryFn: async () => (await getData(packagingRoutes.approvals)).data.data || [] });
  const review = useMutation({ mutationFn: ({ id, action }: any) => patchData(packagingRoutes.reviewProfile(id), { action }), onSuccess: () => { client.invalidateQueries({ queryKey: ["packaging-approvals"] }); showToastMessage({ type: "success", message: "Service profile reviewed." }); } });
  return <section className="space-y-5"><Tabs selectedKey={section} onSelectionChange={(key) => setSection(String(key))} color="warning" variant="underlined"><Tab key="catalog" title="Catalog entries" /><Tab key="profiles" title={`Service profiles (${packaging.data?.length || 0})`} /></Tabs>{section === "catalog" ? <CatalogApprovalQueues /> : <div className="grid gap-4">{packaging.isLoading ? <p className="p-8 text-center text-default-500">Loading service profiles…</p> : !packaging.data?.length ? <p className="rounded-2xl border border-dashed border-default-300 p-10 text-center text-default-500">No service profiles are awaiting review.</p> : packaging.data.map((profile: any) => <Card key={profile._id} className="border border-default-200"><CardBody className="gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2"><h2 className="text-lg font-bold">{profile.draft?.displayName || profile.companyId?.name || "Service profile"}</h2><Chip size="sm" color="warning" variant="flat">Pending review</Chip></div><p className="mt-1 text-sm text-default-500">{profile.draft?.capabilities?.length || 0} capabilities · {profile.draft?.credentials?.length || 0} credentials</p></div><div className="flex gap-2"><Button color="danger" variant="flat" onPress={() => review.mutate({ id: profile._id, action: "REJECT" })}>Reject</Button><Button color="success" onPress={() => review.mutate({ id: profile._id, action: "APPROVE" })}>Approve</Button></div></CardBody></Card>)}</div>}</section>;
}
