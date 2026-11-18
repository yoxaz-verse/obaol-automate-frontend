import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";
import { postData } from "@/core/api/apiHandler";

export async function freshAuthorization(action: string, payload: Record<string, unknown>) {
  const created = await postData("/authorization-intents", { action, payload, idempotencyKey: crypto.randomUUID() });
  const id = created.data.data.id;
  if (browserSupportsWebAuthn()) {
    try {
      const options = await postData(`/authorization-intents/${id}/passkey/options`, {});
      const response = await startAuthentication({ optionsJSON: options.data.options });
      await postData(`/authorization-intents/${id}/passkey/verify`, { response });
      return id;
    } catch {
      // Registered passkeys are preferred; email OTP remains the explicit fallback.
    }
  }
  const sent = await postData(`/authorization-intents/${id}/otp`, {});
  const code = window.prompt(`Enter the 6-digit code sent to ${sent.data.data.maskedEmail}.`);
  if (!code) throw new Error("Fresh authorization was cancelled.");
  await postData(`/authorization-intents/${id}/otp/verify`, { code: code.replace(/\D/g, "").slice(0, 6) });
  return id;
}
