import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("referral dashboard offers tracked email, WhatsApp, and personal-link invitations", () => {
  const page = read("../src/app/dashboard/referrals/page.tsx");
  for (const token of [
    "Invite someone", "Open email invitation", "Open WhatsApp invitation", "Copy personal invitation",
    "mailto:", "https://wa.me/", "idempotencyKey", "People you invited",
    "Invited → Joined → Active this month → Earned",
  ]) assert.equal(page.includes(token), true, `missing ${token}`);
  assert.equal(page.includes("OBAOL records the share attempt"), true);
  assert.equal(page.includes("realized profit"), true);
  assert.equal(page.includes("How to stay active"), true);
  assert.equal(page.includes("Logging in, browsing"), true);
  assert.equal(page.includes("Activity required"), true);
});

test("referral dashboard uses shared light and dark dashboard surfaces", () => {
  const page = read("../src/app/dashboard/referrals/page.tsx");
  for (const token of ["dashboard-page", "dashboard-panel", "db-inset", "db-muted", "dark:text-obaol-300"]) {
    assert.equal(page.includes(token), true, `missing theme token ${token}`);
  }
  assert.equal(page.includes('bg-[#fbf8f1]'), false, "must not restore the hard-coded light page background");
  assert.equal(page.includes("const lightCard"), false, "cards must use shared dashboard surfaces");
});

test("associate onboarding carries the personalized invitation token into registration", () => {
  const form = read("../src/components/onboarding/AssociateOnboardingForm.tsx");
  const routes = read("../src/core/api/apiRoutes.tsx");
  assert.equal(form.includes('searchParams?.get("invite")'), true);
  assert.equal(form.includes("referralInvitationToken: referralInvitationToken || undefined"), true);
  assert.equal(routes.includes('invitations: "/associate-referrals/invitations"'), true);
});
