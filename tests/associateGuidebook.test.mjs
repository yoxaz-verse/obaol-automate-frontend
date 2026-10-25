import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  associateGuideCategories,
  associateGuideTopics,
  getAssociateGuideTopics,
  inferAssociateGuideProfile,
  searchAssociateGuideTopics,
} from "../src/components/guidance/associateGuideContent.ts";
import { getDashboardRoute } from "../src/utils/dashboardAccess.ts";

test("associate guide infers the intended capability profile", () => {
  assert.equal(inferAssociateGuideProfile(["buyer"], []), "buyer");
  assert.equal(inferAssociateGuideProfile(["seller"], []), "seller");
  assert.equal(inferAssociateGuideProfile(["buyer", "seller"], []), "both");
  assert.equal(inferAssociateGuideProfile(["warehouse-storage"], []), "service");
  assert.equal(inferAssociateGuideProfile([], []), "incomplete");
});

test("capability filtering keeps shared content and removes unrelated workflows", () => {
  const buyer = getAssociateGuideTopics("buyer");
  const seller = getAssociateGuideTopics("seller");
  const both = getAssociateGuideTopics("both");
  const incomplete = getAssociateGuideTopics("incomplete");

  assert.ok(buyer.some((topic) => topic.id === "raise-enquiry"));
  assert.ok(!buyer.some((topic) => topic.id === "publish-listing"));
  assert.ok(seller.some((topic) => topic.id === "publish-listing"));
  assert.ok(!seller.some((topic) => topic.id === "raise-enquiry"));
  assert.ok(both.some((topic) => topic.id === "publish-listing"));
  assert.ok(both.some((topic) => topic.id === "raise-enquiry"));
  assert.ok(incomplete.every((topic) => topic.audience.includes("all")));
});

test("search covers page names, routes, steps, and troubleshooting", () => {
  assert.ok(searchAssociateGuideTopics(associateGuideTopics, "Document Studio").some((topic) => topic.id === "commercial-documents-reference"));
  assert.ok(searchAssociateGuideTopics(associateGuideTopics, "Create trade listing").some((topic) => topic.id === "publish-listing"));
  assert.ok(searchAssociateGuideTopics(associateGuideTopics, "locked company data").some((topic) => topic.id === "company-reference"));
  assert.equal(searchAssociateGuideTopics(associateGuideTopics, "not-a-real-guide-term").length, 0);
});

test("complete journey and reference categories are represented", () => {
  assert.deepEqual(associateGuideCategories.map((category) => category.id), ["start", "journey", "reference"]);
  for (const category of associateGuideCategories) {
    assert.ok(associateGuideTopics.some((topic) => topic.category === category.id), `${category.id} needs topics`);
  }
  for (const id of ["account-and-onboarding", "discover-opportunity", "publish-listing", "raise-enquiry", "respond-enquiry", "handle-sample", "progress-order", "manage-documents", "use-supporting-services"]) {
    assert.ok(associateGuideTopics.some((topic) => topic.id === id), `${id} is required`);
  }
});

test("guide routes and related topic links resolve", () => {
  const ids = new Set(associateGuideTopics.map((topic) => topic.id));
  for (const topic of associateGuideTopics) {
    if (topic.route) assert.ok(getDashboardRoute(topic.route), `${topic.id} references unknown route ${topic.route}`);
    for (const related of topic.related) assert.ok(ids.has(related), `${topic.id} references unknown topic ${related}`);
  }
});

test("annotated images exist and guide UI exposes accessible navigation contracts", () => {
  for (const topic of associateGuideTopics.filter((candidate) => candidate.screenshot)) {
    assert.ok(fs.existsSync(`public${topic.screenshot.src}`), `${topic.screenshot.src} must exist`);
    assert.ok(topic.screenshot.alt.length > 20);
  }
  const component = fs.readFileSync("src/components/guidance/AssociateGuidebook.tsx", "utf8");
  assert.match(component, /aria-label="Search the Associate Guidebook"/);
  assert.match(component, /aria-expanded=/);
  assert.match(component, /motion-reduce:transition-none/);
  assert.match(component, /window\.location\.hash/);
  assert.match(component, /Contact support/);
});

test("operator guidance remains available from the shared guidance component", () => {
  const component = fs.readFileSync("src/components/guidance/GuidanceContent.tsx", "utf8");
  assert.match(component, /if \(!isOperator\)/);
  assert.match(component, /operatorFeatureSections/);
  assert.match(component, /operatorDailyFlow/);
});
