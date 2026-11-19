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

test("freight profile draft save applies the server snapshot and reports outcomes", () => {
  assert.match(source, /response\?\.data\?\.data\?\.draft/);
  assert.match(source, /Freight profile draft saved/);
  assert.match(source, /isDisabled=\{locked \|\| submit\.isPending\}/);
});

test("pending review status is presented prominently", () => {
  assert.match(source, /Your submitted profile is read-only while it is being reviewed/);
  const chip = readFileSync(new URL("../src/components/ui/ReviewStatusChip.tsx", import.meta.url), "utf8");
  assert.match(chip, /Pending Review/);
  assert.match(chip, /FiClock/);
});
