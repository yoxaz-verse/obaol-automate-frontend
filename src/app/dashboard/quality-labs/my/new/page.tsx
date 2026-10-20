"use client";
import { useSearchParams } from "next/navigation";
import LabProfileWizard from "../../location/page";

export default function NewMyLabPage() {
  const search = useSearchParams();
  const companyId = search.get("companyId") || "";
  return <LabProfileWizard managedCompanyId={companyId} />;
}
