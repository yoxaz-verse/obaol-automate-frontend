"use client";

import { FormEvent, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";
import { FiArrowLeft, FiCheck, FiEye, FiEyeOff, FiKey, FiMail, FiShield, FiTool, FiUser, FiUsers, FiX } from "react-icons/fi";
import AuthContext from "@/context/AuthContext";
import { postData } from "@/core/api/apiHandler";
import { clearGoogleButton, loadGoogleGsi, renderGoogleButton } from "@/utils/googleGsi";
import { AuthMode, AuthStatus, PublicAuthRole, authDestination, formatAuthCountdown, isValidEmail, normalizeAuthError } from "@/utils/unifiedAuth";
import AuthLayout from "./AuthLayout";

type Stage = "email" | "methods" | "otp";
type Props = { initialMode?: AuthMode; initialRole?: PublicAuthRole; prefill?: string; intent?: string };

const fieldClass = "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-obaol-500 focus:ring-2 focus:ring-obaol-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.04] dark:text-white";
const primaryClass = "inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-obaol-400 to-obaol-600 px-5 text-sm font-black text-obaol-950 shadow-lg shadow-obaol-500/15 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500 disabled:cursor-not-allowed disabled:opacity-55";
const secondaryClass = "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-800 transition hover:border-obaol-500/60 hover:bg-obaol-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500 disabled:opacity-55 dark:border-white/15 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.07]";

export default function UnifiedAuthFlow({ initialMode = "signin", initialRole = "Associate", prefill = "", intent = "" }: Props) {
  const router = useRouter();
  const { isAuthenticated, loading: sessionLoading, user, refreshUser } = useContext(AuthContext);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState(prefill.trim());
  const [role, setRole] = useState<PublicAuthRole>(initialRole);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const emailId = useId();
  const passwordId = useId();
  const otpId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const googleContainerId = "unified-google-auth";
  const isBusy = Boolean(busy);

  const finishAuthentication = useCallback(async (next?: string) => {
    const refreshed = await refreshUser();
    if (!refreshed) {
      const cookieError: any = new Error("Session cookie blocked.");
      cookieError.code = "SESSION_COOKIE_BLOCKED";
      throw cookieError;
    }
    router.replace(next || "/dashboard");
    router.refresh();
  }, [refreshUser, router]);

  useEffect(() => {
    if (!sessionLoading && isAuthenticated && user) router.replace(authDestination(user));
  }, [isAuthenticated, router, sessionLoading, user]);

  useEffect(() => {
    emailRef.current?.focus();
    try { setPasskeySupported(browserSupportsWebAuthn()); } catch { setPasskeySupported(false); }
  }, []);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [otpExpiresAt]);

  const beginOtpWindow = () => {
    const timestamp = Date.now();
    setNow(timestamp);
    setOtp("");
    setOtpExpiresAt(timestamp + 3 * 60 * 1000);
    setResendAt(timestamp + 2 * 60 * 1000);
    setStage("otp");
  };

  const showError = (error: any) => setStatus(normalizeAuthError(error));

  const redirectExistingAccountToSignIn = useCallback(() => {
    setMode("signin");
    setStage("email");
    setPassword("");
    setOtp("");
    const params = new URLSearchParams({ mode: "signin", prefill: email.trim().toLowerCase(), reason: "account-exists" });
    if (intent) params.set("intent", intent);
    window.history.replaceState(window.history.state, "", `/auth?${params.toString()}`);
    setStatus({
      tone: "info",
      code: "ACCOUNT_EXISTS",
      message: "An account already exists for this email. Please sign in instead.",
    });
  }, [email, intent]);

  const switchMode = (nextMode: AuthMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setStage("email");
    setPassword("");
    setOtp("");
    setStatus(null);
    const params = new URLSearchParams();
    params.set("mode", nextMode === "signup" ? "signup" : "signin");
    if (nextMode === "signup") params.set("role", role.toLowerCase());
    if (email) params.set("prefill", email);
    if (intent) params.set("intent", intent);
    window.history.replaceState(window.history.state, "", `/auth?${params.toString()}`);
  };

  const continueFromEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (isBusy) return;
    if (!isValidEmail(email)) {
      setStatus({ tone: "error", message: "Enter a valid email address." });
      return;
    }
    setStatus(null);
    if (mode === "signin") {
      setStage("methods");
      return;
    }
    setBusy("signup");
    try {
      await postData("/auth/onboarding/start", { email: email.trim().toLowerCase(), role });
      beginOtpWindow();
      setStatus({ tone: "info", message: "If this email is eligible, a verification code has been sent." });
    } catch (error: any) {
      if (error?.response?.data?.code === "ACCOUNT_EXISTS") redirectExistingAccountToSignIn();
      else showError(error);
    } finally {
      setBusy("");
    }
  };

  const passwordSignIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!password || isBusy) return;
    setBusy("password");
    setStatus(null);
    try {
      const response = await postData("/auth/unified/password", { email: email.trim().toLowerCase(), password, rememberMe });
      setStatus({ tone: "success", message: "Signed in. Opening your workspace…" });
      await finishAuthentication(response.data?.next);
    } catch (error) {
      showError(error);
    } finally {
      setBusy("");
    }
  };

  const sendLoginOtp = async () => {
    if (isBusy) return;
    setBusy("send-otp");
    setStatus(null);
    try {
      await postData("/verification/send-otp-existing", { method: "email", email: email.trim().toLowerCase() });
      beginOtpWindow();
      setStatus({ tone: "info", message: "If this email is eligible, a verification code has been sent." });
    } catch (error) {
      showError(error);
    } finally {
      setBusy("");
    }
  };

  const resendOtp = async () => {
    if (isBusy || now < resendAt) return;
    setBusy("resend");
    try {
      if (mode === "signin") await postData("/verification/send-otp-existing", { method: "email", email: email.trim().toLowerCase() });
      else await postData("/verification/send-otp", { method: "email" });
      beginOtpWindow();
      setStatus({ tone: "info", message: "A new verification code has been requested." });
    } catch (error) {
      showError(error);
    } finally {
      setBusy("");
    }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6 || isBusy) return;
    setBusy("verify-otp");
    setStatus(null);
    try {
      const response = mode === "signin"
        ? await postData("/verification/verify-otp-existing", { code: otp, method: "email", email: email.trim().toLowerCase(), rememberMe })
        : await postData("/verification/verify-otp", { code: otp, method: "email" });
      setStatus({ tone: "success", message: mode === "signin" ? "Signed in. Opening your workspace…" : "Email verified. Opening onboarding…" });
      await finishAuthentication(response.data?.next || (mode === "signup" ? "/dashboard/onboarding" : undefined));
    } catch (error) {
      showError(error);
    } finally {
      setBusy("");
    }
  };

  const passkeySignIn = async () => {
    if (!passkeySupported || isBusy) return;
    setBusy("passkey");
    setStatus(null);
    try {
      const options = await postData("/auth/passkeys/authentication/options", { email: email.trim().toLowerCase() });
      const credential = await startAuthentication({ optionsJSON: options.data.options });
      const response = await postData("/auth/passkeys/authentication/verify", { email: email.trim().toLowerCase(), response: credential, rememberMe });
      await finishAuthentication(response.data?.next);
    } catch (error: any) {
      if (error?.name !== "NotAllowedError") showError(error);
    } finally {
      setBusy("");
    }
  };

  const handleGoogleCredential = useCallback(async (response: { credential?: string }) => {
    if (!response?.credential) return;
    setBusy("google");
    setStatus(null);
    try {
      const result = await postData("/auth/google", {
        idToken: response.credential,
        intent: mode === "signup" ? "register" : "login",
        ...(mode === "signup" ? { role } : {}),
        rememberMe,
      });
      await finishAuthentication(result.data?.next || (mode === "signup" ? "/dashboard/onboarding?auth=google" : undefined));
    } catch (error: any) {
      if (mode === "signup" && error?.response?.data?.code === "ACCOUNT_EXISTS") redirectExistingAccountToSignIn();
      else showError(error);
    } finally {
      setBusy("");
    }
  }, [finishAuthentication, mode, redirectExistingAccountToSignIn, rememberMe, role]);

  useEffect(() => {
    if (!googleClientId || stage !== "email") return;
    let active = true;
    loadGoogleGsi().then(async () => {
      if (!active) return;
      setGoogleReady(true);
      await renderGoogleButton({ containerId: googleContainerId, clientId: googleClientId, width: 340, maxRetries: 6, retryDelayMs: 120, callback: handleGoogleCredential });
    }).catch(() => active && setGoogleError("Google sign-in is temporarily unavailable."));
    return () => { active = false; clearGoogleButton(googleContainerId); };
  }, [googleClientId, handleGoogleCredential, stage]);

  const otpRemaining = otpExpiresAt - now;
  const resendRemaining = resendAt - now;

  return (
    <AuthLayout
      title={mode === "signin" ? "Welcome back" : "Create your OBAOL account"}
      subtitle={mode === "signin" ? "One secure sign-in for Associate and Operator accounts." : "Verify your email, choose your account type, and complete onboarding."}
      cardMaxWidthClass="max-w-[500px]"
      stableContentTop
      leftPanel={{ headline: "OBAOL", highlight: "ONE SECURE ACCESS", description: "Access commodity discovery, verified partners, execution workflows, documents, and orders from one account entry.", points: ["Password, email code, Google, or passkey", "Private account discovery", "Secure session management"], footer: "Agro trade execution" }}
    >
      <div data-testid="unified-auth" className="space-y-5">
        <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.05]" aria-label="Authentication mode">
          {(["signin", "signup"] as AuthMode[]).map((item) => (
            <button key={item} type="button" onClick={() => switchMode(item)} aria-pressed={mode === item} className={`h-10 rounded-lg text-xs font-black transition ${mode === item ? "bg-white text-slate-950 shadow-sm dark:bg-obaol-500 dark:text-obaol-950" : "text-slate-500 dark:text-white/55"}`}>
              {item === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <div aria-live="polite" aria-atomic="true" role={status?.tone === "error" ? "alert" : "status"} className={status ? `relative min-h-12 rounded-xl border px-4 py-3 text-sm font-semibold ${status.tone === "error" ? "border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" : status.tone === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300" : status.tone === "maintenance" ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200" : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200"}` : "min-h-0"}>
          {status?.tone === "maintenance" ? (
            <span className="flex items-start gap-2.5">
              <FiTool className="mt-0.5 shrink-0" aria-hidden />
              <span>{status.message}</span>
            </span>
          ) : status?.message}
          {status?.code === "ACCOUNT_EXISTS" && (
            <button type="button" aria-label="Dismiss account notice" onClick={() => setStatus(null)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-current/70 hover:bg-black/5 dark:hover:bg-white/10">
              <FiX aria-hidden />
            </button>
          )}
        </div>

        {stage === "email" && (
          <form onSubmit={continueFromEmail} className="space-y-4" data-testid="auth-form">
            {mode === "signup" && (
              <fieldset>
                <legend className="mb-2 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-white/65">Account type</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["Associate", "Operator"] as PublicAuthRole[]).map((item) => (
                    <label key={item} className={`flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${role === item ? "border-obaol-500 bg-obaol-50 ring-2 ring-obaol-500/15 dark:bg-obaol-500/10" : "border-slate-300 dark:border-white/15"}`}>
                      <input className="sr-only" type="radio" name="role" value={item} checked={role === item} onChange={() => setRole(item)} />
                      {item === "Associate" ? <FiUsers aria-hidden /> : <FiUser aria-hidden />}
                      <span><b className="block text-sm">{item}</b><small className="text-[10px] text-slate-500 dark:text-white/50">{item === "Associate" ? "Company or trade business" : "Approved execution specialist"}</small></span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <div>
              <label htmlFor={emailId} className="mb-2 block text-xs font-bold text-slate-700 dark:text-white/70">Email address</label>
              <input ref={emailRef} id={emailId} className={fieldClass} type="email" value={email} autoComplete="email webauthn" inputMode="email" placeholder="name@example.com" disabled={isBusy} onChange={(event) => { setEmail(event.target.value); setStatus(null); }} required />
            </div>
            <button data-testid="auth-submit" className={primaryClass} disabled={isBusy || !isValidEmail(email)} type="submit">{busy === "signup" ? "Sending code…" : mode === "signin" ? "Continue securely" : "Verify email"}</button>
            <div className="relative py-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400"><span className="relative z-10 bg-white px-3 dark:bg-content1">or</span><span className="absolute left-0 top-1/2 h-px w-full bg-slate-200 dark:bg-white/10" /></div>
            <div className="min-h-[52px] rounded-xl border border-slate-200 p-1.5 dark:border-white/10">
              {googleClientId ? <><div id={googleContainerId} className="flex min-h-10 justify-center" />{!googleReady && !googleError && <div className="mx-auto h-10 max-w-[340px] animate-pulse rounded-lg bg-slate-100 dark:bg-white/[0.05]" />}</> : <p className="py-3 text-center text-xs text-slate-500">Google sign-in is not configured.</p>}
              {googleError && <p className="py-2 text-center text-xs text-red-600">{googleError}</p>}
            </div>
          </form>
        )}

        {stage === "methods" && (
          <div className="space-y-4">
            <button type="button" onClick={() => { setStage("email"); setStatus(null); }} className="inline-flex items-center gap-2 text-xs font-bold text-obaol-700 dark:text-obaol-300"><FiArrowLeft /> Change email</button>
            <div className="rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Signing in as</span><span className="block truncate text-sm font-bold">{email}</span></div>
            <form onSubmit={passwordSignIn} className="space-y-3">
              <label htmlFor={passwordId} className="block text-xs font-bold text-slate-700 dark:text-white/70">Password</label>
              <div className="relative"><input id={passwordId} className={`${fieldClass} pr-12`} type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
              <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-white/60"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-obaol-500" /> Keep me signed in on this device</label>
                <Link
                  href={`/auth/forgot-password?prefill=${encodeURIComponent(email.trim())}`}
                  className="text-xs font-bold text-obaol-700 underline decoration-obaol-500/20 underline-offset-4 transition-colors hover:text-obaol-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-obaol-500 dark:text-obaol-300 dark:hover:text-obaol-200"
                >
                  Forgot password?
                </Link>
              </div>
              <button className={primaryClass} disabled={isBusy || !password} type="submit">{busy === "password" ? "Signing in…" : "Sign in with password"}</button>
            </form>
            <button className={secondaryClass} type="button" disabled={isBusy} onClick={sendLoginOtp}><FiMail /> Sign in with email code</button>
            {passkeySupported && <button data-testid="passkey-signin" className={secondaryClass} type="button" disabled={isBusy} onClick={passkeySignIn}><FiKey /> Sign in with passkey</button>}
            <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><FiShield className="mt-1 shrink-0" /> For privacy, OBAOL does not reveal whether an email is registered until identity is verified.</p>
          </div>
        )}

        {stage === "otp" && (
          <form onSubmit={verifyOtp} className="space-y-4">
            <button type="button" onClick={() => { setStage(mode === "signin" ? "methods" : "email"); setStatus(null); }} className="inline-flex items-center gap-2 text-xs font-bold text-obaol-700 dark:text-obaol-300"><FiArrowLeft /> Back</button>
            <div><label htmlFor={otpId} className="mb-2 block text-xs font-bold text-slate-700 dark:text-white/70">Six-digit email code</label><input id={otpId} className={`${fieldClass} text-center text-xl font-black tracking-[0.45em]`} type="text" inputMode="numeric" autoComplete="one-time-code" autoFocus value={otp} maxLength={6} placeholder="000000" onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
            <div className="flex min-h-8 items-center justify-between gap-3 text-xs text-slate-500"><span>{otpRemaining > 0 ? `Expires in ${formatAuthCountdown(otpRemaining)}` : "Code expired"}</span><button type="button" disabled={resendRemaining > 0 || isBusy} onClick={resendOtp} className="font-bold text-obaol-700 disabled:text-slate-400 dark:text-obaol-300">{resendRemaining > 0 ? `Resend in ${formatAuthCountdown(resendRemaining)}` : "Resend code"}</button></div>
            <button className={primaryClass} disabled={isBusy || otp.length !== 6 || otpRemaining <= 0} type="submit">{busy === "verify-otp" ? "Verifying…" : <span className="inline-flex items-center gap-2"><FiCheck /> Verify and continue</span>}</button>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs dark:border-white/10"><Link href="/" className="font-semibold text-slate-500 hover:text-obaol-700">Back to OBAOL</Link><Link href="/roles" className="font-semibold text-obaol-700 dark:text-obaol-300">Compare account types</Link></div>
      </div>
    </AuthLayout>
  );
}
