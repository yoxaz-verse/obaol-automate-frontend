import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const sourceFiles = (relativeDirectory) => {
  const directory = path.join(root, relativeDirectory);
  return readdirSync(directory).flatMap((entry) => {
    const absolute = path.join(directory, entry);
    const relative = path.relative(root, absolute);
    if (statSync(absolute).isDirectory()) return sourceFiles(relative);
    return /\.(?:ts|tsx)$/.test(entry) ? [relative] : [];
  });
};

test("dashboard shell suppresses detached focus rings", () => {
  const globals = read("src/app/globals.css");
  assert.match(globals, /\[data-dashboard-shell\][\s\S]*\[data-focus-visible="true"\][\s\S]*outline: none !important;[\s\S]*box-shadow: none !important;/);
});

test("dashboard search uses strong borders and user-facing destination copy", () => {
  const search = read("src/components/dashboard/GlobalSearch.tsx");
  assert.match(search, /inputWrapper: "[^"]*db-border-strong[^"]*group-data-\[focus=true\]:ring-0/);
  assert.match(search, /rounded-3xl border db-border-strong/);
  assert.match(search, /Opens \{option\.name\}/);
  assert.doesNotMatch(search, /Redirection:/i);
});

test("account menu uses concise professional labels and bordered selection states", () => {
  const topBar = read("src/components/dashboard/TopBar.tsx");
  for (const label of ['textValue="Profile"', 'textValue="Language"', 'textValue="Theme"', 'textValue="Sign out"']) {
    assert.equal(topBar.includes(label), true, `missing ${label}`);
  }
  assert.match(topBar, /data-\[focus=true\]:border-obaol-500\/30/);
  assert.doesNotMatch(topBar, /Node Language|System Theme|Terminate Session|Management Portal/);
});

test("dashboard presentation does not force ordinary interface copy to uppercase", () => {
  const files = [
    ...sourceFiles("src/app/dashboard"),
    ...sourceFiles("src/components/dashboard"),
    ...sourceFiles("src/features"),
  ];
  const offenders = files.filter((file) => /(?:^|\s)uppercase(?:\s|$)/m.test(read(file)));
  assert.deepEqual(offenders, []);
});

