"use client";

import { useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
import { FiKey, FiLock, FiMonitor, FiShield, FiTrash2 } from "react-icons/fi";
import PageHeader from "@/components/ui/PageHeader";
import { DashboardPage, DashboardPanel, DashboardSectionHeader, DashboardStatusBadge } from "@/components/dashboard/DashboardUI";
import { deleteData, deleteDataBody, getData, postData, putData } from "@/core/api/apiHandler";

type Session = { id: string; browser: string; device: string; location: string; createdAt: string; lastActiveAt: string; expiresAt: string; current: boolean };

const messageFor = (error: any, fallback: string) => error?.response?.data?.message || error?.message || fallback;
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Unknown";

function PasswordPanel() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const validPassword = newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword);

  const sendOtp = async () => {
    setSending(true); setStatus("");
    try { await postData("/verification/send-otp", { method: "email" }); setStatus("OTP sent to your registered email."); }
    catch (error) { setStatus(messageFor(error, "Unable to send OTP.")); }
    finally { setSending(false); }
  };
  const submit = async () => {
    if (newPassword !== confirmPassword) return setStatus("New passwords do not match.");
    setBusy(true); setStatus("");
    try {
      const response = await putData("/auth/password", { currentPassword, newPassword, otpCode });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setOtpCode("");
      setStatus(response.data.message || "Password changed.");
    } catch (error) { setStatus(messageFor(error, "Unable to change password.")); }
    finally { setBusy(false); }
  };

  return <DashboardPanel className="overflow-hidden">
    <div className="flex items-center gap-3 border-b db-border-subtle px-5 py-4 sm:px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-obaol-500/10 text-obaol-600"><FiLock /></span><DashboardSectionHeader title="Password" description="Use your current password and an email OTP to choose a new one." /></div>
    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <Input label="Current password" labelPlacement="outside" type="password" autoComplete="current-password" variant="bordered" value={currentPassword} onValueChange={setCurrentPassword} />
      <div />
      <Input label="New password" labelPlacement="outside" type="password" autoComplete="new-password" variant="bordered" value={newPassword} onValueChange={setNewPassword} />
      <Input label="Confirm new password" labelPlacement="outside" type="password" autoComplete="new-password" variant="bordered" value={confirmPassword} onValueChange={setConfirmPassword} />
      <Input label="Email OTP" labelPlacement="outside" inputMode="numeric" placeholder="000000" variant="bordered" value={otpCode} onValueChange={(v) => setOtpCode(v.replace(/\D/g, "").slice(0, 6))} />
      <div className="flex items-end gap-2"><Button variant="flat" isLoading={sending} onPress={sendOtp}>Send OTP</Button><Button color="warning" isLoading={busy} isDisabled={!currentPassword || !validPassword || newPassword !== confirmPassword || otpCode.length !== 6} onPress={submit}>Change password</Button></div>
      <p className="text-xs db-muted sm:col-span-2">Use at least 8 characters, one uppercase letter, and one number. Changing it signs out every other device.</p>
      {status && <p role="status" className="rounded-xl border db-border-subtle px-3 py-2 text-sm sm:col-span-2">{status}</p>}
    </div>
  </DashboardPanel>;
}

function PasskeysPanel() {
  const [password, setPassword] = useState(""); const [otpCode, setOtpCode] = useState(""); const [deviceLabel, setDeviceLabel] = useState("My device");
  const [status, setStatus] = useState(""); const [sending, setSending] = useState(false); const [creating, setCreating] = useState(false); const [deleting, setDeleting] = useState("");
  const { data, refetch } = useQuery({ queryKey: ["authPasskeys"], queryFn: () => getData("/auth/passkeys") });
  const passkeys = data?.data?.passkeys || [];
  const sendOtp = async () => { setSending(true); setStatus(""); try { await postData("/verification/send-otp", { method: "email" }); setStatus("OTP sent to your registered email."); } catch (e) { setStatus(messageFor(e, "Unable to send OTP.")); } finally { setSending(false); } };
  const create = async () => { if (!browserSupportsWebAuthn()) return setStatus("Passkeys are not available on this browser."); setCreating(true); setStatus(""); try { const options = await postData("/auth/passkeys/registration/options", { password, otpCode, deviceLabel }); const response = await startRegistration({ optionsJSON: options.data.options }); await postData("/auth/passkeys/registration/verify", { response, deviceLabel }); setPassword(""); setOtpCode(""); setStatus("Passkey added."); await refetch(); } catch (e) { setStatus(messageFor(e, "Passkey setup failed.")); } finally { setCreating(false); } };
  const remove = async (id: string) => { setDeleting(id); setStatus(""); try { await deleteDataBody(`/auth/passkeys/${encodeURIComponent(id)}`, {}, { password, otpCode }); setPassword(""); setOtpCode(""); setStatus("Passkey removed."); await refetch(); } catch (e) { setStatus(messageFor(e, "Unable to remove passkey.")); } finally { setDeleting(""); } };
  return <DashboardPanel className="overflow-hidden">
    <div className="flex items-center gap-3 border-b db-border-subtle px-5 py-4 sm:px-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-obaol-500/10 text-obaol-600"><FiKey /></span><DashboardSectionHeader title="Passkeys" description="Use your device biometrics or screen lock for a faster sign-in." /></div>
    <div className="grid gap-6 p-5 lg:grid-cols-2 sm:p-6"><div className="flex flex-col gap-4"><Input label="Device label" labelPlacement="outside" variant="bordered" value={deviceLabel} onValueChange={setDeviceLabel} /><Input label="Current password" labelPlacement="outside" type="password" variant="bordered" value={password} onValueChange={setPassword} /><Input label="Email OTP" labelPlacement="outside" inputMode="numeric" placeholder="000000" variant="bordered" value={otpCode} onValueChange={(v) => setOtpCode(v.replace(/\D/g, "").slice(0, 6))} /><div className="flex gap-2"><Button variant="flat" isLoading={sending} onPress={sendOtp}>Send OTP</Button><Button color="warning" isLoading={creating} isDisabled={!password || otpCode.length !== 6 || !deviceLabel.trim()} onPress={create}>Add passkey</Button></div>{status && <p role="status" className="rounded-xl border db-border-subtle px-3 py-2 text-sm">{status}</p>}</div>
      <div className="flex flex-col gap-3">{passkeys.length === 0 ? <p className="rounded-xl border border-dashed db-border-subtle p-5 text-sm db-muted">No passkeys registered.</p> : passkeys.map((key: any) => <div key={key.credentialId} className="flex items-center justify-between gap-3 rounded-xl border db-border-subtle p-4"><div><p className="font-semibold">{key.deviceLabel || "Passkey"}</p><p className="mt-1 text-xs db-muted">{key.lastUsedAt ? `Last used ${formatDate(key.lastUsedAt)}` : `Created ${formatDate(key.createdAt)}`}</p></div><Button isIconOnly size="sm" color="danger" variant="flat" aria-label="Remove passkey" isLoading={deleting === key.credentialId} isDisabled={!password || otpCode.length !== 6} onPress={() => remove(key.credentialId)}><FiTrash2 /></Button></div>)}</div>
    </div>
  </DashboardPanel>;
}

