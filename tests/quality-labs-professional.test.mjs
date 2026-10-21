import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { whatsappHref } from "../src/types/labProfile.ts";

const directoryPath = new URL("../src/app/dashboard/quality-labs/page.tsx", import.meta.url);
const wizardPath = new URL("../src/app/dashboard/quality-labs/location/page.tsx", import.meta.url);
const searchablePath = new URL("../src/components/ui/SearchableSelect.tsx", import.meta.url);
const mapPath = new URL("../src/components/Labs/QualityLabsMap.tsx", import.meta.url);
const myLabsPath = new URL("../src/app/dashboard/quality-labs/my/page.tsx", import.meta.url);
const contactPath = new URL("../src/utils/labContact.ts", import.meta.url);
const detailPath = new URL("../src/app/dashboard/quality-labs/[id]/page.tsx", import.meta.url);
const approvalPath = new URL("../src/components/dashboard/Approvals/LabApprovalQueues.tsx", import.meta.url);

test("lab directory toggles between map and card views with distinct empty states", async () => {
  const source = await readFile(directoryPath, "utf8");
  assert.match(source, /payload\.markers/);
  assert.match(source, /useState<"map" \| "cards">\("map"\)/);
  assert.match(source, />Map view<\/Button>/);
  assert.match(source, />Card view<\/Button>/);
  assert.match(source, /aria-pressed=\{viewMode === "map"\}/);
  assert.match(source, /aria-pressed=\{viewMode === "cards"\}/);
  assert.match(source, /viewMode === "map" \? <>/);
  assert.match(source, /<QualityLabsMap/);
  assert.match(source, /labs\.map/);
  assert.match(source, /viewMode === "cards" \? "success" : "default"/);
  assert.match(source, /No labs match these filters/);
  assert.match(source, /No published labs are available yet/);
  assert.match(source, /Map location not supplied/);
});

test("lab controls are searchable, multi-selectable and accessible", async () => {
  const source = await readFile(searchablePath, "utf8");
  assert.match(source, /Search options/);
  assert.match(source, /Select all/);
  assert.match(source, /role="listbox"/);
  assert.match(source, /aria-multiselectable/);
  assert.match(source, /aria-label=\{label\}/);
  assert.match(source, /getBoundingClientRect\(\)\.width/);
  assert.match(source, /width: menuWidth/);
  const selectedChips = source.indexOf("{multiple && selected.length ? (");
  const selectTrigger = source.indexOf("<Popover");
  assert.notEqual(selectedChips, -1);
  assert.notEqual(selectTrigger, -1);
  assert.equal(selectedChips < selectTrigger, true, "selected chips should render above the select field");
});

test("wizard uses searchable fields and direct taxonomy creation", async () => {
  const source = await readFile(wizardPath, "utf8");
  assert.match(source, /SearchableSelect label="Physical country"/);
  assert.match(source, /SearchableSelect label="Target countries"/);
  assert.match(source, /Add \{requestModal\.kind\.toLowerCase\(\)\}/);
  assert.match(source, /Add and select/);
  assert.match(source, /Country product coverage/);
  assert.doesNotMatch(source, /Request missing option/);
  assert.doesNotMatch(source, /window\.prompt/);
  assert.match(source, /sticky bottom-3/);
  assert.match(source, /WhatsApp number is the same as primary phone/);
  assert.match(source, /Skip optional step/);
  assert.match(source, /autoFocus/);
  assert.match(source, /Manage products/);
  assert.match(source, /Copy setup/);
  assert.match(source, /Products to remove/);
  assert.match(source, /Existing products in those countries will be kept/);
  assert.match(source, /No country coverage added yet/);
  assert.match(source, /No matching country coverage/);
  assert.doesNotMatch(source, /Manage assignments/);
  assert.doesNotMatch(source, /Countries to manage/);
  assert.doesNotMatch(source, /Configured source country/);
  assert.doesNotMatch(source, /<Accordion/);
  assert.match(source, /Exact laboratory location/);
  assert.match(source, /Find address on map/);
  assert.match(source, /Use current location/);
  assert.match(source, /locationConfirmed/);
  assert.match(source, /Select the laboratory’s exact location on the map before continuing/);
  assert.match(source, /location: locationConfirmed \? profile\.location : undefined/);
});

