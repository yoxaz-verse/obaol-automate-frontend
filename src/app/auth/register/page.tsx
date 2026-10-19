import { redirect } from "next/navigation";

type PageProps = { searchParams?: { prefill?: string | string[]; intent?: string | string[] } };

const firstValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function RegisterPage({ searchParams }: PageProps) {
  const params = new URLSearchParams({ mode: "signup" });
  const prefill = firstValue(searchParams?.prefill);
  const intent = firstValue(searchParams?.intent);
  if (prefill) params.set("prefill", prefill);
  if (intent) params.set("intent", intent);
  redirect(`/auth?${params.toString()}`);
}
