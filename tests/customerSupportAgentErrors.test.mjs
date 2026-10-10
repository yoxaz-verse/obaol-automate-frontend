import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

test("support-agent modal renders dynamic API and field errors", () => {
  const component = read("../src/components/dashboard/Users/customer-support-agents.tsx");
  assert.equal(component.includes("normalizeApiError(error, \"Could not save support agent.\")"), true);
  assert.equal(component.includes("setRequestError(normalized.message)"), true);
  assert.equal(component.includes("setFormErrors(normalized.fieldErrors)"), true);
  assert.equal(component.includes('role="alert"'), true);
  assert.equal(component.includes("minLength={8}"), true);
  assert.equal(component.includes('type="submit"'), true);
  assert.equal(component.includes("validateCustomerSupportAgentForm"), false);
});

test("one global toast host renders application notifications", () => {
  const providers = read("../src/app/public-provider.tsx");
  const layout = read("../src/app/layout.tsx");
  const notifications = read("../src/app/dashboard/notifications/page.tsx");
  assert.equal(providers.includes("<ToastContainer"), true);
  assert.equal(layout.includes('react-toastify/dist/ReactToastify.css'), true);
  assert.equal(notifications.includes("<ToastContainer"), false);
});
