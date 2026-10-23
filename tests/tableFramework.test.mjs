import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { generateColumns } from "../src/features/table-framework/generateColumns.ts";

const entityNames = [
  "activity", "activityStatus", "activityType", "admin", "associate", "associateCompany",
  "catalogItem", "category", "certification", "commissionRule", "companyBusinessModel",
  "companyFunction", "companyStage", "companySubFunction", "companyType", "designation",
  "displayedRate", "enquiry", "enquiryProcessStatus", "generalIntent", "incoterm", "inventories",
  "inventoryManager", "jobRole", "jobType", "language", "operator", "paymentTerm", "product",
  "productVariant", "projects", "projectStatus", "projectType", "researchedCompany", "statusHistory",
  "subCategory", "subIntent", "timeSheet", "variantRate", "warehouse", "worker",
];

test("entity schema sources preserve the reviewed registry snapshot", () => {
  const directory = path.resolve("src/features/table-framework/schemas/entities");
  const files = fs.readdirSync(directory).filter((name) => name.endsWith(".ts")).sort();
  assert.deepEqual(files, entityNames.map((name) => `${name}.ts`).sort());
  const snapshot = files.map((name) => `${name}\n${fs.readFileSync(path.join(directory, name), "utf8")}`).join("\n");
  assert.equal(crypto.createHash("sha256").update(snapshot).digest("hex"), "f32be6f9fea2cb6fa14f0fe99f18f08c3ae716ce18c208fadefd0d9b655bfcae");
  for (const file of files) {
    const source = fs.readFileSync(path.join(directory, file), "utf8");
    assert.match(source, /satisfies TableSchema;/, `${file} must retain typed schema validation`);
  }
});

test("compatibility facade retains the three public runtime exports", () => {
  const source = fs.readFileSync("src/utils/tableValues.tsx", "utf8");
  assert.match(source, /export \{ generateColumns \}/);
  assert.match(source, /export \{ apiRoutesByRole \}/);
  assert.match(source, /export \{ initialTableConfig \}/);
});

const field = (key, type = "text", extra = {}) => ({
  label: key, key, type, inForm: true, inTable: true, ...extra,
});

test("column generation preserves role visibility and action placement", () => {
  const registry = {
    catalogItem: [field("commission"), field("finalRate"), field("actions2", "action")],
    variantRate: [field("rate"), field("actions2", "action")],
  };
  assert.deepEqual(generateColumns("catalogItem", registry, "Associate").map((column) => column.uid), [
    "commission", "product", "classification", "actions2",
  ]);
  assert.deepEqual(generateColumns("variantRate", registry, "Admin").map((column) => column.uid), [
    "rate", "associate", "productVariant", "classification", "actions2",
  ]);
});

test("column generation preserves user timestamps and derived domain columns", () => {
  const registry = {
    associate: [field("createdAt"), field("name"), field("lastLoginAt"), field("lastSeenAt")],
    inventories: [field("quantity")],
    projects: [field("name")],
    activity: [field("name")],
  };
  assert.deepEqual(generateColumns("associate", registry).map((column) => column.uid), [
    "name", "designation", "associateCompany", "lastSeenAt", "lastLoginAt", "createdAt",
  ]);
  assert.deepEqual(generateColumns("inventories", registry, "Admin").map((column) => column.uid), [
    "quantity", "product", "productVariant", "associate",
  ]);
  assert.deepEqual(generateColumns("projects", registry).slice(-4).map((column) => column.uid), [
    "projectManagerName", "projectStatus", "projectType", "location",
  ]);
  assert.deepEqual(generateColumns("activity", registry).slice(-3).map((column) => column.uid), [
    "activityManagerName", "activityStatus", "activityType",
  ]);
});

test("route registry retains every schema-backed endpoint key", () => {
  const source = fs.readFileSync("src/features/table-framework/routes.ts", "utf8");
  for (const entity of entityNames.filter((name) => name !== "statusHistory")) {
    assert.match(source, new RegExp(`\\b${entity}:`), `missing route mapping for ${entity}`);
  }
});

test("generic CRUD option loaders expose normalized recovery behavior", () => {
  const filterSource = fs.readFileSync("src/components/CurdTable/dynamic-filtering.tsx", "utf8");
  const addSource = fs.readFileSync("src/components/CurdTable/add-form.tsx", "utf8");
  const editSource = fs.readFileSync("src/components/CurdTable/edit-model.tsx", "utf8");
  assert.match(filterSource, /normalizeApiError/);
  assert.match(filterSource, />\s*Retry\s*</);
  assert.match(filterSource, /role="alert"/);
  assert.match(addSource, /Promise\.allSettled/);
  assert.match(editSource, /Promise\.allSettled/);
  assert.doesNotMatch(`${filterSource}\n${addSource}\n${editSource}`, /console\.error/);
});
