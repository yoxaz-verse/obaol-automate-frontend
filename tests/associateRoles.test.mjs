import assert from "node:assert/strict";
import test from "node:test";
import {
  associateRoleDefinitions,
  associateRoleGroups,
  associateRoleSlugs,
  getAssociateRoleBySlug,
  getAssociateRolesByGroup,
} from "../src/data/associateRoles.ts";

const expectedGroups = {
  trade: ["traders", "importers", "exporters"],
  "supply-procurement": ["suppliers", "procurement-partners"],
  "logistics-quality-compliance": [
    "warehouse-owners", "inland-transportation", "freight-forwarders", "logistics-providers",
    "packaging-companies", "quality-testing-labs", "customs-clearance-agencies",
  ],
  "finance-technology": ["finance-partners", "insurance-partners", "agritech-companies"],
};

test("associate directory contains the 15 unique business roles", () => {
  assert.equal(associateRoleDefinitions.length, 15);
  assert.equal(new Set(associateRoleSlugs).size, 15);
});

test("every associate role satisfies the public content contract", () => {
  const modes = new Set(["BUY", "SELL", "BOTH", "SERVICE"]);
  const groups = new Set(associateRoleGroups.map((group) => group.key));

  for (const role of associateRoleDefinitions) {
    assert.ok(groups.has(role.group), `${role.slug}: invalid group`);
    assert.ok(role.participationModes.length > 0, `${role.slug}: missing participation mode`);
    assert.ok(role.participationModes.every((mode) => modes.has(mode)), `${role.slug}: invalid participation mode`);
    assert.ok(modes.has(role.registrationIntent), `${role.slug}: invalid registration intent`);
    for (const field of ["shortDescription", "bestFor", "longDescription", "ctaLabel"]) {
      assert.ok(role[field].trim().length > 12, `${role.slug}: incomplete ${field}`);
    }
    for (const field of ["eligibility", "responsibilities", "workflow", "platformBenefits", "prerequisites"]) {
      assert.ok(role[field].length >= 3, `${role.slug}: incomplete ${field}`);
      assert.ok(role[field].every((item) => item.trim().length > 8), `${role.slug}: weak ${field} item`);
    }
    assert.ok(role.faqs.length >= 2, `${role.slug}: missing FAQs`);
    assert.ok(role.seo.title && role.seo.description && role.seo.keywords.length >= 3, `${role.slug}: incomplete SEO`);
    assert.ok(role.relatedRoles.length >= 3, `${role.slug}: missing related roles`);
    assert.ok(role.relatedRoles.every((slug) => slug !== role.slug && getAssociateRoleBySlug(slug)), `${role.slug}: invalid related role`);
  }
});

test("functional groups contain every role exactly once in the intended order", () => {
  const groupedSlugs = associateRoleGroups.flatMap((group) => getAssociateRolesByGroup(group.key).map((role) => role.slug));
  assert.deepEqual(groupedSlugs, associateRoleSlugs);
  assert.deepEqual(Object.fromEntries(associateRoleGroups.map((group) => [group.key, getAssociateRolesByGroup(group.key).map((role) => role.slug)])), expectedGroups);
});
