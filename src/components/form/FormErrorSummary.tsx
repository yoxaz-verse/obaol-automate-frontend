import type { ApiFieldErrors } from "@/core/api/apiErrors";

export default function FormErrorSummary({ message, fieldErrors = {} }: { message?: string; fieldErrors?: ApiFieldErrors }) {
  const entries = Object.entries(fieldErrors);
  if (!message && entries.length === 0) return null;
  return <div role="alert" className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700"><p className="font-semibold">{message || "Please correct the highlighted fields."}</p>{entries.length > 0 && <ul className="mt-2 list-disc pl-5">{entries.map(([field, detail]) => <li key={field}><span className="font-medium">{field}:</span> {detail}</li>)}</ul>}</div>;
}
