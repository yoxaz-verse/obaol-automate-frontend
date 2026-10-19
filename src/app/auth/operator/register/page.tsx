import { redirect } from "next/navigation";

type PageProps = { searchParams?: { prefill?: string | string[]; intent?: string | string[] } };

const firstValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function OperatorRegisterPage({ searchParams }: PageProps) {
  const params = new URLSearchParams({ mode: "signup", role: "operator" });
  const prefill = firstValue(searchParams?.prefill);
  const intent = firstValue(searchParams?.intent);
  if (prefill) params.set("prefill", prefill);
  if (intent) params.set("intent", intent);
  redirect(`/auth?${params.toString()}`);
}
