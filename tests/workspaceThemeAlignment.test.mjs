import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (relative) => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8");

test("Buying Requests uses brand styling for identity and ordinary actions", () => {
  const page = read("../src/app/dashboard/bidding/page.tsx");
  assert.match(page, /border-obaol-400\/30/);
  assert.match(page, /<AppButton[\s\S]*intent="primary"[\s\S]*Create buying request/);
  assert.match(page, /color=\{status === item \? "primary" : "default"\}/);
  assert.doesNotMatch(page, /color="warning"/);
});

test("Quality Labs uses brand identity while preserving semantic success", () => {
  const page = read("../src/app/dashboard/quality-labs/page.tsx");
  const map = read("../src/components/Labs/QualityLabsMap.tsx");
  assert.match(page, /eyebrowTone="brand"/);
  assert.match(page, /Manage My Lab<\/AppButton>/);
  assert.match(page, /viewMode === "map" \? "primary" : "default"/);
  assert.doesNotMatch(page, /eyebrowTone="success"/);
  assert.match(page, /Structured/);
  assert.match(page, /color="success"[\s\S]*WhatsApp/);
  assert.match(map, /mapTheme\.flame/);
  assert.doesNotMatch(map, /#22c55e|#0b1220|#e2e8f0/);
});

test("Warehouse Directory and map chrome use palette-based controls and markers", () => {
  const page = read("../src/app/dashboard/warehouse-rent/page.tsx");
  const map = read("../src/components/Warehouse/WarehouseRentMap.tsx");
  const picker = read("../src/components/Warehouse/WarehouseLocationPicker.tsx");
  assert.match(page, /dashboard-segmented-control/);
  assert.match(page, /color=\{isSelected \? "primary" : "default"\}/);
  assert.match(page, /app-button--primary[\s\S]*Search/);
  assert.doesNotMatch(page, /color="warning"|text-orange|bg-orange|border-orange/);
  assert.match(map, /warehouseMarkerColors/);
  assert.match(map, /themed-leaflet-map/);
  assert.doesNotMatch(map, /#f59e0b|#06b6d4|#8b5cf6|#22c55e|#e2e8f0/);
  assert.match(picker, /mapTheme\.flame/);
});

test("shared map chrome defines light and dark palette surfaces", () => {
  const css = read("../src/app/globals.css");
  assert.match(css, /\.themed-leaflet-map\s*\{[\s\S]*--map-popup: #fbf8f2/);
  assert.match(css, /\.dark \.themed-leaflet-map\s*\{[\s\S]*--map-popup: #22303d/);
  assert.match(css, /\.themed-leaflet-map \.leaflet-bar a/);
  assert.match(css, /\.themed-map-popup/);
});
