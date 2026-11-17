import { notFound } from "next/navigation";
import PackagingUnitEditor, { PackagingStep } from "@/components/packaging/PackagingUnitEditor";
const valid = new Set(["details", "location", "capabilities", "review"]);
export default function PackagingUnitStepPage({ params }: { params: { step: string } }) { if (!valid.has(params.step)) notFound(); return <PackagingUnitEditor step={params.step as PackagingStep} />; }
