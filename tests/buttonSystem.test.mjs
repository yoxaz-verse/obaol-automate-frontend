import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

test("AppButton exposes the complete application intent hierarchy", () => {
  const component = read("src/components/ui/AppButton.tsx");
  for (const intent of ["primary", "secondary", "tertiary", "danger", "success", "warning", "icon"]) {
    assert.match(component, new RegExp(`\\b${intent}:`), `missing ${intent} intent`);
  }
  for (const property of ["ButtonProps", "className", "...props"]) assert.match(component, new RegExp(property.replace("...", "\\.\\.\\.")));
});

test("button styles use the brand palette with accessible interaction states", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /\.app-button--primary\s*\{[\s\S]*background: var\(--brand-flame\)[\s\S]*color: var\(--brand-abyssal\)/);
  assert.match(css, /\.app-button--secondary\s*\{[\s\S]*border: 1px solid var\(--brand-truffle\)/);
  assert.match(css, /\.app-button:is\(:focus-visible, \[data-focus-visible="true"\]\)/);
  assert.match(css, /min-height: 2\.75rem/);
});

test("import reservations empty state uses the shared primary action", () => {
  const page = read("src/app/dashboard/imports/page.tsx");
  assert.match(page, /<AppButton[^>]*intent="primary"[^>]*>[\s\S]*Browse import opportunities[\s\S]*<\/AppButton>/);
  assert.doesNotMatch(page, /Browse import opportunities[\s\S]{0,120}bg-foreground/);
});

test("ordinary button and link CTAs cannot introduce black or slate primary fills", () => {
  const walk = (directory) => readdirSync(directory).flatMap((entry) => {
    const target = path.join(directory, entry);
    if (statSync(target).isDirectory()) return walk(target);
    return /\.(?:tsx|jsx)$/.test(entry) ? [target] : [];
  });
  const forbidden = /<(?:Button|Link)\b[^>]*className="[^"]*(?:bg-slate-900|bg-foreground)(?=\s|")[^"]*"/s;
  const blackPrimary = /<(?:Button|Link)\b[^>]*className="[^"]*bg-black(?=\s|")[^"]*"/s;
  const offenders = walk(path.join(root, "src")).filter((file) => {
    const source = readFileSync(file, "utf8");
    if (forbidden.test(source)) return true;
    // Apple sign-in follows Apple's required black brand treatment.
    return !file.endsWith(path.join("components", "Login", "login-component.tsx")) && blackPrimary.test(source);
  });
  assert.deepEqual(offenders.map((file) => path.relative(root, file)), []);
});
