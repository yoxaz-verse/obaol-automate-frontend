"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import LabProfileWizard from "../../location/page";
import { postData } from "@/core/api/apiHandler";
import { apiRoutes } from "@/core/api/apiRoutes";

export default function NewMyLabPage() {
  const search = useSearchParams();
  const router = useRouter();
  const requestedLabId = search.get("labId") || "";
  const companyId = search.get("companyId") || "";
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (requestedLabId || started.current) return;
    started.current = true;
    postData(apiRoutes.labProfiles.mine, companyId ? { companyId } : {}).then((response: any) => {
      const id = response?.data?.data?._id;
      if (!id) throw new Error("The new lab could not be created.");
      router.replace(`/dashboard/quality-labs/my/new?labId=${id}${companyId ? `&companyId=${companyId}` : ""}`);
    }).catch((reason: any) => setError(reason?.response?.data?.message || reason?.message || "Unable to create a lab."));
  }, [companyId, requestedLabId, router]);
  if (!requestedLabId) return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">{error ? <><p className="text-danger">{error}</p><Button onPress={() => router.push("/dashboard/quality-labs/my")}>Back to My Lab</Button></> : <><Spinner color="success" /><p className="text-sm text-default-500">Creating a new lab workspace…</p></>}</div>;
  return <LabProfileWizard labId={requestedLabId} managedCompanyId={companyId} />;
}
