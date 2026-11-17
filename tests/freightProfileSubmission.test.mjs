import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/app/dashboard/freight-forwarding/my/page.tsx", import.meta.url), "utf8");

test("freight profile submission sends the visible snapshot and redirects on success", () => {
  assert.match(source, /postData\(api\.submitProfile, \{ companyId: companyId \|\| undefined, snapshot: form \}\)/);
  assert.match(source, /router\.push\("\/dashboard\/freight-forwarding"\)/);
  assert.match(source, /e\?\.response\?\.data\?\.errors/);
  assert.match(source, /scrollIntoView\(\{ behavior: "smooth", block: "center" \}\)/);
});

test("freight profile supports adding and removing multiple certifications", () => {
  assert.match(source, /credentials: \[\.\.\.current\.credentials, \{ type: "" \}\]/);
  assert.match(source, /current\.credentials\.filter/);
  assert.match(source, /form\.credentials\.map/);
  assert.match(source, />Add certification<\/Button>/);
});
