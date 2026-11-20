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
