import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  formatImportReservationDate,
  getImportReservationPresentation,
} from "../src/utils/importReservationPresentation.ts";

test("reservation lifecycle states use clear customer-facing language", () => {
  assert.deepEqual(getImportReservationPresentation("PENDING"), {
    label: "Pending review",
    description: "The importer is reviewing your reservation request. You can still edit or cancel it.",
    tone: "warning",
  });
  assert.equal(getImportReservationPresentation("APPROVED").label, "Approved");
  assert.equal(getImportReservationPresentation("LOCKED").label, "Enquiry created");
  assert.equal(getImportReservationPresentation("REJECTED").label, "Not approved");
  assert.equal(getImportReservationPresentation("CANCELLED").label, "Cancelled");
});

test("reservation presentation handles legacy and missing values safely", () => {
  assert.equal(getImportReservationPresentation("ACCEPTED").label, "Approved");
  assert.equal(getImportReservationPresentation(undefined).label, "Pending review");
  assert.equal(getImportReservationPresentation("UNKNOWN").label, "Pending review");
  assert.equal(formatImportReservationDate(undefined), "Not available");
  assert.equal(formatImportReservationDate("not-a-date"), "Not available");
  assert.match(formatImportReservationDate("2026-04-24T00:00:00.000Z"), /24 Apr 2026/);
});

test("import reservation workspace exposes lifecycle actions and an opportunity empty state", () => {
  const source = readFileSync("src/app/dashboard/imports/page.tsx", "utf8");
  assert.match(source, /status === "PENDING"/);
  assert.match(source, /status === "APPROVED" \|\| status === "ACCEPTED"/);
  assert.match(source, /status === "LOCKED"/);
  assert.match(source, /Lock reservation & create enquiry/);
  assert.match(source, /No import reservations yet/);
  assert.match(source, /href="\/dashboard\/imports"/);
  assert.match(source, /Reserved Quantity/);
  assert.match(source, /Expected Arrival/);
  assert.match(source, /Requested On/);
});
