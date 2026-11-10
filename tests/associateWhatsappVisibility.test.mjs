import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("associate WhatsApp integration is dormant by default", () => {
  const flags = read("src/config/featureFlags.ts");
  const banner = read("src/components/dashboard/AccountVerificationBanner.tsx");
  const access = read("src/utils/dashboardAccess.ts");
  assert.match(flags, /NEXT_PUBLIC_ASSOCIATE_WHATSAPP_ENABLED/);
  assert.match(banner, /role === "associate" && !featureFlags\.associateWhatsappIntegration/);
  assert.match(access, /settings\/whatsapp[\s\S]*roles: featureFlags\.associateWhatsappIntegration \? \["admin", "associate"\] : \["admin"\]/);
});

test("associate signup and profile use email-only verification while dormant", () => {
  const auth = read("src/components/Auth/UnifiedAuthFlow.tsx");
  const profile = read("src/app/dashboard/profile/page.tsx");
  assert.match(auth, /role === "Operator" && <div><label[^>]*>WhatsApp mobile number/);
  assert.match(auth, /role === "Associate" \? "Verify email"/);
  assert.match(profile, /Number\(emailVerified\) \* 100/);
  assert.match(profile, /featureFlags\.associateWhatsappIntegration/);
});

test("integration-dependent referral and document controls honor the flag", () => {
  const referrals = read("src/app/dashboard/referrals/page.tsx");
  const documents = read("src/app/dashboard/documentation/[id]/page.tsx");
  assert.match(referrals, /enabled: featureFlags\.associateWhatsappIntegration/);
  assert.match(documents, /canOwn && featureFlags\.associateWhatsappIntegration/);
  assert.match(documents, /featureFlags\.associateWhatsappIntegration && <WhatsappDocumentDialog/);
});
