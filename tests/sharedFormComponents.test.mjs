import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("shared image picker provides preset cropping and optimized output", () => {
  const picker = read("src/components/ui/ImagePicker.tsx");
  const cropper = read("src/components/ui/ImageCropDialog.tsx");
  const presets = read("src/components/ui/imagePresets.ts");
  assert.match(picker, /onDrop=/);
  assert.match(cropper, /Horizontal position/);
  assert.match(cropper, /Rotate 90°/);
  assert.match(cropper, /toBlob/);
  for (const preset of ["avatar", "logo", "banner", "product", "signature"]) assert.match(presets, new RegExp(`${preset}:`));
});

test("schema-driven forms use shared searchable and upload controls", () => {
  for (const path of ["src/components/CurdTable/add-form.tsx", "src/components/CurdTable/edit-model.tsx"]) {
    const source = read(path);
    assert.match(source, /SearchableSelect/);
    assert.match(source, /ImagePicker/);
    assert.match(source, /FileDropzone/);
  }
});

test("location controls support current position, clearing, and detail previews", () => {
  const selector = read("src/components/location/LocationSelector.tsx");
  const preview = read("src/components/location/LocationPreviewMap.tsx");
  assert.match(selector, /navigator\.geolocation/);
  assert.match(selector, /Clear pin/);
  assert.match(preview, /View on map/);
});

test("file inputs are centralized in the shared upload primitives", async () => {
  const { execFileSync } = await import("node:child_process");
  const output = execFileSync("rg", ["-l", "type=\"file\"", "src", "-g", "*.tsx", "-g", "*.ts"], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
  const files = output.trim().split("\n").sort();
  assert.deepEqual(files, ["src/components/ui/FileDropzone.tsx", "src/components/ui/ImagePicker.tsx"]);
});

test("phase two primitives expose validation, progress, async options, and touch cropping", () => {
  const files = read("src/components/ui/FileDropzone.tsx");
  const select = read("src/components/ui/SearchableSelect.tsx");
  const cropper = read("src/components/ui/ImageCropDialog.tsx");
  assert.match(files, /uploadProgress/);
  assert.match(files, /matchesAccept/);
  assert.match(select, /onSearch/);
  assert.match(select, /Loading options/);
  assert.match(select, /aria-activedescendant/);
  assert.match(select, /maxVisibleOptions/);
  assert.match(cropper, /onPointerMove/);
  assert.match(cropper, /Discard the image adjustments/);
});

test("phase two workflows use shared upload and selection controls", () => {
  assert.match(read("src/app/dashboard/inland-transportation/trips/[id]/page.tsx"), /AppCombobox[\s\S]*FileDropzone/);
  assert.match(read("src/app/dashboard/settings/signature-management/page.tsx"), /ImagePicker/);
  assert.match(read("src/app/dashboard/orders/[id]/page.tsx"), /FileDropzone/);
  assert.match(read("src/app/dashboard/catalog/import/page.tsx"), /FileDropzone/);
});

test("public and developer selectors use the shared combobox", () => {
  assert.match(read("src/app/export-resources/page.tsx"), /AppCombobox/);
  const keys = read("src/app/developer/keys/page.tsx");
  assert.match(keys, /AppCombobox/);
  assert.doesNotMatch(keys, /<select/);
});

test("native select compatibility is explicit and cannot expand", async () => {
  const { execFileSync } = await import("node:child_process");
  const root = new URL("..", import.meta.url);
  const output = execFileSync("rg", ["-l", "<select", "src", "-g", "*.tsx", "-g", "*.ts"], { cwd: root, encoding: "utf8" });
  const actual = output.trim().split("\n").sort();
  const allowed = [
    "src/app/dashboard/documentation/[id]/page.tsx",
    "src/app/dashboard/freight-forwarding/customs/page.tsx",
    "src/app/dashboard/freight-forwarding/finance/page.tsx",
    "src/app/dashboard/freight-forwarding/shipments/new/page.tsx",
    "src/app/dashboard/operator/hierarchy/page.tsx",
    "src/app/dashboard/operator/team/page.tsx",
    "src/app/dashboard/packaging/execution/page.tsx",
    "src/app/dashboard/shortcuts/page.tsx",
    "src/components/dashboard/Catalog/currency-selector.tsx",
    "src/components/dashboard/Documentation/DocumentCreator.tsx",
    "src/components/dashboard/Documentation/DocumentationUI.tsx",
    "src/components/dashboard/LanguageSwitcher.tsx",
    "src/components/packaging/PackagingUnitEditor.tsx",
    "src/features/catalog/rates/enquiry/EnquiryFields.tsx",
  ].sort();
  assert.deepEqual(actual, allowed);
});

test("public detail locations support coordinates and address-only fallback", () => {
  const preview = read("src/components/location/LocationPreviewMap.tsx");
  assert.match(preview, /Search on map/);
  assert.match(read("src/app/company/[id]/page.tsx"), /LocationPreviewMap/);
  assert.match(read("src/app/labs/[id]/page.tsx"), /LocationPreviewMap/);
});
