import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  getNavigableGuideRoutes,
  getRoleGuideTopics,
  hasCompleteGuideCoverage,
  searchRoleGuideTopics,
} from "../src/components/guidance/roleGuideContent.ts";

for (const role of ["associate", "operator"]) {
  test(`${role} manual covers every navigable page with operational detail`, () => {
    const routes = getNavigableGuideRoutes(role);
    const references = getRoleGuideTopics(role, "both").filter((topic) => topic.category === "reference");
    assert.ok(routes.length >= 35);
    assert.equal(hasCompleteGuideCoverage(role), true);

    for (const route of routes) {
      const topic = references.find((candidate) => candidate.route === route.path);
      assert.ok(topic, `${role} guidance is missing ${route.path}`);
      assert.equal(topic.role, role);
      assert.ok(topic.responsibility.length > 30);
      assert.ok(topic.importantFields.length >= 4);
      assert.ok(topic.steps.length >= 5);
      assert.ok(topic.statusMeanings.length >= 3);
      assert.ok(topic.troubleshooting.length >= 2);
      assert.ok(topic.escalation.length > 30);
      assert.ok(fs.existsSync(`public${topic.screenshot.src}`), `${topic.screenshot.src} must exist`);
      assert.ok(topic.screenshot.alt.length > 30);
    }
  });
}

test("manual search covers responsibilities, fields, controls, routes, and escalation", () => {
  const topics = getRoleGuideTopics("operator");
  assert.ok(searchRoleGuideTopics(topics, "pricing, contract, compliance").some((topic) => topic.id === "operator-responsibilities"));
  assert.ok(searchRoleGuideTopics(topics, "record ID").some((topic) => topic.id === "operator-troubleshooting"));
  assert.ok(searchRoleGuideTopics(topics, "/dashboard/freight-forwarding/customs").some((topic) => topic.route === "/dashboard/freight-forwarding/customs"));
});

test("operator manual includes Team guidance and the shared UI exposes responsibility comparison", () => {
  const component = fs.readFileSync("src/components/guidance/AssociateGuidebook.tsx", "utf8");
  const guidance = fs.readFileSync("src/components/guidance/GuidanceContent.tsx", "utf8");
  assert.match(component, /Operator & Team Manual/);
  assert.match(component, /Associate and operator responsibility comparison/);
  assert.match(component, /Important fields and controls/);
  assert.match(component, /When to escalate/);
  assert.match(guidance, /roleLower === "operator" \|\| roleLower === "team"/);
  assert.match(guidance, /role=\{isOperator \? "operator" : "associate"\}/);
});