function DevicesPanel() {
  const [status, setStatus] = useState(""); const [pending, setPending] = useState("");
  const { data, isLoading, refetch } = useQuery({ queryKey: ["authSessions"], queryFn: () => getData("/auth/sessions") });
  const sessions: Session[] = data?.data?.sessions || [];
  const revoke = async (id: string) => { if (!window.confirm("Sign out this device?")) return; setPending(id); setStatus(""); try { await deleteData(`/auth/sessions/${encodeURIComponent(id)}`); setStatus("Device signed out."); await refetch(); } catch (e) { setStatus(messageFor(e, "Unable to sign out device.")); } finally { setPending(""); } };
  const revokeOthers = async () => { if (!window.confirm("Sign out every other device?")) return; setPending("others"); setStatus(""); try { const response = await deleteData("/auth/sessions/others"); setStatus(`${response.data.revokedCount || 0} other device(s) signed out.`); await refetch(); } catch (e) { setStatus(messageFor(e, "Unable to sign out other devices.")); } finally { setPending(""); } };
  return <DashboardPanel className="overflow-hidden">
    <div className="flex flex-col gap-3 border-b db-border-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-obaol-500/10 text-obaol-600"><FiMonitor /></span><DashboardSectionHeader title="Active devices" description="Review browsers currently signed in to your account." /></div><Button color="danger" variant="flat" isLoading={pending === "others"} isDisabled={!sessions.some((s) => !s.current)} onPress={revokeOthers}>Sign out all other devices</Button></div>
    <div className="flex flex-col gap-3 p-5 sm:p-6">{isLoading ? <p className="text-sm db-muted">Loading active devices…</p> : sessions.length === 0 ? <p className="text-sm db-muted">No tracked active devices. Older sessions will appear after their next sign-in.</p> : sessions.map((session) => <div key={session.id} className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${session.current ? "border-obaol-500/40 bg-obaol-500/[0.04]" : "db-border-subtle"}`}><div className="min-w-0"><div className="flex items-center gap-2"><p className="font-semibold">{session.browser} on {session.device}</p>{session.current && <DashboardStatusBadge tone="brand">Current device</DashboardStatusBadge>}</div><p className="mt-1 text-sm db-muted">{session.location} · Last active {formatDate(session.lastActiveAt)}</p><p className="mt-1 text-xs db-muted">Signed in {formatDate(session.createdAt)}</p></div>{!session.current && <Button color="danger" variant="flat" isLoading={pending === session.id} onPress={() => revoke(session.id)}>Sign out</Button>}</div>)}{status && <p role="status" className="rounded-xl border db-border-subtle px-3 py-2 text-sm">{status}</p>}</div>
  </DashboardPanel>;
}

export default function SecurityPage() {
  return <DashboardPage className="py-3 sm:py-5"><PageHeader title="Password & Security" description="Manage your password, passkeys, and signed-in devices." breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: "Company & account" }, { label: "Settings", href: "/dashboard/settings" }, { label: "Password & Security" }]} /><div className="flex flex-col gap-6"><div className="flex items-center gap-3 rounded-2xl border db-border-subtle db-panel p-4"><FiShield className="text-obaol-600" size={24} /><p className="text-sm db-muted">Security changes are protected with your current password and a one-time code sent to your registered email.</p></div><PasswordPanel /><PasskeysPanel /><DevicesPanel /></div></DashboardPage>;
}
