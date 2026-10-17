"use client";

import { useContext } from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import AuthContext from "@/context/AuthContext";
import { getData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";
import LabProfileWizard from "../location/page";

const statusColor = (status: string) => status === "PUBLISHED" ? "success" : status === "REJECTED" ? "danger" : status === "PENDING_REVIEW" ? "warning" : "default";

export default function MyLabPage() {
  const { user } = useContext(AuthContext);
  const isAssociate = String(user?.role || "").toLowerCase() === "associate";
  const query = useQuery({ queryKey: ["lab-profile-draft", "my-lab-summary"], queryFn: async () => (await getData(apiRoutes.labProfiles.draft)).data.data, enabled: isAssociate, retry: false });
  const status = String(query.data?.status || "DRAFT").toUpperCase();
  return <div className="space-y-5">
    <Card className="border border-default-200"><CardBody className="flex-row items-center justify-between gap-4 p-5"><div><p className="text-[10px] font-black uppercase tracking-[.25em] text-success-500">Providing · Quality testing</p><h1 className="mt-1 text-2xl font-black">My Lab</h1><p className="mt-1 text-sm text-default-500">Manage the profile, credentials, testing capabilities, and market coverage published for your company.</p></div>{isAssociate ? <Chip color={statusColor(status) as any} variant="flat">{status.replaceAll("_", " ")}</Chip> : null}</CardBody></Card>
    <LabProfileWizard />
  </div>;
}
