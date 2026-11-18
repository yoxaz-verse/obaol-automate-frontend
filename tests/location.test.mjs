import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { isValidCoordinate, toStructuredLocation } from "../src/types/location.ts";

test("validates geographic coordinate ranges", () => {
  assert.equal(isValidCoordinate(9.98, 76.28), true);
  assert.equal(isValidCoordinate(-91, 76.28), false);
  assert.equal(isValidCoordinate(9.98, 181), false);
  assert.equal(isValidCoordinate("not-a-number", 76.28), false);
  assert.equal(isValidCoordinate(null, null), false);
  assert.equal(isValidCoordinate("", ""), false);
  assert.equal(isValidCoordinate(0, 0), false);
});

test("normalizes a partial saved location", () => {
  assert.deepEqual(toStructuredLocation({ latitude: "9.98", longitude: "76.28", label: "Kochi" }), {
    latitude: 9.98,
    longitude: 76.28,
    label: "Kochi",
    address: "Kochi",
    city: "",
    district: "",
    state: "",
    country: "",
    countryCode: "",
    postalCode: "",
  });
});

test("rejects incomplete saved locations", () => {
  assert.equal(toStructuredLocation({ latitude: 9.98 }), null);
  assert.equal(toStructuredLocation({ latitude: null, longitude: null }), null);
  assert.equal(toStructuredLocation({ latitude: 0, longitude: 0, label: "Selected location" }), null);
  assert.equal(toStructuredLocation(null), null);
});

test("multi-location selector supports caller-defined slots on one map", async () => {
  const source = await readFile(new URL("../src/components/location/MultiLocationSelector.tsx", import.meta.url), "utf8");
  assert.match(source, /slots: LocationSlot\[\]/);
  assert.match(source, /slots\.map/);
  assert.match(source, /fitBounds/);
  assert.match(source, /activeId/);
  assert.equal((source.match(/<MapContainer/g) || []).length, 1);
});

test("shared location selector exposes search, address, and map loading feedback", async () => {
  const source = await readFile(new URL("../src/components/location/LocationSelector.tsx", import.meta.url), "utf8");
  assert.match(source, /setIsSearching\(true\)/);
  assert.match(source, /Searching locations…/);
  assert.match(source, /Finding address…/);
  assert.match(source, /Loading map…/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /No matching locations found\./);
  assert.match(source, /loading: \(\) =>/);
  assert.match(source, /tileerror: \(\) =>/);
  assert.match(source, /fetch\(url, \{ signal \}\)/);
});

test("manual trips submit structured origin and destination route points", async () => {
  const source = await readFile(new URL("../src/app/dashboard/inland-transportation/trips/page.tsx", import.meta.url), "utf8");
  assert.match(source, /MultiLocationSelector/);
  assert.match(source, /routePoints:/);
  assert.match(source, /"ORIGIN"/);
  assert.match(source, /"DESTINATION"/);
});
