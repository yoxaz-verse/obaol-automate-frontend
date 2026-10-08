import LoginComponent from "@/components/Login/login-component";
import "react-toastify/dist/ReactToastify.css";

type PageProps = { searchParams?: { prefill?: string | string[]; intent?: string | string[] } };

const firstValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function SuperadminLoginPage({ searchParams }: PageProps) {
  return <LoginComponent role="Admin" initialQuery={{ prefill: firstValue(searchParams?.prefill), intent: firstValue(searchParams?.intent) }} />;
}
