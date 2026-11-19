"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";
import { Button, Chip, Input } from "@nextui-org/react";
import { FiCheckCircle, FiEdit3, FiKey, FiMail, FiShield, FiTrash2, FiUpload } from "react-icons/fi";
import PageHeader from "@/components/ui/PageHeader";
import { DashboardPage, DashboardPanel, DashboardSectionHeader } from "@/components/dashboard/DashboardUI";
import { deleteDataBody, getData, postData, postMultipart } from "@/core/api/apiHandler";
import { baseUrl } from "@/core/api/axiosInstance";

type Signature = { id: string; ownerType: "USER" | "COMPANY"; signerName: string; signerDesignation: string; status: string; version: number; checksum: string; registeredAt: string; verifiedAt?: string; updatedAt: string; previewUrl: string };
const message = (error: any, fallback: string) => {
  const data = error?.response?.data;
  const text = data?.message || error?.message || fallback;
  const reference = data?.requestId ? ` Reference: ${data.requestId}` : "";
  return `${text}${reference}`;
};
const date = (value?: string) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not yet verified";
const signaturePreviewUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  const apiPath = value.replace(/^\/?(?:api\/)?v1\/web/i, "");
  return `${baseUrl.replace(/\/$/, "")}/${apiPath.replace(/^\//, "")}`;
};

async function authorize(action: string, payload: any, method: "PASSKEY" | "EMAIL_OTP", setPrompt: (value: any) => void) {
  const created = await postData("/authorization-intents", { action, payload, idempotencyKey: crypto.randomUUID() });
  const id = created.data.data.id;
  if (method === "PASSKEY") {
    if (!browserSupportsWebAuthn()) throw new Error("Passkeys are not available in this browser.");
    const options = await postData(`/authorization-intents/${id}/passkey/options`, {});
    const response = await startAuthentication({ optionsJSON: options.data.options });
    await postData(`/authorization-intents/${id}/passkey/verify`, { response });
    return id;
  }
  const sent = await postData(`/authorization-intents/${id}/otp`, {});
  return await new Promise<string>((resolve, reject) => setPrompt({ id, maskedEmail: sent.data.data.maskedEmail, resolve, reject }));
}

