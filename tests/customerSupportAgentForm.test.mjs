import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateCustomerSupportAgentForm } from "../src/utils/customerSupportAgentForm.ts";

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
const validForm = { name: "Help Agent", email: "help@example.com", phone: "", password: "Passw0rd!", isActive: true };

test("support-agent creation validates required identity and credentials", () => {
  assert.deepEqual(validateCustomerSupportAgentForm({ ...validForm, name: "", email: "invalid", password: "short" }, false), {
    name: "Name is required.",
    email: "Enter a valid email address.",
    password: "Password must contain at least 8 characters.",
  });
  assert.deepEqual(validateCustomerSupportAgentForm({ ...validForm, password: "" }, false), {
    password: "Temporary password is required.",
  });
});

test("support-agent edits allow an omitted password but validate a replacement", () => {
  assert.deepEqual(validateCustomerSupportAgentForm({ ...validForm, password: "" }, true), {});
  assert.equal(validateCustomerSupportAgentForm({ ...validForm, password: "1234567" }, true).password, "Password must contain at least 8 characters.");
});

test("support-agent modal retains and exposes request failures", () => {
  const component = read("../src/components/dashboard/Users/customer-support-agents.tsx");
  assert.equal(component.includes('role="alert"'), true);
  assert.equal(component.includes("setRequestError(message)"), true);
  assert.equal(component.includes("requestAnimationFrame(() => firstError.current?.focus())"), true);
  assert.equal(component.includes("isDisabled={save.isPending}"), true);
  assert.equal(component.includes("onError: (error: any) => showToastMessage"), true);
});

test("one global toast host renders application notifications", () => {
  const providers = read("../src/app/public-provider.tsx");
  const layout = read("../src/app/layout.tsx");
  const notifications = read("../src/app/dashboard/notifications/page.tsx");
  assert.equal(providers.includes("<ToastContainer"), true);
  assert.equal(layout.includes('react-toastify/dist/ReactToastify.css'), true);
  assert.equal(notifications.includes("<ToastContainer"), false);
});
