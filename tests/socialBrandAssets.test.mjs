import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const file = (path) => new URL(`../${path}`, import.meta.url);
const imagePath = (path) => fileURLToPath(file(path));
const read = (path) => readFileSync(file(path), "utf8");

test("social preview is an opaque 1200x630 branded image", async () => {
  const image = sharp(imagePath("public/social/obaol-share-v2.png"));
  const metadata = await image.metadata();
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
  assert.equal(metadata.hasAlpha, false);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const pixel = (x, y) => Array.from(data.subarray((y * info.width + x) * info.channels, (y * info.width + x) * info.channels + 3));
  assert.deepEqual(pixel(0, 0), [27, 38, 50]);
  assert.notDeepEqual(pixel(600, 315), [27, 38, 50]);
});

test("favicon and install icons are square opaque emblem assets", async () => {
  for (const size of [16, 32, 48, 180, 192, 512]) {
    const metadata = await sharp(imagePath(`public/icons/obaol-icon-v2-${size}.png`)).metadata();
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    assert.equal(metadata.hasAlpha, false);
  }
  for (const size of [192, 512]) {
    const metadata = await sharp(imagePath(`public/icons/obaol-icon-maskable-v2-${size}.png`)).metadata();
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    assert.equal(metadata.hasAlpha, false);
  }
});

test("metadata, hard-coded heads, manifest and service worker use versioned assets", () => {
  const seo = read("src/utils/seo.ts");
  const layout = read("src/app/layout.tsx");
  const manifest = read("src/app/manifest.ts");
  const companies = read("src/app/companies/head.tsx");
  const directory = read("src/app/obaol/head.tsx");
  const serviceWorker = read("public/sw.js");
  assert.match(seo, /\/social\/obaol-share-v2\.png/);
  assert.match(layout, /\/social\/obaol-share-v2\.png/);
  assert.doesNotMatch(layout, /icons:[\s\S]{0,120}\/logo\.png/);
  assert.match(companies, /\/social\/obaol-share-v2\.png/);
  assert.match(directory, /\/social\/obaol-share-v2\.png/);
  assert.match(manifest, /obaol-icon-v2-192\.png/);
  assert.match(manifest, /obaol-icon-maskable-v2-512\.png/);
  assert.match(serviceWorker, /obaol-icon-v2-512\.png/);
});