export default function SignatureManagementPage() {
  const client = useQueryClient();
  const searchParams = useSearchParams();
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo = requestedReturnTo?.startsWith("/dashboard/") && !requestedReturnTo.startsWith("//") ? requestedReturnTo : "";
  const requestedOwnerType = searchParams.get("ownerType");
  const query = useQuery({ queryKey: ["signatures"], queryFn: async () => (await getData("/signatures", {}, { cacheMode: "bypass" })).data });
  const signatures: Signature[] = useMemo(() => query.data?.data || [], [query.data?.data]), company = query.data?.company;
  const storageConfigured = query.data?.storage?.configured !== false;
  const [ownerType, setOwnerType] = useState<"USER" | "COMPANY">(requestedOwnerType === "COMPANY" ? "COMPANY" : "USER"), [file, setFile] = useState<File | null>(null), [signerName, setSignerName] = useState(""), [designation, setDesignation] = useState("");
  const [busy, setBusy] = useState(""), [status, setStatus] = useState(""), [uploadStatus, setUploadStatus] = useState(""), [prompt, setPrompt] = useState<any>(null), [otp, setOtp] = useState("");
  const current = useMemo(() => signatures.filter(row => row.ownerType === ownerType).sort((a, b) => b.version - a.version), [signatures, ownerType]);
  const hasActiveSignature = signatures.some(row => row.status === "ACTIVE");
  const refresh = () => Promise.all([
    client.invalidateQueries({ queryKey: ["signatures"] }),
    client.invalidateQueries({ queryKey: ["trade-document-readiness"] }),
    client.invalidateQueries({ queryKey: ["inquiries"] }),
    client.invalidateQueries({ queryKey: ["orders"] }),
  ]);
  const upload = async () => { if (!file || !signerName.trim()) return; setBusy("upload"); setUploadStatus(""); try { const body = new FormData(); body.append("signature", file); body.append("ownerType", ownerType); body.append("signerName", signerName.trim()); body.append("signerDesignation", designation.trim()); await postMultipart("/signatures", body); setFile(null); setUploadStatus("Signature uploaded. Verify it before it can be used."); await refresh(); } catch (e) { setUploadStatus(message(e, "Signature upload failed.")); } finally { setBusy(""); } };
  const activate = async (row: Signature, method: "PASSKEY" | "EMAIL_OTP") => { setBusy(`activate-${row.id}`); setStatus(""); const payload = { signatureId: row.id, signatureVersion: row.version, checksum: row.checksum, ownerType: row.ownerType }; try { const id = await authorize("SIGNATURE_ACTIVATE", payload, method, setPrompt); await postData(`/signatures/${row.id}/activate`, { authorizationIntentId: id }); setStatus("Signature verified and ready to use."); await refresh(); } catch (e: any) { if (!prompt) setStatus(message(e, e?.message || "Verification failed.")); } finally { if (method === "PASSKEY") setBusy(""); } };
  const remove = async (row: Signature, method: "PASSKEY" | "EMAIL_OTP") => { setBusy(`remove-${row.id}`); setStatus(""); const payload = { signatureId: row.id, signatureVersion: row.version, checksum: row.checksum, ownerType: row.ownerType }; try { const id = await authorize("SIGNATURE_REVOKE", payload, method, setPrompt); await deleteDataBody(`/signatures/${row.id}`, {}, { authorizationIntentId: id }); setStatus("Signature removed."); await refresh(); } catch (e: any) { if (!prompt) setStatus(message(e, e?.message || "Signature could not be removed.")); } finally { if (method === "PASSKEY") setBusy(""); } };
  const verifyOtp = async () => { if (!prompt || otp.length !== 6) return; setBusy("otp"); try { await postData(`/authorization-intents/${prompt.id}/otp/verify`, { code: otp }); prompt.resolve(prompt.id); setPrompt(null); setOtp(""); } catch (e) { setStatus(message(e, "The code is invalid or expired.")); } finally { setBusy(""); } };

  return <DashboardPage className="py-3 sm:py-5"><PageHeader title="Signature Management" description="Securely register and verify visual signatures for eligible OBAOL documents." />
    <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
      <DashboardPanel className="p-5 sm:p-6"><DashboardSectionHeader title="Register a signature" description="PNG only. The image remains private and inactive until fresh verification succeeds." />
        <div className="mt-5 grid gap-4"><div className="grid grid-cols-2 gap-2"><Button color={ownerType === "USER" ? "warning" : "default"} variant={ownerType === "USER" ? "solid" : "bordered"} onPress={() => setOwnerType("USER")}>Personal</Button><Button color={ownerType === "COMPANY" ? "warning" : "default"} variant={ownerType === "COMPANY" ? "solid" : "bordered"} isDisabled={!company} onPress={() => setOwnerType("COMPANY")}>Company</Button></div>
          {ownerType === "COMPANY" && company && <p className="rounded-xl db-inset p-3 text-sm">Shared for members of <strong>{company.name}</strong>.</p>}
          <Input label="Signature owner" labelPlacement="outside" value={signerName} onValueChange={setSignerName} placeholder="Full legal name" variant="bordered" isRequired /><Input label="Designation" labelPlacement="outside" value={designation} onValueChange={setDesignation} placeholder="Authorized signatory" variant="bordered" />
          {!storageConfigured && <div role="alert" className="rounded-xl border border-warning-400 bg-warning-50 p-3 text-sm text-warning-800">Private signature storage is not configured. An administrator must set the AWS S3 bucket and region before signatures can be uploaded.</div>}
          <label className={`grid min-h-28 place-items-center rounded-2xl border border-dashed db-border-subtle p-4 text-center ${storageConfigured ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}><FiUpload size={24} /><span className="mt-2 text-sm font-semibold">{file?.name || "Choose transparent PNG"}</span><input className="sr-only" type="file" accept="image/png" disabled={!storageConfigured} onChange={event => setFile(event.target.files?.[0] || null)} /></label>
          <Button color="warning" startContent={<FiEdit3 />} isLoading={busy === "upload"} isDisabled={!storageConfigured || !file || !signerName.trim()} onPress={upload}>Upload as pending</Button>
          {uploadStatus && <p role="status" className="rounded-xl border db-border-subtle p-3 text-sm">{uploadStatus}</p>}
          <p className="text-xs leading-5 db-muted">This is an authenticated visual signature, not a certified DSC or CCA-backed eSign.</p></div></DashboardPanel>
      <DashboardPanel className="p-5 sm:p-6"><DashboardSectionHeader title="Saved signatures" description="Passkeys are preferred. Email OTP remains available as a fallback." />
        <div className="mt-5 space-y-4">{query.isLoading ? <p className="db-muted">Loading signatures…</p> : current.length === 0 ? <p className="rounded-xl border border-dashed db-border-subtle p-6 text-sm db-muted">No {ownerType.toLowerCase()} signature has been registered.</p> : current.map(row => <article key={row.id} className="min-w-0 overflow-hidden rounded-2xl border db-border-subtle p-4"><div className="flex min-w-0 flex-col gap-4 sm:flex-row"><div className="grid h-32 w-full flex-none place-items-center overflow-hidden rounded-xl bg-white p-3 sm:w-52">{/* eslint-disable-next-line @next/next/no-img-element -- private authenticated preview */}<img src={signaturePreviewUrl(row.previewUrl)} alt={`Signature of ${row.signerName}`} className="block h-full w-full object-contain" /></div><div className="min-w-0 flex-1 overflow-hidden"><div className="flex min-w-0 flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h2 className="break-words font-semibold">{row.signerName}</h2><p className="break-words text-sm db-muted">{row.signerDesignation || "No designation"} · Version {row.version}</p></div><Chip className="max-w-full" color={row.status === "ACTIVE" ? "success" : "warning"} variant="flat">{row.status.replaceAll("_", " ")}</Chip></div><dl className="mt-3 grid min-w-0 gap-1 break-words text-xs db-muted"><div>Registered: {date(row.registeredAt)}</div><div>Verified: {date(row.verifiedAt)}</div><div>Updated: {date(row.updatedAt)}</div></dl></div></div>
            <div className="mt-4 flex min-w-0 flex-wrap gap-2">{row.status === "PENDING_VERIFICATION" && <><Button size="sm" color="warning" startContent={<FiKey />} isLoading={busy === `activate-${row.id}`} onPress={() => activate(row, "PASSKEY")}>Verify with passkey</Button><Button size="sm" variant="bordered" startContent={<FiMail />} onPress={() => activate(row, "EMAIL_OTP")}>Use email OTP</Button></>}<Button size="sm" color="danger" variant="light" startContent={<FiTrash2 />} onPress={() => remove(row, browserSupportsWebAuthn() ? "PASSKEY" : "EMAIL_OTP")}>Remove securely</Button>{row.status === "ACTIVE" && <span className="inline-flex items-center gap-1 text-xs text-success-700"><FiCheckCircle /> Ready for signing</span>}</div></article>)}</div>
        {status && <p role="status" className="mt-4 rounded-xl border db-border-subtle p-3 text-sm">{status}</p>}
        {returnTo && hasActiveSignature && <Button as={Link} href={returnTo} color="success" className="mt-4 font-semibold" startContent={<FiCheckCircle />}>Return to enquiry</Button>}</DashboardPanel>
    </div>
    {prompt && <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-background p-6"><FiShield size={28} className="text-obaol-600" /><h2 className="mt-3 text-xl font-bold">Confirm with email code</h2><p className="mt-1 text-sm db-muted">A one-time code was sent to {prompt.maskedEmail}.</p><Input className="mt-5" label="6-digit code" inputMode="numeric" value={otp} onValueChange={value => setOtp(value.replace(/\D/g, "").slice(0, 6))} /><div className="mt-5 flex justify-end gap-2"><Button variant="light" onPress={() => { prompt.reject(new Error("Verification cancelled.")); setPrompt(null); setBusy(""); }}>Cancel</Button><Button color="warning" isLoading={busy === "otp"} isDisabled={otp.length !== 6} onPress={verifyOtp}>Verify</Button></div></section></div>}
  </DashboardPage>;
}
