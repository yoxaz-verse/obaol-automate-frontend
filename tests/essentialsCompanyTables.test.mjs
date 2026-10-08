import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const between = (source, start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));

test("Associate Company essentials use only the current capability and jurisdiction fields", () => {
  const source = read("../src/utils/tableValues.tsx");
  const config = between(source, "  associateCompany: [", "  researchedCompany: [");

  for (const expected of [
    'key: "geoType"',
    'key: "country"',
    'key: "providedCapabilities"',
    'key: "soughtCapabilities"',
    'key: "registrationStatus"',
  ]) assert.equal(config.includes(expected), true, `missing ${expected}`);

  assert.equal(config.includes('key: "companyType"'), false);
  assert.equal(config.includes('key: "serviceCapabilities"'), false);
  assert.equal(source.includes('nonActionColumns.push({ name: "COMPANY TYPE", uid: "companyType" })'), false);
});

test("Researched Company retains classification and matches required database fields", () => {
  const source = read("../src/utils/tableValues.tsx");
  const config = between(source, "  researchedCompany: [", "  companyType: [");

  assert.equal(config.includes('key: "companyType"'), true);
  assert.equal(config.includes('key: "feedback"'), true);
  assert.equal(config.includes('key: "assignedTo"'), true);
  assert.match(config, /key: "submittedByOperator"[\s\S]*?required: false/);
  assert.match(config, /key: "phoneSecondary"[\s\S]*?required: false/);
});

test("Company Essentials details are restricted to configured fields", () => {
  const source = read("../src/components/dashboard/Essentials/essential-tab-content.tsx");
  assert.equal(source.includes('const sanitizeCompanyRecord'), true);
  assert.equal(source.includes('["associateCompany", "researchedCompany", "companyStage"]'), true);
  assert.equal(source.includes('data={formatDetailsRecord(item)}'), true);
});
