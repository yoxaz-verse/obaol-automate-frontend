import { redirect } from "next/navigation";

// Legacy Compliance Gateway now lives in the unified Documentation workspace.
// Access remains available when roleLower === "associate" and when
// roleLower === "admin" || roleLower === "operator" || roleLower === "team".
export default function LegacyDocumentsPage() { redirect("/dashboard/documentation"); }
