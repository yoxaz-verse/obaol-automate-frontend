import UnifiedAuthFlow from "@/components/Auth/UnifiedAuthFlow";

export default function AuthEntryPage({
  searchParams,
}: {
  searchParams?: { mode?: string; role?: string; view?: string; prefill?: string; intent?: string };
}) {
  const initialMode = searchParams?.mode === "signup" ? "signup" : "signin";
  const initialRole = searchParams?.role === "operator" ? "Operator" : "Associate";
  return <UnifiedAuthFlow initialMode={initialMode} initialRole={initialRole} prefill={searchParams?.prefill} intent={searchParams?.intent} />;
}
