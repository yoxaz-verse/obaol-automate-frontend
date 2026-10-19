"use client";
import { useParams, useSearchParams } from "next/navigation";
import LabProfileWizard from "../../location/page";

export default function EditMyLabPage() {
  const { labId } = useParams<{ labId: string }>();
  const companyId = useSearchParams().get("companyId") || "";
  return <LabProfileWizard labId={labId} managedCompanyId={companyId} />;
}
