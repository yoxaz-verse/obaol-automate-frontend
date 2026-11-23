import test from "node:test";
import assert from "node:assert/strict";
import { filterOperatorWorkflowGroups } from "../src/utils/operatorNavigationCapabilities.ts";

const groups = [
  { label: "Finance", links: ["/dashboard/financial-partners", "/dashboard/financial-partners/my", "/dashboard/financial-partners/applications"] },
  { label: "Packaging", links: ["/dashboard/packaging", "/dashboard/packaging/my"] },
  { label: "Freight", links: ["/dashboard/freight-forwarding", "/dashboard/freight-forwarding/my"] },
];

test("operator groups disappear without managed company capabilities", () => {
  assert.deepEqual(filterOperatorWorkflowGroups(groups, {
    companyCount: 0, providedCapabilities: [], soughtCapabilities: [], eligibility: {},
  }), []);
});

test("sought capability reveals discovery but not provider management", () => {
  assert.deepEqual(filterOperatorWorkflowGroups(groups, {
    companyCount: 1, providedCapabilities: [], soughtCapabilities: ["finance-risk"], eligibility: {},
  }), [{
    label: "Finance",
    links: ["/dashboard/financial-partners", "/dashboard/financial-partners/applications"],
  }]);
});

test("provided capabilities reveal matching management links only", () => {
  assert.deepEqual(filterOperatorWorkflowGroups(groups, {
    companyCount: 2,
    providedCapabilities: ["finance-risk", "packaging"],
    soughtCapabilities: [],
    eligibility: {},
  }), [groups[0], groups[1]]);
});
