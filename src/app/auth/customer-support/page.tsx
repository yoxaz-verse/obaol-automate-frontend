import LoginComponent from "@/components/Login/login-component";

type PageProps = { searchParams?: { prefill?: string | string[]; intent?: string | string[] } };
const firstValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function CustomerSupportLoginPage({ searchParams }: PageProps) {
  return <LoginComponent role="CustomerSupport" mode="login" initialQuery={{ prefill: firstValue(searchParams?.prefill), intent: firstValue(searchParams?.intent) }} />;
}
