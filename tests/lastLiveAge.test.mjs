import assert from "node:assert/strict";
import test from "node:test";

import { formatLastLiveAge } from "../src/utils/lastLiveAge.ts";

const now = new Date(2026, 9, 16, 23, 30);

test("formats last-live age using calendar days", () => {
  assert.equal(formatLastLiveAge(new Date(2026, 9, 16, 0, 1), now), "Today");
  assert.equal(
    formatLastLiveAge(new Date(2026, 9, 15, 23, 59), now),
    "Yesterday",
  );
  assert.equal(
    formatLastLiveAge(new Date(2026, 9, 13, 12, 0), now),
    "3 days ago",
  );
});

test("handles absent, invalid, and future last-live timestamps", () => {
  assert.equal(formatLastLiveAge(null, now), "");
  assert.equal(formatLastLiveAge("not-a-date", now), "");
  assert.equal(formatLastLiveAge(new Date(2026, 9, 17), now), "Today");
});
