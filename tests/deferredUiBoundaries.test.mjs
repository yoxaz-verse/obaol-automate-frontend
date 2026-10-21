import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("users only mounts the selected tab and defers both user experiences", () => {
  const source = read("src/app/dashboard/users/page.tsx");
  assert.match(source, /table\.key === currentTable/);
  assert.match(source, /dynamic\([\s\S]*customer-support-agents/);
  assert.match(source, /dynamic\([\s\S]*user-tab-content/);
  assert.match(source, /motion-reduce:animate-none/);
});

test("catalog creation loads its form only after the trigger is pressed", () => {
  const source = read("src/components/ui/DeferredAddModal.tsx");
  const modal = read("src/components/CurdTable/add-model.tsx");
  const catalog = read("src/app/dashboard/catalog/page.tsx");
  assert.match(source, /if \(requested\)/);
  assert.match(source, /defaultOpen hideTrigger/);
  assert.match(source, /setRequested\(true\)/);
  assert.match(source, /onRequestClose=\{\(\) => setRequested\(false\)\}/);
  assert.match(modal, /defaultOpen = false/);
  assert.match(modal, /hideTrigger = false/);
  assert.match(catalog, /import\("@\/components\/dashboard\/Catalog\/product-list"\)/);
  assert.doesNotMatch(catalog, /^import \{ ProductList \}/m);
});

test("passkey browser code is imported at registration time", () => {
  const source = read("src/app/dashboard/profile/page.tsx");
  assert.doesNotMatch(source, /^import .*@simplewebauthn\/browser/m);
  assert.match(source, /await import\("@simplewebauthn\/browser"\)/);
});

test("public fades and footer remain reduced-motion-safe without Framer Motion", () => {
  const fade = read("src/app/verification/FadeIn.tsx");
  const footer = read("src/components/home/footer.tsx");
  assert.match(fade, /motion-reduce:animate-none/);
  assert.doesNotMatch(fade, /framer-motion/);
  assert.doesNotMatch(footer, /framer-motion/);
});