test("admin selects a company before viewing or changing its shared lab panel", async () => {
  const source = await readFile(wizardPath, "utf8");
  assert.match(source, /SearchableSelect label="Associate company to manage"/);
  assert.match(source, /Select an associate company/);
  assert.match(source, /draftQuery\.data\?\.draft \|\| draftQuery\.data\?\.published/);
  assert.match(source, /resetWizard\(\); setCompanyId/);
  assert.match(source, /Select an associate company before saving/);
  assert.match(source, /Select an associate company before submitting/);
  assert.match(source, /isDisabled=\{isAdmin && !companyId\}/);
  assert.match(source, /Loading the lab profile/);
  assert.match(source, /Unable to load the lab profile/);
});

test("lab contacts expose safe explicit WhatsApp actions", async () => {
  const [directory, map] = await Promise.all([readFile(directoryPath, "utf8"), readFile(mapPath, "utf8")]);
  assert.equal(whatsappHref("+91 98765-43210"), "https://wa.me/919876543210");
  assert.equal(whatsappHref("not-a-number"), undefined);
  assert.equal(whatsappHref("123"), undefined);
  assert.match(directory, />Call<\/Button>.*>WhatsApp<\/Button>.*>Email<\/Button>/s);
  assert.match(map, /aria-label="Call lab"/);
  assert.match(map, /aria-label="Chat on WhatsApp"/);
  assert.match(map, /aria-label="Email lab"/);
});

test("lab map fits all markers when no search point is active", async () => {
  const source = await readFile(mapPath, "utf8");
  assert.match(source, /function FitLabBounds/);
  assert.match(source, /map\.fitBounds/);
  assert.match(source, /Requires mapping/);
});

test("My Lab lists multiple profiles and only exposes aggregate contact counts", async () => {
  const source = await readFile(myLabsPath, "utf8");
  assert.match(source, /apiRoutes\.labProfiles\.mine/);
  assert.match(source, />Add Laboratory<\/Button>/);
  assert.match(source, /mineArchive/);
  assert.match(source, /mineRestore/);
  assert.match(source, /rows\.map/);
  assert.match(source, /metrics\.PHONE/);
  assert.match(source, /metrics\.WHATSAPP/);
  assert.match(source, /metrics\.EMAIL/);
  assert.doesNotMatch(source, /viewerEmail|viewerPhone|viewerName/);
});

test("all public lab contact surfaces record a non-blocking aggregate event", async () => {
  const [directory, map, contact] = await Promise.all([readFile(directoryPath, "utf8"), readFile(mapPath, "utf8"), readFile(contactPath, "utf8")]);
  assert.match(directory, /trackLabContact\(lab\._id, "PHONE"\)/);
  assert.match(directory, /trackLabContact\(lab\._id, "WHATSAPP"\)/);
  assert.match(directory, /trackLabContact\(lab\._id, "EMAIL"\)/);
  assert.match(map, /trackLabContact\(lab\._id, "PHONE"\)/);
  assert.match(contact, /\.catch\(\(\) => undefined\)/);
});

test("published lab profiles hand off to the existing testing enquiry workflow", async () => {
  const source = await readFile(detailPath, "utf8");
  assert.match(source, /Start testing enquiry/);
  assert.match(source, /serviceType=QUALITY_TESTING/);
  assert.match(source, /providerCompanyId=/);
  assert.match(source, /labProfileId=/);
});

test("lab publication failures remain visible on the affected approval card", async () => {
  const source = await readFile(approvalPath, "utf8");
  assert.match(source, /reviewErrors/);
  assert.match(source, /role="alert"/);
  assert.match(source, /Unable to complete this review/);
  assert.match(source, /Profile published\./);
  assert.match(source, /Profile rejected\./);
  assert.match(source, /review\.variables\?\.id === lab\._id/);
});
