import LoginComponent from "@/components/Login/login-component";
import "react-toastify/dist/ReactToastify.css";

type PageProps = { searchParams?: { prefill?: string | string[]; intent?: string | string[]; reason?: string | string[] } };

const firstValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export default function OperatorLoginPage({ searchParams }: PageProps) {
  return <LoginComponent role="Operator" mode="login" initialQuery={{ prefill: firstValue(searchParams?.prefill), intent: firstValue(searchParams?.intent), reason: firstValue(searchParams?.reason) }} />;
}
